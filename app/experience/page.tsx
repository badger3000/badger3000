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
        "Operate an independent digital consulting studio specializing in comprehensive web development and digital marketing solutions for clients. Designed and developed custom frontend experiences while providing strategic digital marketing guidance to enhance client brand presence and user engagement. Delivered end-to-end digital services from initial concept through implementation, focusing on creating seamless user experiences that drive business results.",
    },
    {
      title: "Frontend Developer at Hex",
      link: "https://hex.tech/",
      icon: <Image src={HexImg} width={50} height={50} alt="Hex" priority />,
      date: "2023 - 2024",
      location: "San Francisco, CA",
      description:
        "Led the development of a custom page builder integrated with Contentful headless CMS, enabling dynamic content management and streamlined website creation workflows. Architected and implemented JavaScript and GraphQL solutions to seamlessly connect frontend interfaces with backend content systems. Built custom lead generation form integrations that automated prospect capture and enhanced conversion tracking capabilities.",
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
        "Developed modern web applications for the healthcare industry using TypeScript, React.js, and GatsbyJS, ensuring robust and scalable frontend solutions. Integrated HubSpot Marketing Hub and CRM systems to streamline patient engagement and marketing automation workflows. Implemented comprehensive tracking and analytics using Google Tag Manager while maintaining HIPAA compliance standards for healthcare data handling.",
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
        "Led web development projects primarily using Webflow, creating custom animations and interactive experiences that enhanced user engagement and brand storytelling. Developed complex integrations between Webflow CMS and HubSpot Marketing Hub to streamline content management and marketing automation workflows. Implemented advanced tracking solutions with Google Tag Manager and optimized information architecture to improve site performance and conversion rates.",
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
        "Led technical solution development and implementation across multiple startup companies, architecting scalable web applications using React.js, GatsbyJS, and Node.js. Designed and executed comprehensive digital strategies that integrated WordPress CMS, HubSpot Marketing Hub, and advanced analytics tracking through Google Tag Manager. Delivered end-to-end technical solutions from information architecture planning through full implementation, helping startups establish robust digital foundations for growth.",
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
        "Developed customized solutions for Adobe Experience Manager (AEM) CMS, leveraging Java, JavaScript, and modern frontend technologies to create scalable content management experiences. Built and maintained comprehensive design systems using HTML5, CSS3, and component-based architectures that ensured consistent user experiences across multiple digital properties. Architected information architecture solutions and implemented custom AEM components that streamlined content authoring workflows and enhanced site performance.",
    },
    {
      title: "Front End Engineer at Hero Digital, LLC",
      link: "https://www.linkedin.com/company/herodigitalhq/",
      icon: <Image src={Hero} width={50} height={50} alt="Samsung" priority />,
      date: "2018 - 2019",
      location: "San Francisco, CA",
      description:
        "Engineered advanced frontend solutions for Sitecore CMS platforms, integrating innovative 3D design elements with traditional web technologies to create immersive user experiences. Developed comprehensive design systems using HTML5, CSS3, and JavaScript that standardized component libraries and improved development efficiency across multiple projects. Architected complex information architecture frameworks that optimized content delivery and enhanced user navigation through strategic implementation of modern frontend technologies.",
    },
    {
      title: "Sr. Web Developer at Sony",
      link: "https://www.sony.com/en/",
      icon: <Image src={Sony} width={50} height={50} alt="Samsung" priority />,
      date: "2012 - 2015",
      location: "San Francisco, CA",
      description:
        "Created custom frontend modules for e-commerce platforms using JavaScript, Scala, and Node.js to seamlessly interface with backend data systems and MongoDB databases. Developed reusable UI components and data visualization modules that displayed multiple data points including inventory, pricing, and customer information in real-time. Built responsive frontend interfaces using HTML5, CSS3, and LESS that efficiently consumed and presented complex e-commerce data across multilingual platforms.",
    },
    {
      title: "Web Developer at Hotwire",
      link: "https://www.hotwire.com/",
      icon: (
        <Image src={Hotwire} width={50} height={50} alt="Samsung" priority />
      ),
      date: "2012 - 2012",
      location: "San Francisco, CA",
      description:
        "Integrated custom frontend solutions into an existing Java application for the hotel booking vertical, implementing Google Maps API functionality to enhance location-based search and reservation capabilities. Developed A/B testing frameworks and custom design implementations that optimized booking conversion rates and improved user engagement within the Java application ecosystem. Built responsive JavaScript interfaces that seamlessly connected frontend booking experiences with the underlying Java backend systems and real-time hotel availability data.",
    },
    {
      title: "Interactive Developer at Isobar",
      link: "https://www.linkedin.com/company/isobar/",
      icon: (
        <Image src={Isobar} width={50} height={50} alt="Samsung" priority />
      ),
      date: "2010 - 2012",
      location: "San Francisco, CA",
      description:
        "Developed websites, microsites, and Facebook applications for high-profile advertising campaigns serving global brands including adidas and Coca-Cola, hand-coding HTML, CSS, and JavaScript templates for custom CMS solutions. Collaborated closely with art directors and design teams to create working prototypes and participated in user experience concept testing to ensure optimal campaign performance. Led a key embedded project with Blue Shield of California, working onsite to develop their client portal UI and integrate with proprietary systems, demonstrating adaptability to complex client environments.",
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
        "Developed responsive websites and e-commerce platforms for an agency specializing in branding, digital promotion, and curated art shows, using WordPress, Magento, and custom JavaScript solutions to enhance clients' online presence and revenue potential. Implemented user experience design best practices that significantly improved engagement metrics while creating custom content management solutions that streamlined client workflows and reduced content update time. Delivered consistent high-quality technical solutions and effective client presentations that maintained strong client satisfaction rates and contributed to both agency growth and client digital success.",
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
