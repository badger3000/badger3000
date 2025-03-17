"use client";
import ThemeToggle from "./theme-toggle";
import Image from "next/image";
import UserImg from "@/public/images/user-image.webp";
import HeaderImg04 from "@/public/images/header-image-04.webp";
import HeaderImg06 from "@/public/images/header-image-06.webp";
import Link from "next/link";
import {useState, useEffect} from "react";

export default function Header() {
  // Define types for our state
  type ImageKey = "video";
  type ImagesLoadedState = Record<ImageKey, boolean>;

  // States for client-side only
  const [isClient, setIsClient] = useState(false);
  const [videoSources, setVideoSources] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<ImagesLoadedState>({
    video: false,
  });

  // Set isClient to true once component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);

    // Add video sources after mount to prevent hydration mismatch
    setTimeout(() => {
      setVideoSources(true);
    }, 0);
  }, []);

  // Handle video load event
  const handleVideoLoad = () => {
    setImagesLoaded((prev) => ({
      ...prev,
      video: true,
    }));
  };
  return (
    <header className="text-center pt-6">
      {/* Dark mode toggle */}
      <ThemeToggle />
      {/* Intro */}
      <div className="mb-10">
        <Image
          className="inline-flex rounded-full shadow-lg  mb-4"
          src={UserImg}
          width={48}
          height={48}
          alt="Kyle Ross"
          priority
        />

        <div className="mb-5">
          <h1 className="font-inter-tight font-bold text-gray-800 dark:text-gray-100 text-2xl mb-1">
            Kyle Ross
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Frontend Developer and Technologist in Prescott, AZ 🇺🇸
          </p>
        </div>
        <a
          className="btn-sm text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.2)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms]"
          href="/#contact"
        >
          Get in Touch
        </a>
      </div>
      <Link href="/">
        <div className="group flex justify-center gap-4">
          <Image
            className="rounded-xl even:rotate-2 odd:-rotate-2 group-hover:rotate-0 transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] shadow-lg"
            src={HeaderImg04}
            width={245}
            height={160}
            style={{height: "auto"}}
            alt="Header 01"
            priority
          />

          {isClient ? (
            <div className="min-w-[278px] h-[160px] bg-gray-200 dark:bg-gray-700 rounded-xl even:rotate-2 odd:-rotate-2 group-hover:rotate-0 transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] shadow-lg">
              <video
                className={`${!imagesLoaded.video ? "hidden" : ""}  rounded-xl`}
                width={278}
                height={160}
                style={{height: "auto"}}
                autoPlay
                loop
                muted
                playsInline
                onLoadedData={() => handleVideoLoad()}
              >
                {videoSources && (
                  <>
                    <source
                      src="/video/cropped-video2.webm"
                      type="video/webm"
                    />
                    <source src="/video/cropped-video.mp4" type="video/mp4" />
                  </>
                )}
              </video>
            </div>
          ) : (
            // Server-side placeholder that exactly matches video dimensions
            <div className="min-w-[278px] h-[160px] rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse flex justify-center items-center even:rotate-2 odd:-rotate-2">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}
          <Image
            className="rounded-xl even:rotate-2 odd:-rotate-2 group-hover:rotate-0 transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] shadow-lg"
            src={HeaderImg06}
            width={245}
            height={160}
            style={{height: "auto"}}
            alt="Header 03"
            priority
          />
        </div>
      </Link>
    </header>
  );
}
