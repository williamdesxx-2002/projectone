import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { User, Service, Booking, LibrevilleQuartier, CATEGORIES } from './types';
import { MOCK_SERVICES, MOCK_USERS, MOCK_BOOKINGS } from './constants';
import { analyzeSearchQuery, generateServiceRecommendation, getChatAssistantResponse } from './services/geminiService';
import { MapPin, Star, Search, Calendar, MessageSquare, CreditCard, CheckCircle, XCircle, Trash2, TrendingUp, Users, DollarSign, Activity, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// --- Sub-Components (Internal for simplicity in this file structure) ---

const ServiceCard: React.FC<{ service: Service; onBook: (s: Service) => void }> = ({ service, onBook }) => (
  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
    <div className="relative h-48">
      <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold text-teal-800 shadow">
        {service.category}
      </div>
    </div>
    <div className="p-4 flex flex-col flex-grow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{service.title}</h3>
        <div className="flex items-center text-yellow-500 text-sm">
          <Star size={14} fill="currentColor" />
          <span className="ml-1">{service.rating}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-1 flex items-center">
        <MapPin size={14} className="mr-1" /> {service.location}
      </p>
      <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">{service.description}</p>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <span className="font-bold text-teal-600 text-lg">{service.price.toLocaleString('fr-FR')} FCFA</span>
        <button 
          onClick={() => onBook(service)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Réserver
        </button>
      </div>
    </div>
  </div>
);

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{sender: 'user'|'bot', text: string}[]>([
        {sender: 'bot', text: 'Bonjour ! Je suis l\'assistant Alloword. Comment puis-je vous aider à trouver un service à Libreville ?'}
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, {sender: 'user', text: userMsg}]);
        setInput('');
        setIsLoading(true);

        const response = await getChatAssistantResponse(userMsg);
        setMessages(prev => [...prev, {sender: 'bot', text: response}]);
        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110">
                    <MessageSquare size={24} />
                </button>
            )}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl w-80 sm:w-96 flex flex-col h-[450px] border border-gray-200">
                    <div className="bg-teal-700 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold">Assistant Alloword</h3>
                        <button onClick={() => setIsOpen(false)}><XCircle size={20} /></button>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.sender === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && <div className="text-xs text-gray-500 italic ml-2">L'assistant écrit...</div>}
                    </div>
                    <div className="p-3 border-t bg-white rounded-b-lg flex gap-2">
                        <input 
                            type="text" 
                            className="flex-grow border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                            placeholder="Posez une question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={handleSend} className="bg-teal-600 text-white p-2 rounded-md hover:bg-teal-700">
                            <TrendingUp size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// --- Main App Component ---

