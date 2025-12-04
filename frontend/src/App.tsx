import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ChevronDown, Award, Globe, Search, BarChart2, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import PlansView from './components/PlansView';
import BestPlan from './components/BestPlan';
import TextExtractor from './components/TextExtractor';
import PageRanking from './components/PageRanking';
import FrequencyCount from './components/FrequencyCount';
import SearchFrequency from './components/SearchFrequency';
import HomePage from './components/HomePage';
import ProviderPage from './components/ProviderPage';

function Navigation() {
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close dropdown when route changes
  useEffect(() => {
    setShowExploreMenu(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExploreMenu(false);
      }
    };

    if (showExploreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExploreMenu]);

  const handleMenuClick = () => {
    setShowExploreMenu(!showExploreMenu);
  };

  const handleLinkClick = () => {
    setShowExploreMenu(false);
  };

  return (
    <nav className="main-nav">
      <div className="nav-content">
        <Link to="/" className="nav-logo" onClick={() => setShowExploreMenu(false)}>
          <div>
            <span>Connect<span className="highlight">Hub</span></span>
          </div>
        </Link>
        <div className="nav-links">
          <div
            ref={dropdownRef}
            className="nav-dropdown"
          >
            <div className="nav-link" onClick={handleMenuClick}>
              <span>Explore</span>
              <ChevronDown size={16} style={{ marginLeft: '0.25rem' }} />
            </div>
            {showExploreMenu && (
              <div className="dropdown-menu">
                <Link to="/plans" className="dropdown-item" onClick={handleLinkClick}>
                  <Search size={18} />
                  <span>All Plans</span>
                </Link>
                <Link to="/best-plan" className="dropdown-item" onClick={handleLinkClick}>
                  <Award size={18} />
                  <span>Best Plan</span>
                </Link>
                <Link to="/text-extractor" className="dropdown-item" onClick={handleLinkClick}>
                  <Globe size={18} />
                  <span>Text Extractor</span>
                </Link>
                <Link to="/page-ranking" className="dropdown-item" onClick={handleLinkClick}>
                  <Search size={18} />
                  <span>Page Ranking</span>
                </Link>
                <Link to="/frequency-count" className="dropdown-item" onClick={handleLinkClick}>
                  <BarChart2 size={18} />
                  <span>Frequency Count</span>
                </Link>
                <Link to="/search-frequency" className="dropdown-item" onClick={handleLinkClick}>
                  <Clock size={18} />
                  <span>Search Frequency</span>
                </Link>
              </div>
            )}
          </div>

          <Link to="/rogers" className="nav-link">Rogers</Link>
          <Link to="/bell" className="nav-link">Bell</Link>
          <Link to="/virgin" className="nav-link">Virgin</Link>
          <Link to="/att" className="nav-link">AT&T</Link>
          <Link to="/koodo" className="nav-link">Koodo</Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/plans" element={<PlansView />} />
            <Route path="/best-plan" element={<BestPlan />} />
            <Route path="/text-extractor" element={<TextExtractor />} />
            <Route path="/page-ranking" element={<PageRanking />} />
            <Route path="/frequency-count" element={<FrequencyCount />} />
            <Route path="/search-frequency" element={<SearchFrequency />} />

            {/* Provider Pages */}
            <Route path="/rogers" element={<ProviderPage providerName="Rogers" logoColor="#DA291C" />} />
            <Route path="/bell" element={<ProviderPage providerName="Bell" logoColor="#005596" />} />
            <Route path="/virgin" element={<ProviderPage providerName="Virgin Plus" logoColor="#E31837" />} />
            <Route path="/att" element={<ProviderPage providerName="AT&T" logoColor="#00A8E0" />} />
            <Route path="/koodo" element={<ProviderPage providerName="Koodo" logoColor="#48B14C" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
