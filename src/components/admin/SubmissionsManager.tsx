"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { Round } from "./RoundsManager";

type Submission = {
  id: string;
  roundId: string;
  roundName: string;
  fullName: string;
  email: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  submittedAt: number;
  answers: Array<{
    questionIndex: number;
    question: string;
    selectedAnswer: number;
    selectedText: string;
    correctAnswer: number;
    correctText: string;
    isCorrect: boolean;
  }>;
};

type SubmissionsManagerProps = {
  rounds: Round[];
  submissions: Submission[];
  selectedRoundId: string | null;
  onSelectRound: (roundId: string | null) => void;
};

export default function SubmissionsManager({
  rounds,
  submissions,
  selectedRoundId,
  onSelectRound,
}: SubmissionsManagerProps) {
  const filtered = selectedRoundId
    ? submissions.filter((submission) => submission.roundId === selectedRoundId)
    : submissions;

  const averageScore = filtered.length
    ? Math.round(
        filtered.reduce((acc, submission) => acc + submission.score, 0) /
          filtered.length
      )
    : 0;
  const averageTime = filtered.length
    ? Math.round(
        filtered.reduce((acc, submission) => acc + submission.timeTaken, 0) /
          filtered.length
      )
    : 0;

  const handleExport = () => {
    const roundName =
      rounds.find((round) => round.id === selectedRoundId)?.name || "all_rounds";
    const data = filtered.map((submission, index) => ({
      "#": index + 1,
      "Full Name": submission.fullName,
      Email: submission.email,
      Round: submission.roundName,
      Score: `${submission.score} / ${submission.totalQuestions}`,
      Percentage: `${submission.percentage}%`,
      "Time Taken": `${submission.timeTaken}s`,
      "Submitted At": new Date(submission.submittedAt).toLocaleString(),
      ...submission.answers.reduce((acc, answer, idx) => ({
        ...acc,
        [`Q${idx + 1}`]: answer.selectedText,
        [`Q${idx + 1} Correct`]: answer.isCorrect ? "✓" : "✗",
      }), {} as Record<string, string>),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Submissions");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), `${roundName}_submissions.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Submissions
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedRoundId || ""}
            onChange={(event) =>
              onSelectRound(event.target.value || null)
            }
            className="h-11 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm text-[var(--text-primary)] focus:border-2 focus:border-[var(--yellow)]"
          >
            <option value="">All Rounds</option>
            {rounds.map((round) => (
              <option key={round.id} value={round.id}>
                {round.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleExport}
            className="h-11 rounded-lg bg-[var(--yellow)] px-5 font-semibold text-[var(--text-on-yellow)]"
          >
            Export to Excel
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="text-3xl font-bold text-[var(--yellow)]">
            {filtered.length}
          </div>
          <div className="mt-2 text-sm text-[var(--text-muted)]">
            Total Submissions
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="text-3xl font-bold text-[var(--yellow)]">
            {averageScore}
          </div>
          <div className="mt-2 text-sm text-[var(--text-muted)]">
            Average Score
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="text-3xl font-bold text-[var(--yellow)]">
            {averageTime}s
          </div>
          <div className="mt-2 text-sm text-[var(--text-muted)]">
            Average Time
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg-hover)] text-xs uppercase text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Round</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Percentage</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-6 text-center text-[var(--text-muted)]"
                >
                  No submissions yet.
                </td>
              </tr>
            ) : (
              filtered.map((submission, index) => (
                <tr
                  key={submission.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--bg-hover)]"
                >
                  <td className="px-4 py-3">{index + 1}</td>
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
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        submission.percentage >= 70
                          ? "bg-[var(--success)] text-white"
                          : submission.percentage >= 40
                            ? "bg-[var(--yellow-soft)] text-[var(--yellow)]"
                            : "bg-[var(--danger)] text-white"
                      }`}
                    >
                      {submission.percentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {submission.timeTaken}s
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-primary)]"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
