#sociail/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FriendshipViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'friendships', FriendshipViewSet, basename='friendship')  # Add basename
router.register(r'messages', MessageViewSet, basename='message')          # Add basename

urlpatterns = [
    path('', include(router.urls)),
]
