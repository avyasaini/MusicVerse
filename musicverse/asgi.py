# musicverse/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'musicverse.settings')

# Get the ASGI application for HTTP requests
django_asgi_app = get_asgi_application()

# Import social.routing dynamically after settings are configured
import importlib

# Define the application with delayed imports
def get_websocket_urlpatterns():
    routing_module = importlib.import_module('social.routing')
    return routing_module.websocket_urlpatterns

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            get_websocket_urlpatterns()  # Call function to get websocket_urlpatterns
        )
    ),
})