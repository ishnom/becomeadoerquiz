type Question = {
  question: string;
  choices: string[];
};

type QuestionScreenProps = {
  question: Question;
  index: number;
  total: number;
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  onNext: () => void;
};

export default function QuestionScreen({
  question,
  index,
  total,
  selectedAnswer,
  onSelect,
  onNext,
}: QuestionScreenProps) {
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;

  return (
    <div className="space-y-5">
      <div className="h-2 w-full rounded-full bg-[var(--border)]">
        <div
          className="h-2 rounded-full bg-[var(--yellow)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <p className="text-sm text-[var(--text-muted)]">
          Question {index + 1} of {total}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">
          {question.question}
        </h2>
        <div className="mt-5 space-y-3">
          {question.choices.map((choice, choiceIndex) => {
            const isSelected = selectedAnswer === choiceIndex;
            return (
              <button
                key={`${choice}-${choiceIndex}`}
                type="button"
                onClick={() => onSelect(choiceIndex)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                  isSelected
                    ? "border-[var(--yellow)] bg-[var(--yellow-soft)]"
                    : "border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                <span className="mr-3 font-semibold text-[var(--yellow)]">
                  {String.fromCharCode(65 + choiceIndex)}.
                </span>
                {choice}
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={selectedAnswer === null}
        className={`h-[52px] w-full rounded-lg font-semibold transition ${
          selectedAnswer === null
            ? "bg-[var(--border)] text-[var(--text-muted)]"
            : "bg-[var(--yellow)] text-[var(--text-on-yellow)] hover:bg-[var(--yellow-hover)]"
        }`}
      >
        {index + 1 === total ? "Submit Quiz ✓" : "Next Question →"}
      </button>
    </div>
  );
}
