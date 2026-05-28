"use client";

import { useEffect, useMemo, useState } from "react";
import { off, onValue, push, ref, remove, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { checkAdminAuth, clearAdminAuth, setAdminAuth } from "@/lib/auth";
import Sidebar, { SidebarTab } from "@/components/admin/Sidebar";
import DashboardStats from "@/components/admin/DashboardStats";
import RoundsManager, { Round } from "@/components/admin/RoundsManager";
import QuestionsManager from "@/components/admin/QuestionsManager";
import SubmissionsManager from "@/components/admin/SubmissionsManager";

type Question = {
  id: string;
  question: string;
  choices: string[];
  answer: number;
};

type QRCodeEntry = {
  roundId: string;
  roundName: string;
  expiresAt: number;
  createdAt: number;
  active: boolean;
};

type SubmissionBase = {
  id: string;
  roundId: string;
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

const ADMIN_PASSWORD = "becomeadoer@@##77";

export default function AdminPage() {
  const [adminReady, setAdminReady] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [qrcodes, setQrcodes] = useState<QRCodeEntry[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionBase[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);

  useEffect(() => {
    if (checkAdminAuth()) {
      setAdminReady(true);
    }
  }, []);

  useEffect(() => {
    if (!adminReady) return;
    const roundsRef = ref(db, "rounds");
    const qrcodesRef = ref(db, "qrcodes");
    const submissionsRef = ref(db, "submissions");

    onValue(roundsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list: Round[] = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as Omit<Round, "id">),
      }));
      list.sort((a, b) => b.createdAt - a.createdAt);
      setRounds(list);
    });

    onValue(qrcodesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list: QRCodeEntry[] = Object.entries(data).map(([roundId, value]) => ({
        roundId,
        ...(value as Omit<QRCodeEntry, "roundId">),
      }));
      setQrcodes(list);
    });

    onValue(submissionsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list: SubmissionBase[] = [];
      Object.entries(data).forEach(([roundId, submissionsForRound]) => {
        if (!submissionsForRound) return;
        Object.entries(submissionsForRound as Record<string, SubmissionBase>).forEach(
          ([id, value]) => {
            list.push({
              ...value,
              id,
              roundId,
            });
          }
        );
      });
      list.sort((a, b) => b.submittedAt - a.submittedAt);
      setSubmissions(list);
    });

    return () => {
      off(roundsRef);
      off(qrcodesRef);
      off(submissionsRef);
    };
  }, [adminReady]);

  const roundsMap = useMemo(() => {
    return rounds.reduce<Record<string, Round>>((acc, round) => {
      acc[round.id] = round;
      return acc;
    }, {});
  }, [rounds]);

  const submissionsWithRoundName = useMemo(() => {
    return submissions.map((submission) => ({
      ...submission,
      roundName: roundsMap[submission.roundId]?.name || "Unknown",
    }));
  }, [submissions, roundsMap]);

  const submissionCounts = useMemo(() => {
    return submissions.reduce<Record<string, number>>((acc, submission) => {
      acc[submission.roundId] = (acc[submission.roundId] || 0) + 1;
      return acc;
    }, {});
  }, [submissions]);

  const stats = useMemo(() => {
    const totalQuestions = rounds.reduce(
      (acc, round) => acc + (round.questions?.length || 0),
      0
    );
    const activeQrCodes = qrcodes.filter(
      (code) => code.active && code.expiresAt > Date.now()
    ).length;
    return [
      { label: "Total Rounds", value: rounds.length },
      { label: "Total Questions", value: totalQuestions },
      { label: "Total Submissions", value: submissions.length },
      { label: "Active QR Codes", value: activeQrCodes },
    ];
  }, [rounds, submissions.length, qrcodes]);

  const recentSubmissions = useMemo(() => {
    return submissionsWithRoundName.slice(0, 5).map((submission) => ({
      id: submission.id,
      fullName: submission.fullName,
      email: submission.email,
      roundName: submission.roundName,
      score: submission.score,
      totalQuestions: submission.totalQuestions,
      submittedAt: submission.submittedAt,
    }));
  }, [submissionsWithRoundName]);

  const selectedRound = selectedRoundId ? roundsMap[selectedRoundId] : null;
  const selectedQuestions = (selectedRound?.questions || []) as Question[];

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAdminAuth();
      setAdminReady(true);
      setLoginError("");
      return;
    }
    setLoginError("Incorrect password. Try again.");
  };

  const handleLogout = () => {
    clearAdminAuth();
    setAdminReady(false);
    setPassword("");
  };

  const handleCreateRound = async (name: string, description: string) => {
    const roundId = push(ref(db, "rounds")).key;
    if (!roundId) return;
    await set(ref(db, `rounds/${roundId}`), {
      name,
      description,
      createdAt: Date.now(),
      questions: [],
    });
  };

  const handleDeleteRound = async (roundId: string) => {
    await remove(ref(db, `rounds/${roundId}`));
  };

  const handleGenerateQr = async (round: Round) => {
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000;
    const url = `${window.location.origin}/quiz/${round.id}`;
    const payload = {
      roundId: round.id,
      roundName: round.name,
      expiresAt,
      createdAt: now,
      active: true,
    };
    await set(ref(db, `qrcodes/${round.id}`), payload);
    return { ...payload, url };
  };

  const handleAddQuestion = async (roundId: string, question: Question) => {
    const round = roundsMap[roundId];
    if (!round) return;
    const nextQuestions = [...(round.questions || []), question];
    await set(ref(db, `rounds/${roundId}/questions`), nextQuestions);
  };

  const handleDeleteQuestion = async (roundId: string, questionId: string) => {
    const round = roundsMap[roundId];
    if (!round || !round.questions) return;
    const nextQuestions = round.questions.filter(
      (question) => (question as Question).id !== questionId
    );
    await set(ref(db, `rounds/${roundId}/questions`), nextQuestions);
  };

  const pageTitle =
    activeTab === "dashboard"
      ? "Dashboard"
      : activeTab === "rounds"
        ? "Rounds"
        : activeTab === "questions"
          ? "Questions"
          : "Submissions";

  if (!adminReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Admin Access
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            BecomeADoerQuiz Dashboard
          </p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setLoginError("");
              }}
              placeholder="Admin password"
              className="h-[52px] w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 text-sm text-[var(--text-primary)] focus:border-2 focus:border-[var(--yellow)]"
            />
            {loginError ? (
              <p className="text-sm text-[var(--danger)]">{loginError}</p>
            ) : null}
            <button
              type="submit"
              className="h-[52px] w-full rounded-lg bg-[var(--yellow)] font-bold text-[var(--text-on-yellow)]"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <div className="w-[240px] border-r border-[var(--border)]">
        <Sidebar
          activeTab={activeTab}
          onSelect={setActiveTab}
          onLogout={handleLogout}
        />
      </div>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {pageTitle}
          </h2>
          <span className="rounded-full bg-[var(--yellow-soft)] px-4 py-1 text-xs font-semibold text-[var(--yellow)]">
            Admin
          </span>
        </header>
        <main className="flex-1 p-6">
          {activeTab === "dashboard" ? (
            <DashboardStats
              stats={stats}
              recentSubmissions={recentSubmissions}
              onViewAll={() => setActiveTab("submissions")}
            />
          ) : null}

          {activeTab === "rounds" ? (
            <RoundsManager
              rounds={rounds}
              submissionsByRound={submissionCounts}
              onCreateRound={handleCreateRound}
              onDeleteRound={handleDeleteRound}
              onManageQuestions={(roundId) => {
                setSelectedRoundId(roundId);
                setActiveTab("questions");
              }}
              onViewSubmissions={(roundId) => {
                setSelectedRoundId(roundId);
                setActiveTab("submissions");
              }}
              onGenerateQr={handleGenerateQr}
            />
          ) : null}

          {activeTab === "questions" ? (
            <QuestionsManager
              rounds={rounds}
              selectedRoundId={selectedRoundId}
              questions={selectedQuestions}
              onSelectRound={(roundId) => setSelectedRoundId(roundId)}
              onAddQuestion={handleAddQuestion}
              onDeleteQuestion={handleDeleteQuestion}
            />
          ) : null}

          {activeTab === "submissions" ? (
            <SubmissionsManager
              rounds={rounds}
              submissions={submissionsWithRoundName}
              selectedRoundId={selectedRoundId}
              onSelectRound={setSelectedRoundId}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
