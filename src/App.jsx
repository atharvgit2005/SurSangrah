import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import ChordHub from './pages/ChordHub';
import SurSaathi from './pages/SurSaathi';
import BeatLoopr from './pages/BeatLoopr';
import SurCheck from './pages/SurCheck';
import Riyaz from './pages/Riyaz';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Sidebar />
        <main className="transition-all duration-300 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chordhub" element={<ChordHub />} />
            <Route path="/sursaathi" element={<SurSaathi />} />
            <Route path="/beatloopr" element={<BeatLoopr />} />
            <Route path="/surcheck" element={<SurCheck />} />
            <Route path="/riyaz" element={<Riyaz />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;