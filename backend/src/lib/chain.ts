import crypto from "crypto";

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

export interface ChainVerificationResult {
  valid: boolean;
  totalBlocks: number;
  tamperedAt?: number;
  reason?: string;
}

export const GENESIS_HASH = "0".repeat(64);

export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function anonymiseVoter(userId: string, pollId: string): string {
  return crypto.createHmac("sha256", pollId).update(userId).digest("hex");
}

export function computeBlockHash(block: Omit<VoteBlock, "hash">): string {
  const payload = [
    block.blockIndex,
    block.pollId,
    block.voterId,
    block.choice,
    block.timestamp,
    block.previousHash,
    block.nonce,
  ].join("|");
  return sha256(payload);
}

export function createVoteBlock(
  pollId: string,
  userId: string,
  choice: string,
  blockIndex: number,
  previousHash: string
): VoteBlock {
  const voterId = anonymiseVoter(userId, pollId);
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const partial = { blockIndex, pollId, voterId, choice, timestamp, previousHash, nonce };
  return { ...partial, hash: computeBlockHash(partial) };
}

export function verifyChain(blocks: VoteBlock[]): ChainVerificationResult {
  if (blocks.length === 0) return { valid: true, totalBlocks: 0 };

  const sorted = [...blocks].sort((a, b) => a.blockIndex - b.blockIndex);

  if (sorted[0].previousHash !== GENESIS_HASH) {
    return { valid: false, totalBlocks: sorted.length, tamperedAt: 0, reason: "Genesis block invalid" };
  }

  for (let i = 0; i < sorted.length; i++) {
    const block = sorted[i];
    const { hash, ...rest } = block;
    const recomputed = computeBlockHash(rest);
    if (recomputed !== hash) {
      return { valid: false, totalBlocks: sorted.length, tamperedAt: i, reason: `Block ${i} was tampered` };
    }
    if (i > 0 && block.previousHash !== sorted[i - 1].hash) {
      return { valid: false, totalBlocks: sorted.length, tamperedAt: i, reason: `Block ${i} chain link broken` };
    }
  }

  return { valid: true, totalBlocks: sorted.length };
}

export function tallyVotes(blocks: VoteBlock[]): Record<string, number> {
  return blocks.reduce<Record<string, number>>((acc, block) => {
    acc[block.choice] = (acc[block.choice] ?? 0) + 1;
    return acc;
  }, {});
}