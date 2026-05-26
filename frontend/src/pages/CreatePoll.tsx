import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function CreatePoll() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please add at least 2 options');
      return;
    }

    setLoading(true);
    try {
      const data = await api.createPoll(title, description || undefined, validOptions);
      navigate(`/poll/${data.pollId}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h1 style={styles.logo}>VoteBlock</h1>
        
        <div style={styles.userInfo}>
          <p style={styles.userName}>{user?.username}</p>
        </div>

        <nav style={styles.nav}>
          <Link to="/" style={styles.navItem}>Home</Link>
          <Link to="/create" style={styles.navItemActive}>New Poll</Link>
          <Link to="/profile" style={styles.navItem}>Settings</Link>
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      <div style={styles.main}>
        <div style={styles.backLink}>
          <Link to="/" style={styles.backBtn}>← Back</Link>
        </div>

        <div style={styles.card}>
          <h1 style={styles.title}>Create New Poll</h1>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Question</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Options</label>
              <div style={styles.optionsList}>
                {options.map((option, index) => (
                  <div key={index} style={styles.optionRow}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      required
                      style={styles.optionInput}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        style={styles.removeBtn}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                style={styles.addBtn}
              >
                + Add Option
              </button>
            </div>

            <div style={styles.actions}>
              <Link to="/" style={styles.cancelBtn}>Cancel</Link>
              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? 'Creating...' : 'Create Poll'}
              </button>
            </div>
          </form>
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
    maxWidth: '700px',
    width: '100%',
  },
  backLink: {
    marginBottom: '24px',
  },
  backBtn: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '28px',
    border: '1px solid #e5e7eb',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1f2937',
    margin: '0 0 24px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  },
  optionsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  optionRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  optionInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
  },
  removeBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '6px',
    border: '1px solid #fecaca',
    background: '#fef2f2',
    color: '#dc2626',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    padding: '10px 16px',
    background: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    color: '#374151',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '10px 20px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  submitBtn: {
    padding: '10px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
