import { Routes } from 'src/domain';

export const tokenRoutes: Routes = {
  controller: 'token',
  tag: 'Token',
  routes: {
    getAllTokens: 'get-all-tokens',
    getTokenBalances: 'get-token-balances',
    withdrawToken: 'withdraw-token',
  },
} as const;
