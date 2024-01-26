from .models import Survey, Response
from branches.models import Client, Branch
from branches.serializers import ClientSerializer, BranchSerializer
from .serializers import ResponseSerializer, SurveySerializer
from rest_framework import generics

class SurveyView(generics.ListCreateAPIView):
    serializer_class = SurveySerializer

    def get_queryset(self):
        return Survey.objects.filter(is_published=True)
    
class BranchView(generics.ListCreateAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

class SurveyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    lookup_field = 'id'

class ResponseCreateView(generics.CreateAPIView):
    queryset = Response.objects.all()
    serializer_class = ResponseSerializer

class ClientCreateView(generics.CreateAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    lookup_field = 'id'

