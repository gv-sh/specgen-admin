import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Categories from './pages/Categories';
import Parameters from './pages/Parameters';
import Content from './pages/Content';
import Settings from './pages/Settings';
import Database from './pages/Database';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">
              <i className="bi bi-gear-fill me-2"></i>
              Admin Dashboard
            </Link>
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav"
              aria-controls="navbarNav" 
              aria-expanded="false" 
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/categories">
                    <i className="bi bi-grid-3x3-gap-fill me-1"></i>
                    Categories
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/parameters">
                    <i className="bi bi-sliders me-1"></i>
                    Parameters
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/content">
                    <i className="bi bi-file-text me-1"></i>
                    Content
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/settings">
                    <i className="bi bi-gear me-1"></i>
                    Settings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/database">
                    <i className="bi bi-database-fill me-1"></i>
                    Database
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow-1 bg-light">
          <div className="container-fluid py-4">
            <Layout>
              <Routes>
                <Route path="/categories" element={<Categories />} />
                <Route path="/parameters" element={<Parameters />} />
                <Route path="/content" element={<Content />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/database" element={<Database />} />
                <Route path="/" element={
                  <div className="text-center py-5">
                    <h1 className="display-4 mb-4">Welcome to SpecGen Admin Dashboard</h1>
                    <p className="lead text-muted">
                      Manage your fiction and image generation parameters, content, and settings.
                    </p>
                    <div className="row mt-5">
                      <div className="col-md-4 mb-4">
                        <div className="card h-100">
                          <div className="card-body text-center">
                            <i className="bi bi-grid-3x3-gap-fill fs-1 mb-3 text-primary"></i>
                            <h5 className="card-title">Categories</h5>
                            <p className="card-text">Manage fiction categories like Science Fiction, Fantasy, etc.</p>
                            <Link to="/categories" className="btn btn-outline-primary">Manage Categories</Link>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-4">
                        <div className="card h-100">
                          <div className="card-body text-center">
                            <i className="bi bi-sliders fs-1 mb-3 text-primary"></i>
                            <h5 className="card-title">Parameters</h5>
                            <p className="card-text">Configure generation parameters for each category.</p>
                            <Link to="/parameters" className="btn btn-outline-primary">Manage Parameters</Link>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-4">
                        <div className="card h-100">
                          <div className="card-body text-center">
                            <i className="bi bi-file-text fs-1 mb-3 text-primary"></i>
                            <h5 className="card-title">Content</h5>
                            <p className="card-text">View and manage generated fiction and images.</p>
                            <Link to="/content" className="btn btn-outline-primary">Manage Content</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
            </Layout>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-dark text-light py-3">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 text-center">
                <p className="mb-0">
                  © {new Date().getFullYear()} SpecGen Admin - Fiction & Image Generation Admin Panel
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 