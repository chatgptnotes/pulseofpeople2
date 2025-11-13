import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on landing page or login
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  const breadcrumbMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'analytics': 'Analytics',
    'reports': 'Reports',
    'voter-database': 'Voter Database',
    'field-workers': 'Field Workers',
    'field-worker-management': 'Field Worker Management',
    'tamil-nadu-map': 'Tamil Nadu Map',
    'regional-map': 'Regional Map',
    'superadmin': 'Super Admin',
    'admin': 'Admin',
    'manager': 'Manager',
    'analyst': 'Analyst',
    'user': 'User',
    'volunteer': 'Volunteer',
    'viewer': 'Viewer',
    'settings': 'Settings',
    'alerts': 'Alerts',
    'social-media': 'Social Media',
    'competitor-analysis': 'Competitor Analysis',
    'ai-insights': 'AI Insights',
    'press-media': 'Press & Media',
    'conversation-bot': 'Conversation Bot',
    'subscription': 'Subscription',
    'user-management': 'User Management',
    'tenants': 'Tenant Registry',
    'admins': 'Admin Management',
    'billing': 'Billing',
    'super-admin': 'Super Admin',
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4 py-2">
      <Link
        to="/dashboard/legacy"
        className="hover:text-gray-900 flex items-center transition-colors"
        title="Go to Dashboard"
      >
        <Home className="w-4 h-4" />
      </Link>

      {paths.map((path, index) => {
        const to = '/' + paths.slice(0, index + 1).join('/');
        const label = breadcrumbMap[path] || path.split('-').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        const isLast = index === paths.length - 1;

        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{label}</span>
            ) : (
              <Link to={to} className="hover:text-gray-900 transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
