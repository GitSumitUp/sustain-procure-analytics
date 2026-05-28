from django.db import models
from django.contrib.auth.models import User
from emissions.models import EmissionRecord

class AuditLog(models.Model):
      record = models.ForeignKey(EmissionRecord, on_delete=models.CASCADE, related_name='audit_logs')
      changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
      field_name = models.CharField(max_length=100)
      old_value = models.TextField(blank=True, null=True)
      new_value = models.TextField(blank=True, null=True)
      changed_at = models.DateTimeField(auto_now_add=True)

      def __str__(self):
        return f"Record {self.record.id} | Field '{self.field_name}' changed"