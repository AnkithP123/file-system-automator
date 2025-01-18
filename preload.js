const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
    listFiles: (folderPath) => ipcRenderer.invoke("list-files", folderPath),
    renameFile: (folderPath, oldName, newName) => ipcRenderer.invoke("rename-file", folderPath, oldName, newName),
    addFile: (folderPath, fileName) => ipcRenderer.invoke("add-file", folderPath, fileName),
    addFolder: (folderPath) => ipcRenderer.invoke("add-folder", folderPath),
    moveFile: (folderPath, fileName, targetPath) => ipcRenderer.invoke("move-file", folderPath, fileName, targetPath),
    copyFile: (folderPath, fileName, targetPath) => ipcRenderer.invoke("copy-file", folderPath, fileName, targetPath),
});
