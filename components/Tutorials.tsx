import Image from "next/image";
import Thumbnail01 from "@/public/images/sony.png";
import Thumbnail02 from "@/public/images/esusu.webp";

export default function Tutorials() {
  const items = [
    {
      title: "Sony Global Web Transformation",
      link: "http://www.sony.co.uk/",
      image: Thumbnail01,
    },
    {
      title: "Esusu Rebrand",
      link: "https://esusurent.com/",
      image: Thumbnail02,
    },
  ];

  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Projects
      </h2>
      <div className="grid min-[580px]:grid-cols-2 gap-4 group">
        {items.map((item, index) => (
          <article
            key={index}
            className="relative aspect-video rounded-xl shadow-lg overflow-hidden min-[580px]:odd:-rotate-2 min-[580px]:even:rotate-2 group-hover:rotate-0 transition duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)]"
          >
            <figure className="absolute inset-0 before:absolute before:inset-0 before:bg-gradient-to-t before:to-75% before:from-gray-950/50 before:to-transparent">
              <Image
                className="h-full w-full object-cover"
                src={item.image}
                width={600}
                height={338}
                alt={item.title}
              />
            </figure>
            <div className="relative flex flex-col justify-end h-full w-full px-6 py-5">
              <h3 className="text-sm font-medium text-white">
                <a className="before:absolute before:inset-0" href={item.link}>
                  {item.title}
                </a>
              </h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
