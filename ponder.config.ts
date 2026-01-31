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
      address: "0x44e87aa98d721Dbcf368690bF5aAb1F3dD944dA9",
      startBlock: 36692000,
    },
    Badge: {
      abi: BadgeAbi,
      chain: "baseSepolia",
      address: "0xaE32Df9Fb677aE68C5A1F956761a42e269Ebdc99",
      startBlock: 36692000,
    },
  },
});
