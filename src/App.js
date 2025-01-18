import React, { useState } from "react";
import { FaHome } from "react-icons/fa";
import Box from "./components/box";
import Line from "./components/line";

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

    const addBox = () => {
        setBoxes((prevBoxes) => {
            const lastBox = prevBoxes[prevBoxes.length - 1];
            const newBoxY = lastBox.y + 280; 
            return [...prevBoxes, { y: newBoxY }];
        });
    };

    return (
        <div style={{ overflow: "hidden", backgroundColor: "#2c2c2c", width: "100vw", height: "100vh" }}>
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
                    width: "100%",
                    height: "100%"
                }}
            >
                {boxes.map((box, index) => (
                    <><Box key={index} canvasOffset={{ x: canvasOffset.x, y: canvasOffset.y + box.y }} addBox={addBox} />
                    { index !== 0 ? <Line x1={((window.innerWidth - 200) / 2 + canvasOffset.x) + 93} y1={(window.innerHeight - 100) / 2 + (canvasOffset.y + box.y - 125)} x2={((window.innerWidth - 200) / 2 + canvasOffset.x) + 93} y2={(window.innerHeight - 100) / 2 + (canvasOffset.y + box.y) - 40} isCurved={true} />
                     : <></>
                    }</>
                ))}
            </div>
        </div>
    );
}

export default App;