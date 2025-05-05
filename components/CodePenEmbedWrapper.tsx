"use client";

import dynamic from "next/dynamic";
import {Suspense} from "react";

// Dynamically import the CodePenEmbed component with ssr: false
// This is valid in a client component
const CodePenEmbed = dynamic(() => import("./CodePenEmbed"), {
  loading: () => (
    <div className="h-[600px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
        <p>Loading CodePen...</p>
      </div>
    </div>
  ),
  ssr: false,
});

interface CodePenEmbedWrapperProps {
  penUrl: string;
  title: string;
}

export default function CodePenEmbedWrapper({
  penUrl,
  title,
}: CodePenEmbedWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="h-[600px] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-2"></div>
            <p>Loading CodePen...</p>
          </div>
        </div>
      }
    >
      <CodePenEmbed penUrl={penUrl} title={title} />
    </Suspense>
  );
}
