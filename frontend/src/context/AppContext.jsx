import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { driverStats } from '../data/mockData';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Navigation State
  const [currentPage, setCurrentPage] = useState('home');
  const [activeRestaurantId, setActiveRestaurantId] = useState(null);
  const [activeFoodId, setActiveFoodId] = useState(null);

  // Cart State
  const [cartItems, setCartItems] = useState([]);

  // User Profile & Order History State
  const [userProfile, setUserProfile] = useState({
    name: "Genevieve Sterling",
    email: "g.sterling@vanderbilt.com",
    phone: "+44 20 7946 0958",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    addresses: [
      { id: "a1", label: "Home (Townhouse)", address: "42 Sterling Sq, Chelsea, London SW3 2HJ" },
      { id: "a2", label: "Office (Vanderbilt Towers)", address: "100 Canary Wharf, Level 45, London E14 5AB" }
    ],
    activeAddressId: "a1",
    savedCards: [
      { id: "c1", cardBrand: "Visa Premium Black", number: "**** **** **** 8820", expiry: "12/29" },
      { id: "c2", cardBrand: "Amex Centurion", number: "**** ****** 91005", expiry: "06/30" }
    ],
    activeCardId: "c1",
    savedRestaurants: ["r1", "r2"],
    orderHistory: [
      {
        id: "ord-102",
        date: "2026-06-28",
        restaurantName: "L'Ambroisie",
        items: [
          { name: "Pappardelle with Black Truffle", quantity: 1, price: 35.00 },
          { name: "Grand Grand Chocolate Soufflé", quantity: 2, price: 24.00 }
        ],
        subtotal: 83.00,
        deliveryFee: 15.00,
        taxes: 8.30,
        total: 106.30,
        status: "Completed"
      },
      {
        id: "ord-101",
        date: "2026-06-15",
        restaurantName: "Sakura Zen",
        items: [
          { name: "Signature Omakase Selection", quantity: 2, price: 85.00 }
        ],
        subtotal: 170.00,
        deliveryFee: 15.00,
        taxes: 17.00,
        total: 202.00,
        status: "Completed"
      }
    ]
  });

  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, menuRes, catRes] = await Promise.all([
          api.get('/restaurant'),
          api.get('/menu?limit=100'),
          api.get('/categories')
        ]);
        
        // Map backend restaurants to frontend format
        const fetchedRestaurants = resRes.data.data.map(r => ({
          id: r._id,
          name: r.name,
          cuisine: r.cuisines,
          rating: r.rating,
          reviewsCount: r.reviews?.length || 0,
          deliveryTime: "25-35", // default
          priceRange: "$$$", // default
          coverImage: r.coverImage,
          logoImage: r.gallery && r.gallery.length > 0 ? r.gallery[0] : "",
          description: r.description,
          featured: true,
          location: r.address,
          gallery: r.gallery || []
        }));
        setRestaurants(fetchedRestaurants);

        // Map backend menu to frontend format
        const fetchedDishes = menuRes.data.data.menuItems.map(d => ({
          id: d._id,
          restaurantId: fetchedRestaurants.length > 0 ? fetchedRestaurants[0].id : null,
          name: d.name,
          category: d.category?.name || "Mains",
          price: d.price,
          rating: d.rating,
          description: d.description,
          image: d.images && d.images.length > 0 ? d.images[0] : "",
          ingredients: d.ingredients || [],
          nutrition: d.nutrition || {},
          reviews: []
        }));
        setDishes(fetchedDishes);

        const fetchedCategories = catRes.data.data.map(c => ({
          id: c._id,
          name: c.name,
          description: c.description,
          image: c.image
        }));
        setCategories(fetchedCategories);

      } catch (error) {
        console.error("Error fetching initial data", error);
      }
    };
    fetchData();
  }, []);

  // AI Meal Planner Preferences and Generated Plan State
  const [mealPlannerInput, setMealPlannerInput] = useState({
    age: 28,
    weight: 65,
    goal: "Maintain Weight",
    diet: "None"
  });

  const [mealPlan, setMealPlan] = useState(null);

  // Delivery Driver State (Uber Driver Redesign)
  const [driverState, setDriverState] = useState(driverStats);

  // Scroll to top on page change
  const navigateTo = (page, params = {}) => {
    setCurrentPage(page);
    if (params.restaurantId) setActiveRestaurantId(params.restaurantId);
    if (params.foodId) setActiveFoodId(params.foodId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Functions
  const addToCart = (dish, customization = {}, quantity = 1) => {
    setCartItems(prev => {
      // Find item with same dish ID and same customization details
      const existingItemIndex = prev.findIndex(item => 
        item.dishId === dish.id && 
        JSON.stringify(item.customization) === JSON.stringify(customization)
      );

      if (existingItemIndex > -1) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        const matchingRestaurant = restaurants.find(r => r.id === dish.restaurantId);
        return [...prev, {
          cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          dishId: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          quantity,
          customization,
          restaurantName: matchingRestaurant ? matchingRestaurant.name : "Fine Dining"
        }];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = cartSubtotal > 0 ? 15.00 : 0.00;
  const taxes = Number((cartSubtotal * 0.1).toFixed(2));
  const cartTotal = Number((cartSubtotal + deliveryFee + taxes).toFixed(2));

  // Profile Customizations
  const toggleSaveRestaurant = (restaurantId) => {
    setUserProfile(prev => {
      const isSaved = prev.savedRestaurants.includes(restaurantId);
      const saved = isSaved 
        ? prev.savedRestaurants.filter(id => id !== restaurantId)
        : [...prev.savedRestaurants, restaurantId];
      return { ...prev, savedRestaurants: saved };
    });
  };

  const updateProfile = (newProfileInfo) => {
    setUserProfile(prev => ({ ...prev, ...newProfileInfo }));
  };

  // Place Order (User -> Driver)
  const placeOrder = (activeAddress, activeCard) => {
    if (cartItems.length === 0) return null;

    const newOrderId = `ord-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder = {
      id: newOrderId,
      date: new Date().toISOString().split('T')[0],
      restaurantName: cartItems[0].restaurantName,
      items: cartItems.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
      subtotal: cartSubtotal,
      deliveryFee,
      taxes,
      total: cartTotal,
      status: "Preparing", // Preparing -> On the Way -> Delivered
      address: activeAddress.address,
      paymentMethod: activeCard.cardBrand
    };

    // Add to user history
    setUserProfile(prev => ({
      ...prev,
      orderHistory: [newOrder, ...prev.orderHistory]
    }));

    // Add order to driver active deliveries list
    const driverOrder = {
      id: newOrderId,
      restaurantName: newOrder.restaurantName,
      pickupAddress: "Restaurant Premium Kitchen",
      deliveryAddress: newOrder.address,
      status: "Accepted",
      amount: Number((newOrder.total * 0.15).toFixed(2)), // Driver gets 15% delivery commission
      coordinates: { x: Math.floor(20 + Math.random() * 60), y: Math.floor(20 + Math.random() * 60) },
      itemsCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
      customerName: userProfile.name
    };

    setDriverState(prev => ({
      ...prev,
      liveDeliveries: [driverOrder, ...prev.liveDeliveries]
    }));

    // Clear cart
    clearCart();

    return newOrderId;
  };

  // Driver actions
  const updateDeliveryStatus = (deliveryId, newStatus) => {
    setDriverState(prev => {
      const updatedDeliveries = prev.liveDeliveries.map(del => {
        if (del.id === deliveryId) {
          return { ...del, status: newStatus };
        }
        return del;
      });

      // If status is "Delivered", remove from live deliveries and add to earnings
      const deliveryItem = prev.liveDeliveries.find(del => del.id === deliveryId);
      if (newStatus === "Delivered" && deliveryItem) {
        const cleanDeliveries = updatedDeliveries.filter(del => del.id !== deliveryId);
        const addedEarning = deliveryItem.amount;
        return {
          ...prev,
          weeklyEarnings: prev.weeklyEarnings + addedEarning,
          totalDeliveries: prev.totalDeliveries + 1,
          liveDeliveries: cleanDeliveries,
          earningsHistory: prev.earningsHistory.map((item, idx) => 
            // Add earnings to Sunday (last item) for demo purposes
            idx === 6 ? { ...item, amount: item.amount + addedEarning } : item
          )
        };
      }

      return {
        ...prev,
        liveDeliveries: updatedDeliveries
      };
    });

    // Mirror status update to user profile order history!
    setUserProfile(prev => ({
      ...prev,
      orderHistory: prev.orderHistory.map(ord => 
        ord.id === deliveryId ? { ...ord, status: newStatus } : ord
      )
    }));
  };

  return (
    <AppContext.Provider value={{
      restaurants,
      dishes,
      categories,
      currentPage,
      activeRestaurantId,
      activeFoodId,
      navigateTo,
      
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartSubtotal,
      deliveryFee,
      taxes,
      cartTotal,

      userProfile,
      updateProfile,
      toggleSaveRestaurant,
      placeOrder,

      mealPlannerInput,
      setMealPlannerInput,
      mealPlan,
      setMealPlan,

      driverState,
      updateDeliveryStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};
