import { RouterProvider } from '@tanstack/react-router';
import { router } from './router.config';

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
