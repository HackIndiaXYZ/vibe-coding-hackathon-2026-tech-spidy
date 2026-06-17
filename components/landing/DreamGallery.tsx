import Image from "next/image";

// The dream images used purely as MOTION — two reels drifting opposite ways.
// No captions: pairing each image to a specific dream title was a mismatch, so it's gone.
const IMAGES = [
  "/dreams/doorway.jpg",
  "/dreams/flying.jpg",
  "/dreams/wishes.jpg",
  "/dreams/jhargram.jpg",
  "/dreams/wedding.jpg",
  "/dreams/temple.jpg",
  "/dreams/lotus.png",
];

function Row({ imgs, dir }: { imgs: string[]; dir: "a" | "b" }) {
  const loop = [...imgs, ...imgs]; // doubled for the seamless -50% loop
  return (
    <div className={`dreams-row dreams-row--${dir}`}>
      {loop.map((src, i) => (
        <div className="dimg" key={dir + i} data-cursor="DREAM">
          <Image src={src} alt="" fill sizes="(max-width: 768px) 46vw, 260px" className="dimg-img" />
        </div>
      ))}
    </div>
  );
}

export default function DreamGallery() {
  return (
    <section className="dreams" id="archive">
      <div className="dreams-label l-label">Fragments of the archive</div>
      <div className="dreams-reel" aria-hidden>
        <Row imgs={IMAGES} dir="a" />
        <Row imgs={[...IMAGES].reverse()} dir="b" />
      </div>
    </section>
  );
}
