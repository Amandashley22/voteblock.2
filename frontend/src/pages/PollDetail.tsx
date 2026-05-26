import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { Poll, PollResults } from '../types';
import { useAuth } from '../context/AuthContext';

export function PollDetail() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<PollResults | null>(null);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [view, setView] = useState<'vote' | 'results'>('vote');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadPoll();
    }
  }, [id]);

  const loadPoll = async () => {
    try {
      const [pollData, resultsData] = await Promise.all([
        api.getPoll(id!),
        api.getPollResults(id!),
      ]);
      setPoll(pollData);
      setResults(resultsData);
    } catch (err) {
      console.error('Failed to load poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedChoice) return;
    setVoting(true);
    try {
      await api.castVote(id!, selectedChoice);
      await loadPoll();
      setView('results');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!confirm('Are you sure you want to close this poll?')) return;
    try {
      await api.closePoll(id!);
      await loadPoll();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to close poll');
    }
  };

  const handleDeletePoll = async () => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) return;
    try {
      await api.deletePoll(id!);
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete poll');
    }
  };

  const handleExportChain = () => {
    api.exportChain(id!);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading poll...</p>
      </div>
    );
  }

  if (!poll || !results) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Poll not found</p>
      </div>
    );
  }

  const isOwner = poll.created_by === user?.id;
  const maxVotes = Math.max(...Object.values(results.results || {}), 0);

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <Link to="/" style={styles.logo}>
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
            Home
          </Link>
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={styles.main}>
        <div style={styles.backLink}>
          <Link to="/" style={styles.backBtn}>← Back to polls</Link>
        </div>

        <div style={styles.pollHeader}>
          <div>
            <h1 style={styles.pollTitle}>{poll.title}</h1>
            {poll.description && <p style={styles.pollDesc}>{poll.description}</p>}
          </div>
          <div style={styles.pollActions}>
            {isOwner && poll.is_open && (
              <button onClick={handleClosePoll} style={styles.actionBtn}>
                Close Poll
              </button>
            )}
            {isOwner && (
              <button onClick={handleDeletePoll} style={{ ...styles.actionBtn, ...styles.deleteBtn }}>
                Delete
              </button>
            )}
          </div>
        </div>

        <div style={styles.viewToggle}>
          <button
            onClick={() => setView('vote')}
            style={{ ...styles.toggleBtn, ...(view === 'vote' && styles.toggleBtnActive) }}
          >
            Vote
          </button>
          <button
            onClick={() => setView('results')}
            style={{ ...styles.toggleBtn, ...(view === 'results' && styles.toggleBtnActive) }}
          >
            Results & Verification
          </button>
        </div>

        {view === 'vote' ? (
          <div style={styles.voteSection}>
            {!poll.is_open ? (
              <div style={styles.closedNotice}>
                <span style={styles.closedIcon}>🔒</span>
                <h3 style={styles.closedTitle}>This poll is closed</h3>
                <p style={styles.closedDesc}>Check the Results tab to see the final outcome</p>
              </div>
            ) : (
              <div style={styles.options}>
                {poll.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedChoice(option)}
                    style={{
                      ...styles.optionBtn,
                      ...(selectedChoice === option && styles.optionBtnSelected),
                    }}
                  >
                    {option}
                  </button>
                ))}
                <button
                  onClick={handleVote}
                  disabled={!selectedChoice || voting}
                  style={{
                    ...styles.voteBtn,
                    ...(!selectedChoice && styles.voteBtnDisabled),
                  }}
                >
                  {voting ? 'Casting vote...' : 'Cast Vote'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.resultsSection}>
            <div style={{
              ...styles.verification,
              background: results.verification.valid ? '#dcfce7' : '#fee2e2',
              borderColor: results.verification.valid ? '#16a34a' : '#dc2626',
            }}>
              <div style={styles.verificationIcon}>
                {results.verification.valid ? '✅' : '❌'}
              </div>
              <div>
                <div style={{
                  ...styles.verificationTitle,
                  color: results.verification.valid ? '#166534' : '#991b1b',
                }}>
                  {results.verification.valid ? 'Chain Verified - No Tampering' : 'Chain Compromised!'}
                </div>
                <div style={styles.verificationDetails}>
                  {results.verification.valid
                    ? `All ${results.verification.totalBlocks} blocks are intact`
                    : results.verification.reason}
                </div>
              </div>
            </div>

            <div style={styles.results}>
              <div style={styles.resultsHeader}>
                <h3 style={styles.resultsTitle}>Vote Results</h3>
                <p style={styles.totalVotes}>{poll.total_votes} total votes</p>
              </div>
              <div style={styles.resultsList}>
                {poll.options.map((option) => {
                  const count = results.results[option] || 0;
                  const percentage = poll.total_votes > 0 ? (count / poll.total_votes) * 100 : 0;
                  return (
                    <div key={option} style={styles.resultRow}>
                      <div style={styles.resultLabel}>
                        <span style={styles.resultOption}>{option}</span>
                        <span style={styles.resultCount}>{count} votes ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div style={styles.barContainer}>
                        <div style={{
                          ...styles.bar,
                          width: `${percentage}%`,
                          background: maxVotes === count ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#cbd5e1',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.actions}>
              <button onClick={handleExportChain} style={styles.exportBtn}>
                📥 Export Full Chain
              </button>
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
  pollHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
    marginBottom: '32px',
    background: 'white',
    padding: '28px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
  },
  pollTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  pollDesc: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
  },
  pollActions: {
    display: 'flex',
    gap: '12px',
  },
  actionBtn: {
    padding: '10px 18px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteBtn: {
    background: '#fef2f2',
    color: '#ef4444',
  },
  viewToggle: {
    display: 'flex',
    background: 'white',
    padding: '6px',
    borderRadius: '16px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0',
  },
  toggleBtn: {
    flex: 1,
    padding: '14px',
    border: 'none',
    background: 'transparent',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleBtnActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
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
  voteSection: {
    background: 'white',
    padding: '32px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
  },
  closedNotice: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  closedIcon: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '20px',
  },
  closedTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  closedDesc: {
    fontSize: '15px',
    color: '#64748b',
    margin: 0,
  },
  options: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  optionBtn: {
    padding: '18px 24px',
    border: '2px solid #e2e8f0',
    background: 'white',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  optionBtnSelected: {
    borderColor: '#667eea',
    background: '#f0f4ff',
    color: '#667eea',
  },
  voteBtn: {
    marginTop: '16px',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  voteBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  resultsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  verification: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    border: '2px solid',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  verificationIcon: {
    fontSize: '32px',
  },
  verificationTitle: {
    fontSize: '16px',
    fontWeight: '800',
    margin: '0 0 4px 0',
  },
  verificationDetails: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  results: {
    background: 'white',
    padding: '32px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  resultsTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0,
  },
  totalVotes: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
    margin: 0,
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  resultRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  resultLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultOption: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e293b',
  },
  resultCount: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
  },
  barContainer: {
    height: '12px',
    background: '#f1f5f9',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: '8px',
    transition: 'width 0.5s ease-out',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
  },
  exportBtn: {
    padding: '14px 28px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
