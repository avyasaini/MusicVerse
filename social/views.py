# social/views.py
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q, Count
from .models import Friendship, Message
from .serializers import FriendshipSerializer, MessageSerializer, UserSerializer
from users.models import CustomUser
from music.models import PlayHistory

class FriendshipViewSet(viewsets.ModelViewSet):
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only show friendships involving the current user."""
        user = self.request.user
        return Friendship.objects.filter(Q(user1=user) | Q(user2=user)).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        """Return user's friendships with nested details."""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """Create a friend request from the logged-in user to another."""
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=201, headers=headers)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a received friend request."""
        friendship = self.get_object()
        if friendship.user2 != request.user or friendship.status != 'pending':
            return Response({"error": "You can only accept your own pending friend requests"}, status=403)
        friendship.status = 'accepted'
        friendship.save()
        reverse_exists = Friendship.objects.filter(user1=friendship.user2, user2=friendship.user1).exists()
        if not reverse_exists:
            Friendship.objects.create(user1=friendship.user2, user2=friendship.user1, status='accepted')
        serializer = self.get_serializer(friendship)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def reject(self, request, pk=None):
        """Reject a received friend request."""
        friendship = self.get_object()
        if friendship.user2 != request.user or friendship.status != 'pending':
            return Response({"error": "You can only reject your own pending friend requests"}, status=403)
        friendship.delete()
        return Response(status=204)

    @action(detail=True, methods=['post'])
    def remove(self, request, pk=None):
        """Remove a friend (delete the accepted friendship)."""
        friendship = self.get_object()
        if friendship.status != 'accepted':
            return Response({"error": "Can only remove accepted friendships"}, status=400)
        if friendship.user1 != request.user and friendship.user2 != request.user:
            return Response({"error": "You can only remove your own friendships"}, status=403)
        
        Friendship.objects.filter(
            (Q(user1=friendship.user1, user2=friendship.user2) | Q(user1=friendship.user2, user2=friendship.user1)),
            status='accepted'
        ).delete()
        return Response(status=204)

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        """Recommend users based on similar listening history."""
        user = request.user
        user_artists = PlayHistory.objects.filter(user=user).values_list('song__artist__name', flat=True).distinct()
        if not user_artists:
            return Response({"recommended_friends": []})
        similar_users = PlayHistory.objects.filter(
            song__artist__name__in=user_artists
        ).exclude(user=user).values('user').annotate(
            shared_artists=Count('song__artist')
        ).order_by('-shared_artists')[:5]
        recommended_users = []
        for entry in similar_users:
            suggested_user = CustomUser.objects.get(id=entry['user'])
            if not Friendship.objects.filter(
                Q(user1=user, user2=suggested_user) | Q(user1=suggested_user, user2=user),
                Q(status__in=['pending', 'accepted'])
            ).exists():
                recommended_users.append(suggested_user)
        serializer = UserSerializer(recommended_users, many=True)
        return Response({"recommended_friends": serializer.data})

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Only messages involving the current user, optionally filtered by friend."""
        user = self.request.user
        friend_id = self.request.query_params.get('friend_id', None)
        queryset = Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('timestamp')
        
        if friend_id:
            queryset = queryset.filter(
                Q(sender=user, receiver__id=friend_id) | 
                Q(sender__id=friend_id, receiver=user)
            )
        return queryset

    def perform_create(self, serializer):
        """Send message from current user to target."""
        receiver_id = self.request.data.get('receiver')
        if not receiver_id:
            raise serializers.ValidationError({"error": "receiver is required"})
        try:
            receiver = CustomUser.objects.get(id=receiver_id)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"error": "Receiver not found"})
        serializer.save(sender=self.request.user, receiver=receiver)