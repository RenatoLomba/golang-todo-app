import { Box, MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Todos } from './Todos';

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <Box sx={() => ({
          padding: '2rem',
          width: '100%',
          maxWidth: '40rem',
          margin: '0 auto'
        })}>
          <Todos />
        </Box>
      </MantineProvider>
    </QueryClientProvider>
  );
}
