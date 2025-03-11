import React from "react";
import {PortableText, PortableTextReactComponents} from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {tomorrow} from "react-syntax-highlighter/dist/cjs/styles/prism";

// Type definitions that match Sanity's schema
interface SanityImage {
  asset?: {
    _id?: string;
    url?: string;
    metadata?: {
      dimensions?: {
        width?: number;
        height?: number;
        aspectRatio?: number;
      };
      lqip?: string;
    };
  };
  alt?: string;
  caption?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

interface CodeBlock {
  code?: string;
  language?: string;
  filename?: string;
}

interface VideoEmbed {
  url?: string;
  title?: string;
  provider?: "youtube" | "vimeo";
}

interface SelfHostedVideo {
  videoFile?: {
    asset?: {
      _id?: string;
      url?: string;
      mimeType?: string;
    };
  };
  poster?: {
    asset?: {
      _id?: string;
      url?: string;
    };
  };
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

// Define the components using the correct PortableTextReactComponents type
const PortableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    image: ({value}) => {
      const imageValue = value as unknown as SanityImage;
      if (!imageValue?.asset?.url) {
        return null;
      }

      const width = imageValue.asset.metadata?.dimensions?.width || 1200;
      const height = imageValue.asset.metadata?.dimensions?.height || 800;

      return (
        <figure className="my-10">
          <div
            className="relative w-full"
            style={{
              paddingBottom: `${(height / width) * 100}%`,
              minHeight: "300px",
            }}
          >
            <Image
              src={imageValue.asset.url}
              alt={imageValue.alt || ""}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover rounded-lg"
              placeholder={imageValue.asset.metadata?.lqip ? "blur" : "empty"}
              blurDataURL={imageValue.asset.metadata?.lqip}
              priority={false}
            />
          </div>
          {imageValue.caption && (
            <figcaption className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
              {imageValue.caption}
            </figcaption>
          )}
        </figure>
      );
    },

    code: ({value}) => {
      const codeValue = value as unknown as CodeBlock;
      const {code = "", language = "text", filename} = codeValue;

      return (
        <div className="my-8 overflow-hidden rounded-lg bg-gray-900 dark:bg-gray-950">
          {filename && (
            <div className="px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 text-sm text-gray-300">
              {filename}
            </div>
          )}
          <SyntaxHighlighter
            language={language}
            style={tomorrow}
            customStyle={{
              margin: 0,
              padding: "1.5rem",
              fontSize: "0.9rem",
              borderRadius: filename ? "0 0 0.5rem 0.5rem" : "0.5rem",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    },

    video: ({value}) => {
      const videoValue = value as unknown as VideoEmbed;
      if (!videoValue?.url) {
        return null;
      }

      let videoId = "";
      let embedUrl = "";

      if (
        videoValue.provider === "youtube" ||
        videoValue.url.includes("youtube.com") ||
        videoValue.url.includes("youtu.be")
      ) {
        if (videoValue.url.includes("youtube.com/watch?v=")) {
          videoId = new URL(videoValue.url).searchParams.get("v") || "";
        } else if (videoValue.url.includes("youtu.be/")) {
          videoId = videoValue.url.split("youtu.be/")[1].split("?")[0];
        }
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (
        videoValue.provider === "vimeo" ||
        videoValue.url.includes("vimeo.com")
      ) {
        videoId = videoValue.url.split("/").pop() || "";
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }

      if (!embedUrl) return null;

      return (
        <div className="my-10">
          <div className="relative w-full pt-[56.25%]">
            <iframe
              src={embedUrl}
              title={videoValue.title || "Video embed"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg"
            />
          </div>
          {videoValue.title && (
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
              {videoValue.title}
            </p>
          )}
        </div>
      );
    },

    selfHostedVideo: ({value}) => {
      const videoValue = value as unknown as SelfHostedVideo;
      if (!videoValue?.videoFile?.asset?.url) {
        return null;
      }

      const {
        videoFile,
        poster,
        title,
        autoPlay = false,
        loop = false,
        muted = false,
        controls = true,
      } = videoValue;

      return (
        <div className="my-10">
          <div className="relative w-full rounded-lg overflow-hidden">
            <video
              src={videoFile?.asset?.url}
              poster={poster?.asset?.url}
              controls={controls}
              autoPlay={autoPlay}
              loop={loop}
              muted={muted}
              playsInline
              className="w-full rounded-lg"
            >
              <source
                src={videoFile?.asset?.url}
                type={videoFile?.asset?.mimeType || "video/webm"}
              />
              Your browser does not support the video tag.
            </video>
          </div>
          {title && (
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
              {title}
            </p>
          )}
        </div>
      );
    },
  },

  block: {
    normal: ({children}) => {
      return <p className="mb-6 leading-relaxed">{children}</p>;
    },

    h1: ({children}) => {
      return <h1 className="text-3xl font-bold mt-12 mb-6">{children}</h1>;
    },
    h2: ({children}) => {
      return <h2 className="text-2xl font-bold mt-10 mb-4">{children}</h2>;
    },
    h3: ({children}) => {
      return <h3 className="text-xl font-bold mt-8 mb-3">{children}</h3>;
    },
    h4: ({children}) => {
      return <h4 className="text-lg font-bold mt-6 mb-2">{children}</h4>;
    },

    blockquote: ({children}) => {
      return (
        <blockquote className="pl-4 border-l-4 border-gray-300 dark:border-gray-700 italic my-6 text-gray-700 dark:text-gray-300">
          {children}
        </blockquote>
      );
    },
  },

  marks: {
    link: ({children, value}) => {
      // Make sure value is defined before accessing it
      const href = value?.href || "#";
      const isExternal = href.startsWith("http");
      return (
        <Link
          href={href}
          className="text-blue-600 dark:text-blue-400 hover:underline"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {children}
        </Link>
      );
    },

    strong: ({children}) => {
      return <strong className="font-bold">{children}</strong>;
    },
    em: ({children}) => {
      return <em className="italic">{children}</em>;
    },
    code: ({children}) => {
      return (
        <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">
          {children}
        </code>
      );
    },

    highlight: ({children}) => {
      return (
        <span className="bg-yellow-100 dark:bg-yellow-900 px-1">
          {children}
        </span>
      );
    },
    underline: ({children}) => {
      return <span className="underline decoration-2">{children}</span>;
    },
  },

  list: {
    bullet: ({children}) => {
      return <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>;
    },
    number: ({children}) => {
      return <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>;
    },
  },

  listItem: {
    bullet: ({children}) => {
      return <li className="pl-2">{children}</li>;
    },
    number: ({children}) => {
      return <li className="pl-2">{children}</li>;
    },
  },
};

export default PortableTextComponents;
