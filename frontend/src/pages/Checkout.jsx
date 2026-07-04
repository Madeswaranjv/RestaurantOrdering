import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import InteractiveMap from '../components/InteractiveMap';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, ShoppingBag, CheckCircle, Navigation, Compass, AlertCircle } from 'lucide-react';

export default function Checkout() {
  const { 
    cartItems, 
    cartTotal, 
    cartSubtotal,
    deliveryFee,
    taxes,
    userProfile, 
    placeOrder, 
    navigateTo,
    socket
  } = useApp();

  const [step, setStep] = useState(1);
  const [selectedAddressId, setSelectedAddressId] = useState(userProfile.addresses[0]?.id || '');
  const [selectedCardId, setSelectedCardId] = useState(userProfile.savedCards[0]?.id || '');
  const [confirmedOrderId, setConfirmedOrderId] = useState('');

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [driverCoords, setDriverCoords] = useState(null);

  const activeAddress = userProfile.addresses.find(a => a.id === selectedAddressId) || userProfile.addresses[0];
  const activeCard = userProfile.savedCards.find(c => c.id === selectedCardId) || userProfile.savedCards[0];

  useEffect(() => {
    if (confirmedOrderId && socket) {
      socket.emit('joinOrder', confirmedOrderId);
      console.log(`Joined Socket.IO room for order: ${confirmedOrderId}`);

      const handleDriverLoc = ({ orderId, coords }) => {
        if (orderId === confirmedOrderId) {
          console.log(`Received driver location update:`, coords);
          setDriverCoords(coords);
        }
      };

      const handleStatusChange = ({ orderId, status }) => {
        if (orderId === confirmedOrderId) {
          console.log(`Received order status change: ${status}`);
        }
      };

      socket.on('driverLocationChanged', handleDriverLoc);
      socket.on('orderStatusChanged', handleStatusChange);

      return () => {
        socket.off('driverLocationChanged', handleDriverLoc);
        socket.off('orderStatusChanged', handleStatusChange);
        socket.emit('leaveOrder', confirmedOrderId);
        console.log(`Left Socket.IO room for order: ${confirmedOrderId}`);
      };
    }
  }, [confirmedOrderId, socket]);

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      setOrderError('');
      const orderId = await placeOrder(activeAddress, activeCard);
      if (orderId) {
        setConfirmedOrderId(orderId);
        setStep(4);
      } else {
        setOrderError('Failed to place order. Please review your address and payment details.');
      }
    } catch (err) {
      setOrderError(err.message || 'An error occurred while placing your order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const stepsList = [
    { num: 1, label: "Address" },
    { num: 2, label: "Payment" },
    { num: 3, label: "Review" },
    { num: 4, label: "Confirmation" }
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '60px 0 120px 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          marginBottom: '60px',
          padding: '0 20px'
        }}>
          {/* Progress bar line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: '2px',
            background: 'var(--border-color)',
            zIndex: 1
          }} />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: `${((step - 1) / 3) * 100}%`,
            height: '2px',
            background: 'var(--accent-primary)',
            zIndex: 2,
            transition: 'width 0.4s ease'
          }} />

          {stepsList.map(s => {
            const isCompleted = step > s.num || step === 4;
            const isActive = step === s.num;
            return (
              <div key={s.num} style={{
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isCompleted || isActive ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  border: isCompleted || isActive ? 'none' : '1px solid var(--border-color)',
                  color: isCompleted || isActive ? 'white' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '14px',
                  transition: 'var(--transition-fast)'
                }}>
                  {s.num}
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: isActive || isCompleted ? 'white' : 'var(--text-muted)'
                }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Multi-step views */}
        <div style={{ minHeight: '400px' }}>
          
          {/* Step 1: Address */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                  Select Delivery Residence
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {userProfile.addresses.map(addr => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      style={{
                        padding: '24px',
                        background: selectedAddressId === addr.id ? 'rgba(255, 45, 45, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                        border: selectedAddressId === addr.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <MapPin size={22} style={{ color: selectedAddressId === addr.id ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '16px', display: 'block' }}>{addr.label}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', display: 'block' }}>{addr.address}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button onClick={() => setStep(2)} className="btn-primary">
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                  Secure Payment Method
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {userProfile.savedCards.map(card => (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      style={{
                        padding: '24px',
                        background: selectedCardId === card.id ? 'rgba(255, 45, 45, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                        border: selectedCardId === card.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <CreditCard size={22} style={{ color: selectedCardId === card.id ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '16px', display: 'block' }}>{card.cardBrand}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', display: 'block' }}>{card.number} (Exp: {card.expiry})</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button onClick={() => setStep(1)} className="btn-secondary">
                    Back to Address
                  </button>
                  <button onClick={() => setStep(3)} className="btn-primary">
                    Proceed to Review
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 350px',
                gap: '30px',
                alignItems: 'start'
              }} className="review-grid">
                
                {/* Review Details */}
                <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  
                  {/* Address Summary */}
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                      Delivery Residence
                    </h4>
                    <p style={{ fontWeight: 600, fontSize: '16px' }}>{activeAddress.label}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{activeAddress.address}</p>
                  </div>

                  <div style={{ height: '1px', background: 'var(--border-color)' }} />

                  {/* Payment Summary */}
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                      Payment Protocol
                    </h4>
                    <p style={{ fontWeight: 600, fontSize: '16px' }}>{activeCard.cardBrand}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{activeCard.number}</p>
                  </div>

                  <div style={{ height: '1px', background: 'var(--border-color)' }} />

                  {/* Cart Items */}
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>
                      Dishes Selection
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {cartItems.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '15px' }}>
                          <span>{item.quantity}x {item.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Final Checkout totals */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    Order Total
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                      <span>Subtotal</span>
                      <span>${cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                      <span>White-glove Delivery</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                      <span>VAT & Taxes</span>
                      <span>${taxes.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ height: '1px', background: 'var(--border-color)' }} />
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700 }}>
                    <span>Total Due</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  {orderError && (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(255, 45, 45, 0.08)',
                      border: '1px solid rgba(255, 45, 45, 0.2)',
                      color: 'var(--accent-secondary)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertCircle size={16} />
                      <span>{orderError}</span>
                    </div>
                  )}
                  <button 
                    onClick={handlePlaceOrder} 
                    disabled={placingOrder}
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    {placingOrder ? 'Placing Order...' : 'Place Order & Pay'}
                  </button>
                  <button onClick={() => setStep(2)} className="btn-secondary" style={{ width: '100%' }}>
                    Back
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation & GPS tracking */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={56} style={{ color: '#10B981' }} />
                  <h2 style={{ fontSize: '32px', fontFamily: 'var(--font-heading)' }}>Gastronomy Dispatched</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '500px' }}>
                    Your order <span style={{ color: '#fff', fontWeight: 600 }}>{confirmedOrderId}</span> is now under preparation in our Michelin kitchen.
                  </p>
                </div>

                {/* GPS map simulator tracking courier */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Navigation className="spin-slow" size={16} style={{ color: 'var(--accent-primary)' }} /> Live Courier GPS Tracking
                  </h3>
                  
                  <InteractiveMap 
                    pins={[
                      { label: "Michelin Kitchen", x: 25, y: 70, type: 'restaurant' },
                      { label: activeAddress.label, x: 75, y: 30, type: 'delivery' },
                      ...(driverCoords ? [{ label: "Courier Partner", x: driverCoords.x, y: driverCoords.y, type: 'driver' }] : [])
                    ]}
                    routeStart={{ x: 25, y: 70 }}
                    routeEnd={{ x: 75, y: 30 }}
                    liveTracking={!driverCoords}
                    height="320px"
                  />
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    padding: '16px 20px',
                    borderRadius: '8px',
                    marginTop: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px'
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery Time</span>
                    <span style={{ fontWeight: 600 }}>24 minutes remaining</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <button onClick={() => navigateTo('profile')} className="btn-primary">
                    View Orders History
                  </button>
                  <button onClick={() => navigateTo('home')} className="btn-secondary">
                    Back to Home
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .review-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
