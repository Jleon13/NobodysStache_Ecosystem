import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Wallet, Dumbbell, BookText } from 'lucide-react';
import Finance from './pages/Finance';
import Gym from './pages/Gym';
import Writings from './pages/Writings';

function App() {
  return (
    <Router>
      <nav className="ecosystem-nav">
        <div className="nav-container">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Wallet size={20} /> <span>Finance</span>
          </NavLink>
          <NavLink to="/gym" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Dumbbell size={20} /> <span>Gym</span>
          </NavLink>
          <NavLink to="/writings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <BookText size={20} /> <span>Writings</span>
          </NavLink>
        </div>
      </nav>

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Finance />} />
          <Route path="/gym" element={<Gym />} />
          <Route path="/writings" element={<Writings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
