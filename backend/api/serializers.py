from rest_framework import serializers
from .models import Location, Review

class LocationSerializer(serializers.ModelSerializer):
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = [
            'id', 'name', 'description', 'latitude', 'longitude', 
            'coordinates', 'has_ramp', 'has_adapted_toilet', 
            'has_tactile_elements', 'category'
        ]

    def get_latitude(self, obj):
        return obj.coordinates.y if obj.coordinates else None

    def get_longitude(self, obj):
        return obj.coordinates.x if obj.coordinates else None

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'location', 'rating', 'comment', 'created_at']
