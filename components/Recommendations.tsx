// components/Recommendations.tsx
import {client} from "@/lib/sanity";
import TestimonialCarousel from "./TestimonialCarousel";

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  company?: string;
  profileUrl?: string;
  content: string;
  photo?: {
    asset?: {
      url: string;
    };
  };
  order?: number;
  featured?: boolean;
  dateGiven?: string;
}

async function getTestimonials(): Promise<Testimonial[]> {
  const query = `*[_type == "testimonial" && featured == true] | order(order asc) {
    _id,
    name,
    role,
    company,
    profileUrl,
    content,
    photo {
      asset-> {
        url
      }
    },
    order,
    featured,
    dateGiven
  }`;

  return client.fetch(
    query,
    {},
    {
      cache: "force-cache",
      next: {revalidate: 3600},
    }
  );
}

export default async function Recommendations() {
  const items = await getTestimonials();
  if (!items.length) {
    return (
      <section>
        <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Recommendations
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No testimonials found.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Recommendations
      </h2>
      <TestimonialCarousel items={items} />
    </section>
  );
}
