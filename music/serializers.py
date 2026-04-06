# music/serializers.py
from rest_framework import serializers
from .models import Artist, Album, Song, PlayHistory, Queue, Playlist

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'bio', 'logo']

class AlbumSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)

    class Meta:
        model = Album
        fields = ['id', 'name', 'artist', 'cover_art', 'year', 'genre']

class SongSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)
    album = AlbumSerializer(read_only=True)

    class Meta:
        model = Song
        fields = ['id', 'name', 'artist', 'album', 'track_id', 'audio_file', 'year', 'genre', 'popularity',
                  'danceability', 'energy', 'key', 'loudness', 'mode', 'speechiness', 'acousticness',
                  'instrumentalness', 'liveness', 'valence', 'tempo', 'duration_ms', 'time_signature', 'cluster']


class PlayHistorySerializer(serializers.ModelSerializer):
    song = SongSerializer(read_only=True)

    class Meta:
        model = PlayHistory
        fields = ['id', 'user', 'song', 'timestamp']

class QueueSerializer(serializers.ModelSerializer):
    song = SongSerializer(read_only=True)

    class Meta:
        model = Queue
        fields = ['id', 'user', 'song', 'position']

class PlaylistSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, read_only=True)

    class Meta:
        model = Playlist
        fields = ['id', 'user', 'name', 'songs', 'created_at']
        read_only_fields = ['user']