from django.urls import path
from .views import IngestionSummaryView, EmissionRecordListView, ProcessReviewActionView

urlpatterns = [
    path('summary', IngestionSummaryView.as_view(), name='ingestion-summary'),
    path('records', EmissionRecordListView.as_view(), name='emission-records-list'),
    path('records/<int:record_id>/review', ProcessReviewActionView.as_view(), name='emission-record-review')
]