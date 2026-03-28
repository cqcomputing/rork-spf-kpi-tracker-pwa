import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthState, User } from "@/types/user";

// Mock users for demo purposes - this will be the fallback for initial login
const INITIAL_MOCK_USERS: User[] = [
  {
    id: "1",
    username: "clayton",
    password: "1234",
    name: "Clayton White",
    email: "clayton@stadiumfitness.com",
    role: "sales_rep",
  },
  {
    id: "2",
    username: "admin",
    password: "0000",
    name: "Admin User",
    email: "admin@stadiumfitness.com",
    role: "admin",
  },
];

type AuthStore = AuthState & {
  users: User[]; // Store users in the persisted state
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePin: (newPin: string) => Promise<void>;
  addUser: (userData: Omit<User, "id">) => Promise<string>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  resetUserPin: (userId: string, newPin: string) => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: INITIAL_MOCK_USERS, // Initialize with mock users
      
      login: async (username: string, password: string) => {
        const { users } = get();
        
        // Find user in the persisted users array
        const user = users.find(
          (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );

        if (user) {
          set({ user, isAuthenticated: true });
          
          // Calculate summary after successful login
          setTimeout(() => {
            const { useKpiStore } = require("./kpi-store");
            const { calculateSummary } = useKpiStore.getState();
            calculateSummary();
          }, 100);
          
          return true;
        }
        return false;
      },
      
      logout: async () => {
        // Only clear auth state, keep users data
        set({ user: null, isAuthenticated: false });
      },
      
      changePin: async (newPin: string) => {
        const { user, users } = get();
        if (!user) throw new Error("No user logged in");
        
        // Update the user's password
        const updatedUser = { ...user, password: newPin };
        
        // Update the user in the users array
        const updatedUsers = users.map(u => 
          u.id === user.id ? { ...u, password: newPin } : u
        );
        
        // Update both the current user and the users array
        set({ 
          user: updatedUser, 
          users: updatedUsers 
        });
      },

      addUser: async (userData: Omit<User, "id">) => {
        const { users } = get();
        const newId = Date.now().toString();
        const newUser: User = {
          ...userData,
          id: newId,
        };
        
        set({ users: [...users, newUser] });
        return newId;
      },

      updateUser: async (userId: string, userData: Partial<User>) => {
        const { users, user } = get();
        const updatedUsers = users.map(u => 
          u.id === userId ? { ...u, ...userData } : u
        );
        
        // If updating current user, update the user state too
        const updatedCurrentUser = user && user.id === userId 
          ? { ...user, ...userData } 
          : user;
        
        set({ 
          users: updatedUsers,
          user: updatedCurrentUser
        });
      },

      deleteUser: async (userId: string) => {
        const { users } = get();
        const updatedUsers = users.filter(u => u.id !== userId);
        set({ users: updatedUsers });
      },

      resetUserPin: async (userId: string, newPin: string = "0000") => {
        const { users } = get();
        const updatedUsers = users.map(u => 
          u.id === userId ? { ...u, password: newPin } : u
        );
        set({ users: updatedUsers });
      },
    }),
    {
      name: "stadium-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);