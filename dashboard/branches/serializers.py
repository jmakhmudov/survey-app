from rest_framework import serializers
from .models import Branch, Client

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'name', 'address']

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'full_name', 'gender', 'age', 'phone_number']

    def create(self, validated_data):
        client = Client.objects.create(**validated_data)
        return client