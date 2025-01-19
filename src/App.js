import React, { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
import Box from "./components/box";
import Line from "./components/line";
import { BoxProvider, useBoxContext } from './components/BoxContext';

function AppContent() {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
    const { boxes, addBox } = useBoxContext();

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setCanvasOffset({
            x: canvasOffset.x + (e.clientX - dragStart.x),
            y: canvasOffset.y + (e.clientY - dragStart.y),
        });
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    return (
        <div style={{ overflow: "hidden", backgroundColor: "#2c2c2c", width: "100vw", height: "100vh" }}>
            <button 
                onClick={() => setCanvasOffset({ x: 0, y: 0 })}
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
                    height: "100%",
                    overflow: "hidden",
                }}
            >
                {boxes.map((box, index) => (
                    <React.Fragment key={index}>
                        <Box
                            canvasOffset={canvasOffset}
                            addBox={addBox}
                            index={index}
                            y={box.y}
                        />
                        {index !== 0 && (
                            <Line
                                x1={((window.innerWidth - 300) / 2 + canvasOffset.x) + 150}
                                y1={(window.innerHeight - 150) / 2 + (canvasOffset.y + box.y - 115)}
                                x2={((window.innerWidth - 300) / 2 + canvasOffset.x) + 150}
                                y2={(window.innerHeight - 150) / 2 + (canvasOffset.y + box.y)}
                                isCurved={true}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

function App() {
    return (
        <BoxProvider>
            <AppContent />
        </BoxProvider>
    );
}

export default App;

