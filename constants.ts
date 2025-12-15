
import { Service, LibrevilleQuartier, User, Booking, ServiceRequest, Conversation, Message } from './types';

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
    category: 'Climatisation', 
    price: 20000,
    location: LibrevilleQuartier.CENTRE_VILLE,
    rating: 4.6,
    reviews: [],
    image: 'https://picsum.photos/400/300?random=5',
    isAvailable: true
  }
];

export const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Admin Allowork', email: 'williamdesxx@gmail.com', role: 'admin' },
    { id: 'u2', name: 'Client Test', email: 'client@gmail.com', phoneNumber: '074 00 11 22', role: 'client', location: LibrevilleQuartier.BATTERIE_4 },
    { id: 'p1', name: 'Jean Bricole', email: 'jean@bricole.ga', phoneNumber: '066 99 88 77', role: 'provider', specialty: 'Plomberie', location: LibrevilleQuartier.LOUIS }
];

export const MOCK_BOOKINGS: Booking[] = [
    { id: 'b1', serviceId: 's1', clientId: 'u2', providerId: 'p1', date: '2023-10-25', status: 'completed', totalPrice: 15000 },
    { id: 'b2', serviceId: 's3', clientId: 'u2', providerId: 'p3', date: '2023-11-02', status: 'pending', totalPrice: 35000 }
];

export const MOCK_REQUESTS: ServiceRequest[] = [
    {
        id: 'r1',
        userId: 'u2',
        userName: 'Sophie K.',
        title: 'Recherche Plombier pour fuite',
        description: 'Bonjour, j\'ai une fuite importante sous mon évier à Akanda. Urgent merci.',
        category: 'Plomberie',
        location: LibrevilleQuartier.AKANDA,
        budget: 10000,
        date: '2023-11-10',
        status: 'open'
    },
    {
        id: 'r2',
        userId: 'u3',
        userName: 'Marc O.',
        title: 'Besoin d\'aide déménagement',
        description: 'Cherche 2 bras pour monter un canapé au 3ème étage.',
        category: 'Déménagement',
        location: LibrevilleQuartier.CENTRE_VILLE,
        budget: 15000,
        date: '2023-11-11',
        status: 'open'
    }
];

// Initial mock messages
const now = new Date();
export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'c1',
        participants: ['u2', 'p1'],
        unreadCount: 1,
        lastMessage: {
            id: 'm1',
            senderId: 'p1',
            receiverId: 'u2',
            content: 'Bonjour, je suis disponible demain pour la plomberie.',
            timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
            read: false
        }
    }
];

export const MOCK_MESSAGES: Message[] = [
    {
        id: 'm0',
        senderId: 'u2',
        receiverId: 'p1',
        content: 'Bonjour Jean, faites-vous les interventions le weekend ?',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
        read: true
    },
    {
        id: 'm1',
        senderId: 'p1',
        receiverId: 'u2',
        content: 'Bonjour, je suis disponible demain pour la plomberie.',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        read: false
    }
];
