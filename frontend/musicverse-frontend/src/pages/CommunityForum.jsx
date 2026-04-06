// frontend/musicverse-frontend/src/pages/CommunityForum.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import "../styles/CommunityForum.css";

export default function CommunityForum() {
  const { communityId } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newComment, setNewComment] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    const fetchCommunityAndPosts = async () => {
      setLoading(true);
      try {
        const [communityResponse, postsResponse] = await Promise.all([
          axios.get(`/api/community/communities/${communityId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/community/posts/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        console.log("Community Response:", communityResponse.data); // Debug
        console.log("Posts Response:", postsResponse.data); // Debug
        setCommunity(communityResponse.data);
        const id = parseInt(communityId);
        setPosts(
          postsResponse.data.filter((p) => p.community && p.community.id === id)
        );
      } catch (err) {
        const status = err.response?.status;
        const message =
          err.response?.data?.error ||
          err.response?.statusText ||
          "Failed to load data";
        setError(`Error: ${message} (Status: ${status || "Unknown"})`);
        console.error("Fetch error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunityAndPosts();
  }, [communityId]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please log in to post.");
      return;
    }
    try {
      const response = await axios.post(
        "/api/community/posts/",
        {
          community: communityId,
          title: newPostTitle,
          content: newPostContent,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts([response.data, ...posts]);
      setNewPostTitle("");
      setNewPostContent("");
    } catch (err) {
      setError(
        `Failed to create post: ${err.response?.data?.error || err.message}`
      );
      console.error(err.response?.data || err);
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please log in to comment.");
      return;
    }
    try {
      const response = await axios.post(
        `/api/community/comments/`,
        { post: postId, content: newComment[postId] || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? { ...p, comments: [...(p.comments || []), response.data] }
            : p
        )
      );
      setNewComment((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      setError(
        `Failed to create comment: ${err.response?.data?.error || err.message}`
      );
      console.error(err.response?.data || err);
    }
  };

  const handleCommentChange = (postId, value) => {
    setNewComment((prev) => ({ ...prev, [postId]: value }));
  };

  // Memoize post list rendering
  const postList = useMemo(() => {
    return posts.map((post) => (
      <motion.div
        key={post.id}
        className="community-forum-card community-forum-post"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="community-forum-title">{post.title}</h3>
        <p className="community-forum-content">{post.content}</p>
        <p className="community-forum-meta">
          By {post.author?.username || "Unknown"} -{" "}
          {new Date(post.created_at).toLocaleString()}
        </p>
        <motion.form
          onSubmit={(e) => handleCommentSubmit(post.id, e)}
          className="community-forum-comment-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <textarea
            value={newComment[post.id] || ""}
            onChange={(e) => handleCommentChange(post.id, e.target.value)}
            placeholder="Write a comment..."
            className="community-forum-textarea"
          />
          <motion.button
            type="submit"
            className="community-forum-button community-forum-comment"
            disabled={!newComment[post.id] || loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Comment
          </motion.button>
        </motion.form>
        <div className="community-forum-comments">
          <h4 className="community-forum-section-title">Comments</h4>
          {post.comments?.length > 0 ? (
            post.comments.map((comment) => (
              <motion.div
                key={comment.id}
                className="community-forum-comment-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="community-forum-comment-content">
                  {comment.content}
                </p>
                <p className="community-forum-comment-meta">
                  {comment.author?.username || "Unknown"} -{" "}
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </motion.div>
            ))
          ) : (
            <p className="community-forum-no-comments">No comments yet</p>
          )}
        </div>
      </motion.div>
    ));
  }, [posts, newComment, loading]);

  return (
    <div className="community-forum-page-wrapper">
      <div className="community-forum-container">
        <motion.h1
          className="community-forum-main-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {loading ? "Loading Forum..." : community?.name || "Forum Not Found"}{" "}
          Forum
        </motion.h1>
        {loading ? (
          <motion.p
            className="community-forum-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading...
          </motion.p>
        ) : error ? (
          <motion.p
            className="community-forum-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        ) : community ? (
          <>
            <motion.form
              onSubmit={handlePostSubmit}
              className="community-forum-post-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Post title"
                className="community-forum-input"
              />
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Write a new post..."
                className="community-forum-textarea"
              />
              <motion.button
                type="submit"
                className="community-forum-button community-forum-post"
                disabled={!newPostTitle || !newPostContent || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Post
              </motion.button>
            </motion.form>
            {posts.length > 0 ? (
              <div className="community-forum-posts">{postList}</div>
            ) : (
              <motion.p
                className="community-forum-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No posts yet. Be the first to post!
              </motion.p>
            )}
          </>
        ) : (
          <motion.p
            className="community-forum-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Community not found or inaccessible.
          </motion.p>
        )}
      </div>
    </div>
  );
}
