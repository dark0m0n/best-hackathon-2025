from django.contrib.gis.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

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

class UserManager(BaseUserManager):
    def create_user(self, username, first_name, last_name, email, password, **extra_fields):
        if not email:
            raise ValueError('Користувач має мати email')
        if not username:
            raise ValueError('Користувач має мати username')
        
        email = self.normalize_email(email)
        user = self.model(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, email=None, password=None):
        user = self.model(username=username)
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save(using=self._db)
        return user
    
class User(AbstractUser):
    username = models.CharField(max_length=30, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "username"

    def __str__(self) -> str:
        return self.username
