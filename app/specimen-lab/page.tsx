import type { Metadata } from "next";

import SpecimenView from "@/components/specimen/SpecimenView";

export const metadata: Metadata = { title: "Specimen lab", robots: { index: false, follow: false } };

export default function SpecimenLab() {
  return (
    <main style={{ background: "#0D0C0A", height: "100vh", margin: 0 }}>
      <style>{`.specimen-tip{background:#15130F;border:1px solid #2B2722;color:#EDE7DB;padding:8px 10px;max-width:260px;font:13px/1.4 system-ui}.specimen-tip b{display:block;font-weight:600;margin-bottom:2px}.specimen-tip span{color:#A69C8B}`}</style>
      <SpecimenView />
    </main>
  );
}
