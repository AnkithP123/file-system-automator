const { app, BrowserWindow } = require('electron');
const path = require('path');
const { createServer } = require('http-server'); // Use http-server to serve files

let mainWindow;

app.on('ready', () => {
    // Serve the Next.js build using http-server
    const server = createServer({ root: path.join(__dirname, 'out') });
    const PORT = 12345;

    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);

        // Create the Electron window
        mainWindow = new BrowserWindow({
            width: 1280,
            height: 800,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            },
        });

        // Load the server's URL
        mainWindow.loadURL(`http://localhost:${PORT}`);

        mainWindow.on('closed', () => {
            mainWindow = null;
            server.close(); // Ensure the server stops when the app is closed
        });
    });
});

app.on('window-all-closed', () => {
    app.quit();
});
