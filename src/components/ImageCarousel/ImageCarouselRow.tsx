interface Props {
  images: string[];
  direction: "left" | "right";
  duration?: string;
}

export default function ImageCarouselRow({ images, direction, duration }: Props) {
  // Triple the set so the animation (-33.333%) always has a seamless next loop
  const looped = [...images, ...images, ...images];

  return (
    <div className="carousel-row">
      <div
        className={`carousel-track carousel-track--${direction}`}
        style={{ animationDuration: duration ?? `${Math.max(30, images.length * 4.5)}s` }}
      >
        {looped.map((src, i) => (
          <div key={i} className="carousel-img-wrap">
            <img
              src={src}
              alt=""
              className="carousel-img"
              loading="lazy"
              draggable="false"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
