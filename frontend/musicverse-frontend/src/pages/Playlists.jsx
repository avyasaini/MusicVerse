// import { useEffect, useState, useRef, useMemo } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import {
//   FaMusic,
//   FaPlay,
//   FaPause,
//   FaBackward,
//   FaForward,
//   FaTrash,
//   FaEdit,
// } from "react-icons/fa";
// import Slider from "rc-slider";
// import "rc-slider/assets/index.css";
// import "../styles/Playlists.css";

// export default function Playlists() {
//   const [playlists, setPlaylists] = useState([]);
//   const [songs, setSongs] = useState([]);
//   const [newPlaylistName, setNewPlaylistName] = useState("");
//   const [editPlaylistId, setEditPlaylistId] = useState(null);
//   const [editPlaylistName, setEditPlaylistName] = useState("");
//   const [selectedSongs, setSelectedSongs] = useState({});
//   const [currentSongIndex, setCurrentSongIndex] = useState({});
//   const [isPlaying, setIsPlaying] = useState({});
//   const [previousSongs, setPreviousSongs] = useState({}); // Track previous songs per playlist
//   const [progress, setProgress] = useState({});
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);
//   const audioRefs = useRef({});

//   useEffect(() => {
//     const token = localStorage.getItem("access_token");
//     if (!token) {
//       setError("No authentication token found. Please log in.");
//       setLoading(false);
//       return;
//     }

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const [playlistsResponse, songsResponse] = await Promise.all([
//           axios.get("/api/music/playlists/", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("/api/music/songs/", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);
//         setPlaylists(playlistsResponse.data);
//         setSongs(songsResponse.data);
//       } catch (err) {
//         setError("Failed to load playlists or songs");
//         console.error("Fetch error:", err.response?.data || err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const createPlaylist = async (e) => {
//     e.preventDefault();
//     if (!newPlaylistName.trim()) {
//       setError("Playlist name cannot be empty");
//       return;
//     }
//     const token = localStorage.getItem("access_token");
//     try {
//       await axios.post(
//         "/api/music/playlists/",
//         { name: newPlaylistName.trim() },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setNewPlaylistName("");
//       const response = await axios.get("/api/music/playlists/", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setPlaylists(response.data);
//       setError("");
//     } catch (err) {
//       setError("Failed to create playlist");
//       console.error("Playlist creation error:", err.response?.data || err);
//     }
//   };

//   const deletePlaylist = async (playlistId) => {
//     const token = localStorage.getItem("access_token");
//     if (window.confirm("Are you sure you want to delete this playlist?")) {
//       try {
//         await axios.delete(`/api/music/playlists/${playlistId}/`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setPlaylists(playlists.filter((p) => p.id !== playlistId));
//         setSelectedSongs((prev) => {
//           const newSelected = { ...prev };
//           delete newSelected[playlistId];
//           return newSelected;
//         });
//         setError("");
//       } catch (err) {
//         setError("Failed to delete playlist");
//         console.error("Playlist deletion error:", err.response?.data || err);
//       }
//     }
//   };

//   const startEditPlaylist = (playlistId, currentName) => {
//     setEditPlaylistId(playlistId);
//     setEditPlaylistName(currentName);
//   };

//   const saveEditPlaylist = async (playlistId) => {
//     if (!editPlaylistName.trim()) {
//       setError("Playlist name cannot be empty");
//       return;
//     }
//     const token = localStorage.getItem("access_token");
//     try {
//       await axios.patch(
//         `/api/music/playlists/${playlistId}/`,
//         { name: editPlaylistName.trim() },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setEditPlaylistId(null);
//       setEditPlaylistName("");
//       const response = await axios.get("/api/music/playlists/", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setPlaylists(response.data);
//       setError("");
//     } catch (err) {
//       setError("Failed to update playlist");
//       console.error("Playlist update error:", err.response?.data || err);
//     }
//   };

//   const cancelEditPlaylist = () => {
//     setEditPlaylistId(null);
//     setEditPlaylistName("");
//   };

//   const toggleSongSelection = (playlistId, songId) => {
//     setSelectedSongs((prev) => {
//       const current = prev[playlistId] || [];
//       if (current.includes(songId)) {
//         return { ...prev, [playlistId]: current.filter((id) => id !== songId) };
//       }
//       return { ...prev, [playlistId]: [...current, songId] };
//     });
//   };

//   const addSongsToPlaylist = async (playlistId) => {
//     const token = localStorage.getItem("access_token");
//     const songIds = selectedSongs[playlistId] || [];
//     if (songIds.length === 0) {
//       setError("Please select at least one song");
//       return;
//     }
//     try {
//       for (const songId of songIds) {
//         await axios.post(
//           `/api/music/playlists/${playlistId}/add_song/`,
//           { song_id: parseInt(songId) },
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//       }
//       setSelectedSongs((prev) => ({ ...prev, [playlistId]: [] }));
//       const response = await axios.get("/api/music/playlists/", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setPlaylists(response.data);
//       setError("");
//     } catch (err) {
//       setError("Failed to add songs");
//       console.error("Add songs error:", err.response?.data || err);
//     }
//   };

//   const playSong = (playlistId, index, addToHistory = true) => {
//     const playlist = playlists.find((p) => p.id === playlistId);
//     if (!playlist || !playlist.songs[index]) return;

//     const audio = audioRefs.current[playlistId];
//     if (audio) {
//       if (
//         currentSongIndex[playlistId] === index &&
//         isPlaying[playlistId] &&
//         selectedSongId === playlist.songs[index].id
//       ) {
//         audio.pause();
//         setIsPlaying((prev) => ({ ...prev, [playlistId]: false }));
//       } else {
//         const song = playlist.songs[index];
//         audio.src = song.audio_file || "";
//         setCurrentSongIndex((prev) => ({ ...prev, [playlistId]: index }));
//         setSelectedSongId(song.id);
//         if (addToHistory && currentSongIndex[playlistId] !== undefined) {
//           const currentSong = playlist.songs[currentSongIndex[playlistId]];
//           if (currentSong) {
//             setPreviousSongs((prev) => ({
//               ...prev,
//               [playlistId]: [currentSong, ...(prev[playlistId] || [])],
//             }));
//           }
//         }
//         audio
//           .play()
//           .then(() => {
//             setIsPlaying((prev) => ({ ...prev, [playlistId]: true }));
//           })
//           .catch((err) => console.error("Play error:", err));
//       }
//     }
//   };

//   const pauseSong = (playlistId) => {
//     const audio = audioRefs.current[playlistId];
//     if (audio && isPlaying[playlistId]) {
//       audio.pause();
//       setIsPlaying((prev) => ({ ...prev, [playlistId]: false }));
//     }
//   };

//   const nextSong = (playlistId) => {
//     const playlist = playlists.find((p) => p.id === playlistId);
//     if (playlist && currentSongIndex[playlistId] < playlist.songs.length - 1) {
//       playSong(playlistId, currentSongIndex[playlistId] + 1);
//     } else {
//       pauseSong(playlistId);
//     }
//   };

//   const previousSong = (playlistId) => {
//     const prevSongs = previousSongs[playlistId] || [];
//     if (prevSongs.length > 0) {
//       const prevSong = prevSongs[0];
//       const playlist = playlists.find((p) => p.id === playlistId);
//       const index = playlist.songs.findIndex((s) => s.id === prevSong.id);
//       if (index !== -1) {
//         setPreviousSongs((prev) => ({
//           ...prev,
//           [playlistId]: prev[playlistId].slice(1),
//         }));
//         playSong(playlistId, index, false);
//         setCurrentSongIndex((prev) => ({ ...prev, [playlistId]: index }));
//       }
//     } else if (currentSongIndex[playlistId] > 0) {
//       playSong(playlistId, currentSongIndex[playlistId] - 1);
//     }
//   };

//   const handleSeek = (playlistId, value) => {
//     const audio = audioRefs.current[playlistId];
//     if (audio && audio.duration) {
//       const newTime = (value / 100) * audio.duration;
//       audio.currentTime = newTime;
//       setProgress((prev) => ({ ...prev, [playlistId]: value }));
//     }
//   };

//   useEffect(() => {
//     const handleTimeUpdate = (playlistId) => {
//       const audio = audioRefs.current[playlistId];
//       if (audio && audio.duration) {
//         setProgress((prev) => ({
//           ...prev,
//           [playlistId]: (audio.currentTime / audio.duration) * 100,
//         }));
//       }
//     };

//     Object.keys(audioRefs.current).forEach((playlistId) => {
//       const audio = audioRefs.current[playlistId];
//       if (audio) {
//         audio.addEventListener("timeupdate", () =>
//           handleTimeUpdate(playlistId)
//         );
//         audio.addEventListener("ended", () => nextSong(playlistId));
//       }
//     });

//     return () => {
//       Object.keys(audioRefs.current).forEach((playlistId) => {
//         const audio = audioRefs.current[playlistId];
//         if (audio) {
//           audio.removeEventListener("timeupdate", () =>
//             handleTimeUpdate(playlistId)
//           );
//           audio.removeEventListener("ended", () => nextSong(playlistId));
//         }
//       });
//     };
//   }, [playlists]);

//   // Memoize playlist rendering
//   const playlistList = useMemo(() => {
//     return playlists.map((playlist) => (
//       <motion.div
//         key={playlist.id}
//         className="playlists-card"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//       >
//         {editPlaylistId === playlist.id ? (
//           <div className="playlists-edit-form">
//             <input
//               type="text"
//               value={editPlaylistName}
//               onChange={(e) => setEditPlaylistName(e.target.value)}
//               className="playlists-input"
//               autoFocus
//             />
//             <div className="playlists-button-group">
//               <motion.button
//                 onClick={() => saveEditPlaylist(playlist.id)}
//                 className="playlists-button playlists-save"
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Save
//               </motion.button>
//               <motion.button
//                 onClick={cancelEditPlaylist}
//                 className="playlists-button playlists-cancel"
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Cancel
//               </motion.button>
//             </div>
//           </div>
//         ) : (
//           <div className="playlists-header">
//             <h2 className="playlists-title">{playlist.name}</h2>
//             <div className="playlists-actions">
//               <motion.button
//                 onClick={() => startEditPlaylist(playlist.id, playlist.name)}
//                 className="playlists-button playlists-edit"
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//                 title="Edit Playlist"
//               >
//                 <FaEdit size={16} />
//               </motion.button>
//               <motion.button
//                 onClick={() => deletePlaylist(playlist.id)}
//                 className="playlists-button playlists-delete"
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.95 }}
//                 title="Delete Playlist"
//               >
//                 <FaTrash size={16} />
//               </motion.button>
//             </div>
//           </div>
//         )}
//         <p className="playlists-info">Songs: {playlist.songs.length}</p>
//         {playlist.songs.length > 0 && (
//           <div className="playlists-player">
//             <h3 className="playlists-section-title">Now Playing</h3>
//             <motion.div
//               className="playlists-song-card"
//               whileHover={{ scale: 1.05 }}
//               transition={{ type: "spring", stiffness: 300 }}
//             >
//               {playlist.songs[currentSongIndex[playlist.id] || 0]?.cover ? (
//                 <img
//                   src={playlist.songs[currentSongIndex[playlist.id] || 0].cover}
//                   alt={playlist.songs[currentSongIndex[playlist.id] || 0].name}
//                   className="playlists-song-image"
//                 />
//               ) : (
//                 <div className="playlists-song-placeholder">
//                   <FaMusic size={60} />
//                 </div>
//               )}
//               <h4 className="playlists-song-title">
//                 {playlist.songs[currentSongIndex[playlist.id] || 0]?.name ||
//                   "None"}
//               </h4>
//               <p className="playlists-song-artist">
//                 {playlist.songs[currentSongIndex[playlist.id] || 0]?.artist
//                   .name || "Unknown"}
//               </p>
//               <div className="playlists-song-buttons">
//                 <motion.button
//                   onClick={() =>
//                     playSong(playlist.id, currentSongIndex[playlist.id] || 0)
//                   }
//                   className="playlists-button playlists-play"
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   title={isPlaying[playlist.id] ? "Pause" : "Play"}
//                 >
//                   {isPlaying[playlist.id] ? (
//                     <FaPause size={16} />
//                   ) : (
//                     <FaPlay size={16} />
//                   )}
//                 </motion.button>
//                 <motion.button
//                   onClick={() => previousSong(playlist.id)}
//                   className="playlists-button playlists-previous"
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   title="Previous"
//                   disabled={
//                     (currentSongIndex[playlist.id] === 0 &&
//                       !previousSongs[playlist.id]?.length) ||
//                     currentSongIndex[playlist.id] === undefined
//                   }
//                 >
//                   <FaBackward size={16} />
//                 </motion.button>
//                 <motion.button
//                   onClick={() => nextSong(playlist.id)}
//                   className="playlists-button playlists-next"
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   title="Next"
//                   disabled={
//                     currentSongIndex[playlist.id] ===
//                       playlist.songs.length - 1 ||
//                     currentSongIndex[playlist.id] === undefined
//                   }
//                 >
//                   <FaForward size={16} />
//                 </motion.button>
//               </div>
//               <Slider
//                 value={progress[playlist.id] || 0}
//                 onChange={(value) => handleSeek(playlist.id, value)}
//                 min={0}
//                 max={100}
//                 className="playlists-slider"
//                 trackStyle={{ backgroundColor: "var(--celadon)" }}
//                 handleStyle={{
//                   borderColor: "var(--celadon)",
//                   backgroundColor: "var(--platinum)",
//                 }}
//                 railStyle={{ backgroundColor: "var(--thistle)" }}
//               />
//             </motion.div>
//           </div>
//         )}
//         <div className="playlists-add-songs">
//           <h3 className="playlists-section-title">Add Songs</h3>
//           <div className="playlists-song-grid">
//             {songs.map((song) => (
//               <motion.div
//                 key={song.id}
//                 className="playlists-song-card"
//                 whileHover={{ scale: 1.05 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <input
//                   type="checkbox"
//                   checked={(selectedSongs[playlist.id] || []).includes(song.id)}
//                   onChange={() => toggleSongSelection(playlist.id, song.id)}
//                   className="playlists-checkbox"
//                 />
//                 {song.cover ? (
//                   <img
//                     src={song.cover}
//                     alt={song.name}
//                     className="playlists-song-image"
//                   />
//                 ) : (
//                   <div className="playlists-song-placeholder">
//                     <FaMusic size={60} />
//                   </div>
//                 )}
//                 <h4 className="playlists-song-title">{song.name}</h4>
//                 <p className="playlists-song-artist">{song.artist.name}</p>
//               </motion.div>
//             ))}
//           </div>
//           <motion.button
//             onClick={() => addSongsToPlaylist(playlist.id)}
//             className="playlists-button playlists-add"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             disabled={!(selectedSongs[playlist.id]?.length > 0)}
//           >
//             Add Selected Songs
//           </motion.button>
//         </div>
//         <audio
//           ref={(el) => (audioRefs.current[playlist.id] = el)}
//           onPlay={() =>
//             setIsPlaying((prev) => ({ ...prev, [playlist.id]: true }))
//           }
//           onPause={() =>
//             setIsPlaying((prev) => ({ ...prev, [playlist.id]: false }))
//           }
//         />
//       </motion.div>
//     ));
//   }, [
//     playlists,
//     selectedSongs,
//     isPlaying,
//     currentSongIndex,
//     progress,
//     previousSongs,
//   ]);

