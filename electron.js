const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const unzipper = require("unzipper");
const { exec } = require("child_process");
const http = require("http");
const os = require("os");
const dgram = require("dgram");

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

    startFileReceiver();

    startDeviceDiscovery();
});


const BROADCAST_PORT = 41234;
const UDP_BROADCAST_INTERVAL = 3000; // Broadcast every 3 seconds
const devices = new Map(); // Store discovered devices (IP -> { name, timestamp })

function startDeviceDiscovery() {
    const udpSocket = dgram.createSocket("udp4");

    udpSocket.bind(BROADCAST_PORT, () => {
        udpSocket.setBroadcast(true);
    });

    // Send broadcast
    setInterval(() => {
        const message = Buffer.from(JSON.stringify({ name: "FileFlicker", ip: getLocalIp() }));
        udpSocket.send(message, 0, message.length, BROADCAST_PORT, "255.255.255.255");
    }, UDP_BROADCAST_INTERVAL);

    // Listen for broadcast messages
    udpSocket.on("message", (msg, rinfo) => {
        try {
            console.log("Received UDP message:", msg.toString());
            const data = JSON.parse(msg.toString());
            if (data.name === "FileFlicker") {
                devices.set(data.ip, { name: data.name, ip: data.ip, timestamp: Date.now() });
            }
        } catch (error) {
            console.error("Error parsing UDP message:", error);
        }
    });

    // Clean up stale devices
    setInterval(() => {
        const now = Date.now();
        devices.forEach((device, ip) => {
            if (now - device.timestamp > 10 * 1000) {
                devices.delete(ip);
            }
        });
    }, 5000);
}


// Utility function for responses
function createResponse(success, data = {}, message = "") {
    return { success, ...data, message };
}

ipcMain.on("files-dropped", (event, filePaths) => {
    console.log("Files dropped:", filePaths);
    // You can process the file paths here if needed
});

ipcMain.handle("dialog:openFile", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openFile"],
    });
    return result.filePaths[0]; // Return the selected file path
});

ipcMain.handle("dialog:openFolder", async () => {
    const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    return result.filePaths[0]; // Return the selected folder path
});

ipcMain.handle("file:send", async (event, targetIp, files) => {
    try {
        for (const file of files) {
            const fileStream = fs.createReadStream(file.path);
            const options = {
                hostname: targetIp,
                port: 4141,
                path: "/upload",
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": `attachment; filename="${file.name}"`,
                },
            };

            const req = http.request(options, (res) => {
                console.log(`File sent. Server responded with: ${res.statusCode}`);
            });

            fileStream.pipe(req);
            fileStream.on("end", () => req.end());
        }

        return "Files sent successfully!";
    } catch (error) {
        console.error("Error sending files:", error);
        return "Failed to send files.";
    }
});

ipcMain.handle("get-local-ip", async () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address; // Return the first non-internal IPv4 address
            }
        }
    }
    return "127.0.0.1"; // Fallback to localhost
});

function startFileReceiver() {
    const server = http.createServer((req, res) => {
        if (req.method === "POST" && req.url === "/upload") {
            const contentDisposition = req.headers["content-disposition"];
            const fileName = contentDisposition
                ? contentDisposition.split("filename=")[1].replace(/"/g, "")
                : `file_${Date.now()}`;

            const uploadDir = path.join(app.getPath("downloads"), "FileFlicker"); // Save files to Downloads/FileFlicker
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            const fileStream = fs.createWriteStream(filePath);

            req.pipe(fileStream);

            req.on("end", () => {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("File uploaded successfully.");

                // Notify the renderer process
                mainWindow.webContents.send("file-received", { fileName, filePath });
            });

            req.on("error", (err) => {
                console.error("File upload error:", err);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Failed to upload file.");
            });
        } else {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Not Found");
        }
    });

    const port = 4141; // Port for the receiver server
    server.listen(port, () => {
        console.log(`File receiver listening on http://${getLocalIp()}:${port}`);
    });
}

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "127.0.0.1"; // Fallback to localhost
}


// Simulate device discovery on the network
ipcMain.handle("network:discover", async () => {
    console.log("Devices discovered:", devices);
    return Array.from(devices.values());
});



// --- File Operations ---
ipcMain.handle("create-file", async (event, filePath) => {
    try {
        fs.writeFileSync(filePath, "");
        const stats = fs.statSync(filePath);
        return createResponse(true, { filePath, size: stats.size, modified: stats.mtime }, "File created successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to create file: ${error.message}`);
    }
});

ipcMain.handle("read-file", async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        const stats = fs.statSync(filePath);
        return createResponse(true, { filePath, content, size: stats.size, modified: stats.mtime }, "File read successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to read file: ${error.message}`);
    }
});

