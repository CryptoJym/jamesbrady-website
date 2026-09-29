import Link from "next/link";

import { FgFooter, FgHeader } from "@/components/fg/Chrome";

/**
 * A missing page, in the site's own chrome. The framework's bare 404 had no header, no footer and no way back, and the
 * layout's "Skip to content" link pointed at a #main it did not have. The words are the framework's own.
 */
export default function NotFound() {
  return (
    <>
      <FgHeader />
      <main id="main" tabIndex={-1} className="fg-page">
        <header className="fg-page__head">
          <p className="fg-eyebrow">404</p>
          <h1 className="fg-h1">This page could not be found.</h1>
          <p className="fg-p">
            <Link href="/">The home page →</Link>
          </p>
        </header>
      </main>
      <FgFooter />
    </>
  );
}
