# # social/consumers.py
# import json
# from urllib.parse import parse_qs
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from rest_framework_simplejwt.tokens import AccessToken
# from django.contrib.auth import get_user_model
# from .models import Message, Friendship
# from users.models import CustomUser
# from .serializers import MessageSerializer

# User = get_user_model()

# class ChatConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         print(f"Scope: {self.scope}")

#         # Extract token from query string
#         query_string = self.scope['query_string'].decode()
#         query_params = parse_qs(query_string)
#         token = query_params.get('token', [None])[0]

#         if not token:
#             print("No token provided, closing connection")
#             await self.close()
#             return

#         # Authenticate the user using the token
#         try:
#             access_token = AccessToken(token)
#             user_id = access_token['user_id']
#             self.user = await database_sync_to_async(User.objects.get)(id=user_id)
#             self.scope['user'] = self.user
#         except Exception as e:
#             print(f"Authentication error: {e}")
#             await self.close()
#             return

#         # Extract friend_id from URL route
#         self.friend_id = self.scope['url_route']['kwargs'].get('friend_id')
#         if not self.friend_id or not self.friend_id.isdigit():
#             print(f"Invalid or missing friend_id: {self.friend_id}, Scope kwargs: {self.scope['url_route']['kwargs']}")
#             await self.close()
#             return
#         self.friend_id = int(self.friend_id)

#         # Ensure room_name uses valid integers
#         if self.user.id is None or self.friend_id is None:
#             print(f"Invalid user ID or friend ID: user.id={self.user.id}, friend_id={self.friend_id}")
#             await self.close()
#             return

#         self.room_name = f'chat_{min(self.user.id, self.friend_id)}_{max(self.user.id, self.friend_id)}'
#         self.room_group_name = f'chat_{self.room_name}'

#         # Verify the users are friends
#         if not await self.are_friends():
#             print(f"Users {self.user.id} and {self.friend_id} are not friends")
#             await self.close()
#             return

#         # Join room group
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )
#         print(f"Connection accepted for room: {self.room_name}")
#         await self.accept()

#     async def disconnect(self, close_code):
#         if hasattr(self, 'room_group_name'):
#             await self.channel_layer.group_discard(
#                 self.room_group_name,
#                 self.channel_name
#             )
#             print(f"Disconnected from room: {self.room_name}, Close code: {close_code}")
#         else:
#             print(f"Disconnected, but room_group_name not set. Close code: {close_code}")

#     async def receive(self, text_data):
#         try:
#             text_data_json = json.loads(text_data)
#             if text_data_json.get('type') == 'ping':
#                 await self.send(text_data=json.dumps({'type': 'pong'}))
#                 print("Received ping, sent pong")
#                 return

#             if text_data_json.get('type') == 'mark_read':
#                 message_id = text_data_json.get('message_id')
#                 if not message_id:
#                     print("No message_id provided for mark_read")
#                     return
#                 print(f"Received mark_read for message ID: {message_id}")
#                 # Update the message as read in the database
#                 success = await self.mark_message_as_read(message_id)
#                 if success:
#                     print(f"Successfully marked message {message_id} as read, broadcasting read_receipt")
#                     # Broadcast the read receipt to the room group
#                     await self.channel_layer.group_send(
#                         self.room_group_name,
#                         {
#                             'type': 'read_receipt',
#                             'message_id': message_id
#                         }
#                     )
#                 else:
#                     print(f"Failed to mark message {message_id} as read")
#                 return

#             message = text_data_json.get('message')
#             if not message:
#                 print("No message received, closing connection")
#                 await self.close()
#                 return

#             # Save the message to the database
#             saved_message = await self.save_message(message)
#             if not saved_message:
#                 print("Failed to save message")
#                 await self.send(text_data=json.dumps({'error': 'Failed to save message'}))
#                 return

#             # Send message to room group
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'chat_message',
#                     'message': saved_message
#                 }
#             )
#         except Exception as e:
#             print(f"Error in receive: {e}")
#             await self.send(text_data=json.dumps({'error': str(e)}))
#             return

#     async def chat_message(self, event):
#         # Send message to WebSocket
#         await self.send(text_data=json.dumps({
#             'message': event['message']
#         }))

#     async def read_receipt(self, event):
#         print(f"Broadcasting read_receipt for message ID: {event['message_id']}")
#         # Send read receipt to WebSocket
#         await self.send(text_data=json.dumps({
#             'type': 'read_receipt',
#             'message_id': event['message_id']
#         }))

#     @database_sync_to_async
#     def are_friends(self):
#         try:
#             return Friendship.objects.filter(
#                 status='accepted',
#                 user1__in=[self.user, self.friend_id],
#                 user2__in=[self.user, self.friend_id]
#             ).exists()
#         except Exception as e:
#             print(f"Error in are_friends: {e}")
#             return False

