import express from "express";
import db from "../lib/db";
import { verifyChain, tallyVotes, VoteBlock, computeBlockHash } from "../lib/chain";
import { AppError } from "../middleware/errorHandler";

const router = express.Router();

// Get results and verification status
router.get("/:pollId", (req, res, next) => {
  const { pollId } = req.params;

  try {
    const poll: any = db.prepare("SELECT * FROM polls WHERE id = ?").get(pollId as string);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    const blocks: any[] = db.prepare("SELECT * FROM vote_blocks WHERE poll_id = ? ORDER BY block_index ASC").all(pollId as string);
    
    const voteBlocks: VoteBlock[] = blocks.map(b => ({
      blockIndex: b.block_index,
      pollId: b.poll_id,
      voterId: b.voter_id,
      choice: b.choice,
      timestamp: b.timestamp,
      previousHash: b.previous_hash,
      hash: b.hash,
      nonce: b.nonce
    }));

    const verification = verifyChain(voteBlocks);
    const results = tallyVotes(voteBlocks);

    res.json({
      poll: {
        id: poll.id,
        title: poll.title,
        isOpen: !!poll.is_open,
        totalVotes: poll.total_votes,
        options: JSON.parse(poll.options)
      },
      verification,
      results
    });
  } catch (error) {
    next(error);
  }
});

// Get full chain for audit purposes
router.get("/:pollId/chain", (req, res, next) => {
  const { pollId } = req.params;

  try {
    const poll: any = db.prepare("SELECT * FROM polls WHERE id = ?").get(pollId as string);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    const blocks: any[] = db.prepare("SELECT * FROM vote_blocks WHERE poll_id = ? ORDER BY block_index ASC").all(pollId as string);
    
    const voteBlocks: VoteBlock[] = blocks.map(b => ({
      blockIndex: b.block_index,
      pollId: b.poll_id,
      voterId: b.voter_id,
      choice: b.choice,
      timestamp: b.timestamp,
      previousHash: b.previous_hash,
      hash: b.hash,
      nonce: b.nonce
    }));

    res.json({
      poll: {
        id: poll.id,
        title: poll.title,
        totalVotes: poll.total_votes,
        headHash: poll.head_hash
      },
      chain: voteBlocks
    });
  } catch (error) {
    next(error);
  }
});

// Export chain as JSON (same as chain but with explicit header)
router.get("/:pollId/export", (req, res, next) => {
  const { pollId } = req.params;

  try {
    const poll: any = db.prepare("SELECT * FROM polls WHERE id = ?").get(pollId as string);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    const blocks: any[] = db.prepare("SELECT * FROM vote_blocks WHERE poll_id = ? ORDER BY block_index ASC").all(pollId as string);
    
    const voteBlocks: VoteBlock[] = blocks.map(b => ({
      blockIndex: b.block_index,
      pollId: b.poll_id,
      voterId: b.voter_id,
      choice: b.choice,
      timestamp: b.timestamp,
      previousHash: b.previous_hash,
      hash: b.hash,
      nonce: b.nonce
    }));

    const exportData = {
      exportTimestamp: Date.now(),
      poll: {
        id: poll.id,
        title: poll.title,
        totalVotes: poll.total_votes,
        headHash: poll.head_hash
      },
      chain: voteBlocks
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="voteblock-${pollId}.json"`);
    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

// Verify individual vote block
router.get("/block/:hash", (req, res, next) => {
  const { hash } = req.params;

  try {
    const block: any = db.prepare("SELECT * FROM vote_blocks WHERE hash = ?").get(hash as string);
    if (!block) {
      throw new AppError("Block not found", 404);
    }

    const voteBlock: VoteBlock = {
      blockIndex: block.block_index,
      pollId: block.poll_id,
      voterId: block.voter_id,
      choice: block.choice,
      timestamp: block.timestamp,
      previousHash: block.previous_hash,
      hash: block.hash,
      nonce: block.nonce
    };

    const { hash: _, ...blockWithoutHash } = voteBlock;
    const recomputedHash = computeBlockHash(blockWithoutHash);
    const isValid = recomputedHash === voteBlock.hash;

    res.json({
      block: voteBlock,
      isValid,
      recomputedHash,
      storedHash: voteBlock.hash
    });
  } catch (error) {
    next(error);
  }
});

export default router;
