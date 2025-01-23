const { app, BrowserWindow, ipcMain, shell, dialog, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const unzipper = require("unzipper");
const { exec } = require("child_process");
const http = require("http");
const os = require("os");
const dgram = require("dgram");
const glob = require("glob");
const { fork } = require("child_process");


let receiverProcess;

function startFileReceiverInBackground() {
    const logPath = path.join(app.getPath("userData"), 'logs');
    if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath, { recursive: true });
    }
    const logFile = path.join(logPath, 'receiver.log');
    const downloadPath = app.getPath("downloads");
    console.log('Resources:', resourcesPath);
    const receiverScriptPath = path.join(".", "file-receiver.mjs");

    console.log('HI:', receiverScriptPath);

    // Kill any existing child processes running file-receiver.js
    exec(`pkill -f file-receiver.mjs`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error killing existing processes: ${error.message}`);
        } else {
            console.log(`Killed existing processes: ${stdout}`);
        }

        // Fork the receiver script
        receiverProcess = fork(receiverScriptPath, [downloadPath, ".", getNotificationsEnabled() + ""], {
            detached: true, // Allow it to run independently
            stdio: ["ignore", fs.openSync(logFile, 'a'), fs.openSync(logFile, 'a'), "ipc"], // IPC and logging
            // stdio: ["inherit", "inherit", "inherit", "ipc"], // IPC only
            env: { ELECTRON_RUN_AS_NODE: "1" }, // Run as a Node.js script
        });

        // Listen for messages from the child process
        receiverProcess.on("message", (message) => {
            console.log(message.command);
            if (message.command === 'file-received' && mainWindow && mainWindow.webContents) {
                console.log("File received in the background:", message);
                mainWindow.webContents.send("file-received", message);
            } else if (message.command === 'set-device') {
                console.log("Device discovered in the background:", message);
                devices.set(message.ip, message);
                const now = Date.now();
                devices.forEach((device, ip) => {
                    if (now - device.timestamp > 30 * 1000) {
                        devices.delete(ip);
                    }
                });
            }
        });

        // Ensure the process continues after the parent exits
        receiverProcess.unref();

        console.log("File receiver started in the background");
    });
}


let mainWindow;

const httpServer = require('http-server');
const { resourcesPath, env } = require("process");

function startHttpServer() {
    const server = httpServer.createServer({ root: path.join(__dirname, 'build') });
    server.listen(3001, () => {
        console.log('HTTP server listening on http://localhost:3001');
    });
}


app.on("ready", () => {

    const isLogin = process.argv.includes("--login");

    app.setLoginItemSettings({
        openAtLogin: true,
        args: ["--login"],
    });

    startFileReceiverInBackground();

    if (isLogin) {
        app.quit();
    }        

    const settingsPath = path.join(app.getPath("userData"), "settings.json");
    const defaultSettings = {
        notificationsEnabled: true,
    };

    if (!fs.existsSync(settingsPath)) {
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
    } else {
        const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        const updatedSettings = { ...defaultSettings, ...settings };
        fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2));
    }
        
    
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
        },
        icon: path.join(__dirname, 'icons/logo.png')
    });

    mainWindow.loadURL("http://localhost:3001");

    // startFileReceiver();

    // startDeviceDiscovery();

    startHttpServer();
});


const BROADCAST_PORT = 41234;
const UDP_BROADCAST_INTERVAL = 3000; // Broadcast every 3 seconds
const devices = new Map(); // Store discovered devices (IP -> { name, timestamp })

function startDeviceDiscovery() {
    const udpSocket = dgram.createSocket("udp4");

    udpSocket.bind(BROADCAST_PORT, () => {
        udpSocket.setBroadcast(true);
    });

    udpSocket.on("message", (msg, rinfo) => {
        console.log(`Received UDP message from ${rinfo.address}:${rinfo.port}`);
        try {
            const data = JSON.parse(msg.toString());
            if (data.name === "FileFlicker") {
                devices.set(data.ip, { name: data.ip === getLocalIp() ? "Me" : data.name, ip: data.ip, timestamp: Date.now() });
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
            let filePath = file.path;
            let fileName = file.name;

            if (fs.statSync(filePath).isDirectory()) {
                const zipPath = `${filePath}.zip`;
                await new Promise((resolve, reject) => {
                    const output = fs.createWriteStream(zipPath);
                    const archive = archiver("zip", { zlib: { level: 9 } });

                    output.on("close", resolve);
                    archive.on("error", reject);

                    archive.pipe(output);
                    archive.directory(filePath, false);
                    archive.finalize();
                });

                filePath = zipPath;
                fileName = `${fileName}.zip`;
            }

            const fileStream = fs.createReadStream(filePath);
            const options = {
                hostname: targetIp,
                port: 4141,
                path: "/upload",
                method: "POST",
                headers: {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": `attachment; filename="${fileName}"`,
                },
            };

            const req = http.request(options, (res) => {
                console.log(`File sent. Server responded with: ${res.statusCode}`);
            });

            fileStream.pipe(req);
            fileStream.on("end", () => req.end());
        }

        return "Files sent successfully!: " + files.map((file) => file.name).join(", ");
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
            mainWindow.webContents.send("file-received", { fileName, filePath });
            console.log(`Receiving file: ${filePath}`);
            const fileStream = fs.createWriteStream(filePath);


            req.pipe(fileStream);

            req.on("end", () => {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("File uploaded successfully.");

                // Notify the renderer process
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
        const [cmd, ...args] = command.match(/(?:[^\s"]+|"[^"]*")+/g).map(arg => arg.replace(/(^"|"$)/g, ''));
        console.log("Command:", cmd);
        console.log("Arguments:", args);
        if (cmd === "file_pool") {
            let filePattern = command.split(" ").slice(1).join(" ");

            // automatically expand user's home directory
            if (filePattern.startsWith("~")) {
                filePattern = path.join(os.homedir(), filePattern.slice(1));
            }

            filePattern = filePattern.replace(/\\/g, '');

            console.log("File pattern:", filePattern);

            const files = glob.sync(filePattern);
            
            let pool = [];

            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                let fileStats = fs.statSync(file);
                pool.push({
                    id: Math.random().toString(36).slice(2),
                    name: path.basename(file),
                    path: file,
                    size: fileStats.size,
                    modified: fileStats.mtime,
                });
            }

            filePool.push(...pool);
                    
            
            console.log('Files: ', files);            
            mainWindow.webContents.send("file-added", { pool });

            console.log("Files added to pool:", filePool);
            return createResponse(true, { output: 'Files found: ' + pool.map((file) => file.name).join(", ") }, "Files added to pool successfully!");
        } else if (cmd === "flick") {
            const targetIp = args[0];
            mainWindow.webContents.send("flick", { targetIp });
            return createResponse(true, { output:  "Files flicked successfully!"}, "Files flicked successfully!");
        } else {
            return await new Promise((resolve) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        resolve(createResponse(false, {}, `Failed to execute command: ${error.message}`));
                    } else {
                        resolve(createResponse(true, { output: stdout }, "Command executed successfully!"));
                    }
                });
            });
        }
    } catch (error) {
        return createResponse(false, {}, `Failed to execute command: ${error.message}`);
    }
});

const filePool = [];

function sendFile(targetIp, filePath) {
    console.log(`Sending file to ${targetIp}: ${filePath}`);
    return new Promise((resolve, reject) => {
        const fileName = path.basename(filePath);
        const fileStream = fs.createReadStream(filePath);
        const options = {
            hostname: targetIp,
            port: 4141,
            path: "/upload",
            method: "POST",
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="${fileName}"`,
            },
        };

        const req = http.request(options, (res) => {
            console.log(`File sent. Server responded with: ${res.statusCode}`);
            resolve();
        });

        fileStream.pipe(req);
        fileStream.on("end", () => req.end());
        req.on("error", reject);
    });
}

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

ipcMain.handle("get-notifications-enabled", async () => {
    const settingsPath = path.join(app.getPath("userData"), "settings.json");
    if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        return settings.notificationsEnabled || false;
    }
    return false;
});

function getNotificationsEnabled() {
    const settingsPath = path.join(app.getPath("userData"), "settings.json");
    if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        return settings.notificationsEnabled || false;
    }
    return false;
}

ipcMain.handle("set-notifications-enabled", async (event, enabled) => {
    const settingsPath = path.join(app.getPath("userData"), "settings.json");
    if (fs.existsSync(settingsPath)) {
        const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
        settings.notificationsEnabled = enabled;
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    }

    // Restart the child process
    if (receiverProcess) {
        receiverProcess.kill();
        startFileReceiverInBackground();
    }

    return createResponse(true, { enabled }, "Notifications setting updated successfully!");
});