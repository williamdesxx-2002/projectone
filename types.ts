export type UserRole = 'client' | 'provider' | 'admin' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  location?: string;
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
  GLASS = 'Glass'
}

export const CATEGORIES = [
  'Plomberie',
  'Électricité',
  'Ménage',
  'Jardinage',
  'Coiffure',
  'Informatique',
  'Déménagement',
  'Cours Particuliers'
];