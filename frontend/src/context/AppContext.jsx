import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import * as authService from '../services/authService';
import * as menuService from '../services/menuService';
import * as restaurantService from '../services/restaurantService';
import * as cartService from '../services/cartService';
import * as orderService from '../services/orderService';
import * as userService from '../services/userService';
import * as deliveryService from '../services/deliveryService';
import * as aiService from '../services/aiService';
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

  // Initial Fetch States
  const [initialLoading, setInitialLoading] = useState(false);
  const [initialError, setInitialError] = useState('');

  // Live Tracking Coordinate State
  const [liveOrderCoordinates, setLiveOrderCoordinates] = useState({});

  // User Profile & Order History State
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

  // AI Meal Planner State
  const [mealPlannerInput, setMealPlannerInput] = useState({
    age: 28,
    weight: 65,
    goal: "Maintain Weight",
    diet: "None"
  });

  const [mealPlan, setMealPlan] = useState(null);

  // Delivery Driver State
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
        id: addr._id || addr.id,
        label: addr.label,
        address: addr.address,
        isDefault: addr.isDefault
      })) : [],
      activeAddressId: userObj.addresses?.find(a => a.isDefault)?._id || userObj.addresses?.find(a => a.isDefault)?.id || (userObj.addresses?.[0]?._id || userObj.addresses?.[0]?.id || ""),
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
      const data = await cartService.getCart();
      const cartData = data.cart;
      if (cartData) {
        setCartItems(mapBackendCartToFrontend(cartData));
      }
    } catch (err) {
      console.error("Error fetching cart", err);
    }
  };

  const fetchOrders = async (userObj) => {
    try {
      const data = await orderService.getOrders();
      const orders = data.orders || [];
      updateUserProfileFromUserObj(userObj, orders);
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  const fetchDriverDashboard = async () => {
    try {
      const stats = await deliveryService.getDashboard();
      const activeData = await deliveryService.getActiveOrders();
      const activeOrders = activeData.orders || [];

      const availableData = await deliveryService.getAvailableOrders();
      const availableOrders = availableData.orders || [];

      const earningsData = await deliveryService.getEarnings() || { totalEarnings: 0, history: [] };

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

  // Initial Data Fetching (Menu, Categories, Restaurants)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        setInitialError('');
        const [resData, menuData, catData] = await Promise.all([
          restaurantService.getRestaurant(),
          menuService.getMenuItems({ limit: 100 }),
          menuService.getCategories()
        ]);

        const restObj = resData.restaurant;
        const fetchedRestaurants = restObj ? [{
          id: restObj._id,
          name: restObj.name,
          cuisine: restObj.cuisines || [],
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

        const fetchedDishes = menuData.menuItems.map(d => ({
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

        const fetchedCategories = catData.map(c => ({
          id: c._id,
          name: c.name,
          description: c.description,
          image: c.image
        }));
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching initial data", error);
        setInitialError(error.message || 'Failed to load initial data');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Parse Google OAuth redirect params and Auto Login Effect
  useEffect(() => {
    const autoLogin = async () => {
      // Check window URL for OAuth success parameters
      if (window.location.pathname.includes('/oauth-success') || window.location.search.includes('token=')) {
        const params = new URLSearchParams(window.location.search);
        const oauthToken = params.get('token');
        if (oauthToken) {
          localStorage.setItem('token', oauthToken);
          setToken(oauthToken);
        }
        window.history.replaceState({}, document.title, '/');
      }

      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const data = await authService.getMe();
          const userObj = data.user;
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

  // Intercept 401 Unauthorized globally from api.js response
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      setCartItems([]);
      navigateTo('auth');
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

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

      socketConn.on('driverLocationChanged', ({ orderId, coords }) => {
        console.log(`Socket update: Live location for order ${orderId} changed to:`, coords);
        setLiveOrderCoordinates(prev => ({
          ...prev,
          [orderId]: coords
        }));
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

  // Driver Location Simulation Effect
  useEffect(() => {
    if (user && user.role === 'deliveryPartner' && socket) {
      const activeJobs = driverState.liveDeliveries.filter(d => d.status === 'On the Way');
      if (activeJobs.length === 0) return;

      console.log(`Driver has active 'On the Way' jobs. Starting simulated location updates...`);
      let step = 0;
      const interval = setInterval(() => {
        step += 0.05;
        if (step > 1) step = 0; // reset
        activeJobs.forEach(job => {
          const targetX = 75; // customer coordinates
          const targetY = 30;
          const x = Number((25 + (targetX - 25) * step).toFixed(2));
          const y = Number((70 + (targetY - 70) * step).toFixed(2));
          socket.emit('driverLocationUpdate', {
            orderId: job.id,
            coords: { x, y }
          });
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user, socket, driverState.liveDeliveries]);

  // Join Order Socket Room
  const joinOrderRoom = (orderId) => {
    if (socket) {
      socket.emit('joinOrder', orderId);
      console.log(`Joined Socket.IO room for order: ${orderId}`);
    }
  };

  // Navigation Helper
  const navigateTo = (page, params = {}) => {
    const protectedPages = ['profile', 'cart', 'checkout', 'delivery-dashboard', 'admin-dashboard'];
    if (protectedPages.includes(page) && !localStorage.getItem('token')) {
      setCurrentPage('auth');
    } else if (page === 'admin-dashboard' && user && user.role !== 'admin') {
      setCurrentPage('home');
    } else if (page === 'delivery-dashboard' && user && user.role !== 'deliveryPartner') {
      setCurrentPage('home');
    } else {
      setCurrentPage(page);
      if (params.restaurantId) setActiveRestaurantId(params.restaurantId);
      if (params.foodId) setActiveFoodId(params.foodId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth Operations
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const { accessToken, user: userObj } = data;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(userObj);

    if (userObj.role === 'deliveryPartner') {
      navigateTo('delivery-dashboard');
      await fetchDriverDashboard();
    } else if (userObj.role === 'admin') {
      navigateTo('admin-dashboard');
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
        await authService.logout(storedToken).catch(() => {});
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
    if (!localStorage.getItem('token')) {
      navigateTo('auth');
      return;
    }
    try {
      const data = await cartService.addToCart(dish.id || dish._id, quantity, customization);
      setCartItems(mapBackendCartToFrontend(data.cart));
    } catch (err) {
      console.error("Error adding to cart", err);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!localStorage.getItem('token')) return;
    try {
      const data = await cartService.removeCartItem(cartItemId);
      setCartItems(mapBackendCartToFrontend(data.cart));
    } catch (err) {
      console.error("Error removing from cart", err);
    }
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (!localStorage.getItem('token')) return;
    if (newQty <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    try {
      const data = await cartService.updateCartItem(cartItemId, newQty);
      setCartItems(mapBackendCartToFrontend(data.cart));
    } catch (err) {
      console.error("Error updating quantity", err);
    }
  };

  const clearCart = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      await cartService.clearCart();
      setCartItems([]);
    } catch (err) {
      console.error("Error clearing cart", err);
    }
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = cartSubtotal > 0 ? 15.00 : 0.00;
  const taxes = Number((cartSubtotal * 0.1).toFixed(2));
  const cartTotal = Number((cartSubtotal + deliveryFee + taxes).toFixed(2));

  // Profile Address & Password modifications
  const toggleSaveRestaurant = async (restaurantId) => {
    if (!localStorage.getItem('token')) {
      navigateTo('auth');
      return;
    }
    try {
      const data = await userService.toggleSaveRestaurant(restaurantId);
      const saved = data.savedRestaurants;
      setUser(prev => ({ ...prev, savedRestaurants: saved }));
      setUserProfile(prev => ({ ...prev, savedRestaurants: saved }));
    } catch (err) {
      console.error("Error toggling saved restaurant", err);
    }
  };

  const updateProfile = async (newProfileInfo) => {
    if (!user) return;
    try {
      const data = await userService.updateProfile({
        name: newProfileInfo.name,
        phone: newProfileInfo.phone,
        avatar: user.avatar
      });
      const updatedUser = data.user;
      setUser(updatedUser);
      await fetchOrders(updatedUser);
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  const updatePassword = async (oldPassword, newPassword) => {
    try {
      await userService.changePassword(oldPassword, newPassword);
      return true;
    } catch (err) {
      console.error("Error changing password", err);
      throw err;
    }
  };

  const handleAddAddress = async (addressData) => {
    try {
      const data = await userService.addAddress(addressData);
      setUser(prev => {
        const updated = { ...prev, addresses: data.addresses };
        updateUserProfileFromUserObj(updated, userProfile.orderHistory || []);
        return updated;
      });
    } catch (err) {
      console.error("Error adding address", err);
      throw err;
    }
  };

  const handleUpdateAddress = async (id, addressData) => {
    try {
      const data = await userService.updateAddress(id, addressData);
      setUser(prev => {
        const updated = { ...prev, addresses: data.addresses };
        updateUserProfileFromUserObj(updated, userProfile.orderHistory || []);
        return updated;
      });
    } catch (err) {
      console.error("Error updating address", err);
      throw err;
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const data = await userService.deleteAddress(id);
      setUser(prev => {
        const updated = { ...prev, addresses: data.addresses };
        updateUserProfileFromUserObj(updated, userProfile.orderHistory || []);
        return updated;
      });
    } catch (err) {
      console.error("Error deleting address", err);
      throw err;
    }
  };

  // Place Order
  const placeOrder = async (activeAddress, activeCard) => {
    if (cartItems.length === 0 || !user) return null;
    try {
      const data = await orderService.placeOrder(
        activeAddress.address,
        activeCard.cardBrand || "COD"
      );
      const order = data.order;
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
      await deliveryService.acceptOrder(orderId);
      await fetchDriverDashboard();
    } catch (err) {
      console.error("Error accepting order", err);
    }
  };

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      if (newStatus === 'Arrived at Store') {
        setDriverState(prev => ({
          ...prev,
          liveDeliveries: prev.liveDeliveries.map(d => d.id === deliveryId ? { ...d, status: 'Arrived at Store' } : d)
        }));
      } else if (newStatus === 'On the Way') {
        await deliveryService.pickupOrder(deliveryId);
        await fetchDriverDashboard();
      } else if (newStatus === 'Delivered') {
        await deliveryService.deliverOrder(deliveryId);
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
      updatePassword,
      addAddress: handleAddAddress,
      updateAddress: handleUpdateAddress,
      deleteAddress: handleDeleteAddress,
      toggleSaveRestaurant,
      placeOrder,

      mealPlannerInput,
      setMealPlannerInput,
      mealPlan,
      setMealPlan,

      driverState,
      acceptJob,
      updateDeliveryStatus,
      initialLoading,
      initialError,
      liveOrderCoordinates,
      joinOrderRoom,
      socket
    }}>
      {children}
    </AppContext.Provider>
  );
};
