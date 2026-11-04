import Experience from "@/components/Experience";
import Articles from "@/components/Articles";
import Recommendations from "@/components/Recommendations";
import Contact from "@/components/Contact";

export const metadata = {
  title: "Kyle Ross | Badger3000",
  description:
    "Frontend Developer | Builder of Digital Things | ReactJS, Astro, JavaScript, | Golf Addict",
  openGraph: {
    image: "@/public/images/header-image-06.webp",
  },
};

export default function Home() {
  return (
    <>
      <Articles limit={4} />
      <Experience />
      <Recommendations />
      <Contact />
    </>
  );
}
