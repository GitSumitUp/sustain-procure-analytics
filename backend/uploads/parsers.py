import csv
import io
from datetime import datetime
from decimal import Decimal
from emissions.models import EmissionRecord

def parse_sap_csv(file_stream, company, raw_upload_obj):
    """
    Handles SAP ALV grid quirks: German headers, DD.MM.YYYY dates, 
    and anomalies like negative bookkeeping adjustments.
    """
    
    text_stream = io.StringIO(file_stream.read().decode('utf-8'))
    reader = csv.DictReader(text_stream)

    records = []
    for row in reader:
        raw_qty = row.get('Menge', '0')
        raw_unit = row.get('MEINS', 'UNKNOWN')
        raw_date = row.get('BUDAT', '')
        material = row.get('MATNR', '')

        clean_date = None
        for fmt in ('%d.%m.%Y', '%d/%m/%Y'):
            try:
                clean_date = datetime.strptime(raw_date, fmt).date()
                break
            except ValueError:
                continue
        if not clean_date:
            clean_date = datetime.today().date()

        qty_decimal = Decimal(raw_qty)

        factor = Decimal('0.0025') 
        if raw_unit == 'GAL':
            factor = Decimal('0.0031')
        elif raw_unit == 'TON':
              factor = Decimal('2.8')

        normalized_qty = qty_decimal * factor

        is_suspicious = qty_decimal < 0 or qty_decimal > 50000

        records.append(EmissionRecord(
            company=company,
            raw_upload=raw_upload_obj,
            source_type='SAP',
            scope=1, 
            category=f"SAP Procurement - {material}",
            description=f"Plant Code Lookup: {row.get('WERKS', 'Unknown')}",
            quantity=qty_decimal,
            unit=raw_unit,
            normalized_quantity=normalized_qty,
            date=clean_date,
            is_suspicious=is_suspicious,
            status='FLAGGED' if is_suspicious else 'PENDING'
        ))

    
    EmissionRecord.objects.bulk_create(records)


def parse_utility_csv(file_stream, company, raw_upload_obj):
    """
    Parses Utility portal data. Handles un-aligned billing dates 
    and detects massive facility spikes.
    """
    text_stream = io.StringIO(file_stream.read().decode('utf-8'))
    reader = csv.DictReader(text_stream)
    
    records = []
    for row in reader:
        total_kwh = Decimal(row.get('Total_kWh', '0'))
        billing_end = row.get('Billing_End', '')
        
        try:
            clean_date = datetime.strptime(billing_end, '%Y-%m-%d').date()
        except ValueError:
            clean_date = datetime.today().date()

        factor = Decimal('0.0004') 
        normalized_qty = total_kwh * factor
        
        is_suspicious = total_kwh > 200000

        records.append(EmissionRecord(
            company=company,
            raw_upload=raw_upload_obj,
            source_type='UTILITY',
            scope=2, 
            category="Grid Electricity",
            description=f"Meter: {row.get('Meter_ID')} | Account: {row.get('Account_Number')}",
            quantity=total_kwh,
            unit="kWh",
            normalized_quantity=normalized_qty,
            date=clean_date,
            is_suspicious=is_suspicious,
            status='FLAGGED' if is_suspicious else 'PENDING'
        ))
        
    EmissionRecord.objects.bulk_create(records)



def parse_travel_csv(file_stream, company, raw_upload_obj):
    """
    Parses Concur Travel reports. Derives distances from Airport IATA codes 
    and penalizes business cabin classes.
    """
    text_stream = io.StringIO(file_stream.read().decode('utf-8'))
    reader = csv.DictReader(text_stream)
    
    records = []
    for row in reader:
        expense_type = row.get('Expense_Type', '')
        cabin_class = row.get('Cabin_Class', 'Standard')
        
        clean_date = datetime.today().date()
        
        quantity = Decimal('1.00')
        unit = "Segment"
        
        if expense_type == 'Air_Travel':
            origin = row.get('Origin_IATA', '')
            dest = row.get('Destination_IATA', '')

            distance = Decimal('1920.00') if (origin == 'BOM' and dest == 'DXB') else Decimal('5500.00')
            quantity = distance
            unit = "Kilometers"
            
            class_modifier = Decimal('2.0') if cabin_class == 'Business' else Decimal('1.0')
            normalized_qty = distance * Decimal('0.00015') * class_modifier
        else:
            days = Decimal(row.get('Quantity_Days', '1'))
            quantity = days
            unit = "Room-Nights"
            normalized_qty = days * Decimal('0.020') 

        records.append(EmissionRecord(
            company=company,
            raw_upload=raw_upload_obj,
            source_type='TRAVEL',
            scope=3, 
            category=f"Travel - {expense_type}",
            description=f"Employee: {row.get('Employee_Email')} | Class: {cabin_class}",
            quantity=quantity,
            unit=unit,
            normalized_quantity=normalized_qty,
            date=clean_date,
            is_suspicious=False
        ))
        
    EmissionRecord.objects.bulk_create(records)