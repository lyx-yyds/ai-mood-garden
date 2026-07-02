import type { GardenEntry } from '../types';

interface HistoryLogProps {
  entries: GardenEntry[];
  onClear: () => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${mo}/${da} ${hh}:${mm}`;
}

export default function HistoryLog({ entries, onClear }: HistoryLogProps) {
  return (
    <div className="panel">
      <div className="panel-title">// 06 — GARDEN LOG :: 情绪档案</div>
      <div className="history">
        {entries.length === 0 ? (
          <div className="history-empty">
            {'> 暂无记录。你的情绪花园历史将在此显示。'}
          </div>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="history-item">
              <span className="time">[{formatTime(e.timestamp)}]</span>
              <span className="mood" style={{ color: e.color }}>
                {e.mood}({e.energy})
              </span>
              <span className="text">{e.text}</span>
            </div>
          ))
        )}
      </div>
      {entries.length > 0 && (
        <button className="history-clear" onClick={onClear}>
          [ 清空花园 ]  rm -rf ./garden/*
        </button>
      )}
    </div>
  );
}
