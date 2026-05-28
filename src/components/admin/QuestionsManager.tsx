"use client";

import { useEffect, useState } from "react";
import type { Round } from "./RoundsManager";

type Question = {
  id: string;
  question: string;
  choices: string[];
  answer: number;
};

type QuestionsManagerProps = {
  rounds: Round[];
  selectedRoundId: string | null;
  questions: Question[];
  onSelectRound: (roundId: string) => void;
  onAddQuestion: (roundId: string, question: Question) => Promise<void>;
  onDeleteQuestion: (roundId: string, questionId: string) => Promise<void>;
};

export default function QuestionsManager({
  rounds,
  selectedRoundId,
  questions,
  onSelectRound,
  onAddQuestion,
  onDeleteQuestion,
}: QuestionsManagerProps) {
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState<string[]>(["", ""]);
  const [correctIndex, setCorrectIndex] = useState<number | "">("");
  const selectedRound = rounds.find((round) => round.id === selectedRoundId);

  useEffect(() => {
    setQuestionText("");
    setChoices(["", ""]);
    setCorrectIndex("");
  }, [selectedRoundId]);

  const handleAddChoice = () => {
    setChoices((prev) => [...prev, ""]);
  };

  const handleRemoveChoice = (index: number) => {
    setChoices((prev) => prev.filter((_, idx) => idx !== index));
    if (typeof correctIndex === "number" && correctIndex === index) {
      setCorrectIndex("");
    }
  };

  const canSubmit =
    questionText.trim().length > 0 &&
    choices.filter((choice) => choice.trim().length > 0).length >= 2 &&
    typeof correctIndex === "number";

  const handleSubmit = async () => {
    if (!selectedRoundId || !canSubmit) return;
    const trimmedChoices = choices
      .map((choice) => choice.trim())
      .filter((choice) => choice.length > 0);
    const question: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      question: questionText.trim(),
      choices: trimmedChoices,
      answer: typeof correctIndex === "number" ? correctIndex : 0,
    };
    await onAddQuestion(selectedRoundId, question);
    setQuestionText("");
    setChoices(["", ""]);
    setCorrectIndex("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Questions
        </h2>
        <select
          value={selectedRoundId || ""}
          onChange={(event) => onSelectRound(event.target.value)}
          className="h-12 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm text-[var(--text-primary)] focus:border-2 focus:border-[var(--yellow)]"
        >
          <option value="">Select a round to manage questions</option>
          {rounds.map((round) => (
            <option key={round.id} value={round.id}>
              {round.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRound ? (
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Add Question to {selectedRound.name}
            </h3>
            <div className="mt-4 space-y-4">
              <textarea
                value={questionText}
                onChange={(event) => setQuestionText(event.target.value)}
                rows={3}
                placeholder="Type your question here..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-2 focus:border-[var(--yellow)]"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Answer Choices
                </p>
                <div className="mt-3 space-y-3">
                  {choices.map((choice, index) => (
                    <div key={`choice-${index}`} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--yellow)] text-sm font-semibold text-[var(--text-on-yellow)]">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <input
                        value={choice}
                        onChange={(event) => {
                          const next = [...choices];
                          next[index] = event.target.value;
                          setChoices(next);
                        }}
                        placeholder={`Enter choice ${String.fromCharCode(65 + index)}...`}
                        className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm text-[var(--text-primary)] focus:border-2 focus:border-[var(--yellow)]"
                      />
                      {choices.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveChoice(index)}
                          className="text-lg text-[var(--danger)]"
                        >
                          ×
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddChoice}
                  className="mt-3 w-full rounded-lg border border-dashed border-[var(--border)] py-2 text-sm text-[var(--text-muted)]"
                >
                  Add Another Choice
                </button>
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--text-primary)]">
                  Correct Answer
                </label>
                <select
                  value={correctIndex}
                  onChange={(event) => setCorrectIndex(Number(event.target.value))}
                  className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm text-[var(--text-primary)] focus:border-2 focus:border-[var(--yellow)]"
                >
                  <option value="">Select correct answer</option>
                  {choices.map((choice, index) => (
                    <option key={`answer-${index}`} value={index}>
                      {String.fromCharCode(65 + index)} — {choice || "(empty)"}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`h-12 w-full rounded-lg font-semibold transition ${
                  canSubmit
                    ? "bg-[var(--yellow)] text-[var(--text-on-yellow)] hover:bg-[var(--yellow-hover)]"
                    : "bg-[var(--border)] text-[var(--text-muted)]"
                }`}
              >
                Add Question
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Questions ({questions.length})
              </h3>
            </div>
            <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-2">
              {questions.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No questions yet. Add your first question.
                </p>
              ) : (
                questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          <span className="mr-2 rounded-full bg-[var(--yellow)] px-2 py-1 text-xs font-bold text-[var(--text-on-yellow)]">
                            {index + 1}
                          </span>
                          {question.question}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {question.choices.map((choice, choiceIndex) => (
                            <span
                              key={`${question.id}-${choiceIndex}`}
                              className={`rounded-full px-3 py-1 text-xs ${
                                choiceIndex === question.answer
                                  ? "bg-[var(--success)] text-white"
                                  : "border border-[var(--border)] text-[var(--text-muted)]"
                              }`}
                            >
                              {choiceIndex === question.answer ? "✓ Correct" : ""} {choice}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteQuestion(selectedRound.id, question.id)}
                        className="text-xs text-[var(--danger)]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-sm text-[var(--text-muted)]">
          Select a round to manage questions.
        </div>
      )}
    </div>
  );
}
