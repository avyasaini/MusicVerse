// // frontend/musicverse-frontend/src/pages/Communities.jsx
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";

// export default function Communities() {
//   const [communities, setCommunities] = useState([]);
//   const [newPost, setNewPost] = useState({});
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const token = localStorage.getItem("access_token");
//     const fetchCommunities = async () => {
//       try {
//         const response = await axios.get("/api/community/communities/", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setCommunities(response.data);
//       } catch (err) {
//         setError("Failed to load communities");
//         console.error("Communities fetch error:", err.response?.data || err);
//       }
//     };
//     fetchCommunities();
//   }, []);

//   const handleJoinCommunity = (communityId) => {
//     const token = localStorage.getItem("access_token");
//     axios
//       .post(
//         `/api/community/communities/${communityId}/join/`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       )
//       .then((response) => {
//         setCommunities((prev) =>
//           prev.map((c) =>
//             c.id === communityId ? { ...c, members: response.data.members } : c
//           )
//         );
//         alert("Joined community!");
//       })
//       .catch((err) => {
//         setError(err.response?.data?.error || "Failed to join community");
//         console.error(err.response?.data || err);
//       });
//   };

//   const handlePostSubmit = (e, communityId) => {
//     e.preventDefault();
//     const token = localStorage.getItem("access_token");
//     axios
//       .post(
//         "/api/community/posts/",
//         {
//           community: communityId,
//           title: "New Post",
//           content: newPost[communityId] || "",
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       )
//       .then(() => {
//         setNewPost((prev) => ({ ...prev, [communityId]: "" }));
//         alert("Post created!");
//       })
//       .catch((err) => {
//         setError("Failed to create post");
//         console.error(err.response?.data || err);
//       });
//   };

//   const handlePostChange = (communityId, value) => {
//     setNewPost((prev) => ({ ...prev, [communityId]: value }));
//   };

//   return (
//     <div className="container mx-auto p-4 max-w-4xl">
//       <h1 className="text-3xl font-bold mb-6">Communities</h1>
//       {error && <p className="text-red-500 text-center">{error}</p>}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {communities.map((community) => (
//           <div key={community.id} className="bg-white p-4 rounded-lg shadow-md">
//             <h2 className="text-xl font-semibold mb-2">{community.name}</h2>
//             <p className="text-gray-600 mb-4">
//               {community.description || "No description"}
//             </p>
//             <Link
//               to={`/community/${community.id}/forum`}
//               className="mb-2 block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Go to Forum
//             </Link>
//             <button
//               onClick={() => handleJoinCommunity(community.id)}
//               className="mb-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//               disabled={community.members.some(
//                 (m) => m.id === parseInt(localStorage.getItem("user_id"))
//               )}
//             >
//               {community.members.some(
//                 (m) => m.id === parseInt(localStorage.getItem("user_id"))
//               )
//                 ? "Joined"
//                 : "Join"}
//             </button>
//             <form
//               onSubmit={(e) => handlePostSubmit(e, community.id)}
//               className="mt-4"
//             >
//               <textarea
//                 value={newPost[community.id] || ""}
//                 onChange={(e) => handlePostChange(community.id, e.target.value)}
//                 placeholder="Write a post..."
//                 className="w-full p-2 border rounded mb-2"
//               />
//               <button
//                 type="submit"
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                 disabled={!newPost[community.id]}
//               >
//                 Post
//               </button>
//             </form>
//             <div className="mt-4">
//               <h3 className="text-lg font-semibold mb-2">Members</h3>
//               <ul className="list-disc pl-5">
//                 {community.members.map((member) => (
//                   <li key={member.id} className="mb-1">
//                     {member.username}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         ))}
//       </div>
//       {communities.length === 0 && (
//         <p className="text-gray-500 text-center">
//           No recommended communities yet.
//         </p>
//       )}
//     </div>
//   );
// }

import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import "../styles/Communities.css";

