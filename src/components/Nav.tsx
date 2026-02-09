import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 items-center px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">Kalyanagar QoL</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
        </nav>
      </div>
      <Separator />
    </header>
  );
}
