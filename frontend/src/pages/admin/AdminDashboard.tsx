import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { AdminStats } from '../../types';

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dayKey: number) => {
    const date = new Date(dayKey * 86400000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Sidebar user={user} currentPage="dashboard" onLogout={handleLogout} />
        <div style={styles.main}>
          <p style={styles.loading}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const maxDailyVotes = stats ? Math.max(...stats.dailyVotes.map(d => d.count), 1) : 1;
  const totalDistribution = stats ? stats.pollStatusDistribution.open + stats.pollStatusDistribution.closed : 1;
  const openPct = stats && totalDistribution > 0 ? (stats.pollStatusDistribution.open / totalDistribution) * 100 : 0;

  return (
    <div style={styles.container}>
      <Sidebar user={user} currentPage="dashboard" onLogout={handleLogout} />

      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Dashboard</h1>
          <p style={styles.subtitle}>Overview of your voting platform</p>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderLeftColor: '#3b82f6' }}>
            <div style={styles.statLabel}>Total Users</div>
            <div style={styles.statValue}>{stats?.totalUsers ?? 0}</div>
            <div style={styles.statSub}>+{stats?.newUsersThisWeek ?? 0} this week</div>
          </div>
          <div style={{ ...styles.statCard, borderLeftColor: '#7c3aed' }}>
            <div style={styles.statLabel}>Total Polls</div>
            <div style={styles.statValue}>{stats?.totalPolls ?? 0}</div>
            <div style={styles.statSub}>{stats?.activePolls ?? 0} active</div>
          </div>
          <div style={{ ...styles.statCard, borderLeftColor: '#059669' }}>
            <div style={styles.statLabel}>Total Votes</div>
            <div style={styles.statValue}>{stats?.totalVotes ?? 0}</div>
            <div style={styles.statSub}>+{stats?.votesToday ?? 0} today</div>
          </div>
          <div style={{ ...styles.statCard, borderLeftColor: '#f59e0b' }}>
            <div style={styles.statLabel}>Active Polls</div>
            <div style={styles.statValue}>{stats?.activePolls ?? 0}</div>
            <div style={styles.statSub}>accepting votes</div>
          </div>
        </div>

        {/* Charts */}
        <div style={styles.chartsRow}>
          {/* Voting Activity Bar Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Voting Activity (Last 7 Days)</h3>
            <div style={styles.barChart}>
              {(stats?.dailyVotes ?? []).slice(-7).map((day, i) => (
                <div key={i} style={styles.barCol}>
                  <div style={styles.barValue}>{day.count}</div>
                  <div style={{
                    ...styles.bar,
                    height: `${(day.count / maxDailyVotes) * 140}px`,
                  }} />
                  <div style={styles.barLabel}>{formatDate(day.day_key)}</div>
                </div>
              ))}
              {(!stats?.dailyVotes || stats.dailyVotes.length === 0) && (
                <p style={styles.emptyChart}>No voting activity yet</p>
              )}
            </div>
          </div>

          {/* Poll Status Distribution */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Poll Status Distribution</h3>
            <div style={styles.donutContainer}>
              <div style={{
                ...styles.donut,
                background: totalDistribution > 0
                  ? `conic-gradient(#059669 0% ${openPct}%, #94a3b8 ${openPct}% 100%)`
                  : '#e2e8f0',
              }}>
                <div style={styles.donutHole}>
                  <span style={styles.donutTotal}>{stats?.totalPolls ?? 0}</span>
                  <span style={styles.donutLabel}>Total</span>
                </div>
              </div>
              <div style={styles.legend}>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: '#059669' }} />
                  <span>Open ({stats?.pollStatusDistribution.open ?? 0})</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, backgroundColor: '#94a3b8' }} />
                  <span>Closed ({stats?.pollStatusDistribution.closed ?? 0})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared Sidebar component for admin pages
export function Sidebar({ user, currentPage, onLogout }: {
  user: any;
  currentPage: string;
  onLogout: () => void;
}) {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', path: '/admin' },
    { key: 'polls', label: 'Polls', path: '/admin/polls' },
    { key: 'users', label: 'Users', path: '/admin/users' },
    { key: 'reports', label: 'Reports', path: '/admin/reports' },
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoSection}>
        <h1 style={styles.logo}>VoteBlock</h1>
        <span style={styles.adminBadge}>Admin</span>
      </div>

      <div style={styles.userInfo}>
        <div style={styles.avatar}>
          {user?.username?.charAt(0).toUpperCase() ?? 'A'}
        </div>
        <p style={styles.userName}>{user?.username}</p>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            style={currentPage === item.key ? styles.navItemActive : styles.navItem}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={styles.sidebarBottom}>
        <Link to="/" style={styles.navItem}>Back to App</Link>
        <button onClick={onLogout} style={styles.logoutBtn}>
          Logout
        </button>
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
  sidebar: {
    width: '250px',
    background: '#1e293b',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column' as const,
    flexShrink: 0,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: '1px solid #334155',
  },
  logo: {
    fontSize: '22px',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  adminBadge: {
    fontSize: '10px',
    fontWeight: 700,
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2px 8px',
    borderRadius: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid #334155',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '14px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#cbd5e1',
    margin: 0,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
  },
  navItem: {
    padding: '10px 14px',
    borderRadius: '8px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  navItemActive: {
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
  },
  sidebarBottom: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    borderTop: '1px solid #334155',
    paddingTop: '16px',
  },
  logoutBtn: {
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'transparent',
    color: '#ef4444',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  main: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto' as const,
  },
  header: {
    marginBottom: '28px',
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
  loading: {
    color: '#6b7280',
    fontSize: '14px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    borderLeft: '4px solid',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  statLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#64748b',
    marginBottom: '6px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#1e293b',
    lineHeight: 1.1,
    marginBottom: '4px',
  },
  statSub: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  chartCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 20px 0',
  },
  barChart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    height: '200px',
    padding: '0 8px',
  },
  barCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '6px',
  },
  barValue: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748b',
  },
  bar: {
    width: '100%',
    maxWidth: '40px',
    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '4px 4px 0 0',
    minHeight: '4px',
    transition: 'height 0.3s ease',
  },
  barLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: 500,
  },
  emptyChart: {
    color: '#94a3b8',
    fontSize: '14px',
    textAlign: 'center' as const,
    width: '100%',
    paddingTop: '60px',
  },
  donutContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '32px',
    padding: '20px 0',
  },
  donut: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutHole: {
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    background: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTotal: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#1e293b',
  },
  donutLabel: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  legend: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#475569',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
  },
};
