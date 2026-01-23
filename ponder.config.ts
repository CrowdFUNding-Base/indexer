import { createConfig } from "ponder";
import { http } from "viem";

import { CampaignAbi } from "./abis/Campaign";
import { BadgeAbi } from "./abis/Badge";

export default createConfig({
  chains: {
    baseSepolia: {
      id: 84532,
      rpc: "https://sepolia.base.org",
    },
  },
  contracts: {
    Campaign: {
      abi: CampaignAbi,
      chain: "baseSepolia",
      address: "0x669419298f071c321EF9B9cCA44be58E380A5fE3",
      startBlock: 36692000,
    },
    Badge: {
      abi: BadgeAbi,
      chain: "baseSepolia",
      address: "0xdbe867Ddb16e0b34593f2Cef45e755feC2a8ce9d",
      startBlock: 36692000,
    },
  },
});
