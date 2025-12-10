import { Routes } from 'src/domain';

export const authRoutes: Routes = {
  controller: 'auth',
  tag: 'Auth',
  routes: {
    getAuthUrl: '/get-auth-url',
    authenticate: '/authenticate',
  },
} as const;
