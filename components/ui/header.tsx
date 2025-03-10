import ThemeToggle from "./theme-toggle";
import Image from "next/image";
import UserImg from "@/public/images/user-image.jpg";
import HeaderImg04 from "@/public/images/header-image-04.webp";
import HeaderImg05 from "@/public/images/header-image-05.gif";
import HeaderImg06 from "@/public/images/header-image-06.webp";
import Link from "next/link";

export default function Header() {
  return (
    <header className="text-center pt-6">
      {/* Dark mode toggle */}
      <ThemeToggle />
      {/* Intro */}
      <div className="mb-10">
        <Link href="/">
          <Image
            className="inline-flex rounded-full shadow-lg transition duration-150 ease-in-out transform hover:scale-105 hover:shadow-md dark:hover:shadow-lg mb-4"
            src={UserImg}
            width={48}
            height={48}
            alt="Kyle Ross"
            priority
          />
        </Link>
        <div className="mb-5">
          <h1 className="font-inter-tight font-bold text-gray-800 dark:text-gray-100 text-2xl mb-1">
            Kyle Ross
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Frontend Developer and Technologist in Prescott, AZ 🇺🇸
          </p>
        </div>
        {/* <a
          className="btn-sm text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.2)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms]"
          href="#0"
        >
          Available For Work
        </a> */}
      </div>
      <div className="group flex justify-center gap-4">
        <Image
          className="rounded-xl even:rotate-2 odd:-rotate-2 group-hover:rotate-0 transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] shadow-lg"
          src={HeaderImg04}
          width={245}
          height={160}
          alt="Header 01"
          priority
        />
        <Image
          className="rounded-xl even:rotate-2 odd:-rotate-2 group-hover:rotate-0 transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] shadow-lg"
          src={HeaderImg05}
          width={245}
          height={160}
          alt="Header 02"
          priority
          unoptimized
        />
        <Image
          className="rounded-xl even:rotate-2 odd:-rotate-2 group-hover:rotate-0 transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] shadow-lg"
          src={HeaderImg06}
          width={245}
          height={160}
          alt="Header 03"
          priority
        />
      </div>
    </header>
  );
}
