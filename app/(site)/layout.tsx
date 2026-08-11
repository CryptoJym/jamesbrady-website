import { ConsoleRail, SiteFooter, SiteNav } from "@/components/site/chrome";

/**
 * Direction B chrome. Pages render their own <main id="main" tabIndex={-1}>
 * because the home hero sits OUTSIDE main, exactly as the comp does.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="b-room">
      <ConsoleRail />
      <SiteNav />
      {children}
      <SiteFooter />
    </div>
  );
}
