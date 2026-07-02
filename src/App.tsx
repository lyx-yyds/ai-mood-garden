import { useEffect, useMemo, useState } from 'react';
import './App.css';
import BootSequence from './components/BootSequence';
import MoodInput from './components/MoodInput';
import GardenPlot from './components/GardenPlot';
import HistoryLog from './components/HistoryLog';
import SoundTestPanel from './components/SoundTestPanel';
import { analyzeMood } from './services/moodService';
import { sound } from './services/soundService';
import type { GardenEntry } from './types';

const STORAGE_KEY = 'ai-mood-garden::entries';

function loadEntries(): GardenEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);
  const [entries, setEntries] = useState<GardenEntry[]>(() => loadEntries());

  // 当前展示的条目（默认展示最新一条）
  const current = useMemo(() => entries[0] ?? null, [entries]);

  // 持久化到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* ignore quota errors */
    }
  }, [entries]);

  // 启动序列开始时播放电源开启音效
  useEffect(() => {
    if (!booted) sound.boot();
  }, [booted]);

  const handleSubmit = async (text: string) => {
    setBusy(true);
    try {
      const result = await analyzeMood(text);
      const entry: GardenEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text,
        mood: result.mood,
        energy: result.energy,
        intensity: result.intensity,
        art: result.art,
        color: result.color,
        timestamp: Date.now(),
      };
      // 新条目放在最前
      setEntries((prev) => [entry, ...prev]);
      // 绽放音效：分析完成、植物生长时播放上行音阶
      sound.bloom();
    } finally {
      setBusy(false);
    }
  };

  const handleToggleMute = () => {
    // 用户点击即解锁音频上下文
    sound.unlock();
    const next = sound.toggleMuted();
    setMuted(next);
  };

  const handleClear = () => {
    if (window.confirm('确定要清空整个花园吗？此操作不可撤销。')) {
      setEntries([]);
    }
  };

  return (
    <>
      {/* CRT 扫描线 + 暗角效果覆盖层 */}
      <div className="crt-overlay" />
      <div className="crt-vignette" />

      {!booted && <BootSequence onComplete={() => setBooted(true)} />}

      <div className="app">
        <header className="app-header">
          <div>
            <span className="title">AI MOOD GARDEN</span>
            <span className="subtitle"> // 终端 v1.0</span>
          </div>
          <div className="header-right">
            <button
              className="sound-toggle"
              onClick={handleToggleMute}
              title={muted ? '开启音效' : '静音'}
              aria-label={muted ? '开启音效' : '静音'}
            >
              {muted ? '[ SND: OFF ]' : '[ SND: ON  ]'}
            </button>
            <span className="subtitle">
              SYS: ONLINE <span className="blink">_</span>
            </span>
          </div>
        </header>

        <main className="app-main">
          <MoodInput busy={busy} onSubmit={handleSubmit} />
          <GardenPlot current={current} busy={busy} />
        </main>

        <HistoryLog entries={entries} onClear={handleClear} />

        <SoundTestPanel />

        <footer className="app-footer">
          [ Plant your feelings · Watch them bloom ] — powered by TRAE ·
          ASCII art grown locally ·{' '}
          {entries.length} plant{entries.length === 1 ? '' : 's'} in garden
        </footer>
      </div>
    </>
  );
}
