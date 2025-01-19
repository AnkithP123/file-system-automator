import React, { useState, useEffect } from "react";
import { FaTrash, FaFolder, FaFileAlt, FaWifi, FaPlus, FaPaperPlane } from "react-icons/fa";

function FileFlicker() {
    const [files, setFiles] = useState([]);
    const [localIp, setLocalIp] = useState("");
    const [targetIp, setTargetIp] = useState("");
    const [discoveredDevices, setDiscoveredDevices] = useState([]);
    const [receivedFiles, setReceivedFiles] = useState([]);

    useEffect(() => {
        // Fetch the local IP address
        window.electron.getLocalIp().then((ip) => setLocalIp(ip));

        // Discover devices on the network
        window.electron.discoverDevices().then((devices) => {
            setDiscoveredDevices(devices);
        });

        // Listen for received files
        window.electron.onFileReceived((data) => {
            setReceivedFiles((prev) => [...prev, data]);
        });
    }, []);

    const addFile = async () => {
        const filePath = await window.electron.selectFile();
        if (filePath) {
            const mockFile = {
                id: Math.random().toString(36).slice(2),
                name: filePath.split("/").pop(),
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
            const mockFolder = {
                id: Math.random().toString(36).slice(2),
                name: folderPath.split("/").pop(),
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
        const response = await window.electron.sendFileToIp(targetIp, files);
        console.log("Flick result:", response);
    };

    return (
        <div
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
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {file.type === "folder" ? <FaFolder /> : <FaFileAlt />}
                            <span>{file.name}</span>
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
            <div style={{ padding: "16px", borderTop: "1px solid #444" }}>
                <h3 style={{ color: "#fff" }}>Received Files</h3>
                {receivedFiles.map((file, index) => (
                    <div key={index} style={{ color: "#fff", marginBottom: "8px" }}>
                        {file.fileName} saved to {file.filePath}
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
