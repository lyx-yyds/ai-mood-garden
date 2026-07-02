import { useEffect, useState } from 'react';
import type { GardenEntry } from '../types';

interface GardenPlotProps {
  /** 当前展示的花园条目（最新一次情绪） */
  current: GardenEntry | null;
  /** 是否正在分析中 */
  busy: boolean;
}

export default function GardenPlot({ current, busy }: GardenPlotProps) {
  // 控制 "生长" 动画的触发：每次 current 变化时重置
  const [growing, setGrowing] = useState(false);

  useEffect(() => {
    if (!current) return;
    setGrowing(false);
    const t = window.setTimeout(() => setGrowing(true), 30);
    return () => window.clearTimeout(t);
  }, [current]);

  return (
    <div className="panel">
      <div className="panel-title">// 05 — THE BLOOM :: ASCII 花园</div>
      <div className="garden">
        <div className="garden-grid">
          {busy ? (
            <div className="garden-empty">
              {'> '}
              <span className="blink">正在播种...</span>
            </div>
          ) : current ? (
            <pre
              className={`garden-art ${growing ? 'growing' : ''} ${current.mood === 'Sadness' || current.mood === 'Anger' ? 'glitch' : ''}`}
              style={{ color: current.color }}
            >
              {current.art}
            </pre>
          ) : (
            <div className="garden-empty">
              {'> 花园是空的。种下第一颗情绪种子吧。'}
              <br />
              {'> ___________________________'}
              <br />
              {'> (soil ready)'}
            </div>
          )}
        </div>

        {current && (
          <div className="garden-meta">
            <span>
              MOOD:{' '}
              <span className="mood-tag" style={{ color: current.color }}>
                {current.mood}
              </span>
            </span>
            <span>ENERGY: {current.energy}</span>
            <span>
              INTENSITY: {Math.round(current.intensity * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
