interface TrekRowProps {
  thumbnail: string | null;
  title: string;
  location: string;
  duration: string;
  status: "published" | "draft";
}

export default function TrekRow({ thumbnail, title, location, duration, status }: TrekRowProps) {
  return (
    <div className="trek-row">
      <div className="trek-thumbnail trek-thumbnail--empty">
        {thumbnail ? (
          <img src={thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M3 20l4.5-9L12 16l4-6 5 10" />
          </svg>
        )}
      </div>
      <div className="trek-info">
        <p className="trek-title">{title}</p>
        <p className="trek-meta">{location} · {duration}</p>
      </div>
      <span className={`trek-status trek-status--${status}`}>
        {status === "published" ? "Published" : "Draft"}
      </span>
    </div>
  );
}
