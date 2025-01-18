import React, { useState } from "react";

function App() {
    const [folderPath, setFolderPath] = useState("");
    const [fileName, setFileName] = useState("");
    const [newFileName, setNewFileName] = useState("");
    const [targetPath, setTargetPath] = useState("");
    const [fileList, setFileList] = useState([]);
    const [fileType, setFileType] = useState("");

    // List files in the specified folder
    const listFiles = () => {
        window.electron.listFiles(folderPath)
            .then((files) => setFileList(files))
            .catch((error) => alert(`Error: ${error.message}`));
    };

    // Rename a file
    const renameFile = () => {
        window.electron.renameFile(folderPath, fileName, newFileName)
            .then(() => alert("File renamed successfully!"))
            .catch((error) => alert(`Error: ${error.message}`));
    };

    // Add a file
    const addFile = () => {
        window.electron.addFile(folderPath, fileName)
            .then(() => alert("File created successfully!"))
            .catch((error) => alert(`Error: ${error.message}`));
    };

    // Add a folder
    const addFolder = () => {
        window.electron.addFolder(folderPath)
            .then(() => alert("Folder created successfully!"))
            .catch((error) => alert(`Error: ${error.message}`));
    };

    // Move a file
    const moveFile = () => {
        window.electron.moveFile(folderPath, fileName, targetPath)
            .then(() => alert("File moved successfully!"))
            .catch((error) => alert(`Error: ${error.message}`));
    };

    // Copy a file
    const copyFile = () => {
        window.electron.copyFile(folderPath, fileName, targetPath)
            .then(() => alert("File copied successfully!"))
            .catch((error) => alert(`Error: ${error.message}`));
    };

    // Sort files by type
    const sortFilesByType = () => {
        window.electron.sortFilesInFolder(folderPath, fileType)
            .then((sortedFiles) => setFileList(sortedFiles))
            .catch((error) => alert(`Error: ${error.message}`));
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>File System Operations</h1>
            <div style={{ marginBottom: "20px" }}>
                <label>
                    <strong>Folder Path:</strong>
                    <input
                        type="text"
                        value={folderPath}
                        onChange={(e) => setFolderPath(e.target.value)}
                        placeholder="e.g., /Users/YourName/Downloads"
                        style={{ marginLeft: "10px", width: "300px" }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label>
                    <strong>File Name:</strong>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder="e.g., file.txt"
                        style={{ marginLeft: "10px", width: "200px" }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label>
                    <strong>New File Name / Target Path:</strong>
                    <input
                        type="text"
                        value={newFileName || targetPath}
                        onChange={(e) => {
                            if (newFileName) setNewFileName(e.target.value);
                            if (targetPath) setTargetPath(e.target.value);
                        }}
                        placeholder="e.g., newfile.txt or /Users/YourName/Documents"
                        style={{ marginLeft: "10px", width: "300px" }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label>
                    <strong>File Type:</strong>
                    <select value={fileType} onChange={(e) => setFileType(e.target.value)} style={{ marginLeft: "10px", width: "200px" }}>
                        <option value="">Select file type</option>
                        <option value="txt">Text Files</option>
                        <option value="jpg">JPEG Images</option>
                        <option value="png">PNG Images</option>
                        <option value="pdf">PDF Files</option>
                    </select>
                </label>
                <button onClick={sortFilesByType} style={{ marginLeft: "10px" }}>Sort Files</button>
            </div>

            <button onClick={listFiles} style={{ marginRight: "10px" }}>List Files</button>
            <button onClick={renameFile} style={{ marginRight: "10px" }}>Rename File</button>
            <button onClick={addFile} style={{ marginRight: "10px" }}>Add File</button>
            <button onClick={addFolder} style={{ marginRight: "10px" }}>Add Folder</button>
            <button onClick={moveFile} style={{ marginRight: "10px" }}>Move File</button>
            <button onClick={copyFile} style={{ marginRight: "10px" }}>Copy File</button>

            <h2>File List:</h2>
            <ul>
                {fileList.map((file, index) => (
                    <li key={index}>{file}</li>
                ))}
            </ul>
        </div>
    );
}

export default App;