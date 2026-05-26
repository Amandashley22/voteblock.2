import express from "express";
import db from "../lib/db";
import { authenticate, AuthRequest } from "../middleware/auth";
import { createVoteBlock } from "../lib/chain";
import { castVoteSchema } from "../lib/validation";
import { AppError } from "../middleware/errorHandler";

const router = express.Router();

// Cast a vote
router.post("/:pollId", authenticate, (req: AuthRequest, res, next) => {
  try {
    const { pollId } = req.params;
    const data = castVoteSchema.parse(req.body);
    const userId = req.user?.userId;

    const poll: any = db.prepare("SELECT * FROM polls WHERE id = ?").get(pollId as string);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    if (!poll.is_open || (poll.ends_at && poll.ends_at < Date.now())) {
      throw new AppError("Poll is closed", 400);
    }

    const block = createVoteBlock(
      pollId as string,
      userId!,
      data.choice,
      poll.total_votes,
      poll.head_hash
    );

    // Transaction to update block and poll
    const transaction = db.transaction(() => {
      const insertBlock = db.prepare(`
        INSERT INTO vote_blocks (id, block_index, poll_id, voter_id, choice, timestamp, previous_hash, hash, nonce)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertBlock.run(
        block.hash, // using hash as ID
        block.blockIndex,
        block.pollId,
        block.voterId,
        block.choice,
        block.timestamp,
        block.previousHash,
        block.hash,
        block.nonce
      );

      const updatePoll = db.prepare(`
        UPDATE polls SET head_hash = ?, total_votes = total_votes + 1 WHERE id = ?
      `);
      updatePoll.run(block.hash, pollId);
    });

    try {
      transaction();
    } catch (error: any) {
      if (
        (error.code === "SQLITE_CONSTRAINT" || error.message?.includes("UNIQUE constraint failed")) &&
        error.message.includes("vote_blocks.poll_id, vote_blocks.voter_id")
      ) {
        throw new AppError("You have already voted in this poll", 400);
      }
      throw error;
    }

    res.status(201).json({ message: "Vote cast successfully", blockHash: block.hash });
  } catch (error) {
    next(error);
  }
});

export default router;
