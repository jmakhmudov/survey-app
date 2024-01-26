from rest_framework import serializers
from .models import Survey
from branches.serializers import BranchSerializer
from .models import Response, Answer, Question, Offer

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = ['id', 'amount', 'percent', 'survey', 'description', 'img']

class SurveySerializer(serializers.ModelSerializer):
    branches = BranchSerializer(many=True)
    questions = QuestionSerializer(many=True)
    offers = OfferSerializer(many=True)

    class Meta:
        model = Survey
        fields = ['id', 'name', 'description', 'publish_date', 'expire_date', 'offers', 'branches', 'questions',]

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['question', 'body']

class ResponseSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Response
        fields = ['survey', 'client', 'answers']

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        response = Response.objects.create(**validated_data)
        for answer_data in answers_data:
            Answer.objects.create(response=response, **answer_data)
        return response
    
