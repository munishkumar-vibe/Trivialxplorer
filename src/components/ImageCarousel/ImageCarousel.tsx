import ImageCarouselRow from "./ImageCarouselRow";

interface Props {
  images: string[];
}

export default function ImageCarousel({ images }: Props) {
  const mid = Math.ceil(images.length / 2);
  const topRow    = images.slice(0, mid);
  const bottomRow = images.slice(mid);

  return (
    <section className="carousel" aria-label="Trail photo gallery">
      <div className="carousel-header">
        <p className="carousel-eyebrow">On the Trail</p>
        <h2 className="carousel-heading">Real trails. Real light. Real people.</h2>
      </div>
      <div className="carousel-rows">
        {/* Row 1 — scrolls left (standard direction) */}
        <ImageCarouselRow images={topRow}    direction="left" />
        {/* Row 2 — scrolls right (reverse direction) */}
        <ImageCarouselRow images={bottomRow} direction="right" />
      </div>
    </section>
  );
}
