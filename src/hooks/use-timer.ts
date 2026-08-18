import { useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

type TimerState = {
  taskId: string;
  startedAt: number;
  accumulated: number;
};

const STORAGE_KEY = "elevatex_timer";
const TICK_MS = 1000;

function loadTimer(): TimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TimerState;
    if (!parsed.taskId || !parsed.startedAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveTimer(state: TimerState | null) {
  if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  else localStorage.removeItem(STORAGE_KEY);
}

export function useTaskTimer(taskId: string | null, userId?: string) {
  const [active, setActive] = useState<TimerState | null>(() => {
    const t = loadTimer();
    return t && t.taskId === taskId ? t : null;
  });
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(Boolean(active));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = loadTimer();
    if (stored && stored.taskId === taskId) {
      setActive(stored);
      setRunning(true);
    } else {
      setActive(null);
      setRunning(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (running && active) {
      intervalRef.current = setInterval(() => {
        setElapsed(active.accumulated + Math.floor((Date.now() - active.startedAt) / 1000));
      }, TICK_MS);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, active]);

  function start() {
    if (running) return;
    const state: TimerState = { taskId: taskId!, startedAt: Date.now(), accumulated: 0 };
    setActive(state);
    setRunning(true);
    saveTimer(state);
  }

  function pause() {
    if (!active) return;
    const newAccumulated = active.accumulated + Math.floor((Date.now() - active.startedAt) / 1000);
    const paused: TimerState = { ...active, accumulated: newAccumulated, startedAt: 0 };
    // When paused, we keep it in storage but set startedAt to 0 meaning "not ticking"
    // Actually for simplicity, let's just clear running and store accumulated
    setActive(null);
    setRunning(false);
    saveTimer(null);
    // Store the accumulated seconds so resume can use it
    localStorage.setItem(`${STORAGE_KEY}_paused_${taskId}`, JSON.stringify({ taskId, accumulated: newAccumulated }));
  }

  function resume() {
    const pausedRaw = localStorage.getItem(`${STORAGE_KEY}_paused_${taskId}`);
    const pausedAccumulated = pausedRaw ? (JSON.parse(pausedRaw) as { accumulated: number }).accumulated : 0;
    const state: TimerState = { taskId: taskId!, startedAt: Date.now(), accumulated: pausedAccumulated };
    setActive(state);
    setRunning(true);
    saveTimer(state);
  }

  async function stop() {
    let totalSeconds = 0;
    if (active) {
      totalSeconds = active.accumulated + Math.floor((Date.now() - active.startedAt) / 1000);
    } else {
      const pausedRaw = localStorage.getItem(`${STORAGE_KEY}_paused_${taskId}`);
      if (pausedRaw) {
        totalSeconds = (JSON.parse(pausedRaw) as { accumulated: number }).accumulated;
      }
    }
    if (totalSeconds > 0 && userId) {
      await supabase.from("task_time_entries").insert({
        task_id: taskId,
        user_id: userId,
        started_at: new Date(Date.now() - totalSeconds * 1000).toISOString(),
        ended_at: new Date().toISOString(),
        seconds: totalSeconds,
      });
    }
    setActive(null);
    setRunning(false);
    setElapsed(0);
    saveTimer(null);
    localStorage.removeItem(`${STORAGE_KEY}_paused_${taskId}`);
    return totalSeconds;
  }

  return { running, elapsed: running ? elapsed : 0, start, pause, resume, stop };
}
