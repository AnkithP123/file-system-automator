// Box.js
import React from 'react';

function Box({ canvasOffset, addBox }) {
    const handleAddBoxClick = () => {
        addBox(0); // Add new box 10 pixels below the current one
    };

    // Calculate the position of the "+" button
    const rectWidth = 200;
    const rectHeight = 100;
    const rectX = (window.innerWidth - rectWidth) / 2 + canvasOffset.x;
    const rectY = (window.innerHeight - rectHeight) / 2 + canvasOffset.y;

    return (
        <div style={{ position: 'absolute', top: `${rectY}px`, left: `${rectX}px`, width: `${rectWidth}px`, height: `${rectHeight}px` }}>
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }}
            ></div>
            <button 
                onClick={handleAddBoxClick}
                style={{
                    position: 'absolute',
                    top: `${rectHeight - 18}px`,
                    left: `${rectWidth / 2 - 20}px`,
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