import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { 
  Home, 
  PlusCircle, 
  Settings, 
  Search,
  Menu,
  X,
  BarChart3,
  Calendar,
  Tag
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  mobileOnly?: boolean;
}

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: NavItem[] = [
    { id: 'home', label: '首页', icon: <Home className="h-5 w-5" />, path: '/' },
    { id: 'new', label: '新建', icon: <PlusCircle className="h-5 w-5" />, path: '/new', mobileOnly: true },
    { id: 'stats', label: '统计', icon: <BarChart3 className="h-5 w-5" />, path: '/stats' },
    { id: 'calendar', label: '日历', icon: <Calendar className="h-5 w-5" />, path: '/calendar' },
    { id: 'tags', label: '标签', icon: <Tag className="h-5 w-5" />, path: '/tags' },
    { id: 'settings', label: '设置', icon: <Settings className="h-5 w-5" />, path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  // Desktop Navigation
  const DesktopNav = () => (
    <nav className="hidden md:flex items-center space-x-1">
      {navItems.filter(item => !item.mobileOnly).map((item) => (
        <button
          key={item.id}
          onClick={() => handleNavClick(item.path)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "hover:bg-white/20 dark:hover:bg-gray-800/20",
            isActive(item.path)
              ? "bg-white/30 dark:bg-gray-800/30 text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );

  // Mobile Navigation - Bottom Bar
  const MobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.path)}
            className={cn(
              "flex flex-col items-center gap-1 py-2 px-3 rounded-lg",
              "transition-colors",
              isActive(item.path)
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Mobile Navigation - Side Menu
  const MobileSideMenu = () => (
    <div className={cn(
      "md:hidden fixed inset-0 z-50 transition-transform duration-300",
      isMenuOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
      <div className="relative w-64 h-full bg-white dark:bg-gray-900 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">菜单</h2>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left",
                "transition-colors",
                isActive(item.path)
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <header className={cn(
        "sticky top-0 z-40 transition-all duration-200",
        isScrolled 
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm" 
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">洞</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                树洞空间
              </span>
            </div>

            {/* Desktop Navigation */}
            <DesktopNav />

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => navigate('/search')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/search')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => navigate('/new')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                新建记录
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileBottomNav />
      <MobileSideMenu />
    </>
  );
};