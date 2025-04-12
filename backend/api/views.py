from rest_framework import viewsets
from .models import Location
from .serializers import LocationSerializer
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.contrib.gis.geos import Point

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
