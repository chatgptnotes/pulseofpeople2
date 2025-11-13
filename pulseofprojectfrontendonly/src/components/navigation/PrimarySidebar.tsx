/**
 * Primary Sidebar - Expandable navigation with hover
 * 64px collapsed, 240px expanded
 * Auto-collapses when mouse leaves
 */

import React, { useState, useRef } from 'react';
import {
  Dashboard as DashboardIcon,
  Satellite as DataIntelligenceIcon,
  TrendingUp as AnalyticsIcon,
  CompareArrows as CompetitorIcon,
  Map as MapIcon,
  WorkOutline as OperationsIcon,
  NotificationsActive as AlertsIcon,
  Settings as SettingsIcon,
  Person as UserIcon,
  Notifications as NotificationIcon,
  AdminPanelSettings as SuperAdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionContext';
import { TVKLogo } from '../TVKLogo';
import UserProfileMenu from './UserProfileMenu';
import NotificationsPanel from './NotificationsPanel';

export interface Category {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  roles?: string[]; // Which roles can see this category
}

const categories: Category[] = [
  {
    id: 'dashboard',
    label: 'Main Dashboard',
    icon: DashboardIcon,
    color: '#3B82F6', // Blue
  },
  {
    id: 'data-intelligence',
    label: 'Data Intelligence',
    icon: DataIntelligenceIcon,
    color: '#10B981', // Green
  },
  {
    id: 'analytics',
    label: 'Analytics & Insights',
    icon: AnalyticsIcon,
    color: '#8B5CF6', // Purple
  },
  {
    id: 'competitors',
    label: 'Competitor Intelligence',
    icon: CompetitorIcon,
    color: '#F59E0B', // Orange
  },
  {
    id: 'maps',
    label: 'Maps & Territory',
    icon: MapIcon,
    color: '#06B6D4', // Cyan
  },
  {
    id: 'operations',
    label: 'Campaign Operations',
    icon: OperationsIcon,
    color: '#EC4899', // Pink
  },
  {
    id: 'alerts',
    label: 'Alerts & Engagement',
    icon: AlertsIcon,
    color: '#EF4444', // Red
  },
];

const bottomCategories: Category[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    color: '#6B7280', // Gray
  },
];

interface PrimarySidebarProps {
  activeCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
  onCategoryHover?: (categoryId: string | null) => void;
  className?: string;
}

export default function PrimarySidebar({
  activeCategory,
  onCategoryClick,
  onCategoryHover,
  className = '',
}: PrimarySidebarProps) {
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  // Dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notificationsButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={`primary-sidebar ${className}`}>
      {/* Logo Section */}
      <div className="logo-section">
        <div className="w-12 h-12 flex items-center justify-center">
          <TVKLogo size={40} />
        </div>
      </div>

      {/* Main Categories */}
      <nav className="categories-section">
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onClick={() => onCategoryClick(category.id)}
            onHover={() => onCategoryHover?.(category.id)}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="bottom-section">
        {/* Settings */}
        {bottomCategories.map((category) => (
          <CategoryButton
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onClick={() => onCategoryClick(category.id)}
            onHover={() => onCategoryHover?.(category.id)}
          />
        ))}

        {/* User Profile */}
        <button
          ref={profileButtonRef}
          className="category-button with-tooltip"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          data-tooltip="User Profile"
        >
          <UserIcon sx={{ color: '#FFFFFF', fontSize: '24px' }} />
          <span className="button-tooltip">User Profile</span>
        </button>

        {/* Notifications */}
        <button
          ref={notificationsButtonRef}
          className="category-button with-tooltip relative"
          onClick={() => setShowNotifications(!showNotifications)}
          data-tooltip="Notifications"
        >
          <NotificationIcon sx={{ color: '#FFFFFF', fontSize: '24px' }} />
          <span className="notification-badge">3</span>
          <span className="button-tooltip">Notifications</span>
        </button>
      </div>

      {/* Dropdown Menus */}
      <UserProfileMenu
        isOpen={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        anchorEl={profileButtonRef.current}
      />

      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        anchorEl={notificationsButtonRef.current}
      />

      <style jsx>{`
        .primary-sidebar {
          width: 64px;
          height: 100vh;
          background: #1F2937;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-right: 1px solid #374151;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 40;
          overflow: visible;
        }

        .logo-section {
          padding: 16px 0;
          border-bottom: 1px solid #374151;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .categories-section {
          flex: 1;
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          overflow-y: visible;
        }

        .bottom-section {
          padding: 16px 0;
          border-top: 1px solid #374151;
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }

        .category-button {
          width: 48px;
          height: 48px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }

        .category-button:hover {
          background: #374151;
        }

        .category-button :global(.icon) {
          color: #FFFFFF !important;
          font-size: 24px;
          transition: color 0.2s ease;
        }

        .category-button:hover :global(.icon) {
          color: #F3F4F6 !important;
        }

        .notification-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #EF4444;
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 5px;
          border-radius: 10px;
          min-width: 16px;
          text-align: center;
        }

        /* Tooltip styling for bottom section buttons */
        .button-tooltip {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 12px;
          padding: 8px 12px;
          background: #1F2937;
          color: white;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          border-radius: 6px;
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          z-index: 10000;
        }

        .button-tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-right-color: #1F2937;
        }

        .category-button.with-tooltip:hover .button-tooltip {
          opacity: 1;
          visibility: visible;
        }
      `}</style>
    </div>
  );
}

interface CategoryButtonProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
  onHover: () => void;
}

function CategoryButton({ category, isActive, onClick, onHover }: CategoryButtonProps) {
  const Icon = category.icon;

  return (
    <>
      <button
        className={`category-button ${isActive ? 'active' : ''}`}
        onClick={onClick}
        onMouseEnter={onHover}
        style={{
          '--category-color': category.color,
        } as React.CSSProperties}
        data-tooltip={category.label}
      >
        <div className="icon-wrapper">
          <Icon
            sx={{
              color: isActive ? category.color : '#FFFFFF',
              fontSize: '24px'
            }}
          />
        </div>
        {isActive && <div className="active-indicator" />}
        <span className="tooltip">{category.label}</span>
      </button>

      <style jsx>{`
        .category-button {
          width: 48px;
          height: 48px;
          margin: 0 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }

        .category-button:hover {
          background: #374151;
        }

        .category-button.active {
          background: #374151;
        }

        .icon-wrapper {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-button :global(.icon) {
          color: #FFFFFF !important;
          font-size: 24px;
          transition: color 0.2s ease;
        }

        .category-button:hover :global(.icon),
        .category-button.active :global(.icon) {
          color: var(--category-color) !important;
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: var(--category-color);
          border-radius: 0 2px 2px 0;
        }

        /* Tooltip styling */
        .tooltip {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 12px;
          padding: 8px 12px;
          background: #1F2937;
          color: white;
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          border-radius: 6px;
          pointer-events: none;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          z-index: 10000;
        }

        .tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-right-color: #1F2937;
        }

        .category-button:hover .tooltip {
          opacity: 1;
          visibility: visible;
        }
      `}</style>
    </>
  );
}
