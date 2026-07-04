import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import InteractiveMap from '../components/InteractiveMap';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, DollarSign, Navigation, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import * as deliveryService from '../services/deliveryService';

export default function DeliveryDashboard() {
  const { logout, user } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, orders, earnings, heatmap

  // Local state for delivery details
  const [stats, setStats] = useState({
    weeklyEarnings: 0,
    totalDeliveries: 0,
    rating: 4.9,
    weeklyPoints: 1250
  });
  const [activeOrders, setActiveOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [earningsData, setEarningsData] = useState({ totalEarnings: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [dashboardStats, activeRes, availableRes] = await Promise.all([
        deliveryService.getDashboard(),
        deliveryService.getActiveOrders(),
        deliveryService.getAvailableOrders()
      ]);

      setStats({
        weeklyEarnings: dashboardStats.weeklyEarnings || 0,
        totalDeliveries: dashboardStats.totalDeliveries || 0,
        rating: 4.9,
        weeklyPoints: 1250
      });

      // Map active orders to the visual representation in component
      const mappedActive = (activeRes.orders || []).map(order => ({
        id: order._id,
        restaurantName: "L'Ambroisie",
        pickupAddress: "L'Ambroisie Premium Kitchen, Chelsea, London",
        deliveryAddress: order.deliveryAddress,
        status: order.status === 'CONFIRMED' ? 'Accepted' :
                order.status === 'OUT_FOR_DELIVERY' ? 'On the Way' :
                order.status === 'READY_FOR_PICKUP' ? 'Arrived at Store' : order.status,
        amount: Number((order.grandTotal * 0.15).toFixed(2)),
        coordinates: { x: 30 + Math.floor(Math.random() * 40), y: 30 + Math.floor(Math.random() * 40) },
        itemsCount: order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0,
        customerName: order.user?.name || "Premium Patrons"
      }));

      // Map available orders to the visual representation in component
      const mappedAvailable = (availableRes.orders || []).map(order => ({
        id: order._id,
        restaurantName: "L'Ambroisie",
        pickupAddress: "L'Ambroisie Premium Kitchen, Chelsea, London",
        deliveryAddress: order.deliveryAddress,
        status: 'Ready for Pickup',
        amount: Number((order.grandTotal * 0.15).toFixed(2)),
        coordinates: { x: 30, y: 70 },
        itemsCount: order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0,
        customerName: order.user?.name || "Premium Patrons"
      }));

      setActiveOrders(mappedActive);
      setAvailableOrders(mappedAvailable);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load delivery dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistoryAndEarnings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [earningsRes, historyRes] = await Promise.all([
        deliveryService.getEarnings(),
        deliveryService.getHistory()
      ]);

      setEarningsData(earningsRes || { totalEarnings: 0, history: [] });
      setHistoryOrders(historyRes.orders || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load history and earnings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'orders') {
      loadDashboardData();
    } else if (activeTab === 'earnings') {
      loadHistoryAndEarnings();
    }
  }, [activeTab, loadDashboardData, loadHistoryAndEarnings]);

  const handleAcceptJob = async (orderId) => {
    try {
      await deliveryService.acceptOrder(orderId);
      await loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order');
    }
  };

  const handleUpdateDeliveryStatus = async (orderId, newStatus) => {
    try {
      if (newStatus === 'Arrived at Store') {
        setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Arrived at Store' } : o));
      } else if (newStatus === 'On the Way') {
        await deliveryService.pickupOrder(orderId);
        await loadDashboardData();
      } else if (newStatus === 'Delivered') {
        await deliveryService.deliverOrder(orderId);
        await loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getMappedEarningsHistory = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const defaultHistory = days.map(d => ({ day: d, amount: 0 }));
    if (earningsData.history && earningsData.history.length > 0) {
      earningsData.history.forEach(item => {
        const date = new Date(item.date);
        const dayIndex = date.getDay(); // 0 is Sun, 1 is Mon...
        const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        if (mappedIndex >= 0 && mappedIndex < 7) {
          defaultHistory[mappedIndex].amount += Number(item.earning || 0);
        }
      });
    }
    return defaultHistory;
  };

  const liveDeliveries = [...activeOrders, ...availableOrders];

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
                {(user?.name || "Driver").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span style={{ fontSize: '16px', fontWeight: 600, display: 'block' }}>{user?.name || "Courier Partner"}</span>
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
              <button
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 500,
                  textAlign: 'left',
                  transition: 'var(--transition-fast)',
                  marginTop: '12px',
                  borderTop: '1px solid var(--border-color)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Driver Main Workspace */}
          <div style={{ minHeight: '600px' }}>
            
            {/* Loading / Error States */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,45,45,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            )}

            {error && (
              <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(255, 45, 45, 0.2)' }}>
                <span style={{ color: 'var(--accent-primary)', fontSize: '15px' }}>{error}</span>
              </div>
            )}

            {!loading && !error && (
              <>
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
                        { label: "Weekly Earnings", value: `$${stats.weeklyEarnings.toFixed(2)}`, accent: '#10B981' },
                        { label: "Total Deliveries", value: stats.totalDeliveries, accent: 'white' },
                        { label: "Partner Rating", value: `★ ${stats.rating}`, accent: '#FBBF24' },
                        { label: "Quest Points", value: stats.weeklyPoints, accent: 'var(--accent-secondary)' }
                      ].map((stat, i) => (
                        <div key={i} className="glass-card" style={{ padding: '20px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>{stat.label}</span>
                          <span style={{ fontSize: '26px', fontWeight: 700, display: 'block', marginTop: '8px', color: stat.accent }}>{stat.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Main GPS Route Tracking */}
                    {liveDeliveries.length > 0 && (
                      <div className="glass-card" style={{ padding: '35px' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} /> Live Courier Routing
                        </h3>
                        <InteractiveMap 
                          pins={[
                            { label: "Pickup Kitchen", x: 30, y: 70, type: 'restaurant' },
                            { label: liveDeliveries[0].customerName, x: 70, y: 30, type: 'delivery' }
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
                          {[
                            { message: "High demand expected near Chelsea Harbour between 7 PM - 9 PM. Surge pricing (+15%) active." },
                            { message: "Your average preparation wait time at L'Ambroisie is under 8 minutes today. Excellent efficiency!" }
                          ].map((ins, i) => (
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
                    {liveDeliveries.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {liveDeliveries.map((del) => (
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
                                {del.status === 'Ready for Pickup' && (
                                  <button 
                                    onClick={() => handleAcceptJob(del.id)}
                                    className="btn-primary" 
                                    style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px', background: 'var(--accent-secondary)' }}
                                  >
                                    Accept Job
                                  </button>
                                )}
                                {del.status === 'Accepted' && (
                                  <button 
                                    onClick={() => handleUpdateDeliveryStatus(del.id, 'Arrived at Store')}
                                    className="btn-primary" 
                                    style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}
                                  >
                                    Arrived at Kitchen
                                  </button>
                                )}
                                {del.status === 'Arrived at Store' && (
                                  <button 
                                    onClick={() => handleUpdateDeliveryStatus(del.id, 'On the Way')}
                                    className="btn-primary" 
                                    style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px' }}
                                  >
                                    Food Picked Up
                                  </button>
                                )}
                                {del.status === 'On the Way' && (
                                  <button 
                                    onClick={() => handleUpdateDeliveryStatus(del.id, 'Delivered')}
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
                      {getMappedEarningsHistory().map((hist, idx) => {
                        const pct = Math.min(100, (hist.amount / 250) * 100);
                        return (
                          <div key={idx} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            width: '40px'
                          }}>
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>${hist.amount.toFixed(2)}</span>
                            {/* Bar */}
                            <div style={{
                              height: `${pct * 1.5}px`,
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
                      heatmapPoints={[
                        { x: 35, y: 45, weight: 0.8 },
                        { x: 55, y: 60, weight: 0.6 },
                        { x: 40, y: 30, weight: 0.9 },
                        { x: 65, y: 50, weight: 0.5 }
                      ]}
                      height="420px"
                    />
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '20px', lineHeight: '1.5' }}>
                      Dark orange circles identify order surges. Cruise in proximity to these hot zones to receive job dispatches with higher commission multipliers.
                    </p>
                  </motion.div>
                )}
              </>
            )}

          </div>

        </div>

      </div>

      <style>{`
        .loader {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid rgba(255, 45, 45, 0.1);
          border-top-color: var(--accent-primary);
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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
