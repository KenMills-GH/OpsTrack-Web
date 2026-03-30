import { NavLink, useNavigate } from "react-router-dom";

function readOperatorRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { role?: string };
    return payload.role || null;
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const navigate = useNavigate();
  const operatorRole = readOperatorRole();
  const navItems = [
    { label: "GET /tasks", icon: "GET", to: "/dashboard" },
    { label: "POST /tasks", icon: "POST", to: "/create-task" },
    ...(operatorRole === "ADMIN"
      ? [{ label: "LOGS", icon: "LOG", to: "/logs" }]
      : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen border-r border-[#353437] bg-[#1f1f21] px-4 py-6 flex flex-col">
      <div className="mb-8 border-b border-[#353437] pb-4">
        <h1 className="uppercase tracking-[0.2em] text-xs text-[#4edea3] font-bold">
          OPSTRACK CORE
        </h1>
        <p className="font-mono text-[10px] text-[#919191] mt-2">
          VERSION 1.0.4
        </p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 border px-3 py-2 text-xs uppercase tracking-widest ${
                isActive
                  ? "border-[#4edea3] bg-[#353437] text-[#4edea3]"
                  : "border-transparent text-[#919191]"
              }`
            }
          >
            <span className="font-mono text-[10px]">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-[#353437] pt-4">
        <p className="text-[10px] uppercase tracking-widest text-[#919191]">
          Auth
        </p>
        <p className="font-mono text-[11px] text-[#e5e1e4] mt-1">
          Bearer Token Loaded
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full border border-[#93000a] bg-[#93000a] px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
