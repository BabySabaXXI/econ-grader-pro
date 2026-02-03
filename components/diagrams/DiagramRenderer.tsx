'use client';

import React from 'react';
import { DiagramTemplate, DiagramCurve, DiagramPoint, DiagramArea, DiagramLabel } from '@/lib/diagrams/types';

interface DiagramRendererProps {
  diagram: DiagramTemplate;
  showLabels?: boolean;
  showAreas?: boolean;
  showPoints?: boolean;
  highlightCurve?: string;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Renders any DiagramTemplate as an SVG
 */
export function DiagramRenderer({
  diagram,
  showLabels = true,
  showAreas = true,
  showPoints = true,
  highlightCurve,
  className = '',
  width,
  height
}: DiagramRendererProps) {
  const svgWidth = width || diagram.width;
  const svgHeight = height || diagram.height;

  return (
    <svg
      viewBox={diagram.viewBox}
      width={svgWidth}
      height={svgHeight}
      className={`diagram-svg ${className}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Background */}
      <rect width="100%" height="100%" fill="#fefefe" />

      {/* Axes */}
      <g className="axes">
        {/* Y-axis */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="250"
          stroke="#374151"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        {/* X-axis */}
        <line
          x1="50"
          y1="250"
          x2="250"
          y2="250"
          stroke="#374151"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        {/* Axis labels */}
        <text x="25" y="150" fontSize="12" fill="#374151" textAnchor="middle" transform="rotate(-90, 25, 150)">
          {diagram.axis.yLabel}
        </text>
        <text x="150" y="280" fontSize="12" fill="#374151" textAnchor="middle">
          {diagram.axis.xLabel}
        </text>
        {/* Origin */}
        <text x="40" y="265" fontSize="10" fill="#374151">0</text>
      </g>

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
        </marker>
      </defs>

      {/* Areas (shaded regions) */}
      {showAreas && diagram.areas && diagram.areas.map((area) => (
        <AreaComponent key={area.id} area={area} />
      ))}

      {/* Curves */}
      <g className="curves">
        {diagram.curves.map((curve) => (
          <CurveComponent
            key={curve.id}
            curve={curve}
            isHighlighted={highlightCurve === curve.id}
          />
        ))}
      </g>

      {/* Equilibrium points */}
      {showPoints && diagram.points.map((point) => (
        <PointComponent key={point.id} point={point} />
      ))}

      {/* Labels */}
      {showLabels && diagram.labels.map((label, index) => (
        <LabelComponent key={index} label={label} />
      ))}
    </svg>
  );
}

/**
 * Renders a curve (line, dashed, or bezier)
 */
function CurveComponent({ curve, isHighlighted }: { curve: DiagramCurve; isHighlighted?: boolean }) {
  const strokeWidth = isHighlighted ? (curve.strokeWidth || 2) + 1 : curve.strokeWidth || 2;
  const opacity = isHighlighted ? 1 : 0.9;

  if (curve.type === 'dashed') {
    return (
      <line
        x1={curve.points[0].x}
        y1={curve.points[0].y}
        x2={curve.points[curve.points.length - 1].x}
        y2={curve.points[curve.points.length - 1].y}
        stroke={curve.color}
        strokeWidth={strokeWidth}
        strokeDasharray="5,5"
        opacity={opacity}
      />
    );
  }

  if (curve.type === 'curve' && curve.points.length > 2) {
    // Create smooth bezier curve through points
    const pathData = createSmoothPath(curve.points);
    return (
      <path
        d={pathData}
        stroke={curve.color}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={opacity}
      />
    );
  }

  // Default: straight line segments
  if (curve.points.length === 2) {
    return (
      <line
        x1={curve.points[0].x}
        y1={curve.points[0].y}
        x2={curve.points[1].x}
        y2={curve.points[1].y}
        stroke={curve.color}
        strokeWidth={strokeWidth}
        opacity={opacity}
      />
    );
  }

  // Multiple points - create polyline
  const pointsStr = curve.points.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <polyline
      points={pointsStr}
      stroke={curve.color}
      strokeWidth={strokeWidth}
      fill="none"
      opacity={opacity}
    />
  );
}

/**
 * Renders a shaded area
 */
function AreaComponent({ area }: { area: DiagramArea }) {
  const pointsStr = area.points.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <polygon
      points={pointsStr}
      fill={area.fill}
      fillOpacity={area.opacity || 0.3}
      stroke={area.fill}
      strokeWidth="1"
      strokeOpacity={0.5}
    />
  );
}

/**
 * Renders an equilibrium point
 */
function PointComponent({ point }: { point: DiagramPoint }) {
  return (
    <g className="equilibrium-point">
      {/* Point marker */}
      <circle
        cx={point.x}
        cy={point.y}
        r="4"
        fill="#1f2937"
        stroke="#fff"
        strokeWidth="1"
      />
      {/* Point label */}
      <text
        x={point.x + 8}
        y={point.y - 8}
        fontSize="11"
        fill="#1f2937"
        fontWeight="600"
      >
        {point.label}
      </text>
      {/* Dotted lines to axes */}
      <line
        x1={point.x}
        y1={point.y}
        x2={point.x}
        y2="250"
        stroke="#9ca3af"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
      <line
        x1="50"
        y1={point.y}
        x2={point.x}
        y2={point.y}
        stroke="#9ca3af"
        strokeWidth="1"
        strokeDasharray="3,3"
      />
    </g>
  );
}

/**
 * Renders a text label
 */
function LabelComponent({ label }: { label: DiagramLabel }) {
  return (
    <text
      x={label.x}
      y={label.y}
      fontSize={label.fontSize || 12}
      fill="#1f2937"
      textAnchor={label.anchor || 'start'}
      fontWeight="500"
    >
      {label.text}
    </text>
  );
}

/**
 * Creates a smooth bezier curve path through points
 */
function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to Bezier conversion
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

export default DiagramRenderer;
