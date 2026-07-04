import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Search, Star, ShoppingCart, Sparkles, Eye } from 'lucide-react';

export default function Menu() {
  const { navigateTo, addToCart, dishes, categories: categoryData, initialLoading, initialError } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', letterSpacing: '0.05em' }}>Loading FlavorDash culinary menu...</p>
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
        <h3 style={{ color: 'var(--text-primary)', fontSize: '20px' }}>Failed to Load Menu</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', textAlign: 'center' }}>{initialError}</p>
        <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding: '10px 24px' }}>Retry</button>
      </div>
    );
  }

  const categories = ['All', ...(categoryData.length > 0 ? categoryData.map(category => category.name) : ['Starters', 'Mains', 'Desserts'])];

  // Filtering
  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (dish.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (dish.ingredients || []).some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || dish.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '60px 0 120px 0' }}>
      <div className="container">
        
        {/* Header Area */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '30px',
          marginBottom: '60px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '40px'
        }}>
          <div>
            <h1 style={{ fontSize: '48px', marginBottom: '12px' }}>Curated Masterpieces</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
              Explore sensory gastronomy prepared by world-class culinary artists.
            </p>
          </div>
          {/* AI Meal Planner CTA */}
          <button 
            className="btn-primary" 
            onClick={() => navigateTo('planner')}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF2D2D 100%)',
              boxShadow: '0 0 25px rgba(255, 107, 53, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Sparkles size={16} /> AI Meal Planner
          </button>
        </div>

        {/* Filter & Search Dashboard */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '50px'
        }}>
          {/* Categories Tab Bar */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? 'white' : 'rgba(255, 255, 255, 0.02)',
                  color: activeCategory === cat ? 'black' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search fine dishes or ingredients..."
              className="glass-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '44px' }}
            />
            <Search 
              size={16} 
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </div>
        </div>

        {/* Menu Catalog Grid */}
        {filteredDishes.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '40px'
          }}>
            {filteredDishes.map((dish, index) => (
              <motion.div
                key={dish.id}
                className="glass-card menu-dish-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative'
                }}
              >
                {/* Image Container with Zoom */}
                <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }} className="dish-img-container">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className="menu-dish-image"
                  />
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(10, 10, 10, 0.8)',
                    padding: '6px 12px',
                    borderRadius: '30px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--accent-secondary)'
                  }}>
                    {dish.category}
                  </div>

                  {/* Quick-view Details Overlay */}
                  <div className="dish-hover-overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(10, 10, 10, 0.6)',
                    backdropFilter: 'blur(2px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    opacity: 0,
                    transition: 'var(--transition-smooth)'
                  }}>
                    <button
                      onClick={() => navigateTo('food-detail', { foodId: dish.id })}
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: 'black',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => addToCart(dish)}
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(255, 45, 45, 0.3)',
                        transition: 'var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>

                {/* Details Content */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 
                      onClick={() => navigateTo('food-detail', { foodId: dish.id })}
                      style={{ cursor: 'pointer', fontSize: '20px', fontWeight: 600 }}
                    >
                      {dish.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FBBF24', fontSize: '14px' }}>
                    <Star size={14} fill="#FBBF24" />
                    <span style={{ color: 'white', fontWeight: 600 }}>{dish.rating}</span>
                  </div>

                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', flex: 1 }}>
                    {dish.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '16px',
                    marginTop: '8px'
                  }}>
                    <span style={{ fontSize: '24px', fontWeight: 700 }}>
                      ${dish.price.toFixed(2)}
                    </span>
                    
                    {/* Add to Cart quick button */}
                    <button
                      onClick={() => addToCart(dish)}
                      className="btn-primary"
                      style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        borderRadius: '30px'
                      }}
                    >
                      Add To Cart
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No signature dishes found matching your query.</p>
            <button className="btn-secondary" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} style={{ marginTop: '20px' }}>
              Show All Menu
            </button>
          </div>
        )}
      </div>

      {/* Styled states */}
      <style>{`
        .menu-dish-card:hover .menu-dish-image {
          transform: scale(1.08);
        }
        .menu-dish-card:hover .dish-hover-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
