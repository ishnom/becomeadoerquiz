type ScoreScreenProps = {
  fullName: string;
  score: number;
  total: number;
  percentage: number;
  timeTaken: number;
  correctQuestionNumbers: number[];
  onRedo: () => void;
};

export default function ScoreScreen({
  fullName,
  score,
  total,
  percentage,
  timeTaken,
  correctQuestionNumbers,
  onRedo,
}: ScoreScreenProps) {
  const percentageColor =
    percentage >= 70
      ? "bg-[var(--success)]"
      : percentage >= 40
        ? "bg-[var(--yellow)]"
        : "bg-[var(--danger)]";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
      <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
        Quiz Complete! 🎉
      </h2>
      <p className="mt-2 text-lg font-semibold text-[var(--yellow)]">
        {fullName}
      </p>
      <div className="mt-6 flex items-center justify-center">
        <div className="flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full border-[3px] border-[var(--yellow)]">
          <span className="text-4xl font-bold text-[var(--yellow)]">{score}</span>
          <span className="text-sm text-[var(--text-primary)]">/ {total}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center">
        <span
          className={`rounded-full px-4 py-1 text-sm font-semibold text-[var(--text-on-yellow)] ${percentageColor}`}
        >
          {percentage}%
        </span>
      </div>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        Completed in {timeTaken} seconds
      </p>
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-left">
        <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">
          Correct questions
        </p>
        <p className="mt-2 text-sm text-[var(--text-primary)]">
          {correctQuestionNumbers.length
            ? correctQuestionNumbers.join(", ")
            : "No correct answers this time."}
        </p>
      </div>
      <p className="mt-4 text-sm text-[var(--text-muted)]">
        Your answers have been submitted successfully.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={onRedo}
          className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] font-semibold text-[var(--text-primary)]"
        >
          Redo Quiz
        </button>
        <a
          href="https://becomeadoer.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[var(--yellow)] font-semibold text-[var(--text-on-yellow)]"
        >
          Visit becomeadoer.com
        </a>
      </div>
    </div>
  );
}
