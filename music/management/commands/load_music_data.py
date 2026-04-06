
# # music/management/commands/load_music_data.py
# import pandas as pd
# import os
# from django.core.management.base import BaseCommand
# from django.core.files import File
# from music.models import Artist, Album, Song

# class Command(BaseCommand):
#     help = 'Load music data from clustered_df.csv into the database and link audio files'

#     def handle(self, *args, **kwargs):
#         # Path to your CSV
#         csv_path = r'C:\Users\gauta\Desktop\musicverse\music\management\commands\clustered_df.csv'
#         df = pd.read_csv(csv_path)

#         # Base path for audio files
#         audio_base_path = r'C:\Users\gauta\Desktop\musicverse\media\audio_files'

#         # Track unique artists and albums to avoid duplicates
#         artist_cache = {}
#         album_cache = {}

#         for index, row in df.iterrows():
#             # Get or create Artist
#             artist_name = row['artist_name']
#             if artist_name not in artist_cache:
#                 artist, created = Artist.objects.get_or_create(name=artist_name)
#                 artist_cache[artist_name] = artist
#             else:
#                 artist = artist_cache[artist_name]

#             # Get or create Album
#             album_name = row.get('album', f"{artist_name} Singles")
#             album_key = (artist_name, album_name)
#             if album_key not in album_cache:
#                 album, created = Album.objects.get_or_create(
#                     name=album_name,
#                     artist=artist,
#                     defaults={'year': int(row.get('year', 0) or 0)}
#                 )
#                 album_cache[album_key] = album
#             else:
#                 album = album_cache[album_key]

#             # Create or update Song
#             song, created = Song.objects.get_or_create(
#                 track_id=row['track_id'],
#                 defaults={
#                     'name': row['track_name'],
#                     'artist': artist,
#                     'album': album,
#                     'year': int(row.get('year', 0) or 0),
#                     'genre': row.get('genre', ''),
#                     'popularity': int(row.get('popularity', 0) or 0),
#                     'danceability': float(row.get('danceability', 0.0) or 0.0),
#                     'energy': float(row.get('energy', 0.0) or 0.0),
#                     'key': int(row.get('key', 0) or 0),
#                     'loudness': float(row.get('loudness', 0.0) or 0.0),
#                     'mode': int(row.get('mode', 0) or 0),
#                     'speechiness': float(row.get('speechiness', 0.0) or 0.0),
#                     'acousticness': float(row.get('acousticness', 0.0) or 0.0),
#                     'instrumentalness': float(row.get('instrumentalness', 0.0) or 0.0),
#                     'liveness': float(row.get('liveness', 0.0) or 0.0),
#                     'valence': float(row.get('valence', 0.0) or 0.0),
#                     'tempo': float(row.get('tempo', 0.0) or 0.0),
#                     'duration_ms': int(row.get('duration_ms', 0) or 0),
#                     'time_signature': int(row.get('time_signature', 4) or 4),
#                     'cluster': int(row.get('Cluster', 0) or 0),
#                 }
#             )

#             # Link audio file if it exists
#             audio_filename = f"{artist_name} - {row['track_name']}.mp3"
#             audio_path = os.path.join(audio_base_path, audio_filename)
#             if os.path.exists(audio_path):
#                 with open(audio_path, 'rb') as f:
#                     song.audio_file.save(audio_filename, File(f), save=True)
#                 self.stdout.write(self.style.SUCCESS(f"Linked audio for: {row['track_name']} by {artist_name}"))
#             else:
#                 self.stdout.write(self.style.WARNING(f"Audio file not found: {audio_filename}"))

#             self.stdout.write(self.style.SUCCESS(f"Processed song: {row['track_name']} by {artist_name}"))

# music/management/commands/load_music_data.py

import pandas as pd
import os
from django.core.management.base import BaseCommand
from django.core.files import File
from music.models import Artist, Album, Song

class Command(BaseCommand):
    help = 'Load music data from clustered_df.csv into the database and link audio files'

    def handle(self, *args, **kwargs):
        # Path to your CSV
        csv_path = r'C:\Users\gauta\Desktop\musicverse\music\management\commands\clustered_df.csv'
        df = pd.read_csv(csv_path)

        # Base path for audio files
        audio_base_path = r'C:\Users\gauta\Desktop\musicverse\media\audio_files'

        # Track unique artists and albums to avoid duplicates
        artist_cache = {}
        album_cache = {}

        for index, row in df.iterrows():
            # Get or create Artist
            artist_name = row['artist_name']
            if artist_name not in artist_cache:
                artist, created = Artist.objects.get_or_create(name=artist_name)
                artist_cache[artist_name] = artist
            else:
                artist = artist_cache[artist_name]

            # Get or create Album
            album_name = row.get('album', f"{artist_name} Singles")
            album_key = (artist_name, album_name)
            if album_key not in album_cache:
                album, created = Album.objects.get_or_create(
                    name=album_name,
                    artist=artist,
                    defaults={'year': int(row.get('year', 0) or 0)}
                )
                album_cache[album_key] = album
            else:
                album = album_cache[album_key]

            # Create or update Song
            song, created = Song.objects.get_or_create(
                track_id=row['track_id'],
                defaults={
                    'name': row['track_name'],
                    'artist': artist,
                    'album': album,
                    'year': int(row.get('year', 0) or 0),
                    'genre': row.get('genre', ''),
                    'popularity': int(row.get('popularity', 0) or 0),
                    'danceability': float(row.get('danceability', 0.0) or 0.0),
                    'energy': float(row.get('energy', 0.0) or 0.0),
                    'key': int(row.get('key', 0) or 0),
                    'loudness': float(row.get('loudness', 0.0) or 0.0),
                    'mode': int(row.get('mode', 0) or 0),
                    'speechiness': float(row.get('speechiness', 0.0) or 0.0),
                    'acousticness': float(row.get('acousticness', 0.0) or 0.0),
                    'instrumentalness': float(row.get('instrumentalness', 0.0) or 0.0),
                    'liveness': float(row.get('liveness', 0.0) or 0.0),
                    'valence': float(row.get('valence', 0.0) or 0.0),
                    'tempo': float(row.get('tempo', 0.0) or 0.0),
                    'duration_ms': int(row.get('duration_ms', 0) or 0),
                    'time_signature': int(row.get('time_signature', 4) or 4),
                    'cluster': int(row.get('Cluster', 0) or 0),
                }
            )

            # Correct filename format: ArtistName_-_TrackName.mp3
            artist_clean = artist_name.replace(' ', '_')
            track_clean = row['track_name'].replace(' ', '_')
            audio_filename = f"{artist_clean}_-_{track_clean}.mp3"

            audio_path = os.path.join(audio_base_path, audio_filename)

            if os.path.exists(audio_path):
                with open(audio_path, 'rb') as f:
                    song.audio_file.save(audio_filename, File(f), save=True)
                self.stdout.write(self.style.SUCCESS(f"Linked audio for: {row['track_name']} by {artist_name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Audio file not found: {audio_filename}"))

            self.stdout.write(self.style.SUCCESS(f"Processed song: {row['track_name']} by {artist_name}"))
