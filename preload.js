const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    createFile: (filePath) => ipcRenderer.invoke("create-file", filePath),
    readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
    appendToFile: (filePath, content) => ipcRenderer.invoke("append-to-file", filePath, content),
    deleteFile: (filePath) => ipcRenderer.invoke("delete-file", filePath),
    renameFile: (filePath, newFilePath) => ipcRenderer.invoke("rename-file", filePath, newFilePath),
    moveFile: (filePath, destinationPath) => ipcRenderer.invoke("move-file", filePath, destinationPath),
    copyFile: (filePath, destinationPath) => ipcRenderer.invoke("copy-file", filePath, destinationPath),
    createDirectory: (folderPath) => ipcRenderer.invoke("create-directory", folderPath),
    listDirectory: (folderPath) => ipcRenderer.invoke("list-directory", folderPath),
    deleteDirectory: (folderPath) => ipcRenderer.invoke("delete-directory", folderPath),
    recursiveFolderStats: (folderPath) => ipcRenderer.invoke("recursive-folder-stats", folderPath),
    compressFolder: (folderPath, zipPath) => ipcRenderer.invoke("compress-folder", folderPath, zipPath),
    unzipFile: (zipPath, targetPath) => ipcRenderer.invoke("unzip-file", zipPath, targetPath),
    executeShellCommand: (command) => ipcRenderer.invoke("execute-command", command),
    searchContent: (folderPath, searchTerm) => ipcRenderer.invoke("search-content", folderPath, searchTerm),
});
