import { ponder } from "ponder:registry";
import * as schema from "ponder:schema";
import { pushToBackend } from "./utils/syncBackend";

// ==========================================
// BADGE MINTED EVENT
// ==========================================
ponder.on("Badge:BadgeMinted", async ({ event, context }) => {
  const { tokenId, to, name } = event.args;

  // 1. Save to Ponder's SQLite
  await context.db
    .insert(schema.badges)
    .values({
      tokenId: Number(tokenId),
      owner: to,
      name,
      blockNumber: BigInt(event.block.number),
      timestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    })
    .onConflictDoUpdate({
      owner: to,
      name,
    });

  // 2. Push to Backend PostgreSQL
  pushToBackend("badge", {
    tokenId: Number(tokenId),
    owner: to,
    name,
    transactionHash: event.transaction.hash,
    blockNumber: event.block.number.toString(),
    timestamp: event.block.timestamp.toString(),
  });
});

// ==========================================
// BADGE TRANSFER EVENT
// ==========================================
ponder.on("Badge:Transfer", async ({ event, context }) => {
  const { from, to, tokenId } = event.args;
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  // Skip if it's a mint (from address is zero)
  if (from !== zeroAddress) {
    // 1. Update badge owner in Ponder's SQLite
    await context.db.update(schema.badges, { tokenId: Number(tokenId) }).set({
      owner: to,
    });

    // 2. Update badge owner in Backend PostgreSQL
    const badge = await context.db.find(schema.badges, {
      tokenId: Number(tokenId),
    });

    if (badge) {
      pushToBackend("badge", {
        tokenId: Number(tokenId),
        owner: to,
        name: badge.name,
        transactionHash: event.transaction.hash,
        blockNumber: event.block.number.toString(),
        timestamp: event.block.timestamp.toString(),
      });
    }
  }
});
