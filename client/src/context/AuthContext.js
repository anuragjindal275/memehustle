import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUsers } from '../services/api';


const AuthContext = createContext();


const initialUser = {
  id: null,
  username: '',
  credits: 0,
  isLoggedIn: false,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(initialUser);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load mock users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const loadedUsers = await getUsers();
        setUsers(loadedUsers);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load users:', error);
        // Fallback to hardcoded users for the demo
        const fallbackUsers = [
          { id: '1', username: 'cyberpunk420', credits: 1000 },
          { id: '2', username: 'neon_hacker', credits: 1000 },
          { id: '3', username: 'digital_nomad', credits: 1000 },
          { id: '4', username: 'matrix_runner', credits: 1000 },
        ];
        setUsers(fallbackUsers);
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Mock login function
  const login = (userId) => {
    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setUser({
        id: selectedUser.id,
        username: selectedUser.username,
        credits: selectedUser.credits,
        isLoggedIn: true,
      });
      localStorage.setItem('memehustle_user', JSON.stringify(selectedUser.id));
      return true;
    }
    return false;
  };

  // Mock logout function
  const logout = () => {
    setUser(initialUser);
    localStorage.removeItem('memehustle_user');
  };

  // Check for stored user on mount
  useEffect(() => {
    const checkLoggedInUser = async () => {
      const storedUserId = localStorage.getItem('memehustle_user');
      if (storedUserId && users.length > 0) {
        // Try to parse the stored user ID
        try {
          const parsedId = JSON.parse(storedUserId);
          login(parsedId);
        } catch {
          logout();
        }
      }
    };

    if (!loading) {
      checkLoggedInUser();
    }
  }, [loading, users]);

  // Update user credits
  const updateUserCredits = (newCredits) => {
    setUser(prevUser => ({
      ...prevUser,
      credits: newCredits
    }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      logout,
      loading,
      updateUserCredits
    }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
