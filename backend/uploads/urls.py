from django.urls import path
from .views import SapUploadView, UtilityUploadView, TravelUploadView

urlpatterns = [
    path('sap', SapUploadView.as_view(), name='upload-sap'),
    path('utility', UtilityUploadView.as_view(), name='upload-utility'),
    path('travel', TravelUploadView.as_view(), name='upload-travel'),
]