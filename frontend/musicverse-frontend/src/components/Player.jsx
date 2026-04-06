// //components/Player.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { useSpring, animated } from "@react-spring/web";

// const Player = ({ songId }) => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentSong, setCurrentSong] = useState(null);
//   const [recommendations, setRecommendations] = useState([]);
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     // Fetch song details
//     const fetchSong = async () => {
//       try {
//         const response = await axios.get(`/api/music/songs/${songId}/`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//           },
//         });
//         setCurrentSong(response.data);
//       } catch (err) {
//         console.error("Failed to fetch song:", err);
//       }
//     };

//     if (songId) {
//       fetchSong();
//     }
//   }, [songId]);

//   useEffect(() => {
//     if (songId && isPlaying) {
//       axios
//         .post(
//           "/api/music/log_play/",
//           { song_id: songId },
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//             },
//           }
//         )
//         .catch((err) => console.error("Failed to log play:", err));

//       // Simulate progress (since we don't have actual audio playback)
//       const interval = setInterval(() => {
//         setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
//       }, 300);
//       return () => clearInterval(interval);
//     }
//   }, [songId, isPlaying]);

//   const fetchRecommendations = async () => {
//     try {
//       const response = await axios.get("/api/music/songs/recommend/", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//         },
//       });
//       setRecommendations(response.data);
//     } catch (err) {
//       console.error("Failed to fetch recommendations:", err);
//     }
//   };

//   // Spring animation for progress bar
//   const progressSpring = useSpring({
//     width: `${progress}%`,
//     from: { width: "0%" },
//     config: { tension: 200, friction: 20 },
//   });

//   return (
//     <motion.div
//       className="player-container p-6 bg-gray-800 text-white rounded-xl shadow-lg"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6 }}
//     >
//       {currentSong ? (
//         <div className="flex items-center space-x-4 mb-4">
//           <motion.img
//             src={currentSong.cover || "https://via.placeholder.com/50"}
//             alt={currentSong.name}
//             className="w-12 h-12 rounded object-cover"
//             whileHover={{ scale: 1.1 }}
//             transition={{ type: "spring", stiffness: 300 }}
//           />
//           <div>
//             <h3 className="text-lg font-semibold">{currentSong.name}</h3>
//             <p className="text-sm text-gray-400">{currentSong.artist.name}</p>
//           </div>
//         </div>
//       ) : (
//         <h3 className="text-lg font-semibold mb-4">No song selected</h3>
//       )}

//       {/* Progress Bar */}
//       <div className="w-full h-2 bg-gray-600 rounded-full mb-4 overflow-hidden">
//         <animated.div
//           style={progressSpring}
//           className="h-full bg-purple-500 rounded-full"
//         />
//       </div>

//       {/* Playback Controls */}
//       <div className="flex justify-center space-x-4 mb-4">
//         <motion.button
//           onClick={() => setProgress((prev) => Math.max(0, prev - 10))}
//           className="p-2 bg-gray-700 rounded-full"
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//         >
//           <svg
//             className="w-6 h-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//         </motion.button>
//         <motion.button
//           onClick={() => setIsPlaying(!isPlaying)}
//           className="p-2 bg-purple-600 rounded-full"
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//         >
//           {isPlaying ? (
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M10 9v6m4-6v6"
//               />
//             </svg>
//           ) : (
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M9 5l7 7-7 7V5z"
//               />
//             </svg>
//           )}
//         </motion.button>
//         <motion.button
//           onClick={() => setProgress((prev) => Math.min(100, prev + 10))}
//           className="p-2 bg-gray-700 rounded-full"
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//         >
//           <svg
//             className="w-6 h-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M9 5l7 7-7 7"
//             />
//           </svg>
//         </motion.button>
//       </div>

