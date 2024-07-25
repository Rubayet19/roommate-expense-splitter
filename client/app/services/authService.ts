// app/services/authService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

export const login = async (username: string, password: string) => {
  try {
    console.log("Attempting login...");
    const response = await axios.post(API_URL + 'login', { username, password });
    if (response.data.token) {
      console.log("Login successful, storing user data");
      localStorage.setItem('user', JSON.stringify(response.data));
      return { success: true };
    }
    return { success: false, message: 'Invalid response from server' };
  } catch (error) {
    console.error("Login failed:", error);
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: error.response.data };
    }
    return { success: false, message: 'An unexpected error occurred' };
  }
};

export const logout = () => {
  console.log("Logging out, removing user data");
  localStorage.removeItem('user');
};

export const register = async (username: string, password: string) => {
  try {
    console.log("Attempting registration...");
    const response = await axios.post(API_URL + 'signup', { username, password });
    console.log("Registration successful");
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

export async function getCurrentUser(): Promise<any> {
  console.log("Getting current user...");
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      console.log("User data found in localStorage");
      return JSON.parse(userStr);
    }
  }

  console.log("No user data found");
  return null;
}