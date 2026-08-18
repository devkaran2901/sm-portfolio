import { FACILITY_GROUP_LABELS } from '@/content/defaults';
import type { FacilityView } from '@/lib/content';

const GROUP_ORDER: Array<FacilityView['group']> = ['CRICKET', 'RACQUET', 'FITNESS', 'HOSPITALITY'];

const GROUP_COLORS: Record<FacilityView['group'], { ring: string; text: string }> = {
  CRICKET: { ring: 'stroke-turf-400', text: 'fill-turf-200' },
  RACQUET: { ring: 'stroke-brass-300', text: 'fill-brass-200' },
  FITNESS: { ring: 'stroke-info-400', text: 'fill-info-400' },
  HOSPITALITY: { ring: 'stroke-bone-400', text: 'fill-bone-300' },
};

/**
 * "Sports ecosystem" diagram.
 *
 * An inline SVG hub-and-spoke, drawn from the same facility data as the grid so
 * the two can never drift apart. The SVG is decorative and mirrored by a real
 * list underneath, which is what screen readers and crawlers consume.
 */
export function Ecosystem({ facilities }: { facilities: FacilityView[] }) {
  const groups = GROUP_ORDER.map((group) => ({
    group,
    label: FACILITY_GROUP_LABELS[group],
    items: facilities.filter((facility) => facility.group === group),
  })).filter((entry) => entry.items.length > 0);

  const width = 760;
  const height = 460;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 158;

  const nodes = groups.map((entry, index) => {
    const angle = (index / groups.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...entry,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius * 0.82,
    };
  });

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="presentation"
          aria-hidden="true"
          className="mx-auto h-auto w-full min-w-[600px] max-w-3xl"
        >
          {nodes.map((node) => (
            <line
              key={`line-${node.group}`}
              x1={cx}
              y1={cy}
              x2={node.x}
              y2={node.y}
              className="stroke-ink-600"
              strokeWidth={1}
              strokeDasharray="3 5"
            />
          ))}

          <circle cx={cx} cy={cy} r={62} className="fill-ink-900 stroke-brass-500/50" strokeWidth={1} />
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            className="fill-bone-50 font-display text-[15px]"
          >
            Red Ball
          </text>
          <text x={cx} y={cy + 13} textAnchor="middle" className="fill-bone-400 text-[11px]">
            Rohtak, Haryana
          </text>

          {nodes.map((node) => {
            const colors = GROUP_COLORS[node.group];
            return (
              <g key={node.group}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={48}
                  className={`fill-ink-900/90 ${colors.ring}`}
                  strokeWidth={1}
                />
                <text
                  x={node.x}
                  y={node.y - 3}
                  textAnchor="middle"
                  className={`${colors.text} text-[11px] font-semibold`}
                >
                  {node.label.split(' ')[0]}
                </text>
                <text
                  x={node.x}
                  y={node.y + 13}
                  textAnchor="middle"
                  className="fill-bone-500 text-[10px]"
                >
                  {node.items.length} {node.items.length === 1 ? 'facility' : 'facilities'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((entry) => (
          <div key={entry.group} className="border-t border-ink-700 pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-bone-100">
              {entry.label}
            </h3>
            <ul className="mt-3 space-y-1.5">
              {entry.items.map((item) => (
                <li key={item.id} className="text-sm text-bone-400">
                  {item.quantity ? `${item.quantity} × ` : ''}
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
