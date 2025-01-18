// Box.js
import React, { useEffect, useRef } from 'react';

function Box({ canvasOffset, addBox }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Fill the canvas with a black-grayish color
        ctx.fillStyle = "#2c2c2c";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw a rounded rectangle in the middle
        const rectWidth = 200;
        const rectHeight = 100;
        const rectX = (canvas.width - rectWidth) / 2 + canvasOffset.x;
        const rectY = (canvas.height - rectHeight) / 2 + canvasOffset.y;

        ctx.beginPath();
        ctx.moveTo(rectX + 20, rectY);
        ctx.lineTo(rectX + rectWidth - 20, rectY);
        ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + 20);
        ctx.lineTo(rectX + rectWidth, rectY + rectHeight - 20);
        ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - 20, rectY + rectHeight);
        ctx.lineTo(rectX + 20, rectY + rectHeight);
        ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - 20);
        ctx.lineTo(rectX, rectY + 20);
        ctx.quadraticCurveTo(rectX, rectY, rectX + 20, rectY);
        ctx.closePath();

        ctx.fillStyle = "#ffffff";
        ctx.fill();
    }, [canvasOffset]);

    const handleAddBoxClick = () => {
        addBox(0); // Add new box 25 pixels below the current one
    };

    // Calculate the position of the "+" button
    const rectWidth = 200;
    const rectHeight = 100;
    const rectX = (window.innerWidth - rectWidth) / 2 + canvasOffset.x;
    const rectY = (window.innerHeight - rectHeight) / 2 + canvasOffset.y;

    return (
        <div style={{ position: 'relative' }}>
            <canvas
                ref={canvasRef}
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "block",
                }}
            />
            <button 
                onClick={handleAddBoxClick}
                style={{
                    position: 'absolute',
                    top: `${rectY + rectHeight - 18}px`,
                    left: `${rectX + rectWidth / 2 - 20}px`,
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '24px',
                    cursor: 'pointer',
                    zIndex: 1000,
                }}
            >
                +
            </button>
        </div>
    );
}

export default Box;