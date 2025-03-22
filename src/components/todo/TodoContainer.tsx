import React, { useEffect, useState } from "react";
import TodoList from "./TodoList";
import { todoApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import { AppTheme } from "@/components/dashboard/DashboardLayout";

// Types that match your backend schemas
type TaskStatus = "todo" | "in_progress" | "completed";

interface TodoItem {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  due_date?: string;
  created_at: string;
  updated_at?: string;
}

interface TodoContainerProps {
  theme?: AppTheme;
}

const TodoContainer: React.FC<TodoContainerProps> = ({ theme = "dark" }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch todos from API
    const fetchTodos = async () => {
      try {
        setIsLoading(true);
        const response = await todoApi.getAll();
        console.log("API Response:", response.data); // Debug log
        setTodos(response.data);
      } catch (error) {
        console.error("Error fetching todos:", error);
        toast({
          title: "Error",
          description: "Failed to load todos.",
          variant: "destructive",
        });
        // For presentation purposes, set some mock data if API fails
        setTodos([
          { 
            id: 1, 
            title: "Prepare presentation slides", 
            description: "Create 10 slides for the StudyBlitz demo",
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
            status: "completed", 
            created_at: new Date().toISOString()
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, [toast]);

  const handleAddTodo = async (todo: Omit<TodoItem, "id" | "created_at">) => {
    try {
      console.log("Adding todo:", todo); // Debug log
      const response = await todoApi.create(todo);
      setTodos([...todos, response.data]);
      
      toast({
        title: "Success",
        description: "Todo added successfully.",
      });
    } catch (error) {
      console.error("Error adding todo:", error);
      toast({
        title: "Error",
        description: "Failed to add todo.",
        variant: "destructive",
      });
      
      // For presentation purposes, add the todo locally if API fails
      const mockId = Math.max(...todos.map(t => t.id), 0) + 1;
      const newTodo = {
        ...todo,
        id: mockId,
        created_at: new Date().toISOString(),
      } as TodoItem;
      
      setTodos([...todos, newTodo]);
      toast({
        title: "Demo Mode",
        description: "Todo added (presentation mode).",
      });
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const newStatus = todo.status === "completed" ? "todo" : "completed";
      const updatedTodo = { ...todo, status: newStatus };
      
      console.log("Updating todo:", updatedTodo); // Debug log
      const response = await todoApi.update(id, updatedTodo);
      setTodos(todos.map(t => t.id === id ? response.data : t));
    } catch (error) {
      console.error("Error toggling todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo.",
        variant: "destructive",
      });
      
      // For presentation purposes, update the todo locally if API fails
      setTodos(todos.map(t => {
        if (t.id === id) {
          const newStatus = t.status === "completed" ? "todo" : "completed";
          return { ...t, status: newStatus };
        }
        return t;
      }));
      toast({
        title: "Demo Mode",
        description: "Todo updated (presentation mode).",
      });
    }
  };

  const handleEditTodo = async (id: number, title: string, description: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const updatedTodo = { ...todo, title, description };
      console.log("Editing todo:", updatedTodo); // Debug log
      
      const response = await todoApi.update(id, updatedTodo);
      setTodos(todos.map(t => t.id === id ? response.data : t));
      
      toast({
        title: "Success",
        description: "Todo updated successfully.",
      });
    } catch (error) {
      console.error("Error editing todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo.",
        variant: "destructive",
      });
      
      // For presentation purposes, update the todo locally if API fails
      setTodos(todos.map(t => t.id === id ? { ...t, title, description } : t));
      toast({
        title: "Demo Mode",
        description: "Todo updated (presentation mode).",
      });
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      console.log("Deleting todo:", id); // Debug log
      await todoApi.delete(id);
      setTodos(todos.filter(t => t.id !== id));
      
      toast({
        title: "Success",
        description: "Todo deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({
        title: "Error",
        description: "Failed to delete todo.",
        variant: "destructive",
      });
      
      // For presentation purposes, delete the todo locally if API fails
      setTodos(todos.filter(t => t.id !== id));
      toast({
        title: "Demo Mode",
        description: "Todo deleted (presentation mode).",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Loading todos...</div>;
  }

  return (
    <TodoList
      todos={todos}
      onAddTodo={handleAddTodo}
      onToggleTodo={handleToggleTodo}
      onEditTodo={handleEditTodo}
      onDeleteTodo={handleDeleteTodo}
      theme={theme}
    />
  );
};

export default TodoContainer;
