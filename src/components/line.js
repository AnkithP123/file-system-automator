// Line.js
import React from 'react';

function Line({ x1, y1, x2, y2, isCurved }) {
    const arrowId = "arrowhead";

    // Define the path for the line
    const linePath = isCurved
        ? `M${x1},${y1} Q${(x1 + x2) / 2},${y1 - 50} ${x2},${y2}` // Curved line (quadratic Bezier curve)
        : `M${x1},${y1} L${x2},${y2}`; // Straight line

    return (
        <svg width="100%" height="100%" style={{ position: 'absolute', pointerEvents: 'none' }}>
            {/* Define the arrowhead marker */}
            <defs>
                <marker
                    id={arrowId}
                    markerWidth="10"
                    markerHeight="7"
                    refX="0"
                    refY="3.5"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
                </marker>
            </defs>
            {/* Draw the line with the arrowhead marker at the end */}
            <path
                d={linePath}
                stroke="#555" // Lighter stroke color
                strokeWidth="2" // Reduced stroke width
                fill="none"
            />
        </svg>
    );
}

export default Line;