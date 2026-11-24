export default function ProductCardSkeleton() {
  return (
    <article className="pcard pcard--skel" aria-hidden="true">
      <div className="pcard__media">
        <span className="skel skel--fill" />
      </div>
      <div className="pcard__body">
        <span className="skel skel--md" />
        <span className="skel skel--sm" style={{ width: "55%" }} />
        <div className="pcard__foot">
          <div className="pcard__meta">
            <span className="skel skel--sm" style={{ width: 70 }} />
            <span className="skel skel--badge" />
          </div>
          <span className="skel skel--lg" style={{ borderRadius: 10 }} />
        </div>
      </div>
    </article>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="pgrid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
