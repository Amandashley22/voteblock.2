import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './AdminDashboard';
import type { AdminPoll } from '../../types';

export function AdminPolls() {
  const [polls, setPolls] = useState<AdminPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPoll, setNewPoll] = useState({ title: '', description: '', options: ['', ''] });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      const data = await api.getAdminPolls();
      setPolls(data);
    } catch (err) {
      console.error('Failed to load polls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Are you sure you want to close this poll?')) return;
    try {
      await api.closePoll(id);
      loadPolls();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to close poll');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this poll? This cannot be undone.')) return;
    try {
      await api.deletePoll(id);
      loadPolls();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete poll');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const filteredOptions = newPoll.options.filter(o => o.trim());
    if (!newPoll.title.trim()) { setError('Title is required'); return; }
    if (filteredOptions.length < 2) { setError('At least 2 options required'); return; }

    setCreating(true);
    try {
      await api.createPoll(newPoll.title, newPoll.description, filteredOptions);
      setShowCreateModal(false);
      setNewPoll({ title: '', description: '', options: ['', ''] });
      loadPolls();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create poll');
    } finally {
      setCreating(false);
    }
  };

  const addOption = () => setNewPoll(p => ({ ...p, options: [...p.options, ''] }));
  const removeOption = (i: number) => setNewPoll(p => ({ ...p, options: p.options.filter((_, idx) => idx !== i) }));
  const updateOption = (i: number, val: string) => setNewPoll(p => ({ ...p, options: p.options.map((o, idx) => idx === i ? val : o) }));

  const handleLogout = () => { logout(); navigate('/login'); };

  const filtered = polls.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.creatorName.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={styles.container}>
      <Sidebar user={user} currentPage="polls" onLogout={handleLogout} />

      <div style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Poll Management</h1>
            <p style={styles.subtitle}>{polls.length} total polls</p>
          </div>
          <div style={styles.headerActions}>
            <input
              type="text"
              placeholder="Search polls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            <button onClick={() => setShowCreateModal(true)} style={styles.createBtn}>
              + Create Poll
            </button>
          </div>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Loading polls...</p>
        ) : (
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Options</th>
                  <th style={styles.th}>Votes</th>
                  <th style={styles.th}>Created By</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((poll, i) => (
                  <tr key={poll.id} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td style={styles.td}>
                      <span style={styles.pollTitle}>{poll.title}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={poll.isOpen ? styles.badgeOpen : styles.badgeClosed}>
                        {poll.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td style={styles.td}>{poll.options.length}</td>
                    <td style={styles.td}>
                      <span style={styles.voteCount}>{poll.totalVotes}</span>
                    </td>
                    <td style={styles.td}>{poll.creatorName}</td>
                    <td style={styles.td}>{formatDate(poll.createdAt)}</td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {poll.isOpen && (
                          <button onClick={() => handleClose(poll.id)} style={styles.closeBtn}>
                            Close
                          </button>
                        )}
                        <button onClick={() => handleDelete(poll.id)} style={styles.deleteBtn}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={styles.emptyRow}>
                      {search ? 'No polls match your search' : 'No polls yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={styles.tableFooter}>
              Showing {filtered.length} of {polls.length} polls
            </div>
          </div>
        )}

        {/* Create Poll Modal */}
        {showCreateModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>Create New Poll</h2>
              <form onSubmit={handleCreate}>
                {error && <div style={styles.error}>{error}</div>}
                <div style={styles.field}>
                  <label style={styles.label}>Title</label>
                  <input
                    style={styles.input}
                    value={newPoll.title}
                    onChange={(e) => setNewPoll(p => ({ ...p, title: e.target.value }))}
                    placeholder="Poll title"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Description (optional)</label>
                  <textarea
                    style={{ ...styles.input, minHeight: '60px', resize: 'vertical' as const }}
                    value={newPoll.description}
                    onChange={(e) => setNewPoll(p => ({ ...p, description: e.target.value }))}
                    placeholder="Poll description"
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Options</label>
                  {newPoll.options.map((opt, i) => (
                    <div key={i} style={styles.optionRow}>
                      <input
                        style={styles.input}
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                      />
                      {newPoll.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)} style={styles.removeOptBtn}>x</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addOption} style={styles.addOptBtn}>+ Add Option</button>
                </div>
                <div style={styles.modalActions}>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" disabled={creating} style={styles.submitBtn}>
                    {creating ? 'Creating...' : 'Create Poll'}
                  </button>
                </div>
              </form>
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
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
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
  createBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
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
  rowEven: {
    background: 'white',
  },
  rowOdd: {
    background: '#fafbfc',
  },
  pollTitle: {
    fontWeight: 600,
    color: '#1e293b',
  },
  badgeOpen: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    background: '#dcfce7',
    color: '#059669',
  },
  badgeClosed: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    background: '#f1f5f9',
    color: '#64748b',
  },
  voteCount: {
    fontWeight: 700,
    color: '#1e293b',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  closeBtn: {
    padding: '5px 12px',
    borderRadius: '6px',
    border: '1px solid #f59e0b',
    background: '#fffbeb',
    color: '#b45309',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
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
  // Modal
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '28px',
    width: '480px',
    maxWidth: '90vw',
    maxHeight: '85vh',
    overflowY: 'auto' as const,
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1e293b',
    margin: '0 0 20px 0',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  optionRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    alignItems: 'center',
  },
  removeOptBtn: {
    padding: '8px 12px',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    background: '#fef2f2',
    color: '#dc2626',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '14px',
    flexShrink: 0,
  },
  addOptBtn: {
    padding: '8px 14px',
    border: '1px dashed #cbd5e1',
    borderRadius: '6px',
    background: 'transparent',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  cancelBtn: {
    padding: '10px 20px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
