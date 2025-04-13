from rest_framework import serializers
from .models import Location, Review, User

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

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'is_disable']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_disable=validated_data.get('is_disable', False)
        )
        return user
