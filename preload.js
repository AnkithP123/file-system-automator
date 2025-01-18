const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
<<<<<<< HEAD
    listFiles: (folderPath) => ipcRenderer.invoke("list-files", folderPath),
    renameFile: (folderPath, oldName, newName) => ipcRenderer.invoke("rename-file", folderPath, oldName, newName),
    addFile: (folderPath, fileName) => ipcRenderer.invoke("add-file", folderPath, fileName),
    addFolder: (folderPath) => ipcRenderer.invoke("add-folder", folderPath),
    moveFile: (folderPath, fileName, targetPath) => ipcRenderer.invoke("move-file", folderPath, fileName, targetPath),
    copyFile: (folderPath, fileName, targetPath) => ipcRenderer.invoke("copy-file", folderPath, fileName, targetPath),
    deleteFile: (filePath) => ipcRenderer.invoke("delete-file", filePath),
    deleteFolder: (folderPath) => ipcRenderer.invoke("delete-folder", folderPath),
    checkFileExists: (filePath) => ipcRenderer.invoke("check-file-exists", filePath),
    getFileDetails: (filePath) => ipcRenderer.invoke("get-file-details", filePath),
    readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke("write-file", filePath, content),
    listSubfolders: (folderPath) => ipcRenderer.invoke("list-subfolders", folderPath),
    recursiveFolderListing: (folderPath) => ipcRenderer.invoke("recursive-folder-listing", folderPath),
    countFilesInFolder: (folderPath) => ipcRenderer.invoke("count-files-in-folder", folderPath),
    zipFolder: (folderPath, zipPath) => ipcRenderer.invoke("zip-folder", folderPath, zipPath),
    unzipFile: (zipPath, targetPath) => ipcRenderer.invoke("unzip-file", zipPath, targetPath),
    fileHash: (filePath) => ipcRenderer.invoke("file-hash", filePath),
    openFile: (filePath) => ipcRenderer.invoke("open-file", filePath),
=======
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
>>>>>>> 24dc07cd22bdb3bdcf43c7a4028945d4ee19d842
});
