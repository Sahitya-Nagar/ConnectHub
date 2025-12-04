import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search as SearchIcon } from 'lucide-react';

interface SearchResult {
    file: string;
    count: number;
}

// Mapping of CSV files to actual page URLs
const FILE_TO_URL_MAP: { [key: string]: string } = {
    'rogers_plans.csv': 'https://www.rogers.com/plans',
    'bell_plans.csv': 'https://www.bell.ca/Bell_Internet',
    'virgin_plans.csv': 'https://www.virgin.com/en/internet',
    'att_internet_plans_final.csv': 'https://www.att.com/internet/',
    'koodo_plans.csv': 'https://www.koodomobile.com/rate-plans',
    'fido_plans.csv': 'https://www.fido.ca/phones',
    'freedom_plans.csv': 'https://www.freedommobile.ca/en-CA/'
};

const PageRanking: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch suggestions for the last word of the query
    useEffect(() => {
        const lastWord = query.trim().split(' ').pop() ?? '';
        if (!lastWord) {
            setSuggestions([]);
            return;
        }
        const fetch = async () => {
            try {
                const data = await api.suggest(lastWord);
                const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                setSuggestions(parsed);
                setShowSuggestions(true);
            } catch (e) {
                console.error('Suggestion error:', e);
                setSuggestions([]);
            }
        };
        fetch();
    }, [query]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        try {
            const data = await api.search(query);
            setResults(data);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        const parts = query.split(' ');
        parts[parts.length - 1] = suggestion;
        setQuery(parts.join(' '));
        setShowSuggestions(false);
    };

    const getDisplayUrl = (filename: string): string => {
        return FILE_TO_URL_MAP[filename] || filename;
    };

    return (
        <div className="feature-page">
            <div className="ranking-header">
                <p className="ranking-description">
                    The Page Ranking feature ranks documents by word frequency,
                    helping users identify texts with the highest occurrence of specified terms.
                </p>
            </div>

            <form onSubmit={handleSearch} className="ranking-search-form" autoComplete="off">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type here"
                    className="ranking-search-input"
                    onFocus={() => query && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <button type="submit" className="ranking-search-btn" disabled={loading}>
                    <SearchIcon size={20} />
                </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-box" style={{ marginTop: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', maxHeight: '200px', overflowY: 'auto' }}>
                    {suggestions.map((s, idx) => (
                        <div key={idx} className="suggestion-item" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onMouseDown={() => handleSuggestionClick(s)}>
                            {s}
                        </div>
                    ))}
                </div>
            )}

            {results.length > 0 && (
                <div className="ranking-results" style={{ marginTop: '2rem' }}>
                    <h3 style={{
                        color: '#FFD700',
                        fontSize: '1.25rem',
                        marginBottom: '1.5rem',
                        fontStyle: 'italic'
                    }}>
                        Showing results for "{query}"
                    </h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}>
                        {results.map((result, idx) => {
                            const displayUrl = getDisplayUrl(result.file);
                            const isActualUrl = displayUrl !== result.file;

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem 1.5rem',
                                        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateX(4px)';
                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                    }}
                                >
                                    <span style={{
                                        minWidth: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        color: '#A78BFA'
                                    }}>
                                        {idx + 1}
                                    </span>
                                    {isActualUrl ? (
                                        <a
                                            href={displayUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                flex: 1,
                                                color: '#E0E7FF',
                                                textDecoration: 'none',
                                                fontSize: '0.95rem',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {displayUrl}
                                        </a>
                                    ) : (
                                        <span style={{
                                            flex: 1,
                                            color: '#E0E7FF',
                                            fontSize: '0.95rem',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {displayUrl}
                                        </span>
                                    )}
                                    <span style={{
                                        minWidth: '48px',
                                        textAlign: 'right',
                                        color: '#FFD700',
                                        fontWeight: 600,
                                        fontSize: '1rem'
                                    }}>
                                        {result.count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {loading && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    Searching...
                </div>
            )}
        </div>
    );
};

export default PageRanking;
