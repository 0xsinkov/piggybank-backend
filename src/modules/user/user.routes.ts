import { Routes } from 'src/domain';

export const userRoutes: Routes = {
  controller: 'user',
  tag: 'User',
  routes: {
    getProfile: 'get-profile',
    updateInfo: 'update-info',
    getTransactions: 'get-transactions',
  },
} as const;
