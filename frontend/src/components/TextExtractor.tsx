import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const TextExtractor: React.FC = () => {
    const [domain, setDomain] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [processedData, setProcessedData] = useState<{
        emails: { value: string, valid: boolean }[],
        phones: { value: string, valid: boolean }[],
        urls: string[]
    } | null>(null);
    const [totalEmails, setTotalEmails] = useState(0);

    const validateEmail = (email: string): boolean => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    const extractURL = (text: string): string[] => {
        const regex = /https?:\/\/[^\s]+/g;
        return text.match(regex) || [];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (file) {
            const text = await file.text();

            // Extract emails
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            let emails = (text.match(emailRegex) || []).map(email => ({
                value: email,
                valid: validateEmail(email)
            }));

            setTotalEmails(emails.length);

            // Filter emails by domain if specified
            if (domain.trim()) {
                const domainLower = domain.trim().toLowerCase();
                emails = emails.filter(email => {
                    const emailParts = email.value.split('@');
                    if (emailParts.length !== 2) return false;
                    const emailDomain = emailParts[1].toLowerCase();
                    return emailDomain.includes(domainLower);
                });
            }

            // Extract phone numbers (always show all)
            const phoneRegex = /(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}/g;
            const phones = (text.match(phoneRegex) || []).map(phone => ({
                value: phone,
                valid: true
            }));

            // Extract URLs (always show all)
            const urls = extractURL(text);

            setProcessedData({ emails, phones, urls });
        }
    };

    return (
        <div className="feature-page">
            <h1 className="feature-title">Text Extractor</h1>
            <div className="feature-underline"></div>

            <div style={{ maxWidth: '600px', margin: '3rem auto' }}>
                <form onSubmit={handleSubmit} className="extractor-form">
                    <div className="form-group">
                        <label>Domain (e.g., "gmail" to filter Gmail emails only)</label>
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="Enter domain name (optional)"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>File Input</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                accept=".txt,.csv"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="file-input-label">
                                <Upload size={20} />
                                {file ? file.name : 'Choose File'}
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={!file}>
                        Submit
                    </button>
                </form>

                {processedData && (
                    <div className="processed-data">
                        <h2 className="processed-title">Processed Data:</h2>

                        <div className="data-section">
                            <h3>Emails Validated {domain && `(filtered by "${domain}")`}</h3>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                Found {totalEmails} total emails in file.
                            </p>
                            {processedData.emails.length > 0 ? (
                                processedData.emails.map((email, idx) => (
                                    <div key={idx} className={`data-item ${email.valid ? 'valid' : 'invalid'}`}>
                                        {email.value} - {email.valid ? 'Valid' : 'Invalid'}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {domain ? `No emails found matching "${domain}"` : 'No emails found'}
                                </p>
                            )}
                        </div>

                        <div className="data-section">
                            <h3>Phone Numbers</h3>
                            {processedData.phones.length > 0 ? (
                                processedData.phones.map((phone, idx) => (
                                    <div key={idx} className={`data-item ${phone.valid ? 'valid' : 'invalid'}`}>
                                        {phone.value} - {phone.valid ? 'Valid' : 'Invalid'}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-secondary)' }}>No phones found</p>
                            )}
                        </div>

                        <div className="data-section">
                            <h3>URLs</h3>
                            {processedData.urls.length > 0 ? (
                                processedData.urls.map((url, idx) => (
                                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="data-item url-item">
                                        {url}
                                    </a>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-secondary)' }}>No URLs found</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextExtractor;
