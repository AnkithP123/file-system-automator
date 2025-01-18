import React, { useState } from 'react';
import Modal from './Modal';

function Box({ canvasOffset, addBox }) {
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStep, setSelectedStep] = useState(''); // State to track selected step

    const [steps, setSteps] = useState([
        { value: '', label: 'Select Step' },
        { value: 'listFiles', label: 'listFiles' },
        { value: 'renameFile', label: 'renameFile' },
        { value: 'addFile', label: 'addFile' },
        { value: 'addFolder', label: 'addFolder' },
        { value: 'moveFile', label: 'moveFile' },
        { value: 'copyFile', label: 'copyFile' },
        { value: 'deleteFile', label: 'deleteFile' },
        { value: 'deleteFolder', label: 'deleteFolder' },
        { value: 'checkFileExists', label: 'checkFileExists' },
        { value: 'getFileDetails', label: 'getFileDetails' },
        { value: 'readFile', label: 'readFile' },
        { value: 'writeFile', label: 'writeFile' },
        { value: 'listSubfolders', label: 'listSubfolders' },
        { value: 'recursiveFolderListing', label: 'recursiveFolderListing' },
        { value: 'countFilesInFolder', label: 'countFilesInFolder' },
        { value: 'zipFolder', label: 'zipFolder' },
        { value: 'unzipFile', label: 'unzipFile' },
        { value: 'fileHash', label: 'fileHash' },
        { value: 'openFile', label: 'openFile' },
    ]);
    

    const [args, setArgs] = useState([
        { id: 1, value: 'Option 1' },
        { id: 2, value: 'Option 2' },
        { id: 3, value: 'Option 3' }
    ]);

    const handleAddBoxClick = () => {
        addBox();
        setIsButtonVisible(false); // Hide the button after clicking
    };

    function getFunctionArguments(functionName) {
        const functionArgsMap = {
            listFiles: ["folderPath"],
            renameFile: ["folderPath", "oldName", "newName"],
            addFile: ["folderPath", "fileName"],
            addFolder: ["folderPath"],
            moveFile: ["folderPath", "fileName", "targetPath"],
            copyFile: ["folderPath", "fileName", "targetPath"],
            deleteFile: ["filePath"],
            deleteFolder: ["folderPath"],
            checkFileExists: ["filePath"],
            getFileDetails: ["filePath"],
            readFile: ["filePath"],
            writeFile: ["filePath", "content"],
            listSubfolders: ["folderPath"],
            recursiveFolderListing: ["folderPath"],
            countFilesInFolder: ["folderPath"],
            zipFolder: ["folderPath", "zipPath"],
            unzipFile: ["zipPath", "targetPath"],
            fileHash: ["filePath"],
            openFile: ["filePath"],
        };
    
        return functionArgsMap[functionName] || null;
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
    };

    const handleStepChange = (e) => {
        setSelectedStep(e.target.value); // Update selected step
        const argumentNames = getFunctionArguments(e.target.value);
        const formattedArgs = argumentNames.map((arg, index) => ({
            id: index + 1,
            value: arg,
        }));
        setArgs(formattedArgs);
    };

    // Calculate the position of the "+" button
    const rectWidth = 300;   // Updated width
    const rectHeight = 150;  // Updated height
    const rectX = (window.innerWidth - rectWidth) / 2 + canvasOffset.x;
    const rectY = (window.innerHeight - rectHeight) / 2 + canvasOffset.y;

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
                    disabled={!selectedStep} // Disable button if no step is selected
                    style={{
                        width: '80%',
                        padding: '8px',
                        borderRadius: '5px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        cursor: selectedStep ? 'pointer' : 'not-allowed', // Change cursor based on selection
                        boxSizing: 'border-box',
                        opacity: selectedStep ? 1 : 0.5 // Change opacity based on selection
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
                        zIndex: 1000,
                    }}
                >
                    +
                </button>
            )}
            {isModalOpen && <Modal args={args} onArgChange={handleArgChange} onClose={handleCloseModal} />}
        </div>
    );
}

export default Box;