function SkeletonReading() {
  return (
    <div className="card reading" aria-hidden="true">
      <div className="skeleton">
        <div className="skeleton__row">
          <span className="sk sk--mark" />
          <span className="sk sk--title" />
        </div>
        <div className="skeleton__row">
          <span className="sk sk--tile" />
          <span className="sk sk--tile" />
        </div>
        <div className="skeleton__row">
          <span className="sk sk--line" />
        </div>
        <div className="skeleton__row">
          <span className="sk sk--line" />
        </div>
      </div>
    </div>
  );
}

export default SkeletonReading;
