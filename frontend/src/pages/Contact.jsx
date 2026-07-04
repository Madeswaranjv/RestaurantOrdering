import React, { useState } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/contact', form);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '60px 0 120px 0' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '12px' }}>Connect With FlavorDash</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            Inquire about corporate events, customized culinary menus, or customer partner accounts.
          </p>
        </div>

        {/* Two Columns Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '60px',
          alignItems: 'start'
        }} className="contact-grid">
          
          {/* Left Column: Form */}
          <div className="glass-card" style={{ padding: '40px' }}>
            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
              Send Inquiry
            </h3>
            
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#10B981' }}>
                <CheckCircle size={48} style={{ marginBottom: '16px' }} />
                <h4 style={{ fontSize: '20px', fontWeight: 600 }}>Message Transmitted</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Our concierge concierge will respond within 4 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {error && (
                  <div style={{
                    color: 'var(--accent-primary)',
                    fontSize: '14px',
                    background: 'rgba(255, 45, 45, 0.08)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 45, 45, 0.2)'
                  }}>
                    {error}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Patron Name</label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    placeholder="Enter your name..."
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Private Email</label>
                  <input
                    type="email"
                    required
                    className="glass-input"
                    placeholder="name@domain.com"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Subject</label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    placeholder="e.g. Catering options..."
                    value={form.subject}
                    onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Detailed Message</label>
                  <textarea
                    required
                    rows="5"
                    className="glass-input"
                    placeholder="Describe your inquiry..."
                    value={form.message}
                    onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    style={{ resize: 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    opacity: submitting ? 0.6 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send size={16} /> {submitting ? 'Transmitting Inquiring...' : 'Send Inquiry Message'}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Business Info & Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Info Cards */}
            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Business Office
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '15px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <MapPin size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <span>42 Sterling Sq, Chelsea, London SW3 2HJ</span>
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <Phone size={18} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                  <span>+44 20 7946 0958 (Concierge desk)</span>
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <Mail size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <span>concierge@flavordash.com</span>
                </div>
              </div>
            </div>

            {/* Hours card */}
            <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                Working Hours
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                  <span>Lunch tasting</span>
                  <span style={{ color: 'white', fontWeight: 500 }}>12:00 PM — 3:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                  <span>Dinner service</span>
                  <span style={{ color: 'white', fontWeight: 500 }}>6:00 PM — 11:30 PM</span>
                </div>
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                  <span>Concierge chat support</span>
                  <span style={{ color: 'white', fontWeight: 500 }}>24 Hours / 7 Days</span>
                </div>
              </div>
            </div>

            {/* Headquarters Map */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Headquarters Map</h3>
              <InteractiveMap 
                pins={[{ label: "FlavorDash HQ", x: 50, y: 50, type: 'restaurant' }]}
                height="220px"
              />
            </div>

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
