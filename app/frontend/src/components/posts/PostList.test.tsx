import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import PostList from './PostList';

import { describe, it, expect, vi } from 'vitest';

// Mock the posts API
vi.mock('./api', () => ({
  postsApi: {
    getPosts: vi.fn().mockResolvedValue({
      posts: [],
      total: 0,
      pages: 0,
      current_page: 1,
      per_page: 10
    })
  }
}));

describe('PostList', () => {
  it('renders the filters and empty state', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <PostList />
        </QueryClientProvider>
      </MemoryRouter>
    );
    
    // Check that filters are rendered
    expect(screen.getByText(/Search Posts/i)).toBeInTheDocument();
    
    // Wait for loading to complete and empty state to appear
    await waitFor(() => {
      expect(screen.getByText(/No Posts Yet/i)).toBeInTheDocument();
    });
  });
}); 