export default function Communities() {
  const [communities, setCommunities] = useState([]);
  const [newPost, setNewPost] = useState({});
  const [newPostTitle, setNewPostTitle] = useState({}); // New state for post titles
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    const fetchCommunities = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/community/communities/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCommunities(response.data);
      } catch (err) {
        setError("Failed to load communities");
        console.error("Communities fetch error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  const handleJoinCommunity = async (communityId) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.post(
        `/api/community/communities/${communityId}/join/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === communityId ? { ...c, members: response.data.members } : c
        )
      );
      alert("Joined community!");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join community");
      console.error(err.response?.data || err);
    }
  };

  const handlePostSubmit = async (e, communityId) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    try {
      await axios.post(
        "/api/community/posts/",
        {
          community: communityId,
          title: newPostTitle[communityId] || "New Post",
          content: newPost[communityId] || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPost((prev) => ({ ...prev, [communityId]: "" }));
      setNewPostTitle((prev) => ({ ...prev, [communityId]: "" }));
      alert("Post created!");
    } catch (err) {
      setError("Failed to create post");
      console.error(err.response?.data || err);
    }
  };

  const handlePostChange = (communityId, field, value) => {
    if (field === "title") {
      setNewPostTitle((prev) => ({ ...prev, [communityId]: value }));
    } else {
      setNewPost((prev) => ({ ...prev, [communityId]: value }));
    }
  };

  // Memoize community list rendering
  const communityList = useMemo(() => {
    return communities.map((community) => (
      <motion.div
        key={community.id}
        className="communities-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="communities-title">{community.name}</h2>
        <p className="communities-description">
          {community.description || "No description"}
        </p>
        <Link
          to={`/community/${community.id}/forum`}
          className="communities-button communities-forum"
        >
          Go to Forum
        </Link>
        <motion.button
          onClick={() => handleJoinCommunity(community.id)}
          className={`communities-button communities-join ${
            community.members.some(
              (m) => m.id === parseInt(localStorage.getItem("user_id"))
            )
              ? "communities-joined"
              : ""
          }`}
          disabled={community.members.some(
            (m) => m.id === parseInt(localStorage.getItem("user_id"))
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {community.members.some(
            (m) => m.id === parseInt(localStorage.getItem("user_id"))
          )
            ? "Joined"
            : "Join"}
        </motion.button>
        <motion.form
          onSubmit={(e) => handlePostSubmit(e, community.id)}
          className="communities-post-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <input
            type="text"
            value={newPostTitle[community.id] || ""}
            onChange={(e) =>
              handlePostChange(community.id, "title", e.target.value)
            }
            placeholder="Post title"
            className="communities-input"
          />
          <textarea
            value={newPost[community.id] || ""}
            onChange={(e) =>
              handlePostChange(community.id, "content", e.target.value)
            }
            placeholder="Write a post..."
            className="communities-textarea"
          />
          <motion.button
            type="submit"
            className="communities-button communities-post"
            disabled={!newPost[community.id] || !newPostTitle[community.id]}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Post
          </motion.button>
        </motion.form>
        <div className="communities-members">
          <h3 className="communities-section-title">Members</h3>
          <ul className="communities-member-list">
            {community.members.map((member) => (
              <li key={member.id} className="communities-member-item">
                {member.username}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    ));
  }, [communities, newPost, newPostTitle]);

  return (
    <div className="communities-page-wrapper">
      <div className="communities-container">
        <motion.h1
          className="communities-main-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Communities
        </motion.h1>
        {loading ? (
          <motion.p
            className="communities-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading...
          </motion.p>
        ) : error ? (
          <motion.p
            className="communities-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        ) : (
          <div
            className="communities-grid"
            data-community-count={communities.length}
          >
            {communities.length > 0 ? (
              communityList
            ) : (
              <motion.p
                className="communities-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No recommended communities yet.
              </motion.p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