const App: React.FC = () => {
  const [view, setView] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchResultText, setSearchResultText] = useState('');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Booking Modal State
  const [bookingService, setBookingService] = useState<Service | null>(null);

  // Admin Data
  const adminStats = {
      totalUsers: 150,
      totalProviders: 45,
      totalRevenue: bookings.reduce((acc, b) => acc + b.totalPrice, 0),
      activeBookings: bookings.filter(b => b.status === 'pending').length
  };

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchResultText('Analyse de votre demande avec Gemini...');
    
    // 1. Standard text filtering first
    let filtered = MOCK_SERVICES.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. AI Enhancement
    if (searchQuery.length > 3) {
        const analysis = await analyzeSearchQuery(searchQuery);
        if (analysis.intent !== 'general') {
             // Refine search based on AI extracted entities
             filtered = MOCK_SERVICES.filter(s => {
                 const matchCategory = analysis.category ? s.category.toLowerCase().includes(analysis.category.toLowerCase()) : true;
                 const matchLocation = analysis.location ? s.location.toLowerCase().includes(analysis.location.toLowerCase()) : true;
                 return matchCategory && matchLocation;
             });
             setSearchResultText(`Résultats pour "${analysis.category || 'Services'}" à ${analysis.location || 'Libreville'}`);
        } else {
             setSearchResultText(`Résultats trouvés : ${filtered.length}`);
        }
    } else {
        setSearchResultText('');
    }

    setServices(filtered.length > 0 ? filtered : MOCK_SERVICES); // Fallback if 0 to show something or handle empty state
    if (filtered.length === 0) setSearchResultText("Aucun service exact trouvé. Voici d'autres suggestions.");
    setView('search');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Admin Check
    if (loginPassword === 'z0r02000') {
        const adminUser = MOCK_USERS.find(u => u.role === 'admin');
        if (adminUser) {
            setUser(adminUser);
            setView('admin');
            return;
        }
    }

    // Regular User Simulation
    const foundUser = MOCK_USERS.find(u => u.email === loginEmail);
    if (foundUser) {
        setUser(foundUser);
        setView('home');
    } else {
        // Create a mock user on the fly for demo
        const newUser: User = { 
            id: `u${Date.now()}`, 
            name: loginEmail.split('@')[0], 
            email: loginEmail, 
            role: 'client',
            location: LibrevilleQuartier.CENTRE_VILLE
        };
        setUser(newUser);
        setView('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
    setServices(MOCK_SERVICES); // Reset search
  };

  const handleBooking = (service: Service) => {
      if (!user) {
          setView('login');
          return;
      }
      setBookingService(service);
  };

  const confirmBooking = () => {
      if (bookingService && user) {
          const newBooking: Booking = {
              id: `b${Date.now()}`,
              serviceId: bookingService.id,
              clientId: user.id,
              providerId: bookingService.providerId,
              date: new Date().toISOString().split('T')[0],
              status: 'pending',
              totalPrice: bookingService.price
          };
          setBookings([...bookings, newBooking]);
          setBookingService(null);
          setView('dashboard');
          alert('Réservation confirmée ! Le prestataire vous contactera.');
      }
  };

  // --- Views ---

  const renderHome = () => (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-teal-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Trouvez le service idéal à <span className="text-orange-400">Libreville</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            Plomberie, électricité, ménage... Des prestataires qualifiés près de chez vous.
          </p>
          
          <form onSubmit={handleSmartSearch} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto bg-white p-2 rounded-lg shadow-xl">
            <div className="flex-grow flex items-center bg-gray-100 rounded-md px-4">
              <Search className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Que recherchez-vous ? (ex: Plombier à Louis)"
                className="w-full bg-transparent border-none focus:ring-0 p-3 text-gray-800 placeholder-gray-500 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md font-bold transition-colors">
              Rechercher
            </button>
          </form>
          <div className="mt-4 text-sm text-gray-300">
            <span className="bg-teal-800 px-2 py-1 rounded text-xs mr-2">IA Activée</span>
            Recherche intelligente par quartier et catégorie
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Catégories Populaires</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map(cat => (
            <button 
                key={cat} 
                onClick={() => {
                    setServices(MOCK_SERVICES.filter(s => s.category === cat));
                    setView('search');
                }}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100 group"
            >
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors mb-2">
                <Star size={20} />
              </div>
              <span className="text-sm font-medium text-center">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Services Recommandés</h2>
            <button onClick={() => setView('search')} className="text-teal-600 hover:underline text-sm font-medium">Voir tout</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_SERVICES.slice(0, 4).map(service => (
                <ServiceCard key={service.id} service={service} onBook={handleBooking} />
            ))}
        </div>
      </section>
      
      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
            <div className="mb-6 md:mb-0">
                <h3 className="text-3xl font-bold mb-2">Devenez Prestataire Alloword</h3>
                <p className="opacity-90">Augmentez vos revenus en proposant vos services à des milliers de clients à Libreville.</p>
            </div>
            <button className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-md">
                Créer mon profil
            </button>
        </div>
      </section>
    </div>
  );

  const renderSearch = () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Explorer les services</h2>
            {searchResultText && <p className="text-teal-600 mt-2 font-medium">{searchResultText}</p>}
        </div>
        
        <div className="flex gap-2 bg-white p-2 rounded shadow-sm border">
            <select 
                className="bg-transparent border-none text-sm focus:ring-0 text-gray-600"
                value={selectedCategory}
                onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    if(e.target.value === 'Tous') {
                        setServices(MOCK_SERVICES);
                    } else {
                        setServices(MOCK_SERVICES.filter(s => s.category === e.target.value));
                    }
                }}
            >
                <option value="Tous">Toutes Catégories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Filters Sidebar (Visual only for demo) */}
        <div className="hidden md:block col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4">Filtrer par Quartier</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.values(LibrevilleQuartier).map(q => (
                        <label key={q} className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                            <span className="text-sm text-gray-600">{q}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4">Prix</h3>
                <input type="range" min="5000" max="100000" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>5 000 FCFA</span>
                    <span>100 000+ FCFA</span>
                </div>
            </div>
        </div>

        {/* Results Grid */}
        <div className="col-span-1 md:col-span-2">
            {services.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Aucun service trouvé pour ces critères.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map(s => <ServiceCard key={s.id} service={s} onBook={handleBooking} />)}
                </div>
            )}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
      const myBookings = bookings.filter(b => b.clientId === user?.id || b.providerId === user?.id);
      
      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Tableau de Bord</h2>
            <p className="text-gray-600 mb-8">Bienvenue, {user?.name}</p>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Mes Réservations</h3>
                    <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{myBookings.length} Total</span>
                </div>
                {myBookings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Vous n'avez aucune réservation pour le moment.</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {myBookings.map(booking => {
                            const service = MOCK_SERVICES.find(s => s.id === booking.serviceId);
                            return (
                                <div key={booking.id} className="p-6 flex flex-col md:flex-row items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4 mb-4 md:mb-0 w-full md:w-auto">
                                        <div className={`p-2 rounded-full ${booking.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {booking.status === 'completed' ? <CheckCircle size={20} /> : <Calendar size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{service?.title || 'Service inconnu'}</p>
                                            <p className="text-sm text-gray-500">Date: {booking.date} • {booking.totalPrice.toLocaleString()} FCFA</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                            booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                                        }`}>
                                            {booking.status === 'pending' ? 'En Attente' : booking.status === 'completed' ? 'Terminé' : booking.status}
                                        </span>
                                        {booking.status === 'pending' && (
                                            <button className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      );
  };

  const renderAdmin = () => (
    <div className="bg-gray-100 min-h-screen pb-12">
        <div className="bg-slate-900 text-white p-6 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Shield /> Admin Dashboard</h1>
                    <p className="text-slate-400 text-sm">Gestion globale de la plateforme Alloword</p>
                </div>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Déconnexion</button>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Utilisateurs</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{adminStats.totalUsers}</h3>
                        </div>
                        <Users className="text-blue-500 bg-blue-50 p-2 rounded-lg w-10 h-10" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Revenus (FCFA)</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{(adminStats.totalRevenue).toLocaleString()}</h3>
                        </div>
                        <DollarSign className="text-green-500 bg-green-50 p-2 rounded-lg w-10 h-10" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Prestataires</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{adminStats.totalProviders}</h3>
                        </div>
                        <Activity className="text-purple-500 bg-purple-50 p-2 rounded-lg w-10 h-10" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">En Attente</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-1">{adminStats.activeBookings}</h3>
                        </div>
                        <Calendar className="text-orange-500 bg-orange-50 p-2 rounded-lg w-10 h-10" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Chart 1 */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-gray-700 mb-6">Répartition des Services</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={[
                                        { name: 'Plomberie', value: 35 },
                                        { name: 'Ménage', value: 25 },
                                        { name: 'Élec', value: 20 },
                                        { name: 'Divers', value: 20 },
                                    ]} 
                                    cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value"
                                >
                                    <Cell fill="#0d9488" />
                                    <Cell fill="#f97316" />
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#94a3b8" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-gray-500 mt-4">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-600"></div> Plomberie</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Ménage</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Elec</span>
                    </div>
                 </div>

                 {/* Recent Activity List */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <h3 className="font-bold text-gray-700 mb-4">Activité Récente</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">U{i}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Nouvelle réservation</p>
                                        <p className="text-xs text-gray-500">Il y a {i * 15} minutes</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-teal-600">+15 000 FCFA</span>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );

  const renderLogin = () => (
    <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-100">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Bienvenue sur Alloword</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input 
                        type="email" 
                        required
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="client@exemple.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                    <input 
                        type="password" 
                        required
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-400 mt-1">Admin: z0r02000</p>
                </div>
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-md transition-colors">
                    Se Connecter
                </button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-500">
                Pas encore de compte ? <a href="#" className="text-orange-500 font-bold hover:underline">S'inscrire</a>
            </div>
        </div>
    </div>
  );

  return (
    <>
        {view === 'admin' ? renderAdmin() : (
            <Layout currentUser={user} onLogout={handleLogout} onNavigate={setView} currentPage={view}>
                {view === 'home' && renderHome()}
                {view === 'search' && renderSearch()}
                {view === 'login' && renderLogin()}
                {view === 'dashboard' && renderDashboard()}
            </Layout>
        )}

        {/* Booking Modal */}
        {bookingService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                    <div className="bg-teal-700 p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold text-lg">Confirmer la réservation</h3>
                        <button onClick={() => setBookingService(null)}><XCircle /></button>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-4 mb-6">
                            <img src={bookingService.image} className="w-20 h-20 rounded-md object-cover" alt="" />
                            <div>
                                <h4 className="font-bold text-gray-800">{bookingService.title}</h4>
                                <p className="text-sm text-gray-500">{bookingService.providerName}</p>
                                <p className="text-teal-600 font-bold mt-1">{bookingService.price.toLocaleString()} FCFA</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date souhaitée</label>
                                <input type="date" className="w-full border rounded px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message pour le prestataire</label>
                                <textarea className="w-full border rounded px-3 py-2 h-20" placeholder="Détails supplémentaires..."></textarea>
                            </div>
                             <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200 flex gap-2">
                                <CreditCard size={16} />
                                Paiement sécurisé via Airtel Money ou Moov Money lors de la confirmation.
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end gap-3">
                        <button onClick={() => setBookingService(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Annuler</button>
                        <button onClick={confirmBooking} className="px-4 py-2 bg-teal-600 text-white font-bold rounded hover:bg-teal-700">Confirmer</button>
                    </div>
                </div>
            </div>
        )}

        <ChatBot />
    </>
  );
};

export default App;