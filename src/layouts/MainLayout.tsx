import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";

interface Operator {
  rank: string;
  name: string;
  role: string;
}

function readOperatorFromToken(): Operator | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload as Operator;
  } catch {
    return null;
  }
}

export default function MainLayout() {
  const operator = readOperatorFromToken();

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#131315] text-[#e5e1e4] flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <TopNavBar operator={operator} />
        <Outlet />
      </div>
    </div>
  );
}
