import React from 'react';
import { User } from '../types';
import { Menu, Search, User as UserIcon, LogOut, MapPin, Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout, onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-teal-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="flex-shrink-0 font-bold text-2xl tracking-wider">
                <span className="text-orange-400">Allo</span>word
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button onClick={() => onNavigate('home')} className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 ${currentPage === 'home' ? 'bg-teal-800' : ''}`}>Accueil</button>
                <button onClick={() => onNavigate('search')} className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600 ${currentPage === 'search' ? 'bg-teal-800' : ''}`}>Explorer</button>
                
                {currentUser ? (
                  <>
                    {currentUser.role === 'admin' && (
                        <button onClick={() => onNavigate('admin')} className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white flex items-center gap-1">
                            <Shield size={14} /> Admin
                        </button>
                    )}
                    <button onClick={() => onNavigate('dashboard')} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-teal-600">Tableau de bord</button>
                    <div className="flex items-center gap-2 ml-4">
                        <span className="text-sm text-teal-200">{currentUser.name}</span>
                        <button onClick={onLogout} className="p-1 rounded-full hover:bg-teal-600">
                            <LogOut size={18} />
                        </button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => onNavigate('login')} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium">Connexion</button>
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
              <button onClick={() => onNavigate('search')} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-teal-600 w-full text-left">Explorer</button>
              {currentUser ? (
                <>
                    <button onClick={() => onNavigate('dashboard')} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-teal-600 w-full text-left">Tableau de bord</button>
                    <button onClick={onLogout} className="block px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-red-900 w-full text-left">Déconnexion</button>
                </>
              ) : (
                <button onClick={() => onNavigate('login')} className="block px-3 py-2 rounded-md text-base font-medium text-white bg-orange-500 w-full text-left">Connexion</button>
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
            <h3 className="text-xl font-bold text-white mb-4">Alloword</h3>
            <p className="text-sm">La première place de marché de services locaux au Gabon. Trouvez des professionnels de confiance à Libreville.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liens Rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('search')} className="hover:text-white">Services</button></li>
              <li><button onClick={() => onNavigate('login')} className="hover:text-white">Devenir Prestataire</button></li>
              <li><button className="hover:text-white">Aide & Contact</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <div className="flex items-center gap-2 text-sm mb-2">
                <MapPin size={16} />
                <span>Libreville, Gabon</span>
            </div>
            <p className="text-sm">support@alloword.ga</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-700 text-center text-xs">
          &copy; {new Date().getFullYear()} Alloword. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};