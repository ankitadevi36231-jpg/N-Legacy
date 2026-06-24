import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), ".data.json");

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "https://nogdubfxbhpmatlqundv.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
let supabase: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized successfully with URL:", supabaseUrl);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
}

// Parse JSON requests
app.use(express.json());

// Helper to load database
interface Database {
  products: any[];
  orders: any[];
  coupons: any[];
  sliders: any[];
  users: any[];
  chats: { [phone: string]: { userName: string; unread: boolean; messages: any[] } };
}

const defaultData: Database = {
  products: [
    {
      id: "prod_1",
      name: "Rice Flour (Chaler Gura) 2kg",
      category: "Organic",
      price: 200,
      originalPrice: 230,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600",
      rating: 4.4,
      reviewsCount: 59,
      description: "Premium quality rice flour (Chaler Gura) milled from selected organic rice. Perfect for preparing traditional rice cakes, pithas, and multiple dynamic snacks.",
      stock: 50,
      shop: "RK Store",
      discount: 13
    },
    {
      id: "prod_2",
      name: "Laal Atta 2kg",
      category: "Organic",
      price: 160,
      originalPrice: 200,
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
      rating: 4.6,
      reviewsCount: 75,
      description: "Whole wheat red flour (Laal Atta) rich in dietary fiber and essential nutrients. Processed organically to preserve genuine natural goodness.",
      stock: 45,
      shop: "RK Store",
      discount: 20
    },
    {
      id: "prod_3",
      name: "Mug Dal 1 Kg",
      category: "Organic",
      price: 210,
      originalPrice: 260,
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600",
      rating: 4.5,
      reviewsCount: 86,
      description: "High-grade premium Moong Dal (Mug Dal), polished naturally, rich in proteins and taste. Sourced sustainably.",
      stock: 30,
      shop: "RK Store",
      discount: 19
    },
    {
      id: "prod_4",
      name: "Masur Dal 1 Kg",
      category: "Organic",
      price: 190,
      originalPrice: 230,
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600",
      rating: 4.7,
      reviewsCount: 132,
      description: "Splendid red lentils (Masur Dal) packed with iron and vital nutrients. Essential daily grocery item for dynamic households.",
      stock: 40,
      shop: "RK Store",
      discount: 17
    },
    {
      id: "prod_5",
      name: "Pure Mustard Oil 1 Litre",
      category: "Oil & Ghee",
      price: 240,
      originalPrice: 280,
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600",
      rating: 4.8,
      reviewsCount: 112,
      description: "Cold-pressed pure mustard oil extracted from chosen mustard seeds. Offers authentic rich aroma and sharp pungent taste.",
      stock: 25,
      shop: "RK Store",
      discount: 14
    },
    {
      id: "prod_6",
      name: "Premium Honey (Mahu) 500g",
      category: "Honey",
      price: 350,
      originalPrice: 400,
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600",
      rating: 4.9,
      reviewsCount: 95,
      description: "100% pure organic wild flower honey. Rich in antioxidants and natural sweetness with zero added artificial sugar.",
      stock: 20,
      shop: "RK Store",
      discount: 12
    }
  ],
  orders: [
    {
      id: "#SBD202606247815",
      userName: "Emon Ahmed",
      phone: "01781099407",
      email: "emon@gmail.com",
      address: "Mirpur 10, Dhaka",
      city: "Dhaka",
      zipCode: "1216",
      orderNotes: "Please deliver in the afternoon.",
      paymentMethod: "COD",
      items: [
        {
          productId: "prod_1",
          name: "Rice Flour (Chaler Gura) 2kg",
          price: 200,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600"
        }
      ],
      subtotal: 200,
      deliveryFee: 70,
      discount: 0,
      total: 270,
      status: "Pending",
      createdAt: "2026-06-24T06:15:00.000Z"
    }
  ],
  coupons: [
    {
      code: "WELCOME100",
      discount: 100,
      minAmount: 300,
      type: "flat",
      description: "৳100 discount on your first order"
    },
    {
      code: "FLATS500",
      discount: 500,
      minAmount: 2000,
      type: "flat",
      description: "৳500 flat discount on orders over ৳2000"
    },
    {
      code: "FREESHIP",
      discount: 70,
      minAmount: 500,
      type: "free_shipping",
      description: "Free shipping on orders over ৳500"
    }
  ],
  sliders: [
    {
      id: "slide_1",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200",
      title: "50% Discount on Organic Items",
      subtitle: "Fresh groceries direct to your home safely"
    },
    {
      id: "slide_2",
      image: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=1200",
      title: "Premium Honey & Ghee",
      subtitle: "100% certified authentic products"
    }
  ],
  users: [
    {
      phone: "01781099407",
      name: "Emon (Admin)",
      password: "Emon@36231",
      email: "emon@nlegacy.com",
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
    }
  ],
  chats: {
    "01781099407": {
      userName: "Emon Ahmed",
      unread: false,
      messages: [
        { sender: "user", text: "Hello, when will my order be shipped?", timestamp: "2026-06-24T06:15:10.000Z" },
        { sender: "admin", text: "Hi Emon! Your order will be shipped today afternoon.", timestamp: "2026-06-24T06:16:00.000Z" }
      ]
    }
  }
};

