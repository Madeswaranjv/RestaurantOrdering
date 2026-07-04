import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { restaurants } from '../data/mockData';
import { motion } from 'framer-motion';
import { User, Clock, Heart, MapPin, CreditCard, Settings, Edit3, CheckCircle, Package } from 'lucide-react';

export default function UserProfile() {
  const { userProfile, updateProfile, toggleSaveRestaurant, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState('overview'); // overview, history, saved, settings
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfile({ name, email, phone });
    setIsEditing(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User size={16} /> },
    { id: 'history', label: 'Order History', icon: <Clock size={16} /> },
    { id: 'saved', label: 'Saved Restaurants', icon: <Heart size={16} /> },
    { id: 'settings', label: 'Account Settings', icon: <Settings size={16} /> }
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '60px 0 120px 0' }}>
      <div className="container">
        
        {/* Layout Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '50px',
          alignItems: 'start'
        }} className="profile-layout-grid">
          
          {/* Left Sidebar Navigation */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* User Profile Avatar / Info */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <img 
                src={userProfile.avatar} 
                alt={userProfile.name} 
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: '14px',
                  border: '2px solid var(--accent-primary)'
                }}
              />
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{userProfile.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Elite Gold Member</p>
            </div>

            {/* Sidebar Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 18px',
                      background: isActive ? 'rgba(255, 45, 45, 0.08)' : 'transparent',
                      color: isActive ? 'white' : 'var(--text-muted)',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: 500,
                      textAlign: 'left',
                      transition: 'var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >
                    <span style={{ color: isActive ? 'var(--accent-primary)' : 'inherit' }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Panel Content */}
          <div style={{ minHeight: '500px' }}>
            
            {/* 1. OVERVIEW VIEW */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* Stats grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '20px'
                }} className="profile-stats-grid">
                  {[
                    { label: "Total Orders placed", value: userProfile.orderHistory.length, icon: <Package style={{ color: 'var(--accent-primary)' }} /> },
                    { label: "Saved Restaurants", value: userProfile.savedRestaurants.length, icon: <Heart style={{ color: 'var(--accent-secondary)' }} /> },
                    { label: "Registered Addresses", value: userProfile.addresses.length, icon: <MapPin style={{ color: 'var(--accent-primary)' }} /> }
                  ].map((stat, i) => (
                    <div key={i} className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</span>
                        <span style={{ display: 'block', fontSize: '32px', fontWeight: 700, marginTop: '8px' }}>{stat.value}</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '10px' }}>
                        {stat.icon}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active/Recent Order Track */}
                <div className="glass-card" style={{ padding: '30px' }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                    Active Order Status
                  </h3>
                  {userProfile.orderHistory.some(o => o.status === "Preparing" || o.status === "On the Way" || o.status === "Arrived at Store") ? (
                    (() => {
                      const activeOrder = userProfile.orderHistory.find(o => o.status === "Preparing" || o.status === "On the Way" || o.status === "Arrived at Store");
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>ORDER REFERENCE</span>
                              <h4 style={{ fontSize: '18px', fontWeight: 600, marginTop: '4px' }}>{activeOrder.id} ({activeOrder.restaurantName})</h4>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>DELIVERY STATUS</span>
                              <div style={{
                                background: 'rgba(255, 45, 45, 0.08)',
                                border: '1px solid rgba(255, 45, 45, 0.2)',
                                color: 'var(--accent-secondary)',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '13px',
                                fontWeight: 600,
                                marginTop: '4px',
                                display: 'inline-block'
                              }}>
                                {activeOrder.status}
                              </div>
                            </div>
                          </div>

                          {/* Quick track progress */}
                          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', gap: '10px', marginTop: '10px' }}>
                            {['Preparing', 'Arrived at Store', 'On the Way', 'Completed'].map((st, idx) => {
                              const orderStatusValues = { "Preparing": 1, "Arrived at Store": 2, "On the Way": 3, "Completed": 4 };
                              const activeOrderVal = orderStatusValues[activeOrder.status] || 1;
                              const currentVal = orderStatusValues[st];
                              const isPassed = activeOrderVal >= currentVal;

                              return (
                                <div key={idx} style={{ flex: 1 }}>
                                  <div style={{
                                    height: '6px',
                                    background: isPassed ? 'var(--accent-primary)' : 'var(--border-color)',
                                    borderRadius: '3px'
                                  }} />
                                  <span style={{
                                    fontSize: '12px',
                                    color: isPassed ? 'white' : 'var(--text-muted)',
                                    fontWeight: 500,
                                    marginTop: '8px',
                                    display: 'block',
                                    textAlign: 'center'
                                  }}>
                                    {st}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          
                          <button onClick={() => navigateTo('checkout')} className="btn-secondary" style={{ width: 'fit-content', marginTop: '10px' }}>
                            View GPS Tracking Map
                          </button>
                        </div>
                      );
                    })()
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No active deliveries. Place an order to review live statuses.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* 2. ORDER HISTORY VIEW */}
            {activeTab === 'history' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
                  Historic Billings
                </h3>
                {userProfile.orderHistory.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {userProfile.orderHistory.map((order, i) => (
                      <div key={i} style={{
                        padding: '20px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '20px',
                        alignItems: 'center'
                      }} className="history-row">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 600 }}>{order.restaurantName}</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{order.date}</span>
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
                            {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 700 }}>${order.total.toFixed(2)}</span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: order.status === 'Completed' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 45, 45, 0.08)',
                            color: order.status === 'Completed' ? '#10B981' : 'var(--accent-secondary)',
                            border: order.status === 'Completed' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255, 45, 45, 0.2)'
                          }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No order history yet.</p>
                )}
              </motion.div>
            )}

            {/* 3. SAVED RESTAURANTS VIEW */}
            {activeTab === 'saved' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '24px'
                }} className="saved-restaurants-grid">
                  {userProfile.savedRestaurants.length > 0 ? (
                    userProfile.savedRestaurants.map(resId => {
                      const res = restaurants.find(r => r.id === resId);
                      if (!res) return null;
                      return (
                        <div key={res.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                          <div style={{ height: '160px', overflow: 'hidden' }}>
                            <img src={res.coverImage} alt={res.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 600 }}>{res.name}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', flex: 1 }}>{res.cuisine.join(' • ')}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '6px' }}>
                              <button onClick={() => navigateTo('restaurant-detail', { restaurantId: res.id })} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                                View Menu
                              </button>
                              <button onClick={() => toggleSaveRestaurant(res.id)} className="btn-secondary" style={{ padding: '6px 10px', color: 'var(--accent-primary)', border: 'none' }}>
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No saved restaurants yet.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* 4. SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
                  Update Settings
                </h3>
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Full Name</label>
                      <input 
                        type="text" 
                        required 
                        className="glass-input" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Email Address</label>
                      <input 
                        type="email" 
                        required 
                        className="glass-input" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Phone Number</label>
                      <input 
                        type="text" 
                        required 
                        className="glass-input" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                      <button type="submit" className="btn-primary">Save Changes</button>
                      <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>FULL NAME</span>
                      <span style={{ fontSize: '18px', fontWeight: 600, display: 'block', marginTop: '4px' }}>{userProfile.name}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>EMAIL ADDRESS</span>
                      <span style={{ fontSize: '18px', fontWeight: 600, display: 'block', marginTop: '4px' }}>{userProfile.email}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>PHONE NUMBER</span>
                      <span style={{ fontSize: '18px', fontWeight: 600, display: 'block', marginTop: '4px' }}>{userProfile.phone}</span>
                    </div>
                    <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ width: 'fit-content', marginTop: '10px' }}>
                      <Edit3 size={16} /> Edit Profile Info
                    </button>
                  </div>
                )}
              </motion.div>
            )}

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .profile-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 768px) {
          .profile-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .saved-restaurants-grid {
            grid-template-columns: 1fr !important;
          }
          .history-row {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .history-row div {
            align-items: center !important;
          }
        }
      `}</style>
    </div>
  );
}
