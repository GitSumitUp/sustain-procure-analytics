from django.db import models

class Company(models.Model):
      name = models.CharField(max_length=255, unique=True)
      created_at = models.DateTimeField(auto_now_add=True)

      class Meta:
            verbose_name_plural = "Companies"

      def __str__(self):
          return self.name