// Ensure data file exists with default schema
function loadDB(): Database {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading database file", err);
  }
  saveDB(defaultData);
  return defaultData;
}

function saveDB(db: Database) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
    // Trigger background sync to Supabase (non-blocking)
    saveToSupabase(db).catch((err) => {
      console.error("Async backup to Supabase failed:", err);
    });
  } catch (err) {
    console.error("Error writing to database file", err);
  }
}

function logSupabaseError(context: string, error: any) {
  if (!error) return;
  console.error(`[Supabase Error] ${context} failed! Code: ${error.code} | Message: ${error.message} | Details: ${error.details || 'none'} | Hint: ${error.hint || 'none'}`);
}

async function syncFromSupabase() {
  if (!supabase) {
    console.log("Supabase not initialized, bypassing cloud sync.");
    return;
  }
  console.log("Syncing database from Supabase cloud...");
  try {
    const { data: dbProducts, error: prodErr } = await supabase.from("products").select("*");
    const { data: dbOrders, error: orderErr } = await supabase.from("orders").select("*");
    const { data: dbCoupons, error: couponErr } = await supabase.from("coupons").select("*");
    const { data: dbSliders, error: sliderErr } = await supabase.from("sliders").select("*");
    const { data: dbUsers, error: userErr } = await supabase.from("users").select("*");
    const { data: dbChats, error: chatErr } = await supabase.from("chats").select("*");

    if (prodErr) logSupabaseError("select products", prodErr);
    if (orderErr) logSupabaseError("select orders", orderErr);
    if (couponErr) logSupabaseError("select coupons", couponErr);
    if (sliderErr) logSupabaseError("select sliders", sliderErr);
    if (userErr) logSupabaseError("select users", userErr);
    if (chatErr) logSupabaseError("select chats", chatErr);

    const db = loadDB();

    if (dbProducts && dbProducts.length > 0) db.products = dbProducts;
    if (dbOrders && dbOrders.length > 0) db.orders = dbOrders;
    if (dbCoupons && dbCoupons.length > 0) db.coupons = dbCoupons;
    if (dbSliders && dbSliders.length > 0) db.sliders = dbSliders;
    if (dbUsers && dbUsers.length > 0) db.users = dbUsers;
    
    if (dbChats && dbChats.length > 0) {
      const chatsMap: any = {};
      dbChats.forEach((c: any) => {
        chatsMap[c.phone] = {
          userName: c.userName,
          unread: c.unread,
          messages: typeof c.messages === "string" ? JSON.parse(c.messages) : c.messages
        };
      });
      if (Object.keys(chatsMap).length > 0) {
        db.chats = chatsMap;
      }
    }

    // Save to local file directly without triggering saveToSupabase loop
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
    console.log("Supabase cloud sync completed successfully! Total orders loaded:", db.orders.length);
  } catch (err) {
    console.error("Failed to sync from Supabase, using local fallback:", err);
  }
}

