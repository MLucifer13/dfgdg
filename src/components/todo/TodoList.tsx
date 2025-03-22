import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2, Edit, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppTheme } from "@/components/dashboard/DashboardLayout";
import { Textarea } from "@/components/ui/textarea";

// Match backend task status type
type TaskStatus = "todo" | "in_progress" | "completed";

interface TodoItem {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: string;
  created_at: string;
  updated_at?: string;
}

interface TodoListProps {
  todos?: TodoItem[];
  onAddTodo?: (todo: Omit<TodoItem, "id" | "created_at">) => void;
  onToggleTodo?: (id: number) => void;
  onDeleteTodo?: (id: number) => void;
  onEditTodo?: (id: number, title: string, description?: string) => void;
  theme?: AppTheme;
}

// Status-based styling
const statusColors = {
  todo: "text-yellow-500 border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20",
  in_progress: "text-blue-500 border-blue-500 bg-blue-500/10 hover:bg-blue-500/20",
  completed: "text-green-500 border-green-500 bg-green-500/10 hover:bg-green-500/20",
};

const statusGlow = {
  todo: "shadow-[0_0_15px_rgba(234,179,8,0.5)]",
  in_progress: "shadow-[0_0_15px_rgba(59,130,246,0.5)]",
  completed: "shadow-[0_0_15px_rgba(34,197,94,0.5)]",
};

const TodoList = ({
  todos = [
    {
      id: 1,
      title: "Complete StudyBlitz presentation",
      description: "Finish the slides and prepare a demo",
      status: "in_progress" as TaskStatus,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Prepare demo data",
      description: "Create sample todos and study sessions",
      status: "todo" as TaskStatus,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Test all features",
      description: "Make sure everything works for the presentation",
      status: "completed" as TaskStatus,
      created_at: new Date().toISOString(),
    },
  ],
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onEditTodo,
  theme = "dark",
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState<TaskStatus>("todo");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleAddTodo = () => {
    if (newTitle.trim() === "") return;

    onAddTodo?.({
      title: newTitle,
      description: newDescription,
      status: newStatus,
    });

    setNewTitle("");
    setNewDescription("");
    setNewStatus("todo");
  };

  const startEditing = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
  };

  const saveEdit = (id: number) => {
    if (editTitle.trim() === "") return;

    onEditTodo?.(id, editTitle, editDescription);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
      <Card className={cn(
        "border rounded-lg shadow-lg overflow-hidden",
        theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      )}>
        <CardHeader className={cn(
          "pb-2",
          theme === "dark" ? "bg-gray-800" : "bg-gray-50"
        )}>
          <CardTitle className="text-xl font-bold flex justify-between items-center">
            <span>My Tasks</span>
            <Badge className={cn(
              "px-2 py-1 text-xs rounded-full",
              theme === "dark" ? "bg-indigo-600" : "bg-indigo-100 text-indigo-800"
            )}>
              {todos.length} {todos.length === 1 ? "task" : "tasks"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Add new todo form */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="What do you need to do?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={cn(
                  "flex-1",
                  theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                )}
                onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
              />
              <Button
                onClick={handleAddTodo}
                className={cn(
                  "flex gap-1 items-center",
                  theme === "dark" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-500 hover:bg-indigo-600"
                )}
              >
                <PlusCircle size={16} />
                <span>Add</span>
              </Button>
            </div>
            <Textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className={cn(
                "h-20",
                theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
              )}
            />
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                onClick={() => setNewStatus("todo")}
                className={cn(
                  "flex-1 text-xs",
                  newStatus === "todo" ? statusColors.todo : theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                To Do
              </Button>
              <Button
                type="button"
                onClick={() => setNewStatus("in_progress")}
                className={cn(
                  "flex-1 text-xs",
                  newStatus === "in_progress" ? statusColors.in_progress : theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                In Progress
              </Button>
              <Button
                type="button"
                onClick={() => setNewStatus("completed")}
                className={cn(
                  "flex-1 text-xs",
                  newStatus === "completed" ? statusColors.completed : theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                Completed
              </Button>
            </div>
          </div>

          {/* Todo list */}
          <div className="space-y-3">
            <AnimatePresence>
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "border rounded-lg p-3 flex flex-col gap-2",
                    todo.status === "completed" ? "opacity-70" : "",
                    statusColors[todo.status],
                    theme === "dark" ? "border-gray-700" : "border-gray-300"
                  )}
                >
                  {editingId === todo.id ? (
                    // Edit mode
                    <div className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                        autoFocus
                      />
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className={theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className={theme === "dark" ? "border-gray-700 hover:bg-gray-800" : ""}
                        >
                          <X size={14} className="mr-1" /> Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveEdit(todo.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save size={14} className="mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={todo.status === "completed"}
                            onCheckedChange={() => onToggleTodo?.(todo.id)}
                            className={theme === "dark" ? "border-gray-600" : ""}
                          />
                          <div className="flex flex-col">
                            <h3 className={cn(
                              "font-medium",
                              todo.status === "completed" ? "line-through" : ""
                            )}>
                              {todo.title}
                            </h3>
                            {todo.description && (
                              <p className={cn(
                                "text-sm mt-1",
                                theme === "dark" ? "text-gray-400" : "text-gray-600",
                                todo.status === "completed" ? "line-through" : ""
                              )}>
                                {todo.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(todo)}
                            className={theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteTodo?.(todo.id)}
                            className={theme === "dark" ? "hover:bg-gray-800 text-red-500" : "hover:bg-gray-200 text-red-600"}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <Badge variant="outline" className={cn(
                          "text-[10px] px-2 py-0 rounded-full",
                          theme === "dark" ? "border-gray-700" : "border-gray-300"
                        )}>
                          {todo.status === "todo" && "To Do"}
                          {todo.status === "in_progress" && "In Progress"}
                          {todo.status === "completed" && "Completed"}
                        </Badge>
                        <span className={theme === "dark" ? "text-gray-500" : "text-gray-500"}>
                          {new Date(todo.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {todos.length === 0 && (
              <div className={cn(
                "text-center py-6 border rounded-lg",
                theme === "dark" ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"
              )}>
                No tasks yet. Add a new task above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoList;
