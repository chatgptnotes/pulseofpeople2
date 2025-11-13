import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Home,
  BarChart3,
  Users,
  MessageSquare,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  Globe,
  Shield,
  Zap
} from 'lucide-react';

interface MobileNavItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  badge?: number;
  children?: MobileNavItem[];
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

// Mobile Navigation Component
export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const navItems: MobileNavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: '/'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      href: '/dashboard/legacy',
      children: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
        { id: 'pulse', label: 'Pulse Monitor', icon: Zap, href: '/pulse' },
        { id: 'heatmap', label: 'Heat Maps', icon: Globe, href: '/heatmap' }
      ]
    },
    {
      id: 'features',
      label: 'Features',
      icon: Users,
      href: '/features',
      children: [
        { id: 'manifesto', label: 'Manifesto Match', icon: Shield, href: '/manifesto' },
        { id: 'constituency', label: 'My Constituency', icon: Users, href: '/constituency' },
        { id: 'feedback', label: 'Feedback', icon: MessageSquare, href: '/feedback' }
      ]
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      href: '/alerts',
      badge: 3
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings'
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white rounded-md shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Navigation Sidebar */}
      <div className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Pulse of People
              </div>
              <div className="text-xs text-gray-600">by Animal-I</div>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 h-full overflow-y-auto pb-20">
          {navItems.map((item) => (
            <div key={item.id}>
              {item.children ? (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight className={`h-4 w-4 transform transition-transform ${
                    expandedItem === item.id ? 'rotate-90' : ''
                  }`} />
                </button>
              ) : (
                <a
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </a>
              )}
              
              {item.children && expandedItem === item.id && (
                <div className="ml-8 space-y-1 mt-2">
                  {item.children.map((child) => (
                    <a
                      key={child.id}
                      href={child.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <child.icon className="h-4 w-4" />
                      <span className="text-sm">{child.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}

// Responsive Container
export function ResponsiveContainer({ children, className = '' }: ResponsiveContainerProps) {
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}

// Mobile-Optimized Card Component
export function MobileCard({ children, className = '', padding = 'default' }: {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'small' | 'default' | 'large';
}) {
  const paddingClasses = {
    none: '',
    small: 'p-3',
    default: 'p-4 sm:p-6',
    large: 'p-6 sm:p-8'
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

// Mobile-Responsive Grid
export function ResponsiveGrid({ children, cols = { sm: 1, md: 2, lg: 3 }, gap = 'default' }: {
  children: React.ReactNode;
  cols?: { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'none' | 'small' | 'default' | 'large';
}) {
  const gapClasses = {
    none: 'gap-0',
    small: 'gap-2',
    default: 'gap-4',
    large: 'gap-6'
  };

  const getColsClass = () => {
    let classes = 'grid ';
    if (cols.sm) classes += `grid-cols-${cols.sm} `;
    if (cols.md) classes += `md:grid-cols-${cols.md} `;
    if (cols.lg) classes += `lg:grid-cols-${cols.lg} `;
    if (cols.xl) classes += `xl:grid-cols-${cols.xl} `;
    return classes + gapClasses[gap];
  };

  return (
    <div className={getColsClass()}>
      {children}
    </div>
  );
}

// Mobile-Optimized Button
export function MobileButton({ 
  children, 
  variant = 'primary', 
  size = 'default',
  fullWidth = false,
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'default' | 'large';
  fullWidth?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  };

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    default: 'px-4 py-2 text-sm sm:text-base',
    large: 'px-6 py-3 text-base sm:text-lg'
  };

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Mobile Touch-Friendly Tab Navigation
export function MobileTabs({ tabs, activeTab, onChange }: {
  tabs: Array<{ key: string; label: string; icon?: any; badge?: number }>;
  activeTab: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap min-w-max ${
              activeTab === tab.key
                ? 'border-purple-500 text-purple-600 bg-purple-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon && <tab.icon className="h-4 w-4" />}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Mobile-Optimized Stats Grid
export function MobileStats({ stats }: {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: any;
    color?: string;
    trend?: { direction: 'up' | 'down'; value: string };
  }>;
}) {
  return (
    <ResponsiveGrid cols={{ sm: 2, lg: 4 }}>
      {stats.map((stat, index) => (
        <MobileCard key={index} padding="small">
          <div className="flex items-center space-x-3">
            {stat.icon && (
              <div className={`p-2 rounded-lg ${stat.color || 'bg-blue-100'}`}>
                <stat.icon className={`h-5 w-5 ${stat.color?.replace('bg-', 'text-').replace('-100', '-600') || 'text-blue-600'}`} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 truncate">
                {stat.label}
              </div>
              {stat.trend && (
                <div className={`text-xs ${stat.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend.direction === 'up' ? '↗' : '↘'} {stat.trend.value}
                </div>
              )}
            </div>
          </div>
        </MobileCard>
      ))}
    </ResponsiveGrid>
  );
}

// Mobile Contact Bar
export function MobileContactBar() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      {isVisible && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 z-40">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium">Need Help? Contact us!</div>
              <div className="text-xs opacity-90">Animal-i Initiative • Dubai HQ</div>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="tel:+971547148580"
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                title="Call Dubai Sales"
              >
                <Phone className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@pulseofpeople.com"
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
                title="Email Sales"
              >
                <Mail className="h-4 w-4" />
              </a>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Responsive Breakpoint Hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else setBreakpoint('xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

// Mobile-Optimized Search Bar
export function MobileSearchBar({ placeholder = "Search...", onSearch }: {
  placeholder?: string;
  onSearch?: (query: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <div className={`flex items-center transition-all duration-300 ${
        isExpanded ? 'w-full' : 'w-10'
      } sm:w-full`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => !query && setIsExpanded(false)}
            placeholder={placeholder}
            className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              !isExpanded ? 'sm:block hidden' : ''
            }`}
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="sm:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default {
  MobileNavigation,
  ResponsiveContainer,
  MobileCard,
  ResponsiveGrid,
  MobileButton,
  MobileTabs,
  MobileStats,
  MobileContactBar,
  MobileSearchBar,
  useBreakpoint
};