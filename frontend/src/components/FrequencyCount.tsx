import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BarChart3 } from 'lucide-react';

const FrequencyCount: React.FC = () => {
    const [frequency, setFrequency] = useState<{ word: string, count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getFrequencyStats()
            .then((data) => {
                console.log('Frequency data received:', data);
                setFrequency(data);
            })
            .catch((error) => {
                console.error('Error fetching frequency stats:', error);
                setFrequency([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="hero-section">
                    <h1 className="hero-title">
                        <span className="brand">Frequency</span> <span className="accent">Count</span>
                    </h1>
                    <p className="hero-subtitle">Loading word frequency data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="hero-section">
                <h1 className="hero-title">
                    <span className="brand">Frequency</span> <span className="accent">Count</span>
                </h1>
                <p className="hero-subtitle">
                    Most frequently occurring words in indexed data
                </p>
            </div>

            <div className="crawler-card" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <BarChart3 size={24} style={{ color: 'var(--primary-light)' }} />
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Top Words by Frequency</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    This feature counts how many times each word appears across all indexed CSV files using a HashMap data structure for efficient counting.
                </p>

                {frequency.length > 0 ? (
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
                            <div>Index</div>
                            <div>Page Name</div>
                            <div style={{ textAlign: 'right' }}>Word Count</div>
                        </div>

                        {/* Table Rows */}
                        {frequency.slice(0, 20).map((item, idx) => (
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
                                    {item.word}
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
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                        No frequency data available yet. Index some files first.
                    </p>
                )}

                {frequency.length > 0 && (
                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'rgba(79, 70, 229, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(79, 70, 229, 0.3)'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            Tracking <strong style={{ color: 'var(--text-primary)' }}>{frequency.length}</strong> unique words across all indexed files
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FrequencyCount;
