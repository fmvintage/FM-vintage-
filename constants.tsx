
import { Product } from './types';

export const CATEGORIES = [
  { id: 'fashion', name: 'Fashion', icon: '👕' },
  { id: 'grocery', name: 'Grocery', icon: '🥦' },
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'toys', name: 'Toys', icon: '🧸' },
];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Vintage Leather Satchel',
    category: 'fashion',
    price: 2499,
    originalPrice: 4999,
    discountPercentage: 50,
    rating: 4.5,
    reviewCount: 120,
    images: ['https://picsum.photos/seed/satchel1/600/600', 'https://picsum.photos/seed/satchel2/600/600'],
    description: 'A classic vintage leather satchel made from premium genuine leather. Perfect for daily commutes or weekend outings.',
    stock: 15
  },
  {
    id: '2',
    name: 'Victorian Brass Compass',
    category: 'home',
    price: 1299,
    originalPrice: 2500,
    discountPercentage: 48,
    rating: 4.7,
    reviewCount: 85,
    images: ['https://picsum.photos/seed/compass/600/600'],
    description: 'A handcrafted solid brass compass with a vintage finish. A timeless piece for collectors and maritime enthusiasts.',
    stock: 20
  },
  {
    id: '3',
    name: 'Retro Mechanical Typewriter',
    category: 'home',
    price: 8999,
    originalPrice: 12000,
    discountPercentage: 25,
    rating: 4.9,
    reviewCount: 42,
    images: ['https://picsum.photos/seed/typewriter/600/600'],
    description: 'Fully functional 1960s style mechanical typewriter. Heavy-duty metal construction with a satisfying tactile click.',
    stock: 5
  },
  {
    id: '4',
    name: 'Organic Heirloom Tea Leaves',
    category: 'grocery',
    price: 899,
    originalPrice: 1299,
    discountPercentage: 30,
    rating: 4.6,
    reviewCount: 156,
    images: ['https://picsum.photos/seed/tea/600/600'],
    description: 'Small-batch organic black tea harvested from high-altitude heirloom gardens. Rich, malty, and deeply aromatic.',
    stock: 100
  },
  {
    id: '5',
    name: 'Classic Wooden Rocking Horse',
    category: 'toys',
    price: 4500,
    originalPrice: 6000,
    discountPercentage: 25,
    rating: 4.8,
    reviewCount: 28,
    images: ['https://picsum.photos/seed/toyhorse/600/600'],
    description: 'Hand-carved wooden rocking horse made from sustainably sourced oak. Finished with non-toxic vintage wax.',
    stock: 8
  },
  {
    id: '6',
    name: 'Silk Paisley Pocket Square',
    category: 'fashion',
    price: 599,
    originalPrice: 999,
    discountPercentage: 40,
    rating: 4.4,
    reviewCount: 210,
    images: ['https://picsum.photos/seed/silk/600/600'],
    description: '100% pure silk pocket square featuring an intricate traditional paisley pattern. Hand-rolled edges.',
    stock: 50
  }
];
