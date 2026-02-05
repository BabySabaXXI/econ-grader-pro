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

// Professional muted blue palette for diagram elements
const DIAGRAM_COLORS = {
  axis: '#2E3545',
  axisLabel: '#2E3545',
  grid: '#DDE2EB',
  gridMinor: '#EEF1F6',
  point: '#161B26',
  pointStroke: '#FFFFFF',
  dottedLine: '#8B93A6',
  text: '#2E3545',
  textMuted: '#555F75',
  background: '#FAFBFC',
  border: '#DDE2EB',
  title: '#161B26',
};

/**
 * Renders any DiagramTemplate as a professional, publication-quality SVG
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
  // Add extra space at top for title
  const hasTitle = !!diagram.name;
  const titleOffset = hasTitle ? 20 : 0;
  const totalHeight = (parseInt(diagram.viewBox.split(' ')[3]) || 300) + titleOffset + 10;
  const totalWidth = parseInt(diagram.viewBox.split(' ')[2]) || 300;
  const viewBox = `0 0 ${totalWidth} ${totalHeight}`;

  return (
    <svg
      viewBox={viewBox}
      width={svgWidth}
      height={svgHeight}
      className={`diagram-svg ${className}`}
      style={{ maxWidth: '100%', height: 'auto' }}
    >
      {/* Definitions */}
      <defs>
        {/* Arrow marker */}
        <marker
          id="arrowhead-pro"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill={DIAGRAM_COLORS.axis} />
        </marker>
        {/* Grid pattern */}
        <pattern id="grid-minor" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={DIAGRAM_COLORS.gridMinor} strokeWidth="0.5" />
        </pattern>
        <pattern id="grid-major" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="url(#grid-minor)" />
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke={DIAGRAM_COLORS.grid} strokeWidth="0.5" />
        </pattern>
      </defs>

      {/* Background with subtle border */}
      <rect
        x="0.5"
        y="0.5"
        width={totalWidth - 1}
        height={totalHeight - 1}
        rx="8"
        ry="8"
        fill={DIAGRAM_COLORS.background}
        stroke={DIAGRAM_COLORS.border}
        strokeWidth="1"
      />

      {/* Title */}
      {hasTitle && (
        <text
          x={totalWidth / 2}
          y={22}
          fontSize="13"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="600"
          fill={DIAGRAM_COLORS.title}
          textAnchor="middle"
          letterSpacing="-0.01em"
        >
          {diagram.name}
        </text>
      )}

      {/* Offset group for chart content */}
      <g transform={`translate(0, ${titleOffset})`}>
        {/* Subtle grid in the chart area */}
        <rect
          x="51"
          y="51"
          width="198"
          height="198"
          fill="url(#grid-major)"
          opacity="0.5"
        />

        {/* Axes */}
        <g className="axes">
          {/* Y-axis */}
          <line
            x1="50"
            y1="45"
            x2="50"
            y2="250"
            stroke={DIAGRAM_COLORS.axis}
            strokeWidth="1.5"
            markerEnd="url(#arrowhead-pro)"
          />
          {/* X-axis */}
          <line
            x1="50"
            y1="250"
            x2="255"
            y2="250"
            stroke={DIAGRAM_COLORS.axis}
            strokeWidth="1.5"
            markerEnd="url(#arrowhead-pro)"
          />
          {/* Axis labels */}
          <text
            x="18"
            y="150"
            fontSize="11"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="500"
            fill={DIAGRAM_COLORS.axisLabel}
            textAnchor="middle"
            transform="rotate(-90, 18, 150)"
            letterSpacing="-0.01em"
          >
            {diagram.axis.yLabel}
          </text>
          <text
            x="150"
            y="278"
            fontSize="11"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="500"
            fill={DIAGRAM_COLORS.axisLabel}
            textAnchor="middle"
            letterSpacing="-0.01em"
          >
            {diagram.axis.xLabel}
          </text>
          {/* Origin */}
          <text
            x="40"
            y="264"
            fontSize="10"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="400"
            fill={DIAGRAM_COLORS.textMuted}
          >
            O
          </text>
        </g>

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
      </g>
    </svg>
  );
}

