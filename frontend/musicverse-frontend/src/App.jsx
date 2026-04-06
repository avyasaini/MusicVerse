// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Home from "./pages/Home";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Dashboard from "./pages/Dashboard";
// import Recommendations from "./pages/Recommendations";
// import Profile from "./pages/Profile";
// import Playlists from "./pages/Playlists";
// import Communities from "./pages/Communities";
// import CommunityForum from "./pages/CommunityForum";
// import Friends from "./pages/Friends";
// import Messages from "./pages/Messages";
// import vinyl from "./assets/vinyl.png";
// import { motion } from "framer-motion";

// function App() {
//   return (
//     <Router>
//       <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-black to-gray-900 overflow-hidden">
//         <motion.img
//           src={vinyl}
//           alt="Vinyl Background"
//           className="absolute w-96 opacity-10 -top-20 -left-20 select-none pointer-events-none"
//           animate={{ rotate: 360 }}
//           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//         />

//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1 }}
//         >
//           <Navbar />
//         </motion.div>

//         <motion.div
//           className="px-4 sm:px-8 py-8 w-full"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5, duration: 1 }}
//         >
//           <Routes>
//             <Route
//               path="/"
//               element={
//                 <PageWrapper>
//                   <Home />
//                 </PageWrapper>
//               }
//             />
//             <Route
//               path="/login"
//               element={
//                 <PageWrapper>
//                   <Login />
//                 </PageWrapper>
//               }
//             />
//             <Route
//               path="/signup"
//               element={
//                 <PageWrapper>
//                   <Signup />
//                 </PageWrapper>
//               }
//             />
//             <Route
//               path="/dashboard"
//               element={
//                 <PageWrapper>
//                   <Dashboard />
//                 </PageWrapper>
//               }
//             />
//             <Route
//               path="/recommendations"
//               element={
//                 <PageWrapper>
//                   <Recommendations />
//                 </PageWrapper>
//               }
//             />
//             <Route
//               path="/profile"
//               element={
//                 <PageWrapper>
//                   <Profile />
//                 </PageWrapper>
//               }
//             />
//             <Route
//               path="/playlists"
//               element={
//                 <PageWrapper>
//                   <Playlists />
//                 </PageWrapper>
//               }
//             />
//             <Route
//               path="/communities"
//               element={
//                 <PageWrapper>
//                   <Communities />
//                 </PageWrapper>
//               }
//             />
//             <Route
//               path="/community/:communityId/forum"
//               element={
//                 <PageWrapper>
//                   <CommunityForum />
//                 </PageWrapper>
//               }
//             />
//             <Route
//               path="/friends"
//               element={
//                 <PageWrapper>
//                   <Friends />
//                 </PageWrapper>
//               }
//             />
//             <Route
//               path="/messages/:friendId"
//               element={
//                 <PageWrapper>
//                   <Messages />
//                 </PageWrapper>
//               }
//             />
//           </Routes>
//         </motion.div>
//       </div>
//     </Router>
//   );
// }

// function PageWrapper({ children }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       transition={{ duration: 0.6 }}
//       className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl w-full"
//     >
//       {children}
//     </motion.div>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Recommendations from "./pages/Recommendations";
import Profile from "./pages/Profile";
import Playlists from "./pages/Playlists";
import Communities from "./pages/Communities";
import CommunityForum from "./pages/CommunityForum";
import Friends from "./pages/Friends";
import Messages from "./pages/Messages";
import vinyl from "./assets/vinyl.png";
import { motion } from "framer-motion";
import "./styles/GlobalStyles.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <motion.img
          src={vinyl}
          alt="Vinyl Background"
          className="app-vinyl"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route
              path="/"
              element={
                <PageWrapper>
                  <Home />
                </PageWrapper>
              }
            />
            <Route
              path="/login"
              element={
                <PageWrapper>
                  <Login />
                </PageWrapper>
              }
            />
            <Route
              path="/signup"
              element={
                <PageWrapper>
                  <Signup />
                </PageWrapper>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PageWrapper>
                  <Dashboard />
                </PageWrapper>
              }
            />
            <Route
              path="/recommendations"
              element={
                <PageWrapper>
                  <Recommendations />
                </PageWrapper>
              }
            />
            <Route
              path="/profile"
              element={
                <PageWrapper>
                  <Profile />
                </PageWrapper>
              }
            />
            <Route
              path="/playlists"
              element={
                <PageWrapper>
                  <Playlists />
                </PageWrapper>
              }
            />
            <Route
              path="/communities"
              element={
                <PageWrapper>
                  <Communities />
                </PageWrapper>
              }
            />
            <Route
              path="/community/:communityId/forum"
              element={
                <PageWrapper>
                  <CommunityForum />
                </PageWrapper>
              }
            />
            <Route
              path="/friends"
              element={
                <PageWrapper>
                  <Friends />
                </PageWrapper>
              }
            />
            <Route
              path="/messages/:friendId"
              element={
                <PageWrapper>
                  <Messages />
                </PageWrapper>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="page-wrapper"
    >
      {children}
    </motion.div>
  );
}

export default App;
