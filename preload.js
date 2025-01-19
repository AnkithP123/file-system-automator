const { contextBridge, ipcRenderer, webUtils } = require("electron");

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
    sendFiles: (filePaths) => ipcRenderer.send("files-dropped", filePaths),
    selectFile: () =>
        ipcRenderer.invoke("dialog:openFile").then((result) => result || null),
    selectFolder: () =>
        ipcRenderer.invoke("dialog:openFolder").then((result) => result || null),
    getPathForFile: (file) => webUtils.getPathForFile(file),
    getLocalIp: () => ipcRenderer.invoke("get-local-ip"),
    sendFileToIp: (targetIp, files) => ipcRenderer.invoke("file:send", targetIp, files),
    discoverDevices: () => ipcRenderer.invoke("network:discover"),
    onFileReceived: (callback) => ipcRenderer.on("file-received", (event, data) => callback(data)),
    getComputerName: async () => {
        // You can use OS module to get computer name
        return require('os').hostname();
      }

});
