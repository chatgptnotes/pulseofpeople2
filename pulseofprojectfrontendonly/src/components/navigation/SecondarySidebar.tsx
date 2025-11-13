/**
 * Secondary Sidebar - Subcategory navigation
 * 280px wide, slides in/out based on selected category
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  Close as CloseIcon,
  PushPin,
  PushPinOutlined,
} from '@mui/icons-material';
import { categoryMenuItems, MenuItem } from './menuData';

interface SecondarySidebarProps {
  activeCategory: string | null;
  isOpen: boolean;
  isPinned: boolean;
  isPrimaryExpanded: boolean;
  onClose: () => void;
  onTogglePin: () => void;
  onMouseLeave?: () => void;
  className?: string;
}

export default function SecondarySidebar({
  activeCategory,
  isOpen,
  isPinned,
  isPrimaryExpanded,
  onClose,
  onTogglePin,
  onMouseLeave,
  className = '',
}: SecondarySidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!activeCategory) return null;

  const menuItems = categoryMenuItems[activeCategory] || [];
  const categoryLabel = getCategoryLabel(activeCategory);

  const handleItemClick = (href: string) => {
    navigate(href);
    if (!isPinned) {
      // Auto-close after navigation if not pinned
      setTimeout(onClose, 150);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && !isPinned && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            left: `${isPrimaryExpanded ? 200 : 64}px`,
          }}
        />
      )}

      {/* Secondary Sidebar */}
      <div
        className={`secondary-sidebar ${isOpen ? 'open' : 'closed'} ${className}`}
        onMouseLeave={onMouseLeave}
        style={{
          left: `${isPrimaryExpanded ? 200 : 64}px`,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-in-out',
        }}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div>
            <h2 className="category-title">{categoryLabel}</h2>
            <p className="item-count">{menuItems.length} items</p>
          </div>
          <div className="header-actions">
            <button
              className="icon-button"
              onClick={onTogglePin}
              title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            >
              {isPinned ? (
                <PushPin className="text-blue-600" fontSize="small" />
              ) : (
                <PushPinOutlined fontSize="small" />
              )}
            </button>
            <button
              className="icon-button"
              onClick={onClose}
              title="Close sidebar"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="menu-items">
          {menuItems.map((item, index) => (
            <MenuItemButton
              key={`${activeCategory}-${item.href}-${index}`}
              item={item}
              isActive={location.pathname === item.href}
              onClick={() => handleItemClick(item.href)}
            />
          ))}
        </nav>

        {/* Footer tip */}
        <div className="sidebar-footer">
          <p className="footer-tip">
            💡 Tip: Click the <PushPinOutlined fontSize="inherit" /> icon to keep this sidebar open
          </p>
        </div>
      </div>

      <style jsx>{`
        .sidebar-overlay {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 39;
          animation: fadeIn 0.2s ease;
          /* left position is now set via inline styles to support dynamic primary sidebar expansion */
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .secondary-sidebar {
          width: 280px;
          height: 100vh;
          background: #F9FAFB;
          border-right: 1px solid #E5E7EB;
          position: fixed;
          top: 0;
          z-index: 40;
          display: flex;
          flex-direction: column;
          /* left position is now set via inline styles to support dynamic primary sidebar expansion */
        }

        .secondary-sidebar.closed {
          transform: translateX(-100%);
        }

        .secondary-sidebar.open {
          transform: translateX(0);
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: white;
        }

        .category-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .item-count {
          font-size: 12px;
          color: #6B7280;
          margin: 4px 0 0 0;
        }

        .header-actions {
          display: flex;
          gap: 4px;
        }

        .icon-button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          color: #6B7280;
          transition: all 0.15s ease;
        }

        .icon-button:hover {
          background: #F3F4F6;
          color: #111827;
        }

        .menu-items {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid #E5E7EB;
          background: #F3F4F6;
        }

        .footer-tip {
          font-size: 11px;
          color: #6B7280;
          margin: 0;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Scrollbar styling */
        .menu-items::-webkit-scrollbar {
          width: 6px;
        }

        .menu-items::-webkit-scrollbar-track {
          background: transparent;
        }

        .menu-items::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 3px;
        }

        .menu-items::-webkit-scrollbar-thumb:hover {
          background: #9CA3AF;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .secondary-sidebar {
            width: 100%;
            left: 0;
          }
        }
      `}</style>
    </>
  );
}

interface MenuItemButtonProps {
  item: MenuItem;
  isActive: boolean;
  onClick: () => void;
}

function MenuItemButton({ item, isActive, onClick }: MenuItemButtonProps) {
  const Icon = item.icon;

  return (
    <>
      <button
        className={`menu-item ${isActive ? 'active' : ''}`}
        onClick={onClick}
      >
        <div className="item-content">
          <Icon className="item-icon" />
          <span className="item-label">{item.name}</span>
        </div>
        {item.badge && (
          <span className="item-badge">{item.badge}</span>
        )}
        <ChevronRight className="chevron" fontSize="small" />
      </button>

      <style jsx>{`
        .menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          margin-bottom: 2px;
        }

        .menu-item:hover {
          background: #F3F4F6;
        }

        .menu-item.active {
          background: #EFF6FF;
        }

        .item-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .item-content :global(.item-icon) {
          font-size: 20px;
          color: #6B7280;
          transition: color 0.15s ease;
        }

        .menu-item:hover .item-content :global(.item-icon),
        .menu-item.active .item-content :global(.item-icon) {
          color: #2563EB;
        }

        .item-label {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
          transition: color 0.15s ease;
        }

        .menu-item:hover .item-label,
        .menu-item.active .item-label {
          color: #1F2937;
        }

        .menu-item.active .item-label {
          color: #2563EB;
          font-weight: 600;
        }

        .item-badge {
          padding: 2px 8px;
          background: #DBEAFE;
          color: #1E40AF;
          font-size: 11px;
          font-weight: 600;
          border-radius: 12px;
        }

        .menu-item :global(.chevron) {
          color: #D1D5DB;
          transition: all 0.15s ease;
          opacity: 0;
        }

        .menu-item:hover :global(.chevron),
        .menu-item.active :global(.chevron) {
          opacity: 1;
          color: #9CA3AF;
        }
      `}</style>
    </>
  );
}

function getCategoryLabel(categoryId: string): string {
  const labels: Record<string, string> = {
    'dashboard': 'Main Dashboard',
    'data-intelligence': 'Data Intelligence',
    'analytics': 'Analytics & Insights',
    'competitors': 'Competitor Intelligence',
    'maps': 'Maps & Territory',
    'operations': 'Campaign Operations',
    'alerts': 'Alerts & Engagement',
    'settings': 'Settings',
  };
  return labels[categoryId] || categoryId;
}
