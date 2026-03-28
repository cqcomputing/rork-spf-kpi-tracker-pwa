export type User = {
  id: string;
  username: string;
  password: string;
  name: string;
  email?: string;
  role: "sales_rep" | "admin";
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};