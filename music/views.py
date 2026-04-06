# music/views.py
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)

from .models import Artist, Album, Song, PlayHistory, Queue, Playlist
from .serializers import ArtistSerializer, AlbumSerializer, SongSerializer, PlayHistorySerializer, QueueSerializer, PlaylistSerializer
from social.models import Friendship
from community.models import Community

CustomUser = get_user_model()

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def log_play(self, request):
        song_id = request.data.get('song_id')
        if not song_id:
            return Response({"error": "song_id is required"}, status=400)
        try:
            song = Song.objects.get(id=song_id)
            PlayHistory.objects.create(user=request.user, song=song)
            return Response({"message": "Play logged successfully"})
        except Song.DoesNotExist:
            return Response({"error": "Song not found"}, status=404)

    @action(detail=False, methods=['get'])
    def recommend(self, request):
        user = request.user
        played_songs = PlayHistory.objects.filter(user=user).select_related('song')
        
        if not played_songs.exists():
            songs = Song.objects.order_by('-popularity')[:5]
        else:
            last_song = played_songs.latest('timestamp').song
            all_songs = Song.objects.exclude(id=last_song.id)
            features = [
                'danceability', 'energy', 'key', 'loudness', 'mode', 'speechiness',
                'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'
            ]
            last_song_vector = np.array([[getattr(last_song, f, 0) for f in features]])
            all_songs_list = list(all_songs)
            all_songs_vectors = np.array([[getattr(song, f, 0) for f in features] for song in all_songs_list])
            similarities = cosine_similarity(last_song_vector, all_songs_vectors)[0]
            top_indices = similarities.argsort()[-5:][::-1]
            top_song_ids = [all_songs_list[int(i)].id for i in top_indices if int(i) < len(all_songs_list)]
            songs = Song.objects.filter(id__in=top_song_ids)
        
        serializer = self.get_serializer(songs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recommend_users(self, request):
        user = request.user
        played_songs = PlayHistory.objects.filter(user=user).select_related('song')
        
        if not played_songs.exists():
            return Response({"message": "No play history to recommend users"}, status=200)
        
        genres = [play.song.genre for play in played_songs if play.song.genre]
        artists = [play.song.artist.name for play in played_songs]
        user_genres = set(genres) if genres else set()
        user_artists = set(artists) if artists else set()

        similar_users = PlayHistory.objects.filter(
            Q(song__genre__in=user_genres) | Q(song__artist__name__in=user_artists)
        ).values('user').distinct().exclude(user=user)
        user_ids = [item['user'] for item in similar_users]

        for user_id in user_ids:
            to_user = CustomUser.objects.get(id=user_id)
            if not Friendship.objects.filter(user1=user, user2=to_user).exists():
                Friendship.objects.create(user1=user, user2=to_user)
            if not Friendship.objects.filter(user1=to_user, user2=user).exists():
                Friendship.objects.create(user1=to_user, user2=user)

        return Response({"recommended_users": user_ids})

    @action(detail=False, methods=['get'])
    def recommend_communities(self, request):
        user = request.user
        played_songs = PlayHistory.objects.filter(user=user).select_related('song')
        
        if not played_songs.exists():
            return Response({"recommended_communities": []}, status=200)
        
        artists = [play.song.artist.name for play in played_songs if play.song.artist and play.song.artist.name]
        user_artists = set(artists) if artists else set()

        logger.info(f"User artists: {user_artists}")

        try:
            if not user_artists:
                return Response({"recommended_communities": []}, status=200)

            communities = Community.objects.filter(
                description__icontains=' '.join(user_artists)
            ).distinct()

            if not communities.exists():
                logger.info("No direct matches, checking individual artists")
                communities = Community.objects.filter(
                    description__icontains=next(iter(user_artists), '')
                ).distinct()

            recommended_communities = [{
                "id": comm.id,
                "name": comm.name,
                "description": comm.description
            } for comm in communities]

            logger.info(f"Recommended communities: {recommended_communities}")

            # Do not auto-add users here—let the join action handle it
            return Response({"recommended_communities": recommended_communities})
        except Exception as e:
            logger.error(f"Error in recommend_communities: {str(e)}")
            return Response({"error": "Server error occurred", "details": str(e)}, status=500)

class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_song(self, request, pk=None):
        playlist = self.get_object()
        song_id = request.data.get('song_id')
        if not song_id:
            return Response({"error": "song_id is required"}, status=400)
        try:
            song = Song.objects.get(id=song_id)
            playlist.songs.add(song)
            return Response({"message": "Song added to playlist"})
        except Song.DoesNotExist:
            return Response({"error": "Song not found"}, status=404)

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [IsAuthenticated]

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticated]

class PlayHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = PlayHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PlayHistory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class QueueViewSet(viewsets.ModelViewSet):
    serializer_class = QueueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Queue.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)