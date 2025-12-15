
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { User, Service, Booking, LibrevilleQuartier, CATEGORIES, ServiceRequest, Notification, Conversation, Message, UserRole } from './types';
import { MOCK_SERVICES, MOCK_USERS, MOCK_BOOKINGS, MOCK_REQUESTS, MOCK_CONVERSATIONS, MOCK_MESSAGES } from './constants';
import { analyzeSearchQuery, generateServiceRecommendation, getChatAssistantResponse, generateRequestDescription } from './services/geminiService';
import { MapPin, Star, Search, Calendar, MessageSquare, CreditCard, CheckCircle, XCircle, Trash2, TrendingUp, Users, DollarSign, Activity, Shield, Sparkles, Map, Megaphone, PlusCircle, Send, Phone, Bell, Paperclip, MoreVertical, Briefcase, User as UserIcon, Lock, Mail, Check, CheckCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// --- Sub-Components ---

const ServiceCard: React.FC<{ service: Service; onBook: (s: Service) => void; onContact: (s: Service) => void }> = ({ service, onBook, onContact }) => (
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
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 gap-2">
        <span className="font-bold text-teal-600 text-lg mr-auto">{service.price.toLocaleString('fr-FR')} FCFA</span>
        <button 
          onClick={() => onContact(service)}
          className="p-2 text-teal-600 hover:bg-teal-50 rounded-full transition-colors border border-teal-200"
          title="Contacter le prestataire"
        >
            <MessageSquare size={20} />
        </button>
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

const RequestCard: React.FC<{ request: ServiceRequest; onPropose: (r: ServiceRequest) => void }> = ({ request, onPropose }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-orange-500 border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">{request.category}</span>
                <h3 className="font-bold text-gray-800 mt-1">{request.title}</h3>
            </div>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{request.date}</span>
        </div>
        <p className="text-gray-600 text-sm mt-2 mb-3 line-clamp-2">{request.description}</p>
        <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-500">
                <MapPin size={14} className="mr-1" /> {request.location}
            </div>
            <span className="font-bold text-gray-800">{request.budget > 0 ? `${request.budget.toLocaleString()} FCFA` : 'À négocier'}</span>
        </div>
        <button 
            onClick={() => onPropose(request)}
            className="w-full mt-3 py-2 border border-teal-600 text-teal-600 rounded text-sm font-medium hover:bg-teal-50 flex items-center justify-center gap-2"
        >
            <Send size={14} /> Proposer mes services
        </button>
    </div>
);

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{sender: 'user'|'bot', text: string}[]>([
        {sender: 'bot', text: 'Bonjour ! Je suis l\'assistant Allowork. Comment puis-je vous aider à trouver un service à Libreville ?'}
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
        <div className="fixed bottom-6 right-6 z-40">
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center gap-2">
                    <MessageSquare size={24} />
                    <span className="text-sm font-bold hidden sm:inline">Besoin d'aide ?</span>
                </button>
            )}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl w-80 sm:w-96 flex flex-col h-[450px] border border-gray-200">
                    <div className="bg-teal-700 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold">Assistant Allowork</h3>
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
  
  // Data State
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [requests, setRequests] = useState<ServiceRequest[]>(MOCK_REQUESTS);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Messaging State
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [allMessages, setAllMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [typingConversationId, setTypingConversationId] = useState<string | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [searchResultText, setSearchResultText] = useState('');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regData, setRegData] = useState({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'client' as UserRole,
      location: LibrevilleQuartier.CENTRE_VILLE,
      specialty: CATEGORIES[0]
  });

  // Booking Modal State
  const [bookingService, setBookingService] = useState<Service | null>(null);

  // Contact Modal State
  const [contactService, setContactService] = useState<Service | null>(null);

  // Proposal State
  const [proposeRequest, setProposeRequest] = useState<ServiceRequest | null>(null);
  const [proposalMessage, setProposalMessage] = useState('');

  // Post Request State
  const [requestTitle, setRequestTitle] = useState('');
  const [requestCategory, setRequestCategory] = useState(CATEGORIES[0]);
  const [requestLocation, setRequestLocation] = useState(LibrevilleQuartier.CENTRE_VILLE);
  const [requestBudget, setRequestBudget] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (view === 'messages' && activeConversationId) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages, activeConversationId, view, typingConversationId]);

  // Mark messages as read when viewing conversation
  useEffect(() => {
      if (activeConversationId && user) {
           const activeConv = conversations.find(c => c.id === activeConversationId);
           if (activeConv) {
               // 1. Reset unread count for conversation
               if (activeConv.unreadCount > 0) {
                    setConversations(prev => prev.map(c => 
                        c.id === activeConversationId ? { ...c, unreadCount: 0 } : c
                    ));
               }

               // 2. Mark received messages as read
               const otherId = activeConv.participants.find(p => p !== user.id);
               if (otherId) {
                   const hasUnread = allMessages.some(m => m.senderId === otherId && m.receiverId === user.id && !m.read);
                   if (hasUnread) {
                        setAllMessages(prev => prev.map(m => 
                            (m.senderId === otherId && m.receiverId === user.id && !m.read)
                            ? {...m, read: true}
                            : m
                        ));
                   }
               }
           }
      }
  }, [activeConversationId, allMessages.length, user]);

  // Admin Data
  const adminStats = {
      totalUsers: 150,
      totalProviders: 45,
      totalRevenue: bookings.reduce((acc, b) => acc + b.totalPrice, 0),
      activeBookings: bookings.filter(b => b.status === 'pending').length,
      totalRequests: requests.length
  };

  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchResultText('Analyse de votre demande avec Gemini...');
    
    // 1. Standard text filtering
    let filtered = MOCK_SERVICES.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 2. AI Enhancement
    if (searchQuery.length > 3) {
        const analysis = await analyzeSearchQuery(searchQuery);
        if (analysis.intent !== 'general') {
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

    setServices(filtered.length > 0 ? filtered : MOCK_SERVICES);
    if (filtered.length === 0) setSearchResultText("Aucun service exact trouvé. Essayez de publier une demande !");
    setView('search');
  };

  const handleGenerateDescription = async () => {
      if(!requestTitle) return;
      setIsGeneratingDesc(true);
      const desc = await generateRequestDescription(requestTitle, requestCategory);
      setRequestDesc(desc);
      setIsGeneratingDesc(false);
  };

  const handlePostRequest = (e: React.FormEvent) => {
      e.preventDefault();
      if(!user) {
          setView('login');
          return;
      }
      
      const newRequest: ServiceRequest = {
          id: `r${Date.now()}`,
          userId: user.id,
          userName: user.name,
          title: requestTitle,
          description: requestDesc,
          category: requestCategory,
          location: requestLocation,
          budget: Number(requestBudget) || 0,
          date: new Date().toLocaleDateString('fr-FR'),
          status: 'open'
      };
      
      setRequests([newRequest, ...requests]);

      // --- NOTIFICATION LOGIC ---
      // Find providers who specialize in this category
      const matchingProviders = MOCK_USERS.filter(u => 
          u.role === 'provider' && u.specialty === requestCategory
      );

      if (matchingProviders.length > 0) {
          const newNotifs: Notification[] = matchingProviders.map(provider => ({
              id: `n${Date.now()}-${Math.random()}`,
              userId: provider.id,
              message: `🔔 Nouvelle demande en ${requestCategory} : "${requestTitle}" à ${requestLocation}.`,
              date: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
              read: false,
              type: 'request_match',
              linkTo: 'dashboard'
          }));
          setNotifications(prev => [...newNotifs, ...prev]);
          console.log(`Notifications sent to ${matchingProviders.length} providers.`);
      }

      setView('home');
      // Reset form
      setRequestTitle('');
      setRequestDesc('');
      alert(`Votre demande a été publiée ! ${matchingProviders.length} prestataires ont été notifiés.`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Admin Check
    if (loginEmail === 'williamdesxx@gmail.com' && loginPassword === 'z0r02000') {
        const adminUser = MOCK_USERS.find(u => u.role === 'admin');
        if (adminUser) {
            setUser(adminUser);
            setView('admin');
            return;
        }
    }

    // Regular User Simulation (For demo, allow any other email)
    const foundUser = MOCK_USERS.find(u => u.email === loginEmail && u.role !== 'admin');
    if (foundUser) {
        setUser(foundUser);
        setView('home');
    } else if (loginEmail !== 'williamdesxx@gmail.com') {
        // Create a mock user on the fly for demo client if not admin email
        const newUser: User = { 
            id: `u${Date.now()}`, 
            name: loginEmail.split('@')[0], 
            email: loginEmail, 
            role: 'client',
            phoneNumber: '077 00 00 00',
            location: LibrevilleQuartier.CENTRE_VILLE
        };
        setUser(newUser);
        setView('home');
    } else {
        setLoginError("Identifiants incorrects.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!regData.name || !regData.email || !regData.password || !regData.phone) {
          alert("Veuillez remplir tous les champs obligatoires.");
          return;
      }

      const newUser: User = {
          id: `u${Date.now()}`,
          name: regData.name,
          email: regData.email,
          role: regData.role,
          phoneNumber: regData.phone,
          location: regData.location,
          specialty: regData.role === 'provider' ? regData.specialty : undefined
      };

      // In a real app, you would send this to the backend
      MOCK_USERS.push(newUser);
      
      setUser(newUser);
      setView('home');
      alert(`Bienvenue ${newUser.name} ! Votre compte a été créé avec succès.`);
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

  const handleContact = (service: Service) => {
      if (!user) {
          setView('login');
          return;
      }
      setContactService(service);
  };

  const startConversation = (providerId: string) => {
      if (!user) return;
      
      // Check if conversation already exists
      const existingConv = conversations.find(c => c.participants.includes(user.id) && c.participants.includes(providerId));
      
      if (existingConv) {
          setActiveConversationId(existingConv.id);
      } else {
          // Create new conversation
          const newConv: Conversation = {
              id: `c${Date.now()}`,
              participants: [user.id, providerId],
              unreadCount: 0,
              lastMessage: {
                  id: `m${Date.now()}`,
                  senderId: user.id,
                  receiverId: providerId,
                  content: 'Nouvelle conversation démarrée',
                  timestamp: new Date().toISOString(),
                  read: true
              }
          };
          setConversations([newConv, ...conversations]);
          setActiveConversationId(newConv.id);
      }
      
      setContactService(null);
      setView('messages');
  };

  const handleSendMessage = () => {
      if (!messageInput.trim() || !activeConversationId || !user) return;
      
      const conversation = conversations.find(c => c.id === activeConversationId);
      if (!conversation) return;

      const receiverId = conversation.participants.find(p => p !== user.id);
      if (!receiverId) return;

      const newMessageId = `m${Date.now()}`;
      const newMessage: Message = {
          id: newMessageId,
          senderId: user.id,
          receiverId: receiverId,
          content: messageInput,
          timestamp: new Date().toISOString(),
          read: false
      };

      // Add my message
      setAllMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      
      // Update convo last msg
      setConversations(prev => prev.map(c => {
          if (c.id === activeConversationId) {
              return { ...c, lastMessage: newMessage, unreadCount: 0 }; 
          }
          return c;
      }));

      // --- SIMULATION SEQUENCE ---
      
      // 1. Simulate "Read" receipt for MY message after 1.5s
      setTimeout(() => {
          setAllMessages(prev => prev.map(m => 
              m.id === newMessageId ? { ...m, read: true } : m
          ));
      }, 1500);

      // 2. Simulate "Typing" start after 2.5s
      setTimeout(() => {
          setTypingConversationId(activeConversationId);
      }, 2500);

      // 3. Simulate Reply receive after 5s
      setTimeout(() => {
        setTypingConversationId(null); // Stop typing
        
        const reply: Message = {
            id: `m${Date.now() + 1}`,
            senderId: receiverId,
            receiverId: user.id,
            content: "Merci pour votre message. Je vous réponds dès que possible.",
            timestamp: new Date().toISOString(),
            read: false
        };

        // Add reply
        setAllMessages(prev => [...prev, reply]);
        
        // Update convo
        setConversations(prev => prev.map(c => 
            c.id === activeConversationId 
            ? { ...c, lastMessage: reply, unreadCount: 0 } // If active, assume read/visible
            : c
        ));
      }, 5000);
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
          
          // Notify Provider
          const newNotif: Notification = {
              id: `n${Date.now()}`,
              userId: bookingService.providerId,
              message: `📅 Nouvelle réservation de ${user.name} pour ${bookingService.title}.`,
              date: new Date().toLocaleTimeString(),
              read: false,
              type: 'booking_update',
              linkTo: 'dashboard'
          };
          setNotifications(prev => [newNotif, ...prev]);

          setBookingService(null);
          setView('dashboard');
          alert('Réservation confirmée ! Le prestataire vous contactera.');
      }
  };

  const handleOpenProposal = (req: ServiceRequest) => {
      if (!user) {
          setView('login');
          return;
      }
      setProposeRequest(req);
  };

  const submitProposal = () => {
      if (proposeRequest && user) {
        // Notify Client
        const newNotif: Notification = {
            id: `n${Date.now()}`,
            userId: proposeRequest.userId,
            message: `💬 ${user.name} vous a fait une proposition pour "${proposeRequest.title}".`,
            date: new Date().toLocaleTimeString(),
            read: false,
            type: 'proposal',
            linkTo: 'dashboard'
        };
        setNotifications(prev => [newNotif, ...prev]);

        setProposeRequest(null);
        setProposalMessage('');
        alert("Votre proposition a été envoyée avec succès à l'utilisateur !");
      }
  }

  const getProviderPhone = (providerId: string) => {
    const provider = MOCK_USERS.find(u => u.id === providerId);
    return provider?.phoneNumber || 'N/A';
  };

  // --- Views ---

  const renderHome = () => (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-teal-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Allo<span className="text-orange-400">work</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            La marketplace de services n°1 à Libreville. <br/>
            Trouvez un prestataire ou répondez à une demande.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <form onSubmit={handleSmartSearch} className="w-full max-w-2xl flex items-center bg-white p-2 rounded-lg shadow-xl">
                <Search className="text-gray-400 ml-2" />
                <input 
                    type="text" 
                    placeholder="De quoi avez-vous besoin ? (ex: Ménage à Akanda)"
                    className="w-full bg-transparent border-none focus:ring-0 p-3 text-gray-800 placeholder-gray-500 focus:outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-bold transition-colors">
                    Rechercher
                </button>
            </form>
            <div className="text-sm text-gray-300 flex items-center gap-2">
                <Sparkles size={14} className="text-yellow-400" />
                Recherche intelligente par IA
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-12">
               {/* Categories */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Catégories</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {CATEGORIES.slice(0, 8).map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => {
                            setServices(MOCK_SERVICES.filter(s => s.category === cat));
                            setView('search');
                        }}
                        className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
                    >
                    <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors mb-2">
                        <Star size={18} />
                    </div>
                    <span className="text-xs font-bold text-center text-gray-700">{cat}</span>
                    </button>
                ))}
                </div>
              </section>

              {/* Featured Services */}
              <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Prestataires à la Une</h2>
                    <button onClick={() => setView('search')} className="text-teal-600 hover:underline text-sm font-medium">Voir plus</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {MOCK_SERVICES.slice(0, 4).map(service => (
                        <ServiceCard key={service.id} service={service} onBook={handleBooking} onContact={handleContact} />
                    ))}
                </div>
              </section>
          </div>

          {/* Sidebar: Recent Requests (Allovoisin style) */}
          <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
                  <div className="flex items-center gap-2 mb-6">
                      <Megaphone className="text-orange-500" />
                      <h2 className="text-xl font-bold text-gray-800">Dernières demandes</h2>
                  </div>
                  <div className="space-y-4">
                      {requests.slice(0, 3).map(req => (
                          <RequestCard key={req.id} request={req} onPropose={handleOpenProposal} />
                      ))}
                  </div>
                  <button 
                    onClick={() => setView('post-request')}
                    className="w-full mt-6 bg-teal-700 text-white py-3 rounded-lg font-bold hover:bg-teal-800 transition-colors shadow-md"
                  >
                      Publier une demande
                  </button>
              </div>
          </div>
      </div>
      
      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-teal-800 to-teal-600 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
            <div className="mb-6 md:mb-0">
                <h3 className="text-3xl font-bold mb-2">Vous avez un savoir-faire ?</h3>
                <p className="opacity-90">Rejoignez la communauté Allowork et arrondissez vos fins de mois en rendant service.</p>
            </div>
            <button onClick={() => setView('login')} className="bg-white text-teal-800 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-md">
                Devenir Prestataire
            </button>
        </div>
      </section>
    </div>
  );

  const renderMessages = () => {
    // Filter conversations for current user
    const myConversations = conversations.filter(c => c.participants.includes(user?.id || ''));
    
    // Get active conversation details
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const activeMessages = allMessages.filter(m => 
        (m.senderId === user?.id && m.receiverId === activeConversation?.participants.find(p => p !== user?.id)) ||
        (m.receiverId === user?.id && m.senderId === activeConversation?.participants.find(p => p !== user?.id))
    ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Helper to get other user in convo
    const getOtherUser = (conv: Conversation) => {
        const otherId = conv.participants.find(p => p !== user?.id);
        return MOCK_USERS.find(u => u.id === otherId);
    };

    const activeOtherUser = activeConversation ? getOtherUser(activeConversation) : null;
    const isOtherTyping = activeConversationId === typingConversationId;

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-80px)] flex gap-4">
            {/* Conversations Sidebar */}
            <div className="w-full md:w-1/3 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {myConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Aucune conversation.</div>
                    ) : (
                        myConversations.map(conv => {
                            const otherUser = getOtherUser(conv);
                            const isActive = conv.id === activeConversationId;
                            return (
                                <div 
                                    key={conv.id} 
                                    onClick={() => setActiveConversationId(conv.id)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${isActive ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                            {otherUser?.name.charAt(0)}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className={`font-bold text-sm truncate ${isActive ? 'text-teal-900' : 'text-gray-800'}`}>{otherUser?.name}</h4>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                            <p className={`text-sm truncate ${conv.unreadCount > 0 && conv.lastMessage.senderId !== user?.id ? 'font-bold text-black' : 'text-gray-500'}`}>
                                                {conv.lastMessage.senderId === user?.id ? 'Vous: ' : ''}{conv.lastMessage.content}
                                            </p>
                                        </div>
                                        {conv.unreadCount > 0 && conv.lastMessage.senderId !== user?.id && (
                                            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="hidden md:flex flex-col w-2/3 bg-white rounded-lg shadow border border-gray-200">
                {activeConversationId && activeOtherUser ? (
                    <>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                                    {activeOtherUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{activeOtherUser.name}</h3>
                                    <span className="text-xs text-green-600 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> En ligne</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"><Phone size={20} /></button>
                                <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
                            {activeMessages.map(msg => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-lg p-3 shadow-sm relative ${isMe ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                                            <p className="text-sm mr-4">{msg.content}</p>
                                            <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isMe ? 'text-teal-200' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                {isMe && (
                                                    msg.read 
                                                    ? <CheckCheck size={14} className="text-blue-300" /> 
                                                    : <Check size={14} className="text-teal-200" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            
                            {isOtherTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-3 shadow-sm">
                                        <div className="flex gap-1 items-center h-4">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600"><Paperclip size={20} /></button>
                                <input 
                                    type="text" 
                                    className="flex-grow border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="Écrivez votre message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-full transition-transform hover:scale-105"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageSquare size={64} className="mb-4 opacity-20" />
                        <p>Sélectionnez une conversation pour commencer à discuter</p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderPostRequest = () => (
      <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-orange-500 p-6 text-white">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                      <PlusCircle size={24} /> Publier une demande
                  </h2>
                  <p className="opacity-90 mt-1">Trouvez le prestataire idéal à Libreville en quelques clics.</p>
              </div>
              <form onSubmit={handlePostRequest} className="p-8 space-y-6">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Titre de votre demande</label>
                      <input 
                        type="text" 
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        placeholder="Ex: Réparation fuite d'eau cuisine"
                        value={requestTitle}
                        onChange={(e) => setRequestTitle(e.target.value)}
                      />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                          <select 
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
                            value={requestCategory}
                            onChange={(e) => setRequestCategory(e.target.value)}
                          >
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Quartier</label>
                          <select 
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
                            value={requestLocation}
                            onChange={(e) => setRequestLocation(e.target.value as any)}
                          >
                              {Object.values(LibrevilleQuartier).map(q => <option key={q} value={q}>{q}</option>)}
                          </select>
                      </div>
                  </div>

                  <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-gray-700">Description détaillée</label>
                        <button 
                            type="button" 
                            onClick={handleGenerateDescription}
                            disabled={!requestTitle || isGeneratingDesc}
                            className="text-xs flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium disabled:opacity-50"
                        >
                            <Sparkles size={12} /> {isGeneratingDesc ? 'Rédaction...' : 'Aider à rédiger avec IA'}
                        </button>
                      </div>
                      <textarea 
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-orange-500"
                        placeholder="Décrivez votre besoin le plus précisément possible..."
                        value={requestDesc}
                        onChange={(e) => setRequestDesc(e.target.value)}
                      ></textarea>
                  </div>

                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Budget estimé (FCFA)</label>
                      <input 
                        type="number" 
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
                        placeholder="Ex: 15000 (Laisser vide si à négocier)"
                        value={requestBudget}
                        onChange={(e) => setRequestBudget(e.target.value)}
                      />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-4">
                      <button type="button" onClick={() => setView('home')} className="text-gray-500 hover:text-gray-700 font-medium">Annuler</button>
                      <button type="submit" className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 shadow-md">
                          Publier maintenant
                      </button>
                  </div>
              </form>
          </div>
      </div>
  );

  const renderSearch = () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Rechercher un service</h2>
            {searchResultText && <p className="text-teal-600 mt-2 font-medium flex items-center gap-2"><Sparkles size={16} /> {searchResultText}</p>}
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
        <div className="hidden md:block col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Map size={18} /> Quartier</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Object.values(LibrevilleQuartier).map(q => (
                        <label key={q} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" />
                            <span className="text-sm text-gray-600">{q}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>

        <div className="col-span-1 md:col-span-2">
            {services.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">Aucun prestataire trouvé pour ces critères.</p>
                    <button onClick={() => setView('post-request')} className="text-orange-500 font-bold hover:underline">
                        Publier une demande pour que les prestataires vous contactent
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map(s => <ServiceCard key={s.id} service={s} onBook={handleBooking} onContact={handleContact} />)}
                </div>
            )}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
      const myBookings = bookings.filter(b => b.clientId === user?.id || b.providerId === user?.id);
      const myRequests = requests.filter(r => r.userId === user?.id);
      
      return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Tableau de Bord</h2>
                    <p className="text-gray-600">Bienvenue, {user?.name}</p>
                </div>
                {user?.role === 'provider' && (
                     <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-lg text-sm font-bold">
                         Mode Prestataire
                     </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* My Requests Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden h-fit">
                    <div className="px-6 py-4 border-b border-gray-200 bg-orange-50 flex justify-between items-center">
                        <h3 className="font-bold text-orange-800">Mes Demandes Publiées</h3>
                        <span className="bg-white text-orange-600 text-xs px-2 py-1 rounded-full border border-orange-200">{myRequests.length}</span>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {myRequests.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">Aucune demande publiée.</div>
                        ) : (
                            myRequests.map(req => (
                                <div key={req.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex justify-between">
                                        <p className="font-bold text-gray-800">{req.title}</p>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Ouvert</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{req.date} • {req.budget > 0 ? req.budget + ' FCFA' : 'Budget à négocier'}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-4 border-t bg-gray-50 text-center">
                        <button onClick={() => setView('post-request')} className="text-sm font-bold text-orange-600 hover:text-orange-800">Publier une nouvelle demande</button>
                    </div>
                </div>

                {/* Bookings Section */}
                <div className="bg-white rounded-lg shadow overflow-hidden h-fit">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Réservations & Contacts</h3>
                        <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">{myBookings.length}</span>
                    </div>
                    {myBookings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Aucune réservation.</div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {myBookings.map(booking => {
                                const service = MOCK_SERVICES.find(s => s.id === booking.serviceId);
                                const isClient = booking.clientId === user?.id;
                                const otherPartyId = isClient ? booking.providerId : booking.clientId;
                                const otherParty = MOCK_USERS.find(u => u.id === otherPartyId);

                                return (
                                    <div key={booking.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center space-x-3 w-full sm:w-auto">
                                                <div className={`p-2 rounded-full flex-shrink-0 ${booking.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {booking.status === 'completed' ? <CheckCircle size={16} /> : <Calendar size={16} />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-800 text-sm truncate">{service?.title || 'Service'}</p>
                                                    <p className="text-xs text-gray-500 mb-1">{booking.date} • {booking.totalPrice.toLocaleString()} FCFA</p>
                                                    {otherParty && (
                                                        <div className="flex items-center gap-2 text-xs font-medium text-teal-700 bg-teal-50 px-2 py-1 rounded w-fit">
                                                            <Phone size={12} />
                                                            {otherParty.phoneNumber || 'Numéro non disponible'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase whitespace-nowrap self-start sm:self-center ${
                                                booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
                                            }`}>
                                                {booking.status === 'pending' ? 'En Attente' : booking.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  };

  const renderAdmin = () => (
    <div className="bg-gray-100 min-h-screen pb-12">
        <div className="bg-slate-900 text-white p-6 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="text-red-500" /> Admin Allowork</h1>
                    <p className="text-slate-400 text-sm">Dashboard de modération - Libreville</p>
                </div>
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold">Déconnexion</button>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Utilisateurs</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{adminStats.totalUsers}</h3>
                        <Users className="text-blue-500 opacity-50" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Volume d'affaires</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{(adminStats.totalRevenue).toLocaleString()}</h3>
                        <DollarSign className="text-green-500 opacity-50" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Demandes Publiées</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{adminStats.totalRequests}</h3>
                        <Megaphone className="text-orange-500 opacity-50" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Bookings Actifs</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{adminStats.activeBookings}</h3>
                        <Activity className="text-purple-500 opacity-50" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Chart */}
                 <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-gray-700 mb-6">Répartition de l'activité par catégorie</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                {name: 'Plomberie', val: 35}, {name: 'Ménage', val: 28}, 
                                {name: 'Elec', val: 20}, {name: 'Cours', val: 15}, 
                                {name: 'Jardin', val: 10}
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="val" fill="#0d9488" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>

                 {/* Recent Requests Feed for Moderation */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700">Dernières Demandes</h3>
                        <span className="text-xs text-gray-500">Flux temps réel</span>
                    </div>
                    <div className="space-y-4">
                        {requests.slice(0, 5).map((req, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-gray-800 truncate">{req.userName}</span>
                                    <span className="text-orange-600 font-bold text-xs">{req.category}</span>
                                </div>
                                <p className="text-gray-600 line-clamp-2 mb-2">{req.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-400">{req.location}</span>
                                    <div className="flex gap-2">
                                        <button className="text-red-500 hover:text-red-700" title="Supprimer"><Trash2 size={14} /></button>
                                        <button className="text-green-500 hover:text-green-700" title="Approuver"><CheckCircle size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );

  const renderRegister = () => (
      <div className="flex items-center justify-center min-h-[90vh] py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
             {/* Left side info */}
             <div className="bg-teal-700 p-8 text-white md:w-1/3 flex flex-col justify-between">
                 <div>
                     <h2 className="text-2xl font-bold mb-4">Rejoignez <span className="text-orange-400">Allo</span>work</h2>
                     <p className="text-teal-100 text-sm mb-6">La plus grande communauté de services à Libreville.</p>
                     <ul className="space-y-3 text-sm">
                         <li className="flex items-center gap-2"><CheckCircle size={16} /> Trouvez des clients</li>
                         <li className="flex items-center gap-2"><CheckCircle size={16} /> Trouvez des pros</li>
                         <li className="flex items-center gap-2"><CheckCircle size={16} /> 100% Sécurisé</li>
                     </ul>
                 </div>
                 <div className="mt-8 text-xs text-teal-200">
                     Déjà membre ? <br/>
                     <button onClick={() => setView('login')} className="font-bold text-white underline mt-1">Connectez-vous</button>
                 </div>
             </div>

             {/* Right side form */}
             <div className="p-8 md:w-2/3">
                 <h3 className="text-xl font-bold text-gray-800 mb-6">Créer un compte</h3>
                 
                 {/* Role Toggle */}
                 <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                     <button 
                        onClick={() => setRegData({...regData, role: 'client'})}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${regData.role === 'client' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                         Je cherche un service
                     </button>
                     <button 
                        onClick={() => setRegData({...regData, role: 'provider'})}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${regData.role === 'provider' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                     >
                         Je propose mes services
                     </button>
                 </div>

                 <form onSubmit={handleRegister} className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-gray-600 mb-1">Nom complet</label>
                         <div className="relative">
                            <UserIcon size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="text" 
                                required
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                                placeholder="Jean Mba"
                                value={regData.name}
                                onChange={e => setRegData({...regData, name: e.target.value})}
                            />
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="email" 
                                    required
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                                    placeholder="jean@exemple.com"
                                    value={regData.email}
                                    onChange={e => setRegData({...regData, email: e.target.value})}
                                />
                            </div>
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Téléphone</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="tel" 
                                    required
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                                    placeholder="077 00 11 22"
                                    value={regData.phone}
                                    onChange={e => setRegData({...regData, phone: e.target.value})}
                                />
                            </div>
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Mot de passe</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="password" 
                                required
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                                placeholder="••••••••"
                                value={regData.password}
                                onChange={e => setRegData({...regData, password: e.target.value})}
                            />
                        </div>
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Quartier</label>
                        <div className="relative">
                            <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                            <select 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm bg-white"
                                value={regData.location}
                                onChange={e => setRegData({...regData, location: e.target.value as any})}
                            >
                                {Object.values(LibrevilleQuartier).map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                        </div>
                     </div>

                     {regData.role === 'provider' && (
                         <div className="animate-fade-in-up">
                            <label className="block text-xs font-bold text-gray-600 mb-1">Votre Spécialité</label>
                            <div className="relative">
                                <Briefcase size={16} className="absolute left-3 top-3 text-gray-400" />
                                <select 
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm bg-white"
                                    value={regData.specialty}
                                    onChange={e => setRegData({...regData, specialty: e.target.value})}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Cela nous aidera à vous envoyer les bonnes demandes.</p>
                         </div>
                     )}

                     <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-colors mt-2 shadow-md">
                         S'inscrire gratuitement
                     </button>
                     <p className="text-xs text-gray-400 text-center mt-4">
                         En vous inscrivant, vous acceptez nos conditions générales d'utilisation.
                     </p>
                 </form>
             </div>
        </div>
      </div>
  );

  const renderLogin = () => (
    <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-100">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Bienvenue sur <span className="text-orange-500">Allo</span>work</h2>
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
                </div>
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-md transition-colors">
                    Se Connecter
                </button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-500">
                Pas encore de compte ? <button onClick={() => setView('register')} className="text-orange-500 font-bold hover:underline">S'inscrire</button>
            </div>
        </div>
    </div>
  );

  // --- Main Render ---

  // Calculate unread messages
  const unreadMessageCount = user ? conversations.filter(c => c.participants.includes(user.id)).reduce((acc, c) => {
      // Logic assumes if last message is not from me and has unread count, display it
      return (c.lastMessage.senderId !== user.id && !c.lastMessage.read) ? acc + c.unreadCount : acc;
  }, 0) : 0;

  return (
    <>
        {view === 'admin' ? renderAdmin() : (
            <Layout 
                currentUser={user} 
                notifications={user ? notifications.filter(n => n.userId === user.id) : []}
                onLogout={handleLogout} 
                onNavigate={setView} 
                currentPage={view}
                onClearNotifications={() => setNotifications(prev => prev.map(n => n.userId === user?.id ? {...n, read: true} : n))}
                unreadMessageCount={unreadMessageCount}
            >
                {view === 'home' && renderHome()}
                {view === 'search' && renderSearch()}
                {view === 'post-request' && renderPostRequest()}
                {view === 'login' && renderLogin()}
                {view === 'register' && renderRegister()}
                {view === 'dashboard' && renderDashboard()}
                {view === 'messages' && renderMessages()}
            </Layout>
        )}

        {/* Booking Modal */}
        {bookingService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                    <div className="bg-teal-700 p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold text-lg">Réserver ce service</h3>
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
                                <input type="date" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message pour le prestataire</label>
                                <textarea className="w-full border rounded-lg px-3 py-2 h-20 focus:ring-2 focus:ring-teal-500" placeholder="Précisez votre besoin..."></textarea>
                            </div>
                             <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200 flex gap-2">
                                <CreditCard size={16} className="flex-shrink-0" />
                                <div>
                                    Paiement sécurisé via Airtel Money ou Moov Money. Le montant ne sera débité qu'après validation du prestataire.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end gap-3">
                        <button onClick={() => setBookingService(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium">Annuler</button>
                        <button onClick={confirmBooking} className="px-4 py-2 bg-teal-600 text-white font-bold rounded hover:bg-teal-700 shadow">Confirmer</button>
                    </div>
                </div>
            </div>
        )}

        {/* Contact Modal */}
        {contactService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                    <div className="bg-teal-700 p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold text-lg">Contacter le prestataire</h3>
                        <button onClick={() => setContactService(null)}><XCircle /></button>
                    </div>
                    <div className="p-6 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto overflow-hidden flex items-center justify-center">
                             <span className="text-2xl font-bold text-gray-500">{contactService.providerName.charAt(0)}</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-xl text-gray-800">{contactService.providerName}</h4>
                            <p className="text-gray-500 text-sm">{contactService.title}</p>
                        </div>
                        
                        <div className="flex flex-col gap-3 mt-4">
                            <a href={`tel:${getProviderPhone(contactService.providerId)}`} className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors">
                                <Phone size={20} /> Appeler
                            </a>
                            <button onClick={() => startConversation(contactService.providerId)} className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors">
                                <MessageSquare size={20} /> Discuter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Proposal Modal */}
        {proposeRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                     <div className="bg-orange-600 p-4 text-white flex justify-between items-center">
                        <h3 className="font-bold text-lg">Proposer mes services</h3>
                        <button onClick={() => setProposeRequest(null)}><XCircle /></button>
                    </div>
                    <div className="p-6">
                        <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                            <p className="font-bold text-gray-800">Demande : {proposeRequest.title}</p>
                            <p className="text-gray-600 mt-1">{proposeRequest.description}</p>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Votre proposition</label>
                            <textarea 
                                className="w-full border rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-orange-500" 
                                placeholder="Bonjour, je suis disponible pour..."
                                value={proposalMessage}
                                onChange={(e) => setProposalMessage(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Votre tarif proposé (FCFA)</label>
                             <input type="number" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500" placeholder="Ex: 10000" />
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end gap-3">
                        <button onClick={() => setProposeRequest(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded font-medium">Annuler</button>
                        <button onClick={submitProposal} className="px-4 py-2 bg-orange-600 text-white font-bold rounded hover:bg-orange-700 shadow">Envoyer l'offre</button>
                    </div>
                </div>
            </div>
        )}

        {/* ChatBot is global */}
        {view !== 'admin' && <ChatBot />}
    </>
  );
};

export default App;
