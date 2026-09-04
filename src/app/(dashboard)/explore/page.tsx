import ExploreGrid from "@/components/explore/ExploreGrid";

export default function ExplorePage() {
  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-greeting">Explore</h1>
        <p className="dashboard-subtext">Trek stories and route itineraries from explorers worldwide.</p>
      </div>

      <div className="content-section">
        <ExploreGrid />
      </div>
    </>
  );
}
