from rest_framework.viewsets import ReadOnlyModelViewSet
from .models import Location
from .serializers import LocationSerializer

class LocationViewSet(ReadOnlyModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
