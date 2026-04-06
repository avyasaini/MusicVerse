import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [friendships, setFriendships] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [recommendedFriends, setRecommendedFriends] = useState([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState([]);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    avatar: null,
  });
  const [imageError, setImageError] = useState({
    profile: false,
    friends: {},
    communities: {},
  });
  const token = localStorage.getItem("access_token");
  const userId = parseInt(localStorage.getItem("user_id") || "0", 10);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        if (!token) {
          throw new Error("No access token found. Please log in.");
        }

        // Fetch user profile, friendships, communities, and recommendations
        const [
          userResponse,
          friendshipsResponse,
          communitiesResponse,
          friendRecResponse,
          communityRecResponse,
        ] = await Promise.all([
          axios.get("/api/users/profile/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/social/friendships/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/community/communities/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/social/friendships/recommendations/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/community/communities/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // User profile
        setUser(userResponse.data);
        setFormData({
          username: userResponse.data.username,
          bio: userResponse.data.bio || "",
          avatar: null,
        });

        // Friendships
        setFriendships(friendshipsResponse.data);

        // Communities (filter for joined)
        console.log("Communities response:", communitiesResponse.data); // Debug
        console.log("User ID:", userId); // Debug
        const joinedCommunities = communitiesResponse.data.filter(
          (community) => {
            const isMember =
              community.members?.some((member) => member?.id === userId) ||
              false;
            console.log(
              `Community ${community.id}: isMember=${isMember}, members=`,
              community.members
            ); // Debug
            return isMember;
          }
        );
        setCommunities(joinedCommunities);

        // Friend recommendations
        setRecommendedFriends(friendRecResponse.data.recommended_friends || []);

        // Community recommendations
        setRecommendedCommunities(communityRecResponse.data || []);
      } catch (err) {
        const message =
          err.response?.data?.detail ||
          err.message ||
          "Failed to load profile data";
        setError(message);
        console.error(
          "Error fetching profile data:",
          err.response?.data || err
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token && userId !== 0) {
      fetchProfileData();
    } else {
      setError("No access token or user ID found. Please log in.");
      setIsLoading(false);
    }
  }, [token, userId]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar") {
      setFormData({ ...formData, avatar: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("username", formData.username);
      form.append("bio", formData.bio);
      if (formData.avatar) {
        form.append("avatar", formData.avatar);
      }

      const response = await axios.patch("/api/users/profile/", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUser(response.data);
      setIsEditing(false);
      setFormData({
        username: response.data.username,
        bio: response.data.bio || "",
        avatar: null,
      });
    } catch (err) {
      setError(
        `Failed to update profile: ${err.response?.data?.detail || err.message}`
      );
      console.error("Error updating profile:", err.response?.data || err);
    }
  };

  const handleRemoveBio = async () => {
    try {
      const response = await axios.patch(
        "/api/users/profile/",
        { bio: "" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      setFormData({ ...formData, bio: "" });
    } catch (err) {
      setError(
        `Failed to remove bio: ${err.response?.data?.detail || err.message}`
      );
      console.error("Error removing bio:", err.response?.data || err);
    }
  };

  const handleSendFriendRequest = async (targetUserId) => {
    try {
      const response = await axios.post(
        "/api/social/friendships/",
        { user2: targetUserId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecommendedFriends((prev) =>
        prev.filter((u) => u.id !== targetUserId)
      );
    } catch (err) {
      setError(
        `Failed to send friend request: ${
          err.response?.data?.error || err.message
        }`
      );
      console.error("Error sending friend request:", err.response?.data || err);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      await axios.post(
        `/api/community/communities/${communityId}/join/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecommendedCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId
            ? { ...c, members: [...(c.members || []), { id: userId }] }
            : c
        )
      );
      setCommunities((prev) => {
        const community = recommendedCommunities.find(
          (c) => c.id === communityId
        );
        return community ? [...prev, community] : prev;
      });
    } catch (err) {
      setError(
        `Failed to join community: ${err.response?.data?.error || err.message}`
      );
      console.error("Error joining community:", err.response?.data || err);
    }
  };

  // Memoized rendering for friends, communities, and recommendations
  const friendList = useMemo(() => {
    return friendships
      .filter(
        (friendship) => friendship.status === "accepted" || !friendship.status
      )
      .map((friendship) => {
        const friend =
          friendship.user1_details.id === userId
            ? friendship.user2_details
            : friendship.user1_details;
        return (
          <Link
            key={friendship.id}
            to={`/messages/${friend.id}`}
            aria-label={`Message ${friend.username}`}
          >
            <motion.li
              className="profile-card profile-friend"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="profile-friend-content">
                {imageError.friends[friendship.id] || !friend.avatar ? (
                  <div className="profile-avatar-placeholder">
                    <span className="profile-avatar-text">
                      {friend.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <img
                    src={friend.avatar || "https://placehold.co/50x50"}
                    alt={friend.username}
                    className="profile-avatar"
                    onError={() =>
                      setImageError((prev) => ({
                        ...prev,
                        friends: { ...prev.friends, [friendship.id]: true },
                      }))
                    }
                  />
                )}
                <span className="profile-text">{friend.username}</span>
              </div>
            </motion.li>
          </Link>
        );
      });
  }, [friendships, imageError.friends, userId]);

  const communityList = useMemo(() => {
    return communities.map((community) => (
      <Link
        key={community.id}
        to={`/community/${community.id}/forum`}
        aria-label={`Go to ${community.name} forum`}
      >
        <motion.li
          className="profile-card profile-community"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="profile-community-content">
            {imageError.communities[community.id] || !community.banner ? (
              <div className="profile-avatar-placeholder">
                <span className="profile-avatar-text">
                  {community.name.charAt(0).toUpperCase()}
                </span>
              </div>
            ) : (
              <img
                src={community.banner || "https://placehold.co/50x50"}
                alt={community.name}
                className="profile-avatar"
                onError={() =>
                  setImageError((prev) => ({
                    ...prev,
                    communities: { ...prev.communities, [community.id]: true },
                  }))
                }
              />
            )}
            <span className="profile-text">{community.name}</span>
          </div>
        </motion.li>
      </Link>
    ));
  }, [communities, imageError.communities]);

  const friendRecList = useMemo(() => {
    return recommendedFriends.map((friend) => (
      <motion.div
        key={friend.id}
        className="profile-card profile-recommendation"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="profile-title">{friend.username}</h3>
        <p className="profile-content">{friend.bio || "No bio"}</p>
        <motion.button
          onClick={() => handleSendFriendRequest(friend.id)}
          className="profile-button profile-friend-request"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Send Friend Request
        </motion.button>
      </motion.div>
    ));
  }, [recommendedFriends]);

  const communityRecList = useMemo(() => {
    return recommendedCommunities.map((community) => (
      <motion.div
        key={community.id}
        className="profile-card profile-recommendation"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="profile-title">{community.name}</h3>
        <p className="profile-content">
          {community.description || "No description"}
        </p>
        <Link
          to={`/community/${community.id}/forum`}
          className="profile-button profile-forum-link"
        >
          Go to Forum
        </Link>
        <motion.button
          onClick={() => handleJoinCommunity(community.id)}
          className="profile-button profile-join-community"
          disabled={community.members?.some((m) => m.id === userId)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {community.members?.some((m) => m.id === userId) ? "Joined" : "Join"}
        </motion.button>
      </motion.div>
    ));
  }, [recommendedCommunities, userId]);

  if (isLoading) {
    return (
      <div className="profile-page-wrapper">
        <motion.h1
          className="profile-main-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Loading Profile...
        </motion.h1>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      <div className="profile-container">
        <motion.h1
          className="profile-main-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your Profile
        </motion.h1>
        {error && (
          <motion.p
            className="profile-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {error}
          </motion.p>
        )}

        {/* Profile Section */}
        {user && (
          <motion.section
            className="profile-section"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="profile-user-content">
              {imageError.profile || !user.avatar ? (
                <div className="profile-user-avatar-placeholder">
                  <span className="profile-avatar-text">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <motion.img
                  src={user.avatar || "https://placehold.co/150x150"}
                  alt={user.username}
                  className="profile-user-avatar"
                  onError={() =>
                    setImageError((prev) => ({ ...prev, profile: true }))
                  }
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              )}
              <div className="profile-user-details">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="profile-form">
                    <div className="profile-form-group">
                      <label className="profile-label">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="profile-input"
                        required
                      />
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-label">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="profile-textarea"
                        rows="3"
                      />
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-label">Profile Picture</label>
                      <input
                        type="file"
                        name="avatar"
                        onChange={handleInputChange}
                        className="profile-file-input"
                        accept="image/*"
                      />
                    </div>
                    <div className="profile-form-actions">
                      <motion.button
                        type="submit"
                        className="profile-button profile-save"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Save
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="profile-button profile-cancel"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <h2 className="profile-title">{user.username}</h2>
                    {user.bio ? (
                      <p className="profile-content">{user.bio}</p>
                    ) : (
                      <p className="profile-content profile-empty">
                        No bio yet.
                      </p>
                    )}
                    <div className="profile-actions">
                      <motion.button
                        onClick={() => setIsEditing(true)}
                        className="profile-button profile-edit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Edit Profile
                      </motion.button>
                      {user.bio && (
                        <motion.button
                          onClick={handleRemoveBio}
                          className="profile-button profile-remove-bio"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Remove Bio
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* Friends Section */}
        <motion.section
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="profile-section-title">Friends</h2>
          {friendships.length > 0 ? (
            <ul className="profile-grid">{friendList}</ul>
          ) : (
            <p className="profile-empty">No friends yet.</p>
          )}
        </motion.section>

        {/* Recommended Friends Section */}
        <motion.section
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="profile-section-title">Recommended Friends</h2>
          {recommendedFriends.length > 0 ? (
            <div className="profile-grid">{friendRecList}</div>
          ) : (
            <p className="profile-empty">No recommended friends yet.</p>
          )}
        </motion.section>

        {/* Communities Section */}
        <motion.section
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="profile-section-title">Your Communities</h2>
          {communities.length > 0 ? (
            <ul className="profile-grid">{communityList}</ul>
          ) : (
            <p className="profile-empty">No communities yet.</p>
          )}
        </motion.section>

        {/* Recommended Communities Section */}
        <motion.section
          className="profile-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <h2 className="profile-section-title">Recommended Communities</h2>
          {recommendedCommunities.length > 0 ? (
            <div className="profile-grid">{communityRecList}</div>
          ) : (
            <p className="profile-empty">No communities recommended yet.</p>
          )}
        </motion.section>
      </div>
    </div>
  );
}