ipcMain.handle("append-to-file", async (event, filePath, content) => {
    try {
        fs.appendFileSync(filePath, content);
        const stats = fs.statSync(filePath);
        return createResponse(true, { filePath, size: stats.size, modified: stats.mtime }, "Content appended successfully!");
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

ipcMain.handle("rename-file", async (event, filePath, newFilePath) => {
    try {
        fs.renameSync(filePath, newFilePath);
        const stats = fs.statSync(newFilePath);
        return createResponse(true, { oldPath: filePath, newPath: newFilePath, size: stats.size, modified: stats.mtime }, "File renamed successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to rename file: ${error.message}`);
    }
});

ipcMain.handle("move-file", async (event, filePath, destinationPath) => {
    try {
        const newFilePath = path.join(destinationPath, path.basename(filePath));
        fs.renameSync(filePath, newFilePath);
        const stats = fs.statSync(newFilePath);
        return createResponse(true, { oldPath: filePath, newPath: newFilePath, size: stats.size, modified: stats.mtime }, "File moved successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to move file: ${error.message}`);
    }
});

ipcMain.handle("copy-file", async (event, filePath, destinationPath) => {
    try {
        const newFilePath = path.join(destinationPath, path.basename(filePath));
        fs.copyFileSync(filePath, newFilePath);
        const stats = fs.statSync(newFilePath);
        return createResponse(true, { originalPath: filePath, copiedPath: newFilePath, size: stats.size, modified: stats.mtime }, "File copied successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to copy file: ${error.message}`);
    }
});

// --- Directory Operations ---
ipcMain.handle("create-directory", async (event, folderPath) => {
    try {
        fs.mkdirSync(folderPath, { recursive: true });
        const stats = fs.statSync(folderPath);
        return createResponse(true, { folderPath, created: stats.ctime }, "Directory created successfully!");
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
                size: stats.isDirectory() ? 0 : stats.size,
                modified: stats.mtime,
                created: stats.ctime,
            };
        });
        return createResponse(true, { folderPath, items }, "Directory listed successfully!");
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

ipcMain.handle("recursive-folder-stats", async (event, folderPath) => {
    try {
        const files = [];
        const collectFiles = (dir) => {
            fs.readdirSync(dir).forEach((item) => {
                const fullPath = path.join(dir, item);
                const stats = fs.statSync(fullPath);
                if (stats.isDirectory()) {
                    collectFiles(fullPath);
                } else {
                    files.push({ name: item, path: fullPath, size: stats.size, modified: stats.mtime });
                }
            });
        };
        collectFiles(folderPath);
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        return createResponse(true, { folderPath, files, totalSize }, "Recursive folder stats retrieved successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to retrieve folder stats: ${error.message}`);
    }
});

// --- Advanced Operations ---
ipcMain.handle("compress-folder", async (event, folderPath, zipPath) => {
    try {
        const archive = archiver("zip", { zlib: { level: 9 } });
        const output = fs.createWriteStream(zipPath);

        archive.directory(folderPath, false);
        archive.pipe(output);
        await archive.finalize();

        return createResponse(true, { zipPath }, "Folder compressed successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to compress folder: ${error.message}`);
    }
});

ipcMain.handle("unzip-file", async (event, zipPath, targetPath) => {
    try {
        const directory = await unzipper.Open.file(zipPath);
        await directory.extract({ path: targetPath });
        return createResponse(true, { zipPath, targetPath }, "File unzipped successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to unzip file: ${error.message}`);
    }
});

ipcMain.handle("execute-command", async (event, command) => {
    try {
        return await new Promise((resolve) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    resolve(createResponse(false, {}, `Failed to execute command: ${error.message}`));
                } else {
                    resolve(createResponse(true, { output: stdout }, "Command executed successfully!"));
                }
            });
        });
    } catch (error) {
        return createResponse(false, {}, `Failed to execute command: ${error.message}`);
    }
});

// --- Additional Programmer Utilities ---
ipcMain.handle("search-content", async (event, folderPath, searchTerm) => {
    try {
        const matches = [];
        const search = (dir) => {
            fs.readdirSync(dir).forEach((item) => {
                const fullPath = path.join(dir, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    search(fullPath);
                } else {
                    const content = fs.readFileSync(fullPath, "utf8");
                    if (content.includes(searchTerm)) {
                        matches.push(fullPath);
                    }
                }
            });
        };
        search(folderPath);
        return createResponse(true, { folderPath, matches }, "Search completed successfully!");
    } catch (error) {
        return createResponse(false, {}, `Failed to search content: ${error.message}`);
    }
});
