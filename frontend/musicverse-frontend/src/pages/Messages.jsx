import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import "../styles/Messages.css";

export default function Messages() {
  const { friendId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [messageQueue, setMessageQueue] = useState([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [isWebSocketConnecting, setIsWebSocketConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const socketRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const token = localStorage.getItem("access_token");
  const userId = parseInt(localStorage.getItem("user_id") || "0", 10);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const connectWebSocket = () => {
    if (!friendId || isNaN(parseInt(friendId))) {
      setError("Invalid friend ID");
      setLoading(false);
      return;
    }
    if (reconnectAttempts >= maxReconnectAttempts) {
      setError("Max reconnection attempts reached. Please refresh the page.");
      setLoading(false);
      return;
    }
    setIsWebSocketConnecting(true);
    const wsUrl = `ws://localhost:8000/ws/chat/${friendId}/?token=${token}`;
    console.log(`Connecting to WebSocket: ${wsUrl}`); // Debug
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected"); // Debug
      setIsWebSocketConnected(true);
      setIsWebSocketConnecting(false);
      setReconnectAttempts(0);
      heartbeatIntervalRef.current = setInterval(() => {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "ping" }));
          console.log("Sent heartbeat ping"); // Debug
        }
      }, 30000);
      if (messageQueue.length > 0) {
        messageQueue.forEach((msg) => {
          socketRef.current.send(JSON.stringify({ message: msg }));
        });
        setMessageQueue([]);
      }
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "pong") {
        console.log("Received heartbeat pong"); // Debug
        return;
      }
      if (data.error) {
        setError(`WebSocket error: ${data.error}`);
        console.log("WebSocket error received:", data.error); // Debug
        return;
      }
      if (data.type === "read_receipt") {
        console.log(`Received read receipt for message ID: ${data.message_id}`); // Debug
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.message_id ? { ...msg, is_read: true } : msg
          )
        );
        return;
      }
      console.log("Received new message via WebSocket:", data.message); // Debug
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === data.message.id)) {
          return prev;
        }
        return [...prev, data.message];
      });
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error); // Debug
      setError("Failed to connect to chat server");
      setIsWebSocketConnecting(false);
    };

    socketRef.current.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason); // Debug
      setIsWebSocketConnected(false);
      setIsWebSocketConnecting(false);
      clearInterval(heartbeatIntervalRef.current);
      if (reconnectAttempts < maxReconnectAttempts) {
        setReconnectAttempts((prev) => prev + 1);
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect..."); // Debug
          connectWebSocket();
        }, 5000);
      }
    };
  };

  useEffect(() => {
    if (!token || userId === 0) {
      setError("No authentication token or user ID found. Please log in.");
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          `/api/social/messages/?friend_id=${friendId}`,
          config
        );
        setMessages(response.data);
        console.log("Fetched messages:", response.data); // Debug
      } catch (err) {
        setError(
          `Failed to load messages: ${
            err.response?.data?.detail || err.message
          }`
        );
        console.error("Messages fetch error:", err.response?.data || err); // Debug
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    connectWebSocket();

    return () => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close();
      }
      clearInterval(heartbeatIntervalRef.current);
      clearTimeout(reconnectTimeoutRef.current);
    };
  }, [token, userId, friendId, navigate]);

  useEffect(() => {
    if (!isWebSocketConnected) return;

    // Mark messages as read when visible
    const unreadMessages = messages.filter(
      (msg) => !msg.is_read && msg.receiver.id === userId
    );
    console.log("Unread messages to mark as read:", unreadMessages); // Debug
    unreadMessages.forEach((msg) => {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        console.log(`Sending mark_read for message ID: ${msg.id}`); // Debug
        socketRef.current.send(
          JSON.stringify({ type: "mark_read", message_id: msg.id })
        );
      } else {
        console.log("WebSocket not open, cannot send mark_read"); // Debug
      }
    });

    // Conditional auto-scroll
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const isNearBottom =
        chatContainer.scrollHeight - chatContainer.scrollTop <=
        chatContainer.clientHeight + 100;
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, userId, isWebSocketConnected]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setError("Message cannot be empty");
      return;
    }

    try {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ message: newMessage }));
        setNewMessage("");
      } else {
        setMessageQueue((prev) => [...prev, newMessage]);
        setNewMessage("");
        setError(
          "WebSocket is not connected. Message will be sent when reconnected."
        );
      }
    } catch (err) {
      setError(`Failed to send message: ${err.message}`);
      console.error("Send message error:", err); // Debug
    }
  };

  // Memoized message rendering
  const messageList = useMemo(() => {
    return messages.map((msg, index) => (
      <motion.div
        key={msg.id}
        className={`messages-message ${
          msg.sender.id === userId
            ? "messages-sent"
            : msg.is_read
            ? "messages-received-read"
            : "messages-received-unread"
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <p className="messages-content">{msg.content}</p>
        <div className="messages-meta">
          <span className="messages-timestamp">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
          {/* {msg.sender.id === userId && (
            <span className="messages-status">
              {msg.is_read ? "Read" : "Sent"}
            </span>
          )} */}
        </div>
      </motion.div>
    ));
  }, [messages, userId]);

  return (
    <div className="messages-page-wrapper">
      <div className="messages-container">
        <motion.h1
          className="messages-main-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Chat with Friend
        </motion.h1>
        {loading ? (
          <p className="messages-loading">Loading...</p>
        ) : error ? (
          <p className="messages-error">{error}</p>
        ) : (
          <motion.div
            className="messages-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="messages-status">
              {isWebSocketConnecting
                ? "Connecting to chat..."
                : isWebSocketConnected
                ? "Connected"
                : `Disconnected, retrying (${
                    maxReconnectAttempts - reconnectAttempts
                  } attempts left)`}
            </div>
            <div className="messages-chat-container" ref={chatContainerRef}>
              {messages.length > 0 ? (
                messageList
              ) : (
                <p className="messages-empty">No messages yet.</p>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="messages-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="messages-input"
                disabled={reconnectAttempts >= maxReconnectAttempts}
              />
              <motion.button
                type="submit"
                className="messages-button"
                disabled={reconnectAttempts >= maxReconnectAttempts}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send
              </motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
