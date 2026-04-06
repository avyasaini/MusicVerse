# social/serializers.py
from rest_framework import serializers
from .models import Friendship, Message
from users.models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'bio', 'avatar']

class FriendshipSerializer(serializers.ModelSerializer):
    user1_details = UserSerializer(source='user1', read_only=True)
    user2_details = UserSerializer(source='user2', read_only=True)
    user1 = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        default=serializers.CreateOnlyDefault(lambda: None),
        write_only=True,
        required=False
    )
    user2 = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.all(),
        write_only=True,
        required=True
    )

    class Meta:
        model = Friendship
        fields = ['id', 'user1', 'user2', 'user1_details', 'user2_details', 'status', 'created_at']
        extra_kwargs = {
            'status': {'required': False, 'default': 'pending'}
        }

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['user1'] = request.user
        else:
            raise serializers.ValidationError({"error": "Request user not available"})
        friendship = Friendship.objects.create(**validated_data)
        print(f"Created friendship: {friendship.id}, status: {friendship.status}")  # Debug log
        return friendship

    def update(self, instance, validated_data):
        if 'status' in validated_data:
            instance.status = validated_data['status']
            instance.save()
            print(f"Updated friendship {instance.id} status to: {instance.status}")  # Debug log
        return instance

    def to_representation(self, instance):
        # Ensure nested details are always included, even for list views
        representation = super().to_representation(instance)
        if not representation.get('user1_details'):
            representation['user1_details'] = UserSerializer(instance.user1).data
        if not representation.get('user2_details'):
            representation['user2_details'] = UserSerializer(instance.user2).data
        # Ensure status is always included
        representation['status'] = instance.status or 'pending'
        print(f"Serialized friendship {instance.id}: {representation}")  # Debug log
        return representation

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp', 'is_read']