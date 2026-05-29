import csv
import io
from decimal import Decimal
from datetime import datetime
from django.core.management.base import BaseCommand
from emissions.models import EmissionRecord
from uploads.models import RawUpload, Company  # Import Company too


class Command(BaseCommand):
    help = 'Import the three sample CSV files into the database'

    def handle(self, *args, **options):
        # Get or create a default company (change name if needed)
        company, _ = Company.objects.get_or_create(
            name="Test Company",
            defaults={"industry": "Manufacturing"}
        )

        self.stdout.write(f"Using Company: {company.name}")

        # Import SAP
        self.import_sap(company)
        # Import Utility
        self.import_utility(company)
        # Import Travel
        self.import_travel(company)

        self.stdout.write(self.style.SUCCESS('✅ All sample data imported successfully!'))

    def import_sap(self, company):
        with open('/home/workdir/attachments/sap_procurement.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                try:
                    records.append(EmissionRecord(
                        company=company,
                        source_type='SAP',
                        scope=1,
                        category="Fuel Procurement",
                        description=f"Plant: {row['WERKS']} | Material: {row['MATNR']}",
                        quantity=Decimal(row['Menge']),
                        unit=row['MEINS'],
                        normalized_quantity=Decimal(row['Menge']) * Decimal('0.0025'),  # example factor
                        normalized_unit="MTCO2e",
                        date=datetime.strptime(row['BUDAT'], '%d.%m.%Y').date() if '.' in row['BUDAT'] else datetime.today().date(),
                        is_suspicious=float(row['Menge']) < 0,
                        status='FLAGGED' if float(row['Menge']) < 0 else 'PENDING'
                    ))
                except:
                    continue
            EmissionRecord.objects.bulk_create(records)
            self.stdout.write(f"Imported {len(records)} SAP records")

    def import_utility(self, company):
        # Reuse your parser logic style
        with open('/home/workdir/attachments/utility_electricity.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                total_kwh = Decimal(row.get('Total_kWh', 0))
                records.append(EmissionRecord(
                    company=company,
                    source_type='UTILITY',
                    scope=2,
                    category="Grid Electricity",
                    description=f"Meter: {row.get('Meter_ID')} | Account: {row.get('Account_Number')}",
                    quantity=total_kwh,
                    unit="kWh",
                    normalized_quantity=total_kwh * Decimal('0.0004'),
                    normalized_unit="MTCO2e",
                    date=datetime.strptime(row.get('Billing_End', '2026-05-11'), '%Y-%m-%d').date(),
                    is_suspicious=total_kwh > 200000,
                    status='FLAGGED' if total_kwh > 200000 else 'PENDING'
                ))
            EmissionRecord.objects.bulk_create(records)
            self.stdout.write(f"Imported {len(records)} Utility records")

    def import_travel(self, company):
        with open('/home/workdir/attachments/corporate_travel.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            records = []
            for row in reader:
                expense_type = row.get('Expense_Type', '')
                if expense_type == 'Air_Travel':
                    quantity = Decimal('5500')
                    unit = "Kilometers"
                    normalized = quantity * Decimal('0.00015')
                else:
                    quantity = Decimal(row.get('Quantity_Days', 1))
                    unit = "Room-Nights"
                    normalized = quantity * Decimal('0.020')

                records.append(EmissionRecord(
                    company=company,
                    source_type='TRAVEL',
                    scope=3,
                    category=f"Travel - {expense_type}",
                    description=f"Employee: {row.get('Employee_Email')}",
                    quantity=quantity,
                    unit=unit,
                    normalized_quantity=normalized,
                    normalized_unit="MTCO2e",
                    date=datetime.today().date(),
                    is_suspicious=False,
                    status='PENDING'
                ))
            EmissionRecord.objects.bulk_create(records)
            self.stdout.write(f"Imported {len(records)} Travel records")