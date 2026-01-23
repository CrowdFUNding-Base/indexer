import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { client, graphql } from "ponder";

const app = new Hono();

// ==========================================
// SQL & GraphQL Endpoints (Built-in)
// ==========================================
app.use("/sql/*", client({ db, schema }));
app.use("/", graphql({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

// ==========================================
// Custom REST Endpoints
// ==========================================

// Health check
app.get("/health", (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "CrowdFUNding Indexer is running"
  });
});

// Get all campaigns (simplified)
app.get("/api/campaigns", async (c) => {
  try {
    const campaigns = await db.select().from(schema.campaigns);
    return c.json({ success: true, data: campaigns, count: campaigns.length });
  } catch (error) {
    return c.json({ success: false, message: "Error fetching campaigns" }, 500);
  }
});

// Get all donations (simplified)
app.get("/api/donations", async (c) => {
  try {
    const donations = await db.select().from(schema.donations);
    return c.json({ success: true, data: donations, count: donations.length });
  } catch (error) {
    return c.json({ success: false, message: "Error fetching donations" }, 500);
  }
});

// Get all badges (simplified)
app.get("/api/badges", async (c) => {
  try {
    const badges = await db.select().from(schema.badges);
    return c.json({ success: true, data: badges, count: badges.length });
  } catch (error) {
    return c.json({ success: false, message: "Error fetching badges" }, 500);
  }
});

// Get all withdrawals (simplified)
app.get("/api/withdrawals", async (c) => {
  try {
    const withdrawals = await db.select().from(schema.withdrawals);
    return c.json({ success: true, data: withdrawals, count: withdrawals.length });
  } catch (error) {
    return c.json({ success: false, message: "Error fetching withdrawals" }, 500);
  }
});

// Stats endpoint
app.get("/api/stats", async (c) => {
  try {
    const campaigns = await db.select().from(schema.campaigns);
    const donations = await db.select().from(schema.donations);
    const badges = await db.select().from(schema.badges);
    const withdrawals = await db.select().from(schema.withdrawals);

    // Calculate total donated
    let totalDonated = BigInt(0);
    for (const d of donations) {
      totalDonated += d.amount;
    }

    return c.json({
      success: true,
      data: {
        totalCampaigns: campaigns.length,
        totalDonations: donations.length,
        totalBadges: badges.length,
        totalWithdrawals: withdrawals.length,
        totalDonatedAmount: totalDonated.toString(),
      },
    });
  } catch (error) {
    return c.json({ success: false, message: "Error fetching stats" }, 500);
  }
});

export default app;
