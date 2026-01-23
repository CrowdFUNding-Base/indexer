import { ponder } from "ponder:registry";
import * as schema from "ponder:schema";

// CAMPAIGN CREATED EVENT
ponder.on("Campaign:CampaignCreated", async ({ event, context }) => {
  const { campaignId, name, creatorName, owner, creationTime, targetAmount } =
    event.args;

  await context.db
    .insert(schema.campaigns)
    .values({
      id: Number(campaignId),
      name,
      creatorName,
      owner,
      balance: BigInt(0),
      targetAmount,
      creationTime,
    })
    .onConflictDoUpdate({
      name,
      creatorName,
      targetAmount,
    });
});

// CAMPAIGN UPDATED EVENT
ponder.on("Campaign:CampaignUpdated", async ({ event, context }) => {
  const { campaignId, name, targetAmount } = event.args;

  await context.db.update(schema.campaigns, { id: Number(campaignId) }).set({
    name,
    targetAmount,
  });
});

// DONATION RECEIVED EVENT
ponder.on("Campaign:DonationReceived", async ({ event, context }) => {
  const { campaignId, donor, amount } = event.args;
  const donationId = `${event.transaction.hash}-${event.log.logIndex}`;

  // Insert donation record
  await context.db
    .insert(schema.donations)
    .values({
      id: donationId,
      campaignId: Number(campaignId),
      donor,
      amount,
      blockNumber: BigInt(event.block.number),
      timestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    })
    .onConflictDoNothing();

  // Update campaign balance
  const campaign = await context.db.find(schema.campaigns, {
    id: Number(campaignId),
  });

  if (campaign) {
    await context.db.update(schema.campaigns, { id: Number(campaignId) }).set({
      balance: campaign.balance + amount,
    });
  }
});

// FUND WITHDRAWN EVENT
ponder.on("Campaign:FundWithdrawn", async ({ event, context }) => {
  const { campaignId, name, owner, creatorName, amount } = event.args;
  const withdrawalId = `${event.transaction.hash}-${event.log.logIndex}`;

  // Insert withdrawal record
  await context.db
    .insert(schema.withdrawals)
    .values({
      id: withdrawalId,
      campaignId: Number(campaignId),
      name,
      owner,
      creatorName,
      amount,
      blockNumber: BigInt(event.block.number),
      timestamp: BigInt(event.block.timestamp),
      transactionHash: event.transaction.hash,
    })
    .onConflictDoNothing();

  // Update campaign balance
  const campaign = await context.db.find(schema.campaigns, {
    id: Number(campaignId),
  });

  if (campaign) {
    await context.db.update(schema.campaigns, { id: Number(campaignId) }).set({
      balance: campaign.balance - amount,
    });
  }
});
