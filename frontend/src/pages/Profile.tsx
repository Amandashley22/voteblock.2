import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function Profile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [updateMessage, setUpdateMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile();
      setUsername(data.username);
      setEmail(data.email);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateMessage(null);
    try {
      await api.updateProfile({ username, email });
      localStorage.setItem('user', JSON.stringify({ id: user?.id, username }));
      setUpdateMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err: any) {
      setUpdateMessage({ text: err.response?.data?.error || 'Failed to update profile', type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordMessage({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMessage({ text: err.response?.data?.error || 'Failed to change password', type: 'error' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>🗳️</span>
            <h1 style={styles.logoText}>VoteBlock</h1>
          </Link>
        </div>

        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user?.username}</p>
            <p style={styles.userEmail}>Signed in</p>
          </div>
        </div>

        <nav style={styles.nav}>
          <Link to="/" style={styles.navItem}>
            <span style={styles.navIcon}>🏠</span>
            Home
          </Link>
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <span style={styles.navIcon}>🚪</span>
          Logout
        </button>
      </div>

      <div style={styles.main}>
        <div style={styles.backLink}>
          <Link to="/" style={styles.backBtn}>← Back to polls</Link>
        </div>

        <h1 style={styles.pageTitle}>Account Settings</h1>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Profile Information</h2>
            <form onSubmit={handleUpdateProfile} style={styles.form}>
              {updateMessage && (
                <div style={{
                  ...styles.message,
                  background: updateMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                  borderColor: updateMessage.type === 'success' ? '#86efac' : '#fca5a5',
                  color: updateMessage.type === 'success' ? '#166534' : '#991b1b',
                }}>
                  {updateMessage.text}
                </div>
              )}
              <div style={styles.field}>
                <label style={styles.label}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              <button type="submit" style={styles.button}>
                Save Changes
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Change Password</h2>
            <form onSubmit={handleChangePassword} style={styles.form}>
              {passwordMessage && (
                <div style={{
                  ...styles.message,
                  background: passwordMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                  borderColor: passwordMessage.type === 'success' ? '#86efac' : '#fca5a5',
                  color: passwordMessage.type === 'success' ? '#166534' : '#991b1b',
                }}>
                  {passwordMessage.text}
                </div>
              )}
              <div style={styles.field}>
                <label style={styles.label}>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  style={styles.input}
                />
                <p style={styles.hint}>Must be at least 8 characters</p>
              </div>
              <button type="submit" style={styles.button}>
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '280px',
    background: 'white',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    borderRight: '1px solid #e2e8f0',
  },
  sidebarHeader: {
    marginBottom: '32px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: '32px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '16px',
    marginBottom: '24px',
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '20px',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  userEmail: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '12px',
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
    transition: 'all 0.2s',
  },
  navItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '12px',
    color: '#667eea',
    background: '#f0f4ff',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
  },
  navIcon: {
    fontSize: '20px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '12px',
    color: '#ef4444',
    background: 'transparent',
    border: 'none',
    fontWeight: '600',
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
  },
  backLink: {
    marginBottom: '24px',
  },
  backBtn: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f8fafc',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#64748b',
    fontWeight: '600',
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 32px 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'white',
    padding: '36px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 28px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  message: {
    padding: '14px 16px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    border: '2px solid',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    transition: 'all 0.2s',
  },
  hint: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: '4px 0 0 0',
  },
  button: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px',
  },
};
