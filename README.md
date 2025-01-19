# Flicker: File Manager

Flicker is a file management application that allows users to manage files and folders, discover devices on the network, and send files to other devices. The application is built using Electron and React, and it leverages Google Generative AI for executing file system tasks based on user prompts. The app accomplishes social good by helping people, especially developers that work in groups or students, with easily managing and sharing their files.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [License](#license)

## Manual Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/flicker-file-management.git
    cd flicker-file-management
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the application:
    ```sh
    npm run electron
    ```

4. Alternatively, for a much more smoother experience, build the app:
    ```sh
    npm run build
    npm run extra
    ```
    The file for your OS should appear in the dist folder!

## Mac App Download (much preferred, shows local devices and features are more likely to work)

1. Download [this dmg](https://drive.google.com/file/d/1JxvUd2ATbLJdom_eDISwdllNR8ngAcwC/view?usp=sharing)
   
2. If it fails to open because it is 'damaged', open System Settings.
   
    2a. Then navigate to Privacy & Security and scroll down

    2b. Select Allow applications from 'anywhere', and then reopen the app (you can change this back after running the app and Flicker will still run)

3. It should work!

## Usage

- **File Management**: Add files and folders to the pool, remove them, and clear the pool.
- **Device Discovery**: Discover devices on the network and send files to them.
- **AI Task Execution**: Enter a task prompt and let the AI execute it step by step.

## Features

- **File Operations**: Create, read, append, delete, rename, move, and copy files.
- **Directory Operations**: Create, list, and delete directories.
- **Advanced Operations**: Compress and unzip files, execute shell commands, and search content within files.
- **Network Operations**: Discover devices on the network and send files to them.
- **AI Integration**: Use Google Generative AI to execute file system tasks based on user prompts.

[**Link to demos**](https://drive.google.com/drive/folders/1pGLANu5vxsMfnXsfGwX87dbu-lYh45-w?usp=drive_link)
