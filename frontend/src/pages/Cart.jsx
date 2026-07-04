import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, Ticket, ShieldCheck, ChevronRight, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    cartSubtotal, 
    deliveryFee, 
    taxes, 
    navigateTo 
  } = useApp();
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0); // in percentage
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promo.toUpperCase() === 'GOLDEN') {
      setDiscount(15); // 15% off
      setPromoApplied('GOLDEN (15% off applied)');
      setPromoError('');
    } else {
      setPromoError('Invalid luxury promo code');
      setDiscount(0);
      setPromoApplied('');
    }
  };

  // Calculations
  const discountAmount = Number((cartSubtotal * (discount / 100)).toFixed(2));
  const finalGrandTotal = Number((cartSubtotal - discountAmount + deliveryFee + taxes).toFixed(2));

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '60px 0 120px 0' }}>
      <div className="container">
        
        {/* Header */}
        <h1 style={{ fontSize: '38px', marginBottom: '40px', fontFamily: 'var(--font-heading)' }}>
          Your Culinary Bag
        </h1>

        {safeCartItems.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '60px',
            alignItems: 'start'
          }} className="cart-layout-grid">
            
            {/* Left Column: Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {safeCartItems.map((item) => {
                const customizationLabel = [];
                if (item.customization?.size) customizationLabel.push(`Portion: ${item.customization.size}`);
                if (item.customization?.spice) customizationLabel.push(`Spice: ${item.customization.spice}`);
                const addons = Array.isArray(item.customization?.addons)
                  ? item.customization.addons
                  : [];
                if (addons.length > 0) {
                  customizationLabel.push(`Add-ons: ${addons.join(', ')}`);
                }
                const itemPrice = Number(item.price || 0);
                const itemQuantity = Number(item.quantity || 0);

                return (
                  <motion.div
                    key={item.cartItemId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card cart-item-row"
                    style={{
                      padding: '24px',
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr auto',
                      gap: '24px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Item Image */}
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        border: '1px solid var(--border-color)'
                      }}
                    />

                    {/* Item Description */}
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--accent-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                        {item.restaurantName}
                      </span>
                      <h4 style={{ fontSize: '18px', fontWeight: 600, marginTop: '4px' }}>{item.name}</h4>
                      {customizationLabel.length > 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
                          {customizationLabel.join(' • ')}
                        </p>
                      )}
                    </div>

                    {/* Quantity controls & pricing */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }} className="cart-item-actions">
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '80px',
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.02)'
                      }}>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600, fontSize: '14px' }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '80px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 700 }}>
                          ${(itemPrice * itemQuantity).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </div>

            {/* Right Column: Checkout Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Promo Code Card */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ticket size={16} style={{ color: 'var(--accent-secondary)' }} /> Privilege Voucher
                </h4>
                <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Enter code (GOLDEN)..."
                    className="glass-input"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    style={{ fontSize: '14px', padding: '10px 14px' }}
                  />
                  <button type="submit" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                    Apply
                  </button>
                </form>
                {promoApplied && (
                  <p style={{ color: '#10B981', fontSize: '13px', marginTop: '10px' }}>{promoApplied}</p>
                )}
                {promoError && (
                  <p style={{ color: 'var(--accent-primary)', fontSize: '13px', marginTop: '10px' }}>{promoError}</p>
                )}
              </div>

              {/* Order Invoice Card */}
              <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  Invoice Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px' }}>
                  
                  {/* Subtotal */}
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Bag Subtotal</span>
                    <span>${cartSubtotal.toFixed(2)}</span>
                  </div>

                  {/* Promo discount */}
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', color: '#10B981' }}>
                      <span>Voucher Discount ({discount}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Shipping fee */}
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>White-glove Delivery</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                  </div>

                  {/* Taxes */}
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>VAT & Local Taxes</span>
                    <span>${taxes.toFixed(2)}</span>
                  </div>

                </div>

                <div style={{ height: '1px', background: 'var(--border-color)' }} />

                {/* Grand Total */}
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700 }}>
                  <span>Grand Total</span>
                  <span className="accent-text-glow">${finalGrandTotal.toFixed(2)}</span>
                </div>

                {/* Secure Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '10px'
                }}>
                  <ShieldCheck size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                  <span>Centurion-grade encryption securing this checkout pipeline.</span>
                </div>

                {/* Checkout Trigger */}
                <button 
                  onClick={() => navigateTo('checkout')} 
                  className="btn-primary"
                  style={{ width: '100%', height: '52px', marginTop: '10px' }}
                >
                  Proceed to Checkout <ChevronRight size={16} />
                </button>
              </div>

            </div>

          </div>
        ) : (
          <div className="glass-card" style={{
            padding: '80px 40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <ShoppingBag size={40} style={{ color: 'var(--text-muted)' }} />
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>Your Bag is Empty</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                Browse our curated master menus to select Michelin-starred dishes.
              </p>
            </div>
            <button className="btn-primary" onClick={() => navigateTo('menu')}>
              Browse Curated Menu
            </button>
          </div>
        )}

      </div>

      <style>{`
        @media (max-width: 992px) {
          .cart-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 600px) {
          .cart-item-row {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .cart-item-row img {
            margin: 0 auto;
          }
          .cart-item-actions {
            flex-direction: column !important;
            gap: 16px !important;
            align-items: center !important;
          }
        }
      `}</style>
    </div>
  );
}
