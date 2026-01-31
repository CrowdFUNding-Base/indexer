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
      address: "0x17fb0DD846d2299F525ca0d0402C607C580e80c8",
      startBlock: 36692000,
    },
    Badge: {
      abi: BadgeAbi,
      chain: "baseSepolia",
      address: "0x8bdfD4C3f8e108687ABA5d9ebD9aFFe355545471",
      startBlock: 36692000,
    },
  },
});
