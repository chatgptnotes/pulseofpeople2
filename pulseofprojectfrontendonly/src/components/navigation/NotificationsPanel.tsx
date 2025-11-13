/**
 * Notifications Dropdown Panel
 * Shows recent notifications with mark as read functionality
 */

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as TrendingIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'alert';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Data Upload Complete',
    message: 'Your polling booth data has been successfully uploaded',
    time: '5 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'alert',
    title: 'New Sentiment Alert',
    message: 'Negative sentiment detected in Chennai Central constituency',
    time: '1 hour ago',
    read: false,
    link: '/analytics-dashboard',
  },
  {
    id: '3',
    type: 'info',
    title: 'System Update',
    message: 'Platform maintenance scheduled for tonight at 2 AM',
    time: '3 hours ago',
    read: false,
  },
  {
    id: '4',
    type: 'success',
    title: 'Report Generated',
    message: 'Your weekly analytics report is ready to download',
    time: '1 day ago',
    read: true,
    link: '/reports',
  },
  {
    id: '5',
    type: 'warning',
    title: 'Low Data Coverage',
    message: 'Voter data coverage below 80% in 3 constituencies',
    time: '2 days ago',
    read: true,
    link: '/voter-database',
  },
];

export default function NotificationsPanel({ isOpen, onClose, anchorEl }: NotificationsPanelProps) {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorEl]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckIcon sx={{ fontSize: '20px', color: '#10B981' }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: '20px', color: '#F59E0B' }} />;
      case 'alert':
        return <TrendingIcon sx={{ fontSize: '20px', color: '#EF4444' }} />;
      default:
        return <InfoIcon sx={{ fontSize: '20px', color: '#3B82F6' }} />;
    }
  };

  return (
    <>
      <div
        ref={panelRef}
        className="notifications-panel"
        style={{
          position: 'fixed',
          bottom: '140px',
          left: '352px', // 64px (primary) + 280px (secondary) + 8px (gap)
          zIndex: 1000
        }}
      >
        {/* Header */}
        <div className="panel-header">
          <div>
            <h3 className="header-title">Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} new</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        <div className="panel-divider"></div>

        {/* Notifications List */}
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <InfoIcon sx={{ fontSize: '48px', color: '#D1D5DB' }} />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.link ? 'clickable' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {getIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{notification.time}</div>
                </div>
                {!notification.read && <div className="unread-dot"></div>}
              </div>
            ))
          )}
        </div>

        <div className="panel-divider"></div>

        {/* Footer */}
        <div className="panel-footer">
          <button className="footer-btn" onClick={() => { navigate('/alerts'); onClose(); }}>
            <SettingsIcon sx={{ fontSize: '16px' }} />
            <span>Notification Settings</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .notifications-panel {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          width: 380px;
          max-height: 600px;
          display: flex;
          flex-direction: column;
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

        .panel-header {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title {
          font-size: 16px;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 4px 0;
        }

        .unread-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #FEF2F2;
          color: #DC2626;
          font-size: 11px;
          font-weight: 600;
          border-radius: 12px;
        }

        .mark-all-btn {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid #E5E7EB;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mark-all-btn:hover {
          background: #F3F4F6;
          border-color: #D1D5DB;
        }

        .panel-divider {
          height: 1px;
          background: #E5E7EB;
        }

        .notifications-list {
          flex: 1;
          overflow-y: auto;
          max-height: 450px;
        }

        .notifications-list::-webkit-scrollbar {
          width: 6px;
        }

        .notifications-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .notifications-list::-webkit-scrollbar-thumb {
          background: #D1D5DB;
          border-radius: 3px;
        }

        .notification-item {
          padding: 14px 16px;
          display: flex;
          gap: 12px;
          position: relative;
          transition: background 0.15s ease;
          border-bottom: 1px solid #F3F4F6;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-item.clickable {
          cursor: pointer;
        }

        .notification-item.clickable:hover {
          background: #F9FAFB;
        }

        .notification-item.unread {
          background: linear-gradient(to right, #FEF2F2, #FEFCE8);
        }

        .notification-item.read {
          opacity: 0.7;
        }

        .notification-icon {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #F3F4F6;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-size: 14px;
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 4px;
        }

        .notification-message {
          font-size: 13px;
          color: #6B7280;
          line-height: 1.4;
          margin-bottom: 6px;
        }

        .notification-time {
          font-size: 12px;
          color: #9CA3AF;
        }

        .unread-dot {
          position: absolute;
          top: 20px;
          right: 16px;
          width: 8px;
          height: 8px;
          background: #DC2626;
          border-radius: 50%;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #9CA3AF;
        }

        .empty-state p {
          margin-top: 12px;
          font-size: 14px;
        }

        .panel-footer {
          padding: 12px 16px;
        }

        .footer-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: transparent;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .footer-btn:hover {
          background: #F3F4F6;
          border-color: #D1D5DB;
        }
      `}</style>
    </>
  );
}
