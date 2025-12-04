import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Search, TrendingUp } from 'lucide-react';

const SearchFrequency: React.FC = () => {
    const [history, setHistory] = useState<{ term: string, count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getHistory()
            .then((data) => {
                console.log('Search history received:', data);
                setHistory(data);
            })
            .catch((error) => {
                console.error('Error fetching search history:', error);
                setHistory([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="hero-section">
                    <h1 className="hero-title">
                        <span className="brand">Search</span> <span className="accent">Frequency</span>
                    </h1>
                    <p className="hero-subtitle">Loading search history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="hero-section">
                <h1 className="hero-title">
                    <span className="brand">Search</span> <span className="accent">Frequency</span>
                </h1>
                <p className="hero-subtitle">
                    Track which search terms are most popular
                </p>
            </div>

            <div className="crawler-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Search size={24} style={{ color: 'var(--primary-light)' }} />
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Search History Tracking</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Every search query is tracked and counted using a HashMap. This helps identify popular search terms and user interests.
                </p>

                {history.length > 0 ? (
                    <div style={{
                        background: 'rgba(30, 30, 50, 0.6)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}>
                        {/* Table Header */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '80px 1fr 150px',
                            gap: '1rem',
                            padding: '1rem 1.5rem',
                            background: 'rgba(139, 92, 246, 0.15)',
                            borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            color: '#A78BFA'
                        }}>
                            <div>Rank</div>
                            <div>Search Term</div>
                            <div style={{ textAlign: 'right' }}>Searches</div>
                        </div>

                        {/* Table Rows */}
                        {history.slice(0, 20).map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '80px 1fr 150px',
                                    gap: '1rem',
                                    padding: '1rem 1.5rem',
                                    borderBottom: idx < 19 ? '1px solid rgba(139, 92, 246, 0.1)' : 'none',
                                    transition: 'background 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    color: '#FFD700',
                                    fontSize: '1rem'
                                }}>
                                    {idx + 1}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#E0E7FF',
                                    fontSize: '0.95rem'
                                }}>
                                    "{item.term}"
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    color: '#A78BFA',
                                    fontWeight: 600,
                                    fontSize: '1.1rem'
                                }}>
                                    {item.count}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: 'var(--text-secondary)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <Search size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No search history yet</h3>
                        <p>Start searching to see data here!</p>
                    </div>
                )}

                {history.length > 0 && (
                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
                            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                Insights
                            </h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            Total unique searches: <strong style={{ color: 'var(--text-primary)' }}>{history.length}</strong>
                            {' • '}
                            Total searches: <strong style={{ color: 'var(--text-primary)' }}>
                                {history.reduce((sum, item) => sum + item.count, 0)}
                            </strong>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchFrequency;
