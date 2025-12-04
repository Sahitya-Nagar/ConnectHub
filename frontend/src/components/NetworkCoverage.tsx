import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Map, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface NetworkCoverageProps {
    provider: string;
}

// Canadian cities for auto-completion
const CANADIAN_CITIES = [
    'Toronto, ON',
    'Montreal, QC',
    'Vancouver, BC',
    'Calgary, AB',
    'Edmonton, AB',
    'Ottawa, ON',
    'Winnipeg, MB',
    'Quebec City, QC',
    'Hamilton, ON',
    'Kitchener, ON',
    'London, ON',
    'Victoria, BC',
    'Halifax, NS',
    'Oshawa, ON',
    'Windsor, ON',
    'Saskatoon, SK',
    'Regina, SK',
    'St. John\'s, NL',
    'Barrie, ON',
    'Kelowna, BC'
];

// City coordinates for map centering
const CITY_COORDS: { [key: string]: [number, number] } = {
    'Toronto, ON': [43.6532, -79.3832],
    'Montreal, QC': [45.5017, -73.5673],
    'Vancouver, BC': [49.2827, -123.1207],
    'Calgary, AB': [51.0447, -114.0719],
    'Edmonton, AB': [53.5461, -113.4938],
    'Ottawa, ON': [45.4215, -75.6972],
    'Winnipeg, MB': [49.8951, -97.1384],
    'Quebec City, QC': [46.8139, -71.2080],
    'Hamilton, ON': [43.2557, -79.8711],
    'Kitchener, ON': [43.4516, -80.4925],
    'London, ON': [42.9849, -81.2453],
    'Victoria, BC': [48.4284, -123.3656],
    'Halifax, NS': [44.6488, -63.5752],
    'Oshawa, ON': [43.8971, -78.8658],
    'Windsor, ON': [42.3149, -83.0364],
    'Saskatoon, SK': [52.1332, -106.6700],
    'Regina, SK': [50.4452, -104.6189],
    'St. John\'s, NL': [47.5615, -52.7126],
    'Barrie, ON': [44.3894, -79.6903],
    'Kelowna, BC': [49.8880, -119.4960]
};

// Component to update map view when center changes
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();

    React.useEffect(() => {
        map.setView(center, 11);
    }, [center, map]);

    return null;
};

const NetworkCoverage: React.FC<NetworkCoverageProps> = () => {
    const [location, setLocation] = React.useState('');
    const [selectedNetwork, setSelectedNetwork] = React.useState('all');
    const [isChecking, setIsChecking] = React.useState(false);
    const [coverageStatus, setCoverageStatus] = React.useState<string | null>(null);
    const [mapCenter, setMapCenter] = React.useState<[number, number]>([43.6532, -79.3832]); // Default: Toronto
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = React.useState(false);

    const handleLocationChange = (value: string) => {
        setLocation(value);

        if (value.length > 1) {
            const filtered = CANADIAN_CITIES.filter(city =>
                city.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (city: string) => {
        setLocation(city);
        setSuggestions([]);
        setShowSuggestions(false);

        // Update map center if coordinates exist
        if (CITY_COORDS[city]) {
            setMapCenter(CITY_COORDS[city]);
        }

        // Automatically trigger search
        setTimeout(() => {
            handleSearchForCity(city);
        }, 100);
    };

    const handleSearchForCity = (cityName: string) => {
        if (!cityName.trim()) return;

        setIsChecking(true);
        setCoverageStatus(null);

        // Update map center if it's a known city
        if (CITY_COORDS[cityName]) {
            setMapCenter(CITY_COORDS[cityName]);
        }

        // Simulate network request
        setTimeout(() => {
            setIsChecking(false);

            // Generate status based on selected network
            let status = '';
            if (selectedNetwork === 'all' || selectedNetwork === '5g') {
                status = '5G Coverage Available';
            } else if (selectedNetwork === 'lte') {
                status = 'LTE / 4G Coverage Available';
            } else if (selectedNetwork === '3g') {
                status = '3G / HSPA+ Coverage Available';
            } else {
                status = 'Coverage Available';
            }

            setCoverageStatus(status);
        }, 1500);
    };

    const handleSearch = () => {
        handleSearchForCity(location);
    };

    return (
        <div className="network-coverage-container">
            <div className="section-header">
                <h2 className="section-title">Network Coverage</h2>
                <div className="section-line"></div>
            </div>

            <div className="coverage-map-wrapper">
                <div className="coverage-controls">
                    <div className="search-bar" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Enter a location (e.g., Toronto, ON)"
                            value={location}
                            onChange={(e) => handleLocationChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        />
                        <button className="search-button" onClick={handleSearch} disabled={isChecking}>
                            <Search size={18} className="search-icon" />
                        </button>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="autocomplete-suggestions">
                                {suggestions.map((city, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => selectSuggestion(city)}
                                    >
                                        <Map size={14} />
                                        <span>{city}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="filter-dropdown">
                        <select
                            value={selectedNetwork}
                            onChange={(e) => setSelectedNetwork(e.target.value)}
                            className="network-select"
                        >
                            <option value="all">All Coverage</option>
                            <option value="5g">5G Only</option>
                            <option value="lte">LTE / 4G Only</option>
                            <option value="3g">3G / HSPA+ Only</option>
                        </select>
                    </div>
                </div>

                <div className="map-visualization">
                    <MapContainer
                        center={mapCenter}
                        zoom={11}
                        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
                        key={`map-${mapCenter[0]}-${mapCenter[1]}`}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={mapCenter}>
                            <Popup>
                                <strong>{location || 'Selected Location'}</strong><br />
                                {coverageStatus || 'Enter a location and search to check coverage'}
                            </Popup>
                        </Marker>
                        <MapUpdater center={mapCenter} />
                    </MapContainer>

                    <div className="map-overlay-status">
                        {isChecking && (
                            <div className="coverage-indicator checking">
                                <div className="spinner"></div>
                                <span>Checking coverage in {location}...</span>
                            </div>
                        )}

                        {!isChecking && coverageStatus && (
                            <div className="coverage-indicator success">
                                <div className="indicator-dot"></div>
                                <span>{coverageStatus} in {location}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="coverage-legend">
                    <div className="legend-item">
                        <span className="color-box color-5g"></span>
                        <span>5G</span>
                    </div>
                    <div className="legend-item">
                        <span className="color-box color-lte"></span>
                        <span>LTE / 4G</span>
                    </div>
                    <div className="legend-item">
                        <span className="color-box color-3g"></span>
                        <span>3G / HSPA+</span>
                    </div>
                </div>
            </div>

            <style>{`
                .search-button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    color: inherit;
                }
                .search-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .autocomplete-suggestions {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 40px;
                    background: rgba(30, 30, 50, 0.98);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 8px;
                    margin-top: 4px;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                .suggestion-item {
                    padding: 10px 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.2s;
                }
                .suggestion-item:hover {
                    background: rgba(139, 92, 246, 0.2);
                }
                .network-select {
                    background: rgba(30, 30, 50, 0.6);
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    color: #fff;
                    padding: 8px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .network-select:focus {
                    outline: none;
                    border-color: rgba(139, 92, 246, 0.6);
                }
                .map-overlay-status {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1000;
                    pointer-events: none;
                }
                .coverage-indicator.checking {
                    background: rgba(0, 0, 0, 0.8);
                    padding: 12px 20px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .coverage-indicator.success {
                    background: rgba(16, 185, 129, 0.9);
                    padding: 12px 20px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #fff;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default NetworkCoverage;
