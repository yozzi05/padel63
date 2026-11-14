import type { CSSProperties } from "react";

// Изометрический корт 10×20 м со стеклянными стенками. Координаты в метрах,
// проекция считается функцией iso(), поэтому пропорции настоящие.
const S = 14;
const OX = 262;
const OY = 58;
const iso = (x: number, y: number, z = 0): [number, number] => [
  OX + (x - y) * 0.866 * S,
  OY + (x + y) * 0.5 * S - z * S,
];
const pts = (...p: [number, number, number?][]) => p.map(([x, y, z]) => iso(x, y, z).join(",")).join(" ");
const line = (a: [number, number, number?], b: [number, number, number?]) => {
  const [x1, y1] = iso(...a);
  const [x2, y2] = iso(...b);
  return { x1, y1, x2, y2 };
};

const WALL = 3;
const GLASS = { fill: "var(--glass)", stroke: "var(--glass-line)", strokeWidth: 1 };

/** Стеклянная стенка вдоль оси: набор панелей с вертикальными стойками */
function Wall({ from, to, h = WALL }: { from: [number, number]; to: [number, number]; h?: number }) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const n = Math.round(len / 2);
  const posts = [];
  for (let i = 1; i < n; i++) {
    const k = i / n;
    const x = from[0] + (to[0] - from[0]) * k;
    const y = from[1] + (to[1] - from[1]) * k;
    posts.push(<line key={i} {...line([x, y, 0], [x, y, h])} stroke="var(--glass-line)" strokeWidth={0.75} />);
  }
  return (
    <g>
      <polygon points={pts([from[0], from[1], 0], [to[0], to[1], 0], [to[0], to[1], h], [from[0], from[1], h])} {...GLASS} />
      {posts}
    </g>
  );
}

export function CourtArt({ className = "" }: { className?: string }) {
  const a = iso(5, 3.6);
  const b = iso(5, 16.4);
  const travel = { "--dx": `${b[0] - a[0]}px`, "--dy": `${b[1] - a[1]}px` } as CSSProperties;
  const white = { stroke: "#F2F3EC", strokeWidth: 1.5, strokeLinecap: "round" as const };

  return (
    <svg viewBox="0 0 400 290" className={className} role="img" aria-label="Падел-корт со стеклянными стенками">
      {/* Дальние стенки */}
      <Wall from={[0, 0]} to={[10, 0]} />
      <Wall from={[0, 0]} to={[0, 4]} />
      <Wall from={[0, 16]} to={[0, 20]} />
      <polygon
        points={pts([0, 4, 0], [0, 16, 0], [0, 16, 2], [0, 4, 2])}
        fill="none"
        stroke="var(--glass-line)"
        strokeWidth={0.75}
        strokeDasharray="2 3"
      />

      {/* Покрытие и разметка */}
      <polygon points={pts([0, 0], [10, 0], [10, 20], [0, 20])} fill="#2F5BEA" />
      <polygon points={pts([0, 0], [10, 0], [10, 20], [0, 20])} fill="none" {...white} />
      <line {...line([0, 3.05], [10, 3.05])} {...white} />
      <line {...line([0, 16.95], [10, 16.95])} {...white} />
      <line {...line([5, 3.05], [5, 16.95])} {...white} />

      {/* Сетка */}
      <polygon
        points={pts([0, 10, 0], [10, 10, 0], [10, 10, 0.9], [0, 10, 0.9])}
        fill="rgba(12,13,10,0.35)"
        stroke="#F2F3EC"
        strokeWidth={1}
      />
      <line {...line([0, 10, 0.9], [10, 10, 0.9])} stroke="#F2F3EC" strokeWidth={2} />

      {/* Мяч и его тень */}
      <g className="ball-travel" style={travel}>
        <ellipse cx={a[0]} cy={a[1]} rx={6} ry={3} fill="rgba(12,13,10,0.4)" />
      </g>
      <g className="ball-travel" style={travel}>
        <circle className="ball-hop" cx={a[0]} cy={a[1] - 6} r={6} fill="#C9F51A" stroke="#0C0D0A" strokeWidth={1} />
      </g>

      {/* Ближние стенки */}
      <Wall from={[10, 0]} to={[10, 4]} />
      <Wall from={[10, 16]} to={[10, 20]} />
      <Wall from={[0, 20]} to={[10, 20]} />
    </svg>
  );
}

/** Схема корта сверху с подписями для секции «Я впервые» */
export function CourtScheme() {
  const k = 15;
  const x0 = 20;
  const y0 = 34;
  const w = 20 * k;
  const h = 10 * k;
  const net = x0 + w / 2;
  const svc = 6.95 * k;
  const label = { fill: "var(--text-muted)", fontSize: 12, fontFamily: "Geologica, sans-serif" };
  const ink = { stroke: "var(--text)", strokeWidth: 1.25 };
  return (
    <svg viewBox="0 0 340 226" className="w-full" role="img" aria-label="Схема падел-корта: 20 на 10 метров, сетка посередине, стеклянные стены по периметру">
      <rect x={x0} y={y0} width={w} height={h} fill="#2F5BEA" />
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke="var(--text)" strokeWidth={3} />
      <line x1={net - svc} y1={y0} x2={net - svc} y2={y0 + h} stroke="#F2F3EC" strokeWidth={1.25} />
      <line x1={net + svc} y1={y0} x2={net + svc} y2={y0 + h} stroke="#F2F3EC" strokeWidth={1.25} />
      <line x1={net - svc} y1={y0 + h / 2} x2={net + svc} y2={y0 + h / 2} stroke="#F2F3EC" strokeWidth={1.25} />
      <line x1={net} y1={y0 - 5} x2={net} y2={y0 + h + 5} stroke="#F2F3EC" strokeWidth={2.5} strokeDasharray="3 2" />

      {/* Игроки: двое на двое */}
      {[
        [net - 95, y0 + 40],
        [net - 95, y0 + 110],
        [net + 95, y0 + 40],
        [net + 95, y0 + 110],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={6} fill="#C9F51A" stroke="#0C0D0A" strokeWidth={1} />
      ))}

      <text x={net} y={y0 - 12} textAnchor="middle" {...label}>
        Сетка
      </text>
      <text x={x0} y={18} {...label}>
        Стекло по периметру
      </text>
      <text x={net - svc / 2} y={y0 + h / 2 - 8} textAnchor="middle" fill="#F2F3EC" fontSize={11} fontFamily="Geologica, sans-serif">
        Зона подачи
      </text>

      {/* Размеры */}
      <line x1={x0} y1={y0 + h + 16} x2={x0 + w} y2={y0 + h + 16} {...ink} />
      <line x1={x0} y1={y0 + h + 11} x2={x0} y2={y0 + h + 21} {...ink} />
      <line x1={x0 + w} y1={y0 + h + 11} x2={x0 + w} y2={y0 + h + 21} {...ink} />
      <text x={net} y={y0 + h + 34} textAnchor="middle" fill="var(--text)" fontSize={13} fontFamily="Martian Mono, monospace">
        20 м
      </text>
      <text
        x={x0 + w - 8}
        y={y0 + 16}
        textAnchor="end"
        fill="#F2F3EC"
        fontSize={13}
        fontFamily="Martian Mono, monospace"
      >
        10 м ↕
      </text>
    </svg>
  );
}
