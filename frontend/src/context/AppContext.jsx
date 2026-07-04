import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { io } from 'socket.io-client';

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

  // Auth State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Cart State
  const [cartItems, setCartItems] = useState([]);

  // User Profile & Order History State (initialized with default structure to prevent UI crashes)
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    addresses: [],
    activeAddressId: "",
    savedCards: [
      { id: "c1", cardBrand: "Visa Premium Black", number: "**** **** **** 8820", expiry: "12/29" },
      { id: "c2", cardBrand: "Amex Centurion", number: "**** ****** 91005", expiry: "06/30" }
    ],
    activeCardId: "c1",
    savedRestaurants: [],
    orderHistory: []
  });

  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);

  // AI Meal Planner Preferences and Generated Plan State
  const [mealPlannerInput, setMealPlannerInput] = useState({
    age: 28,
    weight: 65,
    goal: "Maintain Weight",
    diet: "None"
  });

  const [mealPlan, setMealPlan] = useState(null);

  // Delivery Driver State (Uber Driver Redesign)
  const [driverState, setDriverState] = useState({
    driverName: "",
    weeklyEarnings: 0,
    totalDeliveries: 0,
    rating: 5.0,
    weeklyPoints: 0,
    liveDeliveries: [],
    earningsHistory: [],
    heatmapPoints: [],
    aiInsights: []
  });

  // Socket State
  const [socket, setSocket] = useState(null);

  // Map backend cart structure to frontend format
  const mapBackendCartToFrontend = (backendCart) => {
    if (!backendCart || !backendCart.items) return [];
    return backendCart.items.map(item => {
      const dish = item.menuItem;
      if (!dish) return null;
      return {
        cartItemId: dish._id,
        dishId: dish._id,
        name: dish.name,
        price: dish.price,
        image: dish.images && dish.images.length > 0 ? dish.images[0] : "",
        quantity: item.quantity,
        customization: item.customization || {},
        restaurantName: "L'Ambroisie"
      };
    }).filter(Boolean);
  };

  // Map backend user to userProfile
  const updateUserProfileFromUserObj = (userObj, orders = []) => {
    if (!userObj) return;
    setUserProfile(prev => ({
      ...prev,
      name: userObj.name || "",
      email: userObj.email || "",
      phone: userObj.phone || "",
      avatar: userObj.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
      addresses: userObj.addresses ? userObj.addresses.map(addr => ({
        id: addr._id,
        label: addr.label,
        address: addr.address,
        isDefault: addr.isDefault
      })) : [],
      activeAddressId: userObj.addresses?.find(a => a.isDefault)?._id || (userObj.addresses?.[0]?._id || ""),
      savedRestaurants: userObj.savedRestaurants || [],
      orderHistory: orders.map(o => ({
        id: o._id,
        date: o.createdAt ? o.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        restaurantName: "L'Ambroisie",
        items: o.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        taxes: o.tax,
        total: o.grandTotal,
        status: o.status === 'DELIVERED' ? 'Completed' :
                o.status === 'CANCELLED' ? 'Cancelled' :
                o.status === 'OUT_FOR_DELIVERY' ? 'On the Way' :
                o.status === 'READY_FOR_PICKUP' ? 'Arrived at Store' : 'Preparing',
        address: o.deliveryAddress,
        paymentMethod: o.paymentMethod || 'COD'
      }))
    }));
  };

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      const cartData = res.data.data.cart;
      if (cartData) {
        setCartItems(mapBackendCartToFrontend(cartData));
      }
    } catch (err) {
      console.error("Error fetching cart", err);
    }
  };

  const fetchOrders = async (userObj) => {
    try {
      const res = await api.get('/orders');
      const orders = res.data.data.orders || [];
      updateUserProfileFromUserObj(userObj, orders);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  const fetchDriverDashboard = async () => {
    try {
      const dashRes = await api.get('/delivery/dashboard');
      const stats = dashRes.data.data;

      const activeRes = await api.get('/delivery/active');
      const activeOrders = activeRes.data.data.orders || [];

      const availableRes = await api.get('/delivery/orders');
      const availableOrders = availableRes.data.data.orders || [];

      const earningsRes = await api.get('/delivery/earnings');
      const earningsData = earningsRes.data.data || { totalEarnings: 0, history: [] };

      // Map earnings to daily chart format (Mon-Sun)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const defaultHistory = days.map(d => ({ day: d, amount: 0 }));
      if (earningsData.history && earningsData.history.length > 0) {
        earningsData.history.forEach(item => {
          const date = new Date(item.date);
          const dayIndex = date.getDay(); // 0 is Sun, 1 is Mon...
          const mappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
          defaultHistory[mappedIndex].amount += Number(item.earning);
        });
      }

      // Map active delivery jobs
      const mappedAssigned = activeOrders.map(order => ({
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

      // Map available delivery jobs
      const mappedAvailable = availableOrders.map(order => ({
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

      setDriverState({
        driverName: user?.name || "Dimitri Vance",
        weeklyEarnings: stats.weeklyEarnings || 0,
        totalDeliveries: stats.totalDeliveries || 0,
        rating: 4.9,
        weeklyPoints: 1250,
        liveDeliveries: [...mappedAssigned, ...mappedAvailable],
        earningsHistory: defaultHistory,
        heatmapPoints: [
          { x: 35, y: 45, weight: 0.8 },
          { x: 55, y: 60, weight: 0.6 },
          { x: 40, y: 30, weight: 0.9 },
          { x: 65, y: 50, weight: 0.5 }
        ],
        aiInsights: [
          { message: "High demand expected near Chelsea Harbour between 7 PM - 9 PM. Surge pricing (+15%) active." },
          { message: "Your average preparation wait time at L'Ambroisie is under 8 minutes today. Excellent efficiency!" }
        ]
      });
    } catch (err) {
      console.error("Error loading driver dashboard", err);
    }
  };

  // Initial Data Fetching (Menu and Restaurants)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [resRes, menuRes, catRes] = await Promise.all([
          api.get('/restaurant'),
          api.get('/menu?limit=100'),
          api.get('/categories')
        ]);

        const restObj = resRes.data.data.restaurant;
        const fetchedRestaurants = restObj ? [{
          id: restObj._id,
          name: restObj.name,
          cuisine: restObj.cuisines,
          rating: restObj.rating,
          reviewsCount: restObj.reviews?.length || 0,
          deliveryTime: "25-35",
          priceRange: "$$$",
          coverImage: restObj.coverImage,
          logoImage: restObj.gallery && restObj.gallery.length > 0 ? restObj.gallery[0] : "",
          description: restObj.description,
          featured: true,
          location: restObj.address,
          gallery: restObj.gallery || []
        }] : [];
        setRestaurants(fetchedRestaurants);

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
    fetchInitialData();
  }, []);

  // Auto Login Effect
  useEffect(() => {
    const autoLogin = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          const userObj = res.data.data.user;
          setUser(userObj);

          if (userObj.role === 'deliveryPartner') {
            await fetchDriverDashboard();
          } else {
            await fetchCart();
            await fetchOrders(userObj);
          }
        } catch (err) {
          console.error("Auto login failed", err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
    };
    autoLogin();
  }, [token]);

  // Socket.IO Effect
  useEffect(() => {
    if (user) {
      const socketConn = io('http://localhost:5000');

      socketConn.on('connect', () => {
        console.log('Socket.IO connected:', socketConn.id);
        socketConn.emit('joinUser', user._id);
        if (user.role === 'deliveryPartner') {
          socketConn.emit('joinDrivers');
        }
      });

      socketConn.on('orderStatusChanged', ({ orderId, status }) => {
        console.log(`Socket update: Order ${orderId} is now ${status}`);
        if (user.role === 'deliveryPartner') {
          fetchDriverDashboard();
        } else {
          fetchOrders(user);
        }
      });

      socketConn.on('deliveryOrderAvailable', (order) => {
        console.log('Socket update: New delivery available');
        if (user.role === 'deliveryPartner') {
          fetchDriverDashboard();
        }
      });

      socketConn.on('orderCancelled', ({ orderId }) => {
        console.log(`Socket update: Order ${orderId} cancelled`);
        if (user.role === 'deliveryPartner') {
          fetchDriverDashboard();
        } else {
          fetchOrders(user);
        }
      });

      setSocket(socketConn);

      return () => {
        socketConn.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  // Navigation Helper
  const navigateTo = (page, params = {}) => {
    // Basic route protection
    const protectedPages = ['profile', 'cart', 'checkout', 'delivery-dashboard'];
    if (protectedPages.includes(page) && !user) {
      setCurrentPage('auth');
    } else {
      setCurrentPage(page);
      if (params.restaurantId) setActiveRestaurantId(params.restaurantId);
      if (params.foodId) setActiveFoodId(params.foodId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Operations
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user: userObj } = res.data.data;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(userObj);

    if (userObj.role === 'deliveryPartner') {
      navigateTo('delivery-dashboard');
      await fetchDriverDashboard();
    } else {
      navigateTo('home');
      await fetchCart();
      await fetchOrders(userObj);
    }
    return userObj;
  };

  const setAuthData = (userObj) => {
    setUser(userObj);
  };

  const logout = async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        // Fetch fresh details before logging out just to clean up tokens on backend
        await api.post('/auth/logout', { refreshToken: storedToken }).catch(() => {});
      } catch (err) {}
      localStorage.removeItem('token');
    }
    setToken(null);
    setUser(null);
    setCartItems([]);
    navigateTo('home');
  };

  // Cart Operations
  const addToCart = async (dish, customization = {}, quantity = 1) => {
    if (!user) {
      navigateTo('auth');
      return;
    }
    try {
      const res = await api.post('/cart/add', {
        menuItemId: dish.id || dish._id,
        quantity,
        customization
      });
      setCartItems(mapBackendCartToFrontend(res.data.data.cart));
    } catch (err) {
      console.error("Error adding to cart", err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!user) return;
    try {
      const res = await api.delete(`/cart/remove/${cartItemId}`);
      setCartItems(mapBackendCartToFrontend(res.data.data.cart));
    } catch (err) {
      console.error("Error removing from cart", err);
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (!user) return;
    if (newQty <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    try {
      const res = await api.put('/cart/update', {
        menuItemId: cartItemId,
        quantity: newQty
      });
      setCartItems(mapBackendCartToFrontend(res.data.data.cart));
    } catch (err) {
      console.error("Error updating quantity", err);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      const res = await api.delete('/cart/clear');
      setCartItems([]);
    } catch (err) {
      console.error("Error clearing cart", err);
    }
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = cartSubtotal > 0 ? 15.00 : 0.00;
  const taxes = Number((cartSubtotal * 0.1).toFixed(2));
  const cartTotal = Number((cartSubtotal + deliveryFee + taxes).toFixed(2));

  // Profile Customizations
  const toggleSaveRestaurant = async (restaurantId) => {
    if (!user) {
      navigateTo('auth');
      return;
    }
    try {
      const res = await api.put(`/users/save-restaurant/${restaurantId}`);
      const saved = res.data.data.savedRestaurants;
      setUserProfile(prev => ({ ...prev, savedRestaurants: saved }));
    } catch (err) {
      console.error("Error toggling saved restaurant", err);
    }
  };

  const updateProfile = async (newProfileInfo) => {
    if (!user) return;
    try {
      const res = await api.put('/users/profile', {
        name: newProfileInfo.name,
        phone: newProfileInfo.phone,
        avatar: user.avatar
      });
      const updatedUser = res.data.data.user;
      setUser(updatedUser);
      await fetchOrders(updatedUser);
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  // Place Order
  const placeOrder = async (activeAddress, activeCard) => {
    if (cartItems.length === 0 || !user) return null;
    try {
      const res = await api.post('/orders', {
        deliveryAddress: activeAddress.address,
        paymentMethod: activeCard.cardBrand || "COD"
      });
      const order = res.data.data.order;
      setCartItems([]);
      await fetchOrders(user);
      return order._id;
    } catch (err) {
      console.error("Error placing order", err);
      return null;
    }
  };

  // Driver Operations
  const acceptJob = async (orderId) => {
    try {
      await api.put(`/delivery/accept/${orderId}`);
      await fetchDriverDashboard();
    } catch (err) {
      console.error("Error accepting order", err);
    }
  };

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      if (newStatus === 'Arrived at Store') {
        // Arrived at Store is a local transition step in the dashboard UI
        setDriverState(prev => ({
          ...prev,
          liveDeliveries: prev.liveDeliveries.map(d => d.id === deliveryId ? { ...d, status: 'Arrived at Store' } : d)
        }));
      } else if (newStatus === 'On the Way') {
        // Call pickup API
        await api.put(`/delivery/pickup/${deliveryId}`);
        await fetchDriverDashboard();
      } else if (newStatus === 'Delivered') {
        // Call deliver API
        await api.put(`/delivery/deliver/${deliveryId}`);
        await fetchDriverDashboard();
      }
    } catch (err) {
      console.error("Error updating delivery status", err);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      login,
      setAuthData,
      logout,
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
      acceptJob,
      updateDeliveryStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};
