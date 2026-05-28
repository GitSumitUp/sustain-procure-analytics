from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Count
from .models import EmissionRecord
from django.shortcuts import get_object_or_404
from uploads.models import RawUpload

class IngestionSummaryView(APIView):
    def get(self, request):
        try:
            total_records = EmissionRecord.objects.count()
            
            total_carbon = EmissionRecord.objects.aggregate(total=Sum('normalized_quantity'))['total'] or 0
            
            total_sources = RawUpload.objects.count()
            
            suspicious_count = EmissionRecord.objects.filter(is_suspicious=True).count()
            
            failed_count = EmissionRecord.objects.filter(status='FLAGGED').count()

            return Response({
                "total_carbon_mtco2e": round(float(total_carbon), 2),
                "total_records": total_records,
                "active_sources": total_sources,
                "suspicious_anomalies": suspicious_count,
                "failed_validations": failed_count,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EmissionRecordListView(APIView):
    """Fetches all rows for the analyst review grid pane."""
    def get(self, request):
        try:
            # Order by newest first, putting flagged suspicious rows on top
            records = EmissionRecord.objects.all().order_by('-is_suspicious', '-date')
            data = []
            for r in records:
                data.append({
                    "id": r.id,
                    "source_type": r.source_type,
                    "category": r.category,
                    "quantity": float(r.quantity),
                    "unit": r.unit,
                    "normalized_quantity": float(r.normalized_quantity),
                    "normalized_unit": r.normalized_unit,
                    "is_suspicious": r.is_suspicious,
                    "status": r.status,
                    "locked": r.locked
                })
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProcessReviewActionView(APIView):
    """Handles single-click workflow updates (Approve / Reject)"""
    def patch(self, request, record_id):
        action = request.data.get('action') 
        record = get_object_or_404(EmissionRecord, id=record_id)
        
        if record.locked:
            return Response({"error": "This file ledger checkpoint has been locked for compliance audit purposes."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            if action == 'APPROVE':
                old_status = record.status
                old_locked_state = str(record.locked)

                record.status = 'APPROVED'
                record.is_suspicious = False
                record.locked = True
                
                record.approved_by = request.user if request.user.is_authenticated else None
                record.save()

                AuditLog.objects.create(
                    record=record,
                    changed_by=request.user if request.user.is_authenticated else None,
                    field_name="status",
                    old_value=old_status,
                    new_value="APPROVED"
                )
                AuditLog.objects.create(
                    record=record,
                    changed_by=request.user if request.user.is_authenticated else None,
                    field_name="locked",
                    old_value=old_locked_state,
                    new_value="True"
                )

            elif action == 'REJECT':
                old_status = record.status
                record.status = 'FLAGGED'
                record.save()

                AuditLog.objects.create(
                    record=record,
                    changed_by=request.user if request.user.is_authenticated else None,
                    field_name="status",
                    old_value=old_status,
                    new_value="FLAGGED"
                )
            else:
                return Response({"error": "Invalid action parameter"}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({"message": f"Record successfully updated and logged."}, status=status.HTTP_200_OK)