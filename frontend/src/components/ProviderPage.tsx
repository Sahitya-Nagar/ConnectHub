import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Wifi, Check, ArrowRight } from 'lucide-react';
import NetworkCoverage from './NetworkCoverage';

interface Plan {
    provider: string;
    name: string;
    price: string;
    speed: string;
    data: string;
    category?: string;
    url?: string;
}

// Helper function to generate provider URLs
const getProviderUrl = (provider: string): string => {
    const urls: { [key: string]: string } = {
        'Rogers': 'https://www.rogers.com/internet',
        'Bell': 'https://www.bell.ca/Bell_Internet',
        'Virgin Plus': 'https://www.virgin.com/en/internet',
        'AT&T': 'https://www.att.com/internet/',
        'Koodo': 'https://www.koodomobile.com/rate-plans'
    };
    return urls[provider] || '#';
};

interface ProviderPageProps {
    providerName: string;
    logoColor: string;
}

const ProviderPage: React.FC<ProviderPageProps> = ({ providerName, logoColor }) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                // In a real app, we might have a specific endpoint or filter param
                // For now, we fetch all and filter client-side
                const allPlans = await api.getPlans();

                // Normalize provider names for comparison
                const normalizedProvider = providerName.toLowerCase()
                    .replace(' mobile', '')
                    .replace('&', '')
                    .replace(/\s+/g, '');

                const filteredPlans = allPlans.filter((plan: any) => {
                    const pName = (plan.provider || '').toLowerCase()
                        .replace('&', '')
                        .replace(/\s+/g, '');
                    const category = (plan.category || '').toLowerCase();

                    // Only show internet plans, exclude mobile plans
                    const isInternetPlan = !category.includes('mobile') &&
                        (category.includes('internet') || category.includes('home'));

                    return (pName.includes(normalizedProvider) || normalizedProvider.includes(pName)) && isInternetPlan;
                });

                setPlans(filteredPlans);
            } catch (error) {
                console.error("Failed to fetch plans", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [providerName]);

    return (
        <div className="provider-page">
            <div className="provider-hero" style={{ background: `linear-gradient(135deg, ${logoColor}20 0%, #000000 100%)` }}>
                <div className="provider-hero-content">
                    <h1 className="provider-title" style={{ color: logoColor }}>{providerName}</h1>
                    <p className="provider-subtitle">Find the perfect connection with {providerName}'s top-rated plans.</p>
                </div>
            </div>

            <div className="provider-content">
                <div className="section-header">
                    <h2 className="section-title">Available Plans</h2>
                    <div className="section-line"></div>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading plans...</div>
                ) : plans.length > 0 ? (
                    <div className="plans-grid">
                        {plans.map((plan, index) => (
                            <div key={index} className="plan-card">
                                <div className="plan-header">
                                    <h3 className="plan-name">{plan.name}</h3>
                                    <div className="plan-price">{plan.price}<span className="period">/mo</span></div>
                                </div>
                                <div className="plan-features">
                                    <div className="feature-item">
                                        <Wifi size={16} className="feature-icon" />
                                        <span>{plan.speed} Speed</span>
                                    </div>
                                    <div className="feature-item">
                                        <Check size={16} className="feature-icon" />
                                        <span>{plan.data} Data</span>
                                    </div>
                                </div>
                                <a
                                    href={plan.url || getProviderUrl(providerName)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="plan-button"
                                    style={{ backgroundColor: logoColor, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    View Details <ArrowRight size={16} />
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-plans">
                        <p>No plans currently available for {providerName}.</p>
                    </div>
                )}

                <NetworkCoverage provider={providerName} />
            </div>
        </div>
    );
};

export default ProviderPage;
