/**
 * AetherHub 2049™ - Elev8minds LLC
 * Copyright © 2025 Elev8minds LLC. All rights reserved.
 * 
 * This software is the copyrighted property of Elev8minds LLC.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 * 
 * Trademarks: "AetherHub", "AetherHub 2049", and the AetherHub logo are owned by Elev8minds LLC.
 * For licensing inquiries: legal@elev8minds.com
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  hideBalances: boolean;
  toggleHideBalances: () => void;
  setHideBalances: (value: boolean) => void;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
  hideBalances: false,
  toggleHideBalances: () => {},
  setHideBalances: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

const HIDE_BALANCES_KEY = 'aether_hide_balances';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hideBalances, setHideBalancesState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(HIDE_BALANCES_KEY);
      return stored === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(HIDE_BALANCES_KEY, String(hideBalances));
  }, [hideBalances]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleHideBalances = () => {
    setHideBalancesState(prev => !prev);
  };

  const setHideBalances = (value: boolean) => {
    setHideBalancesState(value);
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        hideBalances,
        toggleHideBalances,
        setHideBalances,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
