export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="/" className="footer-logo">TravelXplorer</a>
            <p className="footer-tagline">
              Documenting India&rsquo;s trails, one honest itinerary at a time.
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer navigation">
            <div className="footer-nav-group">
              <p className="footer-nav-label">Platform</p>
              <a href="#" className="footer-nav-link">Treks</a>
              <a href="#" className="footer-nav-link">Stories</a>
              <a href="#about" className="footer-nav-link">About</a>
            </div>
            <div className="footer-nav-group">
              <p className="footer-nav-label">Connect</p>
              <a href="#" className="footer-nav-link" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="#" className="footer-nav-link" target="_blank" rel="noopener noreferrer">Twitter / X</a>
              <a href="#" className="footer-nav-link">Contact</a>
            </div>
          </nav>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">&copy; {year} TravelXplorer. All rights reserved.</p>
          <p className="footer-credit">Made with care for every trail that deserves a story.</p>
        </div>
      </div>
    </footer>
  );
}
