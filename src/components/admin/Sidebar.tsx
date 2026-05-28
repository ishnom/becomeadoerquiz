"use client";

type SidebarTab = "dashboard" | "rounds" | "questions" | "submissions";

type SidebarProps = {
  activeTab: SidebarTab;
  onSelect: (tab: SidebarTab) => void;
  onLogout: () => void;
};

const navItems: Array<{ id: SidebarTab; label: string; icon: string }> = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "rounds", label: "Rounds", icon: "📋" },
  { id: "questions", label: "Questions", icon: "❓" },
  { id: "submissions", label: "Submissions", icon: "📊" },
];

export default function Sidebar({ activeTab, onSelect, onLogout }: SidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col bg-[var(--bg-card)]">
      <div className="px-6 py-6 text-lg font-bold text-[var(--yellow)]">
        BecomeADoerQuiz
      </div>
      <div className="h-px w-full bg-[var(--border)]" />
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "border-l-[3px] border-l-[var(--yellow)] bg-[rgba(245,197,24,0.08)] text-[var(--yellow)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)]"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export type { SidebarTab };
