import os
import requests
from io import BytesIO
from urllib.parse import quote_plus
from django.core.management.base import BaseCommand
from django.core.files import File
from music.models import Song, Album
import time

class Command(BaseCommand):
    help = 'Fetches official album covers from the iTunes API for the songs in the database.'

    def handle(self, *args, **kwargs):
        albums = Album.objects.filter(cover_art='') | Album.objects.filter(cover_art__isnull=True)
        self.stdout.write(f'Found {albums.count()} albums without covers. Fetching from iTunes...')

        for album in albums:
            # Pick a song from this album to search iTunes accurately
            song = album.songs.first()
            if not song:
                continue

            search_term = quote_plus(f"{song.name} {song.artist.name}")
            url = f"https://itunes.apple.com/search?term={search_term}&entity=song&limit=1"
            
            try:
                response = requests.get(url, timeout=5)
                data = response.json()
                
                if data['resultCount'] > 0:
                    artwork_url = data['results'][0].get('artworkUrl100')
                    if artwork_url:
                        # Get high-res version
                        hd_url = artwork_url.replace('100x100bb.jpg', '600x600bb.jpg')
                        
                        img_response = requests.get(hd_url, timeout=5)
                        if img_response.status_code == 200:
                            file_name = f"cover_{album.id}.jpg"
                            album.cover_art.save(file_name, File(BytesIO(img_response.content)), save=True)
                            self.stdout.write(self.style.SUCCESS(f"Saved HD cover for: {album.name}"))
                        else:
                            self.stdout.write(self.style.WARNING(f"Failed to download image for: {album.name}"))
                else:
                    self.stdout.write(self.style.WARNING(f"No iTunes result for: {song.name}"))
                
                # Sleep briefly to respect API rate limits
                time.sleep(0.5)

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error fetching {album.name}: {e}"))
        
        self.stdout.write(self.style.SUCCESS('Finished fetching official covers.'))
