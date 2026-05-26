import axios from 'axios';
import type { User, Poll, PollResults, ChainExport, AdminStats, AdminUser, AdminPoll, AdminReports } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  setAuthToken(token: string) {
    localStorage.setItem('token', token);
  },

  clearAuthToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async register(username: string, email: string, password: string) {
    const { data } = await client.post('/auth/register', { username, email, password });
    return data;
  },

  async login(email: string, password: string) {
    const { data } = await client.post('/auth/login', { email, password });
    if (data.token) {
      this.setAuthToken(data.token);
      localStorage.setItem('user', JSON.stringify({ id: data.userId, username: data.username, role: data.role }));
    }
    return data;
  },

  async getProfile() {
    const { data } = await client.get<User>('/auth/profile');
    return data;
  },

  async updateProfile(updateData: Partial<{ username: string; email: string }>) {
    const response = await client.put('/auth/profile', updateData);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await client.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  async createPoll(title: string, description?: string, options?: string[], endsAt?: number | null) {
    const { data } = await client.post('/polls', { title, description, options, endsAt });
    return data;
  },

  async getPolls() {
    const { data } = await client.get<Poll[]>('/polls');
    return data;
  },

  async getPoll(id: string) {
    const { data } = await client.get<Poll>(`/polls/${id}`);
    return data;
  },

  async updatePoll(id: string, updateData: Partial<{ title: string; description: string; options: string[]; endsAt: number | null }>) {
    const response = await client.put(`/polls/${id}`, updateData);
    return response.data;
  },

  async closePoll(id: string) {
    const response = await client.patch(`/polls/${id}/close`);
    return response.data;
  },

  async deletePoll(id: string) {
    const response = await client.delete(`/polls/${id}`);
    return response.data;
  },

  async castVote(pollId: string, choice: string) {
    const { data } = await client.post(`/votes/${pollId}`, { choice });
    return data;
  },

  async getPollResults(pollId: string) {
    const { data } = await client.get<PollResults>(`/verify/${pollId}`);
    return data;
  },

  async getFullChain(pollId: string) {
    const { data } = await client.get<ChainExport>(`/verify/${pollId}/chain`);
    return data;
  },

  async exportChain(pollId: string) {
    const response = await client.get(`/verify/${pollId}/export`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `voteblock-${pollId}.json`);
    document.body.appendChild(link);
    link.click();
  },

  async verifyBlock(hash: string) {
    const { data } = await client.get(`/verify/block/${hash}`);
    return data;
  },

  // Admin endpoints
  async getAdminStats() {
    const { data } = await client.get<AdminStats>('/admin/stats');
    return data;
  },

  async getAdminUsers() {
    const { data } = await client.get<AdminUser[]>('/admin/users');
    return data;
  },

  async getAdminPolls() {
    const { data } = await client.get<AdminPoll[]>('/admin/polls');
    return data;
  },

  async getAdminReports() {
    const { data } = await client.get<AdminReports>('/admin/reports');
    return data;
  },

  async deleteUser(id: string) {
    const response = await client.delete(`/admin/users/${id}`);
    return response.data;
  },
};
