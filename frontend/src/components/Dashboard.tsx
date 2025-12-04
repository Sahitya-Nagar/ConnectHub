import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TrendingUp, Clock, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [frequency, setFrequency] = useState<{ word: string, count: number }[]>([]);
    const [history, setHistory] = useState<{ term: string, count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getFrequencyStats(),
            api.getHistory()
        ]).then(([freq, hist]) => {
            setFrequency(freq);
            setHistory(hist);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="hero-section">
                    <h1 className="hero-title">
                        <span className="brand">Analytics</span> <span className="accent">Dashboard</span>
                    </h1>
                    <p className="hero-subtitle">Loading insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="hero-section">
                <h1 className="hero-title">
                    <span className="brand">Analytics</span> <span className="accent">Dashboard</span>
                </h1>
                <p className="hero-subtitle">
                    Real-time insights from your search engine data
                </p>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <BarChart3 size={24} style={{ color: 'var(--primary-light)' }} />
                        <h2>Top Words Frequency</h2>
                    </div>
                    <div className="stats-list">
                        {frequency.length > 0 ? (
                            frequency.slice(0, 15).map((item, idx) => (
                                <div key={idx} className="stat-item">
                                    <span className="stat-label">
                                        <span style={{
                                            display: 'inline-block',
                                            width: '24px',
                                            color: 'var(--text-muted)',
                                            fontSize: '0.85rem'
                                        }}>
                                            {idx + 1}.
                                        </span>
                                        {item.word}
                                    </span>
                                    <div className="stat-bar-wrapper">
                                        <div
                                            className="stat-bar"
                                            style={{ width: `${Math.min(100, (item.count / (frequency[0]?.count || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="stat-value">{item.count}</span>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                No frequency data available yet
                            </p>
                        )}
                    </div>
                </div>

                <div className="dashboard-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Clock size={24} style={{ color: 'var(--accent)' }} />
                        <h2>Search History</h2>
                    </div>
                    <div className="history-list">
                        {history.length > 0 ? (
                            history.slice(0, 15).map((item, idx) => (
                                <div key={idx} className="stat-item" style={{ marginBottom: '0.75rem' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <TrendingUp size={16} style={{ color: 'var(--primary-light)' }} />
                                        <span className="stat-label" style={{ flex: 1 }}>{item.term}</span>
                                    </div>
                                    <span className="stat-value">
                                        {item.count} {item.count === 1 ? 'search' : 'searches'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                                No search history yet. Start searching to see data here!
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {(frequency.length > 0 || history.length > 0) && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center'
                }}>
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                        Data Insights
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Tracking {frequency.length} unique words and {history.length} search queries
                    </p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
