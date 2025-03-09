import Image from "next/image";
import MadBadgerStudiosImg from "@/public/images/mad_badger_studios_logo.webp";
import HexImg from "@/public/images/hex.jpg";
import HeadspaceImg from "@/public/images/headspace_meditation_limited_logo.jpg";
import SamsungImg from "@/public/images/samsung_next_logo.jpg";

const Svg3 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16">
    <path
      fill="#00ADEF"
      d="M17.995 3.602c-.075 1.725-1.274 4.124-3.674 7.198-2.474 3.15-4.499 4.799-6.223 4.799-1.05 0-1.95-.975-2.7-2.924-.45-1.8-.974-3.524-1.424-5.324-.525-1.95-1.125-2.924-1.725-2.924-.15 0-.6.3-1.424.825L0 4.202c.9-.75 1.8-1.575 2.624-2.325 1.2-1.05 2.1-1.574 2.7-1.65 1.424-.15 2.249.826 2.549 2.85.375 2.175.6 3.6.75 4.124.375 1.8.825 2.774 1.35 2.774.374 0 .974-.6 1.724-1.8.75-1.199 1.125-2.099 1.2-2.698.075-1.05-.3-1.575-1.2-1.575-.45 0-.9.075-1.35.3.9-2.924 2.55-4.274 5.099-4.199 1.8.075 2.624 1.275 2.55 3.599Z"
    />
  </svg>
);

export default function Experience() {
  const items = [
    {
      title: "Owner of Mad Badger Studios LLC",
      link: "https://madbadgerstudios.com/",
      icon: (
        <Image
          src={MadBadgerStudiosImg}
          width={50}
          height={50}
          alt="Mad Badger Studios LLC"
          priority
        />
      ),
      date: "2021 - Today",
      location: "Prescott, AZ",
      description:
        "Independent Consultant - Digital Experience, Web Development, Frontend Development,Marketing",
    },
    {
      title: "Frontend Developer at Hex",
      link: "https://hex.tech/",
      icon: <Image src={HexImg} width={50} height={50} alt="Hex" priority />,
      date: "2023 - 2024",
      location: "San Francisco, CA",
      description:
        "Front-end Coding · Contentful · Lead Generation · JavaScript · GraphQL",
    },
    {
      title: "Web Developer at Headspace",
      link: "https://www.headspace.com/",
      icon: (
        <Image
          src={HeadspaceImg}
          width={50}
          height={50}
          alt="Headspace"
          priority
        />
      ),
      date: "2021 - 2023",
      location: "San Francisco, CA",
      description:
        "TypeScript · HubSpot Marketing Hub · JSON · HubSpot · Git · React.js · Node.js · Healthcare · Google Tag Manager · GatsbyJS",
    },
    {
      title: "Sr. Front End Developer at Samsung Next",
      link: "https://www.samsungnext.com/",
      icon: (
        <Image src={SamsungImg} width={50} height={50} alt="Samsung" priority />
      ),
      date: "2019 - 2020",
      location: "San Francisco, CA",
      description:
        "HubSpot Marketing Hub · JSON · Git · React.js · WordPress · Web Applications · Information Architecture · Node.js · Google Tag Manager · GatsbyJS",
    },
  ];

  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Experience
      </h2>
      <div className="space-y-1">
        {items.map((item, index) => (
          <article
            key={index}
            className="p-5 rounded-xl odd:bg-gradient-to-tr odd:from-gray-100 odd:to-gray-50 dark:odd:bg-gradient-to-tr dark:odd:from-gray-800 dark:odd:to-gray-800/[0.65]"
          >
            <div className="sm:flex gap-5">
              <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600/[0.65] shadow-sm max-sm:mb-3 sm:mt-5">
                {item.icon}
              </div>
              <div>
                <div className="space-y-1.5 mb-3">
                  <div className="text-[13px] italic text-gray-500/70">
                    {item.date}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                    <a
                      className="hover:underline decoration-2 decoration-gray-300 dark:decoration-gray-600 underline-offset-2"
                      href={item.link}
                    >
                      {item.title}
                    </a>
                  </h3>
                  <div className="text-[13px] font-medium text-gray-600dark:text-gray-400">
                    {item.location}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
