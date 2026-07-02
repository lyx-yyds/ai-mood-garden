import { useEffect, useRef, useState } from 'react';

// 启动序列文本（含简单的着色标记：<ok>绿色</ok> <accent>琥珀</accent>）
const BOOT_LINES: string[] = [
  '> AI MOOD GARDEN BIOS v1.0  (c) 2026 TRAE Labs',
  '',
  'Initializing Mood Driver............ [<ok>OK</ok>]',
  'Loading Garden Environment.......... [<ok>OK</ok>]',
  'Mounting ASCII Art Library.......... [<ok>OK</ok>]',
  'Calibrating Sentiment Sensors....... [<ok>OK</ok>]',
  'Connecting to Neural Network........ [<accent>...</accent>]',
  'Neural link established............. [<ok>OK</ok>]',
  'Growing virtual soil................ [<ok>OK</ok>]',
  '',
  'Welcome to <accent>AI Mood Garden</accent>.',
  'Plant your feelings. Watch them bloom.',
];

interface BootSequenceProps {
  onComplete: () => void;
}

/** 将带标记的文本渲染为带颜色的 spans */
function renderLine(line: string) {
  if (!line) return <>&nbsp;</>;
  const parts = line.split(/(<\/?(?:ok|accent)>)/);
  const nodes: React.ReactNode[] = [];
  let cls: string | null = null;
  parts.forEach((part, i) => {
    if (part === '<ok>') cls = 'ok';
    else if (part === '<accent>') cls = 'accent';
    else if (part === '</ok>' || part === '</accent>') cls = null;
    else if (part) {
      if (cls) nodes.push(<span key={i} className={cls}>{part}</span>);
      else nodes.push(<span key={i}>{part}</span>);
    }
  });
  return nodes;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [fading, setFading] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    let lineIdx = 0;
    const tick = () => {
      if (lineIdx < BOOT_LINES.length) {
        setVisibleLines((n) => n + 1);
        lineIdx += 1;
        // 不同行略微变速，营造真实感
        const next = lineIdx === 0 ? 200 : 220 + Math.random() * 180;
        timer = window.setTimeout(tick, next);
      } else {
        // 全部输出后停留片刻再淡出
        timer = window.setTimeout(() => setFading(true), 700);
      }
    };
    let timer = window.setTimeout(tick, 250);

    return () => window.clearTimeout(timer);
  }, []);

  // 淡出动画结束后回调
  useEffect(() => {
    if (!fading) return;
    const t = window.setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, 800);
    return () => window.clearTimeout(t);
  }, [fading, onComplete]);

  return (
    <div className={`boot ${fading ? 'boot-fade-out' : ''}`}>
      <div className="boot-box">
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="boot-line">
            {renderLine(line)}
          </div>
        ))}
        {visibleLines < BOOT_LINES.length && <span className="boot-cursor" />}
      </div>
    </div>
  );
}
