"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export type Round = {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  questions?: Array<{ id: string }>;
};

type QRInfo = {
  roundId: string;
  roundName: string;
  url: string;
  expiresAt: number;
};

type RoundsManagerProps = {
  rounds: Round[];
  submissionsByRound: Record<string, number>;
  onCreateRound: (name: string, description: string) => Promise<void>;
  onDeleteRound: (roundId: string) => Promise<void>;
  onManageQuestions: (roundId: string) => void;
  onViewSubmissions: (roundId: string) => void;
  onGenerateQr: (round: Round) => Promise<QRInfo>;
};

export default function RoundsManager({
  rounds,
  submissionsByRound,
  onCreateRound,
  onDeleteRound,
  onManageQuestions,
  onViewSubmissions,
  onGenerateQr,
}: RoundsManagerProps) {
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [modalError, setModalError] = useState("");
  const [qrInfo, setQrInfo] = useState<QRInfo | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const handleCreate = async () => {
    if (!createName.trim()) {
      setModalError("Round name is required.");
      return;
    }
    setModalError("");
    await onCreateRound(createName.trim(), createDescription.trim());
    setCreateName("");
    setCreateDescription("");
    setShowCreateModal(false);
  };

  const handleGenerateQr = async (round: Round) => {
    setQrLoading(true);
    const info = await onGenerateQr(round);
    setQrInfo(info);
    setShowQrModal(true);
    setQrLoading(false);
  };

  const handleDownloadQr = () => {
    if (!qrRef.current || !qrInfo) return;
    const dataUrl = qrRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${qrInfo.roundName}_qr.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Rounds</h2>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="h-11 rounded-lg bg-[var(--yellow)] px-5 font-semibold text-[var(--text-on-yellow)] transition hover:bg-[var(--yellow-hover)]"
        >
          Create New Round
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rounds.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-6 text-[var(--text-muted)]">
            No rounds yet. Create your first round.
          </div>
        ) : (
          rounds.map((round) => (
            <div
              key={round.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {round.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {round.description || "No description provided."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                <span className="rounded-full border border-[var(--border)] px-3 py-1">
                  {(round.questions?.length || 0).toString()} Questions
                </span>
                <span className="rounded-full border border-[var(--border)] px-3 py-1">
                  {(submissionsByRound[round.id] || 0).toString()} Submissions
                </span>
              </div>
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                Created: {new Date(round.createdAt).toLocaleString()}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onManageQuestions(round.id)}
                  className="h-9 rounded-lg bg-[var(--yellow)] px-4 text-sm font-semibold text-[var(--text-on-yellow)]"
                >
                  Manage Questions
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateQr(round)}
                  className="h-9 rounded-lg border border-[var(--border)] px-4 text-sm text-[var(--text-primary)]"
                >
                  Generate QR
                </button>
                <button
                  type="button"
                  onClick={() => onViewSubmissions(round.id)}
                  className="h-9 rounded-lg border border-[var(--border)] px-4 text-sm text-[var(--text-primary)]"
                >
                  View Submissions
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRound(round.id)}
                  className="h-9 rounded-lg border border-[var(--danger)] px-4 text-sm text-[var(--danger)]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              Create New Round
            </h3>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Name and describe the round.
            </p>
            <div className="mt-5 space-y-4">
              <input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="e.g. Marketing Basics, Tech Quiz, Round 1"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-2 focus:border-[var(--yellow)]"
              />
              <textarea
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                rows={3}
                placeholder="Brief description of this round..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-2 focus:border-[var(--yellow)]"
              />
              {modalError ? (
                <p className="text-sm text-[var(--danger)]">{modalError}</p>
              ) : null}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCreate}
                className="h-11 flex-1 rounded-lg bg-[var(--yellow)] font-semibold text-[var(--text-on-yellow)]"
              >
                Create Round
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="h-11 flex-1 rounded-lg border border-[var(--border)] text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showQrModal && qrInfo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">
                QR Code — {qrInfo.roundName}
              </h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-sm text-[var(--text-muted)]"
              >
                Close
              </button>
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="rounded-lg bg-white p-3">
                <QRCodeCanvas
                  value={qrInfo.url}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  ref={qrRef}
                />
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                This QR expires in 72 hours.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Expires: {new Date(qrInfo.expiresAt).toLocaleString()}
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="h-11 rounded-lg bg-[var(--yellow)] font-semibold text-[var(--text-on-yellow)]"
              >
                Download QR
              </button>
              <button
                type="button"
                onClick={() => handleGenerateQr({
                  id: qrInfo.roundId,
                  name: qrInfo.roundName,
                  description: "",
                  createdAt: Date.now(),
                })}
                className="h-11 rounded-lg border border-[var(--border)] text-[var(--text-primary)]"
                disabled={qrLoading}
              >
                {qrLoading ? "Generating..." : "Regenerate QR"}
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="h-11 rounded-lg border border-[var(--border)] text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
