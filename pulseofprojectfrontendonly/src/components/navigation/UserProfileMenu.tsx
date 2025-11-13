/**
 * User Profile Dropdown Menu
 * Shows user info, settings link, and logout button
 */

import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

export default function UserProfileMenu({ isOpen, onClose, anchorEl }: UserProfileMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

  if (!isOpen || !user) return null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
    onClose();
  };

  // Get role badge color - Using TVK brand colors
  const getRoleBadgeColor = () => {
    switch (user.role) {
      case 'admin':
      case 'superadmin':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'manager':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'analyst':
        return 'bg-red-50 text-red-600 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <>
      <div
        ref={menuRef}
        className="user-profile-menu"
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '352px', // 64px (primary) + 280px (secondary) + 8px (gap)
          zIndex: 1000
        }}
      >
        {/* User Info Section */}
        <div className="menu-header">
          <div className="user-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
            <span className={`role-badge ${getRoleBadgeColor()}`}>
              {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </span>
          </div>
        </div>

        <div className="menu-divider"></div>

        {/* Menu Items */}
        <div className="menu-items">
          <button className="menu-item" onClick={handleSettings}>
            <SettingsIcon sx={{ fontSize: '18px' }} />
            <span>Settings</span>
          </button>

          {user.constituency && (
            <div className="menu-item-info">
              <ProfileIcon sx={{ fontSize: '18px' }} />
              <span>{user.constituency}</span>
            </div>
          )}

          {(user.role === 'admin' || user.role === 'superadmin') && (
            <button className="menu-item" onClick={() => { navigate('/admin'); onClose(); }}>
              <AdminIcon sx={{ fontSize: '18px' }} />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        <div className="menu-divider"></div>

        {/* Logout Button */}
        <button className="menu-item logout-item" onClick={handleLogout}>
          <LogoutIcon sx={{ fontSize: '18px' }} />
          <span>Logout</span>
        </button>
      </div>

      <style jsx>{`
        .user-profile-menu {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          min-width: 280px;
          animation: slideIn 0.2s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .menu-header {
          padding: 16px;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #DC2626 0%, #EAB308 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 15px;
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 13px;
          color: #6B7280;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .role-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .menu-divider {
          height: 1px;
          background: #E5E7EB;
          margin: 0;
        }

        .menu-items {
          padding: 8px;
        }

        .menu-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
        }

        .menu-item:hover {
          background: #F3F4F6;
        }

        .menu-item-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          color: #6B7280;
          font-size: 14px;
        }

        .logout-item {
          color: #DC2626;
          margin: 8px;
        }

        .logout-item:hover {
          background: #FEE2E2;
        }
      `}</style>
    </>
  );
}
