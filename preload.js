const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    // File operations
    createFile: (filePath) => ipcRenderer.invoke("create-file", filePath),
    readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
    appendToFile: (filePath, content) => ipcRenderer.invoke("append-to-file", filePath, content),
    deleteFile: (filePath) => ipcRenderer.invoke("delete-file", filePath),
    moveFile: (sourcePath, destinationPath) => ipcRenderer.invoke("move-file", sourcePath, destinationPath),
    copyFile: (sourcePath, destinationPath) => ipcRenderer.invoke("copy-file", sourcePath, destinationPath),
    renameFile: (oldPath, newPath) => ipcRenderer.invoke("rename-file", oldPath, newPath),
    
    // Directory operations
    createDirectory: (folderPath) => ipcRenderer.invoke("create-directory", folderPath),
    listDirectory: (folderPath) => ipcRenderer.invoke("list-directory", folderPath),
    deleteDirectory: (folderPath) => ipcRenderer.invoke("delete-directory", folderPath),
    
    // Advanced operations
    compressFiles: (files, zipPath) => ipcRenderer.invoke("compress-files", files, zipPath),
    executeCommand: (command) => ipcRenderer.invoke("execute-command", command),
    
    // Utilities
    openFile: (filePath) => ipcRenderer.invoke("open-file", filePath),
    searchFiles: (folderPath, searchTerm) => ipcRenderer.invoke("search-files", folderPath, searchTerm),

    // Example for chaining workflows:
    chainModules: async (operations) => {
        // operations = [{ name: "readFile", args: ["/path/to/file"] }, ...]
        let result = null;
        for (const op of operations) {
            if (typeof ipcRenderer.invoke !== "function") {
                throw new Error(`Unsupported operation: ${op.name}`);
            }
            result = await ipcRenderer.invoke(op.name, ...op.args);
            if (!result.success) {
                throw new Error(`Operation ${op.name} failed: ${result.message}`);
            }
        }
        return result;
    }
});
