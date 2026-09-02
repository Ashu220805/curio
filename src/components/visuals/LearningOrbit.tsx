import "./LearningOrbit.css";

type LearningOrbitProps = {
  compact?: boolean;
  decorative?: boolean;
};

export default function LearningOrbit({ compact = false, decorative = false }: LearningOrbitProps) {
  return (
    <div className={`learning-orbit ${compact ? "is-compact" : ""}`} aria-hidden={decorative ? true : undefined}>
      <div className="learning-orbit-glow learning-orbit-glow-a" />
      <div className="learning-orbit-glow learning-orbit-glow-b" />
      <div className="learning-orbit-ring learning-orbit-ring-outer" />
      <div className="learning-orbit-ring learning-orbit-ring-inner" />
      <div className="learning-orbit-particle particle-a" />
      <div className="learning-orbit-particle particle-b" />
      <div className="learning-orbit-particle particle-c" />
      <div className="learning-orbit-core">
        <div className="learning-orbit-core-shell">
          <img src="/curio-symbol.png" alt={decorative ? "" : "CURIO"} />
        </div>
      </div>
      <div className="learning-orbit-card orbit-explore"><span>01</span><strong>Explore</strong></div>
      <div className="learning-orbit-card orbit-connect"><span>02</span><strong>Connect</strong></div>
      <div className="learning-orbit-card orbit-practice"><span>03</span><strong>Practice</strong></div>
      <div className="learning-orbit-card orbit-grow"><span>04</span><strong>Grow</strong></div>
    </div>
  );
}
