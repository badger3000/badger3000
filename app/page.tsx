import Tutorials from "@/components/Tutorials";
import Experience from "@/components/Experience";
//import Articles from "@/components/Articles";
// import SideHustles from "@/components/SideHustles";
import Recommendations from "@/components/Recommendations";
// import Newsletter from "@/components/Newsletter";

export const metadata = {
  title: "Kyle Ross | Badger3000",
  description:
    "Frontend Developer | Builder of Digital Things | ReactJS, Astro, JavaScript, | Golf Addict",
  openGraph: {
    image: "@/public/images/header-image-06.webp",
  },
};

export default async function Home() {
  return (
    <>
      <Experience />
      <Tutorials />
      <Recommendations />
      {/* <Articles />
      <SideHustles />
     <Newsletter /> */}
    </>
  );
}
