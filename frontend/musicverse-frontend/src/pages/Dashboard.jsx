import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaMusic,
  FaPlay,
  FaPause,
  FaBackward,
  FaForward,
  FaPlus,
  FaListUl,
  FaTrash,
} from "react-icons/fa";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [songs, setSongs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState(null);
  const [queue, setQueue] = useState([]);
  const [previousSongs, setPreviousSongs] = useState([]); // Track previous songs
  const [isPlaying, setIsPlaying] = useState(false);
  const [infinityMode, setInfinityMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

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
        const [songsResponse, recResponse] = await Promise.all([
          axios.get("/api/music/songs/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/music/songs/recommend/", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setSongs(songsResponse.data);
        if (songsResponse.data.length > 0)
          setSelectedSongId(songsResponse.data[0].id);
        setRecommendations(recResponse.data);
      } catch (err) {
        setError(
          `Failed to load dashboard data: ${
            err.response?.data?.error || err.message
          }`
        );
        console.error("Dashboard fetch error:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const logPlay = async (songId) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "/api/music/songs/log_play/",
        { song_id: songId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Play logged for song:", songId);
    } catch (err) {
      console.error("Failed to log play:", err);
    }
  };

  const addToQueue = (songId) => {
    const song =
      songs.find((s) => s.id === songId) ||
      recommendations.find((s) => s.id === songId);
    if (song && !queue.some((q) => q.id === songId)) {
      setQueue((prev) => [...prev, song]);
    }
  };

  const removeFromQueue = (songId) => {
    setQueue((prev) => prev.filter((q) => q.id !== songId));
  };

  const addToPlaylist = (songId) => {
    console.log(`Add song ${songId} to playlist (placeholder)`);
  };

  const playSong = (songId, addToHistory = true) => {
    const song =
      songs.find((s) => s.id === songId) ||
      recommendations.find((s) => s.id === songId);
    if (!song) return;

    if (audioRef.current) {
      if (selectedSongId === songId && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (selectedSongId !== songId) {
          audioRef.current.src = song.audio_file || "";
          setSelectedSongId(songId);
          if (addToHistory && selectedSongId) {
            const currentSong =
              songs.find((s) => s.id === selectedSongId) ||
              recommendations.find((s) => s.id === selectedSongId);
            if (currentSong) {
              setPreviousSongs((prev) => [currentSong, ...prev]);
            }
          }
        }
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            logPlay(songId);
          })
          .catch((err) => console.error("Play failed:", err));
      }
    }
  };

  const playNext = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue((prev) => prev.slice(1));
      setSelectedSongId(nextSong.id);
      logPlay(nextSong.id);
      if (audioRef.current) {
        audioRef.current.src = nextSong.audio_file || "";
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error("Play failed:", err));
      }
      const currentSong =
        songs.find((s) => s.id === selectedSongId) ||
        recommendations.find((s) => s.id === selectedSongId);
      if (currentSong) {
        setPreviousSongs((prev) => [currentSong, ...prev]);
      }
    } else if (infinityMode && recommendations.length > 0) {
      const newSong = recommendations[0];
      setRecommendations((prev) => prev.slice(1));
      addToQueue(newSong.id);
      setSelectedSongId(newSong.id);
      logPlay(newSong.id);
      if (audioRef.current) {
        audioRef.current.src = newSong.audio_file || "";
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error("Play failed:", err));
      }
      const currentSong =
        songs.find((s) => s.id === selectedSongId) ||
        recommendations.find((s) => s.id === selectedSongId);
      if (currentSong) {
        setPreviousSongs((prev) => [currentSong, ...prev]);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const playPrevious = () => {
    if (previousSongs.length > 0) {
      const prevSong = previousSongs[0];
      setPreviousSongs((prev) => prev.slice(1));
      setSelectedSongId(prevSong.id);
      logPlay(prevSong.id);
      if (audioRef.current) {
        audioRef.current.src = prevSong.audio_file || "";
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error("Play failed:", err));
      }
      const currentSong =
        songs.find((s) => s.id === selectedSongId) ||
        recommendations.find((s) => s.id === selectedSongId);
      if (currentSong) {
        setQueue((prev) => [currentSong, ...prev]);
      }
    }
  };

  const toggleInfinity = () => {
    setInfinityMode((prev) => !prev);
    if (!infinityMode && recommendations.length > 0) {
      const newSong = recommendations[0];
      addToQueue(newSong.id);
      setRecommendations((prev) => prev.slice(1));
      if (audioRef.current) {
        audioRef.current.src = newSong.audio_file || "";
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            logPlay(newSong.id);
          })
          .catch((err) => console.error("Play failed:", err));
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.addEventListener("timeupdate", updateProgress);
      audio.addEventListener("ended", playNext);
      return () => {
        audio.removeEventListener("timeupdate", updateProgress);
        audio.removeEventListener("ended", playNext);
      };
    }
  }, [queue, infinityMode, recommendations]);

  const handleSeek = (value) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(value);
    }
  };

  const currentSong =
    songs.find((s) => s.id === selectedSongId) ||
    recommendations.find((s) => s.id === selectedSongId) ||
    songs[0];

  // Memoize queue rendering to reduce re-renders
  const queueList = useMemo(() => {
    return queue.length > 0 ? (
      queue.map((song) => (
        <div
          key={song.id}
          className="dashboard-queue-item"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }} // Reduced animation
        >
          <div className="dashboard-queue-info">
            <span className="dashboard-queue-title">{song.name}</span>
            <span className="dashboard-queue-artist">{song.artist.name}</span>
          </div>
          <motion.button
            onClick={() => removeFromQueue(song.id)}
            className="dashboard-button dashboard-remove"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Remove from Queue"
          >
            <FaTrash size={16} />
          </motion.button>
        </div>
      ))
    ) : (
      <p>No songs in queue</p>
    );
  }, [queue]);

  return (
    <div className="dashboard-page-wrapper">
      <div className="dashboard-container">
        <motion.h1
          className="dashboard-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          My Music
        </motion.h1>

        {loading ? (
          <motion.p
            className="dashboard-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading...
          </motion.p>
        ) : error ? (
          <motion.p
            className="dashboard-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        ) : (
          <>
            {/* Current Song and Queue Section */}
            <motion.section
              className="dashboard-current-queue"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="dashboard-current-song">
                <h2 className="dashboard-section-title">Now Playing</h2>
                {currentSong ? (
                  <div
                    className="dashboard-song-card"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {currentSong.album?.cover_art ? (
                      <img
                        src={currentSong.album.cover_art}
                        alt={currentSong.name}
                        className="dashboard-song-image"
                      />
                    ) : (
                      <div className="dashboard-song-placeholder">
                        <FaMusic size={60} />
                      </div>
                    )}
                    <h3 className="dashboard-song-title">{currentSong.name}</h3>
                    <p className="dashboard-song-artist">
                      {currentSong.artist.name}
                    </p>
                    <div className="dashboard-song-buttons">
                      <motion.button
                        onClick={() => playSong(currentSong.id, false)}
                        className="dashboard-button dashboard-play"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={
                          selectedSongId === currentSong.id && isPlaying
                            ? "Pause"
                            : "Play"
                        }
                      >
                        {selectedSongId === currentSong.id && isPlaying ? (
                          <FaPause size={16} />
                        ) : (
                          <FaPlay size={16} />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={playPrevious}
                        className="dashboard-button dashboard-previous"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Previous"
                        disabled={previousSongs.length === 0}
                      >
                        <FaBackward size={16} />
                      </motion.button>
                      <motion.button
                        onClick={playNext}
                        className="dashboard-button dashboard-next"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Next"
                        disabled={
                          queue.length === 0 &&
                          (!infinityMode || recommendations.length === 0)
                        }
                      >
                        <FaForward size={16} />
                      </motion.button>
                    </div>
                    <Slider
                      value={selectedSongId === currentSong.id ? progress : 0}
                      onChange={handleSeek}
                      min={0}
                      max={100}
                      className="dashboard-slider"
                      trackStyle={{ backgroundColor: "var(--celadon)" }}
                      handleStyle={{
                        borderColor: "var(--celadon)",
                        backgroundColor: "var(--platinum)",
                      }}
                      railStyle={{ backgroundColor: "var(--thistle)" }}
                    />
                  </div>
                ) : (
                  <p>No song selected</p>
                )}
              </div>
              <div className="dashboard-queue">
                <h2 className="dashboard-section-title">Queue</h2>
                <div className="dashboard-queue-list">{queueList}</div>
              </div>
            </motion.section>

            {/* Songs Section */}
            <motion.section
              className="dashboard-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="dashboard-header">
                <h2 className="dashboard-section-title">Your Songs</h2>
                <motion.button
                  onClick={toggleInfinity}
                  className={`dashboard-infinity-button ${
                    infinityMode ? "active" : ""
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {infinityMode ? "Stop Infinity" : "Start Infinity"}
                </motion.button>
              </div>
              <div className="dashboard-grid">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="dashboard-song-card"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {song.album?.cover_art ? (
                      <img
                        src={song.album.cover_art}
                        alt={song.name}
                        className="dashboard-song-image"
                      />
                    ) : (
                      <div className="dashboard-song-placeholder">
                        <FaMusic size={60} />
                      </div>
                    )}
                    <h3 className="dashboard-song-title">{song.name}</h3>
                    <p className="dashboard-song-artist">{song.artist.name}</p>
                    <div className="dashboard-song-buttons">
                      <motion.button
                        onClick={() => playSong(song.id)}
                        className="dashboard-button dashboard-play"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={
                          selectedSongId === song.id && isPlaying
                            ? "Pause"
                            : "Play"
                        }
                      >
                        {selectedSongId === song.id && isPlaying ? (
                          <FaPause size={16} />
                        ) : (
                          <FaPlay size={16} />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => addToQueue(song.id)}
                        className="dashboard-button dashboard-queue"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Add to Queue"
                      >
                        <FaPlus size={16} />
                      </motion.button>
                      <motion.button
                        onClick={() => addToPlaylist(song.id)}
                        className="dashboard-button dashboard-playlist"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title="Add to Playlist"
                      >
                        <FaListUl size={16} />
                      </motion.button>
                    </div>
                    <Slider
                      value={selectedSongId === song.id ? progress : 0}
                      onChange={handleSeek}
                      min={0}
                      max={100}
                      className="dashboard-slider"
                      trackStyle={{ backgroundColor: "var(--celadon)" }}
                      handleStyle={{
                        borderColor: "var(--celadon)",
                        backgroundColor: "var(--platinum)",
                      }}
                      railStyle={{ backgroundColor: "var(--thistle)" }}
                    />
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <motion.section
                className="dashboard-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <h2 className="dashboard-section-title">Recommended Songs</h2>
                <div className="dashboard-grid">
                  {recommendations.map((song) => (
                    <div
                      key={song.id}
                      className="dashboard-song-card"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {song.album?.cover_art ? (
                        <img
                          src={song.album.cover_art}
                          alt={song.name}
                          className="dashboard-song-image"
                        />
                      ) : (
                        <div className="dashboard-song-placeholder">
                          <FaMusic size={60} />
                        </div>
                      )}
                      <h3 className="dashboard-song-title">{song.name}</h3>
                      <p className="dashboard-song-artist">
                        {song.artist.name}
                      </p>
                      <div className="dashboard-song-buttons">
                        <motion.button
                          onClick={() => playSong(song.id)}
                          className="dashboard-button dashboard-play"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          title={
                            selectedSongId === song.id && isPlaying
                              ? "Pause"
                              : "Play"
                          }
                        >
                          {selectedSongId === song.id && isPlaying ? (
                            <FaPause size={16} />
                          ) : (
                            <FaPlay size={16} />
                          )}
                        </motion.button>
                        <motion.button
                          onClick={() => addToQueue(song.id)}
                          className="dashboard-button dashboard-queue"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          title="Add to Queue"
                        >
                          <FaPlus size={16} />
                        </motion.button>
                        <motion.button
                          onClick={() => addToPlaylist(song.id)}
                          className="dashboard-button dashboard-playlist"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          title="Add to Playlist"
                        >
                          <FaListUl size={16} />
                        </motion.button>
                      </div>
                      <Slider
                        value={selectedSongId === song.id ? progress : 0}
                        onChange={handleSeek}
                        min={0}
                        max={100}
                        className="dashboard-slider"
                        trackStyle={{ backgroundColor: "var(--celadon)" }}
                        handleStyle={{
                          borderColor: "var(--celadon)",
                          backgroundColor: "var(--platinum)",
                        }}
                        railStyle={{ backgroundColor: "var(--thistle)" }}
                      />
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Hidden Audio Element */}
            <audio
              ref={audioRef}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}
