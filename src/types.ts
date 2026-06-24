export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewsCount: number;
  description: string;
  stock: number;
  shop: string;
  discount?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  zipCode: string;
  orderNotes?: string;
  paymentMethod: "COD" | "Online";
  onlinePaymentMethod?: "Bkash" | "Nagad" | "Rocket";
  transactionId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  createdAt: string;
}

export interface Coupon {
  code: string;
  discount: number;
  minAmount: number;
  type: "flat" | "free_shipping";
  description: string;
}

export interface SliderBanner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

export interface User {
  phone: string;
  name: string;
  email?: string;
  profileImage?: string;
}
