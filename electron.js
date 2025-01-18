const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const archiver = require("archiver");
const unzipper = require("unzipper");

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

    mainWindow.loadURL("http://localhost:3000");
});

// --- File Management ---
ipcMain.handle("delete-file", async (event, filePath) => {
    try {
        fs.unlinkSync(filePath);
        return "File deleted successfully!";
    } catch (error) {
        throw new Error(`Failed to delete file: ${error.message}`);
    }
});

ipcMain.handle("delete-folder", async (event, folderPath) => {
    try {
        fs.rmdirSync(folderPath, { recursive: true });
        return "Folder deleted successfully!";
    } catch (error) {
        throw new Error(`Failed to delete folder: ${error.message}`);
    }
});

ipcMain.handle("check-file-exists", async (event, filePath) => {
    return fs.existsSync(filePath);
});

ipcMain.handle("get-file-details", async (event, filePath) => {
    try {
        const stats = fs.statSync(filePath);
        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
        };
    } catch (error) {
        throw new Error(`Failed to get file details: ${error.message}`);
    }
});

ipcMain.handle("read-file", async (event, filePath) => {
    try {
        return fs.readFileSync(filePath, "utf8");
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
});

ipcMain.handle("write-file", async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content);
        return "File written successfully!";
    } catch (error) {
        throw new Error(`Failed to write to file: ${error.message}`);
    }
});

// --- Folder Operations ---
ipcMain.handle("list-subfolders", async (event, folderPath) => {
    try {
        return fs.readdirSync(folderPath).filter((item) =>
            fs.statSync(path.join(folderPath, item)).isDirectory()
        );
    } catch (error) {
        throw new Error(`Failed to list subfolders: ${error.message}`);
    }
});

ipcMain.handle("recursive-folder-listing", async (event, folderPath) => {
    const getFolderContents = (dir) => {
        return fs.readdirSync(dir).map((item) => {
            const itemPath = path.join(dir, item);
            return fs.statSync(itemPath).isDirectory()
                ? { folder: item, contents: getFolderContents(itemPath) }
                : { file: item };
        });
    };

    try {
        return getFolderContents(folderPath);
    } catch (error) {
        throw new Error(`Failed to list folder contents: ${error.message}`);
    }
});

ipcMain.handle("count-files-in-folder", async (event, folderPath) => {
    try {
        return fs.readdirSync(folderPath).filter((item) =>
            fs.statSync(path.join(folderPath, item)).isFile()
        ).length;
    } catch (error) {
        throw new Error(`Failed to count files: ${error.message}`);
    }
});

// --- Advanced Operations ---
ipcMain.handle("zip-folder", async (event, folderPath, zipPath) => {
    try {
        const archive = archiver("zip", { zlib: { level: 9 } });
        const output = fs.createWriteStream(zipPath);

        archive.directory(folderPath, false).pipe(output);
        await archive.finalize();

        return "Folder zipped successfully!";
    } catch (error) {
        throw new Error(`Failed to zip folder: ${error.message}`);
    }
});

ipcMain.handle("unzip-file", async (event, zipPath, targetPath) => {
    try {
        fs.createReadStream(zipPath).pipe(unzipper.Extract({ path: targetPath }));
        return "File unzipped successfully!";
    } catch (error) {
        throw new Error(`Failed to unzip file: ${error.message}`);
    }
});

ipcMain.handle("file-hash", async (event, filePath) => {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
        return hash;
    } catch (error) {
        throw new Error(`Failed to generate file hash: ${error.message}`);
    }
});

// --- Utility ---
ipcMain.handle("open-file", async (event, filePath) => {
    try {
        shell.openPath(filePath);
        return "File opened!";
    } catch (error) {
        throw new Error(`Failed to open file: ${error.message}`);
    }
});
