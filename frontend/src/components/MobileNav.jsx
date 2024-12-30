import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

//nav links
const navItems = [
  {
    name: "Topics",
    url: "/",
    icons: "fa-solid fa-comments",
    id: 1,
  },
  {
    name: "About",
    url: "/about/",
    icons: "fa-solid fa-address-card",
    id: 2,
  },
  {
    name: "Contact",
    url: "/contact/",
    icons: "fa-solid fa-inbox",
    id: 3,
  },
];
export default function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger className="text-dark block lg:hidden">
        <span className="sr-only">Open navigation</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </SheetTrigger>
      <SheetContent className="lg:hidden block max-w-3/4" side={"left"}>
        <SheetHeader>
          <SheetTitle className="sr-only">main navigation</SheetTitle>
        </SheetHeader>
        <ul className="mt-12 mx-auto justify-center text-center">
          {navItems.map((item) => (
            <li className="my-10" key={item.id}>
              <a
                href={item.url}
                className={`hover:text-secondary transition-all duration-500 text-3xl font-medium text-dark`}
              >
                <>
                  <i className={item.icons + " nav-icon mr-4 z-10 relative"} />
                  <span>{item.name}</span>
                </>
              </a>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
