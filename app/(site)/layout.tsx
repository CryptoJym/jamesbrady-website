import { Dock } from "@/components/site/Dock";
import { ConsoleRail, SiteFooter, SiteNav } from "@/components/site/chrome";

/**
 * Direction B chrome. Pages render their own <main id="main" tabIndex={-1}>
 * because the home hero sits OUTSIDE main, exactly as the comp does.
 *
 * The film grain and the Ask dock live HERE, not in the root layout. Anything
 * mounted at the root paints on the five archived routes too, which is a
 * render change those pages did not ask for (independent review, P1-2).
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="b-room">
      <div className="grain" aria-hidden="true" />
      <ConsoleRail />
      <SiteNav />
      {children}
      <SiteFooter />
      <Dock />
    </div>
  );
}
