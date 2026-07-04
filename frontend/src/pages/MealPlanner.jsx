import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, ShoppingCart, Info, Flame, ShieldAlert, Award } from 'lucide-react';
import api from '../services/api';

export default function MealPlanner() {
  const { mealPlannerInput, setMealPlannerInput, mealPlan, setMealPlan, addToCart, dishes } = useApp();
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, val) => {
    setMealPlannerInput(prev => ({ ...prev, [field]: val }));
  };

  const generateMealPlan = async () => {
    setLoading(true);
    setMealPlan(null);
    try {
      const res = await api.post('/ai/meal-plan', {
        age: Number(mealPlannerInput.age),
        weight: Number(mealPlannerInput.weight),
        goal: mealPlannerInput.goal,
        dietaryPreference: mealPlannerInput.diet
      });

      const plan = res.data.data.mealPlan.plan;

      const starters = dishes.filter(d => d.category === 'Starters');
      const mains = dishes.filter(d => d.category === 'Mains');
      const desserts = dishes.filter(d => d.category === 'Desserts');

      const bDishBase = starters[Math.floor(Math.random() * starters.length)] || dishes[0];
      const lDishBase = mains[Math.floor(Math.random() * mains.length)] || dishes[1];
      const dDishBase = desserts[Math.floor(Math.random() * desserts.length)] || dishes[2];

      const bDish = {
        ...bDishBase,
        name: plan.breakfast.split('.')[0] || bDishBase.name,
        description: plan.breakfast
      };

      const lDish = {
        ...lDishBase,
        name: plan.lunch.split('.')[0] || lDishBase.name,
        description: plan.lunch
      };

      const dDish = {
        ...dDishBase,
        name: plan.dinner.split('.')[0] || dDishBase.name,
        description: plan.dinner
      };

      setMealPlan({
        meals: [
          { type: "Breakfast", dish: bDish },
          { type: "Lunch", dish: lDish },
          { type: "Dinner", dish: dDish }
        ],
        stats: {
          calories: plan.calories,
          protein: plan.protein,
          carbs: plan.carbs,
          fat: plan.fats
        }
      });
    } catch (err) {
      console.error("Error generating meal plan from AI", err);
    } finally {
      setLoading(false);
    }
  };

  const addWholePlanToCart = () => {
    if (!mealPlan) return;
    mealPlan.meals.forEach(meal => {
      addToCart(meal.dish);
    });
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '60px 0 120px 0' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,45,45,0.1) 100%)',
            border: '1px solid rgba(255, 45, 45, 0.2)',
            color: 'var(--accent-secondary)',
            padding: '8px 16px',
            borderRadius: '80px',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            <Sparkles size={14} /> HEURISTIC NUTRITION AGENT v2
          </div>
          <h1 style={{ fontSize: '48px', marginBottom: '12px' }}>AI Meal Planner</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>
            Customize your metabolic targets and let our model formulate a Michelin-starred daily diet.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          gap: '40px',
          alignItems: 'start'
        }} className="planner-grid">
          
          {/* Settings Dashboard Card */}
          <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              Planner Preferences
            </h3>
            
            {/* Age */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Age (Years)</label>
              <input
                type="number"
                className="glass-input"
                value={mealPlannerInput.age}
                onChange={(e) => handleInputChange('age', Number(e.target.value))}
              />
            </div>

            {/* Weight */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Weight (kg)</label>
              <input
                type="number"
                className="glass-input"
                value={mealPlannerInput.weight}
                onChange={(e) => handleInputChange('weight', Number(e.target.value))}
              />
            </div>

            {/* Goal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Fitness Goal</label>
              <select
                className="glass-input"
                value={mealPlannerInput.goal}
                onChange={(e) => handleInputChange('goal', e.target.value)}
                style={{ background: 'var(--bg-secondary)', color: 'white' }}
              >
                <option value="Lose Weight">Lose Weight (Caloric Deficit)</option>
                <option value="Maintain Weight">Maintain Weight (Isocaloric)</option>
                <option value="Gain Muscle">Gain Muscle (Caloric Surplus)</option>
              </select>
            </div>

            {/* Dietary Preference */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Dietary Preference</label>
              <select
                className="glass-input"
                value={mealPlannerInput.diet}
                onChange={(e) => handleInputChange('diet', e.target.value)}
                style={{ background: 'var(--bg-secondary)', color: 'white' }}
              >
                <option value="None">No Restrictions</option>
                <option value="Vegetarian">Vegetarian (No meat/fish)</option>
              </select>
            </div>

            {/* Submit */}
            <button
              onClick={generateMealPlan}
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                marginTop: '10px',
                background: 'var(--accent-gradient)'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw className="spin-slow" size={16} /> Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Formulate Daily Plan
                </>
              )}
            </button>
          </div>

          {/* Results Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {mealPlan ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}
              >
                {/* Stats Dashboard */}
                <div className="glass-card stats-grid" style={{
                  padding: '30px',
                  background: 'linear-gradient(135deg, rgba(25,25,25,0.8) 0%, rgba(15,15,15,0.8) 100%)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--accent-primary)' }}>
                      <Flame size={16} fill="var(--accent-primary)" />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>ENERGY</span>
                    </div>
                    <span style={{ fontSize: '28px', fontWeight: 700 }}>{mealPlan.stats.calories} kcal</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>PROTEIN</span>
                    <span style={{ fontSize: '28px', fontWeight: 700, display: 'block', color: '#10B981', marginTop: '4px' }}>{mealPlan.stats.protein}g</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>CARBS</span>
                    <span style={{ fontSize: '28px', fontWeight: 700, display: 'block', color: '#3B82F6', marginTop: '4px' }}>{mealPlan.stats.carbs}g</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>FAT</span>
                    <span style={{ fontSize: '28px', fontWeight: 700, display: 'block', color: '#FBBF24', marginTop: '4px' }}>{mealPlan.stats.fat}g</span>
                  </div>
                </div>

                {/* Meals List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {mealPlan.meals.map((meal, index) => (
                    <div
                      key={index}
                      className="glass-card meal-row"
                      style={{
                        padding: '24px',
                        display: 'grid',
                        gridTemplateColumns: '150px 1fr auto',
                        gap: '24px',
                        alignItems: 'center'
                      }}
                    >
                      <img
                        src={meal.dish.image}
                        alt={meal.dish.name}
                        style={{
                          width: '100%',
                          height: '100px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          border: '1px solid var(--border-color)'
                        }}
                      />
                      <div>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--accent-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {meal.type}
                        </span>
                        <h4 style={{ fontSize: '18px', fontWeight: 600, marginTop: '4px' }}>{meal.dish.name}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', lineHeight: '1.4' }}>
                          {meal.dish.description.substring(0, 100)}...
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 700 }}>${meal.dish.price.toFixed(2)}</span>
                        <button
                          onClick={() => addToCart(meal.dish)}
                          className="btn-secondary"
                          style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '20px' }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bulk Action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={addWholePlanToCart} className="btn-primary">
                    <ShoppingCart size={16} /> Add All Meals to Cart
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card" style={{
                padding: '80px 40px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                minHeight: '400px'
              }}>
                <Info size={40} style={{ color: 'var(--text-muted)' }} />
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>Plan Awaiting Formulation</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '400px', margin: '0 auto' }}>
                    Adjust your fitness statistics on the left and tap the button to compute your custom gastronomy sequence.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          .planner-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .meal-row {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .meal-row img {
            height: 150px !important;
            max-width: 250px;
            margin: 0 auto;
          }
          .meal-row div {
            align-items: center !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
