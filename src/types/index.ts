export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string | null;
  avatar?: string | null;
  createdAt: string | Date;
}

export interface Category {
  id: string;
  nameKm: string;
  nameEn: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
}

export interface ProductKey {
  id: string;
  key: string;
  status: 'AVAILABLE' | 'SOLD' | 'DISABLED';
  productId: string;
  orderItemId?: string | null;
  soldAt?: string | Date | null;
  createdAt: string | Date;
  product?: Product;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  price: number;
  comparePrice?: number | null;
  discountPercent?: number | null;
  images: string;
  categoryId: string;
  category?: Category;
  version?: string | null;
  platform?: string | null;
  systemRequirements?: string | null;
  downloadUrl?: string | null;
  fileId?: string | null;
  file?: DigitalFile | null;
  rating: number;
  reviewCount: number;
  soldCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  stockCount: number;
  createdAt: string | Date;
  keys?: ProductKey[];
}

export interface DigitalFile {
  id: string;
  title: string;
  slug: string;
  description: string;
  version: string;
  fileType: string;
  fileSize: string;
  filePath: string;
  downloadCount: number;
  isFree: boolean;
  price: number;
  changelog?: string | null;
  requirements?: string | null;
  categoryId: string;
  category?: Category;
  isActive: boolean;
  createdAt: string | Date;
}

export interface CartItem {
  id?: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  categoryName?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  fileId?: string | null;
  name: string;
  price: number;
  quantity: number;
  key?: {
    id: string;
    key: string;
    status: string;
  } | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  subtotal: number;
  discount: number;
  total: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: string;
  paymentDetails?: string | null;
  createdAt: string | Date;
  items: OrderItem[];
}

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime?: string | null;
  icon?: string | null;
  description?: string | null;
  steps: string; // JSON array string
  isActive: boolean;
  views: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

