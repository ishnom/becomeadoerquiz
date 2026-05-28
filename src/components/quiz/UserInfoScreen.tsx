type UserInfoScreenProps = {
  fullName: string;
  email: string;
  error: string;
  onChangeName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

export default function UserInfoScreen({
  fullName,
  email,
  error,
  onChangeName,
  onChangeEmail,
  onSubmit,
  disabled,
}: UserInfoScreenProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">
        Enter your details
      </h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Use your real name and email before starting the quiz.
      </p>
      <div className="mt-5 space-y-4">
        <input
          value={fullName}
          onChange={(event) => onChangeName(event.target.value)}
          placeholder="Full name"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-2 focus:border-[var(--yellow)]"
        />
        <input
          value={email}
          onChange={(event) => onChangeEmail(event.target.value)}
          placeholder="Email address"
          type="email"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-2 focus:border-[var(--yellow)]"
        />
        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled}
          className={`h-12 w-full rounded-lg font-semibold transition ${
            disabled
              ? "bg-[var(--border)] text-[var(--text-muted)]"
              : "bg-[var(--yellow)] text-[var(--text-on-yellow)] hover:bg-[var(--yellow-hover)]"
          }`}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}
