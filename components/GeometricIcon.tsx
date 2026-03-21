interface GeometricIconProps {
  category: string;
  size?: number;
  className?: string;
}

const GOLD = "#D4A853";
const GOLD_DIM = "rgba(212,168,83,0.4)";

export default function GeometricIcon({
  category,
  size = 32,
  className = "",
}: GeometricIconProps) {
  const half = size / 2;
  const pad = size * 0.12;
  const inner = half - pad;

  const icons: Record<string, React.ReactNode> = {
    // Documents: nested rectangles (layered pages)
    documents: (
      <g>
        <rect
          x={half - inner * 0.5}
          y={half - inner * 0.65}
          width={inner}
          height={inner * 1.3}
          rx={1}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.8}
          opacity={0.5}
        />
        <rect
          x={half - inner * 0.35}
          y={half - inner * 0.5}
          width={inner * 0.7}
          height={inner}
          rx={1}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.6}
          opacity={0.3}
        />
        <line
          x1={half - inner * 0.25}
          y1={half - inner * 0.1}
          x2={half + inner * 0.25}
          y2={half - inner * 0.1}
          stroke={GOLD_DIM}
          strokeWidth={0.5}
        />
        <line
          x1={half - inner * 0.25}
          y1={half + inner * 0.15}
          x2={half + inner * 0.15}
          y2={half + inner * 0.15}
          stroke={GOLD_DIM}
          strokeWidth={0.5}
        />
      </g>
    ),

    // Design: interlocking circles (creative harmony)
    design: (
      <g>
        <circle
          cx={half - inner * 0.2}
          cy={half}
          r={inner * 0.5}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.7}
          opacity={0.5}
        />
        <circle
          cx={half + inner * 0.2}
          cy={half}
          r={inner * 0.5}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.7}
          opacity={0.5}
        />
        <circle
          cx={half}
          cy={half - inner * 0.3}
          r={inner * 0.5}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.7}
          opacity={0.3}
        />
      </g>
    ),

    // Dev: hexagonal grid (structure/engineering)
    dev: (
      <g>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (Math.PI * 2 * i) / 6 - Math.PI / 6;
          const x = half + Math.cos(a) * inner * 0.6;
          const y = half + Math.sin(a) * inner * 0.6;
          return (
            <line
              key={i}
              x1={half}
              y1={half}
              x2={x}
              y2={y}
              stroke={GOLD_DIM}
              strokeWidth={0.5}
            />
          );
        })}
        {(() => {
          const pts = Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI * 2 * i) / 6 - Math.PI / 6;
            return `${half + Math.cos(a) * inner * 0.6},${half + Math.sin(a) * inner * 0.6}`;
          });
          return (
            <polygon
              points={pts.join(" ")}
              fill="none"
              stroke={GOLD}
              strokeWidth={0.7}
              opacity={0.5}
            />
          );
        })()}
        <circle
          cx={half}
          cy={half}
          r={inner * 0.2}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.6}
          opacity={0.4}
        />
      </g>
    ),

    // Marketing: ascending triangles (growth)
    marketing: (
      <g>
        {[0.8, 0.55, 0.3].map((scale, i) => {
          const triH = inner * scale;
          const triW = inner * scale * 0.8;
          const baseY = half + inner * 0.4;
          return (
            <polygon
              key={i}
              points={`${half},${baseY - triH} ${half - triW},${baseY} ${half + triW},${baseY}`}
              fill="none"
              stroke={GOLD}
              strokeWidth={0.6}
              opacity={0.5 - i * 0.12}
            />
          );
        })}
      </g>
    ),

    // Agents: connected nodes (neural network)
    agents: (
      <g>
        {/* Center node */}
        <circle cx={half} cy={half} r={3} fill={GOLD} opacity={0.4} />
        {/* Orbital nodes */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = half + Math.cos(a) * inner * 0.6;
          const y = half + Math.sin(a) * inner * 0.6;
          return (
            <g key={i}>
              <line
                x1={half}
                y1={half}
                x2={x}
                y2={y}
                stroke={GOLD_DIM}
                strokeWidth={0.4}
              />
              <circle cx={x} cy={y} r={2} fill={GOLD} opacity={0.35} />
            </g>
          );
        })}
        {/* Cross connections */}
        {[0, 1, 2, 3, 4].map((i) => {
          const a1 = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const a2 = (Math.PI * 2 * ((i + 2) % 5)) / 5 - Math.PI / 2;
          return (
            <line
              key={`c${i}`}
              x1={half + Math.cos(a1) * inner * 0.6}
              y1={half + Math.sin(a1) * inner * 0.6}
              x2={half + Math.cos(a2) * inner * 0.6}
              y2={half + Math.sin(a2) * inner * 0.6}
              stroke={GOLD_DIM}
              strokeWidth={0.3}
              opacity={0.5}
            />
          );
        })}
      </g>
    ),

    // Local AI: circuit paths
    "local-ai": (
      <g>
        <rect
          x={half - inner * 0.35}
          y={half - inner * 0.35}
          width={inner * 0.7}
          height={inner * 0.7}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.7}
          opacity={0.4}
        />
        {/* Circuit traces */}
        <line
          x1={half - inner * 0.35}
          y1={half}
          x2={half - inner * 0.7}
          y2={half}
          stroke={GOLD_DIM}
          strokeWidth={0.5}
        />
        <line
          x1={half + inner * 0.35}
          y1={half}
          x2={half + inner * 0.7}
          y2={half}
          stroke={GOLD_DIM}
          strokeWidth={0.5}
        />
        <line
          x1={half}
          y1={half - inner * 0.35}
          x2={half}
          y2={half - inner * 0.7}
          stroke={GOLD_DIM}
          strokeWidth={0.5}
        />
        <line
          x1={half}
          y1={half + inner * 0.35}
          x2={half}
          y2={half + inner * 0.7}
          stroke={GOLD_DIM}
          strokeWidth={0.5}
        />
        {/* Corner dots */}
        {[
          [-0.7, 0],
          [0.7, 0],
          [0, -0.7],
          [0, 0.7],
        ].map(([dx, dy], i) => (
          <circle
            key={i}
            cx={half + (dx as number) * inner}
            cy={half + (dy as number) * inner}
            r={1.5}
            fill={GOLD}
            opacity={0.35}
          />
        ))}
        <circle cx={half} cy={half} r={2} fill={GOLD} opacity={0.3} />
      </g>
    ),

    // Automation: concentric gears
    automation: (
      <g>
        <circle
          cx={half}
          cy={half}
          r={inner * 0.55}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.7}
          opacity={0.4}
        />
        <circle
          cx={half}
          cy={half}
          r={inner * 0.3}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.5}
          opacity={0.3}
        />
        {/* Gear teeth */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (Math.PI * 2 * i) / 8;
          return (
            <line
              key={i}
              x1={half + Math.cos(a) * inner * 0.48}
              y1={half + Math.sin(a) * inner * 0.48}
              x2={half + Math.cos(a) * inner * 0.65}
              y2={half + Math.sin(a) * inner * 0.65}
              stroke={GOLD}
              strokeWidth={0.6}
              opacity={0.35}
            />
          );
        })}
        {/* Arrow suggesting rotation */}
        <path
          d={`M ${half + inner * 0.15} ${half - inner * 0.05} A ${inner * 0.2} ${inner * 0.2} 0 1 1 ${half - inner * 0.05} ${half + inner * 0.15}`}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.5}
          opacity={0.35}
        />
      </g>
    ),

    // Memory: logarithmic spiral (data flow)
    memory: (
      <g>
        <path
          d={(() => {
            let d = "";
            const steps = 100;
            for (let i = 0; i < steps; i++) {
              const t = (i / steps) * Math.PI * 4;
              const r = (inner * 0.08) * Math.exp(0.12 * t);
              const x = half + Math.cos(t) * r;
              const y = half + Math.sin(t) * r;
              d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
            }
            return d;
          })()}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.6}
          opacity={0.4}
        />
        <circle cx={half} cy={half} r={1.5} fill={GOLD} opacity={0.4} />
      </g>
    ),

    // MCP: hub and spoke (protocol connections)
    mcp: (
      <g>
        {/* Central hub */}
        <circle
          cx={half}
          cy={half}
          r={inner * 0.2}
          fill="none"
          stroke={GOLD}
          strokeWidth={0.8}
          opacity={0.5}
        />
        <circle cx={half} cy={half} r={2} fill={GOLD} opacity={0.4} />
        {/* Spokes to outer nodes */}
        {Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI * 2 * i) / 6;
          const outerX = half + Math.cos(a) * inner * 0.7;
          const outerY = half + Math.sin(a) * inner * 0.7;
          return (
            <g key={i}>
              <line
                x1={half + Math.cos(a) * inner * 0.2}
                y1={half + Math.sin(a) * inner * 0.2}
                x2={outerX}
                y2={outerY}
                stroke={GOLD_DIM}
                strokeWidth={0.4}
                strokeDasharray="2 2"
              />
              <rect
                x={outerX - 3}
                y={outerY - 3}
                width={6}
                height={6}
                rx={1}
                fill="none"
                stroke={GOLD}
                strokeWidth={0.5}
                opacity={0.4}
              />
            </g>
          );
        })}
      </g>
    ),
  };

  const icon = icons[category] || icons.dev;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
    >
      {icon}
    </svg>
  );
}
