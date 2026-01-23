import { onchainTable, index, relations } from "ponder";

// ==========================================
// CAMPAIGNS TABLE
// ==========================================
export const campaigns = onchainTable("campaigns", (t) => ({
  id: t.integer().primaryKey(),
  name: t.text().notNull(),
  creatorName: t.text().notNull(),
  owner: t.hex().notNull(),
  balance: t.bigint().notNull(),
  targetAmount: t.bigint().notNull(),
  creationTime: t.bigint().notNull(),
}), (table) => ({
  ownerIndex: index().on(table.owner),
}));

// ==========================================
// DONATIONS TABLE
// ==========================================
export const donations = onchainTable("donations", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  campaignId: t.integer().notNull(),
  donor: t.hex().notNull(),
  amount: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}), (table) => ({
  campaignIdIndex: index().on(table.campaignId),
  donorIndex: index().on(table.donor),
}));

// ==========================================
// WITHDRAWALS TABLE
// ==========================================
export const withdrawals = onchainTable("withdrawals", (t) => ({
  id: t.text().primaryKey(), // txHash-logIndex
  campaignId: t.integer().notNull(),
  name: t.text().notNull(),
  owner: t.hex().notNull(),
  creatorName: t.text().notNull(),
  amount: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}), (table) => ({
  campaignIdIndex: index().on(table.campaignId),
  ownerIndex: index().on(table.owner),
}));

// ==========================================
// BADGES TABLE
// ==========================================
export const badges = onchainTable("badges", (t) => ({
  tokenId: t.integer().primaryKey(),
  owner: t.hex().notNull(),
  name: t.text().notNull(),
  blockNumber: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
}), (table) => ({
  ownerIndex: index().on(table.owner),
}));

// ==========================================
// RELATIONS
// ==========================================
export const campaignsRelations = relations(campaigns, ({ many }) => ({
  donations: many(donations),
  withdrawals: many(withdrawals),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [donations.campaignId],
    references: [campaigns.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [withdrawals.campaignId],
    references: [campaigns.id],
  }),
}));
