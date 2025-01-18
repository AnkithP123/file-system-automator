const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    listFiles: (folderPath) => ipcRenderer.invoke("list-files", folderPath),
    renameFile: (folderPath, oldName, newName) => ipcRenderer.invoke("rename-file", folderPath, oldName, newName),
    addFile: (folderPath, fileName) => ipcRenderer.invoke("add-file", folderPath, fileName),
    addFolder: (folderPath) => ipcRenderer.invoke("add-folder", folderPath),
    moveFile: (folderPath, fileName, targetPath) => ipcRenderer.invoke("move-file", folderPath, fileName, targetPath),
    copyFile: (folderPath, fileName, targetPath) => ipcRenderer.invoke("copy-file", folderPath, fileName, targetPath),
    sortFilesInFolder: (folderPath, fileType) => ipcRenderer.invoke("sort-files-in-folder", folderPath, fileType),
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
