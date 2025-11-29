import GamePage from './pages/GamePage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Hello World Game',
    path: '/',
    element: <GamePage />
  }
];

export default routes;