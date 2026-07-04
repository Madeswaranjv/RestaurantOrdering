import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { currentPage, navigateTo, cartItems } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleNavClick = (page) => {
    navigateTo(page);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'menu', label: 'Menu' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <>
      <nav className="glass-navbar" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '90px',
        display: 'flex',
        alignItems: 'center',
        transition: 'var(--transition-smooth)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('home')} 
            style={{ 
              cursor: 'pointer', 
              fontSize: '32px', 
              fontWeight: 800, 
              letterSpacing: '-0.03em', 
              fontFamily: 'var(--font-heading)'
            }}
          >
            Flavor<span style={{ color: 'var(--accent-primary)' }}>Dash</span>
          </div>

          {/* Desktop Nav */}
          <div className="desktop-only" style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            {navLinks.map(link => {
              const isActive = currentPage === link.id;
              return (
                <div
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  style={{
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    transition: 'var(--transition-fast)',
                    position: 'relative',
                    padding: '8px 0'
                  }}
                >
                  {link.label}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      background: 'var(--accent-gradient)',
                      borderRadius: '2px'
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Icons & CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Search Icon */}
            <div 
              onClick={() => setSearchOpen(prev => !prev)} 
              style={{ cursor: 'pointer', color: 'var(--text-muted)', transition: 'var(--transition-fast)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Search size={20} />
            </div>

            {/* Cart Icon */}
            <div 
              onClick={() => navigateTo('cart')}
              style={{ cursor: 'pointer', position: 'relative', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: 'var(--accent-primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  boxShadow: '0 0 10px rgba(255, 45, 45, 0.4)'
                }}>
                  {cartCount}
                </div>
              )}
            </div>

            {/* Profile Icon */}
            <div 
              onClick={() => navigateTo('profile')}
              style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <User size={20} />
            </div>

            {/* CTA */}
            <button 
              className="btn-primary desktop-only" 
              onClick={() => navigateTo('menu')}
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              Order Now
            </button>

            {/* Mobile Menu Icon */}
            <div 
              className="mobile-only" 
              onClick={() => setMobileMenuOpen(prev => !prev)} 
              style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '90px',
            left: 0,
            width: '100%',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            zIndex: 99
          }}>
            {navLinks.map(link => (
              <div
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  color: currentPage === link.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                {link.label}
              </div>
            ))}
            <button 
              className="btn-primary" 
              onClick={() => handleNavClick('menu')}
              style={{ marginTop: '10px', width: '100%' }}
            >
              Order Now
            </button>
          </div>
        )}
      </nav>

      {/* Dropdown Search Overlay */}
      {searchOpen && (
        <div style={{
          position: 'fixed',
          top: '90px',
          left: 0,
          width: '100%',
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '24px 0',
          zIndex: 98,
          transition: 'all 0.3s ease'
        }}>
          <div className="container" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Search fine dishes, luxury dining, cuisines..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigateTo('menu');
                  setSearchOpen(false);
                }
              }}
              style={{ flex: 1 }}
              autoFocus
            />
            <button 
              className="btn-primary" 
              onClick={() => {
                navigateTo('menu');
                setSearchOpen(false);
              }}
              style={{ padding: '14px 28px' }}
            >
              Search
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setSearchOpen(false)}
              style={{ padding: '14px 20px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Style overrides for responsive navbar display */}
      <style>{`
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
    </>
  );
}
