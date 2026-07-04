import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import InteractiveMap from '../components/InteractiveMap';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, History, DollarSign, User, Sparkles, Navigation, AlertTriangle, TrendingUp } from 'lucide-react';

export default function DeliveryDashboard() {
  const { driverState, updateDeliveryStatus } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, orders, earnings, heatmap

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'orders', label: 'Active Jobs', icon: <ShoppingBag size={18} /> },
    { id: 'earnings', label: 'Earnings History', icon: <DollarSign size={18} /> },
    { id: 'heatmap', label: 'Demand Heatmap', icon: <Navigation size={18} /> }
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '60px 0 120px 0' }}>
      <div className="container">
        
        {/* Layout Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '50px',
          alignItems: 'start'
        }} className="driver-layout-grid">
          
          {/* Driver Sidebar */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px'
              }}>
                DV
              </div>
              <div>
                <span style={{ fontSize: '16px', fontWeight: 600, display: 'block' }}>{driverState.driverName}</span>
                <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 500 }}>Active Partner</span>
              </div>
            </div>

            {/* Nav links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sidebarLinks.map(link => {
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
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
                    <span style={{ color: isActive ? 'var(--accent-primary)' : 'inherit' }}>{link.icon}</span>
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Driver Main Workspace */}
          <div style={{ minHeight: '600px' }}>
            
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Stats grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '20px'
                }} className="driver-stats-grid">
                  {[
                    { label: "Weekly Earnings", value: `$${driverState.weeklyEarnings.toFixed(2)}`, accent: '#10B981' },
                    { label: "Total Deliveries", value: driverState.totalDeliveries, accent: 'white' },
                    { label: "Partner Rating", value: `★ ${driverState.rating}`, accent: '#FBBF24' },
                    { label: "Quest Points", value: driverState.weeklyPoints, accent: 'var(--accent-secondary)' }
                  ].map((stat, i) => (
                    <div key={i} className="glass-card" style={{ padding: '20px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>{stat.label}</span>
                      <span style={{ fontSize: '26px', fontWeight: 700, display: 'block', marginTop: '8px', color: stat.accent }}>{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Main GPS Route Tracking */}
                {driverState.liveDeliveries.length > 0 && (
                  <div className="glass-card" style={{ padding: '35px' }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} /> Live Courier Routing
                    </h3>
                    <InteractiveMap 
                      pins={[
                        { label: "Pickup Kitchen", x: 30, y: 70, type: 'restaurant' },
                        { label: driverState.liveDeliveries[0].customerName, x: 70, y: 30, type: 'delivery' }
                      ]}
                      routeStart={{ x: 30, y: 70 }}
                      routeEnd={{ x: 70, y: 30 }}
                      liveTracking={true}
                      height="320px"
                    />
                  </div>
                )}

                {/* AI Insights & Alerts */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 0.8fr',
                  gap: '30px'
                }} className="insights-grid">
                  
                  {/* AI insights list */}
                  <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} style={{ color: 'var(--accent-secondary)' }} /> AI Demand Dispatcher
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {driverState.aiInsights.map((ins, i) => (
                        <div key={i} style={{
                          padding: '16px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderLeft: '3px solid var(--accent-secondary)',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}>
                          {ins.message}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational status alerts */}
                  <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} style={{ color: 'var(--accent-primary)' }} /> Safety Alerts
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      Peak storm warnings approaching. Ensure thermal food containers are dry and locked securely. Ride safely.
                    </p>
                    <div style={{
                      background: 'rgba(255,45,45,0.05)',
                      border: '1px solid rgba(255,45,45,0.1)',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: 'var(--accent-primary)',
                      fontWeight: 600
                    }}>
                      SURGE PRICING ENABLED (+15%)
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* 2. ACTIVE JOBS VIEW */}
            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
                  Assigned Courier Jobs
                </h3>
                {driverState.liveDeliveries.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {driverState.liveDeliveries.map((del) => (
                      <div key={del.id} style={{
                        padding: '24px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '20px',
                        alignItems: 'center'
                      }} className="job-row">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 600 }}>{del.id}</span>
                            <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                              {del.restaurantName}
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>
                            <p><strong>From:</strong> {del.pickupAddress}</p>
                            <p><strong>To:</strong> {del.deliveryAddress}</p>
                            <p><strong>Items:</strong> {del.itemsCount} dishes for {del.customerName}</p>
                          </div>
                        </div>

                        {/* Status adjustments */}
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
                          <span style={{ fontSize: '22px', fontWeight: 700, color: '#10B981' }}>+${del.amount.toFixed(2)}</span>
                          
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {del.status === 'Accepted' && (
                              <button 
                                onClick={() => updateDeliveryStatus(del.id, 'Arrived at Store')}
                                className="btn-primary" 
                                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}
                              >
                                Arrived at Kitchen
                              </button>
                            )}
                            {del.status === 'Arrived at Store' && (
                              <button 
                                onClick={() => updateDeliveryStatus(del.id, 'On the Way')}
                                className="btn-primary" 
                                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}
                              >
                                Food Picked Up
                              </button>
                            )}
                            {del.status === 'On the Way' && (
                              <button 
                                onClick={() => updateDeliveryStatus(del.id, 'Delivered')}
                                className="btn-primary" 
                                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px', background: '#10B981' }}
                              >
                                Mark Delivered
                              </button>
                            )}
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              background: 'rgba(255, 45, 45, 0.08)',
                              border: '1px solid rgba(255, 45, 45, 0.2)',
                              color: 'var(--accent-secondary)',
                              padding: '6px 12px',
                              borderRadius: '4px'
                            }}>
                              {del.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>No active jobs assigned. Tap refresh to fetch newer job requests.</p>
                )}
              </motion.div>
            )}

            {/* 3. EARNINGS GRAPH VIEW */}
            {activeTab === 'earnings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '30px' }}>
                  Weekly Earnings Statement
                </h3>
                
                {/* Visual Bar Graph */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  height: '240px',
                  padding: '20px 40px',
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  marginBottom: '30px'
                }}>
                  {driverState.earningsHistory.map((hist, idx) => {
                    const pct = (hist.amount / 250) * 100;
                    return (
                      <div key={idx} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        width: '40px'
                      }}>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>${hist.amount}</span>
                        {/* Bar */}
                        <div style={{
                          height: `${pct}px`,
                          width: '24px',
                          background: 'var(--accent-gradient)',
                          borderRadius: '4px',
                          boxShadow: '0 4px 10px rgba(255, 45, 45, 0.2)'
                        }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{hist.day}</span>
                      </div>
                    );
                  })}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                  Earnings deposits are dispatched directly to your registered bank account every Monday at 3:00 AM UTC.
                </p>
              </motion.div>
            )}

            {/* 4. DEMAND HEATMAP VIEW */}
            {activeTab === 'heatmap' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
                  Grid Demand Heatmap
                </h3>
                <InteractiveMap 
                  heatmapPoints={driverState.heatmapPoints}
                  height="420px"
                />
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '20px', lineHeight: '1.5' }}>
                  Dark orange circles identify order surges. Cruise in proximity to these hot zones to receive job dispatches with higher commission multipliers.
                </p>
              </motion.div>
            )}

          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .driver-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 768px) {
          .driver-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          .insights-grid {
            grid-template-columns: 1fr !important;
          }
          .job-row {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .job-row div {
            align-items: center !important;
          }
        }
      `}</style>
    </div>
  );
}
