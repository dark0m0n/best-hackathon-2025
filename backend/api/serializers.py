from rest_framework import serializers
from .models import Location

class LocationSerializer(serializers.ModelSerializer):
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ['id', 'name', 'latitude', 'longitude']

    def get_latitude(self, obj):
        return obj.coordinates.y if obj.coordinates else None

    def get_longitude(self, obj):
        return obj.coordinates.x if obj.coordinates else None
