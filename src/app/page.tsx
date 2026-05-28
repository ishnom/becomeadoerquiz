export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-6 py-12 text-center">
      <div className="max-w-xl space-y-5">
        <h1 className="text-[42px] font-bold text-[var(--yellow)]">
          BecomeADoerQuiz
        </h1>
        <p className="text-2xl font-semibold text-[var(--text-primary)]">
            Hey Doer! 👋
        </p>
        <p className="text-base text-[var(--text-muted)]">
          Visit becomeadoer.com for course details and upcoming programs.
        </p>
        <a
          href="https://becomeadoer.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--yellow)] px-6 font-bold text-[var(--text-on-yellow)] transition hover:bg-[var(--yellow-hover)]"
        >
          Visit BecomeADoer.com
        </a>
        <p className="pt-6 text-sm text-[#444444]">
          Scan your quiz QR code to take a quiz
        </p>
      </div>
    </main>
  );
}
