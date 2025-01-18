import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import Box from "./components/box";

function App() {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
    const [boxes, setBoxes] = useState([{ y: 0 }]);

    const resetPosition = () => {
        setCanvasOffset({ x: 0, y: 0 });
    };

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

    const addBox = (newBoxY) => {
        setBoxes((prevBoxes) => [...prevBoxes, { y: newBoxY }]);
        console.log(boxes);
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
            <div
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{
                    cursor: isDragging ? "grabbing" : "grab",
                    width: "100vw",
                    height: "100vh"
                }}
            >
                {boxes.map((box, index) => (
                    <Box key={index} canvasOffset={{ x: canvasOffset.x, y: canvasOffset.y}} addBox={addBox} />
                ))}
            </div>
        </div>
    );
}

export default App;