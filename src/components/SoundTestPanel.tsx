import { useRef, useState } from 'react';
import { sound } from '../services/soundService';
import type { BeepRecord } from '../services/soundService';

// 测试用长文本（含中英文情绪关键词，会触发多种情绪分支）
const TEST_TEXT =
  '我今天非常开心和兴奋！I feel so happy and joyful today. 阳光让我 smile，这是一段较长的情绪文本用于测试打字音效。';

type Status = 'pending' | 'running' | 'pass' | 'fail';

interface StepResult {
  name: string;
  status: Status;
  expected: string;
  actual: string;
  detail?: string;
  records?: BeepRecord[];
}

/** sleep helper */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function SoundTestPanel() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<StepResult[]>([]);
  const [liveInput, setLiveInput] = useState('');
  const [progress, setProgress] = useState('');
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const runTest = async () => {
    if (running) return;
    setRunning(true);
    setResults([]);
    setLiveInput('');
    clearTimers();
    sound.unlock(); // 用户点击触发，解锁 AudioContext

    const steps: StepResult[] = [];
    const update = (s: StepResult) => {
      steps.push(s);
      setResults([...steps]);
    };

    // ===== Step 1: boot 启动音效 =====
    setProgress('[1/4] 播放 boot 启动音效...');
    sound.resetLog();
    sound.boot();
    await sleep(900); // 等待 boot 全部 beep 排程完成（最后一个 when=0.54s）

    const bootCount = sound.getCountBySource('boot');
    const bootExpected = 6; // 2 个电源音 + 4 个上行琶音
    update({
      name: 'boot 启动音',
      status: bootCount === bootExpected ? 'pass' : 'fail',
      expected: `${bootExpected} 次 beep（2 电源音 + 4 上行琶音）`,
      actual: `${bootCount} 次 beep`,
      detail:
        bootCount === bootExpected
          ? '✓ 低频锯齿+方波琶音完整触发'
          : `✗ 期望 ${bootExpected}，实际 ${bootCount}`,
      records: sound.getCallLog().filter((r) => r.source === 'boot'),
    });

    // ===== Step 2: 模拟逐字输入长文本，触发 type 音效 =====
    setProgress(`[2/4] 模拟逐字输入长文本（${TEST_TEXT.length} 字符）...`);
    sound.resetLog();
    setLiveInput('');
    const chars = Array.from(TEST_TEXT);

    for (let i = 0; i < chars.length; i++) {
      const idx = i;
      const t = window.setTimeout(() => {
        setLiveInput(TEST_TEXT.slice(0, idx + 1));
        sound.type();
      }, idx * 60);
      timersRef.current.push(t);
    }
    // 等待所有字符输入完成
    await sleep(chars.length * 60 + 150);
    clearTimers();

    const typeCount = sound.getCountBySource('type');
    const typeExpected = chars.length;
    // 验证：每个字符触发 1 次 type，频率都在 1100-1400Hz 范围
    const typeRecords = sound.getCallLog().filter((r) => r.source === 'type');
    const allFreqInRange = typeRecords.every(
      (r) => r.freq >= 1100 && r.freq <= 1400,
    );
    const allSquare = typeRecords.every((r) => r.type === 'square');
    const typePass =
      typeCount === typeExpected && allFreqInRange && allSquare;
    update({
      name: 'type 打字音（逐字输入）',
      status: typePass ? 'pass' : 'fail',
      expected: `${typeExpected} 次 beep（每字符 1 次，方波，1100-1400Hz）`,
      actual: `${typeCount} 次 beep${allFreqInRange ? '' : '（频率越界）'}${allSquare ? '' : '（波形不符）'}`,
      detail: typePass
        ? `✓ 输入 "${TEST_TEXT.slice(0, 18)}..." 完整播放 ${typeCount} 个打字音`
        : `✗ 期望 ${typeExpected}，实际 ${typeCount}`,
      records: typeRecords.slice(0, 5), // 仅展示前 5 条样本
    });

    // ===== Step 3: 提交音效 submit（下行三连音）=====
    setProgress('[3/4] 播放 submit 提交音效...');
    sound.resetLog();
    sound.submit();
    await sleep(300);

    const submitCount = sound.getCountBySource('submit');
    const submitRecords = sound
      .getCallLog()
      .filter((r) => r.source === 'submit');
    // 验证下行三连音：880 → 660 → 440
    const isDescending =
      submitRecords.length === 3 &&
      submitRecords[0].freq > submitRecords[1].freq &&
      submitRecords[1].freq > submitRecords[2].freq;
    const submitPass = submitCount === 3 && isDescending;
    update({
      name: 'submit 提交音',
      status: submitPass ? 'pass' : 'fail',
      expected: '3 次 beep（下行三连音 880→660→440Hz）',
      actual: `${submitCount} 次 beep${
        isDescending ? '（频率递减）' : '（频率非递减）'
      }`,
      detail: submitPass
        ? `✓ 频率序列: ${submitRecords.map((r) => r.freq).join(' → ')}Hz`
        : `✗ 期望 3 次下行，实际 ${submitCount} 次`,
      records: submitRecords,
    });

    // ===== Step 4: 绽放音效 bloom（上行音阶+收尾）=====
    setProgress('[4/4] 模拟分析完成，播放 bloom 绽放音效...');
    sound.resetLog();
    sound.bloom();
    await sleep(700);

    const bloomCount = sound.getCountBySource('bloom');
    const bloomRecords = sound
      .getCallLog()
      .filter((r) => r.source === 'bloom');
    // 验证：前 4 个方波上行 (C-E-G-C)，最后 1 个 triangle 收尾
    const firstFourAscending =
      bloomRecords.length >= 4 &&
      bloomRecords[0].freq < bloomRecords[1].freq &&
      bloomRecords[1].freq < bloomRecords[2].freq &&
      bloomRecords[2].freq < bloomRecords[3].freq;
    const lastIsTriangle =
      bloomRecords.length > 0 &&
      bloomRecords[bloomRecords.length - 1].type === 'triangle';
    const bloomExpected = 5;
    const bloomPass =
      bloomCount === bloomExpected && firstFourAscending && lastIsTriangle;
    update({
      name: 'bloom 绽放音',
      status: bloomPass ? 'pass' : 'fail',
      expected: '5 次 beep（4 方波上行 C-E-G-C + 1 三角波收尾）',
      actual: `${bloomCount} 次 beep${
        firstFourAscending ? '（前4音上行）' : '（前4音非上行）'
      }${lastIsTriangle ? '（收尾三角波）' : '（无三角波收尾）'}`,
      detail: bloomPass
        ? `✓ 音阶: ${bloomRecords
            .slice(0, 4)
            .map((r) => r.freq)
            .join(' → ')}Hz，收尾 ${bloomRecords[4].freq}Hz`
        : `✗ 期望 ${bloomExpected} 次上行+收尾，实际 ${bloomCount} 次`,
      records: bloomRecords,
    });

    setProgress('测试完成。');
    setRunning(false);
  };

  const passCount = results.filter((r) => r.status === 'pass').length;
  const allPass = results.length === 4 && passCount === 4;

  return (
    <div className="panel">
      <div className="panel-title">// TEST — 8-BIT SOUND SELF-CHECK :: 音效自检</div>

      <div className="test-controls">
        <button
          className="test-run-btn"
          onClick={runTest}
          disabled={running}
        >
          {running ? '[ RUNNING... ]' : '[ RUN SOUND TEST ]'}
        </button>
        <span className="test-progress">
          {progress || '> 点击按钮运行 4 步音效自检（boot → type → submit → bloom）'}
        </span>
      </div>

      {/* 实时模拟输入框 */}
      {liveInput && (
        <div className="test-live">
          <span className="input-prompt">user@ai-garden:~$</span>
          <span className="test-live-text">{liveInput}</span>
          <span className="input-cursor" />
        </div>
      )}

      {/* 总览 */}
      {results.length > 0 && (
        <div className={`test-summary ${allPass ? 'pass' : 'fail'}`}>
          {allPass
            ? `✓ ALL PASS — 4/4 音效按预期播放`
            : `✗ ${passCount}/${results.length} 通过 — 查看下方详情`}
        </div>
      )}

      {/* 每步详情 */}
      <div className="test-results">
        {results.map((r, i) => (
          <div key={i} className={`test-step test-step-${r.status}`}>
            <div className="test-step-head">
              <span className="test-step-icon">
                {r.status === 'pass' ? '[PASS]' : r.status === 'fail' ? '[FAIL]' : '[....]'}
              </span>
              <span className="test-step-name">
                {i + 1}. {r.name}
              </span>
            </div>
            <div className="test-step-body">
              <div>
                <span className="test-label">EXPECT:</span> {r.expected}
              </div>
              <div>
                <span className="test-label">ACTUAL:</span> {r.actual}
              </div>
              <div className="test-detail">{r.detail}</div>
              {r.records && r.records.length > 0 && (
                <pre className="test-records">
{r.records
  .map(
    (rec) =>
      `  #${String(rec.seq).padStart(3, '0')} ${rec.source.padEnd(6)} ${rec.type.padEnd(8)} ${String(rec.freq).padStart(7)}Hz  dur=${rec.duration}s  when=${rec.when}s  vol=${rec.vol}`,
  )
  .join('\n')}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
