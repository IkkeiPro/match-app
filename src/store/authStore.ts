import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
  gender: 'male' | 'female';
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));