async function saveToSupabase(db: Database) {
  if (!supabase) return;
  try {
    // 1. Products upsert
    if (db.products.length > 0) {
      const { error } = await supabase.from("products").upsert(
        db.products.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: Number(p.price),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
          image: p.image,
          rating: p.rating ? Number(p.rating) : 0,
          reviewsCount: p.reviewsCount ? Number(p.reviewsCount) : 0,
          description: p.description || "",
          stock: p.stock ? Number(p.stock) : 0,
          shop: p.shop || "",
          discount: p.discount ? Number(p.discount) : 0
        }))
      );
      if (error) logSupabaseError("upsert products", error);
    }
    // 2. Orders upsert
    if (db.orders.length > 0) {
      const { error } = await supabase.from("orders").upsert(
        db.orders.map(o => ({
          id: o.id,
          userName: o.userName,
          phone: o.phone,
          email: o.email || null,
          address: o.address,
          city: o.city,
          zipCode: o.zipCode,
          orderNotes: o.orderNotes || null,
          paymentMethod: o.paymentMethod,
          onlinePaymentMethod: o.onlinePaymentMethod || null,
          transactionId: o.transactionId || null,
          items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
          subtotal: Number(o.subtotal),
          deliveryFee: Number(o.deliveryFee),
          discount: Number(o.discount),
          total: Number(o.total),
          status: o.status,
          createdAt: o.createdAt
        }))
      );
      if (error) logSupabaseError("upsert orders", error);
    }
    // 3. Coupons upsert
    if (db.coupons.length > 0) {
      const { error } = await supabase.from("coupons").upsert(
        db.coupons.map(c => ({
          code: c.code,
          discount: Number(c.discount),
          minAmount: Number(c.minAmount),
          type: c.type,
          description: c.description
        }))
      );
      if (error) logSupabaseError("upsert coupons", error);
    }
    // 4. Sliders upsert
    if (db.sliders.length > 0) {
      const { error } = await supabase.from("sliders").upsert(
        db.sliders.map(s => ({
          id: s.id,
          image: s.image,
          title: s.title,
          subtitle: s.subtitle
        }))
      );
      if (error) logSupabaseError("upsert sliders", error);
    }
    // 5. Users upsert
    if (db.users.length > 0) {
      const { error } = await supabase.from("users").upsert(
        db.users.map(u => ({
          phone: u.phone,
          name: u.name,
          password: u.password,
          email: u.email || null,
          profileImage: u.profileImage || null
        }))
      );
      if (error) logSupabaseError("upsert users", error);
    }
    // 6. Chats upsert
    const chatsList = Object.entries(db.chats).map(([phone, c]) => ({
      phone,
      userName: c.userName,
      unread: c.unread,
      messages: typeof c.messages === "string" ? JSON.parse(c.messages) : c.messages
    }));
    if (chatsList.length > 0) {
      const { error } = await supabase.from("chats").upsert(chatsList);
      if (error) logSupabaseError("upsert chats", error);
    }
  } catch (err) {
    console.error("Error backing up data to Supabase:", err);
  }
}

// REST API Endpoints

// 1. Get database snapshot
app.get("/api/db", (req, res) => {
  const db = loadDB();
  res.json(db);
});

// 2. Auth Endpoints
app.post("/api/auth/register", (req, res) => {
  const { name, phone, password, email, profileImage } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: "Name, phone, and password are required" });
  }
  const db = loadDB();
  const existing = db.users.find((u) => u.phone === phone);
  if (existing) {
    return res.status(400).json({ error: "An account with this phone number already exists" });
  }

  const newUser = {
    name,
    phone,
    password,
    email: email || "",
    profileImage: profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
  };

  db.users.push(newUser);
  saveDB(db);
  res.status(201).json({ message: "Registration successful", user: { name, phone, email, profileImage: newUser.profileImage } });
});

app.post("/api/auth/login", (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: "Phone and password are required" });
  }
  const db = loadDB();
  const user = db.users.find((u) => u.phone === phone && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid phone number or password" });
  }
  res.json({
    message: "Login successful",
    user: {
      name: user.name,
      phone: user.phone,
      email: user.email,
      profileImage: user.profileImage
    }
  });
});

// Update Profile API
app.post("/api/auth/update-profile", (req, res) => {
  const { phone, name, email, profileImage } = req.body;
  const db = loadDB();
  const idx = db.users.findIndex((u) => u.phone === phone);
  if (idx === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  db.users[idx].name = name || db.users[idx].name;
  db.users[idx].email = email !== undefined ? email : db.users[idx].email;
  db.users[idx].profileImage = profileImage !== undefined ? profileImage : db.users[idx].profileImage;
  saveDB(db);
  res.json({ message: "Profile updated successfully", user: db.users[idx] });
});

// 3. Products Endpoints
app.get("/api/products", (req, res) => {
  const db = loadDB();
  res.json(db.products);
});

app.post("/api/products", (req, res) => {
  const product = req.body;
  const db = loadDB();
  product.id = "prod_" + Date.now();
  db.products.push(product);
  saveDB(db);
  res.status(201).json(product);
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;
  const db = loadDB();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  db.products[idx] = { ...db.products[idx], ...updatedProduct };
  saveDB(db);
  res.json(db.products[idx]);
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.products = db.products.filter((p) => p.id !== id);
  if (supabase) {
    supabase.from("products").delete().eq("id", id).catch((err: any) => console.error("Supabase delete product err:", err));
  }
  saveDB(db);
  res.json({ success: true });
});

// 4. Slider Banners Endpoints
app.get("/api/sliders", (req, res) => {
  const db = loadDB();
  res.json(db.sliders);
});

app.post("/api/sliders", (req, res) => {
  const slider = req.body;
  const db = loadDB();
  slider.id = "slide_" + Date.now();
  db.sliders.push(slider);
  saveDB(db);
  res.status(201).json(slider);
});

app.put("/api/sliders/:id", (req, res) => {
  const { id } = req.params;
  const updatedSlider = req.body;
  const db = loadDB();
  const idx = db.sliders.findIndex((s) => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Slider not found" });
  }
  db.sliders[idx] = { ...db.sliders[idx], ...updatedSlider };
  saveDB(db);
  res.json(db.sliders[idx]);
});

app.delete("/api/sliders/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.sliders = db.sliders.filter((s) => s.id !== id);
  if (supabase) {
    supabase.from("sliders").delete().eq("id", id).catch((err: any) => console.error("Supabase delete slider err:", err));
  }
  saveDB(db);
  res.json({ success: true });
});

