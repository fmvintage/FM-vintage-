
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
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: 'user' | 'admin';
  address?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  paymentMethod: string;
  address: string;
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
