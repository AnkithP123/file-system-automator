// Import necessary hooks and components
import React, { useState } from 'react';
import { FaMousePointer } from 'react-icons/fa';

function Modal({ args, onArgChange, onClose, boxes, currentBoxIndex }) {
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedArg, setSelectedArg] = useState(null);
    const [dropdownOptions, setDropdownOptions] = useState([]);

    const handleMouseClick = (argId) => {
        setIsSelectionMode(true);
        setSelectedArg(argId);
    };

    const handleBoxSelection = (boxIndex, boxArgs) => {
        console.log('boxIndex:', boxArgs);
        if (selectedArg !== null && boxIndex !== currentBoxIndex) {
            if (typeof boxArgs === 'object' && boxArgs !== null) {
                const options = Object.keys(boxArgs);
                if (options.length > 1) {
                    setDropdownOptions(options);
                } else {
                    onArgChange(selectedArg, JSON.stringify(boxArgs[options[0]]));
                    setIsSelectionMode(false);
                    setSelectedArg(null);
                }
            } else {
                onArgChange(selectedArg, JSON.stringify(boxArgs));
                setIsSelectionMode(false);
                setSelectedArg(null);
            }
        }
    };

    const handleDropdownSelection = (selection) => {
        if (selection && dropdownOptions.includes(selection)) {
            onArgChange(selectedArg, JSON.stringify(boxes.find(box => box.returnType[selection])[selection]));
            setIsSelectionMode(false);
            setSelectedArg(null);
            setDropdownOptions([]);
        } else {
            alert('Invalid selection. Please try again.');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            pointerEvents: 'auto'
        }}>
            {!isSelectionMode ? (
                <div style={{
                    width: '400px',
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    padding: '20px',
                    boxSizing: 'border-box',
                    position: 'relative'
                }}>
                    <h2 style={{ textAlign: 'center', fontWeight: 'bold' }}>Arguments Editor</h2>
                    <div style={{ margin: '20px 0' }}>
                        {args.map((arg) => (
                            <div key={arg.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                <label style={{ marginRight: '10px' }}>{`Argument ${arg.id} (${arg.value}):`}</label>
                                <textarea
                                    name={`Arg #${arg.id}:`}
                                    value={arg.value}
                                    onChange={(e) => onArgChange(arg.id, e.target.value)}
                                    style={{
                                        width: 'calc(100% - 40px)',
                                        padding: '8px',
                                        borderRadius: '5px',
                                        border: '1px solid #ccc',
                                        boxSizing: 'border-box',
                                        marginRight: '20px'
                                    }}
                                />
                                <button
                                    onClick={() => handleMouseClick(arg.id)}
                                    style={{
                                        width: '60px',
                                        height: '40px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: '5px',
                                        backgroundColor: '#007bff',
                                        color: '#fff',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FaMousePointer />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            bottom: '5px',
                            right: '20px',
                            padding: '10px',
                            backgroundColor: '#ff0000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            ) : (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '20px',
                    boxSizing: 'border-box'
                }}>
                    {boxes.map((box, index) => (
                        index !== currentBoxIndex && (
                            <div
                                key={index}
                                onClick={() => handleBoxSelection(index, box.returnType)}
                                style={{
                                    width: '200px',
                                    height: '100px',
                                    backgroundColor: '#fff',
                                    margin: '10px',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    opacity: index === currentBoxIndex ? 0.5 : 1
                                }}
                            >
                                <h3>Box {index + 1}</h3>
                                <p>Function: {box.selectedStep}</p>
                            </div>
                        )
                    ))}
                    {dropdownOptions.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '10px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                            <h3>Select an option:</h3>
                            <select 
                                onChange={(e) => handleDropdownSelection(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginTop: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc'
                                }}
                            >
                                <option value="">-- Select --</option>
                                {dropdownOptions.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={() => setIsSelectionMode(false)}
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            padding: '10px',
                            backgroundColor: '#ff0000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel Selection
                    </button>
                </div>
            )}
        </div>
    );
}

export default Modal;

