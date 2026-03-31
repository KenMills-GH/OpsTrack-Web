import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";
import { readOperatorIdentity } from "../utils/authToken";

interface Operator {
  rank: string;
  name: string;
  role: string;
}

export default function MainLayout() {
  const operator = readOperatorIdentity();

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
