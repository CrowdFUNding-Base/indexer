import { ponder } from "ponder:registry";
import * as schema from "ponder:schema";
import { pushToBackend } from "./utils/syncBackend";

// CAMPAIGN CREATED EVENT
ponder.on("Campaign:CampaignCreated", async ({ event, context }) => {
  const { campaignId, name, creatorName, owner, creationTime, targetAmount } =
    event.args;

  // 1. Save to Ponder's SQLite
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

  // 2. Push to Backend PostgreSQL (non-blocking)
  pushToBackend("campaign", {
    id: Number(campaignId),
    name,
    creatorName,
    owner,
    balance: "0",
    targetAmount: targetAmount.toString(),
    creationTime: creationTime.toString(),
  });
});

// CAMPAIGN UPDATED EVENT
ponder.on("Campaign:CampaignUpdated", async ({ event, context }) => {
  const { campaignId, name, targetAmount } = event.args;

  // 1. Update Ponder's SQLite
  await context.db.update(schema.campaigns, { id: Number(campaignId) }).set({
    name,
    targetAmount,
  });

  // 2. Push to Backend PostgreSQL
  const campaign = await context.db.find(schema.campaigns, {
    id: Number(campaignId),
  });

  if (campaign) {
    pushToBackend("campaign", {
      id: Number(campaignId),
      name,
      creatorName: campaign.creatorName,
      owner: campaign.owner,
      balance: campaign.balance.toString(),
      targetAmount: targetAmount.toString(),
      creationTime: campaign.creationTime.toString(),
    });
  }
});

// DONATION RECEIVED EVENT
ponder.on("Campaign:DonationReceived", async ({ event, context }) => {
  const { campaignId, donor, amount } = event.args;
  const donationId = `${event.transaction.hash}-${event.log.logIndex}`;

  // 1. Insert donation record to Ponder's SQLite
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

  // 2. Update campaign balance in Ponder's SQLite
  const campaign = await context.db.find(schema.campaigns, {
    id: Number(campaignId),
  });

  let newBalance = amount;
  if (campaign) {
    newBalance = campaign.balance + amount;
    await context.db.update(schema.campaigns, { id: Number(campaignId) }).set({
      balance: newBalance,
    });
  }

  // 3. Push donation to Backend PostgreSQL
  pushToBackend("donation", {
    id: donationId,
    campaignId: Number(campaignId),
    donor,
    amount: amount.toString(),
    transactionHash: event.transaction.hash,
    blockNumber: event.block.number.toString(),
    timestamp: event.block.timestamp.toString(),
  });

  // 4. Update campaign balance in Backend PostgreSQL
  pushToBackend("campaign-balance", {
    campaignId: Number(campaignId),
    newBalance: newBalance.toString(),
  });
});

// FUND WITHDRAWN EVENT
ponder.on("Campaign:FundWithdrawn", async ({ event, context }) => {
  const { campaignId, name, owner, creatorName, amount } = event.args;
  const withdrawalId = `${event.transaction.hash}-${event.log.logIndex}`;

  // 1. Insert withdrawal record to Ponder's SQLite
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

  // 2. Update campaign balance in Ponder's SQLite
  const campaign = await context.db.find(schema.campaigns, {
    id: Number(campaignId),
  });

  let newBalance = BigInt(0);
  if (campaign) {
    newBalance = campaign.balance - amount;
    await context.db.update(schema.campaigns, { id: Number(campaignId) }).set({
      balance: newBalance,
    });
  }

  // 3. Push withdrawal to Backend PostgreSQL
  pushToBackend("withdrawal", {
    id: withdrawalId,
    campaignId: Number(campaignId),
    name,
    owner,
    creatorName,
    amount: amount.toString(),
    transactionHash: event.transaction.hash,
    blockNumber: event.block.number.toString(),
    timestamp: event.block.timestamp.toString(),
  });

  // 4. Update campaign balance in Backend PostgreSQL
  pushToBackend("campaign-balance", {
    campaignId: Number(campaignId),
    newBalance: newBalance.toString(),
  });
});
