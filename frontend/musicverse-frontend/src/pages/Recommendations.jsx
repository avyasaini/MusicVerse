// frontend/musicverse-frontend/src/pages/Recommendations.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Recommendations() {
  const [songs, setSongs] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const [songsResponse, communitiesResponse] = await Promise.all([
          axios.get("/api/music/songs/recommend/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/community/communities/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setSongs(songsResponse.data);
        setCommunities(communitiesResponse.data);
      } catch (err) {
        setError(
          `Failed to load recommendations: ${
            err.response?.data?.error || err.message
          }`
        );
        console.error(
          "Recommendations fetch error:",
          err.response?.data || err
        );
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const handleJoinCommunity = (communityId) => {
    const token = localStorage.getItem("access_token");
    axios
      .post(
        `/api/community/communities/${communityId}/join/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => alert("Joined community!"))
      .catch((err) => console.error("Join failed:", err));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Recommended for You</h1>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Recommended Songs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="bg-white p-4 rounded-lg shadow-md"
                >
                  <h3 className="text-lg font-semibold">{song.name}</h3>
                  <p className="text-gray-600">{song.artist.name}</p>
                  {song.audio_file ? (
                    <audio controls className="w-full mt-4">
                      <source src={song.audio_file} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <p className="text-gray-500 mt-4">No audio available</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              Recommended Communities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.length > 0 ? (
                communities.map((community) => (
                  <div
                    key={community.id}
                    className="bg-white p-4 rounded-lg shadow-md"
                  >
                    <h3 className="text-lg font-semibold">{community.name}</h3>
                    <p className="text-gray-600">
                      {community.description || "No description"}
                    </p>
                    <Link
                      to={`/community/${community.id}/forum`}
                      className="mt-4 block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Go to Forum
                    </Link>
                    <button
                      onClick={() => handleJoinCommunity(community.id)}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      disabled={community.members.some(
                        (m) =>
                          m.id === parseInt(localStorage.getItem("user_id"))
                      )}
                    >
                      {community.members.some(
                        (m) =>
                          m.id === parseInt(localStorage.getItem("user_id"))
                      )
                        ? "Joined"
                        : "Join"}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">
                  No communities recommended yet.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
