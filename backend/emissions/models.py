from django.db import models
from django.contrib.auth.models import User
from core.models import Company
from uploads.models import RawUpload

class EmissionRecord(models.Model):
      STATUS_CHOICES = [
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('FLAGGED', 'Flagged / Suspicious'),
      ]

      SCOPE_CHOICES = [
        (1, 'Scope 1 (Direct Emissions)'),
        (2, 'Scope 2 (Indirect - Marketed Electricity)'),
        (3, 'Scope 3 (Indirect - Value Chain / Travel)'),
    ]
      
      company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='emission_records')
      raw_upload = models.ForeignKey(RawUpload, on_delete=models.SET_NULL, null=True, blank=True)

      source_type = models.CharField(max_length=15)
      scope = models.IntegerField(choices=SCOPE_CHOICES)
      category = models.CharField(max_length=255, help_text="e.g., Diesel Fuel, Grid Electricity, Business Flights")
      description = models.TextField(blank=True, null=True)

      quantity = models.DecimalField(max_digits=15, decimal_places=4, help_text="Original ingested value")
      unit = models.CharField(max_length=50, help_text="Original unit e.g., Liters, kWh, Gallons")

      normalized_quantity = models.DecimalField(max_digits=15, decimal_places=4, help_text="Calculated greenhouse metric value")
      normalized_unit = models.CharField(max_length=50, default="MTCO2e", help_text="Metric Tons of CO2 equivalent")

      date = models.DateField(help_text="Activity or Billing cycle date")
      status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
      is_suspicious = models.BooleanField(default=False)

      approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_records')
      locked = models.BooleanField(default=False, help_text="True locks down database updates completely for audit compliance")

      def __str__(self):
          return f"{self.company.name} | {self.category} | {self.normalized_quantity} {self.normalized_unit}"

      def save(self, *args, **kwargs):
        if self.pk:
            original_state = EmissionRecord.objects.get(pk=self.pk)
            if original_state.locked:
                raise PermissionError("Compliance Lock Active: Locked emission lines are read-only and immutable.")
        
        super(EmissionRecord, self).save(*args, **kwargs)