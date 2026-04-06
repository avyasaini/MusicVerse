# community/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Community, Post, Comment
from .serializers import CommunitySerializer, PostSerializer, CommentSerializer
from music.models import PlayHistory
from django.shortcuts import get_object_or_404

class CommunityViewSet(viewsets.ModelViewSet):
    queryset = Community.objects.all()
    serializer_class = CommunitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter to only recommended communities for the user."""
        user = self.request.user
        played_songs = PlayHistory.objects.filter(user=user).select_related('song')
        
        if not played_songs.exists():
            return Community.objects.none()

        artists = [play.song.artist.name for play in played_songs if play.song.artist and play.song.artist.name]
        user_artists = set(artists) if artists else set()

        if not user_artists:
            return Community.objects.none()

        communities = Community.objects.filter(
            description__icontains=' '.join(user_artists)
        ).distinct()

        if not communities.exists():
            communities = Community.objects.filter(
                description__icontains=next(iter(user_artists), '')
            ).distinct()

        return communities.order_by('-created_at')

    def list(self, request, *args, **kwargs):
        """Return only recommended communities the user can join."""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Allow a user to join a recommended community."""
        community = self.get_object()
        # Verify community is in recommended list
        recommended = self.get_queryset()
        if community not in recommended:
            return Response({"error": "Cannot join a non-recommended community"}, status=403)
        if community.members.filter(id=request.user.id).exists():
            return Response({"error": "Already a member"}, status=400)
        community.members.add(request.user)
        serializer = self.get_serializer(community)
        return Response(serializer.data)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter posts from communities the user is a member of."""
        user = self.request.user
        return Post.objects.filter(community__members=user).order_by('-created_at')

    def perform_create(self, serializer):
        """Set the author and community from the request."""
        community_id = self.request.data.get('community')
        community = get_object_or_404(Community, id=community_id)
        serializer.save(author=self.request.user, community=community)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter comments from posts in the user's communities."""
        user = self.request.user
        return Comment.objects.filter(post__community__members=user).order_by('-created_at')

    def perform_create(self, serializer):
        """Set the author and post from the request."""
        post_id = self.request.data.get('post')
        post = get_object_or_404(Post, id=post_id)
        serializer.save(author=self.request.user, post=post)