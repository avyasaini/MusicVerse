from django.urls import path
from .views import UserProfileViewSet

# Create an instance of the viewset to map actions to URLs
user_profile_viewset = UserProfileViewSet.as_view({
    'get': 'retrieve',           # Map GET /profile/ to retrieve
    'patch': 'partial_update',   # Map PATCH /profile/ to partial_update
})

urlpatterns = [
    path('profile/', user_profile_viewset, name='userprofile'),
]