import React from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import './style.css'
import Home from './views/home'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Home />} exact path="/" />
      </Routes>
    </Router>
  )
}

const container = document.getElementById('app');
createRoot(container).render(<App />);