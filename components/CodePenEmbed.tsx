"use client";

import {useEffect, useState} from "react";
import {useInView} from "react-intersection-observer";

interface CodePenEmbedProps {
  penUrl: string;
  title: string;
}

export default function CodePenEmbed({penUrl, title}: CodePenEmbedProps) {
  const [isClient, setIsClient] = useState(false);
  const {ref, inView} = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show a placeholder during SSR
  if (!isClient) {
    return (
      <div className="h-[600px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
          <p>Loading CodePen...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="h-[600px] w-full">
      {inView ? (
        <iframe
          height="100%"
          width="100%"
          title={title}
          src={`https://codepen.io/badger3000/embed/${penUrl}?default-tab=result&theme-id=54001`}
          loading="lazy"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          style={{border: 0}}
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
            <p>Loading CodePen...</p>
          </div>
        </div>
      )}
    </div>
  );
}
