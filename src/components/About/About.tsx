export default function About() {
  return (
    <section id="about" className="about">
      <div className="about-inner">
        <div className="about-text">
          <p className="about-eyebrow">Why we built this</p>
          <h2 className="about-heading">
            Started from the trail.
            <br />
            <em>Built for the trail.</em>
          </h2>
          <p className="about-body">
            TravelXplorer grew out of a frustration: after completing my first
            few Himalayan treks, I couldn&rsquo;t find a single place to share a
            real itinerary — not a glossy listicle, but an actual day-by-day
            breakdown of what you&rsquo;d encounter, where you&rsquo;d camp,
            what gear you actually needed.
          </p>
          <p className="about-body">
            So we built it. TravelXplorer is a publishing platform for trekkers
            and travel creators who want to document and share <em>real</em>{" "}
            experiences across India&rsquo;s trails. Not AI-generated guides.
            Not affiliate link blogs. Just honest records from people
            who&rsquo;ve walked the same paths.
          </p>

          <div className="about-stats">
            <div className="about-stat">
              <span className="about-stat-num">2+</span>
              <span className="about-stat-label">Treks documented</span>
            </div>
            <div className="about-divider" />
            <div className="about-stat">
              <span className="about-stat-num">India</span>
              <span className="about-stat-label">First focus</span>
            </div>
            <div className="about-divider" />
            <div className="about-stat">
              <span className="about-stat-num">100%</span>
              <span className="about-stat-label">Real itineraries</span>
            </div>
          </div>
        </div>

        <div className="about-img-block" aria-hidden="true">
          <img
            src="/images-hiking/toomas-tartes-Yizrl9N_eDA-unsplash.jpg"
            alt=""
            className="about-photo"
          />
          <div className="about-photo-accent" />
        </div>
      </div>
    </section>
  );
}