// 5. Coupon Codes Endpoints
app.get("/api/coupons", (req, res) => {
  const db = loadDB();
  res.json(db.coupons);
});

app.post("/api/coupons", (req, res) => {
  const coupon = req.body;
  const db = loadDB();
  // Check duplicates
  const existing = db.coupons.find((c) => c.code.toUpperCase() === coupon.code.toUpperCase());
  if (existing) {
    return res.status(400).json({ error: "Coupon already exists" });
  }
  db.coupons.push(coupon);
  saveDB(db);
  res.status(201).json(coupon);
});

app.put("/api/coupons/:code", (req, res) => {
  const { code } = req.params;
  const updatedCoupon = req.body;
  const db = loadDB();
  const idx = db.coupons.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
  if (idx === -1) {
    return res.status(404).json({ error: "Coupon not found" });
  }
  db.coupons[idx] = { ...db.coupons[idx], ...updatedCoupon };
  saveDB(db);
  res.json(db.coupons[idx]);
});

app.delete("/api/coupons/:code", (req, res) => {
  const { code } = req.params;
  const db = loadDB();
  db.coupons = db.coupons.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
  if (supabase) {
    supabase.from("coupons").delete().eq("code", code).catch((err: any) => console.error("Supabase delete coupon err:", err));
  }
  saveDB(db);
  res.json({ success: true });
});

// 6. Orders Endpoints
app.get("/api/orders", (req, res) => {
  const db = loadDB();
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const order = req.body;
  const db = loadDB();
  // Generate random Order ID similar to #SBD202606247815
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randNum = Math.floor(1000 + Math.random() * 9000);
  order.id = `#SBD${dateStr}${randNum}`;
  order.status = "Pending";
  order.createdAt = new Date().toISOString();

  db.orders.push(order);
  saveDB(db);
  res.status(201).json(order);
});

app.put("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = loadDB();
  const idx = db.orders.findIndex((o) => o.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Order not found" });
  }
  db.orders[idx].status = status;
  saveDB(db);
  res.json(db.orders[idx]);
});

// 7. Users Management
app.get("/api/users", (req, res) => {
  const db = loadDB();
  res.json(db.users.map((u) => ({ name: u.name, phone: u.phone, email: u.email, profileImage: u.profileImage })));
});

// 8. Live Chat Endpoints
app.get("/api/chats", (req, res) => {
  const db = loadDB();
  res.json(db.chats || {});
});

// User fetches messages
app.get("/api/chats/:phone", (req, res) => {
  const { phone } = req.params;
  const db = loadDB();
  if (!db.chats[phone]) {
    db.chats[phone] = { userName: "Guest", unread: false, messages: [] };
    saveDB(db);
  }
  res.json(db.chats[phone]);
});

// User/Admin sends message
app.post("/api/chats/:phone", (req, res) => {
  const { phone } = req.params;
  const { sender, text, userName } = req.body;
  const db = loadDB();

  if (!db.chats[phone]) {
    db.chats[phone] = { userName: userName || "Guest", unread: true, messages: [] };
  }

  if (sender === "user") {
    db.chats[phone].unread = true;
    if (userName) db.chats[phone].userName = userName;
  } else {
    db.chats[phone].unread = false;
  }

  db.chats[phone].messages.push({
    sender,
    text,
    timestamp: new Date().toISOString()
  });

  saveDB(db);
  res.status(201).json(db.chats[phone]);
});

// Admin marks chat as read
app.post("/api/chats/:phone/read", (req, res) => {
  const { phone } = req.params;
  const db = loadDB();
  if (db.chats[phone]) {
    db.chats[phone].unread = false;
    saveDB(db);
  }
  res.json({ success: true });
});

// Serves the admin panel HTML page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(process.cwd(), "admin.html"));
});

// Vite & Static file configurations
async function startServer() {
  // Sync database from Supabase cloud on start (non-blocking)
  syncFromSupabase().then(() => {
    console.log("Initial Supabase cloud sync done.");
  }).catch((err) => {
    console.error("Initial Supabase cloud sync failed:", err);
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
