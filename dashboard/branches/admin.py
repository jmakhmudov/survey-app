from django.contrib import admin

from branches.models import Client, Branch
from import_export.admin import ImportExportModelAdmin

class ClientAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'gender', 'age', 'phone_number', 'joined')
    list_filter = ('age', 'gender')

    class Media:
        js = ('app/js/client_graph.js',)


class CustomImportExportModelAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    pass

class BranchAdmin(CustomImportExportModelAdmin):
    list_display = ('id', 'name', 'address')

admin.site.register(Client, ClientAdmin)
admin.site.register(Branch, BranchAdmin)
