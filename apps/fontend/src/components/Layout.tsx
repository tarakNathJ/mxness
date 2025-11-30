import React from 'react';
import { LayoutDashboard, TrendingUp, Wallet, ArrowLeftRight, Settings, Sun, Moon, LogOut, Menu, X  ,Home} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate()
  
  const navigation = [
    { name: 'Home', icon: Home, page: '/' },
    { name: 'Dashboard', icon: LayoutDashboard, page: '/dashboard' },
    { name: 'Markets', icon: TrendingUp, page: '/markets' },
    { name: 'Portfolio', icon: Wallet, page: '/portfolio' },
    { name: 'Trade', icon: ArrowLeftRight, page: '/trade' },
    
  ];
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D1117] transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl text-slate-900 dark:text-white">TradePro</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navigation.map((item) => (
                <button
                  key={item.page}
                  onClick={() => navigate(item.page)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    currentPage === item.page
                      ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={() => onNavigate('login')}
                className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 p-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.page}
                onClick={() => {
                 navigate("/login")
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentPage === item.page
                    ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name} dd</span>
              </button>
            ))}
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
