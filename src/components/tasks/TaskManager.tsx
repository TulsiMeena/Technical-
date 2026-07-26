"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Trash2, Calendar as CalIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function TaskManager() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error("Failed to fetch tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask }),
      });
      if (res.ok) {
        setNewTask("");
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTask = async (id: string, currentStatus: number) => {
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: currentStatus === 1 ? 0 : 1 }),
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="text-gray-500 animate-pulse tracking-widest">Loading Tasks...</div>;
  }

  const pending = tasks.filter(t => t.completed === 0);
  const completed = tasks.filter(t => t.completed === 1);

  return (
    <div className="w-full h-full max-w-4xl mx-auto flex flex-col space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light tracking-widest uppercase">Task Manager</h2>
        <div className="flex items-center gap-2 text-sm text-nexus-primary bg-nexus-primary/10 px-4 py-2 rounded-full border border-nexus-primary/20">
          <CalIcon size={16} />
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <form onSubmit={handleAddTask} className="flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-black/40 border border-nexus-glass-border rounded-xl py-4 px-6 tracking-wider outline-none focus:border-nexus-primary transition-colors text-white"
          />
        </div>
        <button
          type="submit"
          disabled={!newTask.trim()}
          className="bg-nexus-primary/20 text-nexus-primary border border-nexus-primary/50 p-4 rounded-xl hover:bg-nexus-primary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={24} />
        </button>
      </form>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium tracking-widest text-gray-500 uppercase mb-4">Pending ({pending.length})</h3>
          <div className="space-y-3">
            <AnimatePresence>
              {pending.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-panel border border-nexus-glass-border p-4 rounded-xl flex items-center justify-between group hover:border-nexus-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task.id, task.completed)}>
                    <Circle className="text-gray-500 group-hover:text-nexus-primary transition-colors" size={24} />
                    <span className="tracking-wide text-gray-200">{task.title}</span>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {pending.length === 0 && <p className="text-gray-600 text-sm italic">No pending tasks.</p>}
          </div>
        </div>

        {completed.length > 0 && (
          <div>
            <h3 className="text-sm font-medium tracking-widest text-gray-500 uppercase mb-4">Completed ({completed.length})</h3>
            <div className="space-y-3 opacity-60">
              <AnimatePresence>
                {completed.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-panel border border-nexus-glass-border p-4 rounded-xl flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task.id, task.completed)}>
                      <CheckCircle2 className="text-green-500" size={24} />
                      <span className="tracking-wide text-gray-400 line-through">{task.title}</span>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
