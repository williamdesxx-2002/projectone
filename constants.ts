import { Service, LibrevilleQuartier, User, Booking } from './types';

export const MOCK_SERVICES: Service[] = [
  {
    id: 's1',
    providerId: 'p1',
    providerName: 'Jean Bricole',
    title: 'Plomberie d\'urgence',
    description: 'Réparation de fuites et débouchage rapide.',
    category: 'Plomberie',
    price: 15000,
    location: LibrevilleQuartier.LOUIS,
    rating: 4.8,
    reviews: [],
    image: 'https://picsum.photos/400/300?random=1',
    isAvailable: true
  },
  {
    id: 's2',
    providerId: 'p2',
    providerName: 'Marie Claire',
    title: 'Ménage complet',
    description: 'Nettoyage de maison et bureaux, produits inclus.',
    category: 'Ménage',
    price: 25000,
    location: LibrevilleQuartier.AKANDA,
    rating: 4.9,
    reviews: [],
    image: 'https://picsum.photos/400/300?random=2',
    isAvailable: true
  },
  {
    id: 's3',
    providerId: 'p3',
    providerName: 'ElecGabon Pro',
    title: 'Installation Électrique',
    description: 'Mise aux normes et installation de compteurs.',
    category: 'Électricité',
    price: 35000,
    location: LibrevilleQuartier.NZENG_AYONG,
    rating: 4.5,
    reviews: [],
    image: 'https://picsum.photos/400/300?random=3',
    isAvailable: true
  },
  {
    id: 's4',
    providerId: 'p4',
    providerName: 'Coach Paul',
    title: 'Cours de Mathématiques',
    description: 'Soutien scolaire pour lycée et collège.',
    category: 'Cours Particuliers',
    price: 10000,
    location: LibrevilleQuartier.CHARBONNAGES,
    rating: 5.0,
    reviews: [],
    image: 'https://picsum.photos/400/300?random=4',
    isAvailable: true
  },
   {
    id: 's5',
    providerId: 'p5',
    providerName: 'Clim Express',
    title: 'Entretien Climatiseur',
    description: 'Nettoyage et recharge de gaz.',
    category: 'Plomberie', // Broad category for maintenance
    price: 20000,
    location: LibrevilleQuartier.CENTRE_VILLE,
    rating: 4.6,
    reviews: [],
    image: 'https://picsum.photos/400/300?random=5',
    isAvailable: true
  }
];

export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Admin User', email: 'admin@alloword.ga', role: 'admin' },
    { id: 'u2', name: 'Client Test', email: 'client@gmail.com', role: 'client', location: LibrevilleQuartier.BATTERIE_4 },
    { id: 'p1', name: 'Jean Bricole', email: 'jean@bricole.ga', role: 'provider', location: LibrevilleQuartier.LOUIS }
];

export const MOCK_BOOKINGS: Booking[] = [
    { id: 'b1', serviceId: 's1', clientId: 'u2', providerId: 'p1', date: '2023-10-25', status: 'completed', totalPrice: 15000 },
    { id: 'b2', serviceId: 's3', clientId: 'u2', providerId: 'p3', date: '2023-11-02', status: 'pending', totalPrice: 35000 }
];