from django.contrib import admin

from .models import Location, Review

@admin.register(Location)
class Admin(admin.ModelAdmin):
    list_display = [field.name for field in Location._meta.fields]

@admin.register(Review)
class Admin(admin.ModelAdmin):
    list_display = [field.name for field in Review._meta.fields]
