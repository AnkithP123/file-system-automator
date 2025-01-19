import React, { useState } from 'react';
import Modal from './Modal';
import { useBoxContext } from './BoxContext';

const Box = ({ canvasOffset, index, y }) => {
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStep, setSelectedStep] = useState('');
    const { boxes, updateBox, addBox } = useBoxContext();

    const [steps, setSteps] = useState([
        { value: '', label: 'Select Step' },
        { value: 'createFile', label: 'createFile' },
        { value: 'readFile', label: 'readFile' },
        { value: 'appendToFile', label: 'appendToFile' },
        { value: 'deleteFile', label: 'deleteFile' },
        { value: 'renameFile', label: 'renameFile' },
        { value: 'moveFile', label: 'moveFile' },
        { value: 'copyFile', label: 'copyFile' },
        { value: 'createDirectory', label: 'createDirectory' },
        { value: 'listDirectory', label: 'listDirectory' },
        { value: 'deleteDirectory', label: 'deleteDirectory' },
        { value: 'recursiveFolderStats', label: 'recursiveFolderStats' },
        { value: 'compressFolder', label: 'compressFolder' },
        { value: 'unzipFile', label: 'unzipFile' },
        { value: 'executeShellCommand', label: 'executeShellCommand' },
        { value: 'searchContent', label: 'searchContent' },
    ]);

    const [args, setArgs] = useState([]);
    const [returnType, setReturnType] = useState(null);

    const handleAddBoxClick = () => {
        addBox();
        setIsButtonVisible(false);
    };

    const functionReturnMap = {
        "createFile": {
            success: true,
            filePath: "string",
            size: "number",
            modified: "Date",
            message: "string",
        },
        "readFile": {
            success: true,
            filePath: "string",
            content: "string",
            size: "number",
            modified: "Date",
            message: "string",
        },
        "appendToFile": {
            success: true,
            filePath: "string",
            size: "number",
            modified: "Date",
            message: "string",
        },
        "deleteFile": {
            success: true,
            filePath: "string",
            message: "string",
        },
        "renameFile": {
            success: true,
            oldPath: "string",
            newPath: "string",
            size: "number",
            modified: "Date",
            message: "string",
        },
        "moveFile": {
            success: true,
            oldPath: "string",
            newPath: "string",
            size: "number",
            modified: "Date",
            message: "string",
        },
        "copyFile": {
            success: true,
            originalPath: "string",
            copiedPath: "string",
            size: "number",
            modified: "Date",
            message: "string",
        },
        "createDirectory": {
            success: true,
            folderPath: "string",
            created: "Date",
            message: "string",
        },
        "listDirectory": {
            success: true,
            folderPath: "string",
            items: [
                {
                    name: "string",
                    path: "string",
                    isDirectory: "boolean",
                    size: "number",
                    modified: "Date",
                    created: "Date",
                },
            ],
            message: "string",
        },
        "deleteDirectory": {
            success: true,
            folderPath: "string",
            message: "string",
        },
        "recursiveFolderStats": {
            success: true,
            folderPath: "string",
            files: [
                {
                    name: "string",
                    path: "string",
                    size: "number",
                    modified: "Date",
                },
            ],
            totalSize: "number",
            message: "string",
        },
        "compressFolder": {
            success: true,
            zipPath: "string",
            message: "string",
        },
        "unzipFile": {
            success: true,
            zipPath: "string",
            targetPath: "string",
            message: "string",
        },
        "executeShellCommand": {
            success: true,
            output: "string",
            message: "string",
        },
        "searchContent": {
            success: true,
            folderPath: "string",
            matches: ["string"],
            message: "string",
        },
    };
    
    function getFunctionReturnType(functionName) {
        return functionReturnMap[functionName] || { error: "Return type not defined for this function" };
    }

    function getFunctionArguments(functionName) {
        const functionArgsMap = {
            createFile: ["filePath"],
            readFile: ["filePath"],
            appendToFile: ["filePath", "content"],
            deleteFile: ["filePath"],
            renameFile: ["filePath", "newFilePath"],
            moveFile: ["filePath", "destinationPath"],
            copyFile: ["filePath", "destinationPath"],
            createDirectory: ["folderPath"],
            listDirectory: ["folderPath"],
            deleteDirectory: ["folderPath"],
            recursiveFolderStats: ["folderPath"],
            compressFolder: ["folderPath", "zipPath"],
            unzipFile: ["zipPath", "targetPath"],
            executeShellCommand: ["command"],
            searchContent: ["folderPath", "searchTerm"],
        };
    
        return functionArgsMap[functionName] || [];
    }

    const handleEditArgsClick = () => {
        if (selectedStep) {
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleArgChange = (id, value) => {
        setArgs((prevArgs) =>
            prevArgs.map((arg) => (arg.id === id ? { ...arg, value } : arg))
        );
        updateBox(index, { args, selectedStep, returnType });
    };

    const handleStepChange = (e) => {
        setSelectedStep(e.target.value);
        const argumentNames = getFunctionArguments(e.target.value);
        setReturnType(getFunctionReturnType(e.target.value));
        const formattedArgs = argumentNames.map((arg, index) => ({
            id: index + 1,
            value: arg,
        }));
        setArgs(formattedArgs);
        updateBox(index, { args: formattedArgs, selectedStep: e.target.value, returnType: getFunctionReturnType(e.target.value) });
    };

    const rectWidth = 300;
    const rectHeight = 150;
    const rectX = (window.innerWidth - rectWidth) / 2 + canvasOffset.x;
    const rectY = (window.innerHeight - rectHeight) / 2 + canvasOffset.y + y;

    return (
        <div style={{ position: 'absolute', top: `${rectY}px`, left: `${rectX}px`, width: `${rectWidth}px`, height: `${rectHeight}px` }}>
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px',
                    boxSizing: 'border-box'
                }}
            >
                <select
                    name="Options"
                    value={selectedStep}
                    onChange={handleStepChange}
                    style={{
                        width: '80%',
                        padding: '8px',
                        borderRadius: '5px',
                        marginBottom: '10px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                >
                    {steps.map((option, index) => (
                        <option key={index} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <button 
                    onClick={handleEditArgsClick}
                    disabled={!selectedStep}
                    style={{
                        width: '80%',
                        padding: '8px',
                        borderRadius: '5px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        cursor: selectedStep ? 'pointer' : 'not-allowed',
                        boxSizing: 'border-box',
                        opacity: selectedStep ? 1 : 0.5
                    }}
                >
                    Edit Argument Parameters
                </button>
            </div>
            {isButtonVisible && (
                <button 
                    onClick={handleAddBoxClick}
                    style={{
                        position: 'absolute',
                        top: `${rectHeight - 18}px`,
                        left: `${rectWidth / 2 - 20}px`,
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '24px',
                        cursor: 'pointer',
                        zIndex: 2,
                    }}
                >
                    +
                </button>
            )}
            {isModalOpen && <Modal args={args} onArgChange={handleArgChange} onClose={handleCloseModal} boxes={boxes} currentBoxIndex={index} />}
        </div>
    );
}

export default Box;

