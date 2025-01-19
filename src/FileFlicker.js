import React, { useState, useEffect } from "react";
import { FaTrash, FaFolder, FaFileAlt, FaWifi, FaPlus, FaPaperPlane } from "react-icons/fa";
import './FileFlicker.css';

const API_URL = 'http://localhost:3636';

function FileFlicker() {
    const [files, setFiles] = useState([]);
    const [localIp, setLocalIp] = useState("");
    const [targetIp, setTargetIp] = useState("");
    const [discoveredDevices, setDiscoveredDevices] = useState([]);
    const [receivedFiles, setReceivedFiles] = useState([]);
    const [isFlicking, setIsFlicking] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);
    const [deviceName, setDeviceName] = useState(`Device-${Math.random().toString(36).slice(2, 7)}`);

    useEffect(() => {
        // Register device and start heartbeat
        const registerDevice = async () => {
            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: deviceName })
                });
                const data = await response.json();
                setLocalIp(data.ip);
            } catch (error) {
                console.error('Registration failed:', error);
            }
        };

        registerDevice();

        // Start heartbeat
        const heartbeatInterval = setInterval(async () => {
            try {
                await fetch(`${API_URL}/heartbeat`, {
                    method: 'POST'
                });
            } catch (error) {
                console.error('Heartbeat failed:', error);
            }
        }, 10000);

        // Start checking for received files
        const checkFilesInterval = setInterval(checkForFiles, 5000);

        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(checkFilesInterval);
        };
    }, [deviceName]);

    // Check for available devices periodically
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch(`${API_URL}/devices`);
                const devices = await response.json();
                setDiscoveredDevices(devices.filter(device => device.ip !== localIp));
            } catch (error) {
                console.error('Failed to fetch devices:', error);
            }
        };

        fetchDevices();
        const interval = setInterval(fetchDevices, 5000);
        return () => clearInterval(interval);
    }, [localIp]);

    const checkForFiles = async () => {
        try {
            const response = await fetch(`${API_URL}/receive`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.hasFiles) {
                setIsReceiving(true);
                for (const file of data.files) {
                    try {
                        const downloadResponse = await fetch(`${API_URL}/download/${file.filename}`);
                        const blob = await downloadResponse.blob();
                        
                        // Create download link
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = file.originalName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);

                        setReceivedFiles(prev => [...prev, {
                            fileName: file.originalName,
                            filePath: 'Downloads folder',
                            sender: file.senderIp
                        }]);
                    } catch (error) {
                        console.error('Failed to download file:', error);
                    }
                }
                setTimeout(() => setIsReceiving(false), 1500);
            }
        } catch (error) {
            console.error('Failed to check for files:', error);
        }
    };

    const addFile = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const mockFile = {
                    id: Math.random().toString(36).slice(2),
                    name: file.name,
                    path: file.name,
                    size: file.size,
                    type: "file",
                    file: file // Store the actual file object
                };
                setFiles(prevFiles => [...prevFiles, mockFile]);
            }
        };
        input.click();
    };

    const addFolder = () => {
        alert("Folder upload is not supported in this version");
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files).map((file) => ({
            id: Math.random().toString(36).slice(2),
            name: file.name,
            path: file.name,
            size: file.size,
            type: "file",
            file: file
        }));
        setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const removeFile = (fileId) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    };

    const clearPool = () => {
        setFiles([]);
    };

    const handleFlick = async () => {
        if (!targetIp || files.length === 0) return;

        setIsFlicking(true);
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file.file);
        });
        formData.append('targetIp', targetIp);

        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.message) {
                setFiles([]); // Clear files after successful upload
            }
        } catch (error) {
            console.error('Failed to send files:', error);
            alert('Failed to send files. Please try again.');
        }

        setTimeout(() => setIsFlicking(false), 1500);
    };

    return (
        <div
            className={`file-flicker-container ${isReceiving ? "receiving" : ""}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
                display: "flex",
                flexDirection: "column",
                width: "320px",
                height: "100vh",
                backgroundColor: "#2c2c2c",
                color: "#f0f0f0",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "16px",
                    borderBottom: "1px solid #444",
                }}
            >
                <h2 style={{ margin: 0 }}>File Flicker</h2>
                <button
                    style={{
                        background: "none",
                        color: "#ccc",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={clearPool}
                >
                    <FaTrash />
                </button>
            </div>

            {/* Add File and Folder Buttons */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "16px",
                    borderBottom: "1px solid #444",
                }}
            >
                <button
                    onClick={addFile}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "48%",
                        padding: "8px",
                        background: "#555",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    <FaPlus style={{ marginRight: "8px" }} />
                    Add File
                </button>
                <button
                    onClick={addFolder}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "48%",
                        padding: "8px",
                        background: "#555",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    <FaFolder style={{ marginRight: "8px" }} />
                    Add Folder
                </button>
            </div>

            {/* File List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                {files.map((file) => (
                    <div
                        key={file.id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                            padding: "8px",
                            background: "#444",
                            borderRadius: "4px",
                            animation: isFlicking ? "flick 0.5s ease-in-out" : "none",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                            {file.type === "folder" ? <FaFolder /> : <FaFileAlt />}
                            <span style={{ wordWrap: "break-word", overflowWrap: "anywhere" }}>{file.name}</span>
                        </div>
                        <button
                            onClick={() => removeFile(file.id)}
                            style={{
                                background: "none",
                                color: "#ccc",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>

            {/* Received Files */}
            <div style={{ padding: "16px", borderTop: "1px solid #444", overflowY: "auto", maxHeight: "150px", minHeight: "100px", animation: isReceiving ? "glow 1.5s infinite" : "none" }}>
                {receivedFiles.map((file, index) => (
                    <div key={index} style={{ color: "#fff", marginBottom: "8px" }}>
                        Receiving {file.fileName} from {file.sender}
                    </div>
                ))}
            </div>

            {/* IP and Actions */}
            <div style={{ padding: "16px", borderTop: "1px solid #444" }}>
                <div style={{ marginBottom: "16px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                        }}
                    >
                        <FaWifi />
                        <span>Your IP: {localIp}</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Enter target IP..."
                        value={targetIp}
                        onChange={(e) => setTargetIp(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #555",
                            background: "#444",
                            color: "#fff",
                        }}
                    />
                </div>

                {discoveredDevices.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                        <hr style={{ borderColor: "#555" }} />
                        <p style={{ fontSize: "12px", color: "#aaa" }}>Discovered devices:</p>
                        {discoveredDevices.map((device) => (
                            <button
                                key={device.ip}
                                onClick={() => setTargetIp(device.ip)}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "8px",
                                    marginBottom: "8px",
                                    background: "#555",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                <FaWifi style={{ marginRight: "8px" }} />
                                {device.name} ({device.ip})
                            </button>
                        ))}
                    </div>
                )}

                {/* Flick Files Button */}
                <button
                    onClick={handleFlick}
                    disabled={!targetIp || files.length === 0}
                    style={{
                        width: "100%",
                        padding: "8px",
                        background: !targetIp || files.length === 0 ? "#555" : "#008cba",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: !targetIp || files.length === 0 ? "not-allowed" : "pointer",
                    }}
                >
                    <FaPaperPlane style={{ marginRight: "8px" }} />
                    Flick Files
                </button>
            </div>
        </div>
    );
}

export default FileFlicker;