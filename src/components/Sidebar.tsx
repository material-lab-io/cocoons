import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/" },
  { label: "Air Quality", href: "/#air_quality" },
  { label: "Water Quality", href: "/#water_quality" },
  { label: "Green Cover", href: "/#green_cover" },
  { label: "Traffic", href: "/#traffic" },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="px-4 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Categories
        </h2>
      </div>
      <Separator />
      <nav className="flex-1 px-2 py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
