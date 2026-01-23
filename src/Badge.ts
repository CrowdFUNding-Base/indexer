import { ponder } from "ponder:registry";
import * as schema from "ponder:schema";

// ==========================================
// BADGE MINTED EVENT
// ==========================================
ponder.on("Badge:BadgeMinted", async ({ event, context }) => {
  const { tokenId, to, name } = event.args;
  
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
});

// ==========================================
// BADGE TRANSFER EVENT
// ==========================================
ponder.on("Badge:Transfer", async ({ event, context }) => {
  const { from, to, tokenId } = event.args;
  const zeroAddress = "0x0000000000000000000000000000000000000000";
  
  // Skip if it's a mint (from address is zero)
  if (from !== zeroAddress) {
    // Update badge owner when transferred
    await context.db
      .update(schema.badges, { tokenId: Number(tokenId) })
      .set({
        owner: to,
      });
  }
});
