from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, ReviewViewSet, LocationReviewViewSet, average_rating

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'location-reviews', LocationReviewViewSet, basename='location-reviews')

urlpatterns = [
    path('', include(router.urls)),
    path('average-rating/<int:location_id>/', average_rating),
]
