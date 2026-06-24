/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Grid,
  ShoppingCart,
  MapPin,
  User as UserIcon,
  Search,
  Bell,
  MessageSquare,
  Phone,
  MessageCircle,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Ticket,
  Copy,
  ChevronRight,
  Shield,
  Star,
  Sparkles,
  ArrowRight,
  Camera,
  LogOut,
  ChevronLeft
} from "lucide-react";
import { Product, Order, Coupon, SliderBanner, User, OrderItem } from "./types";

export default function App() {
  // Navigation Tabs: 'home' | 'categories' | 'cart' | 'tracking' | 'profile'
  const [activeTab, setActiveTab] = useState<"home" | "categories" | "cart" | "tracking" | "profile">("home");

  // Database lists
  const [products, setProducts] = useState<Product[]>([]);
  const [sliders, setSliders] = useState<SliderBanner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  // App states
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Checkout states
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "shipping" | "success">("cart");
  const [shippingForm, setShippingForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Dhaka",
    zipCode: "",
    notes: "",
    paymentMethod: "COD" as "COD" | "Online",
    onlinePaymentMethod: "Bkash" as "Bkash" | "Nagad" | "Rocket",
    transactionId: ""
  });
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Tracking State
  const [trackingIdInput, setTrackingIdInput] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingError, setTrackingError] = useState("");

  // User Auth state
  const [loggedInUser, setLoggedInUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    phone: "",
    password: "",
    email: "",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  });
  const [authError, setAuthError] = useState("");

  // Slider Carousel State
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  // Welcome Popup state
  const [showWelcomePopup, setShowWelcomePopup] = useState(() => {
    return localStorage.getItem("welcomeDismissed") !== "true";
  });

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; subtitle: string; time: string }[]>([
    { id: "1", title: "Flash Sale Live!", subtitle: "Up to 50% discount on organic lentils and honey", time: "10 mins ago" },
    { id: "2", title: "New Arrivals", subtitle: "Chaler Gura (Rice Flour) is back in stock", time: "2 hours ago" }
  ]);

  // Floating Action Button Animation (Contact Button)
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Live Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInputText, setChatInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch products & sliders on load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setSliders(data.sliders || []);
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  // 2. Auto sliding banner
  useEffect(() => {
    if (sliders.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % sliders.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [sliders]);

  // 3. Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const updateCart = (newCart: OrderItem[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  // 4. Polling chat messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const phone = loggedInUser?.phone || "01781099407"; // default session phone if guest

    if (isChatOpen) {
      const fetchChatHistory = async () => {
        try {
          const res = await fetch(`/api/chats/${phone}`);
          if (res.ok) {
            const data = await res.json();
            setChatMessages(data.messages || []);
          }
        } catch (err) {
          console.error("Error polling chat", err);
        }
      };

      fetchChatHistory();
      interval = setInterval(fetchChatHistory, 3000);
    }

    return () => clearInterval(interval);
  }, [isChatOpen, loggedInUser]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Welcome Popup dismiss
  const dismissWelcomePopup = () => {
    setShowWelcomePopup(false);
    localStorage.setItem("welcomeDismissed", "true");
  };

  // Cart operations
  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      updateCart(
        cart.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      updateCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image
        }
      ]);
    }
  };

  const decreaseQuantity = (productId: string) => {
    const existing = cart.find((item) => item.productId === productId);
    if (!existing) return;
    if (existing.quantity === 1) {
      updateCart(cart.filter((item) => item.productId !== productId));
    } else {
      updateCart(
        cart.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
      );
    }
  };

  const removeFromCart = (productId: string) => {
    updateCart(cart.filter((item) => item.productId !== productId));
  };

  // Calculate bill breakdown
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 
    ? (activeCoupon?.code === "FREESHIP" && subtotal >= 500 
        ? 0 
        : (shippingForm.city === "Dhaka" ? 80 : 130)) 
    : 0;
  
  // Calculate discount
  let discount = 0;
  if (activeCoupon && subtotal >= activeCoupon.minAmount) {
    if (activeCoupon.type === "flat") {
      discount = activeCoupon.discount;
    } else if (activeCoupon.type === "free_shipping") {
      discount = shippingForm.city === "Dhaka" ? 80 : 130; // free delivery
    }
  }
  const total = Math.max(0, subtotal + deliveryFee - discount);

  // Apply Coupon Code
  const applyCoupon = () => {
    const coupon = coupons.find((c) => c.code.toUpperCase() === couponCodeInput.trim().toUpperCase());
    if (!coupon) {
      alert("Invalid coupon code entered.");
      return;
    }
    if (subtotal < coupon.minAmount) {
      alert(`Minimum order of ৳${coupon.minAmount} required for this coupon.`);
      return;
    }
    setActiveCoupon(coupon);
    alert(`Voucher Applied: ৳${coupon.discount} discount saved!`);
  };

  // Register & Login handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (authMode === "register") {
      if (!authForm.name || !authForm.phone || !authForm.password) {
        setAuthError("All fields are required");
        return;
      }
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(authForm)
        });
        const data = await res.json();
        if (res.ok) {
          setLoggedInUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
          alert("Registration complete! Welcome to N Legacy.");
        } else {
          setAuthError(data.error || "Failed to register");
        }
      } catch (err) {
        setAuthError("Network error occurred");
      }
    } else {
      if (!authForm.phone || !authForm.password) {
        setAuthError("Phone and Password are required");
        return;
      }
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: authForm.phone, password: authForm.password })
        });
        const data = await res.json();
        if (res.ok) {
          setLoggedInUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          setAuthError(data.error || "Incorrect phone or password");
        }
      } catch (err) {
        setAuthError("Network error occurred");
      }
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("user");
  };

  // File upload simulation (or direct link editing for custom profiles)
  const updateProfileImage = async (imgUrl: string) => {
    if (!loggedInUser) return;
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loggedInUser.phone, profileImage: imgUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setLoggedInUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm order execution
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (shippingForm.paymentMethod === "Online") {
      if (!shippingForm.transactionId.trim()) {
        alert("Please enter your payment Transaction ID (Trx ID) to confirm the order.");
        return;
      }
    }

    const orderData = {
      userName: shippingForm.name,
      phone: shippingForm.phone,
      email: shippingForm.email,
      address: shippingForm.address,
      city: shippingForm.city,
      zipCode: shippingForm.zipCode,
      orderNotes: shippingForm.notes,
      paymentMethod: shippingForm.paymentMethod,
      onlinePaymentMethod: shippingForm.paymentMethod === "Online" ? shippingForm.onlinePaymentMethod : undefined,
      transactionId: shippingForm.paymentMethod === "Online" ? shippingForm.transactionId : undefined,
      items: cart,
      subtotal,
      deliveryFee,
      discount,
      total
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        const data: Order = await res.json();
        setCreatedOrder(data);
        updateCart([]); // Empty the cart
        setActiveCoupon(null);
        setCheckoutStep("success");
      } else {
        alert("Failed to submit order. Try again.");
      }
    } catch (err) {
      alert("Network error. Try again.");
    }
  };

  // Chat message send handler
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    const phone = loggedInUser?.phone || "01781099407"; // default session phone
    const name = loggedInUser?.name || "Guest Visitor";

    try {
      const res = await fetch(`/api/chats/${phone}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "user",
          text: chatInputText,
          userName: name
        })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
        setChatInputText("");
      }
    } catch (err) {
      console.error("Error sending chat", err);
    }
  };

  // Find order by tracking ID or phone
  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError("");
    setTrackedOrder(null);

    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const orders: Order[] = await res.json();
        const found = orders.find(
          (o) =>
            o.id.toUpperCase() === trackingIdInput.trim().toUpperCase() ||
            o.phone === trackingIdInput.trim()
        );
        if (found) {
          setTrackedOrder(found);
        } else {
          setTrackingError("No active order found with this tracking ID or Mobile Number.");
        }
      }
    } catch (err) {
      setTrackingError("Error tracking order. Please try again.");
    }
  };

  // Quick categories lookup
  const productCategories = ["All", "Organic", "Oil & Ghee", "Honey", "Dates", "Spices"];

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center font-sans selection:bg-indigo-200">
      
      {/* Mobile-oriented Mock Frame shell for high-fidelity presentation */}
      <div id="applet-frame" className="w-full max-w-md bg-white shadow-2xl relative min-h-screen flex flex-col overflow-hidden border border-slate-200">
        
        {/* ================= HEADER SECTION ================= */}
        <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="https://i.postimg.cc/tJd8J0y8/image.png" 
              alt="N Legacy Logo" 
              className="w-9 h-9 rounded-xl object-contain shadow-sm border border-slate-100 bg-slate-50"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="font-extrabold text-sm text-indigo-950 leading-tight">N Legacy</h1>
              <p className="text-[10px] text-emerald-600 font-bold tracking-wide">Premium Organic Grocery</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <button
              onClick={() => {
                setActiveTab("categories");
                setSearchQuery("");
              }}
              className="p-1.5 hover:bg-slate-50 rounded-lg transition"
            >
              <Search className="w-4.5 h-4.5 text-slate-600" />
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 hover:bg-slate-50 rounded-lg transition relative"
            >
              <Bell className="w-4.5 h-4.5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setActiveTab("cart")}
              className="p-1.5 hover:bg-slate-50 rounded-lg transition relative"
            >
              <ShoppingCart className="w-4.5 h-4.5 text-slate-600" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-extrabold text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Notifications Dropdown overlay */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-14 left-4 right-4 bg-white border border-slate-100 rounded-2xl shadow-xl z-40 p-4"
            >
              <div className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-indigo-500" /> Notifications
                </h4>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <h5 className="font-bold text-xs text-slate-800">{n.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{n.subtitle}</p>
                    <span className="text-[9px] text-slate-400 block mt-1">{n.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= WORKSPACE STREAM: DYNAMIC VIEWS ================= */}
        <main className="flex-1 overflow-y-auto pb-24 bg-slate-50">
          
          {/* A. VIEW: HOME */}
          {activeTab === "home" && (
            <div className="space-y-5 px-4 pt-4">
              
              {/* Image Banner Carousel Slider */}
              {sliders.length > 0 && (
                <div className="relative h-44 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-indigo-950">
                  <img
                    src={sliders[currentSlideIdx]?.image}
                    alt="Promo Banner"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Flash Deal Live</span>
                    <h2 className="text-white font-black text-base mt-0.5 leading-tight">{sliders[currentSlideIdx]?.title}</h2>
                    <p className="text-[11px] text-slate-200 mt-1">{sliders[currentSlideIdx]?.subtitle}</p>
                  </div>
                  {/* Indicators dot */}
                  <div className="absolute bottom-3 right-4 flex gap-1.5">
                    {sliders.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          currentSlideIdx === idx ? "bg-white w-3" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Fast Action Categories Grid */}
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setActiveTab("categories");
                    setSelectedCategory("Organic");
                  }}
                  className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-indigo-100 transition"
                >
                  <span className="text-xl">⚡</span>
                  <span className="text-[10px] font-extrabold text-slate-600 mt-1 truncate">Flash Sale</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("categories");
                    setSelectedCategory("Honey");
                  }}
                  className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-indigo-100 transition"
                >
                  <span className="text-xl">🏆</span>
                  <span className="text-[10px] font-extrabold text-slate-600 mt-1 truncate">Best Seller</span>
                </button>
                <button
                  onClick={() => setActiveTab("categories")}
                  className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-indigo-100 transition"
                >
                  <span className="text-xl">📦</span>
                  <span className="text-[10px] font-extrabold text-slate-600 mt-1 truncate">Category</span>
                </button>
                <button
                  onClick={() => setActiveTab("tracking")}
                  className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center hover:border-indigo-100 transition"
                >
                  <span className="text-xl">🚚</span>
                  <span className="text-[10px] font-extrabold text-slate-600 mt-1 truncate">Tracking</span>
                </button>
              </div>

              {/* Grand Promo Mini-banner */}
              <div className="bg-amber-500 rounded-2xl p-4 text-slate-950 flex justify-between items-center relative overflow-hidden shadow-sm">
                <div className="z-10">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-slate-950 text-white px-2 py-0.5 rounded">Grand Week</span>
                  <h3 className="font-extrabold text-sm mt-1.5 text-slate-950">Free Delivery on all organic orders</h3>
                  <p className="text-[10px] text-slate-900 mt-0.5">Valid for orders over ৳500</p>
                </div>
                <div className="text-4xl opacity-30 shrink-0">🎁</div>
              </div>

              {/* Category selector row */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-sm text-slate-800 tracking-tight">Browse Categories</h3>
                  <button onClick={() => setActiveTab("categories")} className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center">
                    See All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
                  {productCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveTab("categories");
                      }}
                      className="bg-white border border-slate-100 shadow-sm rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:border-indigo-100 hover:text-indigo-600 transition shrink-0"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hot Items / Live Flash Sale Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <h3 className="font-black text-sm text-slate-800 tracking-tight">Live Flash Sale</h3>
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">Ends in 17:22:20</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {products.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-col justify-between hover:shadow-md transition relative cursor-pointer"
                      onClick={() => setSelectedProduct(p)}
                    >
                      {p.discount && (
                        <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full z-10">
                          -{p.discount}%
                        </span>
                      )}
                      <div>
                        <img src={p.image} className="w-full h-24 object-cover rounded-xl mb-2.5" />
                        <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">{p.shop}</span>
                        <h4 className="font-bold text-slate-800 text-xs mt-0.5 truncate">{p.name}</h4>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-500" /> {p.rating}
                          <span className="text-slate-400 font-normal">({p.reviewsCount})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 mt-2.5">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-xs text-indigo-600">৳{p.price}</span>
                          {p.originalPrice && <span className="text-[9px] text-slate-400 line-through">৳{p.originalPrice}</span>}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(p);
                            setActiveTab("cart");
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-white/90" />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Coupon Codes List */}
              <div className="space-y-2">
                <h3 className="font-black text-sm text-slate-800 tracking-tight">Active Promo Vouchers</h3>
                <div className="flex gap-3 overflow-x-auto pb-2.5 custom-scrollbar">
                  {coupons.map((c) => (
                    <div
                      key={c.code}
                      className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-950 text-white p-4 rounded-2xl shadow-md border border-indigo-400/20 flex items-center justify-between shrink-0 w-[270px] relative overflow-hidden"
                    >
                      <div className="absolute right-[-15px] top-[-15px] text-8xl opacity-10 font-black uppercase tracking-tighter text-indigo-200 pointer-events-none select-none">%</div>
                      <div className="z-10 space-y-1.5">
                        <div>
                          <span className="text-[9px] font-extrabold uppercase bg-indigo-950/70 text-amber-300 px-2.5 py-0.5 rounded-md border border-indigo-500/20 tracking-wider">
                            {c.type === 'free_shipping' ? 'Free Shipping' : 'Discount'}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-base text-white font-mono tracking-widest leading-none">
                          {c.code}
                        </h4>
                        <p className="text-[10px] text-indigo-100 font-semibold leading-tight max-w-[160px]">{c.description}</p>
                      </div>
                      <button
                        onClick={() => {
                          setCouponCodeInput(c.code);
                          setActiveTab("cart");
                          alert(`Coupon [${c.code}] filled! Apply it in your cart.`);
                        }}
                        className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 text-xs font-black px-3 py-2 rounded-xl shrink-0 transition-all shadow-md shadow-amber-500/25 z-10 cursor-pointer"
                      >
                        Claim
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* B. VIEW: CATEGORIES & CATALOG */}
          {activeTab === "categories" && (
            <div className="space-y-4 px-4 pt-4">
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, groceries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs shadow-sm"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>

              {/* Horizontal scroll category filters */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar">
                {productCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white"
                        : "bg-white border border-slate-100 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              <div>
                <h3 className="font-black text-sm text-slate-800 tracking-tight mb-3">
                  {selectedCategory} Products
                </h3>
                
                {/* Search / Category filtration */}
                {(() => {
                  const filtered = products.filter((p) => {
                    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
                    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.category.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-400">
                        <Grid className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs">No products match your criteria.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-2 gap-4">
                      {filtered.map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-col justify-between cursor-pointer"
                          onClick={() => setSelectedProduct(p)}
                        >
                          <div className="relative">
                            <img src={p.image} className="w-full h-24 object-cover rounded-xl mb-2" />
                            {p.discount && (
                              <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                -{p.discount}%
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{p.shop}</span>
                            <h4 className="font-bold text-slate-800 text-xs mt-0.5 line-clamp-1">{p.name}</h4>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-500" /> {p.rating}
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 mt-2.5">
                            <div className="flex flex-col">
                              <span className="font-black text-xs text-indigo-600">৳{p.price}</span>
                              {p.originalPrice && <span className="text-[9px] text-slate-400 line-through">৳{p.originalPrice}</span>}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(p);
                                setActiveTab("cart");
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 text-white/90" />
                              <span>Buy Now</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

          {/* C. VIEW: CART & CHECKOUT */}
          {activeTab === "cart" && (
            <div className="space-y-4 px-4 pt-4">
              
              {checkoutStep === "cart" && (
                <>
                  <h3 className="font-black text-sm text-slate-800 tracking-tight">Shopping Cart</h3>

                  {cart.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300 mb-3">
                        <ShoppingCart className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm">Your Cart is empty!</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Add premium organic groceries from the home catalog to begin.</p>
                      <button
                        onClick={() => setActiveTab("home")}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl mt-4 transition"
                      >
                        Explore Products
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      
                      {/* Products inside cart */}
                      <div className="space-y-2">
                        {cart.map((item) => (
                          <div key={item.productId} className="bg-white border border-slate-100 p-3 rounded-2xl shadow-sm flex gap-3 items-center">
                            <img src={item.image} className="w-14 h-14 object-cover rounded-xl" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
                              <p className="text-xs text-indigo-600 font-bold mt-0.5">৳{item.price}</p>
                              
                              <div className="flex items-center gap-2 mt-1.5">
                                <button onClick={() => decreaseQuantity(item.productId)} className="bg-slate-50 hover:bg-slate-100 p-1 rounded-md border border-slate-150">
                                  <Minus className="w-3 h-3 text-slate-600" />
                                </button>
                                <span className="font-bold text-xs text-slate-800">{item.quantity}</span>
                                <button onClick={() => addToCart({ id: item.productId } as any)} className="bg-slate-50 hover:bg-slate-100 p-1 rounded-md border border-slate-150">
                                  <Plus className="w-3 h-3 text-slate-600" />
                                </button>
                              </div>
                            </div>
                            <button onClick={() => removeFromCart(item.productId)} className="text-slate-400 hover:text-rose-500 p-1">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Promo Coupon Applicator */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Have a voucher code?</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. WELCOME100"
                            value={couponCodeInput}
                            onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                            className="flex-1 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs uppercase"
                          />
                          <button onClick={applyCoupon} className="bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs px-4 py-2 rounded-xl transition">
                            Apply
                          </button>
                        </div>
                        {activeCoupon && (
                          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                            <span className="flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> Coupon Active: [{activeCoupon.code}]</span>
                            <button onClick={() => setActiveCoupon(null)} className="text-slate-400 hover:text-slate-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Bill Totals summary */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2 text-xs font-semibold text-slate-600">
                        <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider border-b border-slate-50 pb-2 mb-2">Billing Breakdown</h4>
                        <div className="flex justify-between">
                          <span>Items Price:</span>
                          <span className="text-slate-900">৳{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Charge:</span>
                          <span className="text-slate-900">৳{deliveryFee.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-rose-500">
                            <span>Promo Discount:</span>
                            <span>-৳{discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black text-sm text-indigo-700 border-t border-slate-100 pt-2.5 mt-2">
                          <span>Grand Total:</span>
                          <span>৳{total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Checkout actions */}
                      <button
                        onClick={() => {
                          setShippingForm({
                            ...shippingForm,
                            name: loggedInUser?.name || "",
                            phone: loggedInUser?.phone || ""
                          });
                          setCheckoutStep("shipping");
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-1.5"
                      >
                        Proceed To Checkout <ArrowRight className="w-4 h-4" />
                      </button>

                    </div>
                  )}
                </>
              )}

              {/* CHECKOUT STEP: SHIPPING FORM */}
              {checkoutStep === "shipping" && (
                <form onSubmit={handleConfirmOrder} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button type="button" onClick={() => setCheckoutStep("cart")} className="p-1.5 hover:bg-slate-50 rounded-lg transition">
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <h3 className="font-black text-sm text-slate-800 tracking-tight">Delivery Logistics</h3>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Recipient Name</label>
                      <input
                        type="text"
                        required
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                        placeholder="Enter full name"
                        className="w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        placeholder="e.g. 01XXXXXXXXX"
                        className="w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Email ID (Optional)</label>
                      <input
                        type="email"
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                        placeholder="example@gmail.com"
                        className="w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Detailed Address</label>
                      <textarea
                        required
                        value={shippingForm.address}
                        onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                        placeholder="House no., Road, Area..."
                        rows={2}
                        className="w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-900 font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">City/District</label>
                        <select
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          className="w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-900 font-bold"
                        >
                          <option value="Dhaka" className="text-slate-900 bg-white">Dhaka (ঢাকার ভিতরে)</option>
                          <option value="Chittagong" className="text-slate-900 bg-white">Chittagong (ঢাকার বাইরে)</option>
                          <option value="Sylhet" className="text-slate-900 bg-white">Sylhet (ঢাকার বাইরে)</option>
                          <option value="Rajshahi" className="text-slate-900 bg-white">Rajshahi (ঢাকার বাইরে)</option>
                          <option value="Khulna" className="text-slate-900 bg-white">Khulna (ঢাকার বাইরে)</option>
                          <option value="Barisal" className="text-slate-900 bg-white">Barisal (ঢাকার বাইরে)</option>
                          <option value="Rangpur" className="text-slate-900 bg-white">Rangpur (ঢাকার বাইরে)</option>
                          <option value="Mymensingh" className="text-slate-900 bg-white">Mymensingh (ঢাকার বাইরে)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Zip Code</label>
                        <input
                          type="text"
                          required
                          value={shippingForm.zipCode}
                          onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })}
                          placeholder="e.g. 1207"
                          className="w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-900 font-medium"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Order Notes (Optional)</label>
                      <input
                        type="text"
                        value={shippingForm.notes}
                        onChange={(e) => setShippingForm({ ...shippingForm, notes: e.target.value })}
                        placeholder="Special delivery instructions"
                        className="w-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs bg-slate-50 text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  {/* Payment Method Choice */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Payment Method</h4>
                    
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      shippingForm.paymentMethod === "COD" ? "border-indigo-600 bg-indigo-50/40" : "border-slate-150"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">💵</span>
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">Cash On Delivery</span>
                          <span className="text-[10px] text-slate-400">Pay when products are delivered</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payMethod"
                        value="COD"
                        checked={shippingForm.paymentMethod === "COD"}
                        onChange={() => setShippingForm({ ...shippingForm, paymentMethod: "COD" })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>

                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      shippingForm.paymentMethod === "Online" ? "border-indigo-600 bg-indigo-50/40" : "border-slate-150"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">💳</span>
                        <div>
                          <span className="font-bold text-xs text-slate-800 block">Online Payment</span>
                          <span className="text-[10px] text-slate-400">bKash, Nagad, Rocket or Card</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="payMethod"
                        value="Online"
                        checked={shippingForm.paymentMethod === "Online"}
                        onChange={() => setShippingForm({ ...shippingForm, paymentMethod: "Online" })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>

                    {shippingForm.paymentMethod === "Online" && (
                      <div className="border border-indigo-100 bg-indigo-50/25 p-4 rounded-xl space-y-4 mt-2">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">Select Payment Method:</span>
                          <div className="grid grid-cols-3 gap-2">
                            {(["Bkash", "Nagad", "Rocket"] as const).map((method) => (
                              <button
                                key={method}
                                type="button"
                                onClick={() => setShippingForm({ ...shippingForm, onlinePaymentMethod: method })}
                                className={`py-2 px-1 text-center rounded-lg border font-bold text-xs transition flex flex-col items-center gap-1 ${
                                  shippingForm.onlinePaymentMethod === method
                                    ? "bg-white border-indigo-600 text-indigo-700 shadow-sm"
                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                                }`}
                              >
                                {method === "Bkash" && <span className="w-5 h-5 bg-pink-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">bK</span>}
                                {method === "Nagad" && <span className="w-5 h-5 bg-orange-650 text-white rounded-full flex items-center justify-center text-[10px] font-black">Nag</span>}
                                {method === "Rocket" && <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[10px] font-black">Roc</span>}
                                <span>{method === "Bkash" ? "bKash" : method === "Nagad" ? "Nagad" : "Rocket"}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white border border-indigo-50 p-3 rounded-lg text-xs space-y-1 text-slate-700">
                          {shippingForm.onlinePaymentMethod === "Bkash" && (
                            <>
                              <div className="font-bold text-indigo-950 flex justify-between items-center">
                                <span>bKash (Personal):</span>
                                <span className="text-indigo-600 select-all font-mono font-bold">01781099407</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">Send money (সেন্ড মানি) to this bKash personal number.</p>
                            </>
                          )}
                          {shippingForm.onlinePaymentMethod === "Nagad" && (
                            <>
                              <div className="font-bold text-indigo-950 flex justify-between items-center">
                                <span>Nagad (Personal):</span>
                                <span className="text-indigo-600 select-all font-mono font-bold">01781099407</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">Send money (সেন্ড মানি) to this Nagad personal number.</p>
                            </>
                          )}
                          {shippingForm.onlinePaymentMethod === "Rocket" && (
                            <>
                              <div className="font-bold text-indigo-950 flex justify-between items-center">
                                <span>Rocket (Personal):</span>
                                <span className="text-indigo-600 select-all font-mono font-bold">01781099407-8</span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1">Send money (সেন্ড মানি) to this Rocket personal number.</p>
                            </>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-black text-indigo-700 uppercase tracking-wider">Transaction ID (Trx ID)</label>
                          <input
                            type="text"
                            required={shippingForm.paymentMethod === "Online"}
                            value={shippingForm.transactionId}
                            onChange={(e) => setShippingForm({ ...shippingForm, transactionId: e.target.value })}
                            placeholder="e.g. 8N7X2P8K4"
                            className="w-full border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs bg-white text-slate-800"
                          />
                          <p className="text-[9px] text-slate-400">টাকা পাঠানোর পর Transaction ID (Trx ID) দিয়ে অর্ডার কনফার্ম করুন।</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-100"
                  >
                    Confirm Order (৳{total.toFixed(2)})
                  </button>
                </form>
              )}

              {/* CHECKOUT STEP: SUCCESS OVERLAY */}
              {checkoutStep === "success" && createdOrder && (
                <div className="space-y-4 text-center">
                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto text-white mb-3">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="font-black text-lg">Order Confirmed!</h3>
                    <p className="text-xs text-indigo-100 mt-1 max-w-xs mx-auto">Your order was successfully registered on our live database.</p>
                  </div>

                  <div className="bg-white border border-slate-150 rounded-2xl p-5 text-left space-y-3 shadow-sm">
                    <div className="text-center border-b border-slate-50 pb-3 mb-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">Your tracking ID</span>
                      <h4 className="font-extrabold text-indigo-700 text-base mt-0.5 tracking-wide select-all">{createdOrder.id}</h4>
                    </div>
                    <div className="space-y-2 text-xs font-semibold text-slate-600">
                      <div className="flex justify-between"><span>Customer:</span> <span class="text-slate-900">{createdOrder.userName}</span></div>
                      <div className="flex justify-between"><span>Mobile:</span> <span class="text-slate-900">{createdOrder.phone}</span></div>
                      <div className="flex justify-between"><span>Payment Mode:</span> <span class="text-indigo-600 uppercase font-black">{createdOrder.paymentMethod}</span></div>
                      <div className="flex justify-between border-t border-slate-50 pt-2 mt-1 font-bold text-slate-800">
                        <span>Total Paid:</span>
                        <span className="text-slate-950 font-black">৳{createdOrder.total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTrackingIdInput(createdOrder.id);
                        setTrackedOrder(createdOrder);
                        setActiveTab("tracking");
                        setCheckoutStep("cart");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-lg shadow-indigo-100"
                    >
                      Track Shipment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutStep("cart");
                        setActiveTab("home");
                      }}
                      className="bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-2.5 rounded-xl transition"
                    >
                      Return Home
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* D. VIEW: TRACKING */}
          {activeTab === "tracking" && (
            <div className="space-y-4 px-4 pt-4">
              <h3 className="font-black text-sm text-slate-800 tracking-tight">Shipment Tracking</h3>

              <form onSubmit={handleTrackOrder} className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-indigo-500/25 space-y-3 relative overflow-hidden">
                <div className="absolute right-0 top-0 text-7xl opacity-5 font-black uppercase shrink-0">🚚</div>
                <div className="z-10">
                  <h4 className="font-extrabold text-sm">Where is my parcel?</h4>
                  <p className="text-[11px] text-indigo-100 mt-0.5">Track shipment statuses on real-time database</p>
                </div>
                <div className="flex gap-2 pt-1.5">
                  <input
                    type="text"
                    required
                    placeholder="e.g. #SBD202606247815 or Mobile"
                    value={trackingIdInput}
                    onChange={(e) => setTrackingIdInput(e.target.value)}
                    className="flex-1 bg-indigo-900/60 border border-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-white rounded-xl px-3 py-2 text-xs text-white placeholder:text-indigo-200"
                  />
                  <button type="submit" className="bg-white text-indigo-700 font-extrabold text-xs px-4 py-2 rounded-xl shrink-0 hover:bg-indigo-50 transition">
                    Search
                  </button>
                </div>
              </form>

              {trackingError && (
                <div className="p-3 text-center text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
                  {trackingError}
                </div>
              )}

              {trackedOrder && (
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
                  
                  {/* Progress bar steps */}
                  <div>
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-3">Status Pipeline</h4>
                    <div className="flex justify-between items-center relative pb-2">
                      <div className="absolute top-4 left-0 right-0 h-1 bg-slate-100 z-0"></div>
                      
                      {/* Highlighted active route pipeline progress bar */}
                      <div className="absolute top-4 left-0 h-1 bg-indigo-600 z-0" style={{
                        width: trackedOrder.status === 'Pending' ? '0%' :
                               trackedOrder.status === 'Processing' ? '33%' :
                               trackedOrder.status === 'Shipped' ? '66%' : '100%'
                      }}></div>

                      {["Pending", "Processing", "Shipped", "Delivered"].map((st, idx) => {
                        const states = ["Pending", "Processing", "Shipped", "Delivered"];
                        const currentIdx = states.indexOf(trackedOrder.status);
                        const isDone = idx <= currentIdx;

                        return (
                          <div key={st} className="flex flex-col items-center z-10">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition ${
                              isDone ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className={`text-[10px] font-black mt-1.5 uppercase tracking-wide ${
                              isDone ? 'text-indigo-600' : 'text-slate-400'
                            }`}>{st}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary receipt info */}
                  <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs font-semibold text-slate-600">
                    <div className="flex justify-between"><span>Tracking ID:</span> <span className="text-slate-900 font-extrabold">{trackedOrder.id}</span></div>
                    <div className="flex justify-between"><span>Recipient:</span> <span className="text-slate-900">{trackedOrder.userName}</span></div>
                    <div className="flex justify-between"><span>Phone Number:</span> <span className="text-slate-900">{trackedOrder.phone}</span></div>
                    <div className="flex justify-between"><span>Final Price:</span> <span className="text-indigo-600 font-black">৳{trackedOrder.total}</span></div>
                  </div>

                  {/* Shipment items list */}
                  <div className="border-t border-slate-100 pt-3.5">
                    <h5 className="font-extrabold text-slate-700 text-xs mb-2">Items ordered</h5>
                    <div className="space-y-1.5">
                      {trackedOrder.items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-2">
                          <img src={item.image} className="w-8 h-8 object-cover rounded" />
                          <span className="text-xs text-slate-800 font-bold">{item.name} <span className="text-indigo-600">x{item.quantity}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* E. VIEW: USER PROFILE / ACCOUNT */}
          {activeTab === "profile" && (
            <div className="space-y-4 px-4 pt-4">
              
              {!loggedInUser ? (
                <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-xl max-w-md mx-auto relative overflow-hidden">
                  {/* Decorative ambient background blur elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  {/* Logo & Welcome Header */}
                  <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-50 to-indigo-100/50 rounded-2xl border border-indigo-100/60 shadow-sm mb-3">
                      <img 
                        src="https://i.postimg.cc/tJd8J0y8/image.png" 
                        alt="N Legacy Logo" 
                        className="w-12 h-12 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {authMode === "login" ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {authMode === "login" 
                        ? "Access your N Legacy organic food dashboard" 
                        : "Join us and enjoy premium organic grocery shopping"
                      }
                    </p>
                  </div>
                  
                  {/* Selector tabs */}
                  <div className="grid grid-cols-2 bg-slate-100/80 p-1 rounded-2xl mb-6 relative z-10">
                    <button
                      onClick={() => {
                        setAuthMode("login");
                        setAuthError("");
                      }}
                      className={`py-2.5 text-xs font-black tracking-wider uppercase rounded-xl transition-all duration-200 cursor-pointer ${
                        authMode === "login" 
                          ? "bg-white text-indigo-700 shadow-md shadow-indigo-100/50" 
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode("register");
                        setAuthError("");
                      }}
                      className={`py-2.5 text-xs font-black tracking-wider uppercase rounded-xl transition-all duration-200 cursor-pointer ${
                        authMode === "register" 
                          ? "bg-white text-indigo-700 shadow-md shadow-indigo-100/50" 
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Register
                    </button>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
                    {authError && (
                      <div className="p-3 text-center text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                        {authError}
                      </div>
                    )}

                    {authMode === "register" && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={authForm.name}
                            onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                            placeholder="e.g. Emon Ahmed"
                            className="w-full border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50 text-slate-900 font-semibold transition"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={authForm.phone}
                          onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                          placeholder="e.g. 01781099407"
                          className="w-full border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50 text-slate-900 font-bold tracking-wide transition"
                        />
                      </div>
                    </div>

                    {authMode === "register" && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email ID (Optional)</label>
                        <div className="relative">
                          <input
                            type="email"
                            value={authForm.email}
                            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                            placeholder="example@gmail.com"
                            className="w-full border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50 text-slate-900 font-semibold transition"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={authForm.password}
                          onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full border border-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50 text-slate-900 font-semibold tracking-widest transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 uppercase tracking-widest flex items-center justify-center gap-2 mt-2 cursor-pointer"
                    >
                      <span>{authMode === "login" ? "Sign In" : "Register Now"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Trust info footer */}
                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-around text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-indigo-500" />
                      100% Secure Auth
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      Fresh Organic Partner
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Logged in User Profile layout */}
                  <div className="bg-white rounded-2xl border border-slate-150 p-6 text-center shadow-sm relative">
                    <button onClick={handleLogout} className="absolute right-4 top-4 text-slate-400 hover:text-rose-500 transition" title="Log Out">
                      <LogOut className="w-5 h-5" />
                    </button>
                    
                    <div className="relative w-20 h-20 mx-auto group">
                      <img
                        src={loggedInUser.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                        className="w-20 h-20 rounded-full object-cover border-4 border-indigo-100 shadow-sm"
                        alt="Profile avatar"
                      />
                      <button
                        onClick={() => {
                          const url = prompt("Enter custom image link for your profile picture:", loggedInUser.profileImage);
                          if (url) updateProfileImage(url);
                        }}
                        className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full border border-white hover:bg-indigo-700 transition"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-sm mt-3">{loggedInUser.name}</h4>
                    <span className="text-xs text-indigo-600 font-bold">{loggedInUser.phone}</span>
                    {loggedInUser.email && <p className="text-xs text-slate-400 mt-0.5">{loggedInUser.email}</p>}
                  </div>

                  {/* exclusive Admin Portal Access Redirection */}
                  {loggedInUser.phone === "01781099407" && (
                    <div className="bg-indigo-50 border-2 border-indigo-200 p-5 rounded-2xl shadow-sm text-center space-y-3">
                      <div className="inline-flex p-2.5 bg-indigo-100 rounded-full text-indigo-600">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-indigo-950 text-sm">Owner Access Active</h4>
                        <p className="text-xs text-indigo-500 mt-0.5">Control dynamic database snapshots, orders, and chats directly</p>
                      </div>
                      <a
                        href="/admin"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 rounded-xl transition inline-block text-center shadow-lg shadow-indigo-100"
                      >
                        Access Admin Panel
                      </a>
                    </div>
                  )}

                  <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                    <div className="py-2.5 flex justify-between"><span>User state:</span> <span className="text-slate-900 font-bold uppercase text-[10px]">Verified Customer</span></div>
                    <div className="py-2.5 flex justify-between"><span>Registration Code:</span> <span className="text-slate-500">NL-7815-Active</span></div>
                  </div>

                </div>
              )}

            </div>
          )}

        </main>

        {/* ================= DYNAMIC FLOAT ANIMATING CONTACT BUTTON ================= */}
        {activeTab === "home" && (
          <div className="absolute bottom-24 right-5 z-40 flex flex-col items-end gap-3">
            
            {/* Animating contact options list */}
            <AnimatePresence>
              {isContactOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.3, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.3, y: 15 }}
                  className="flex flex-col gap-2 bg-white rounded-2xl p-2 shadow-2xl border border-slate-100 mb-1"
                >
                  <a
                    href="https://wa.me/8801781099407"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition"
                  >
                    <span className="text-sm">💬</span> WhatsApp
                  </a>
                  <a
                    href="tel:+8801781099407"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Hotline
                  </a>
                  <button
                    onClick={() => {
                      setIsChatOpen(true);
                      setIsContactOpen(false);
                    }}
                    className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold px-3 py-2 rounded-xl transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Live Chat
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Principal circular trigger button */}
            <button
              onClick={() => setIsContactOpen(!isContactOpen)}
              className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl transition transform hover:scale-105 active:scale-95"
            >
              {isContactOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </button>
          </div>
        )}

        {/* ================= LIVE CHAT INTERACTIVE WINDOW (USER END) ================= */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-0 bg-slate-50 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                    N
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs">N Legacy Support</h4>
                    <span className="text-[9px] text-emerald-300 font-bold block">● Typically replies instantly</span>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Stream messages list */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar flex flex-col bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px]">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-slate-400 text-xs my-auto p-4">
                    <MessageCircle className="w-10 h-10 text-indigo-300 mx-auto mb-1.5" />
                    Hi there! Send your questions below. Our support team will get back to you shortly.
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => {
                    const isUser = msg.sender === "user";
                    return (
                      <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs ${
                          isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        } shadow-sm`}>
                          {msg.text}
                          <span className="text-[8px] text-slate-400 block mt-1 text-right">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef}></div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChatMessage} className="bg-white border-t border-slate-100 p-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl px-3.5 py-2 text-xs"
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition">
                  Send
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= PRODUCT DETAIL DIALOG POPUP ================= */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-end justify-center">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="bg-white rounded-t-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar"
              >
                <button onClick={() => setSelectedProduct(null)} className="absolute right-4 top-4 bg-slate-100 text-slate-500 hover:text-slate-700 p-1.5 rounded-full z-10 transition">
                  <X className="w-5 h-5" />
                </button>

                <img src={selectedProduct.image} className="w-full h-48 object-cover rounded-2xl mb-4 shadow-sm" />
                
                <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded inline-block mb-1">
                  {selectedProduct.category}
                </span>
                
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{selectedProduct.name}</h3>
                
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {selectedProduct.rating}
                  <span className="text-slate-400 font-normal">({selectedProduct.reviewsCount} verified reviews)</span>
                </div>

                <div className="flex items-baseline gap-2.5 mt-3">
                  <span className="text-xl font-black text-indigo-600">৳{selectedProduct.price}</span>
                  {selectedProduct.originalPrice && <span className="text-xs text-slate-400 line-through">৳{selectedProduct.originalPrice}</span>}
                  {selectedProduct.discount && <span className="text-xs font-bold text-rose-500">({selectedProduct.discount}% discount)</span>}
                </div>

                <div className="border-t border-slate-100 pt-3.5 mt-3.5 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Seller info</span>
                  <span className="text-xs font-semibold text-slate-700 block">{selectedProduct.shop} • Premium Official Partner</span>
                </div>

                <div className="border-t border-slate-100 pt-3.5 mt-3.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Product Description</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{selectedProduct.description}</p>
                </div>

                <div className="pt-5 flex gap-3 mt-2">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                      alert(`${selectedProduct.name} added to cart!`);
                    }}
                    className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 rounded-xl transition cursor-pointer"
                  >
                    Add To Cart
                  </button>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                      setActiveTab("cart");
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-white/90" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ================= FIRST TIME WELCOME POPUP GIFT ================= */}
        <AnimatePresence>
          {showWelcomePopup && (
            <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full text-center relative shadow-2xl border border-slate-100"
              >
                <button onClick={dismissWelcomePopup} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>

                <div className="text-4xl mb-2">🎁</div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Welcome Gift!</h3>
                <p className="text-xs text-slate-500 mt-1">Get <strong className="text-indigo-600">৳100 discount</strong> on your first order. Copy the coupon code below:</p>

                <div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-xl p-3 my-4 flex items-center justify-between">
                  <span className="font-extrabold text-indigo-700 tracking-wider text-sm">WELCOME100</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("WELCOME100");
                      alert("Voucher copied! Put it in the cart discount input.");
                    }}
                    className="text-indigo-600 hover:text-indigo-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>

                <div className="space-y-2 text-[10px] font-semibold text-slate-400 text-left bg-slate-50 p-3 rounded-xl">
                  <div>🚚 Free first order delivery options</div>
                  <div>🔐 100% Secured database payment logs</div>
                  <div>🛡️ 7-Day instant return guarantee</div>
                </div>

                <button
                  onClick={() => {
                    dismissWelcomePopup();
                    setActiveTab("home");
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 rounded-xl mt-4 transition uppercase tracking-wider"
                >
                  Start Shopping Now
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ================= BOTTOM TAB NAVIGATION BAR ================= */}
        <nav className="bg-white border-t border-slate-100 absolute bottom-0 left-0 right-0 h-16 z-35 flex items-center justify-around text-slate-400 shadow-lg">
          <button
            onClick={() => {
              setActiveTab("home");
              setCheckoutStep("cart");
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition ${
              activeTab === "home" ? "text-indigo-600" : "hover:text-slate-600"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wide mt-1">Home</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("categories");
              setCheckoutStep("cart");
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition ${
              activeTab === "categories" ? "text-indigo-600" : "hover:text-slate-600"
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wide mt-1">Categories</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("cart");
              setCheckoutStep("cart");
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition relative ${
              activeTab === "cart" ? "text-indigo-600" : "hover:text-slate-600"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute top-2 right-4 bg-indigo-600 text-white font-extrabold text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
            <span className="text-[9px] font-extrabold tracking-wide mt-1">Cart</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("tracking");
              setCheckoutStep("cart");
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition ${
              activeTab === "tracking" ? "text-indigo-600" : "hover:text-slate-600"
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wide mt-1">Tracking</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("profile");
              setCheckoutStep("cart");
            }}
            className={`flex flex-col items-center justify-center flex-1 h-full transition ${
              activeTab === "profile" ? "text-indigo-600" : "hover:text-slate-600"
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wide mt-1">Account</span>
          </button>
        </nav>

      </div>

    </div>
  );
}
