export default function ProjectsLoading() {
  return (
    <div className="container section" aria-busy="true">
      <div className="proj-tabs">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="skel skel--badge" style={{ width: 110, height: 38 }} />
        ))}
      </div>
      <div className="proj-grid">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="proj-card proj-card--skel">
            <span className="skel skel--full" style={{ aspectRatio: "4 / 3", height: "auto" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
