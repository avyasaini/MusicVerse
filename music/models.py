# music/models.py
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

# Define CustomUser at the module level
CustomUser = get_user_model()
class Artist(models.Model):
    name = models.CharField(max_length=255, unique=True)
    bio = models.TextField(blank=True, null=True)
    logo = models.ImageField(upload_to='artist_logos/', blank=True, null=True)

    def __str__(self):
        return self.name

class Album(models.Model):
    name = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='albums')
    cover_art = models.ImageField(upload_to='album_covers/', blank=True, null=True)
    year = models.PositiveIntegerField()
    genre = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ('name', 'artist')  # No duplicate album names per artist

    def __str__(self):
        return f"{self.name} by {self.artist.name}"

class Song(models.Model):
    name = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='songs')
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='songs', null=True, blank=True)
    track_id = models.CharField(max_length=50, unique=True)  # From your CSV
    audio_file = models.FileField(upload_to='audio_files/', blank=True, null=True)  # Updated path
    year = models.PositiveIntegerField()
    genre = models.CharField(max_length=100, blank=True, null=True)
    popularity = models.IntegerField(default=0)
    # Audio features from your CSV
    danceability = models.FloatField(default=0.0)
    energy = models.FloatField(default=0.0)
    key = models.IntegerField(default=0)
    loudness = models.FloatField(default=0.0)
    mode = models.IntegerField(default=0)
    speechiness = models.FloatField(default=0.0)
    acousticness = models.FloatField(default=0.0)
    instrumentalness = models.FloatField(default=0.0)
    liveness = models.FloatField(default=0.0)
    valence = models.FloatField(default=0.0)
    tempo = models.FloatField(default=0.0)
    duration_ms = models.IntegerField(default=0)
    time_signature = models.IntegerField(default=4)
    cluster = models.IntegerField(default=0)  # From your clustering

    def __str__(self):
        return f"{self.name} by {self.artist.name}"

class PlayHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='play_history')
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='plays')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} played {self.song.name}"

class Queue(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='queue')
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='queued')
    position = models.PositiveIntegerField()

    class Meta:
        unique_together = ('user', 'position')  # Ensure unique position per user
        ordering = ['position']

    def __str__(self):
        return f"{self.song.name} at position {self.position} for {self.user.username}"

class Playlist(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    songs = models.ManyToManyField(Song)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} by {self.user.username}"