"use client";

import {useState, useEffect, useRef} from "react";

import Image from "next/image";
import TestimonialImg01 from "@/public/images/testimonial-01.webp";
import TestimonialImg02 from "@/public/images/testimonial-02.webp";
import TestimonialImg05 from "@/public/images/testimonial-05.webp";
import TestimonialImg06 from "@/public/images/testimonial-06.webp";
import TestimonialImg07 from "@/public/images/testimonial-07.jpg";

export default function Recommendations() {
  const items = [
    {
      name: "Tiffany Vurek",
      role: "Product & User Experience Executive and Advisor",
      image: TestimonialImg01,
      link: "https://www.linkedin.com/in/tiffany-vurek/",
      content:
        "Kyle has been a trusted colleague and our go-to technology expert for over two decades. His exceptional skills and unwavering dedication have been instrumental in our success. Any company would greatly benefit from having him as a key member of their team.",
    },
    {
      name: "Tyler Madison",
      role: "Software Architect",
      image: TestimonialImg02,
      link: "https://www.linkedin.com/in/tylermadison/",
      content:
        "Kyle meticulously and methodically tailors solutions based on the individual client's needs.",
    },
    {
      name: "Lauren Boggio",
      role: "Sr. Marketing Designer",
      image: TestimonialImg05,
      link: "https://www.linkedin.com/in/lauren-boggio-41baaaba/",
      content:
        "I had the pleasure of working with Kyle as a web developer, and he’s truly fantastic. As a designer, Kyle is incredibly easy to collaborate with. He listens to ideas, offers thoughtful feedback, and brings creative solutions to the table. His attention to detail and commitment to making everything look and function perfectly really stand out. Highly recommend him for any web development project!",
    },
    {
      name: "Srikanth B.",
      role: "Seasoned Engineering Leader",
      image: TestimonialImg06,
      link: "https://www.linkedin.com/in/srikanth-b-6218332/",
      content:
        "I highly recommend Kyle Ross for his outstanding work managing our website. His commitment to accountability and ownership is unparalleled, and his expertise in WordPress has significantly improved our site's functionality, security, and ease of maintenance. Kyle is proactive in addressing issues, communicates effectively with stakeholders, and consistently delivers innovative solutions. His contributions have been invaluable to our team.",
    },
    {
      name: "Katrina Krantz",
      role: "Paid Media, SEO & Content Marketing",
      image: TestimonialImg07,
      link: "https://www.linkedin.com/in/katrina-krantz/",
      content:
        "Kyle is a very talented engineer, who is always up to date on the latest tech. He managed, built and launched multiple complicated technology projects while at Samsung with great success. He works hard and fast and is a great communicator. I hope to work on more projects with him in the future.",
    },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const duration: number = 3000;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [articleWidth, setArticleWidth] = useState<number | null>(null);
  const [gap, setGap] = useState<number>(0);
  const [initialLoad, setInitalLoad] = useState<boolean>(true);

  useEffect(() => {
    setInitalLoad(false);
    handleSizes();
    window.addEventListener("resize", handleSizes);
    return () => window.removeEventListener("resize", handleSizes);
  }, []);

  useEffect(() => {
    !initialLoad && prependLastChild();
  }, [initialLoad]);

  useEffect(() => {
    if (!articleWidth) return;
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
  }, [articleWidth]);

  const handleSizes = () => {
    if (!containerRef.current) return;
    setArticleWidth(containerRef.current?.children[0].clientWidth);
    setGap(parseInt(window.getComputedStyle(containerRef.current).gap));
  };

  const prependLastChild = () => {
    if (!containerRef.current) return;
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
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Recommendations
      </h2>
      <div className="[mask-image:_linear-gradient(to_right,black_50%,transparent_90%)] md:[mask-image:_linear-gradient(to_right,transparent_48px,black_64px,black_50%,transparent_90%)] -mx-3 md:-mx-16">
        <div
          ref={containerRef}
          className="flex gap-4 px-3 md:px-16 transition-transform duration-500 ease-in-out"
        >
          {items.map((item, index) => (
            <article
              key={index}
              className="shrink-0 w-[66.6667%] p-5 rounded-xl relative before:absolute before:inset-0 before:rounded-[inherit] before:-z-10 before:transition before:duration-300 data-[state=active]:before:bg-gradient-to-tr data-[state=active]:before:from-gray-100 data-[state=active]:before:to-gray-50 dark:data-[state=active]:before:bg-gradient-to-tr dark:data-[state=active]:before:from-gray-800 dark:data-[state=active]:before:to-gray-800/[0.65] before:opacity-0 data-[state=active]:before:opacity-100"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  className="shrink-0 w-11 h-11 rounded-full shadow-lg"
                  src={item.image}
                  width={44}
                  height={44}
                  alt={item.name}
                />
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-0.5">
                    <a
                      className="hover:underline decoration-2 decoration-gray-300 dark:decoration-gray-600 underline-offset-2"
                      href={item.link}
                    >
                      {item.name}
                    </a>
                  </h3>
                  <p className="text-[13px] font-medium text-gray-500/70">
                    {item.role}
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
    </section>
  );
}
