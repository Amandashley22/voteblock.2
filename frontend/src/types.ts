export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  created_by: string;
  ends_at: number | null;
  is_open: number;
  head_hash: string;
  total_votes: number;
  created_at: number;
}

export interface VoteBlock {
  blockIndex: number;
  pollId: string;
  voterId: string;
  choice: string;
  timestamp: number;
  previousHash: string;
  hash: string;
  nonce: string;
}

export interface VerificationResult {
  valid: boolean;
  totalBlocks: number;
  tamperedAt?: number;
  reason?: string;
}

export interface PollResults {
  poll: {
    id: string;
    title: string;
    isOpen: boolean;
    totalVotes: number;
    options: string[];
  };
  verification: VerificationResult;
  results: Record<string, number>;
}

export interface ChainExport {
  exportTimestamp: number;
  poll: {
    id: string;
    title: string;
    totalVotes: number;
    headHash: string;
  };
  chain: VoteBlock[];
}

export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  data?: T;
  [key: string]: any;
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  totalPolls: number;
  totalVotes: number;
  activePolls: number;
  newUsersThisWeek: number;
  votesToday: number;
  dailyVotes: { day_key: number; count: number }[];
  pollStatusDistribution: { open: number; closed: number };
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: number;
  pollsCreated: number;
}

export interface AdminPoll {
  id: string;
  title: string;
  description: string;
  options: string[];
  createdBy: string;
  creatorName: string;
  endsAt: number | null;
  isOpen: boolean;
  headHash: string;
  totalVotes: number;
  createdAt: number;
}

export interface AdminReports {
  votesPerDay: { day_key: number; count: number }[];
  topPolls: { id: string; title: string; total_votes: number }[];
  monthlyRegistrations: { month_key: number; count: number }[];
  avgVotesPerPoll: number;
  totalVotesCast: number;
  totalRegisteredUsers: number;
}
