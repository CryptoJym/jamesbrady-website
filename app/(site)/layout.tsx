import { Dock } from "@/components/site/Dock";
import { ConsoleRail, SiteFooter, SiteNav } from "@/components/site/chrome";
import { askRails } from "@/lib/ask/config";

/**
 * Direction B chrome. Pages render their own <main id="main" tabIndex={-1}>
 * because the home hero sits OUTSIDE main, exactly as the comp does.
 *
 * The film grain and the Ask dock live HERE, not in the root layout. Anything
 * mounted at the root paints on the five archived routes too, which is a
 * render change those pages did not ask for (independent review, P1-2).
 *
 * WHETHER THE ASSISTANT EXISTS IS ANSWERED AT BUILD, not by a fetch on every
 * page view. This layout is a server component, so it can read the rails
 * directly and hand the dock a boolean. Three things follow: no request leaves
 * the browser on load, the dock's first paint is already correct (no flash from
 * "off" to "on"), and /api/ask keeps its honest 503 without every visitor's
 * console carrying a failed request.
 *
 * The consequence, stated because it is the kind of thing that surprises
 * people: adding XAI_API_KEY to the project does nothing until the site is
 * redeployed. These pages are static; the value is read when they are built.
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
      <Dock configured={askRails().configured} />
    </div>
  );
}
