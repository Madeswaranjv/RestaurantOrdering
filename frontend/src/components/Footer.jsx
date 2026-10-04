import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Send } from 'lucide-react';

export default function Footer() {
  const { navigateTo } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-color)',
      paddingTop: '80px',
      paddingBottom: '40px',
      color: 'var(--text-primary)'
    }}>
      <div className="container">
        {/* Upper footer grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '60px',
          marginBottom: '60px'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div 
              onClick={() => navigateTo('home')} 
              style={{ cursor: 'pointer', display: 'inline-flex' }}
              title="FlavorDash"
            >
              <img 
                src="/logo.png" 
                alt="FlavorDash" 
                className="brand-logo" 
                style={{ height: '46px', maxWidth: '200px' }} 
              />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
              Experience the absolute pinnacle of luxury culinary delivery. We partner with the world's most acclaimed chefs to bring Michelin-starred dining directly to your private table.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
              {[
                { 
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  ), 
                  link: '#' 
                },
                { 
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  ), 
                  link: '#' 
                },
                { 
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  ), 
                  link: '#' 
                }
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.background = 'rgba(255, 45, 45, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', letterSpacing: '0.05em' }}>
              NAVIGATION
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { page: 'home', label: 'Home' },
                { page: 'restaurants', label: 'Restaurants' },
                { page: 'menu', label: 'Menu' },
                { page: 'about', label: 'About Us' },
                { page: 'contact', label: 'Contact' }
              ].map((link, idx) => (
                <li key={idx}>
                  <div
                    onClick={() => navigateTo(link.page)}
                    style={{
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      fontSize: '15px',
                      transition: 'var(--transition-fast)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {link.label}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', letterSpacing: '0.05em' }}>
              SUPPORT
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { page: 'profile', label: 'My Account' },
                { page: 'delivery-dashboard', label: 'Delivery Partner Portal' },
                { page: 'home', label: 'FAQs & Help' },
                { page: 'about', label: 'Our Story' }
              ].map((link, idx) => (
                <li key={idx}>
                  <div
                    onClick={() => navigateTo(link.page)}
                    style={{
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      fontSize: '15px',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {link.label}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', letterSpacing: '0.05em' }}>
              NEWSLETTER
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
              Subscribe to receive private invitations to exclusive chef pop-ups, tasting menus, and secret culinary releases.
            </p>
            <form onSubmit={handleSubscribe} style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="glass-input"
                placeholder="Your private email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingRight: '50px' }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--accent-primary)',
                  border: 'none',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                <Send size={14} />
              </button>
            </form>
            {subscribed && (
              <p style={{ color: '#10B981', fontSize: '14px', marginTop: '10px', transition: 'var(--transition-fast)' }}>
                Subscription successful. Welcome to the inner circle.
              </p>
            )}
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: '1px', background: 'var(--border-color)', margin: '40px 0' }} />

        {/* Bottom footer bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          color: 'var(--text-muted)',
          fontSize: '14px'
        }}>
          <div>
            © {new Date().getFullYear()} FlavorDash Inc. All rights reserved. Crafted for elite tastebuds.
          </div>
          <div style={{ display: 'flex', gap: '30px' }}>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
