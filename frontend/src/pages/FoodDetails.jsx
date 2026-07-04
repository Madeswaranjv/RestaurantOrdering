import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Plus, Minus, Check, Flame, ChevronLeft } from 'lucide-react';

export default function FoodDetails() {
  const { activeFoodId, navigateTo, addToCart, dishes } = useApp();
  
  const targetId = activeFoodId || 'd1';
  const dish = dishes.find(d => d.id === targetId) || dishes[0];

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('Standard'); // Standard, Double, Imperial
  const [spice, setSpice] = useState('Mild'); // Mild, Medium, Chef's Signature
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Calculate pricing based on size and add-ons
  const sizeSurcharges = { 'Standard': 0, 'Double': 15, 'Imperial': 30 };
  const addonPrices = { 'Extra Black Truffle': 10, 'Edible Gold Leaf': 15, 'White Caviar Spoon': 25 };

  const finalPrice = (dish.price + sizeSurcharges[size] + selectedAddons.reduce((sum, ad) => sum + addonPrices[ad], 0)) * quantity;

  // Toggle addons
  const toggleAddon = (addon) => {
    setSelectedAddons(prev => 
      prev.includes(addon) ? prev.filter(a => a !== addon) : [...prev, addon]
    );
  };

  const handleAddToCart = () => {
    const customConfig = {
      size,
      spice,
      addons: selectedAddons,
      unitPrice: dish.price + sizeSurcharges[size] + selectedAddons.reduce((sum, ad) => sum + addonPrices[ad], 0)
    };
    addToCart(dish, customConfig, quantity);
    navigateTo('cart');
  };

  // Filter 3 related dishes (exclude active dish, prefer same category)
  const related = dishes
    .filter(d => d.id !== dish.id)
    .slice(0, 3);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '40px 0 120px 0' }}>
      <div className="container">
        
        {/* Back Link */}
        <div 
          onClick={() => navigateTo('menu')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            marginBottom: '40px',
            fontSize: '15px',
            transition: 'var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ChevronLeft size={16} /> Back to Catalog
        </div>

        {/* Core Layout Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '80px',
          alignItems: 'start'
        }} className="food-details-grid">
          
          {/* Left Column: Image & Nutrition */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div style={{
              height: '460px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6)'
            }}>
              <img 
                src={dish.image} 
                alt={dish.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Nutrition stats */}
            {dish.nutrition && (
              <div className="glass-card" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={18} style={{ color: 'var(--accent-primary)' }} /> Nutrition Breakdown
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '20px',
                  textAlign: 'center'
                }} className="nutrition-stats-grid">
                  <div>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CALORIES</span>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>{dish.nutrition.calories} kcal</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PROTEIN</span>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 700, marginTop: '4px', color: '#10B981' }}>{dish.nutrition.protein}g</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CARBS</span>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 700, marginTop: '4px', color: '#3B82F6' }}>{dish.nutrition.carbs}g</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FAT</span>
                    <span style={{ display: 'block', fontSize: '24px', fontWeight: 700, marginTop: '4px', color: '#FBBF24' }}>{dish.nutrition.fat}g</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Ingredients */}
            <div>
              <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Master Ingredients</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {dish.ingredients.map((ing, i) => (
                  <span 
                    key={i} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Customizations & Cart Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Title / Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 style={{ fontSize: '38px', fontFamily: 'var(--font-heading)' }}>{dish.name}</h1>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FBBF24' }}>
                  <Star size={16} fill="#FBBF24" />
                  <span style={{ color: 'white', fontWeight: 600 }}>{dish.rating}</span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>|</span>
                <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{dish.category}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '16px', marginTop: '8px' }}>
                {dish.description}
              </p>
            </div>

            {/* Separator */}
            <div style={{ height: '1px', background: 'var(--border-color)' }} />

            {/* Customization 1: Portions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Portion Selection
              </h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Standard', 'Double', 'Imperial'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSize(sz)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: size === sz ? 'white' : 'rgba(255, 255, 255, 0.02)',
                      color: size === sz ? 'black' : 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {sz} {sizeSurcharges[sz] > 0 && `(+$${sizeSurcharges[sz]})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Customization 2: Spice Level */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Spice Profile
              </h4>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Mild', 'Medium', "Chef's Signature"].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSpice(sp)}
                    style={{
                      flex: 1,
                      padding: '14px',
                      background: spice === sp ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.02)',
                      color: 'white',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            {/* Customization 3: Add-ons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Premium Enhancements
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.keys(addonPrices).map((addon) => {
                  const isChecked = selectedAddons.includes(addon);
                  return (
                    <div
                      key={addon}
                      onClick={() => toggleAddon(addon)}
                      style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: isChecked ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          background: isChecked ? 'var(--accent-primary)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 500 }}>{addon}</span>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                        +${addonPrices[addon]}.00
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector and Checkout */}
            <div style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              marginTop: '10px'
            }}>
              
              {/* Qty count adjustment */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: '80px',
                padding: '10px 18px',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Minus size={16} />
                </button>
                <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Final trigger add */}
              <button 
                onClick={handleAddToCart}
                className="btn-primary" 
                style={{ flex: 1, height: '54px' }}
              >
                <ShoppingCart size={18} /> Add To Cart — ${finalPrice.toFixed(2)}
              </button>
            </div>

          </div>

        </div>

        {/* Related Dishes */}
        <div style={{ marginTop: '100px', borderTop: '1px solid var(--border-color)', paddingTop: '60px' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '40px', fontFamily: 'var(--font-heading)' }}>
            Related Specialties
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px'
          }}>
            {related.map((item, idx) => (
              <div
                key={item.id}
                className="glass-card"
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <div style={{ height: '220px', overflow: 'hidden' }}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    onClick={() => navigateTo('food-detail', { foodId: item.id })}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 
                    onClick={() => navigateTo('food-detail', { foodId: item.id })}
                    style={{ cursor: 'pointer', fontSize: '18px', fontWeight: 600 }}
                  >
                    {item.name}
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5', flex: 1 }}>
                    {item.description.substring(0, 80)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 700 }}>${item.price.toFixed(2)}</span>
                    <button
                      onClick={() => navigateTo('food-detail', { foodId: item.id })}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .food-details-grid {
            grid-template-columns: 1fr !important;
            gap: 60px !important;
          }
        }
        @media (max-width: 480px) {
          .nutrition-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
