import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './AdminDashboard';
import type { AdminUser } from '../../types';

const AVATAR_COLORS = ['#3b82f6', '#7c3aed', '#059669', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This will also delete all their polls and votes.`)) return;
    try {
      await api.deleteUser(id);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  };

  return (
    <div style={styles.container}>
      <Sidebar user={user} currentPage="users" onLogout={handleLogout} />

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>User Management</h1>
            <p style={styles.subtitle}>{users.length} registered users</p>
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {loading ? (
          <p style={styles.loadingText}>Loading users...</p>
        ) : (
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Polls Created</th>
                  <th style={styles.th}>Registered</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={{
                          ...styles.avatar,
                          backgroundColor: getAvatarColor(u.username),
                        }}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={styles.username}>{u.username}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={u.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}>
                        {u.role}
                      </span>
                    </td>
                    <td style={styles.td}>{u.pollsCreated}</td>
                    <td style={styles.td}>{formatDate(u.createdAt)}</td>
                    <td style={styles.td}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(u.id, u.username)}
                          style={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={styles.emptyRow}>
                      {search ? 'No users match your search' : 'No users yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={styles.tableFooter}>
              Showing {filtered.length} of {users.length} users
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
  },
  main: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
    gap: '16px',
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#1e293b',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  searchInput: {
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    width: '220px',
    background: 'white',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '14px',
  },
  tableCard: {
    background: 'white',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '14px 16px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e2e8f0',
    background: '#f8fafc',
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
  rowEven: { background: 'white' },
  rowOdd: { background: '#fafbfc' },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '13px',
    flexShrink: 0,
  },
  username: {
    fontWeight: 600,
    color: '#1e293b',
  },
  badgeAdmin: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  badgeUser: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    background: '#f1f5f9',
    color: '#64748b',
  },
  deleteBtn: {
    padding: '5px 12px',
    borderRadius: '6px',
    border: '1px solid #fca5a5',
    background: '#fef2f2',
    color: '#dc2626',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  emptyRow: {
    textAlign: 'center' as const,
    padding: '40px 16px',
    color: '#94a3b8',
    fontSize: '14px',
  },
  tableFooter: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#94a3b8',
    borderTop: '1px solid #f1f5f9',
  },
};
