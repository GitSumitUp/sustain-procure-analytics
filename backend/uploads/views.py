import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from core.models import Company
from .models import RawUpload
from .parsers import parse_sap_csv, parse_utility_csv, parse_travel_csv

class BaseUploadView(APIView):
    parser_classes = [MultiPartParser] # Allows Django to process files, like Multer middleware

    def get_company(self):
        company, _ = Company.objects.get_or_create(name="Enterprise Client Corp")
        return company


    def handle_upload(self, request, source_type, parser_function):
        if 'file' not in request.FILES:
            return Response({"error": "No file wrapper provided under key 'file'"}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_file = request.FILES['file']
        company = self.get_company()

        raw_upload = RawUpload.objects.create(
            company=company,
            source_type=source_type,
            file_name=uploaded_file.name,
            raw_data_snapshot={"info": "File streaming completed successfully"}
        )

        try:
            parser_function(uploaded_file, company, raw_upload)
            return Response({
                "message": f"Successfully ingested and normalized {source_type} asset file.",
                "upload_id": raw_upload.id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            raw_upload.delete()
            return Response({"error": f"Normalization runtime crash: {str(e)}"}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class SapUploadView(BaseUploadView):
      def post(self, request):
          return self.handle_upload(request, 'SAP', parse_sap_csv)

class UtilityUploadView(BaseUploadView):
      def post(self, request):
          return self.handle_upload(request, 'UTILITY', parse_utility_csv)

class TravelUploadView(BaseUploadView):
      def post(self, request):
          return self.handle_upload(request, 'TRAVEL', parse_travel_csv)