import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Wifi, Zap, Check, Database } from 'lucide-react';

interface Plan {
    provider: string;
    planName: string;
    price: string;
    speed: string;
    data: string;
    features?: string;
    category?: string;
    url?: string;
}

const BestPlan: React.FC = () => {
    const [bestPlans, setBestPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getPlans()
            .then((data: Plan[]) => {
                // Group plans by provider and find the best (lowest) price for each
                const providerMap = new Map<string, Plan>();

                data.forEach(plan => {
                    const currentBest = providerMap.get(plan.provider);
                    const currentPrice = parseInt(plan.price.replace(/[^0-9]/g, '')) || 999;

                    if (!currentBest) {
                        providerMap.set(plan.provider, plan);
                    } else {
                        const bestPrice = parseInt(currentBest.price.replace(/[^0-9]/g, '')) || 999;
                        if (currentPrice < bestPrice) {
                            providerMap.set(plan.provider, plan);
                        }
                    }
                });

                // Convert map to array and sort by price
                const bestPlansArray = Array.from(providerMap.values()).sort((a, b) => {
                    const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 999;
                    const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 999;
                    return priceA - priceB;
                });

                setBestPlans(bestPlansArray);
            })
            .finally(() => setLoading(false));
    }, []);

    const getProviderInitials = (provider: string): string => {
        if (provider === 'AT&T') return 'AT';
        return provider.substring(0, 2).toUpperCase();
    };

    const getProviderGradient = (provider: string): string => {
        const gradients: Record<string, string> = {
            'Bell': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'Rogers': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'Virgin': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'AT&T': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'Koodo': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        };
        return gradients[provider] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    };

    if (loading) {
        return (
            <div className="plans-page">
                <div className="hero-section">
                    <h1 className="hero-title">
                        <span className="brand">Best</span> <span className="accent">Plans</span>
                    </h1>
                    <p className="hero-subtitle">Loading best prices from each provider...</p>
                </div>
                <div className="plans-grid">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="plan-card loading-skeleton" style={{ height: '400px' }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="plans-page">
            <div className="hero-section">
                <h1 className="hero-title">
                    <span className="brand">Best</span> <span className="accent">Plans</span>
                </h1>
                <p className="hero-subtitle">Lowest price from each Canadian provider</p>
            </div>

            <div className="plans-grid">
                {bestPlans.map((plan, idx) => (
                    <div key={idx} className="plan-card">
                        <div className="plan-header">
                            <div className="plan-provider">
                                <div
                                    className="provider-logo"
                                    style={{ background: getProviderGradient(plan.provider) }}
                                >
                                    {getProviderInitials(plan.provider)}
                                </div>
                                <div className="provider-name">{plan.provider}</div>
                            </div>
                            <div className="plan-price">
                                <div className="price-amount">{plan.price}</div>
                                <div className="price-period">/month</div>
                            </div>
                        </div>

                        <div className="plan-name">{plan.planName}</div>

                        <div className="plan-details">
                            {plan.speed && plan.speed !== 'N/A' && (
                                <div className="detail-item">
                                    <Zap className="detail-icon" />
                                    <span className="detail-label">Speed</span>
                                    <span className="detail-value">{plan.speed}</span>
                                </div>
                            )}
                            {plan.data && plan.data !== 'N/A' && (
                                <div className="detail-item">
                                    <Database className="detail-icon" />
                                    <span className="detail-label">Data</span>
                                    <span className="detail-value">{plan.data}</span>
                                </div>
                            )}
                            {plan.category && (
                                <div className="detail-item">
                                    <Wifi className="detail-icon" />
                                    <span className="detail-label">Type</span>
                                    <span className="detail-value">{plan.category}</span>
                                </div>
                            )}
                        </div>

                        {plan.features && plan.features.trim() !== '' && (
                            <div className="plan-features">
                                <ul className="feature-list">
                                    {plan.features.split(',').slice(0, 3).map((feature, fIdx) => (
                                        <li key={fIdx} className="feature-item">
                                            <Check className="feature-check" />
                                            <span>{feature.trim()}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <a
                            href={plan.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="plan-cta"
                            style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
                        >
                            View Details
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BestPlan;