//       {/* Recommendations */}
//       <motion.button
//         onClick={fetchRecommendations}
//         className="w-full py-2 bg-green-600 rounded-lg hover:bg-green-700"
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//       >
//         Get Recommendations
//       </motion.button>
//       {recommendations.length > 0 && (
//         <motion.div
//           className="mt-4"
//           initial={{ opacity: 0, height: 0 }}
//           animate={{ opacity: 1, height: "auto" }}
//           transition={{ duration: 0.4 }}
//         >
//           <h3 className="text-lg font-semibold mb-2">Recommended Songs</h3>
//           <ul className="space-y-2">
//             {recommendations.map((song) => (
//               <motion.li
//                 key={song.id}
//                 className="p-2 bg-gray-700 rounded-lg flex items-center space-x-3"
//                 whileHover={{ scale: 1.02 }}
//                 transition={{ type: "spring", stiffness: 300 }}
//               >
//                 <img
//                   src={song.cover || "https://via.placeholder.com/40"}
//                   alt={song.name}
//                   className="w-10 h-10 rounded object-cover"
//                 />
//                 <div>
//                   <p className="text-sm">{song.name}</p>
//                   <p className="text-xs text-gray-400">{song.artist.name}</p>
//                 </div>
//               </motion.li>
//             ))}
//           </ul>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };

// export default Player;

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { FaMusic } from "react-icons/fa";
import "../styles/Player.css";

const Player = ({ songId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await axios.get(`/api/music/songs/${songId}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setCurrentSong(response.data);
      } catch (err) {
        console.error("Failed to fetch song:", err);
      }
    };

    if (songId) {
      fetchSong();
    }
  }, [songId]);

  useEffect(() => {
    if (songId && isPlaying) {
      axios
        .post(
          "/api/music/log_play/",
          { song_id: songId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        )
        .catch((err) => console.error("Failed to log play:", err));
    }
  }, [songId, isPlaying]);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get("/api/music/songs/recommend/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setRecommendations(response.data);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    }
  };

  const handleProgressChange = (value) => {
    setProgress(value);
    // Note: Actual audio seeking requires ref to AudioPlayer, which is handled internally
  };

  return (
    <motion.div
      className="player-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {currentSong ? (
        <div className="player-content">
          <motion.div
            className="player-image"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {currentSong.cover ? (
              <img
                src={currentSong.cover}
                alt={currentSong.name}
                className="player-album-art"
              />
            ) : (
              <div className="player-placeholder">
                <FaMusic size={48} />
              </div>
            )}
          </motion.div>
          <div className="player-info">
            <h3 className="player-title">{currentSong.name}</h3>
            <p className="player-artist">{currentSong.artist.name}</p>
          </div>
          <div className="player-controls">
            <AudioPlayer
              src={currentSong.audio_url} // Assuming API returns audio_url
              autoPlay={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              showSkipControls={true}
              showJumpControls={false}
              customProgressBarSection={[]}
              customControlsSection={["MAIN_CONTROLS"]}
              className="player-audio"
            />
            <Slider
              value={progress}
              onChange={handleProgressChange}
              min={0}
              max={100}
              className="player-slider"
              trackStyle={{ backgroundColor: "var(--celadon)" }}
              handleStyle={{
                borderColor: "var(--celadon)",
                backgroundColor: "var(--platinum)",
              }}
              railStyle={{ backgroundColor: "var(--thistle)" }}
            />
          </div>
          <motion.button
            onClick={fetchRecommendations}
            className="player-recommend-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Recommendations
          </motion.button>
          {-recommendations.length > 0 && (
            <motion.div
              className="player-recommendations"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="player-recommend-title">Recommended Songs</h3>
              <ul className="player-recommend-list">
                {recommendations.map((song) => (
                  <motion.li
                    key={song.id}
                    className="player-recommend-item"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img
                      src={song.cover || "https://via.placeholder.com/40"}
                      alt={song.name}
                      className="player-recommend-img"
                    />
                    <div>
                      <p className="player-recommend-name">{song.name}</p>
                      <p className="player-recommend-artist">
                        {song.artist.name}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="player-empty">
          <FaMusic size={48} />
          <h3 className="player-empty-text">No song selected</h3>
        </div>
      )}
    </motion.div>
  );
};

export default Player;
