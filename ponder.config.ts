import { createConfig } from "ponder";
import { http } from "viem";

import { CampaignAbi } from "./abis/Campaign";
import { BadgeAbi } from "./abis/Badge";

export default createConfig({
  networks: {
    baseSepolia: {
      chainId: 84532,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    Campaign: {
      network: "baseSepolia",
      abi: CampaignAbi,
      address: "0x669419298f071c321EF9B9cCA44be58E380A5fE3" as `0x${string}`,
      startBlock: 20000000,
    },
    Badge: {
      network: "baseSepolia",
      abi: BadgeAbi,
      address: "0xdbe867Ddb16e0b34593f2Cef45e755feC2a8ce9d" as `0x${string}`,
      startBlock: 20000000,
    },
  },
});
