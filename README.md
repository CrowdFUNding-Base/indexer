# CrowdFUNding - Blockchain Indexer

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.0-green?logo=node.js" alt="Node.js Version"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Ponder-0.1-black?logo=ponder" alt="Ponder"/>
  <img src="https://img.shields.io/badge/GraphQL-16.0-pink?logo=graphql" alt="GraphQL"/>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License"/>
</p>

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [GraphQL Examples](#graphql-examples)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The **CrowdFUNding Indexer** is a **Ponder** application that listens to blockchain events in real-time and makes the data queryable via GraphQL and REST APIs. It serves as the bridge between on-chain data and the backend cache.

### Key Responsibilities

- **Real-time Event Listening**: Subscribe to blockchain events (Base Sepolia)
- **Data Indexing**: Process and store events in a queryable database
- **API Generation**: Automatically serve GraphQL and REST APIs
- **Synchronization**: Keep the backend cache synchronized with the blockchain state

---

## Architecture

The indexer follows an event-driven architecture where blockchain events trigger handlers that update the local database.

```mermaid
flowchart TB
    subgraph Blockchain["Base Sepolia"]
        Campaign["Campaign.sol"]
        Badge["Badge.sol"]
    end

    subgraph EventHandlers["Event Handlers"]
        CampaignHandler["src/Campaign.ts"]
        BadgeHandler["src/Badge.ts"]
    end

    subgraph Database["Database"]
        Tables["Tables:\n- campaigns\n- donations\n- withdrawals\n- badges"]
    end

    subgraph APIs["API Layer"]
        GraphQL["GraphQL Endpoint\n:42069/graphql"]
        REST["REST Endpoints\n:42069/api/*"]
    end

    Campaign --> |"Events"| CampaignHandler
    Badge --> |"Events"| BadgeHandler
    CampaignHandler --> |"Insert/Update"| Tables
    BadgeHandler --> |"Insert/Update"| Tables
    Tables --> GraphQL
    Tables --> REST
```

### Key Architectural Decisions

| Decision             | Implementation                   | Benefit                               |
| -------------------- | -------------------------------- | ------------------------------------- |
| **Ponder Framework** | TypeScript-based indexer         | Hot reload, type safety               |
| **Event-Driven**     | Handler per event type           | Clear separation of concerns          |
| **Dual API**         | GraphQL + REST                   | Flexibility for consumers             |
| **Portable DB**      | SQLite (dev) / PostgreSQL (prod) | Easy development, scalable production |

---

## Tech Stack

| Category      | Technology          | Description                    |
| ------------- | ------------------- | ------------------------------ |
| **Runtime**   | Node.js             | JavaScript runtime environment |
| **Language**  | TypeScript          | Static typing for reliability  |
| **Framework** | Ponder              | Blockchain indexing framework  |
| **Database**  | SQLite / PostgreSQL | Data persistence               |
| **API**       | GraphQL / REST      | Data query interfaces          |
| **RPC**       | Viem / Alchemy      | Blockchain connection          |

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.14 or higher
- **Package Manager**: npm or pnpm (pnpm recommended)
- **RPC Endpoint**: Alchemy or Infura (Base Sepolia)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/CrowdFUNding-Base/indexer.git
   cd indexer
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Generate Types**:
   Run codegen to generate TypeScript types from the schema:

   ```bash
   npm run codegen
   ```

4. **Start the Indexer**:
   ```bash
   npm run dev
   ```

The indexer will start at `http://localhost:42069`.

---

## Environment Setup

Create a `.env.local` file in the project root:

```env
# ============================
# Blockchain RPC
# ============================
PONDER_RPC_URL_1=https://sepolia.base.org

# For better performance, use Alchemy:
# PONDER_RPC_URL_1=https://base-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# ============================
# Database (Optional for Production)
# ============================
# By default, Ponder uses SQLite for development
# For production, configure PostgreSQL:
# DATABASE_URL=postgresql://user:password@host:5432/ponder
```

### How to Obtain RPC URL

| Provider    | How to Obtain                                    |
| ----------- | ------------------------------------------------ |
| **Alchemy** | Alchemy Dashboard Create App Select Base Sepolia |
| **Infura**  | Infura Dashboard Create Key Enable Base          |
| **Public**  | `https://sepolia.base.org` (Rate-limited)        |

---

## Project Structure

```
├── ponder.config.ts          # Ponder configuration
├── ponder.schema.ts          # Database schema definition
├── ponder-env.d.ts           # TypeScript declarations
├── abis/
│   ├── Campaign.json         # Campaign contract ABI
│   └── Badge.json            # Badge contract ABI
├── src/
│   ├── Campaign.ts           # Campaign event handlers
│   ├── Badge.ts              # Badge event handlers
│   └── api/
│       └── index.ts          # Custom REST endpoints
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

---

## Database Schema

The indexer uses a relational schema mirroring the on-chain data:

```mermaid
erDiagram
    CAMPAIGNS {
        integer id PK
        text name
        text creatorName
        hex owner
        bigint balance
        bigint targetAmount
        bigint creationTime
    }

    DONATIONS {
        text id PK "txHash-logIndex"
        integer campaignId FK
        hex donor
        bigint amount
        bigint blockNumber
        bigint timestamp
        hex transactionHash
    }

    WITHDRAWALS {
        text id PK
        integer campaignId FK
        hex owner
        bigint amount
        bigint timestamp
        hex transactionHash
    }

    BADGES {
        integer tokenId PK
        hex owner
        text name
        bigint timestamp
        hex transactionHash
    }

    CAMPAIGNS ||--o{ DONATIONS : "receives"
    CAMPAIGNS ||--o{ WITHDRAWALS : "has"
```

---

## API Endpoints

The indexer provides both GraphQL and REST APIs.

### GraphQL Playground

Access the interactive playground at `http://localhost:42069` to test queries.

### REST Endpoints

| Method | Endpoint                       | Description        |
| ------ | ------------------------------ | ------------------ |
| GET    | `/health`                      | Health check       |
| GET    | `/api/campaigns`               | List all campaigns |
| GET    | `/api/campaigns/:id`           | Get campaign by ID |
| GET    | `/api/donations`               | List all donations |
| GET    | `/api/donations/user/:address` | User's donations   |
| GET    | `/api/badges`                  | List all badges    |
| GET    | `/api/badges/user/:address`    | User's badges      |

---

## GraphQL Examples

### Get All Campaigns

```graphql
query GetCampaigns {
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
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### Get User's Donation History

```graphql
query GetUserDonations($donor: String!) {
  donations(
    where: { donor: $donor }
    orderBy: "timestamp"
    orderDirection: "desc"
  ) {
    items {
      id
      campaignId
      amount
      timestamp
      campaign {
        name
        creatorName
      }
    }
  }
}
```

---

## Deployment

### Railway

1.  Connect your GitHub repository
2.  Set environment variables:
    - `PONDER_RPC_URL_1`
    - `DATABASE_URL` (if using PostgreSQL)
3.  **Build Command**: `npm install && npm run build`
4.  **Start Command**: `npm run start`

---

## Troubleshooting

| Issue                    | Solution                                                             |
| ------------------------ | -------------------------------------------------------------------- |
| **Indexer Not Starting** | Verify `PONDER_RPC_URL_1` is valid and accessible.                   |
| **Missing Events**       | Ensure `startBlock` in config matches the contract deployment block. |
| **Database Errors**      | Ensure write permissions in the project directory (for SQLite).      |
| **GraphQL Errors**       | Run `npm run codegen` to regenerate types after schema changes.      |

---

## Contributing

Contributions are welcome. Please submit a Pull Request.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Made with ❤️ by UGM BCC
</p>
