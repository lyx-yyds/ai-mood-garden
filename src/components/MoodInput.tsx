import { useRef, useState } from 'react';
import { sound } from '../services/soundService';

interface MoodInputProps {
  /** 是否正在分析中（禁用输入） */
  busy: boolean;
  /** 提交文本时触发 */
  onSubmit: (text: string) => void;
}

const PROMPT = 'user@ai-garden:~$';

export default function MoodInput({ busy, onSubmit }: MoodInputProps) {
  const [value, setValue] = useState('');
  const [flash, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text || busy) return;

    // 提交时的视觉反馈（光标闪烁加亮）+ 下行三连音
    setFlash(true);
    window.setTimeout(() => setFlash(false), 120);
    sound.submit();

    onSubmit(text);
    setValue('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 仅在新增字符时播放打字音（删除/backspace 不响）
    if (e.target.value.length > value.length) {
      sound.type();
    }
    setValue(e.target.value);
  };

  return (
    <div className="panel">
      <div className="panel-title">// 03 — THE SEED :: 种下你的情绪</div>
      <form className="input-form" onSubmit={handleSubmit}>
        <label className="input-line" htmlFor="mood-input">
          <span className="input-prompt">{PROMPT}</span>
          <input
            id="mood-input"
            ref={inputRef}
            className="input-field"
            type="text"
            value={value}
            placeholder={busy ? '分析中...' : '今天感觉怎么样？(how do you feel today?)'}
            autoComplete="off"
            spellCheck={false}
            disabled={busy}
            onChange={handleChange}
            autoFocus
          />
          <span className="input-cursor" style={{ opacity: flash ? 0 : 1 }} />
        </label>

        <div className={`input-status ${busy ? '' : ''}`}>
          {busy
            ? '> 正在连接神经网络分析情绪...'
            : value
              ? '> 按 [ENTER] 种下这颗种子'
              : '> 等待输入情绪文本...'}
        </div>

        <div className="input-hint">
          提示: 试试 "我今天非常开心和兴奋！" 或 "I feel so calm and peaceful"
        </div>
      </form>
    </div>
  );
}
