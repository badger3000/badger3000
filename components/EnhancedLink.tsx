"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {ReactNode, useState} from "react";

interface EnhancedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any; // For any other props
}

export default function EnhancedLink({
  href,
  children,
  className,
  onClick,
  ...props
}: EnhancedLinkProps) {
  const router = useRouter();
  const [isPrefetched, setIsPrefetched] = useState(false);

  // Prefetch on mouse enter
  const handleMouseEnter = () => {
    if (!isPrefetched && href.startsWith("/")) {
      router.prefetch(href);
      setIsPrefetched(true);
    }
  };

  // Handle click events
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call the original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}
