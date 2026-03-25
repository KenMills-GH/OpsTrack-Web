import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

// 2. Initialize the Query Client (The Radio Tower)
const queryClient = new QueryClient();

function App() {
  return (
    // 3. Wrap the app so every component can broadcast
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="antialiased text-slate-50 bg-slate-900 min-h-screen">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
