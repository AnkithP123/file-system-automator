const { exec } = require('child_process');
const path = require('path');

// Absolute path to your custom icon
const iconPath = path.join(__dirname, 'icons/logo.png');

// Corrected AppleScript command with properly escaped quotes
const command = `osascript -e 'display notification "This is the message" with title "Custom Icon Notification" subtitle "Subtitle here" sound name "Ping"'`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error('Notification error:', error);
    } else {
        console.log('Notification sent:', stdout);
    }
});
