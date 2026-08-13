import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('dashboard', 'routes/dashboard.tsx', [
    index('routes/dashboardInicio.tsx'),
    route('settings', 'routes/settings.tsx'),
    // route('wallet', 'routes/wallet.tsx'),
    route('test', 'routes/testes.tsx'),
  ]),
] satisfies RouteConfig;
