import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Search, Star, Clock, Heart, ArrowRight } from 'lucide-react';

export default function Restaurants() {
  const { navigateTo, userProfile, toggleSaveRestaurant, restaurants, initialLoading, initialError } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  if (initialLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px', background: 'var(--bg-primary)' }}>
        <div className="loader" style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid rgba(255, 45, 45, 0.1)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', letterSpacing: '0.05em' }}>Loading FlavorDash kitchens...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (initialError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px', background: 'var(--bg-primary)', padding: '20px' }}>
        <div style={{ color: 'var(--accent-primary)', fontSize: '48px' }}>⚠️</div>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '20px' }}>Failed to Load Kitchens</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', textAlign: 'center' }}>{initialError}</p>
        <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding: '10px 24px' }}>Retry</button>
      </div>
    );
  }

  const restaurantsArray = restaurants;

  // Gather unique cuisines from database
  const allCuisines = ['All', ...new Set(restaurantsArray.flatMap(r => r.cuisine))];

  // Filtering logic
  const filteredRestaurants = restaurantsArray.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCuisine = selectedCuisine === 'All' || r.cuisine.includes(selectedCuisine);
    return matchesSearch && matchesCuisine;
  });

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '60px 0 120px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '48px', marginBottom: '16px' }}
          >
            Discover Exceptional Dining
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}
          >
            Explore elite culinary kitchens preparing classic recipes and modern fusions.
          </motion.p>
        </div>

        {/* Search and Filters panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          marginBottom: '50px'
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by restaurant name or cuisine type..."
              className="glass-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '50px' }}
            />
            <Search 
              size={18} 
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} 
            />
          </div>

          {/* Cuisine Chips */}
          <div style={{
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            paddingBottom: '10px',
            justifyContent: 'center',
            scrollbarWidth: 'none' // Firefox
          }} className="hide-scrollbar">
            {allCuisines.map((cuisine, idx) => {
              const isActive = selectedCuisine === cuisine;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCuisine(cuisine)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '30px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.03)',
                    color: 'white',
                    border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    transition: 'var(--transition-fast)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  {cuisine}
                </button>
              );
            })}
          </div>
        </div>

        {/* Restaurants Grid (3 columns desktop, 2 tablet, 1 mobile) */}
        {filteredRestaurants.length > 0 ? (
          <div className="restaurants-grid">
            {filteredRestaurants.map((res, index) => {
              const isSaved = userProfile.savedRestaurants.includes(res.id);
              return (
                <motion.div
                  key={res.id}
                  className="glass-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    position: 'relative'
                  }}
                >
                  {/* Save Restaurant Bookmark Button */}
                  <button
                    onClick={() => toggleSaveRestaurant(res.id)}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      zIndex: 10,
                      background: 'rgba(10, 10, 10, 0.7)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: isSaved ? 'var(--accent-primary)' : 'var(--text-muted)',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    <Heart size={16} fill={isSaved ? "var(--accent-primary)" : "none"} />
                  </button>

                  {/* Cover Image Container */}
                  <div style={{ height: '260px', overflow: 'hidden', position: 'relative' }} className="image-container">
                    <img 
                      src={res.coverImage} 
                      alt={res.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      className="res-cover-img"
                    />
                    
                    {/* Hover Overlay Actions */}
                    <div className="hover-overlay" style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(10, 10, 10, 0.75)',
                      backdropFilter: 'blur(3px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'var(--transition-smooth)',
                      zIndex: 5
                    }}>
                      <button 
                        className="btn-primary"
                        onClick={() => navigateTo('restaurant-detail', { restaurantId: res.id })}
                      >
                        Explore Menu <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Details Card */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 
                        onClick={() => navigateTo('restaurant-detail', { restaurantId: res.id })}
                        style={{ cursor: 'pointer', fontSize: '22px', fontWeight: 600 }}
                      >
                        {res.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FBBF24', fontSize: '15px' }}>
                        <Star size={14} fill="#FBBF24" />
                        <span style={{ color: 'white', fontWeight: 600 }}>{res.rating}</span>
                      </div>
                    </div>

                    {/* Cuisine Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {res.cuisine.map((c, i) => (
                        <span 
                          key={i} 
                          style={{
                            fontSize: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '4px 10px',
                            borderRadius: '30px',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', flex: 1 }}>
                      {res.description}
                    </p>

                    {/* Footer Stats of restaurant */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '16px',
                      fontSize: '14px',
                      color: 'var(--text-muted)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        <span>{res.deliveryTime} mins</span>
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {res.priceRange}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              {restaurantsArray.length === 0 ? 'No restaurants found.' : 'No kitchens found matching your filters.'}
            </p>
            {restaurantsArray.length > 0 && (
              <button className="btn-secondary" onClick={() => { setSearchQuery(''); setSelectedCuisine('All'); }} style={{ marginTop: '20px' }}>
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid structure styling */}
      <style>{`
        .restaurants-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .glass-card:hover .res-cover-img {
          transform: scale(1.06);
        }
        .glass-card:hover .hover-overlay {
          opacity: 1 !important;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 1024px) {
          .restaurants-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 700px) {
          .restaurants-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
