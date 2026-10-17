import { Flex, Text } from '@radix-ui/themes';

type Point = readonly [number, number];
type Bounds = {
  minTime: number;
  maxTime: number;
  minValue: number;
  maxValue: number;
};

const width = 640;
const height = 240;
const pad = { top: 16, right: 12, bottom: 28, left: 12 };

export function ValueChart({ points }: { points: readonly Point[] }) {
  const bounds = extents(points);
  const first = points[0];
  const last = points[points.length - 1];
  const line = bounds === null ? null : linePath(points, bounds);
  const area = bounds === null || line === null ? null : areaPath(line, points, bounds);

  return (
    <Flex direction="column" gap="2">
      <Text id="portfolio-chart-title" as="p" size="2" color="gray">
        Total value in time
      </Text>
      <svg
        role="img"
        aria-labelledby="portfolio-chart-title"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
      >
        <rect width={width} height={height} fill="#111113" rx="8" />
        {area === null || line === null || first === undefined || last === undefined ? (
          <text x={width / 2} y={height / 2} fill="#b4b4b4" fontSize="14" textAnchor="middle">
            No transactions
          </text>
        ) : (
          <>
            <text x={pad.left} y="14" fill="#b4b4b4" fontSize="12">
              USD
            </text>
            <path d={area} fill="#7c6aef" opacity="0.35" />
            <path d={line} fill="none" stroke="#b1a9ff" strokeWidth="2" />
            <text x={pad.left} y={height - 8} fill="#b4b4b4" fontSize="12">
              {dateLabel(first[0])}
            </text>
            <text
              x={width - pad.right}
              y={height - 8}
              fill="#b4b4b4"
              fontSize="12"
              textAnchor="end"
            >
              {dateLabel(last[0])}
            </text>
          </>
        )}
      </svg>
    </Flex>
  );
}

function extents(points: readonly Point[]): Bounds | null {
  const first = points[0];
  if (first === undefined) return null;

  let minTime = first[0];
  let maxTime = first[0];
  let minValue = first[1];
  let maxValue = first[1];

  for (const [time, value] of points) {
    if (time < minTime) minTime = time;
    if (time > maxTime) maxTime = time;
    if (value < minValue) minValue = value;
    if (value > maxValue) maxValue = value;
  }

  return { minTime, maxTime, minValue, maxValue };
}

function xOf(time: number, bounds: Bounds): number {
  const span = bounds.maxTime - bounds.minTime || 1;
  const inner = width - pad.left - pad.right;
  return pad.left + ((time - bounds.minTime) / span) * inner;
}

function yOf(value: number, bounds: Bounds): number {
  const span = bounds.maxValue - bounds.minValue || 1;
  const inner = height - pad.top - pad.bottom;
  return pad.top + (1 - (value - bounds.minValue) / span) * inner;
}

function linePath(points: readonly Point[], bounds: Bounds): string {
  return points
    .map(([time, value], index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command}${xOf(time, bounds).toFixed(1)} ${yOf(value, bounds).toFixed(1)}`;
    })
    .join(' ');
}

function areaPath(line: string, points: readonly Point[], bounds: Bounds): string | null {
  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) return null;
  const baseline = height - pad.bottom;
  const end = xOf(last[0], bounds).toFixed(1);
  const start = xOf(first[0], bounds).toFixed(1);
  return `${line} L${end} ${baseline} L${start} ${baseline} Z`;
}

function dateLabel(time: number): string {
  return new Date(time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
