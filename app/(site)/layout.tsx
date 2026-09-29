import { FgFooter, FgHeader } from "@/components/fg/Chrome";
import FigPlacement from "@/components/fg/FigPlacement";

/** The Fulgurite chrome: a quiet header over the night, and a footer that ends in the colophon. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <FgHeader />
      {children}
      <FgFooter />
      <FigPlacement />
    </>
  );
}