#     @database_sync_to_async
#     def save_message(self, message):
#         try:
#             self.message = message
#             receiver = CustomUser.objects.get(id=self.friend_id)
#             message_instance = Message.objects.create(
#                 sender=self.user,
#                 receiver=receiver,
#                 content=message,
#                 is_read=False
#             )
#             return MessageSerializer(message_instance).data
#         except Exception as e:
#             print(f"Error in save_message: {e}")
#             return None

#     @database_sync_to_async
#     def mark_message_as_read(self, message_id):
#         try:
#             message = Message.objects.get(id=message_id, receiver=self.user)
#             message.is_read = True
#             message.save()
#             print(f"Updated message {message_id} in database: is_read={message.is_read}")
#             return True
#         except Message.DoesNotExist:
#             print(f"Message {message_id} not found or user {self.user.id} is not the receiver")
#             return False
#         except Exception as e:
#             print(f"Error in mark_message_as_read: {e}")
#             return False



# social/consumers.py
import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from .models import Message, Friendship
from users.models import CustomUser
from .serializers import MessageSerializer

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print(f"Scope: {self.scope}")

        # Extract token from query string
        query_string = self.scope['query_string'].decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if not token:
            print("No token provided, closing connection")
            await self.close()
            return

        # Authenticate the user using the token
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            self.user = await database_sync_to_async(User.objects.get)(id=user_id)
            self.scope['user'] = self.user
        except Exception as e:
            print(f"Authentication error: {e}")
            await self.close()
            return

        # Extract friend_id from URL route
        self.friend_id = self.scope['url_route']['kwargs'].get('friend_id')
        if not self.friend_id or not self.friend_id.isdigit():
            print(f"Invalid or missing friend_id: {self.friend_id}, Scope kwargs: {self.scope['url_route']['kwargs']}")
            await self.close()
            return
        self.friend_id = int(self.friend_id)

        # Ensure room_name uses valid integers
        if self.user.id is None or self.friend_id is None:
            print(f"Invalid user ID or friend ID: user.id={self.user.id}, friend_id={self.friend_id}")
            await self.close()
            return

        self.room_name = f'chat_{min(self.user.id, self.friend_id)}_{max(self.user.id, self.friend_id)}'
        self.room_group_name = f'chat_{self.room_name}'

        # Verify the users are friends
        if not await self.are_friends():
            print(f"Users {self.user.id} and {self.friend_id} are not friends")
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        print(f"Connection accepted for room: {self.room_name}")
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            print(f"Disconnected from room: {self.room_name}, Close code: {close_code}")
        else:
            print(f"Disconnected, but room_group_name not set. Close code: {close_code}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            if text_data_json.get('type') == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
                print("Received ping, sent pong")
                return

            if text_data_json.get('type') == 'mark_read':
                message_id = text_data_json.get('message_id')
                if not message_id:
                    print("No message_id provided for mark_read")
                    return
                print(f"Received mark_read for message ID: {message_id}")
                # Update the message as read in the database
                success = await self.mark_message_as_read(message_id)
                if success:
                    print(f"Successfully marked message {message_id} as read, broadcasting read_receipt")
                    # Broadcast the read receipt to the room group
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'read_receipt',
                            'message_id': message_id
                        }
                    )
                else:
                    print(f"Failed to mark message {message_id} as read")
                return

            message = text_data_json.get('message')
            if not message:
                print("No message received, closing connection")
                await self.close()
                return

            # Save the message to the database
            saved_message = await self.save_message(message)
            if not saved_message:
                print("Failed to save message")
                await self.send(text_data=json.dumps({'error': 'Failed to save message'}))
                return

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': saved_message
                }
            )
        except Exception as e:
            print(f"Error in receive: {e}")
            await self.send(text_data=json.dumps({'error': str(e)}))
            return

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))

    async def read_receipt(self, event):
        print(f"Broadcasting read_receipt for message ID: {event['message_id']}")
        # Send read receipt to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id']
        }))

    @database_sync_to_async
    def are_friends(self):
        try:
            return Friendship.objects.filter(
                status='accepted',
                user1__in=[self.user, self.friend_id],
                user2__in=[self.user, self.friend_id]
            ).exists()
        except Exception as e:
            print(f"Error in are_friends: {e}")
            return False

    @database_sync_to_async
    def save_message(self, message):
        try:
            self.message = message
            receiver = CustomUser.objects.get(id=self.friend_id)
            message_instance = Message.objects.create(
                sender=self.user,
                receiver=receiver,
                content=message,
                is_read=False
            )
            return MessageSerializer(message_instance).data
        except Exception as e:
            print(f"Error in save_message: {e}")
            return None

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        try:
            message = Message.objects.get(id=message_id, receiver_id=self.user.id)
            message.is_read = True
            message.save()
            print(f"Updated message {message_id} in database: is_read={message.is_read}")
            return True
        except Message.DoesNotExist:
            print(f"Message {message_id} not found or user {self.user.id} is not the receiver")
            return False
        except Exception as e:
            print(f"Error in mark_message_as_read: {e}")
            return False