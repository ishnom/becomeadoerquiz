"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { get, push, ref, set } from "firebase/database";
import { db } from "@/lib/firebase";
import UserInfoScreen from "@/components/quiz/UserInfoScreen";
import QuestionScreen from "@/components/quiz/QuestionScreen";
import ScoreScreen from "@/components/quiz/ScoreScreen";

type Round = {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  questions: Question[];
};

type Question = {
  id: string;
  question: string;
  choices: string[];
  answer: number;
};

type AnswerDetail = {
  questionIndex: number;
  question: string;
  selectedAnswer: number;
  selectedText: string;
  correctAnswer: number;
  correctText: string;
  isCorrect: boolean;
};

type Screen = "info" | "question" | "score";

export default function QuizPage() {
  const params = useParams();
  const roundIdParam = params?.roundId;
  const roundId = Array.isArray(roundIdParam) ? roundIdParam[0] : roundIdParam;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [round, setRound] = useState<Round | null>(null);
  const [screen, setScreen] = useState<Screen>("info");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);

  useEffect(() => {
    if (!roundId) return;
    const loadRound = async () => {
      setLoading(true);
      setError("");
      try {
        const qrSnapshot = await get(ref(db, `qrcodes/${roundId}`));
        if (!qrSnapshot.exists()) {
          setError("This QR code is invalid.");
          setLoading(false);
          return;
        }
        const qrData = qrSnapshot.val();
        if (!qrData.active || qrData.expiresAt < Date.now()) {
          setError("This QR code has expired.");
          setLoading(false);
          return;
        }

        const roundSnapshot = await get(ref(db, `rounds/${roundId}`));
        if (!roundSnapshot.exists()) {
          setError("Round not found.");
          setLoading(false);
          return;
        }
        const roundData = roundSnapshot.val();
        const questions = (roundData.questions || []) as Question[];
        setRound({ id: roundId, ...roundData, questions });
        setAnswers(Array(questions.length).fill(null));
      } catch (err) {
        setError("Unable to load quiz. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    void loadRound();
  }, [roundId]);

  const currentQuestion = round?.questions[currentIndex];

  const handleUserSubmit = () => {
    if (!fullName.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Valid email is required.");
      return;
    }
    setFormError("");
    setStartTime(Date.now());
    setScreen("question");
  };

  const handleNext = async () => {
    if (!round || !currentQuestion || selectedAnswer === null) return;

    const nextAnswers = [...answers];
    nextAnswers[currentIndex] = selectedAnswer;
    setAnswers(nextAnswers);

    const isLast = currentIndex + 1 === round.questions.length;
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(nextAnswers[currentIndex + 1] ?? null);
      return;
    }

    const total = round.questions.length;
    const answerDetails: AnswerDetail[] = round.questions.map(
      (question, index) => {
        const selected = nextAnswers[index] ?? 0;
        const selectedText = question.choices[selected] || "";
        const correctText = question.choices[question.answer] || "";
        return {
          questionIndex: index,
          question: question.question,
          selectedAnswer: selected,
          selectedText,
          correctAnswer: question.answer,
          correctText,
          isCorrect: selected === question.answer,
        };
      }
    );

    const finalScore = answerDetails.filter((answer) => answer.isCorrect).length;
    const finalPercentage = total
      ? Math.round((finalScore / total) * 100)
      : 0;
    const seconds = startTime
      ? Math.max(1, Math.round((Date.now() - startTime) / 1000))
      : 0;

    const submissionId = push(ref(db, `submissions/${round.id}`)).key;
    if (submissionId) {
      await set(ref(db, `submissions/${round.id}/${submissionId}`), {
        fullName: fullName.trim(),
        email: email.trim(),
        score: finalScore,
        totalQuestions: total,
        percentage: finalPercentage,
        timeTaken: seconds,
        submittedAt: Date.now(),
        answers: answerDetails,
      });
    }

    setScore(finalScore);
    setPercentage(finalPercentage);
    setTimeTaken(seconds);
    setScreen("score");
  };

  const canSubmitInfo = useMemo(() => {
    return fullName.trim().length > 0 && email.trim().length > 0;
  }, [fullName, email]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
        <p className="text-sm text-[var(--text-muted)]">Loading quiz...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center text-[var(--text-primary)]">
          {error}
        </div>
      </main>
    );
  }

  if (!round) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-8">
      <div className="w-full max-w-[420px] space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--yellow)]">
            BecomeADoerQuiz
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {round.name}
          </p>
        </div>

        {screen === "info" ? (
          <UserInfoScreen
            fullName={fullName}
            email={email}
            error={formError}
            onChangeName={setFullName}
            onChangeEmail={setEmail}
            onSubmit={handleUserSubmit}
            disabled={!canSubmitInfo}
          />
        ) : null}

        {screen === "question" && currentQuestion ? (
          <QuestionScreen
            question={currentQuestion}
            index={currentIndex}
            total={round.questions.length}
            selectedAnswer={selectedAnswer}
            onSelect={setSelectedAnswer}
            onNext={handleNext}
          />
        ) : null}

        {screen === "score" ? (
          <ScoreScreen
            fullName={fullName}
            score={score}
            total={round.questions.length}
            percentage={percentage}
            timeTaken={timeTaken}
          />
        ) : null}
      </div>
    </main>
  );
}
