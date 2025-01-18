const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
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
});
