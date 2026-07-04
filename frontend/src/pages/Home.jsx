import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, Heart, Award, Shield, Zap, Sparkles, ShoppingCart } from 'lucide-react';

export default function Home() {
  const { navigateTo, addToCart, dishes, initialLoading, initialError } = useApp();
  const [carouselIndex, setCarouselIndex] = useState(0);

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
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', letterSpacing: '0.05em' }}>Loading FlavorDash culinary experience...</p>
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
        <h3 style={{ color: 'var(--text-primary)', fontSize: '20px' }}>Failed to Load Experience</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', textAlign: 'center' }}>{initialError}</p>
        <button onClick={() => window.location.reload()} className="btn-primary" style={{ padding: '10px 24px' }}>Retry</button>
      </div>
    );
  }

  // Filter 4 featured dishes for the home carousel
  const featuredDishes = dishes.slice(0, 4);

  const nextSlide = () => {
    setCarouselIndex(prev => (prev === featuredDishes.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCarouselIndex(prev => (prev === 0 ? featuredDishes.length - 1 : prev - 1));
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const floatAnimation = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* 1. HERO SECTION */}
      <section style={{ padding: '80px 0 120px 0', position: 'relative' }}>
        {/* Glow backdrop decorative */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 45, 45, 0.08) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />

        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '80px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Left Text Column */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
          >
            {/* Premium Badge */}
            <motion.div 
              variants={fadeInUp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 45, 45, 0.08)',
                border: '1px solid rgba(255, 45, 45, 0.2)',
                color: 'var(--accent-secondary)',
                padding: '8px 16px',
                borderRadius: '80px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                width: 'fit-content'
              }}
            >
              <Sparkles size={14} /> The Critic's Choice • 2026
            </motion.div>

            {/* Title */}
            <motion.h1 
              variants={fadeInUp}
              className="hero-heading"
              style={{ fontWeight: 700, lineHeight: 1.1 }}
            >
              It's Not Just Food.<br />
              <span className="accent-text-glow">It's An Experience.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              variants={fadeInUp}
              style={{
                fontSize: '18px',
                lineHeight: '1.7',
                color: 'var(--text-muted)',
                maxWidth: '560px'
              }}
            >
              FlavorDash curates sensory masterpieces from Michelin-starred kitchens. We deliver fine gastronomy directly to your residence with white-glove precision.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              variants={fadeInUp}
              style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}
            >
              <button onClick={() => navigateTo('menu')} className="btn-primary">
                View Menu <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigateTo('restaurants')} 
                className="btn-secondary"
              >
                Explore Kitchens
              </button>
            </motion.div>

            {/* Reviews */}
            <motion.div 
              variants={fadeInUp}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: '10px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '20px'
              }}
            >
              <div style={{ display: 'flex', marginLeft: '5px' }}>
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60"
                ].map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="review user"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px solid var(--bg-primary)',
                      marginRight: '-12px'
                    }}
                  />
                ))}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  zIndex: 2
                }}>
                  +4.5k
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', color: '#FBBF24' }}>
                  <Star size={16} fill="#FBBF24" />
                  <Star size={16} fill="#FBBF24" />
                  <Star size={16} fill="#FBBF24" />
                  <Star size={16} fill="#FBBF24" />
                  <Star size={16} fill="#FBBF24" />
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '15px', marginLeft: '8px' }}>4.95 / 5</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Audited customer rating (1,240 fine reviews)
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Floating Food Column */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <motion.div
              variants={floatAnimation}
              animate="animate"
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '480px',
                aspectRatio: '1',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255, 45, 45, 0.05) 0%, rgba(0,0,0,0) 65%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Main Dish Image */}
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800"
                alt="Floating Premium Salad Bowl"
                style={{
                  width: '90%',
                  height: '90%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05)',
                  border: '4px solid rgba(255,255,255,0.03)'
                }}
              />

              {/* Floating Leaf 1 */}
              <motion.img
                src="https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=150"
                alt="herb leaf"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, 15, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  top: '10%',
                  left: '-5%',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  filter: 'blur(0.5px)'
                }}
              />

              {/* Floating Tomato */}
              <motion.img
                src="https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&q=80&w=150"
                alt="cherry tomato"
                animate={{
                  y: [0, -12, 0],
                  rotate: [0, -10, 0]
                }}
                transition={{ duration: 6, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  bottom: '15%',
                  right: '-5%',
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* CSS styling utility */}
        <style>{`
          @media (max-width: 900px) {
            section .container {
              grid-template-columns: 1fr !important;
              gap: 60px !important;
            }
          }
        `}</style>
      </section>

      {/* 2. FEATURED DISHES CAROUSEL */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '60px'
          }}>
            <div>
              <h2 className="section-heading" style={{ margin: 0 }}>Featured Dishes</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                Handpicked culinary masterpieces prepared fresh in our gourmet kitchens.
              </p>
            </div>
            {/* Carousel navigation */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={prevSlide}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                &larr;
              </button>
              <button 
                onClick={nextSlide}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* Carousel Body */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {featuredDishes.map((dish, index) => {
              // Highlight active dish dynamically
              const isActive = index === carouselIndex;
              return (
                <motion.div
                  key={dish.id}
                  className="glass-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    position: 'relative',
                    border: isActive ? '1px solid rgba(255, 45, 45, 0.35)' : '1px solid var(--border-color)',
                    boxShadow: isActive ? '0 15px 30px rgba(255, 45, 45, 0.05)' : 'none'
                  }}
                >
                  {/* Dish Image Container */}
                  <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'rgba(10,10,10,0.85)',
                      padding: '4px 10px',
                      borderRadius: '30px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--accent-secondary)'
                    }}>
                      {dish.category}
                    </div>
                  </div>

                  {/* Card Description */}
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-body)', fontWeight: 600 }}>{dish.name}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FBBF24', fontSize: '14px' }}>
                      <Star size={14} fill="#FBBF24" />
                      <span style={{ color: 'white', fontWeight: 600 }}>{dish.rating}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                      {dish.description}
                    </p>

                    {/* Price and Cart Action */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '12px',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '16px'
                    }}>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ${dish.price.toFixed(2)}
                      </div>
                      <button
                        onClick={() => addToCart(dish)}
                        className="btn-primary"
                        style={{
                          width: '40px',
                          height: '40px',
                          padding: 0,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 className="section-heading">Why Choose FlavorDash</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
              We set the gold standard in premium culinary delivery. Every component of our service is fine-tuned to deliver perfection.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {[
              {
                icon: <Clock size={32} style={{ color: 'var(--accent-primary)' }} />,
                title: "Fast Delivery",
                description: "State-of-the-art heated transportation pods ensure your dish lands on your table at exact restaurant temperature."
              },
              {
                icon: <Award size={32} style={{ color: 'var(--accent-secondary)' }} />,
                title: "Best Chefs",
                description: "We work exclusively with Michelin-starred culinarians who craft sensory recipes from organic harvests."
              },
              {
                icon: <Heart size={32} style={{ color: 'var(--accent-primary)' }} />,
                title: "Fresh Ingredients",
                description: "100% traceably sourced handpicked herbs, fresh sea harvests, and premium house dry-aged cuts."
              },
              {
                icon: <Shield size={32} style={{ color: 'var(--accent-secondary)' }} />,
                title: "Secure Payments",
                description: "Centurion grade encrypted multi-stage payments protect your identity, card data, and profile preferences."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="glass-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                style={{
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 600 }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
