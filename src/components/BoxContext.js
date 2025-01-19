import React, { createContext, useState, useContext } from 'react';

const BoxContext = createContext();

export const useBoxContext = () => {
  const context = useContext(BoxContext);
  if (!context) {
    throw new Error('useBoxContext must be used within a BoxProvider');
  }
  return context;
};

export const BoxProvider = ({ children }) => {
    const [boxes, setBoxes] = useState([{ y: 0, args: [], selectedStep: '', returnType: null }]);

    const addBox = () => {
        setBoxes((prevBoxes) => {
            const lastBox = prevBoxes[prevBoxes.length - 1];
            const newBoxY = lastBox.y + 280;
            return [...prevBoxes, { y: newBoxY, args: [], selectedStep: '', returnType: null }];
        });
    };

    const updateBox = (index, newData) => {
        setBoxes((prevBoxes) => {
            const updatedBoxes = [...prevBoxes];
            updatedBoxes[index] = { ...updatedBoxes[index], ...newData };
            return updatedBoxes;
        });
    };

    return (
        <BoxContext.Provider value={{ boxes, addBox, updateBox }}>
            {children}
        </BoxContext.Provider>
    );
};

