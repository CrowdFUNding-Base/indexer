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

// Get all campaigns (simplified)
app.get("/api/campaigns", async (c) => {
  try {
    const campaigns = await db.select().from(schema.campaigns);
    // Convert BigInt to string for JSON serialization
    const serializedCampaigns = campaigns.map((campaign) => ({
      ...campaign,
      balance: campaign.balance.toString(),
      targetAmount: campaign.targetAmount.toString(),
      creationTime: campaign.creationTime.toString(),
    }));
    return c.json({
      success: true,
      data: serializedCampaigns,
      count: campaigns.length,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching campaigns",
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// Get all donations (simplified)
app.get("/api/donations", async (c) => {
  try {
    const donations = await db.select().from(schema.donations);
    // Convert BigInt to string for JSON serialization
    const serializedDonations = donations.map((donation) => ({
      ...donation,
      amount: donation.amount.toString(),
      blockNumber: donation.blockNumber.toString(),
      timestamp: donation.timestamp.toString(),
    }));
    return c.json({
      success: true,
      data: serializedDonations,
      count: donations.length,
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching donations",
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// Get all badges (simplified)
app.get("/api/badges", async (c) => {
  try {
    const badges = await db.select().from(schema.badges);
    // Convert BigInt to string for JSON serialization
    const serializedBadges = badges.map((badge) => ({
      ...badge,
      blockNumber: badge.blockNumber.toString(),
      timestamp: badge.timestamp.toString(),
    }));
    return c.json({
      success: true,
      data: serializedBadges,
      count: badges.length,
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching badges",
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

// Get all withdrawals (simplified)
app.get("/api/withdrawals", async (c) => {
  try {
    const withdrawals = await db.select().from(schema.withdrawals);
    // Convert BigInt to string for JSON serialization
    const serializedWithdrawals = withdrawals.map((withdrawal) => ({
      ...withdrawal,
      amount: withdrawal.amount.toString(),
      blockNumber: withdrawal.blockNumber.toString(),
      timestamp: withdrawal.timestamp.toString(),
    }));
    return c.json({
      success: true,
      data: serializedWithdrawals,
      count: withdrawals.length,
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching withdrawals",
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
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
    console.error("Error fetching stats:", error);
    return c.json(
      {
        success: false,
        message: "Error fetching stats",
        error: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});

export default app;
