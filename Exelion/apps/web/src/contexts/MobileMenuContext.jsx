import React, { createContext, useContext, useState, useEffect } from 'react';

const MobileMenuContext = createContext();

export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext);
  if (!context) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider');
  }
  return context;
};

export const MobileMenuProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log('MobileMenuContext: isOpen state is now:', isOpen);
  }, [isOpen]);

  const toggleMenu = () => {
    console.log('MobileMenuContext: toggleMenu called. Previous state:', isOpen);
    setIsOpen((prev) => !prev);
  };
  
  const closeMenu = () => {
    console.log('MobileMenuContext: closeMenu called. Menu closing.');
    setIsOpen(false);
  };

  return (
    <MobileMenuContext.Provider value={{ isOpen, toggleMenu, closeMenu }}>
      {children}
    </MobileMenuContext.Provider>
  );
};