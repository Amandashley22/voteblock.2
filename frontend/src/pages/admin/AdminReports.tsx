import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './AdminDashboard';
import type { AdminReports as AdminReportsType } from '../../types';

export function AdminReports() {
  const [reports, setReports] = useState<AdminReportsType | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await api.getAdminReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const formatDate = (dayKey: number) => {
    const date = new Date(dayKey * 86400000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const maxDailyVotes = reports ? Math.max(...reports.votesPerDay.map(d => d.count), 1) : 1;
  const maxPollVotes = reports ? Math.max(...reports.topPolls.map(p => p.total_votes), 1) : 1;

  return (
    <div style={styles.container}>
      <Sidebar user={user} currentPage="reports" onLogout={handleLogout} />

      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Reports & Analytics</h1>
          <p style={styles.subtitle}>Platform performance metrics</p>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Loading reports...</p>
        ) : (
          <>
            {/* Quick Stats */}
            <div style={styles.quickStats}>
              <div style={styles.quickStatCard}>
                <div style={styles.quickStatValue}>{reports?.avgVotesPerPoll ?? 0}</div>
                <div style={styles.quickStatLabel}>Avg Votes / Poll</div>
              </div>
              <div style={styles.quickStatCard}>
                <div style={styles.quickStatValue}>{reports?.totalVotesCast ?? 0}</div>
                <div style={styles.quickStatLabel}>Total Votes Cast</div>
              </div>
              <div style={styles.quickStatCard}>
                <div style={styles.quickStatValue}>{reports?.totalRegisteredUsers ?? 0}</div>
                <div style={styles.quickStatLabel}>Registered Users</div>
              </div>
            </div>

            {/* Voting Activity Over Time */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Voting Activity (Last 14 Days)</h3>
              <div style={styles.barChart}>
                {(reports?.votesPerDay ?? []).map((day, i) => (
                  <div key={i} style={styles.barCol}>
                    <div style={styles.barValue}>{day.count}</div>
                    <div style={{
                      ...styles.bar,
                      height: `${(day.count / maxDailyVotes) * 160}px`,
                    }} />
                    <div style={styles.barLabel}>{formatDate(day.day_key)}</div>
                  </div>
                ))}
                {(!reports?.votesPerDay || reports.votesPerDay.length === 0) && (
                  <p style={styles.emptyChart}>No voting activity yet</p>
                )}
              </div>
            </div>

            {/* Top Polls */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Top Polls by Participation</h3>
              <div style={styles.hBarChart}>
                {(reports?.topPolls ?? []).map((poll, i) => (
                  <div key={i} style={styles.hBarRow}>
                    <div style={styles.hBarLabel} title={poll.title}>
                      {poll.title.length > 30 ? poll.title.slice(0, 30) + '...' : poll.title}
                    </div>
                    <div style={styles.hBarTrack}>
                      <div style={{
                        ...styles.hBarFill,
                        width: `${(poll.total_votes / maxPollVotes) * 100}%`,
                      }} />
                    </div>
                    <div style={styles.hBarValue}>{poll.total_votes}</div>
                  </div>
                ))}
                {(!reports?.topPolls || reports.topPolls.length === 0) && (
                  <p style={styles.emptyChart}>No polls yet</p>
                )}
              </div>
            </div>

            {/* Monthly Registrations */}
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>User Registrations (Monthly)</h3>
              <div style={styles.barChart}>
                {(reports?.monthlyRegistrations ?? []).map((month, i) => {
                  const maxReg = Math.max(...(reports?.monthlyRegistrations ?? []).map(m => m.count), 1);
                  return (
                    <div key={i} style={styles.barCol}>
                      <div style={styles.barValue}>{month.count}</div>
                      <div style={{
                        ...styles.barGreen,
                        height: `${(month.count / maxReg) * 140}px`,
                      }} />
                    </div>
                  );
                })}
                {(!reports?.monthlyRegistrations || reports.monthlyRegistrations.length === 0) && (
                  <p style={styles.emptyChart}>No registration data yet</p>
                )}
              </div>
            </div>
          </>
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
  loadingText: {
    color: '#64748b',
    fontSize: '14px',
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  quickStatCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    textAlign: 'center' as const,
  },
  quickStatValue: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: '4px',
  },
  quickStatLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: 500,
  },
  chartCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: '20px',
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
    gap: '8px',
    height: '220px',
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
    maxWidth: '36px',
    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '4px 4px 0 0',
    minHeight: '4px',
    transition: 'height 0.3s ease',
  },
  barGreen: {
    width: '100%',
    maxWidth: '36px',
    background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
    borderRadius: '4px 4px 0 0',
    minHeight: '4px',
    transition: 'height 0.3s ease',
  },
  barLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
  },
  emptyChart: {
    color: '#94a3b8',
    fontSize: '14px',
    textAlign: 'center' as const,
    width: '100%',
    paddingTop: '60px',
  },
  hBarChart: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
  },
  hBarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  hBarLabel: {
    width: '180px',
    fontSize: '14px',
    color: '#334155',
    fontWeight: 500,
    flexShrink: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  hBarTrack: {
    flex: 1,
    height: '24px',
    background: '#f1f5f9',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  hBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '6px',
    minWidth: '4px',
    transition: 'width 0.3s ease',
  },
  hBarValue: {
    width: '40px',
    textAlign: 'right' as const,
    fontSize: '14px',
    fontWeight: 700,
    color: '#1e293b',
    flexShrink: 0,
  },
};
