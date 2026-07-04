import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { restaurants, dishes } from '../data/mockData';
import InteractiveMap from '../components/InteractiveMap';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, MapPin, Calendar, Heart, ShoppingBag, Plus, Minus, X } from 'lucide-react';

export default function RestaurantDetails() {
  const { 
    activeRestaurantId, 
    navigateTo, 
    cartItems, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    cartSubtotal,
    userProfile,
    toggleSaveRestaurant 
  } = useApp();

  const [activeTab, setActiveTab] = useState('All');
  const [reservationOpen, setReservationOpen] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [reservationDetails, setReservationDetails] = useState({ date: '', time: '', guests: 2 });

  // Fallback to restaurant 1 if none active
  const targetId = activeRestaurantId || 'r1';
  const res = restaurants.find(r => r.id === targetId) || restaurants[0];
  const resDishes = dishes.filter(d => d.restaurantId === res.id);
  const isSaved = userProfile.savedRestaurants.includes(res.id);

  // Tabs list
  const tabs = ['All', 'Starters', 'Mains', 'Desserts'];

  const filteredDishes = resDishes.filter(d => activeTab === 'All' || d.category === activeTab);

  // Reservation handler
  const handleReservation = (e) => {
    e.preventDefault();
    setReserveSuccess(true);
    setTimeout(() => {
      setReservationOpen(false);
      setReserveSuccess(false);
    }, 3000);
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* 1. HERO BANNER */}
      <div style={{
        height: '420px',
        position: 'relative',
        backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 10, 0.4) 0%, rgba(10, 10, 10, 0.95) 100%), url(${res.coverImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '40px'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          {/* Info Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Cuisine tags */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {res.cuisine.map((c, i) => (
                <span key={i} style={{
                  fontSize: '12px',
                  background: 'var(--accent-gradient)',
                  padding: '4px 12px',
                  borderRadius: '30px',
                  fontWeight: 600,
                  letterSpacing: '0.05em'
                }}>
                  {c}
                </span>
              ))}
            </div>
            <h1 style={{ fontSize: '48px', margin: 0, fontFamily: 'var(--font-heading)' }}>{res.name}</h1>
            
            {/* Ratings & Stats */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '15px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FBBF24' }}>
                <Star size={16} fill="#FBBF24" />
                <span style={{ color: 'white', fontWeight: 600 }}>{res.rating}</span>
                <span>({res.reviewsCount} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} />
                <span>{res.deliveryTime} mins delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} />
                <span>{res.location}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => toggleSaveRestaurant(res.id)}
              className="btn-secondary" 
              style={{ width: '50px', height: '50px', padding: 0, borderRadius: '50%' }}
            >
              <Heart size={20} fill={isSaved ? "var(--accent-primary)" : "none"} style={{ color: isSaved ? "var(--accent-primary)" : "white" }} />
            </button>
            <button 
              onClick={() => setReservationOpen(true)}
              className="btn-primary"
            >
              <Calendar size={18} /> Book Table
            </button>
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT LAYOUT */}
      <section style={{ padding: '60px 0 120px 0' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '60px',
          alignItems: 'start'
        }} className="details-layout-grid">
          
          {/* Left Column: Menu & Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
            
            {/* Description */}
            <div>
              <h2 style={{ fontSize: '26px', marginBottom: '16px' }}>About The Restaurant</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '16px' }}>
                {res.description}
              </p>
            </div>

            {/* Gallery */}
            <div>
              <h2 style={{ fontSize: '26px', marginBottom: '24px' }}>Interior Gallery</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }} className="gallery-grid">
                {res.gallery.map((img, idx) => (
                  <div key={idx} style={{ height: '140px', borderRadius: '12px', overflow: 'hidden' }}>
                    <img 
                      src={img} 
                      alt="Interior view" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Sections with Tabs */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '20px',
                marginBottom: '30px'
              }}>
                <h2 style={{ fontSize: '26px', margin: 0 }}>Gourmet Selection</h2>
                {/* Tabs bar */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {tabs.map((tab, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        background: activeTab === tab ? 'white' : 'transparent',
                        color: activeTab === tab ? 'black' : 'var(--text-muted)',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dishes Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="glass-card"
                    style={{
                      padding: '20px',
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr auto',
                      gap: '24px',
                      alignItems: 'center'
                    }}
                    className="dish-row"
                  >
                    <img 
                      src={dish.image} 
                      alt={dish.name}
                      onClick={() => navigateTo('food-detail', { foodId: dish.id })}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: '1px solid var(--border-color)'
                      }}
                    />
                    <div>
                      <h4 
                        onClick={() => navigateTo('food-detail', { foodId: dish.id })}
                        style={{ cursor: 'pointer', fontSize: '18px', fontWeight: 600 }}
                      >
                        {dish.name}
                      </h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px', lineHeight: '1.5' }}>
                        {dish.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FBBF24', fontSize: '13px', marginTop: '8px' }}>
                        <Star size={12} fill="#FBBF24" />
                        <span style={{ color: 'white', fontWeight: 600 }}>{dish.rating}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 700 }}>${dish.price.toFixed(2)}</span>
                      <button
                        onClick={() => addToCart(dish)}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placement */}
            <div>
              <h2 style={{ fontSize: '26px', marginBottom: '24px' }}>Location Map</h2>
              <InteractiveMap 
                pins={[{ label: res.name, x: 50, y: 50, type: 'restaurant' }]}
                height="300px"
              />
            </div>

            {/* Reviews Section */}
            <div>
              <h2 style={{ fontSize: '26px', marginBottom: '24px' }}>Gastronomy Reviews</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {dishes.find(d => d.restaurantId === res.id)?.reviews.map((rev, idx) => (
                  <div key={idx} style={{
                    padding: '24px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 600, fontSize: '15px' }}>{rev.user}</span>
                      <div style={{ display: 'flex', gap: '2px', color: '#FBBF24' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} fill={i < Math.floor(rev.rating) ? "#FBBF24" : "none"} />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Summary */}
          <div style={{ position: 'sticky', top: '120px' }} className="sticky-sidebar">
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <ShoppingBag size={20} style={{ color: 'var(--accent-primary)' }} />
                <h3 style={{ fontSize: '20px', margin: 0 }}>Order Summary</h3>
              </div>

              {cartItems.length > 0 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                    {cartItems.map((item) => (
                      <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, display: 'block' }}>{item.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>${item.price.toFixed(2)} each</span>
                        </div>
                        
                        {/* Adjust quantities */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '4px 8px' }}>
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 700 }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ height: '1px', background: 'var(--border-color)', margin: '10px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>${cartSubtotal.toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={() => navigateTo('cart')} 
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    Proceed to Cart
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '14px' }}>Your shopping cart is currently empty.</p>
                  <button 
                    className="btn-secondary" 
                    onClick={() => navigateTo('menu')}
                    style={{ marginTop: '16px', padding: '10px 20px', fontSize: '13px' }}
                  >
                    View Menu Items
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Reservation Modal Overlay */}
      <AnimatePresence>
        {reservationOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="glass-card" 
              style={{
                width: '100%',
                maxWidth: '450px',
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                position: 'relative'
              }}
            >
              <button 
                onClick={() => setReservationOpen(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>

              <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)' }}>Table Reservation</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '-12px' }}>
                Secure a private table at {res.name}.
              </p>

              {reserveSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#10B981' }}>
                  <Star className="spin-slow" size={32} style={{ marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '18px', fontWeight: 600 }}>Reservation Confirmed</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    A confirmation code has been dispatched to your profile email.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReservation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Reservation Date</label>
                    <input 
                      type="date" 
                      required 
                      className="glass-input" 
                      value={reservationDetails.date} 
                      onChange={(e) => setReservationDetails(prev => ({ ...prev, date: e.target.value }))}
                      style={{ color: 'white' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Dining Time Slot</label>
                    <input 
                      type="time" 
                      required 
                      className="glass-input" 
                      value={reservationDetails.time} 
                      onChange={(e) => setReservationDetails(prev => ({ ...prev, time: e.target.value }))}
                      style={{ color: 'white' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Guests count</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      required 
                      className="glass-input" 
                      value={reservationDetails.guests} 
                      onChange={(e) => setReservationDetails(prev => ({ ...prev, guests: Number(e.target.value) }))}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                    Confirm Dining Reservation
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 992px) {
          .details-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .sticky-sidebar {
            position: relative !important;
            top: 0 !important;
            margin-top: 40px;
          }
        }
        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: 1fr !important;
          }
          .dish-row {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .dish-row img {
            width: 150px !important;
            height: 150px !important;
            margin: 0 auto;
          }
          .dish-row div {
            align-items: center !important;
          }
        }
      `}</style>
    </div>
  );
}
