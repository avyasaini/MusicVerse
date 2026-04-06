# community/serializers.py
from rest_framework import serializers
from .models import Community, Post, Comment
from users.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'bio', 'avatar']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    likes = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'updated_at', 'likes']

class CommunitySerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Community
        fields = ['id', 'name', 'description', 'created_by', 'created_at', 'members', 'banner']

    def to_representation(self, instance):
        # Ensure nested fields are always included
        representation = super().to_representation(instance)
        if not representation.get('created_by'):
            representation['created_by'] = UserSerializer(instance.created_by).data
        if not representation.get('members'):
            representation['members'] = UserSerializer(instance.members.all(), many=True).data
        print(f"Serialized community {instance.id}: {representation}")  # Debug log
        return representation

class PostSerializer(serializers.ModelSerializer):
    community = CommunitySerializer(read_only=True)
    author = UserSerializer(read_only=True)
    likes = UserSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'community', 'author', 'title', 'content', 'created_at', 'updated_at', 'likes', 'comments']