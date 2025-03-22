// @ts-ignore - Add axios package with: npm install axios
import axios from 'axios';

// Get the API URL from environment variables or use a default
// @ts-ignore - This is a Vite-specific feature
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance for the API with a timeout and better error handling
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // 3 second timeout to prevent hanging requests
});

// Mock mode for faster responses during presentation
const MOCK_MODE = true; // Set to true for presentation mode

// Helper to handle API calls with mock fallback
const apiCall = async (apiFunc: Promise<any>, mockData: any) => {
  if (!MOCK_MODE) {
    return apiFunc;
  }
  
  try {
    // Try the real API call first with a short timeout
    return await Promise.race([
      apiFunc,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 800)
      )
    ]);
  } catch (error) {
    console.log('Using mock data due to API error:', error);
    // Return a resolved promise with mock data
    return Promise.resolve({ data: mockData });
  }
};

// Mock data for todos
const MOCK_TODOS = [
  {
    id: 1,
    title: "Complete project presentation",
    description: "Finalize slides and demo for the final presentation",
    status: "in_progress",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: "Practice presentation",
    description: "Run through the demo twice before presenting",
    status: "todo",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    title: "Set up demo environment",
    description: "Make sure all components are working",
    status: "todo",
    created_at: new Date().toISOString()
  }
];

// Mock data for planner events
const MOCK_EVENTS = [
  {
    id: "1",
    title: "Math Study Group",
    description: "Review calculus problems with study group",
    day: "Monday",
    time: "3:00 PM",
    color: "purple",
  },
  {
    id: "2",
    title: "Physics Lab",
    description: "Complete lab assignment for Physics 101",
    day: "Wednesday",
    time: "1:00 PM",
    color: "blue",
  },
  {
    id: "3",
    title: "Essay Writing",
    description: "Work on English literature essay",
    day: "Thursday",
    time: "4:00 PM",
    color: "pink",
  },
];

// API functions for todos
export const todoApi = {
  getAll: () => apiCall(api.get('/todos'), MOCK_TODOS),
  getById: (id: number) => apiCall(api.get(`/todos/${id}`), MOCK_TODOS.find(t => t.id === id)),
  create: (todo: any) => {
    const newTodo = { ...todo, id: Math.floor(Math.random() * 1000), created_at: new Date().toISOString() };
    return apiCall(api.post('/todos', todo), newTodo);
  },
  update: (id: number, todo: any) => apiCall(api.put(`/todos/${id}`, todo), { ...todo, id }),
  delete: (id: number) => apiCall(api.delete(`/todos/${id}`), { success: true }),
};

// API functions for planner events
export const plannerApi = {
  getEvents: (startDate: string, endDate: string) => 
    apiCall(api.get(`/planner/events?start_date=${startDate}&end_date=${endDate}`), MOCK_EVENTS),
  createEvent: (event: any) => {
    const newEvent = { ...event, id: Math.floor(Math.random() * 1000).toString() };
    return apiCall(api.post('/planner/events', event), newEvent);
  },
  updateEvent: (id: number, event: any) => apiCall(api.put(`/planner/events/${id}`, event), { ...event, id }),
  deleteEvent: (id: number) => apiCall(api.delete(`/planner/events/${id}`), { success: true }),
};

// API functions for pomodoro
export const pomodoroApi = {
  getSessions: () => apiCall(api.get('/pomodoro/sessions'), []),
  createSession: (session: any) => {
    const newSession = { ...session, id: Math.floor(Math.random() * 1000), created_at: new Date().toISOString() };
    return apiCall(api.post('/pomodoro/sessions', session), newSession);
  },
  updateSession: (id: number, session: any) => apiCall(api.put(`/pomodoro/sessions/${id}`, session), { ...session, id }),
  getStats: (startDate: string, endDate: string) => 
    apiCall(api.get(`/pomodoro/stats?start_date=${startDate}&end_date=${endDate}`), { 
      total_sessions: 12,
      total_duration: 25 * 12,
      completed_tasks: 8
    }),
};

export default api;