/**
 * Renders a curve (line, dashed, or bezier) with professional styling
 */
function CurveComponent({ curve, isHighlighted }: { curve: DiagramCurve; isHighlighted?: boolean }) {
  const baseWidth = curve.strokeWidth || 2;
  const strokeWidth = isHighlighted ? baseWidth + 1 : baseWidth;
  const opacity = isHighlighted ? 1 : 0.85;

  if (curve.type === 'dashed') {
    if (curve.points.length === 2) {
      return (
        <line
          x1={curve.points[0].x}
          y1={curve.points[0].y}
          x2={curve.points[1].x}
          y2={curve.points[1].y}
          stroke={curve.color}
          strokeWidth={strokeWidth}
          strokeDasharray="6,4"
          opacity={opacity}
          strokeLinecap="round"
        />
      );
    }
    const pointsStr = curve.points.map(p => `${p.x},${p.y}`).join(' ');
    return (
      <polyline
        points={pointsStr}
        stroke={curve.color}
        strokeWidth={strokeWidth}
        strokeDasharray="6,4"
        fill="none"
        opacity={opacity}
        strokeLinecap="round"
      />
    );
  }

  if (curve.type === 'curve' && curve.points.length > 2) {
    const pathData = createSmoothPath(curve.points);
    return (
      <path
        d={pathData}
        stroke={curve.color}
        strokeWidth={strokeWidth}
        fill="none"
        opacity={opacity}
        strokeLinecap="round"
        strokeLinejoin="round"
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
        strokeLinecap="round"
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
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/**
 * Renders a shaded area with softer styling
 */
function AreaComponent({ area }: { area: DiagramArea }) {
  const pointsStr = area.points.map(p => `${p.x},${p.y}`).join(' ');
  return (
    <polygon
      points={pointsStr}
      fill={area.fill}
      fillOpacity={area.opacity || 0.2}
      stroke={area.fill}
      strokeWidth="0.5"
      strokeOpacity={0.3}
    />
  );
}

/**
 * Renders an equilibrium point with professional markers
 */
function PointComponent({ point }: { point: DiagramPoint }) {
  return (
    <g className="equilibrium-point">
      {/* Dotted lines to axes — lighter, more refined */}
      <line
        x1={point.x}
        y1={point.y}
        x2={point.x}
        y2={250}
        stroke={DIAGRAM_COLORS.dottedLine}
        strokeWidth="0.75"
        strokeDasharray="3,3"
        opacity={0.6}
      />
      <line
        x1={50}
        y1={point.y}
        x2={point.x}
        y2={point.y}
        stroke={DIAGRAM_COLORS.dottedLine}
        strokeWidth="0.75"
        strokeDasharray="3,3"
        opacity={0.6}
      />
      {/* Point marker — larger, more visible */}
      <circle
        cx={point.x}
        cy={point.y}
        r="4.5"
        fill={DIAGRAM_COLORS.point}
        stroke={DIAGRAM_COLORS.pointStroke}
        strokeWidth="1.5"
      />
      {/* Point label */}
      <text
        x={point.x + 8}
        y={point.y - 8}
        fontSize="11"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="600"
        fill={DIAGRAM_COLORS.text}
        letterSpacing="-0.01em"
      >
        {point.label}
      </text>
    </g>
  );
}

/**
 * Renders a text label with professional font
 */
function LabelComponent({ label }: { label: DiagramLabel }) {
  return (
    <text
      x={label.x}
      y={label.y}
      fontSize={label.fontSize || 11}
      fontFamily="system-ui, -apple-system, sans-serif"
      fontWeight="600"
      fill={DIAGRAM_COLORS.text}
      textAnchor={label.anchor || 'start'}
      letterSpacing="-0.01em"
    >
      {label.text}
    </text>
  );
}

/**
 * Creates a smooth bezier curve path through points using Catmull-Rom interpolation
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
