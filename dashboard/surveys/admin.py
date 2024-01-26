from django.contrib import admin

from surveys.models import Answer, Question, Response, Survey, Offer
from import_export.admin import ImportExportModelAdmin
from import_export import resources, fields


class OfferInline(admin.StackedInline):
    model = Offer
    extra = 0
    max_num = 1

class QuestionInline(admin.StackedInline):
    model = Question
    extra = 0



class SurveyAdmin(admin.ModelAdmin):
    list_display = ("name", "is_published", "get_branches", "publish_date", "expire_date")
    list_filter = ("is_published",)
    inlines = [OfferInline, QuestionInline]

    def get_branches(self, obj):
        related_branch = ", ".join(item.name for item in obj.branches.all()) 
        return related_branch
    
    get_branches.short_description = "Филиалы"


class AnswerBaseInline(admin.StackedInline):
    fields = ("question", "body")
    readonly_fields = ("question",)
    extra = 0
    model = Answer

class ResponseResource(resources.ModelResource):
    client_full_name = fields.Field(column_name='Client Full Name', attribute='client__full_name')
    client_phone_number = fields.Field(column_name='Client Phone Number', attribute='client__phone_number')

    class Meta:
        model = Response
        fields = ('id', 'survey', 'created', 'client_full_name', 'client_phone_number')
        export_order = fields

class CustomImportExportModelAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    pass

class ResponseAdmin(CustomImportExportModelAdmin):
    resource_class = ResponseResource
    list_display = ("survey", "created", "get_client")
    list_filter = ("survey", "created")
    date_hierarchy = "created"
    inlines = [AnswerBaseInline]

    def get_client(self, obj):
        return f"{obj.client.full_name} ({obj.client.phone_number})"
    get_client.short_description = "Клиент"

admin.site.register(Survey, SurveyAdmin)
admin.site.register(Response, ResponseAdmin)
