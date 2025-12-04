import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface SearchResult {
    file: string;
    count: number;
}

const SearchPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [correction, setCorrection] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (query.length > 2) {
            api.suggest(query)
                .then(data => {
                    setSuggestions(data);
                    setShowSuggestions(true);
                })
                .catch(() => setSuggestions([]));
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [query]);

    const handleSearch = async (searchQuery?: string) => {
        const queryToSearch = searchQuery || query;
        if (!queryToSearch || queryToSearch.trim() === '') return;

        setLoading(true);
        setCorrection(null);
        setShowSuggestions(false);

        try {
            const data = await api.search(queryToSearch);
            setResults(data);

            const spellData = await api.spellCheck(queryToSearch);
            if (spellData.correction && spellData.correction !== queryToSearch.toLowerCase()) {
                setCorrection(spellData.correction);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        handleSearch(suggestion);
    };

    const handleCorrectionClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (correction) {
            setQuery(correction);
            handleSearch(correction);
        }
    };

    return (
        <div className="search-page">
            <div className="hero-section">
                <h1 className="hero-title">
                    <span className="brand">Smart</span> <span className="accent">Search</span>
                </h1>
                <p className="hero-subtitle">
                    Search with spell-checking and auto-complete • Powered by inverted indexing
                </p>

                <form onSubmit={handleSubmit} className="search-form">
                    <div className="search-input-wrapper">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            placeholder="Try: internet, fiber, unlimited, speed..."
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="suggestions-list">
                                {suggestions.slice(0, 5).map((s, idx) => (
                                    <li key={idx} onClick={() => handleSuggestionClick(s)}>
                                        <Sparkles size={14} style={{ marginRight: '0.5rem', color: 'var(--primary-light)' }} />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading || !query.trim()}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {correction && (
                    <div className="spell-check-notice">
                        <AlertCircle size={16} />
                        <span>
                            Did you mean{' '}
                            <strong>
                                <a href="#" onClick={handleCorrectionClick} style={{ color: 'inherit', textDecoration: 'underline' }}>
                                    {correction}
                                </a>
                            </strong>
                            ?
                        </span>
                    </div>
                )}
            </div>

            <div className="results-section">
                {loading ? (
                    <div className="plans-grid">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="plan-card loading-skeleton" style={{ height: '200px' }} />
                        ))}
                    </div>
                ) : (
                    <>
                        {results.length > 0 && (
                            <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                                Found {results.length} data source{results.length !== 1 ? 's' : ''} containing "{query}"
                            </div>
                        )}
                        <div className="plans-grid">
                            {results.map((r, idx) => (
                                <div key={idx} className="plan-card">
                                    <div className="plan-header">
                                        <div className="plan-provider">
                                            <div className="provider-logo" style={{ background: 'var(--gradient-primary)' }}>
                                                #{idx + 1}
                                            </div>
                                            <div className="provider-name">{r.file}</div>
                                        </div>
                                        <div className="plan-price">
                                            <div className="price-amount">{r.count}</div>
                                            <div className="price-period">matches</div>
                                        </div>
                                    </div>
                                    <div className="plan-name">
                                        Contains "{query}" in this data source
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Relevance</span>
                                        <div className="stat-bar-wrapper" style={{ flex: 2 }}>
                                            <div
                                                className="stat-bar"
                                                style={{ width: `${Math.min(100, (r.count / (results[0]?.count || 1)) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="detail-value">{Math.round((r.count / (results[0]?.count || 1)) * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {results.length === 0 && query && !loading && (
                            <div style={{
                                textAlign: 'center',
                                padding: '4rem 2rem',
                                color: 'var(--text-secondary)',
                                background: 'var(--bg-card)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-color)'
                            }}>
                                <Search size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No results found</h3>
                                <p>Try searching for keywords like "internet", "fiber", "unlimited", or "speed"</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
