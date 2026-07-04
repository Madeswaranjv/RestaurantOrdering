import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import Menu from './pages/Menu';
import MealPlanner from './pages/MealPlanner';
import RestaurantDetails from './pages/RestaurantDetails';
import FoodDetails from './pages/FoodDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserProfile from './pages/UserProfile';
import DeliveryDashboard from './pages/DeliveryDashboard';
import About from './pages/About';
import Contact from './pages/Contact';

function MainLayout() {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'restaurants':
        return <Restaurants />;
      case 'menu':
        return <Menu />;
      case 'planner':
        return <MealPlanner />;
      case 'restaurant-detail':
        return <RestaurantDetails />;
      case 'food-detail':
        return <FoodDetails />;
      case 'cart':
        return <Cart />;
      case 'checkout':
        return <Checkout />;
      case 'profile':
        return <UserProfile />;
      case 'delivery-dashboard':
        return <DeliveryDashboard />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return <Home />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        {renderPage()}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
