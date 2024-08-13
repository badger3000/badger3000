
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
} 