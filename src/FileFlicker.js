import React, { useState, useEffect } from "react";
import { FaTrash, FaFolder, FaFileAlt, FaWifi, FaPlus, FaPaperPlane } from "react-icons/fa";
import './FileFlicker.css';

function FileFlicker() {
    const [files, setFiles] = useState([]);
    const [localIp, setLocalIp] = useState("");
    const [targetIp, setTargetIp] = useState("");
    const [discoveredDevices, setDiscoveredDevices] = useState([]);
    const [receivedFiles, setReceivedFiles] = useState([]);
    const [isFlicking, setIsFlicking] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);
    const [isFlickerDisabled, setIsFlickerDisabled] = useState(false);

    useEffect(() => {
        // Fetch the local IP address
        window.electron.getLocalIp().then((ip) => setLocalIp(ip));

        // Discover devices on the network
        window.electron.discoverDevices().then((devices) => {
            console.log('Devices:', devices);
            if (devices === false) {
                setIsFlickerDisabled(true);
            } else {
                setIsFlickerDisabled(false);
                setDiscoveredDevices(devices);
            }
        });

        // Listen for received files
        window.electron.onFileReceived((data) => {
            console.log('HI');
            setIsReceiving(true);
            setTimeout(() => setIsReceiving(false), 1500);
            setReceivedFiles((prev) => {
                if (prev.some(file => file.fileName === data.fileName && file.filePath === data.filePath)) {
                    return prev;
                }
                return [...prev, data];
            });
        });

        window.electron.onAdd((data) => {
            console.log("Files added:", data);
            setFiles((prevFiles) => {
                const newFiles = data.pool.filter(file => !prevFiles.some(existingFile => existingFile.path === file.path));
                
                return [...prevFiles, ...newFiles];
            });
        });

        window.electron.onFlick(async (data) => {
            console.log("Files flicked:", data);
            setTargetIp(data.targetIp);
            setIsFlicking(true);
            setTimeout(() => setIsFlicking(false), 1500); // Reset animation after 1.5 seconds

            console.log("Flicking files to", data.targetIp);

            console.log("Files to flick:", files);
    
            const response = await window.electron.sendFileToIp(targetIp, files);
            console.log("Flick result:", response);
    
        });
    }, []);

    useEffect(() => {
        
        const fetchDevices = async () => {
            window.electron.discoverDevices().then((devices) => {
                console.log('Devices:', devices);
                if (devices === false) {
                    setIsFlickerDisabled(true);
                } else {
                    setIsFlickerDisabled(false);
                    setDiscoveredDevices(devices);
                }

                console.log('Disabled:', isFlickerDisabled);
            });
        };

        const interval = setInterval(fetchDevices, 3000); // Refresh every 3 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const addFile = async () => {
        const filePath = await window.electron.selectFile();
        if (filePath) {
            const fileName = filePath.split("/").pop();
            if (files.some(file => file.path === filePath)) {
                alert("File already exists in the list.");
                return;
            }
            const mockFile = {
                id: Math.random().toString(36).slice(2),
                name: fileName,
                path: filePath,
                size: 0,
                type: "file",
            };
            setFiles((prevFiles) => [...prevFiles, mockFile]);
        }
    };

    const addFolder = async () => {
        const folderPath = await window.electron.selectFolder();
        if (folderPath) {
            const folderName = folderPath.split("/").pop();
            if (files.some(file => file.path === folderPath)) {
                alert("Folder already exists in the list.");
                return;
            }
            const mockFolder = {
                id: Math.random().toString(36).slice(2),
                name: folderName,
                path: folderPath,
                size: 0,
                type: "folder",
            };
            setFiles((prevFiles) => [...prevFiles, mockFolder]);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files).map((file) => ({
            id: Math.random().toString(36).slice(2),
            name: file.name,
            path: window.electron.getPathForFile(file),
            size: file.size,
            type: file.type ? "file" : "folder",
        }));
        const newFiles = droppedFiles.filter(file => !files.some(existingFile => existingFile.path === file.path));
        if (newFiles.length < droppedFiles.length) {
            alert("Some files/folders already exist in the list.");
        }
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        console.log("Files:", files);
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
        setIsFlicking(true);
        setTimeout(() => setIsFlicking(false), 1500); // Reset animation after 1.5 seconds

        const response = await window.electron.sendFileToIp(targetIp, files);
        console.log("Flick result:", response);
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
            <div style={{ padding: "16px", borderTop: "1px solid #444", overflowY: "auto", maxHeight: "150px", minHeight: "100px", animation: isReceiving ? "glow 1.5s infinite" : "none",}}>
                {receivedFiles.map((file, index) => (
                    <div key={index} style={{ color: "#fff", marginBottom: "8px" }}>
                        Receiving {file.fileName}. Saving to {file.filePath}
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
                            width: "93%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #555",
                            background: "#444",
                            color: "#fff",
                        }}
                    />
                </div>

                {isFlickerDisabled ? (
                    <div style={{ color: "#ff0000", marginBottom: "16px" }}>
                        Flicker signaling is disabled. You cannot see or be seen by devices, or be flicked files, however you can still flick them. Press {window.electron.getPlatform() === 'darwin' ? 'Command' : 'Control'} + U to re-enable it.
                    </div>
                ) : (
                    discoveredDevices.length > 0 && (
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
                    )
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
