import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Wallet, Dumbbell, BookText, Library, CheckSquare } from 'lucide-react';
import Finance from './pages/Finance';
import Gym from './pages/Gym';
import Writings from './pages/Writings';
import Dictionary from './pages/Dictionary';
import Tasks from './pages/Tasks';

function App() {
  return (
    <Router>
      <nav className="ecosystem-nav shadow-lg">
        <div className="nav-container">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <CheckSquare size={20} /> <span>Tasks</span>
          </NavLink>
          <NavLink to="/finance" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Wallet size={20} /> <span>Finance</span>
          </NavLink>
          <NavLink to="/gym" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Dumbbell size={20} /> <span>Gym</span>
          </NavLink>
          <NavLink to="/writings" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <BookText size={20} /> <span>Writings</span>
          </NavLink>
          <NavLink to="/dictionary" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Library size={20} /> <span>Dictionary</span>
          </NavLink>
        </div>
      </nav>

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Tasks />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/gym" element={<Gym />} />
          <Route path="/writings" element={<Writings />} />
          <Route path="/dictionary" element={<Dictionary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
