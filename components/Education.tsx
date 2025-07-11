import Image from "next/image";
import MCTC from "@/public/images/mctc-icon.webp";
import SFSU from "@/public/images/sfsu.webp";

export default function Education() {
  const items = [
    {
      title: "Web Development",
      link: "https://www.sfsu.edu/",
      icon: <Image src={SFSU} width={50} height={50} alt="SFSU" />,
      description: " San Francisco State University",
      location: "San Francisco, CA",
      date: "Jan 2005 - Dec 2007",
    },
    {
      title: "Graphic Design",
      link: "https://minneapolis.edu/",
      icon: <Image src={MCTC} width={50} height={50} alt="MCTC" />,
      description: "Minneapolis College",
      location: " Minneapolis, MN",
      date: "Jan 2000 - Dec 2002",
    },
  ];

  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
        Education
      </h2>
      <div className="grid min-[580px]:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <article
            key={index}
            className="relative p-5 rounded-xl odd:bg-gradient-to-tr odd:from-gray-100 odd:to-gray-50 dark:odd:bg-gradient-to-tr dark:odd:from-gray-800 dark:odd:to-gray-800/[0.65] group"
          >
            <div
              className="absolute top-5 right-7 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 group-hover:rotate-45 transition"
              aria-hidden="true"
            >
              <svg
                className="fill-current opacity-80 dark:opacity-100"
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
              >
                <path d="M1.018 10 0 8.983l7.572-7.575H1.723L1.736 0H10v8.266H8.577l.013-5.841L1.018 10Z" />
              </svg>
            </div>
            <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600/[0.65] shadow-sm mb-4">
              {item.icon}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                <a className="before:absolute before:inset-0" href={item.link}>
                  {item.title}
                </a>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.location}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.date}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
