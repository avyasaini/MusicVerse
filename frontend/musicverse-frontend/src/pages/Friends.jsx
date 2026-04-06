// frontend/musicverse-frontend/src/pages/Friends.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Friends() {
  const [recommendedFriends, setRecommendedFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => localStorage.getItem("access_token"), []);
  const storedUserId = localStorage.getItem("user_id");
  const userId = useMemo(() => {
    const id = parseInt(storedUserId || "0", 10);
    console.log("Parsed userId:", id, "from stored value:", storedUserId);
    return id;
  }, [storedUserId]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token || userId === 0) {
      setError("No authentication token or user ID found. Please log in.");
      setLoading(false);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [recResponse, requestsResponse] = await Promise.all([
          axios.get("/api/social/friendships/recommendations/", config),
          axios.get("/api/social/friendships/", config),
        ]);
        console.log("Recommendations Response:", recResponse.data);
        console.log("Friendships Response:", requestsResponse.data);
        setRecommendedFriends(recResponse.data.recommended_friends || []);
        const allRequests = requestsResponse.data || [];
        const filteredRequests = allRequests.filter((req) => {
          const user2Id = req.user2_details?.id;
          const isReceiver = user2Id === userId;
          console.log(
            `Filtering request ${req.id}: user2_id=${user2Id}, userId=${userId}, isReceiver=${isReceiver}, status=${req.status}`
          );
          return req.status === "pending" && isReceiver;
        });
        console.log("Filtered Requests:", filteredRequests);
        setFriendRequests(filteredRequests);

        // Deduplicate friends by friend ID
        const allFriends = allRequests.filter(
          (req) => req.status === "accepted"
        );
        const uniqueFriends = [];
        const friendIds = new Set();
        allFriends.forEach((friendship) => {
          const friend =
            friendship.user1_details?.id === userId
              ? friendship.user2_details
              : friendship.user1_details;
          if (friend && !friendIds.has(friend.id)) {
            friendIds.add(friend.id);
            uniqueFriends.push(friendship);
          }
        });
        console.log("Unique Friends:", uniqueFriends);
        setFriends(uniqueFriends);
      } catch (err) {
        handleError("Failed to load friends data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, storedUserId, navigate]);

  const handleError = (message, err) => {
    const detail =
      err?.response?.data?.error || err?.response?.data?.detail || err.message;
    setError(`${message}: ${detail}`);
    console.error("Error Details:", {
      message,
      detail,
      response: err.response?.data,
    });
  };

  const handleSendRequest = (targetUserId) => {
    if (!token)
      return setError("No authentication token found. Please log in.");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios
      .post("/api/social/friendships/", { user2: targetUserId }, config)
      .then((res) => {
        const newRequest = res.data;
        console.log("New Request:", newRequest);
        // Re-filter friendRequests to ensure only receiver's requests are included
        const updatedRequests = [...friendRequests, newRequest].filter(
          (req) => {
            const user2Id = req.user2_details?.id;
            const isReceiver = user2Id === userId;
            console.log(
              `Filtering new request ${req.id}: user2_id=${user2Id}, userId=${userId}, isReceiver=${isReceiver}, status=${req.status}`
            );
            return req.status === "pending" && isReceiver;
          }
        );
        console.log("Updated Requests:", updatedRequests);
        setFriendRequests(updatedRequests);
        setRecommendedFriends((prev) =>
          prev.filter((u) => u.id !== targetUserId)
        );
      })
      .catch((err) => handleError("Failed to send friend request", err));
  };

  const handleAcceptRequest = (requestId) => {
    if (!token)
      return setError("No authentication token found. Please log in.");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios
      .post(`/api/social/friendships/${requestId}/accept/`, {}, config)
      .then((res) => {
        setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
        // Add to friends, but deduplicate
        const newFriendship = res.data;
        setFriends((prev) => {
          const updatedFriends = [...prev, newFriendship];
          const friendIds = new Set();
          const uniqueFriends = [];
          updatedFriends.forEach((friendship) => {
            const friend =
              friendship.user1_details?.id === userId
                ? friendship.user2_details
                : friendship.user1_details;
            if (friend && !friendIds.has(friend.id)) {
              friendIds.add(friend.id);
              uniqueFriends.push(friendship);
            }
          });
          return uniqueFriends;
        });
      })
      .catch((err) => handleError("Failed to accept friend request", err));
  };

  const handleRejectRequest = (requestId) => {
    if (!token)
      return setError("No authentication token found. Please log in.");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios
      .delete(`/api/social/friendships/${requestId}/`, config)
      .then(() => {
        setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
      })
      .catch((err) => handleError("Failed to reject friend request", err));
  };

  const handleRemoveFriend = (friendshipId) => {
    if (!token)
      return setError("No authentication token found. Please log in.");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios
      .post(`/api/social/friendships/${friendshipId}/remove/`, {}, config)
      .then(() => {
        setFriends((prev) =>
          prev.filter((friendship) => friendship.id !== friendshipId)
        );
      })
      .catch((err) => handleError("Failed to remove friend", err));
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  const renderUserCard = (user, actionButton, index) => {
    if (!user) {
      console.warn("renderUserCard: User data is undefined");
      return null;
    }
    return (
      <div
        key={`${user.id}-${index}`}
        className="bg-white p-4 rounded-lg shadow-md"
      >
        <h3 className="text-lg font-semibold">{user.username}</h3>
        <p className="text-gray-600">{user.bio || "No bio"}</p>
        {actionButton}
      </div>
    );
  };

  const renderRequestCard = (request, index) => {
    const otherUser = request.user1_details;
    if (!otherUser) {
      console.warn(
        "renderRequestCard: Missing user1_details for request:",
        request
      );
      return null;
    }
    return renderUserCard(
      otherUser,
      <>
        <button
          onClick={() => handleAcceptRequest(request.id)}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
          aria-label={`Accept friend request from ${otherUser.username}`}
        >
          Accept
        </button>
        <button
          onClick={() => handleRejectRequest(request.id)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          aria-label={`Reject friend request from ${otherUser.username}`}
        >
          Reject
        </button>
      </>,
      index
    );
  };

  const renderFriendCard = (friendship, index) => {
    const friend =
      friendship.user1_details?.id === userId
        ? friendship.user2_details
        : friendship.user1_details;
    if (!friend) {
      console.warn(
        "renderFriendCard: Missing friend details for friendship:",
        friendship
      );
      return null;
    }
    console.log(`Rendering friend card for friend.id: ${friend.id}`); // Debug the friend ID
    return renderUserCard(
      friend,
      <div className="flex space-x-2">
        <Link
          to={`/messages/${friend.id}`}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          aria-label={`Message ${friend.username}`}
        >
          Message
        </Link>
        <button
          onClick={() => handleRemoveFriend(friendship.id)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          aria-label={`Remove friend ${friend.username}`}
        >
          Remove Friend
        </button>
      </div>,
      index
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Friends</h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <>
          <Section
            title="Recommended Friends"
            data={recommendedFriends}
            fallback="No recommended friends yet."
            renderItem={(user, index) =>
              renderUserCard(
                user,
                <button
                  onClick={() => handleSendRequest(user.id)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  aria-label={`Send friend request to ${user.username}`}
                >
                  Send Friend Request
                </button>,
                index
              )
            }
          />
          <Section
            title="Friend Requests"
            data={friendRequests}
            fallback="No pending friend requests."
            renderItem={renderRequestCard}
          />
          <Section
            title="Your Friends"
            data={friends}
            fallback="No friends yet."
            renderItem={renderFriendCard}
          />
        </>
      )}
    </div>
  );
}

function Section({ title, data, fallback, renderItem }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.length > 0 ? (
          data.map((item, index) => renderItem(item, index)).filter(Boolean)
        ) : (
          <p className="text-gray-500 text-center col-span-full">{fallback}</p>
        )}
      </div>
    </div>
  );
}
