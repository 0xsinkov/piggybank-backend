import { Routes } from 'src/domain';

export const rewardRoutes: Routes = {
  controller: 'reward',
  tag: 'Reward',
  routes: {
    getClaimableRewards: 'get-claimable-rewards',
    claimReward: 'claim-reward',
  },
} as const;
