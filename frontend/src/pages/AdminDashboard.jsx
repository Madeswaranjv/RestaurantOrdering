import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, Users, Star, DollarSign, Ban, Unlock, ShieldAlert, Trash2, Edit3, ArrowUpRight, BarChart2 } from 'lucide-react';
import * as adminService from '../services/adminService';

export default function AdminDashboard() {
  const { navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, users, reviews
  const [loading, setLoading] = useState(false);

  // States
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalMenuItems: 0,
    totalReviews: 0
  });

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Analytics states
  const [revenueDaily, setRevenueDaily] = useState([]);
  const [orderStatusBreakdown, setOrderStatusBreakdown] = useState([]);
  const [customerRegistrations, setCustomerRegistrations] = useState([]);

  // Block reason state
  const [blockingUserId, setBlockingUserId] = useState(null);
  const [blockReason, setBlockReason] = useState('');

  const loadOverview = async () => {
    try {
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);

      const revData = await adminService.getRevenueAnalytics();
      setRevenueDaily(revData.daily || []);

      const ordData = await adminService.getOrderAnalytics();
      setOrderStatusBreakdown(ordData.statusBreakdown || []);

      const custData = await adminService.getCustomerAnalytics();
      setCustomerRegistrations(custData.monthlyRegistrations || []);
    } catch (err) {
      console.error('Error loading admin overview', err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await adminService.getAdminOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error loading admin orders', err);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminService.getAdminUsers({ limit: 100 });
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error loading admin users', err);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await adminService.getAdminReviews({ limit: 100 });
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error loading admin reviews', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    const loadTab = async () => {
      if (activeTab === 'overview') await loadOverview();
      else if (activeTab === 'orders') await loadOrders();
      else if (activeTab === 'users') await loadUsers();
      else if (activeTab === 'reviews') await loadReviews();
      setLoading(false);
    };
    loadTab();
  }, [activeTab]);

  // Actions
  const handleOrderStatusUpdate = async (id, status) => {
    try {
      await adminService.updateOrderStatus(id, status);
      await loadOrders();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateUserRole = async (id, role) => {
    try {
      await adminService.updateUserRole(id, role);
      await loadUsers();
    } catch (err) {
      alert('Failed to update role.');
    }
  };

  const handleBlockUser = async (e) => {
    e.preventDefault();
    if (!blockingUserId) return;
    try {
      await adminService.blockUser(blockingUserId, blockReason || 'Violation of terms of service');
      setBlockingUserId(null);
      setBlockReason('');
      await loadUsers();
    } catch (err) {
      alert('Failed to block user.');
    }
  };

  const handleUnblockUser = async (id) => {
    try {
      await adminService.unblockUser(id);
      await loadUsers();
    } catch (err) {
      alert('Failed to unblock user.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user permanently?')) {
      try {
        await adminService.deleteUser(id);
        await loadUsers();
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  const handleHideReview = async (id) => {
    try {
      await adminService.hideReview(id);
      await loadReviews();
    } catch (err) {
      alert('Failed to hide review.');
    }
  };

  const handleUnhideReview = async (id) => {
    try {
      await adminService.unhideReview(id);
      await loadReviews();
    } catch (err) {
      alert('Failed to unhide review.');
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Delete this review permanently?')) {
      try {
        await adminService.deleteAdminReview(id);
        await loadReviews();
      } catch (err) {
        alert('Failed to delete review.');
      }
    }
  };

  const sidebarLinks = [
    { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'orders', label: 'Manage Orders', icon: <ShoppingBag size={18} /> },
    { id: 'users', label: 'Patron Profiles', icon: <Users size={18} /> },
    { id: 'reviews', label: 'Review Moderation', icon: <Star size={18} /> }
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '60px 0 120px 0' }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '50px',
          alignItems: 'start'
        }} className="admin-layout-grid">
          
          {/* Admin Sidebar */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF2D2D 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px'
              }}>
                AD
              </div>
              <div>
                <span style={{ fontSize: '16px', fontWeight: 600, display: 'block' }}>Administrator</span>
                <span style={{ fontSize: '13px', color: 'var(--accent-secondary)', fontWeight: 500 }}>System Controller</span>
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

          {/* Main workspace */}
          <div style={{ minHeight: '600px' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', color: 'var(--text-muted)' }}>
                Loading admin matrix...
              </div>
            ) : (
              <>
                {/* 1. OVERVIEW VIEW */}
                {activeTab === 'overview' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
                    
                    {/* Stats counters */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '20px'
                    }} className="admin-stats-grid">
                      {[
                        { label: 'Total Revenue', value: `$${stats.totalRevenue?.toFixed(2)}`, icon: <DollarSign size={20} style={{ color: '#10B981' }} /> },
                        { label: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag size={20} style={{ color: 'var(--accent-secondary)' }} /> },
                        { label: 'Registered Patrons', value: stats.totalUsers, icon: <Users size={20} style={{ color: 'var(--accent-primary)' }} /> },
                        { label: 'Active Menu Items', value: stats.totalMenuItems, icon: <BarChart2 size={20} style={{ color: 'white' }} /> }
                      ].map((item, i) => (
                        <div key={i} className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontWeight: 500 }}>{item.label}</span>
                            <span style={{ fontSize: '24px', fontWeight: 700, display: 'block', marginTop: '6px' }}>{item.value}</span>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '10px' }}>
                            {item.icon}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Analytics charts emulation */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }} className="admin-charts-grid">
                      
                      {/* Daily revenue statement */}
                      <div className="glass-card" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          Daily Revenue Index
                        </h3>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          height: '180px',
                          padding: '10px 20px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px'
                        }}>
                          {revenueDaily.slice(-7).map((item, idx) => {
                            const maxVal = Math.max(...revenueDaily.map(d => d.value), 1);
                            const heightVal = Math.max(10, (item.value / maxVal) * 120);
                            return (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '32px' }}>
                                <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>${Math.round(item.value)}</span>
                                <div style={{ height: `${heightVal}px`, width: '12px', background: 'var(--accent-gradient)', borderRadius: '2px' }} />
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.label.split('-')[2]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Status distribution breakdown */}
                      <div className="glass-card" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Order Status Matrix</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {orderStatusBreakdown.map((item, idx) => {
                            const total = orderStatusBreakdown.reduce((s, o) => s + o.value, 0) || 1;
                            const pct = Math.round((item.value / total) * 100);
                            return (
                              <div key={idx}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>{item.value} ({pct}%)</span>
                                </div>
                                <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-primary)' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                  </motion.div>
                )}

                {/* 2. MANAGE ORDERS VIEW */}
                {activeTab === 'orders' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
                      System Dispatch Manager
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '16px 8px' }}>ORDER ID</th>
                            <th style={{ padding: '16px 8px' }}>PATRON</th>
                            <th style={{ padding: '16px 8px' }}>GRAND TOTAL</th>
                            <th style={{ padding: '16px 8px' }}>DELIVERY ADDRESS</th>
                            <th style={{ padding: '16px 8px' }}>STATUS</th>
                            <th style={{ padding: '16px 8px', textAlign: 'right' }}>ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((ord) => (
                            <tr key={ord._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '16px 8px', fontWeight: 600 }}>{ord._id}</td>
                              <td style={{ padding: '16px 8px' }}>{ord.user?.name || 'Patron'}</td>
                              <td style={{ padding: '16px 8px', fontWeight: 700, color: '#10B981' }}>${ord.grandTotal?.toFixed(2)}</td>
                              <td style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>{ord.deliveryAddress}</td>
                              <td style={{ padding: '16px 8px' }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  background: ord.status === 'DELIVERED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 45, 45, 0.08)',
                                  color: ord.status === 'DELIVERED' ? '#10B981' : 'var(--accent-secondary)',
                                  border: ord.status === 'DELIVERED' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255, 45, 45, 0.2)'
                                }}>
                                  {ord.status}
                                </span>
                              </td>
                              <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                <select 
                                  value={ord.status}
                                  onChange={(e) => handleOrderStatusUpdate(ord._id, e.target.value)}
                                  style={{
                                    background: 'var(--bg-secondary)',
                                    color: 'white',
                                    border: '1px solid var(--border-color)',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="PLACED">PLACED</option>
                                  <option value="CONFIRMED">CONFIRMED</option>
                                  <option value="PREPARING">PREPARING</option>
                                  <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                                  <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* 3. MANAGE USERS VIEW */}
                {activeTab === 'users' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
                      Patron Matrix Registry
                    </h3>

                    {blockingUserId && (
                      <form onSubmit={handleBlockUser} style={{ display: 'flex', gap: '10px', marginBottom: '30px', padding: '20px', background: 'rgba(255,45,45,0.02)', border: '1px solid rgba(255,45,45,0.1)', borderRadius: '12px' }}>
                        <input
                          type="text"
                          required
                          placeholder="Provide restriction justification..."
                          className="glass-input"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '12px 24px', background: 'var(--accent-secondary)' }}>
                          Enforce Block
                        </button>
                        <button type="button" onClick={() => setBlockingUserId(null)} className="btn-secondary" style={{ padding: '12px 24px' }}>
                          Cancel
                        </button>
                      </form>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '16px 8px' }}>NAME</th>
                            <th style={{ padding: '16px 8px' }}>EMAIL</th>
                            <th style={{ padding: '16px 8px' }}>ROLE</th>
                            <th style={{ padding: '16px 8px' }}>STATUS</th>
                            <th style={{ padding: '16px 8px', textAlign: 'right' }}>RESTRICTION CONTROLS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((usr) => (
                            <tr key={usr._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '16px 8px', fontWeight: 600 }}>{usr.name}</td>
                              <td style={{ padding: '16px 8px', color: 'var(--text-muted)' }}>{usr.email}</td>
                              <td style={{ padding: '16px 8px' }}>
                                <select 
                                  value={usr.role}
                                  onChange={(e) => handleUpdateUserRole(usr._id, e.target.value)}
                                  style={{
                                    background: 'var(--bg-secondary)',
                                    color: 'white',
                                    border: '1px solid var(--border-color)',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="customer">customer</option>
                                  <option value="deliveryPartner">deliveryPartner</option>
                                  <option value="admin">admin</option>
                                </select>
                              </td>
                              <td style={{ padding: '16px 8px' }}>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  background: usr.isBlocked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                  color: usr.isBlocked ? '#EF4444' : '#10B981',
                                  border: usr.isBlocked ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)'
                                }}>
                                  {usr.isBlocked ? 'Blocked' : 'Active'}
                                </span>
                              </td>
                              <td style={{ padding: '16px 8px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {usr.isBlocked ? (
                                  <button 
                                    onClick={() => handleUnblockUser(usr._id)}
                                    className="btn-secondary" 
                                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Unlock size={12} /> Unblock
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => setBlockingUserId(usr._id)}
                                    className="btn-secondary" 
                                    style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-secondary)' }}
                                    disabled={usr.role === 'admin'}
                                  >
                                    <Ban size={12} /> Block
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteUser(usr._id)}
                                  className="btn-secondary" 
                                  style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--accent-primary)' }}
                                  disabled={usr.role === 'admin'}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* 4. REVIEW MODERATION VIEW */}
                {activeTab === 'reviews' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: '30px' }}>
                    <h3 style={{ fontSize: '22px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
                      Patron Feedbacks Moderator
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {reviews.map((rev) => (
                        <div key={rev._id} style={{
                          padding: '20px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: '20px',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontWeight: 600, fontSize: '15px' }}>{rev.user?.name || 'Anonymous Patron'}</span>
                              <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                                {rev.reviewType}
                              </span>
                              {rev.isHidden && (
                                <span style={{ fontSize: '11px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                                  Hidden
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '2px', color: '#FBBF24', margin: '8px 0' }}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={12} fill={i < Math.floor(rev.rating) ? "#FBBF24" : "none"} />
                              ))}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                              "{rev.comment}"
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {rev.isHidden ? (
                              <button 
                                onClick={() => handleUnhideReview(rev._id)}
                                className="btn-secondary" 
                                style={{ padding: '8px 14px', fontSize: '13px' }}
                              >
                                Unhide
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleHideReview(rev._id)}
                                className="btn-secondary" 
                                style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--accent-secondary)' }}
                              >
                                Hide
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteReview(rev._id)}
                              className="btn-secondary" 
                              style={{ padding: '8px 12px', color: 'var(--accent-primary)', border: 'none' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .admin-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 768px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          .admin-charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
