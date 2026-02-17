
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  stock: number;
  sizes?: string[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: 'user' | 'admin';
  address?: string;
  profileImage?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Pending' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  deliveryDate?: string;
  paymentMethod: string;
  address: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum View {
  HOME = 'HOME',
  PLP = 'PLP',
  PDP = 'PDP',
  CART = 'CART',
  CHECKOUT = 'CHECKOUT',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  ORDERS = 'ORDERS',
  WISHLIST = 'WISHLIST',
  ORDER_SUCCESS = 'ORDER_SUCCESS'
}
