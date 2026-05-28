from django.db import models
from core.models import Company

class RawUpload(models.Model):
      SOURCE_CHOICES = [
        ('SAP', 'SAP Fuel & Procurement File'),
        ('UTILITY', 'Utility Portal Export'),
        ('TRAVEL', 'Corporate Travel Platform API'),
      ]
      
      company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='uploads')
      source_type = models.CharField(max_length=15, choices=SOURCE_CHOICES)
      file_name = models.CharField(max_length=255)

      raw_data_snapshot = models.JSONField(help_text="Raw payload row snapshot for verification")
      uploaded_at = models.DateTimeField(auto_now_add=True)

      def __str__(self):
          return f"{self.company.name} - {self.source_type} ({self.file_name})"