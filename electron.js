const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
        },
    });

    mainWindow.loadURL("http://localhost:3000"); // Adjust for your React app's URL
});

ipcMain.handle("list-files", async (event, folderPath) => {
    try {
        return fs.readdirSync(folderPath);
    } catch (error) {
        throw new Error(`Failed to list files: ${error.message}`);
    }
});

ipcMain.handle("rename-file", async (event, folderPath, oldName, newName) => {
    try {
        const oldPath = path.join(folderPath, oldName);
        const newPath = path.join(folderPath, newName);
        fs.renameSync(oldPath, newPath);
    } catch (error) {
        throw new Error(`Failed to rename file: ${error.message}`);
    }
});

ipcMain.handle("add-file", async (event, folderPath, fileName) => {
    try {
        const filePath = path.join(folderPath, fileName);
        fs.writeFileSync(filePath, "");
    } catch (error) {
        throw new Error(`Failed to create file: ${error.message}`);
    }
});

ipcMain.handle("add-folder", async (event, folderPath) => {
    try {
        fs.mkdirSync(folderPath);
    } catch (error) {
        throw new Error(`Failed to create folder: ${error.message}`);
    }
});

ipcMain.handle("move-file", async (event, folderPath, fileName, targetPath) => {
    try {
        const sourcePath = path.join(folderPath, fileName);
        const destinationPath = path.join(targetPath, fileName);
        fs.renameSync(sourcePath, destinationPath);
    } catch (error) {
        throw new Error(`Failed to move file: ${error.message}`);
    }
});

ipcMain.handle("copy-file", async (event, folderPath, fileName, targetPath) => {
    try {
        const sourcePath = path.join(folderPath, fileName);
        const destinationPath = path.join(targetPath, fileName);
        fs.copyFileSync(sourcePath, destinationPath);
    } catch (error) {
        throw new Error(`Failed to copy file: ${error.message}`);
    }
});

ipcMain.handle("sort-files-in-folder", async (event, folderPath, fileType) => {
    try {
        const files = fs.readdirSync(folderPath);
        
        // Filter and sort files by the specified type
        const filteredFiles = files.filter(file => file.endsWith(`.${fileType}`)).sort();

        const sortedFiles = [...filteredFiles, ...files.filter(file => !file.endsWith(`.${fileType}`))];

        // Rename files to reflect the new order with temporary prefixes
        for (let i = 0; i < sortedFiles.length; i++) {
            const oldPath = path.join(folderPath, sortedFiles[i]);
            const newPath = path.join(folderPath, `${i.toString().padStart(3, '0')}_${sortedFiles[i]}`);
            fs.renameSync(oldPath, newPath);
        }

                                            

        return sortedFiles;
    } catch (error) {
        throw new Error(`Failed to sort files: ${error.message}`);
    }
});