import Image from "next/image";
//import Link from "next/link";
import Education from "@/components/Education";
import SkillsTech from "@/components/SkillsTech";
import MadBadgerStudiosImg from "@/public/images/mad_badger_studios_logo.webp";
import HexImg from "@/public/images/hex.webp";
import HeadspaceImg from "@/public/images/headspace_meditation_limited_logo.webp";
import SamsungImg from "@/public/images/samsung_next_logo.webp";
import MedAgency from "@/public/images/medicine-agency.webp";
import Hotwire from "@/public/images/hotwire.webp";
import Sony from "@/public/images/sony_logo.webp";
import Hero from "@/public/images/herodigitalhq_logo.webp";
import Initialyze from "@/public/images/initialyze_logo.webp";
import Ginger from "@/public/images/ginger_io_logo.webp";
import Isobar from "@/public/images/isobar_logo.webp";

export const metadata = {
  title: "Experience | Kyle Ross",
  description: "Some of my past work experience.",
};

export default async function ExperiencePage() {
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
        "Independent Consultant · Digital Experience · Web Development · Frontend Development · Digital Marketing",
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
      title: "Lead Web Developer at Ginger",
      link: "https://www.linkedin.com/company/carebyginger/",
      icon: (
        <Image src={Ginger} width={50} height={50} alt="Samsung" priority />
      ),
      date: "2020 - 2023",
      location: "San Francisco, CA",
      description:
        "HubSpot Marketing Hub · JSON · Git · React.js · Webflow · Web Applications · Information Architecture · Node.js · Google Tag Manager",
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
    {
      title: "Sr. Front End Engineer at Initialyze",
      link: "https://www.initialyze.com/",
      icon: (
        <Image src={Initialyze} width={50} height={50} alt="Samsung" priority />
      ),
      date: "2017 - 2019",
      location: "San Francisco, CA",
      description:
        "Adobe Experience Manager · JSON · Git · Java · Design System · Information Architecture · Node.js · CSS3 · HTML5 · JavaScript",
    },
    {
      title: "Front End Engineer at Hero Digital, LLC",
      link: "https://www.linkedin.com/company/herodigitalhq/",
      icon: <Image src={Hero} width={50} height={50} alt="Samsung" priority />,
      date: "2018 - 2019",
      location: "San Francisco, CA",
      description:
        "Site Core · 3D Design · Design System · Information Architecture · Node.js · CSS3 · HTML5 · JavaScript",
    },
    {
      title: "Sr. Web Developer at Sony",
      link: "https://www.sony.com/en/",
      icon: <Image src={Sony} width={50} height={50} alt="Samsung" priority />,
      date: "2012 - 2015",
      location: "San Francisco, CA",
      description:
        "JSON · JavaScript · Scala · Node.js · MongoDB · HTML5 · LESS  · CSS3",
    },
    {
      title: "Web Developer at Hotwire",
      link: "https://www.hotwire.com/",
      icon: (
        <Image src={Hotwire} width={50} height={50} alt="Samsung" priority />
      ),
      date: "2012 - 2012",
      location: "San Francisco, CA",
      description: "Web Applications · Java · JavaScript · Google Maps API",
    },
    {
      title: "Interactive Developer at Isobar",
      link: "https://www.linkedin.com/company/isobar/",
      icon: (
        <Image src={Isobar} width={50} height={50} alt="Samsung" priority />
      ),
      date: "2010 - 2012",
      location: "San Francisco, CA",
      description: "Web Applications · Java · JavaScript · Google Maps API",
    },
    {
      title: "Interactive Developer a Medicine Agency",
      link: "https://www.linkedin.com/company/medicine-agency/",
      icon: (
        <Image
          src={MedAgency}
          width={50}
          height={50}
          alt="Medicine Agency"
          priority
        />
      ),
      date: "2008 - 2010",
      location: "San Francisco, CA",
      description:
        "WordPress · jQuery · Magento · HTML · CSS · JavaScript · Adobe Illustrator · Adobe Creative Suite · Audio Engineering · iPhone Application Development",
    },
  ];
  return (
    <div className="max-w-3xl mx-auto">
      <div className="pb-12 md:pb-20">
        <h1 className="font-inter-tight text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Complete Resume
        </h1>

        <section>
          <article className="p-5">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Experienced Frontend Developer and Digital Experience Consultant
              with <strong>15+ years</strong> in web development, responsive
              design, modern JavaScript frameworks, and enterprise-level
              applications. Proven track record of leading development teams and
              delivering scalable solutions for major brands including{" "}
              <strong>Sony</strong>, <strong>Samsung</strong>, and{" "}
              <strong>Headspace</strong>.
            </p>
          </article>
        </section>

        <section className="mb-6 ">
          <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
            Work Experience
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

        <section className="mb-6">
          <SkillsTech />
        </section>
        <section>
          <Education />
        </section>
      </div>
    </div>
  );
}
