// components/TestimonialCarousel.tsx
"use client";

import {useState, useEffect, useRef} from "react";
import Image from "next/image";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  company?: string;
  profileUrl?: string;
  content: string;
  photo?: {
    asset?: {
      url: string;
    };
  };
  order?: number;
  featured?: boolean;
  dateGiven?: string;
}

interface TestimonialCarouselProps {
  items: Testimonial[];
}

export default function TestimonialCarousel({items}: TestimonialCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const duration: number = 3000;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [articleWidth, setArticleWidth] = useState<number | null>(null);
  const [gap, setGap] = useState<number>(0);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  useEffect(() => {
    setInitialLoad(false);
    handleSizes();
    window.addEventListener("resize", handleSizes);
    return () => window.removeEventListener("resize", handleSizes);
  }, [items]);

  useEffect(() => {
    !initialLoad && prependLastChild();
  }, [initialLoad]);

  useEffect(() => {
    if (!articleWidth || items.length === 0) return;
    removeTransitionTemporarily();
    translateContainer(-articleWidth - gap);
    playCarousel();
    setActiveState();
    containerRef.current?.addEventListener(
      "transitionend",
      handleTransitionEnd
    );
    containerRef.current?.addEventListener("mouseover", pauseCarousel);
    containerRef.current?.addEventListener("mouseout", playCarousel);
    containerRef.current?.addEventListener(
      "focus",
      (event) => {
        if (
          event.currentTarget &&
          !(event.currentTarget as Node).contains(event.relatedTarget as Node)
        ) {
          pauseCarousel();
        }
      },
      true
    );
    containerRef.current?.addEventListener(
      "blur",
      (event) => {
        if (
          event.currentTarget &&
          !(event.currentTarget as Node).contains(event.relatedTarget as Node)
        ) {
          playCarousel();
        }
      },
      true
    );
    return () => {
      pauseCarousel();
      containerRef.current?.removeEventListener(
        "transitionend",
        handleTransitionEnd
      );
      containerRef.current?.removeEventListener("mouseover", pauseCarousel);
      containerRef.current?.removeEventListener("mouseout", playCarousel);
      containerRef.current?.removeEventListener(
        "focus",
        (event) => {
          if (
            event.currentTarget &&
            !(event.currentTarget as Node).contains(event.relatedTarget as Node)
          ) {
            pauseCarousel();
          }
        },
        true
      );
      containerRef.current?.removeEventListener(
        "blur",
        (event) => {
          if (
            event.currentTarget &&
            !(event.currentTarget as Node).contains(event.relatedTarget as Node)
          ) {
            playCarousel();
          }
        },
        true
      );
    };
  }, [articleWidth, items]);

  const handleSizes = () => {
    if (!containerRef.current || items.length === 0) return;
    setArticleWidth(containerRef.current?.children[0].clientWidth);
    setGap(parseInt(window.getComputedStyle(containerRef.current).gap));
  };

  const prependLastChild = () => {
    if (!containerRef.current || items.length === 0) return;
    containerRef.current.prepend(containerRef.current.lastElementChild!);
  };

  const translateContainer = (value: number) => {
    if (!containerRef.current) return;
    containerRef.current.style.transform = `translateX(${value}px)`;
  };

  const removeTransitionTemporarily = () => {
    if (!containerRef.current) return;
    containerRef.current.style.transition = "none";
    setTimeout(() => {
      if (!containerRef.current) return;
      containerRef.current.style.transition = "";
    }, 0);
  };

  const handleTransitionEnd = (event: TransitionEvent) => {
    if (!containerRef.current) return;
    if (event.propertyName !== "transform") return;
    containerRef.current.appendChild(containerRef.current.firstElementChild!);
    removeTransitionTemporarily();
    articleWidth && translateContainer(-articleWidth - gap);
    setActiveState();
  };

  const playCarousel = () => {
    if (items.length <= 1) return; // Don't auto-scroll if only one item
    intervalRef.current = setInterval(() => {
      articleWidth && translateContainer(-2 * (articleWidth + gap));
    }, duration);
  };

  const pauseCarousel = () => {
    intervalRef.current && clearInterval(intervalRef.current);
  };

  const setActiveState = () => {
    if (!containerRef.current) return;
    Array.from(containerRef.current.children).forEach((child, index) => {
      child.setAttribute("data-state", index === 1 ? "active" : "inactive");
    });
  };

  return (
    <div className="[mask-image:_linear-gradient(to_right,black_50%,transparent_90%)] md:[mask-image:_linear-gradient(to_right,transparent_48px,black_64px,black_50%,transparent_90%)] -mx-3 md:-mx-16">
      <div
        ref={containerRef}
        className="flex gap-4 px-3 md:px-16 transition-transform duration-500 ease-in-out"
      >
        {items.map((item, index) => (
          <article
            key={item._id}
            className="shrink-0 w-[66.6667%] p-5 rounded-xl relative before:absolute before:inset-0 before:rounded-[inherit] before:-z-10 before:transition before:duration-300 data-[state=active]:before:bg-gradient-to-tr data-[state=active]:before:from-gray-100 data-[state=active]:before:to-gray-50 dark:data-[state=active]:before:bg-gradient-to-tr dark:data-[state=active]:before:from-gray-800 dark:data-[state=active]:before:to-gray-800/[0.65] before:opacity-0 data-[state=active]:before:opacity-100"
          >
            <div className="flex items-center space-x-3 mb-4">
              {item.photo?.asset?.url ? (
                <Image
                  className="shrink-0 w-11 h-11 rounded-full shadow-lg object-cover"
                  src={item.photo.asset.url}
                  width={44}
                  height={44}
                  alt={item.name}
                />
              ) : (
                <div className="shrink-0 w-11 h-11 rounded-full shadow-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-0.5">
                  {item.profileUrl ? (
                    <a
                      className="hover:underline decoration-2 decoration-gray-300 dark:decoration-gray-600 underline-offset-2"
                      href={item.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </h3>
                <p className="text-[13px] font-medium text-gray-500/70">
                  {item.role}
                  {item.company && ` at ${item.company}`}
                </p>
              </div>
            </div>
            <p className="font-inter-tight font-semibold text-gray-800 dark:text-gray-100 before:content-['\201C'] after:content-['\201D']">
              {item.content}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
