import React, { useRef, useEffect, useState } from "react";
import { FaHome } from "react-icons/fa";

function App() {
    const canvasRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });

    const resetPosition = () => {
        setCanvasOffset({ x: 0, y: 0 });
    };

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

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setCanvasOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    return (
        <div style={{ overflow: "hidden" }}>
            <button 
                onClick={resetPosition} 
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    padding: "10px",
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    zIndex: 1000
                }}
            >
                <FaHome />
            </button>
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{
                    cursor: isDragging ? "grabbing" : "grab",
                    width: "100vw",
                    height: "100vh",
                    display: "block",
                }}
            />
        </div>
    );
}

export default App;