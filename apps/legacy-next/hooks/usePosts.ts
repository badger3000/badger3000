import {useQuery} from "@tanstack/react-query";
import {getPosts} from "@/lib/sanity";
import type {SanityPost} from "@/types/sanity";

export function usePosts(limit?: number) {
  return useQuery<SanityPost[], Error>({
    queryKey: ["posts", limit],
    queryFn: () => getPosts(limit),
    staleTime: 1000 * 60 * 15, // Consider data fresh for 15 minutes (increased from 5 minutes)
    gcTime: 1000 * 60 * 60 * 2, // Cache for 2 hours (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch when component mounts if data exists
  });
}
