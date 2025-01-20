const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const dgram = require("dgram");

// Get the downloadsPath from command line arguments
const downloadPath = process.argv[2];

if (!downloadPath) {
    console.error("Please provide the downloads path as an argument.");
    process.exit(1);
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

// File Receiver HTTP Server
const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/upload") {
        const contentDisposition = req.headers["content-disposition"];
        const fileName = contentDisposition
            ? contentDisposition.split("filename=")[1].replace(/"/g, "")
            : `file_${Date.now()}`;

        const uploadDir = path.join(downloadPath, "FileFlicker");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, fileName);
        console.log(`Receiving file: ${filePath}`);
        process.send?.({ fileName, filePath, command: "file-received" });

        const fileStream = fs.createWriteStream(filePath);
        req.pipe(fileStream);

        req.on("end", () => {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("File uploaded successfully.");
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

const port = 4141;
server.listen(port, () => {
    console.log(`File receiver listening on http://${getLocalIp()}:${port}`);
    startBroadcasting(); // Start broadcasting when the server starts
});

// UDP Broadcasting
const BROADCAST_PORT = 41234;
const UDP_BROADCAST_INTERVAL = 3000; // Broadcast every 3 seconds
const udpSocket = dgram.createSocket("udp4");

function startBroadcasting() {
    udpSocket.bind(BROADCAST_PORT, () => {
        udpSocket.setBroadcast(true);
        console.log("UDP broadcasting started");
    });

    setInterval(() => {
        console.log("Broadcasting FileFlicker service...");
        const message = Buffer.from(JSON.stringify({ name: "FileFlicker", ip: getLocalIp() }));
        udpSocket.send(message, 0, message.length, BROADCAST_PORT, "255.255.255.255");
    }, UDP_BROADCAST_INTERVAL);

    udpSocket.on("message", (msg, rinfo) => {
        console.log(`Received UDP message from ${rinfo.address}:${rinfo.port}`);
        try {
            const data = JSON.parse(msg.toString());
            if (data.name === "FileFlicker") {
                process.send?.({ command: 'set-device', name: data.ip === getLocalIp() ? "Me" : data.name, ip: data.ip, timestamp: Date.now() });
            }
        } catch (error) {
            console.error("Error parsing UDP message:", error);
        }
    });

}
