import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage'
import UploadDemo from './components/UploadDemo'
import './index.css'
import { ThemeProvider } from './theme/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<UploadDemo />} />
        </Routes>
      </Router>
    </ThemeProvider>
  </React.StrictMode>,
)
