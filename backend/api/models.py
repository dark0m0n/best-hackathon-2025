from django.contrib.gis.db import models

class Location(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    coordinates = models.PointField()
    has_ramp = models.BooleanField(default=False)
    has_tactile_elements = models.BooleanField(default=False)
    has_adapted_toilet = models.BooleanField(default=False)
    category = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Review(models.Model):
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    rating = models.IntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
