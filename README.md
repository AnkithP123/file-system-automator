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
    git clone https://github.com/AnkithP123/file-system-automator.git
    cd file-system-automator
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

## Mac App Download (much preferred for macs, shows local devices and features are more likely to work)

1. Download [this dmg](https://drive.google.com/file/d/1nTS7-1ICABN7xu5Ysv2c9UKqBV6WfLg1/view?usp=sharing), or if you're on arm64, [this dmg](https://drive.google.com/file/d/1YkThR2hXMh50Q58oUaLMMmH9bYcg6GxR/view?usp=sharing). Run it and drag the file into Applications.
   
2. If it fails to open because it is 'damaged', close the app and do the following:

    2a. Open terminal and run the following command
    ```sh
    xattr -c /Applications/Flicker.app
    ```
    If that fails, do the rest:

    2a. Open Terminal and run the following command:
    ```sh
    sudo spctl --master-disable
    ```
    It should make you enter your password to disable the gatekeeper, and then confirm it in System Settings, which you should then open
   
    2b. Then navigate to Privacy & Security and scroll down

    2c. Select Allow applications from 'Anywhere', and then reopen the app (you can change this back after running the app and Flicker will still run)

4. It should work!

## Windows App Download (much preferred for PCs, shows local devices and features are more likely to work)

1. Download [this exe](https://drive.google.com/file/d/1lP2yjRPWmbfnJ8MOUG823pIPEaDdOHGv/view?usp=sharing)
   
2. Windows defender will probably block the file because we don't have a developer license
   
    2a. Click more info and say Run Anyway

    2b. When it prompts you to give it network access, allow it (if you want to use file flicking features).

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
