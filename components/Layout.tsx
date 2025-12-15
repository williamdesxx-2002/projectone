
import React from 'react';
import { User, Notification } from '../types';
import { Menu, User as UserIcon, LogOut, MapPin, Shield, PlusCircle, Bell, MessageSquare } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  notifications: Notification[];
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  onClearNotifications: () => void;
  unreadMessageCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentUser, notifications, onLogout, onNavigate, currentPage, onClearNotifications, unreadMessageCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleNotifClick = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen) {
        // Optional: Mark as read immediately or via prop
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-teal-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="flex-shrink-0 font-bold text-2xl tracking-wider">
                <span className="text-orange-400">Allo</span>work
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <button onClick={() => onNavigate('home')} className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 ${currentPage === 'home' ? 'bg-teal-800' : ''}`}>Accueil</button>
                <button onClick={() => onNavigate('search')} className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 ${currentPage === 'search' ? 'bg-teal-800' : ''}`}>Trouver un service</button>
                
                <button 
                  onClick={() => onNavigate('post-request')} 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm transition-transform hover:scale-105"
                >
                  <PlusCircle size={16} />
                  Publier une demande
                </button>

                {currentUser ? (
                  <div className="flex items-center gap-4 ml-4">
                     {/* Messages Link */}
                     <button onClick={() => onNavigate('messages')} className="p-1 rounded-full hover:bg-teal-600 relative" title="Messages">
                        <MessageSquare size={20} />
                        {unreadMessageCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full border border-teal-700">
                                {unreadMessageCount}
                            </span>
                        )}
                     </button>

                     {/* Notifications */}
                     <div className="relative">
                        <button onClick={handleNotifClick} className="p-1 rounded-full hover:bg-teal-600 relative" title="Notifications">
                            <Bell size={20} />
                            {unreadNotifCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full animate-pulse border border-teal-700">
                                    {unreadNotifCount}
                                </span>
                            )}
                        </button>
                        
                        {isNotifOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200 text-gray-800">
                                <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
                                    <h3 className="font-bold text-sm">Notifications</h3>
                                    <button onClick={() => { onClearNotifications(); setIsNotifOpen(false); }} className="text-xs text-teal-600 hover:underline">Tout marquer comme lu</button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">Aucune notification</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} onClick={() => { if(n.linkTo) onNavigate(n.linkTo); setIsNotifOpen(false); }} className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-teal-50' : ''}`}>
                                                <p className="text-sm font-medium">{n.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{n.date}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                     </div>

                    {currentUser.role === 'admin' && (
                        <button onClick={() => onNavigate('admin')} className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white flex items-center gap-1">
                            <Shield size={14} /> Admin
                        </button>
                    )}
                    <button onClick={() => onNavigate('dashboard')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600">Tableau de bord</button>
                    
                    <div className="flex items-center gap-2 border-l border-teal-600 pl-4">
                        <span className="text-sm text-teal-200 max-w-[100px] truncate">{currentUser.name}</span>
                        <button onClick={onLogout} className="p-1 rounded-full hover:bg-teal-600">
                            <LogOut size={18} />
                        </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => onNavigate('login')} className="ml-4 text-white hover:text-teal-200 text-sm font-medium">Se connecter</button>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-teal-200 hover:text-white hover:bg-teal-600 focus:outline-none"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-teal-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => onNavigate('home')} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-teal-600 w-full text-left">Accueil</button>
              <button onClick={() => onNavigate('search')} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-teal-600 w-full text-left">Trouver un service</button>
              <button onClick={() => onNavigate('post-request')} className="block px-3 py-2 rounded-md text-base font-bold text-orange-400 hover:bg-teal-600 w-full text-left">Publier une demande</button>
              {currentUser ? (
                <>
                    <button onClick={() => onNavigate('messages')} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-teal-600 w-full text-left flex items-center justify-between">
                        Messagerie {unreadMessageCount > 0 && <span className="bg-blue-500 text-xs rounded-full px-2">{unreadMessageCount}</span>}
                    </button>
                    <button onClick={() => onNavigate('dashboard')} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-teal-600 w-full text-left">Tableau de bord</button>
                    <button onClick={onLogout} className="block px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-red-900 w-full text-left">Déconnexion</button>
                </>
              ) : (
                <button onClick={() => onNavigate('login')} className="block px-3 py-2 rounded-md text-base font-medium text-white bg-teal-900 w-full text-left">Connexion</button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4"><span className="text-orange-400">Allo</span>work</h3>
            <p className="text-sm">La première place de marché de services locaux au Gabon. Trouvez des professionnels de confiance ou proposez vos services à Libreville.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liens Rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('search')} className="hover:text-white">Trouver un prestataire</button></li>
              <li><button onClick={() => onNavigate('post-request')} className="hover:text-white">Publier une demande</button></li>
              <li><button onClick={() => onNavigate('login')} className="hover:text-white">S'inscrire</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <div className="flex items-center gap-2 text-sm mb-2">
                <MapPin size={16} />
                <span>Libreville, Gabon</span>
            </div>
            <p className="text-sm">support@allowork.ga</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-700 text-center text-xs">
          &copy; {new Date().getFullYear()} Allowork. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};
