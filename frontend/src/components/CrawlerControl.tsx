import React, { useState } from 'react';
import { Play, CheckCircle, AlertTriangle, Globe, Zap, Info } from 'lucide-react';
import { api } from '../services/api';

const CrawlerControl: React.FC = () => {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCrawl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setStatus(null);
        try {
            await api.crawl(url);
            setStatus(`✓ Crawl started successfully! The system is now:\n1. Fetching content from ${url}\n2. Extracting text and plan information\n3. Saving data to CSV file\n4. The data will be available in the project folder`);
        } catch (error) {
            setStatus('✗ Error starting crawl. Please check the URL and ensure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    const quickUrls = [
        { name: 'Bell Internet', url: 'https://www.bell.ca/Bell_Internet', desc: 'Crawl Bell Canada internet plans' },
        { name: 'Rogers Plans', url: 'https://www.rogers.com/internet/packages', desc: 'Crawl Rogers internet packages' },
        { name: 'Virgin Internet', url: 'https://www.virgin.com/internet', desc: 'Crawl Virgin internet offerings' }
    ];

    return (
        <div className="crawler-page">
            <div className="hero-section">
                <h1 className="hero-title">
                    <span className="brand">Web</span> <span className="accent">Crawler</span>
                </h1>
                <p className="hero-subtitle">
                    Automatically discover and extract internet plan data from provider websites
                </p>
            </div>

            {/* Info Box */}
            <div style={{
                background: 'rgba(79, 70, 229, 0.1)',
                border: '1px solid rgba(79, 70, 229, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem'
            }}>
                <Info size={24} style={{ color: 'var(--primary-light)', flexShrink: 0, marginTop: '0.25rem' }} />
                <div style={{ color: 'var(--text-secondary)' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                        How the Web Crawler Works
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8' }}>
                        <li>Visits the specified URL and downloads the HTML content</li>
                        <li>Extracts text and identifies internet plan information</li>
                        <li>Parses pricing, speeds, and features using regex patterns</li>
                        <li>Saves the extracted data to a CSV file in your project folder</li>
                        <li>The data can then be indexed for search functionality</li>
                    </ul>
                </div>
            </div>

            <div className="crawler-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <Globe size={24} style={{ color: 'var(--primary-light)' }} />
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Start New Crawl</h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Enter a provider website URL to begin crawling. The system will extract plan data and save it for indexing.
                </p>

                <form onSubmit={handleCrawl} className="crawler-form">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/internet-plans"
                        required
                    />
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <>
                                <Zap size={16} />
                                Crawling...
                            </>
                        ) : (
                            <>
                                <Play size={16} />
                                Start Crawl
                            </>
                        )}
                    </button>
                </form>

                {status && (
                    <div className={`status-message ${status.includes('✗') ? 'error' : 'success'}`}>
                        {status.includes('✗') ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                        <div style={{ whiteSpace: 'pre-line' }}>{status}</div>
                    </div>
                )}

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        Quick Start URLs
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {quickUrls.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setUrl(item.url)}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                }}
                            >
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.95rem' }}>
                                    {item.name}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                    {item.desc}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                    {item.url}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrawlerControl;
