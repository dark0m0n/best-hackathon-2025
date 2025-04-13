from rest_framework import viewsets
from .models import Location, Review
from .serializers import LocationSerializer, ReviewSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from rest_framework import permissions
from django.contrib.gis.geos import Point
from rest_framework.decorators import api_view
from django.db.models import Avg

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    @action(detail=False, methods=['post'])
    def create_location(self, request):
        # Отримання даних з запиту
        name = request.data.get('name')
        description = request.data.get('description')
        coordinates = request.data.get('coordinates')
        has_ramp = request.data.get('has_ramp')
        has_adapted_toilet = request.data.get('has_adapted_toilet')
        has_tactile_elements = request.data.get('has_tactile_elements')
        category = request.data.get('category')

        # Перевірка координат
        if not coordinates:
            return Response({"detail": "Coordinates are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            longitude, latitude = map(float, coordinates.split(','))
            point = Point(longitude, latitude)
        except ValueError:
            return Response({"detail": "Invalid coordinates format. Use 'longitude,latitude'."}, status=status.HTTP_400_BAD_REQUEST)

        location = Location.objects.create(
            name=name,
            description=description,
            coordinates=point,  # зберігаємо точку як географічний об'єкт
            has_ramp=has_ramp,
            has_adapted_toilet=has_adapted_toilet,
            has_tactile_elements=has_tactile_elements,
            category=category
        )

        serializer = self.get_serializer(location)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class LocationReviewViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        location_id = self.request.query_params.get('location')
        if location_id:
            return Review.objects.filter(location_id=location_id)
        return Review.objects.none()

@api_view(['GET'])
def average_rating(request, location_id):
    avg = Review.objects.filter(location_id=location_id).aggregate(Avg('rating'))
    return Response({'location_id': location_id, 'average_rating': avg['rating__avg']})
