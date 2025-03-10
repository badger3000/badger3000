import { useQuery } from '@tanstack/react-query';
import { getPosts } from '@/lib/sanity';
import type { SanityPost } from '@/types/sanity';

export function usePosts(limit?: number) {
  return useQuery<SanityPost[], Error>({
    queryKey: ['posts', limit],
    queryFn: () => getPosts(limit),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}
