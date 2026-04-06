# music/admin.py
from django.contrib import admin
from .models import Artist, Album, Song, PlayHistory, Queue

@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ('name', 'artist', 'year')
    search_fields = ('name', 'artist__name')
    list_filter = ('artist',)

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('name', 'artist', 'album', 'audio_file', 'year')
    search_fields = ('name', 'artist__name', 'album__name')
    list_filter = ('artist', 'album', 'year')
    readonly_fields = ('track_id',)

@admin.register(PlayHistory)
class PlayHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'song', 'timestamp')
    search_fields = ('user__username', 'song__name')
    list_filter = ('timestamp',)

@admin.register(Queue)
class QueueAdmin(admin.ModelAdmin):
    list_display = ('user', 'song', 'position')
    search_fields = ('user__username', 'song__name')
    list_filter = ('user',)