import axios from "axios"
import { useAuthStore } from "../store/authStore"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1"

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const { refreshToken, updateTokens, logout } = useAuthStore.getState()
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })
          
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data
          updateTokens(newAccessToken, newRefreshToken)
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } catch {
          logout()
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// API functions
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  
  getProfile: () => api.get("/auth/profile"),
}

export const complaintsApi = {
  create: (data: any) => api.post("/complaints", data),
  
  getAll: (params?: any) => api.get("/complaints", { params }),
  
  getById: (id: string) => api.get(`/complaints/${id}`),
  
  track: (trackingNumber: string) => 
    api.get(`/complaints/track/${trackingNumber}`),
  
  updateStatus: (id: string, data: any) => 
    api.put(`/complaints/${id}/status`, data),
}

export const categoriesApi = {
  getAll: (departmentId?: string) => 
    api.get("/categories", { params: { departmentId } }),
}

export const departmentsApi = {
  getAll: (agencyId?: string) => 
    api.get("/departments", { params: { agencyId } }),
}
