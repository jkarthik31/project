import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const NotificationBell = () => {
  const { isLoggedIn } = useAuth();
  const { getNotifications, markNotificationRead, markAllNotificationsRead } = useData();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    const { notifications: notifs, unread_count } = await getNotifications();
    setNotifications(notifs);
    setUnreadCount(unread_count);
  }, [isLoggedIn]);

  // Initial load + polling every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = async () => {
    setOpen(o => !o);
    if (!open) {
      setLoading(true);
      await fetchNotifications();
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const typeIcon = {
    new_job: '💼',
    status_update: '📋',
    deadline_reminder: '⏰',
    general: '🔔',
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (!isLoggedIn) return null;

  return (
    <div className="notif-bell-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="notif-bell-btn"
        aria-label="Notifications"
        style={{
          position: 'relative',
          background: 'transparent',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          transition: 'all 0.2s ease',
          color: 'var(--text-secondary)',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: 'var(--danger)',
            color: '#fff',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--bg-white)',
            animation: 'notif-pulse 2s infinite',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="notif-dropdown" style={{
          position: 'absolute',
          top: '48px',
          right: 0,
          width: '360px',
          maxHeight: '480px',
          overflowY: 'auto',
          background: 'var(--bg-white)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 9999,
          animation: 'notif-slide-in 0.2s ease',
        }}>
          {/* Header */}
          <div style={{
            padding: 'var(--spacing-md) var(--spacing-lg)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            background: 'var(--bg-white)',
            zIndex: 1,
          }}>
            <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: 'var(--font-size-base)' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: '8px',
                  background: 'var(--danger)',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '1px 7px',
                  fontSize: '11px',
                }}>
                  {unreadCount} new
                </span>
              )}
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--secondary)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: 'var(--border-radius)',
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          {loading ? (
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎉</div>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>You're all caught up!</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  borderBottom: '1px solid var(--border-color-light)',
                  background: n.is_read ? 'transparent' : 'rgba(37, 99, 235, 0.04)',
                  cursor: n.is_read ? 'default' : 'pointer',
                  display: 'flex',
                  gap: 'var(--spacing-sm)',
                  alignItems: 'flex-start',
                  transition: 'background 0.15s ease',
                }}
              >
                <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>
                  {typeIcon[n.type] || '🔔'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: n.is_read ? 500 : 700,
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                    marginBottom: '3px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {n.title}
                  </div>
                  <div style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4,
                    marginBottom: '4px',
                  }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {timeAgo(n.created_at)}
                  </div>
                </div>
                {!n.is_read && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--secondary)',
                    flexShrink: 0,
                    marginTop: '6px',
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
