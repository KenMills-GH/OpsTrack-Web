interface Operator {
  rank: string;
  name: string;
  role: string;
}

interface TopNavBarProps {
  operator: Operator | null;
}

export default function TopNavBar({ operator }: TopNavBarProps) {
  return (
    <header className="h-16 border-b border-[#353437] bg-[#131315] px-6 flex items-center justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#919191]">
          API Demo Console
        </p>
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#e5e1e4]">
          Frontend For Backend Validation
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="border border-[#353437] bg-[#1f1f21] px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-[#919191]">
            API Base
          </p>
          <p className="text-[11px] font-mono text-[#4edea3]">/api</p>
        </div>

        {operator ? (
          <div className="text-right border-l border-[#353437] pl-4">
            <p className="text-[10px] uppercase tracking-widest text-[#919191]">
              Operator
            </p>
            <p className="text-xs font-bold text-[#e5e1e4]">
              {operator.rank} {operator.name}
            </p>
            <p className="text-[11px] font-mono text-[#4edea3]">
              {operator.role}
            </p>
          </div>
        ) : (
          <p className="text-xs text-[#919191]">Operator data unavailable</p>
        )}
      </div>
    </header>
  );
}
