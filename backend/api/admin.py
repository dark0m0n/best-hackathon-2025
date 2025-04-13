from django.contrib import admin

from .models import Location, Review, User

@admin.register(Location)
class Admin(admin.ModelAdmin):
    list_display = [field.name for field in Location._meta.fields]

@admin.register(Review)
class Admin(admin.ModelAdmin):
    list_display = [field.name for field in Review._meta.fields]

@admin.register(User)
class Admin(admin.ModelAdmin):
    list_display = [field.name for field in User._meta.fields]
