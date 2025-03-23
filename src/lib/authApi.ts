import api from "./api";

// API functions for authentication
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      // FastAPI OAuth2 expects form data with username (not email)
      const formData = new FormData();
      formData.append("username", email); // FastAPI expects 'username' for email
      formData.append("password", password);

      const response = await api.post("/auth/token", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Store the token in localStorage
      localStorage.setItem("token", response.data.access_token);

      // Set the token in the default headers for future requests
      api.defaults.headers.common["Authorization"] =
        `Bearer ${response.data.access_token}`;

      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return null;
      }

      // Set the token in the request header
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      console.error("Failed to get current user:", error);
      localStorage.removeItem("token"); // Clear invalid token
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  },
};
