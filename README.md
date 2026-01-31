# CrowdFUNding Indexer (Ponder)

Blockchain indexer untuk CrowdFUNding platform menggunakan [Ponder](https://ponder.sh).

## Indexed Contracts

| Contract | Address (Base Sepolia) | Events |
|----------|------------------------|--------|
| Campaign | `0x17fb0DD846d2299F525ca0d0402C607C580e80c8` | CampaignCreated, CampaignUpdated, DonationReceived, FundWithdrawn |
| Badge | `0x8bdfD4C3f8e108687ABA5d9ebD9aFFe355545471` | BadgeMinted, Transfer |

## Setup

### 1. Install Dependencies

```bash
cd indexer
npm install
```

### 2. Configure Environment

Edit `.env.local`:

```bash
# Base Sepolia RPC URL (use Alchemy/Infura for better performance)
PONDER_RPC_URL_1=https://sepolia.base.org

# Optional: PostgreSQL database (uses SQLite by default)
DATABASE_URL=
```

### 3. Run Indexer

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run start
```

Indexer akan berjalan di `http://localhost:42069`

## API Endpoints

### GraphQL

- `GET /` - GraphQL Playground
- `POST /graphql` - GraphQL API

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/campaigns` | Get all campaigns |
| GET | `/api/campaigns/:id` | Get campaign by ID |
| GET | `/api/campaigns/:id/donations` | Get donations for campaign |
| GET | `/api/campaigns/:id/withdrawals` | Get withdrawals for campaign |
| GET | `/api/donations/user/:address` | Get donations by user wallet |
| GET | `/api/badges` | Get all badges |
| GET | `/api/badges/user/:address` | Get badges by user wallet |
| GET | `/api/stats` | Get platform statistics |

### SQL Client

- `GET /sql/*` - Direct SQL queries

## GraphQL Examples

### Get All Campaigns

```graphql
query {
  campaigns(orderBy: "creationTime", orderDirection: "desc", first: 10) {
    items {
      id
      name
      creatorName
      owner
      balance
      targetAmount
      creationTime
    }
  }
}
```

### Get Donations for Campaign

```graphql
query {
  donations(where: { campaignId: 1 }, orderBy: "timestamp", orderDirection: "desc") {
    items {
      id
      campaignId
      donor
      amount
      timestamp
      transactionHash
    }
  }
}
```

### Get User's Badges

```graphql
query {
  badges(where: { owner: "0x..." }) {
    items {
      tokenId
      owner
      name
      timestamp
    }
  }
}
```

## Database Schema

### campaigns
- `id` (int) - Campaign ID
- `name` (text) - Campaign name
- `creatorName` (text) - Creator name
- `owner` (address) - Owner wallet address
- `balance` (bigint) - Current balance in IDRX
- `targetAmount` (bigint) - Target amount
- `creationTime` (bigint) - Creation timestamp

### donations
- `id` (text) - Unique ID (txHash-logIndex)
- `campaignId` (int) - Campaign ID
- `donor` (address) - Donor wallet address
- `amount` (bigint) - Donation amount
- `blockNumber` (bigint) - Block number
- `timestamp` (bigint) - Timestamp
- `transactionHash` (bytes32) - Transaction hash

### withdrawals
- `id` (text) - Unique ID (txHash-logIndex)
- `campaignId` (int) - Campaign ID
- `name` (text) - Campaign name
- `owner` (address) - Owner wallet address
- `creatorName` (text) - Creator name
- `amount` (bigint) - Withdrawal amount
- `blockNumber` (bigint) - Block number
- `timestamp` (bigint) - Timestamp
- `transactionHash` (bytes32) - Transaction hash

### badges
- `tokenId` (int) - NFT Token ID
- `owner` (address) - Current owner address
- `name` (text) - Badge name
- `blockNumber` (bigint) - Block number
- `timestamp` (bigint) - Mint timestamp
- `transactionHash` (bytes32) - Transaction hash

## Integration with Backend

Update backend `.env`:

```bash
PONDER_URL=http://localhost:42069
```

Backend endpoints di `/crowdfunding/ponder/*` akan query data dari indexer ini.
