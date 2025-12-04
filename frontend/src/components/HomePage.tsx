
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HomePage = () => {
    const teamMembers = [
        { name: 'Sahitya Nagar', id: '110201229', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        { name: "Dev Kansara", id: '110156575', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        { name: 'Jaimil Kohtari', id: '110156142', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        { name: 'Sarhan Kapadiya', id: '110157142', image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Connect<span className="highlight">Hub</span>
                    </h1>
                    <h2 className="hero-subtitle">Your Gateway to Better Internet</h2>
                    <p className="hero-description">
                        Find the perfect connection
                    </p>
                    <Link to="/best-plan" className="hero-cta">
                        Explore Plans <ArrowRight size={20} />
                    </Link>
                </div>
                <div className="hero-image">
                    <img
                        src="/src/assets/hero_illustration.png"
                        alt="Internet Matrix Illustration"
                        className="floating-illustration"
                    />
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section">
                <div className="section-header">
                    <h2 className="section-title">Our Team</h2>
                    <div className="section-line"></div>
                </div>
                <p className="team-description">
                    Meet our dynamic team of innovative developers and creative designers.
                </p>

                <div className="team-grid">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="team-card">
                            <div className="member-image-wrapper">
                                <img src={member.image} alt={member.name} className="member-image" />
                            </div>
                            <h3 className="member-name">{member.name}</h3>
                            <p className="member-id">{member.id}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
