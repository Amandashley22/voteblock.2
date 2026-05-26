import { 
  sha256, 
  anonymiseVoter, 
  computeBlockHash, 
  createVoteBlock, 
  verifyChain, 
  tallyVotes,
  GENESIS_HASH,
  VoteBlock
} from "./chain";

describe("Chain Utility Functions", () => {
  describe("sha256", () => {
    it("should generate a valid SHA-256 hash", () => {
      const hash = sha256("test data");
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it("should generate different hashes for different inputs", () => {
      const hash1 = sha256("test1");
      const hash2 = sha256("test2");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("anonymiseVoter", () => {
    it("should anonymize voter ID using HMAC", () => {
      const anonymized = anonymiseVoter("user123", "poll456");
      expect(anonymized).toHaveLength(64);
    });

    it("should produce consistent results for same inputs", () => {
      const anonymized1 = anonymiseVoter("user123", "poll456");
      const anonymized2 = anonymiseVoter("user123", "poll456");
      expect(anonymized1).toBe(anonymized2);
    });

    it("should produce different results for different poll IDs", () => {
      const anonymized1 = anonymiseVoter("user123", "poll456");
      const anonymized2 = anonymiseVoter("user123", "poll789");
      expect(anonymized1).not.toBe(anonymized2);
    });
  });

  describe("createVoteBlock", () => {
    it("should create a valid vote block", () => {
      const block = createVoteBlock("poll123", "user456", "yes", 0, GENESIS_HASH);
      
      expect(block.blockIndex).toBe(0);
      expect(block.pollId).toBe("poll123");
      expect(block.choice).toBe("yes");
      expect(block.previousHash).toBe(GENESIS_HASH);
      expect(block.hash).toHaveLength(64);
    });

    it("should verify its own hash correctly", () => {
      const block = createVoteBlock("poll123", "user456", "yes", 0, GENESIS_HASH);
      const { hash, ...rest } = block;
      const recomputed = computeBlockHash(rest);
      expect(recomputed).toBe(hash);
    });
  });

  describe("verifyChain", () => {
    it("should return valid for empty chain", () => {
      const result = verifyChain([]);
      expect(result.valid).toBe(true);
      expect(result.totalBlocks).toBe(0);
    });

    it("should verify a valid single block chain", () => {
      const block = createVoteBlock("poll123", "user456", "yes", 0, GENESIS_HASH);
      const result = verifyChain([block]);
      expect(result.valid).toBe(true);
      expect(result.totalBlocks).toBe(1);
    });

    it("should verify a valid multi-block chain", () => {
      const block1 = createVoteBlock("poll123", "user1", "yes", 0, GENESIS_HASH);
      const block2 = createVoteBlock("poll123", "user2", "no", 1, block1.hash);
      const result = verifyChain([block1, block2]);
      expect(result.valid).toBe(true);
      expect(result.totalBlocks).toBe(2);
    });

    it("should detect tampered block", () => {
      const block1 = createVoteBlock("poll123", "user1", "yes", 0, GENESIS_HASH);
      const block2 = createVoteBlock("poll123", "user2", "no", 1, block1.hash);
      
      const tamperedBlock2 = { ...block2, choice: "yes" };
      
      const result = verifyChain([block1, tamperedBlock2]);
      expect(result.valid).toBe(false);
      expect(result.tamperedAt).toBe(1);
    });

    it("should detect broken chain link", () => {
      const block1 = createVoteBlock("poll123", "user1", "yes", 0, GENESIS_HASH);
      const block2 = createVoteBlock("poll123", "user2", "no", 1, "invalid-hash");
      
      const result = verifyChain([block1, block2]);
      expect(result.valid).toBe(false);
      expect(result.tamperedAt).toBe(1);
    });
  });

  describe("tallyVotes", () => {
    it("should tally votes correctly", () => {
      const block1 = createVoteBlock("poll123", "user1", "yes", 0, GENESIS_HASH);
      const block2 = createVoteBlock("poll123", "user2", "no", 1, block1.hash);
      const block3 = createVoteBlock("poll123", "user3", "yes", 2, block2.hash);
      
      const tally = tallyVotes([block1, block2, block3]);
      expect(tally.yes).toBe(2);
      expect(tally.no).toBe(1);
    });

    it("should return empty object for no votes", () => {
      const tally = tallyVotes([]);
      expect(tally).toEqual({});
    });
  });
});
