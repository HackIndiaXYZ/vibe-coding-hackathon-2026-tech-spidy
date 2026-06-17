"use client";
import dynamic from "next/dynamic";

const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
  loading: () => (
    <div style={{ position: "fixed", inset: 0, background: "#05060f", display: "grid", placeItems: "center" }}>
      <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: "#7fe0d4", opacity: 0.7 }}>
        entering the archive…
      </span>
    </div>
  ),
});

export default function ArchivePage() {
  return <Experience />;
}
