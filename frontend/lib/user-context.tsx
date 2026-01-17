'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  avatarUrl: string;
}

interface UserContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage on mount
    const storedUser = localStorage.getItem('mine_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from local storage');
      }
    }
  }, []);

  const login = (username: string) => {
    // Generate a consistent avatar based on username (using minotar or similar)
    const avatarUrl = `https://minotar.net/helm/${username}/100.png`;
    const newUser = { username, avatarUrl };
    setUser(newUser);
    localStorage.setItem('mine_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mine_user');
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
