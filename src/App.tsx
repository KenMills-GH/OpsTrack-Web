import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Login from "./components/Login";
import CreateUserView from "./components/CreateUserView";
import Dashboard from "./components/Dashboard.tsx";
import LogsView from "./components/LogsView";
import TaskDetailView from "./components/TaskDetailView";
import CreateTaskView from "./components/CreateTaskView";
import PatchTaskView from "./components/PatchTaskView";
import DeleteTaskView from "./components/DeleteTaskView";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// 2. Initialize the Query Client (The Radio Tower)
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-user" element={<CreateUserView />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route path="/logs" element={<LogsView />} />
                <Route path="/delete-task/:id" element={<DeleteTaskView />} />
              </Route>
              <Route path="/create-task" element={<CreateTaskView />} />
              <Route path="/mission/:id" element={<TaskDetailView />} />
              <Route path="/patch-task/:id" element={<PatchTaskView />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
