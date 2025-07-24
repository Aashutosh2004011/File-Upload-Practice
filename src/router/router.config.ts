import {
    createRootRoute,
    createRoute,
    createRouter,
    redirect,
  } from '@tanstack/react-router';
  import Dashboard from '../pages/Dashboard';
  import Login from '../pages/Login';
  import Register from '../pages/Register';
  import { useAuthStore } from '../store/authStore';
import { getUser } from '../utils';
  
  const rootRoute = createRootRoute();
  
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
      const token = localStorage.getItem('token'); 
      console.log('token: ', token);
      const user = getUser();
      console.log('user: ', user);
      
      if (!token || !user) {
        throw redirect({ to: '/login' });
      }
    },
    component: Dashboard,
  });
  
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    beforeLoad: () => {
      const { user } = useAuthStore.getState();
      if (user) throw redirect({ to: '/' });
    },
    component: Login,
  });
  
  const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    beforeLoad: () => {
      const { user } = useAuthStore.getState();
      if (user) throw redirect({ to: '/' });
    },
    component: Register,
  });
  
  const routeTree = rootRoute.addChildren([indexRoute, loginRoute, registerRoute]);
  
  export const router = createRouter({ routeTree });
  
  declare module '@tanstack/react-router' {
    interface Register {
      router: typeof router;
    }
  }
  