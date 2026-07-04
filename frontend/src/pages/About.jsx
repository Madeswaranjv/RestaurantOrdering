import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award, Shield, Target, Eye } from 'lucide-react';

const chefs = [
  {
    id: "c1",
    name: "Chef Jean-Luc Dubois",
    role: "Culinary Director & Founder",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=300",
    bio: "Former Executive Chef of Michelin 3-starred venues in Paris and London, bringing 25 years of luxury gastronomy experience."
  },
  {
    id: "c2",
    name: "Chef Kenji Sato",
    role: "Head of Japanese Culinary Arts",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=300",
    bio: "Master sushi artisan trained in Tokyo's elite Ginza district, focusing on traditional Edo-style cuts and fermentation."
  },
  {
    id: "c3",
    name: "Chef Isabella Rossi",
    role: "Executive Pastry Chef",
    image: "https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?auto=format&fit=crop&q=80&w=300",
    bio: "Awarded 'Best Pastry Artist' in Milan, Isabella specializes in high-end sugar work and custom French-Italian dessert fusions."
  }
];

const testimonials = [
  {
    id: "t1",
    user: "Charlotte Sterling",
    location: "Chelsea, London",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    comment: "FlavorDash completely redefines dining at home. The dishes arrive at the perfect temperature, and the presentation matches what you'd experience at L'Ambroisie itself.",
    rating: 5
  },
  {
    id: "t2",
    user: "Julian Vanderbilt",
    location: "Tribeca, New York",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
    comment: "The AI Meal Planner is incredibly accurate. It tailored a daily menu that meets my fitness goals perfectly without compromising on luxury ingredients. Exceptional service.",
    rating: 5
  },
  {
    id: "t3",
    user: "Aria Takahashi",
    location: "Roppongi, Tokyo",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100",
    comment: "Unbelievable delivery speeds. The Omakase Selection was so fresh it tasted as if the Chef had handed it to me directly across the sushi counter. Recommended!",
    rating: 5
  }
];

const timelineEvents = [
  { year: "2023", title: "The Vision Born", description: "Conceived by a group of culinary enthusiasts and tech pioneers in London to bridge fine dining and high-end delivery." },
  { year: "2024", title: "Michelin Partnerships", description: "Secured exclusive partnerships with 15 Michelin-starred restaurants across Paris, Tokyo, and New York." },
  { year: "2025", title: "AI Integration Launch", description: "Introduced the AI Meal Planner, combining nutritionist models with fine-dining menu structures." },
  { year: "2026", title: "FlavorDash Global", description: "Serving premium culinary experiences to 12 metropolitan hubs across 4 continents." }
];

export default function About() {
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', overflow: 'hidden', paddingBottom: '120px' }}>
      
      {/* 1. HERO BANNER */}
      <section style={{
        padding: '120px 0',
        position: 'relative',
        background: 'linear-gradient(to bottom, #111 0%, var(--bg-primary) 100%)',
        textAlign: 'center'
      }}>
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="hero-heading" style={{ marginBottom: '24px' }}>Cultivating Gastronomy</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
              We started with a simple belief: that fine dining shouldn't be confined to dining halls. It is a sensory art that can travel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. VISION & MISSION */}
      <section style={{ padding: '40px 0' }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '50px'
        }} className="about-split-grid">
          
          {/* Mission */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
              <Target size={24} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '12px' }}>Our Mission</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
                To catalog and deliver the world's most premium dishes directly to patrons, preserving exact flavor integrity and presentation standards.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
              <Eye size={24} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '12px' }}>Our Vision</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
                To become the premier global ecosystem connecting elite Michelin-starred kitchens with demanding food connoisseurs.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. TIMELINE */}
      <section>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 className="section-heading">Milestone Timeline</h2>
            <p style={{ color: 'var(--text-muted)' }}>How we forged the future of luxury culinary deliveries.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '30px'
          }}>
            {timelineEvents.map((ev, idx) => (
              <motion.div
                key={idx}
                className="glass-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                style={{
                  padding: '30px',
                  position: 'relative'
                }}
              >
                <div style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'var(--accent-primary)',
                  marginBottom: '12px'
                }}>
                  {ev.year}
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>{ev.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>{ev.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CHEFS TEAM */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 className="section-heading">Master Chef Team</h2>
            <p style={{ color: 'var(--text-muted)' }}>The elite culinary directors formulating our gastro formulas.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '30px'
          }} className="chef-grid">
            {chefs.map((chef) => (
              <div key={chef.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: '300px', overflow: 'hidden' }}>
                  <img src={chef.image} alt={chef.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ fontSize: '20px', fontWeight: 600 }}>{chef.name}</h4>
                  <span style={{ fontSize: '13px', color: 'var(--accent-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {chef.role}
                  </span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginTop: '10px', flex: 1 }}>
                    {chef.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 className="section-heading">Patron Testimonials</h2>
            <p style={{ color: 'var(--text-muted)' }}>Read feedbacks from VIP cardholders and culinary critics.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '30px'
          }} className="testimonial-grid">
            {testimonials.map((test) => (
              <div key={test.id} className="glass-card" style={{
                padding: '30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                alignItems: 'flex-start'
              }}>
                <div style={{ display: 'flex', gap: '4px', color: '#FBBF24' }}>
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="#FBBF24" />
                  ))}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', flex: 1 }}>
                  "{test.comment}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', justifySelf: 'stretch', width: '100%' }}>
                  <img 
                    src={test.avatar} 
                    alt={test.user} 
                    style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h5 style={{ fontSize: '15px', fontWeight: 600 }}>{test.user}</h5>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{test.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .about-split-grid {
            grid-template-columns: 1fr !important;
          }
          .chef-grid {
            grid-template-columns: 1fr !important;
            max-width: 400px;
            margin: 0 auto;
          }
          .testimonial-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
