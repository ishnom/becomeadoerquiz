type StatCard = {
  label: string;
  value: number;
};

type RecentSubmission = {
  id: string;
  fullName: string;
  email: string;
  roundName: string;
  score: number;
  totalQuestions: number;
  submittedAt: number;
};

type DashboardStatsProps = {
  stats: StatCard[];
  recentSubmissions: RecentSubmission[];
  onViewAll: () => void;
};

export default function DashboardStats({
  stats,
  recentSubmissions,
  onViewAll,
}: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
          >
            <div className="text-4xl font-bold text-[var(--yellow)]">
              {stat.value}
            </div>
            <div className="mt-2 text-sm text-[var(--text-muted)]">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
          Recent Submissions
        </div>
        <div className="overflow-hidden rounded-lg border border-[var(--border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-card)] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Round</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.length === 0 ? (
                <tr className="bg-[var(--bg-primary)]">
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-[var(--text-muted)]"
                  >
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((submission, index) => (
                  <tr
                    key={submission.id}
                    className={index % 2 === 0 ? "bg-[var(--bg-primary)]" : "bg-[#111111]"}
                  >
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {submission.fullName}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {submission.email}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {submission.roundName}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {submission.score} / {submission.totalQuestions}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="mt-4 h-11 rounded-lg bg-[var(--yellow)] px-5 font-semibold text-[var(--text-on-yellow)] transition hover:bg-[var(--yellow-hover)]"
        >
          View All Submissions
        </button>
      </div>
    </div>
  );
}
