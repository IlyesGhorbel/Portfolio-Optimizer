import { User } from '../types';

const AUTH_KEY = 'portfolio_auth';
const USERS_KEY = 'portfolio_users';

export const getCurrentUser = (): User | null => {
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return null;
  
  try {
    return JSON.parse(authData);
  } catch {
    return null;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  const users = getStoredUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }
  
  // In a real app, you'd verify the hashed password
  // For demo purposes, we'll just check if password is not empty
  if (!password) {
    throw new Error('Mot de passe incorrect');
  }
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  const users = getStoredUsers();
  
  if (users.find(u => u.email === email)) {
    throw new Error('Un compte avec cet email existe déjà');
  }
  
  const newUser: User = {
    id: generateId(),
    name,
    email,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
  
  return newUser;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};