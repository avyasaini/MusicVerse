from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('djoser.urls')),  # Handles /auth/users/
    path('auth/', include('djoser.urls.jwt')),  # Handles /auth/jwt/create/
    path('api/music/', include('music.urls')),
    path('api/social/', include('social.urls')),
    path('api/community/', include('community.urls')),
    path('api/users/', include('users.urls')),  # Add users app URLs
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)