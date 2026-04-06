# music/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtistViewSet, AlbumViewSet, SongViewSet, PlayHistoryViewSet, QueueViewSet, PlaylistViewSet

router = DefaultRouter()
router.register(r'artists', ArtistViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'songs', SongViewSet)  # Ensure this is present
router.register(r'play-history', PlayHistoryViewSet, basename='playhistory')
router.register(r'queue', QueueViewSet, basename='queue')
router.register(r'playlists', PlaylistViewSet, basename='playlists')  # Added basename

urlpatterns = [
    path('', include(router.urls)),
]