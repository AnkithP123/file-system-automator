import React from 'react';

function Modal({ args, onArgChange, onClose }) {
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
            zIndex: 1000
        }}>
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
                        <div key={arg.id} style={{ marginBottom: '10px' }}>
                            <label>{`Option ${arg.id}:`}</label>
                            <textarea
                                name={`option${arg.id}`}
                                value={arg.value}
                                onChange={(e) => onArgChange(arg.id, e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    boxSizing: 'border-box',
                                    marginBottom: '10px'
                                }}
                            />
                        </div>
                    ))}
                </div>
                <button 
                    onClick={onClose}
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
                    Close
                </button>
            </div>
        </div>
    );
}

export default Modal;