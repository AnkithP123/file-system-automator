const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const archiver = require("archiver");
const unzipper = require("unzipper");
const { exec } = require("child_process");

let mainWindow;

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
        },
    });

    mainWindow.loadURL("http://localhost:3000");
});

// Utility function for responses
function createResponse(success, data = {}, message = "") {
    return { success, data, message };
}

// --- File Operations ---
ipcMain.handle("create-file", async (event, filePath) => {
    try {
        fs.writeFileSync(filePath, "");
        return createResponse(true, { filePath }, "File created successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to create file: ${error.message}`);
    }
});

ipcMain.handle("read-file", async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        return createResponse(true, { content }, "File read successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to read file: ${error.message}`);
    }
});

ipcMain.handle("append-to-file", async (event, filePath, content) => {
    try {
        fs.appendFileSync(filePath, content);
        return createResponse(true, { filePath }, "Content appended successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to append to file: ${error.message}`);
    }
});

ipcMain.handle("delete-file", async (event, filePath) => {
    try {
        fs.unlinkSync(filePath);
        return createResponse(true, { filePath }, "File deleted successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to delete file: ${error.message}`);
    }
});

// --- Directory Operations ---
ipcMain.handle("create-directory", async (event, folderPath) => {
    try {
        fs.mkdirSync(folderPath, { recursive: true });
        return createResponse(true, { folderPath }, "Directory created successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to create directory: ${error.message}`);
    }
});

ipcMain.handle("list-directory", async (event, folderPath) => {
    try {
        const items = fs.readdirSync(folderPath).map((item) => {
            const fullPath = path.join(folderPath, item);
            const stats = fs.statSync(fullPath);
            return {
                name: item,
                path: fullPath,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                modified: stats.mtime,
            };
        });
        return createResponse(true, { items }, "Directory listed successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to list directory: ${error.message}`);
    }
});

ipcMain.handle("delete-directory", async (event, folderPath) => {
    try {
        fs.rmdirSync(folderPath, { recursive: true });
        return createResponse(true, { folderPath }, "Directory deleted successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to delete directory: ${error.message}`);
    }
});

// --- Advanced Operations ---
ipcMain.handle("compress-files", async (event, files, zipPath) => {
    try {
        const archive = archiver("zip", { zlib: { level: 9 } });
        const output = fs.createWriteStream(zipPath);

        files.forEach((file) => archive.file(file, { name: path.basename(file) }));
        archive.pipe(output);
        await archive.finalize();

        return createResponse(true, { zipPath }, "Files compressed successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to compress files: ${error.message}`);
    }
});

ipcMain.handle("execute-command", async (event, command) => {
    console.log("Executing", command);
    try {
        let toReturn;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                toReturn = createResponse(false, {}, `Failed to execute command: ${error.message}`);
            }
            else
                toReturn = createResponse(true, { output: stdout }, "Command executed successfully!");
        });
        console.log('toReturn:', toReturn);
        return toReturn;
    } catch (error) {
        return createResponse(false, {}, `Failed to execute command: ${error.message}`);
    }
});

// --- Utilities ---
ipcMain.handle("open-file", async (event, filePath) => {
    try {
        shell.openPath(filePath);
        return createResponse(true, { filePath }, "File opened successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to open file: ${error.message}`);
    }
});

ipcMain.handle("search-files", async (event, folderPath, searchTerm) => {
    try {
        const matches = [];
        const search = (dir) => {
            fs.readdirSync(dir).forEach((item) => {
                const fullPath = path.join(dir, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    search(fullPath);
                } else if (item.includes(searchTerm)) {
                    matches.push(fullPath);
                }
            });
        };
        search(folderPath);
        return createResponse(true, { matches }, "Search completed successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to search files: ${error.message}`);
    }
});