//   return (
//     <div className="playlists-page-wrapper">
//       <div className="playlists-container">
//         <motion.h1
//           className="playlists-main-title"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           Your Playlists
//         </motion.h1>

//         {loading ? (
//           <motion.p
//             className="playlists-loading"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             Loading...
//           </motion.p>
//         ) : error ? (
//           <motion.p
//             className="playlists-error"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             {error}
//           </motion.p>
//         ) : (
//           <>
//             {/* Playlist Creation Form */}
//             <motion.section
//               className="playlists-create-form"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.2, duration: 0.6 }}
//             >
//               <h2 className="playlists-section-title">Create New Playlist</h2>
//               <form onSubmit={createPlaylist} className="playlists-form">
//                 <input
//                   type="text"
//                   value={newPlaylistName}
//                   onChange={(e) => setNewPlaylistName(e.target.value)}
//                   placeholder="Enter playlist name"
//                   className="playlists-input"
//                   required
//                 />
//                 <motion.button
//                   type="submit"
//                   className="playlists-button playlists-create"
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   Create
//                 </motion.button>
//               </form>
//             </motion.section>

//             {/* Playlists List */}
//             {playlists.length > 0 ? (
//               playlistList
//             ) : (
//               <motion.p
//                 className="playlists-empty"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 No playlists yet. Create one above!
//               </motion.p>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaMusic,
  FaPlay,
  FaPause,
  FaBackward,
  FaForward,
  FaTrash,
  FaEdit,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../styles/Playlists.css";

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [editPlaylistId, setEditPlaylistId] = useState(null);
  const [editPlaylistName, setEditPlaylistName] = useState("");
  const [selectedSongs, setSelectedSongs] = useState({});
  const [currentSongIndex, setCurrentSongIndex] = useState({});
  const [isPlaying, setIsPlaying] = useState({});
  const [previousSongs, setPreviousSongs] = useState({});
  const [progress, setProgress] = useState({});
  const [showSongList, setShowSongList] = useState({}); // New state for song list visibility
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const audioRefs = useRef({});

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [playlistsResponse, songsResponse] = await Promise.all([
          axios.get("/api/music/playlists/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/music/songs/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setPlaylists(playlistsResponse.data);
        setSongs(songsResponse.data);
        // Initialize showSongList for new playlists
        setShowSongList(
          playlistsResponse.data.reduce(
            (acc, playlist) => ({
              ...acc,
              [playlist.id]: true,
            }),
            {}
          )
        );
      } catch (err) {
        setError("Failed to load playlists or songs");
        console.error("Fetch error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      setError("Playlist name cannot be empty");
      return;
    }
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.post(
        "/api/music/playlists/",
        { name: newPlaylistName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPlaylistName("");
      const playlistsResponse = await axios.get("/api/music/playlists/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(playlistsResponse.data);
      setShowSongList((prev) => ({
        ...prev,
        [response.data.id]: true, // Show song list for new playlist
      }));
      setError("");
    } catch (err) {
      setError("Failed to create playlist");
      console.error("Playlist creation error:", err.response?.data || err);
    }
  };

  const deletePlaylist = async (playlistId) => {
    const token = localStorage.getItem("access_token");
    if (window.confirm("Are you sure you want to delete this playlist?")) {
      try {
        await axios.delete(`/api/music/playlists/${playlistId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlaylists(playlists.filter((p) => p.id !== playlistId));
        setSelectedSongs((prev) => {
          const newSelected = { ...prev };
          delete newSelected[playlistId];
          return newSelected;
        });
        setShowSongList((prev) => {
          const newShow = { ...prev };
          delete newShow[playlistId];
          return newShow;
        });
        setError("");
      } catch (err) {
        setError("Failed to delete playlist");
        console.error("Playlist deletion error:", err.response?.data || err);
      }
    }
  };

  const startEditPlaylist = (playlistId, currentName) => {
    setEditPlaylistId(playlistId);
    setEditPlaylistName(currentName);
    setShowSongList((prev) => ({ ...prev, [playlistId]: true })); // Show song list on edit
  };

  const saveEditPlaylist = async (playlistId) => {
    if (!editPlaylistName.trim()) {
      setError("Playlist name cannot be empty");
      return;
    }
    const token = localStorage.getItem("access_token");
    try {
      await axios.patch(
        `/api/music/playlists/${playlistId}/`,
        { name: editPlaylistName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditPlaylistId(null);
      setEditPlaylistName("");
      const response = await axios.get("/api/music/playlists/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(response.data);
      setError("");
    } catch (err) {
      setError("Failed to update playlist");
      console.error("Playlist update error:", err.response?.data || err);
    }
  };

  const cancelEditPlaylist = () => {
    setEditPlaylistId(null);
    setEditPlaylistName("");
  };

  const toggleSongSelection = (playlistId, songId) => {
    setSelectedSongs((prev) => {
      const current = prev[playlistId] || [];
      if (current.includes(songId)) {
        return { ...prev, [playlistId]: current.filter((id) => id !== songId) };
      }
      return { ...prev, [playlistId]: [...current, songId] };
    });
  };

  const addSongsToPlaylist = async (playlistId) => {
    const token = localStorage.getItem("access_token");
    const songIds = selectedSongs[playlistId] || [];
    if (songIds.length === 0) {
      setError("Please select at least one song");
      return;
    }
    try {
      for (const songId of songIds) {
        await axios.post(
          `/api/music/playlists/${playlistId}/add_song/`,
          { song_id: parseInt(songId) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setSelectedSongs((prev) => ({ ...prev, [playlistId]: [] }));
      setShowSongList((prev) => ({ ...prev, [playlistId]: false })); // Hide song list
      const response = await axios.get("/api/music/playlists/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(response.data);
      setError("");
    } catch (err) {
      setError("Failed to add songs");
      console.error("Add songs error:", err.response?.data || err);
    }
  };

  const playSong = (playlistId, index, addToHistory = true) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist || !playlist.songs[index]) return;

    const audio = audioRefs.current[playlistId];
    if (audio) {
      if (currentSongIndex[playlistId] === index && isPlaying[playlistId]) {
        audio.pause();
        setIsPlaying((prev) => ({ ...prev, [playlistId]: false }));
      } else {
        const song = playlist.songs[index];
        audio.src = song.audio_file || "";
        setCurrentSongIndex((prev) => ({ ...prev, [playlistId]: index }));
        if (addToHistory && currentSongIndex[playlistId] !== undefined) {
          const currentSong = playlist.songs[currentSongIndex[playlistId]];
          if (currentSong) {
            setPreviousSongs((prev) => ({
              ...prev,
              [playlistId]: [currentSong, ...(prev[playlistId] || [])],
            }));
          }
        }
        audio
          .play()
          .then(() => {
            setIsPlaying((prev) => ({ ...prev, [playlistId]: true }));
          })
          .catch((err) => console.error("Play error:", err));
      }
    }
  };

  const pauseSong = (playlistId) => {
    const audio = audioRefs.current[playlistId];
    if (audio && isPlaying[playlistId]) {
      audio.pause();
      setIsPlaying((prev) => ({ ...prev, [playlistId]: false }));
    }
  };

  const nextSong = (playlistId) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (playlist && currentSongIndex[playlistId] < playlist.songs.length - 1) {
      playSong(playlistId, currentSongIndex[playlistId] + 1);
    } else {
      pauseSong(playlistId);
    }
  };

  const previousSong = (playlistId) => {
    const prevSongs = previousSongs[playlistId] || [];
    if (prevSongs.length > 0) {
      const prevSong = prevSongs[0];
      const playlist = playlists.find((p) => p.id === playlistId);
      const index = playlist.songs.findIndex((s) => s.id === prevSong.id);
      if (index !== -1) {
        setPreviousSongs((prev) => ({
          ...prev,
          [playlistId]: prev[playlistId].slice(1),
        }));
        playSong(playlistId, index, false);
        setCurrentSongIndex((prev) => ({ ...prev, [playlistId]: index }));
      }
    } else if (currentSongIndex[playlistId] > 0) {
      playSong(playlistId, currentSongIndex[playlistId] - 1);
    }
  };

  const handleSeek = (playlistId, value) => {
    const audio = audioRefs.current[playlistId];
    if (audio && audio.duration) {
      const newTime = (value / 100) * audio.duration;
      audio.currentTime = newTime;
      setProgress((prev) => ({ ...prev, [playlistId]: value }));
    }
  };

  useEffect(() => {
    const handleTimeUpdate = (playlistId) => {
      const audio = audioRefs.current[playlistId];
      if (audio && audio.duration) {
        setProgress((prev) => ({
          ...prev,
          [playlistId]: (audio.currentTime / audio.duration) * 100,
        }));
      }
    };

    Object.keys(audioRefs.current).forEach((playlistId) => {
      const audio = audioRefs.current[playlistId];
      if (audio) {
        audio.addEventListener("timeupdate", () =>
          handleTimeUpdate(playlistId)
        );
        audio.addEventListener("ended", () => nextSong(playlistId));
      }
    });

    return () => {
      Object.keys(audioRefs.current).forEach((playlistId) => {
        const audio = audioRefs.current[playlistId];
        if (audio) {
          audio.removeEventListener("timeupdate", () =>
            handleTimeUpdate(playlistId)
          );
          audio.removeEventListener("ended", () => nextSong(playlistId));
        }
      });
    };
  }, [playlists]);

  // Filter songs based on search query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const query = searchQuery.toLowerCase();
    return songs.filter(
      (song) =>
        song.name.toLowerCase().includes(query) ||
        song.artist.name.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  // Memoize playlist rendering
  const playlistList = useMemo(() => {
    return playlists.map((playlist) => (
      <motion.div
        key={playlist.id}
        className="playlists-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {editPlaylistId === playlist.id ? (
          <div className="playlists-edit-form">
            <input
              type="text"
              value={editPlaylistName}
              onChange={(e) => setEditPlaylistName(e.target.value)}
              className="playlists-input"
              autoFocus
            />
            <div className="playlists-button-group">
              <motion.button
                onClick={() => saveEditPlaylist(playlist.id)}
                className="playlists-button playlists-save"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Save
              </motion.button>
              <motion.button
                onClick={cancelEditPlaylist}
                className="playlists-button playlists-cancel"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="playlists-header">
            <h2 className="playlists-title">{playlist.name}</h2>
            <div className="playlists-actions">
              <motion.button
                onClick={() => startEditPlaylist(playlist.id, playlist.name)}
                className="playlists-button playlists-edit"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Edit Playlist"
              >
                <FaEdit size={16} />
              </motion.button>
              <motion.button
                onClick={() => deletePlaylist(playlist.id)}
                className="playlists-button playlists-delete"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Delete Playlist"
              >
                <FaTrash size={16} />
              </motion.button>
            </div>
          </div>
        )}
        <p className="playlists-info">Songs: {playlist.songs.length}</p>
        {playlist.songs.length > 0 && (
          <div className="playlists-player">
            <h3 className="playlists-section-title">Now Playing</h3>
            <motion.div
              className="playlists-song-card"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {playlist.songs[currentSongIndex[playlist.id] || 0]?.cover ? (
                <img
                  src={playlist.songs[currentSongIndex[playlist.id] || 0].cover}
                  alt={playlist.songs[currentSongIndex[playlist.id] || 0].name}
                  className="playlists-song-image"
                />
              ) : (
                <div className="playlists-song-placeholder">
                  <FaMusic size={40} />
                </div>
              )}
              <h4 className="playlists-song-title">
                {playlist.songs[currentSongIndex[playlist.id] || 0]?.name ||
                  "None"}
              </h4>
              <p className="playlists-song-artist">
                {playlist.songs[currentSongIndex[playlist.id] || 0]?.artist
                  .name || "Unknown"}
              </p>
              <div className="playlists-song-buttons">
                <motion.button
                  onClick={() =>
                    playSong(playlist.id, currentSongIndex[playlist.id] || 0)
                  }
                  className="playlists-button playlists-play"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={isPlaying[playlist.id] ? "Pause" : "Play"}
                >
                  {isPlaying[playlist.id] ? (
                    <FaPause size={14} />
                  ) : (
                    <FaPlay size={14} />
                  )}
                </motion.button>
                <motion.button
                  onClick={() => previousSong(playlist.id)}
                  className="playlists-button playlists-previous"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Previous"
                  disabled={
                    (currentSongIndex[playlist.id] === 0 &&
                      !previousSongs[playlist.id]?.length) ||
                    currentSongIndex[playlist.id] === undefined
                  }
                >
                  <FaBackward size={14} />
                </motion.button>
                <motion.button
                  onClick={() => nextSong(playlist.id)}
                  className="playlists-button playlists-next"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title="Next"
                  disabled={
                    currentSongIndex[playlist.id] ===
                      playlist.songs.length - 1 ||
                    currentSongIndex[playlist.id] === undefined
                  }
                >
                  <FaForward size={14} />
                </motion.button>
              </div>
              <Slider
                value={progress[playlist.id] || 0}
                onChange={(value) => handleSeek(playlist.id, value)}
                min={0}
                max={100}
                className="playlists-slider"
                trackStyle={{ backgroundColor: "var(--celadon)" }}
                handleStyle={{
                  borderColor: "var(--celadon)",
                  backgroundColor: "var(--platinum)",
                }}
                railStyle={{ backgroundColor: "var(--thistle)" }}
              />
            </motion.div>
          </div>
        )}
        {showSongList[playlist.id] && (
          <div className="playlists-add-songs">
            <h3 className="playlists-section-title">Add Songs</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs or artists"
              className="playlists-input playlists-search"
            />
            <div className="playlists-song-list">
              {filteredSongs.length > 0 ? (
                filteredSongs.map((song) => (
                  <motion.div
                    key={song.id}
                    className="playlists-song-item"
                    whileHover={{ backgroundColor: "var(--thistle)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <span
                      className="playlists-song-name"
                      onClick={() => toggleSongSelection(playlist.id, song.id)}
                      style={{
                        color: (selectedSongs[playlist.id] || []).includes(
                          song.id
                        )
                          ? "var(--celadon)"
                          : "var(--pink-lavender)",
                      }}
                    >
                      {song.name}
                    </span>
                    <span className="playlists-song-artist">
                      {song.artist.name}
                    </span>
                    <motion.button
                      onClick={() => toggleSongSelection(playlist.id, song.id)}
                      className="playlists-button playlists-toggle"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title={
                        (selectedSongs[playlist.id] || []).includes(song.id)
                          ? "Remove"
                          : "Add"
                      }
                    >
                      {(selectedSongs[playlist.id] || []).includes(song.id) ? (
                        <FaMinus size={14} />
                      ) : (
                        <FaPlus size={14} />
                      )}
                    </motion.button>
                  </motion.div>
                ))
              ) : (
                <p className="playlists-no-songs">No songs found</p>
              )}
            </div>
            <motion.button
              onClick={() => addSongsToPlaylist(playlist.id)}
              className="playlists-button playlists-add"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!(selectedSongs[playlist.id]?.length > 0)}
            >
              Add Selected Songs
            </motion.button>
          </div>
        )}
        <audio
          ref={(el) => (audioRefs.current[playlist.id] = el)}
          onPlay={() =>
            setIsPlaying((prev) => ({ ...prev, [playlist.id]: true }))
          }
          onPause={() =>
            setIsPlaying((prev) => ({ ...prev, [playlist.id]: false }))
          }
        />
      </motion.div>
    ));
  }, [
    playlists,
    selectedSongs,
    isPlaying,
    currentSongIndex,
    progress,
    previousSongs,
    filteredSongs,
    showSongList,
  ]);

  return (
    <div className="playlists-page-wrapper">
      <div className="playlists-container">
        <motion.h1
          className="playlists-main-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your Playlists
        </motion.h1>

        {loading ? (
          <motion.p
            className="playlists-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading...
          </motion.p>
        ) : error ? (
          <motion.p
            className="playlists-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        ) : (
          <>
            {/* Playlist Creation Form */}
            <motion.section
              className="playlists-create-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h2 className="playlists-section-title">Create New Playlist</h2>
              <form onSubmit={createPlaylist} className="playlists-form">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name"
                  className="playlists-input"
                  required
                />
                <motion.button
                  type="submit"
                  className="playlists-button playlists-create"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create
                </motion.button>
              </form>
            </motion.section>

            {/* Playlists List */}
            {playlists.length > 0 ? (
              <div
                className="playlists-grid"
                data-playlist-count={playlists.length}
              >
                {playlistList}
              </div>
            ) : (
              <motion.p
                className="playlists-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No playlists yet. Create one above!
              </motion.p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
