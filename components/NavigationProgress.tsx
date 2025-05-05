"use client";

import {usePathname, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Reset loading state when navigation completes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  // Set loading state when a link is clicked
  const handleNavigate = () => {
    setIsLoading(true);
  };

  // Add click handlers to all internal links
  useEffect(() => {
    const links = document.querySelectorAll('a[href^="/"]');

    links.forEach((link) => {
      link.addEventListener("click", handleNavigate);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handleNavigate);
      });
    };
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <div className="h-full w-full bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
        .fixed::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 30%;
          height: 100%;
          background: rgba(255, 255, 255, 0.3);
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
