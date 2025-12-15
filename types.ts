
export type UserRole = 'client' | 'provider' | 'admin' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  specialty?: string; // For providers to match categories (e.g., 'Plomberie')
  role: UserRole;
  avatar?: string;
  location?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  date: string;
  read: boolean;
  type: 'request_match' | 'booking_update' | 'proposal' | 'new_message';
  linkTo?: string; // 'dashboard', 'search', 'messages', etc.
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string; // ISO string
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // [userId1, userId2]
  lastMessage: Message;
  unreadCount: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  description: string;
  category: string; // e.g., 'Plomberie', 'Ménage', 'Électricité'
  price: number;
  location: string; // Neighborhood in Libreville (e.g., 'Louis', 'Nzeng-Ayong')
  rating: number;
  reviews: Review[];
  image: string;
  isAvailable: boolean;
}

export interface ServiceRequest {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  date: string;
  status: 'open' | 'fulfilled';
}

export interface Booking {
  id: string;
  serviceId: string;
  clientId: string;
  providerId: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
}

export enum LibrevilleQuartier {
  LOUIS = 'Louis',
  CHARBONNAGES = 'Charbonnages',
  NZENG_AYONG = 'Nzeng-Ayong',
  AKANDA = 'Akanda',
  OWENDO = 'Owendo',
  CENTRE_VILLE = 'Centre Ville',
  BATTERIE_4 = 'Batterie 4',
  PK8 = 'PK8',
  GLASS = 'Glass',
  MONT_BOUET = 'Mont-Bouët',
  OLORUMI = 'Oloumi'
}

export const CATEGORIES = [
  'Plomberie',
  'Électricité',
  'Ménage',
  'Jardinage',
  'Coiffure',
  'Informatique',
  'Déménagement',
  'Cours Particuliers',
  'Climatisation'
];
