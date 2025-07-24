import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/AuthProvider';
import AppRouter from './router/router';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
       <AppRouter />;
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;