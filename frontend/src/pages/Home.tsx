import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Poll } from '../types';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      const data = await api.getPolls();
      setPolls(data);
    } catch (err) {
      console.error('Failed to load polls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h1 style={styles.logo}>VoteBlock</h1>

        <div style={styles.userInfo}>
          <p style={styles.userName}>{user?.username}</p>
        </div>

        <nav style={styles.nav}>
          <Link to="/" style={styles.navItemActive}>Home</Link>
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Polls</h1>
          </div>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading polls...</div>
        ) : polls.length === 0 ? (
          <div style={styles.empty}>
            <p>No polls available yet.</p>
          </div>
        ) : (
          <div style={styles.pollsList}>
            {polls.map((poll) => (
              <Link to={`/poll/${poll.id}`} key={poll.id} style={styles.pollCard}>
                <div style={styles.pollTop}>
                  <h3 style={styles.pollTitle}>{poll.title}</h3>
                  <span style={{
                    ...styles.pollStatus,
                    color: poll.is_open ? '#059669' : '#dc2626',
                  }}>
                    {poll.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>
                {poll.description && <p style={styles.pollDesc}>{poll.description}</p>}
                <p style={styles.pollMeta}>{poll.total_votes} votes</p>
              </Link>
            ))}
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
  },
  sidebar: {
    width: '220px',
    background: 'white',
    padding: '24px',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  logo: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1f2937',
    margin: '0 0 32px 0',
  },
  userInfo: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
  },
  userName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    margin: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
  },
  navItem: {
    padding: '10px 12px',
    borderRadius: '6px',
    color: '#4b5563',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
  navItemActive: {
    padding: '10px 12px',
    borderRadius: '6px',
    background: '#3b82f6',
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
  },
  logoutBtn: {
    padding: '10px 12px',
    borderRadius: '6px',
    background: 'transparent',
    color: '#dc2626',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
  },
  main: {
    flex: 1,
    padding: '32px',
    maxWidth: '900px',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1f2937',
    margin: 0,
  },
  createBtn: {
    padding: '10px 16px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  loading: {
    color: '#6b7280',
    fontSize: '14px',
  },
  empty: {
    background: 'white',
    padding: '40px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  pollsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  pollCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    textDecoration: 'none',
  },
  pollTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '8px',
  },
  pollTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1f2937',
    margin: 0,
  },
  pollStatus: {
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  pollDesc: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 12px 0',
  },
  pollMeta: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
};
