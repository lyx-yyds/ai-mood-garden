// AI Mood Garden — 8-bit Sound Service
// 使用 Web Audio API 合成复古方波音效，无需外部音频文件

/** 单次 beep 调用记录（用于测试验证） */
export interface BeepRecord {
  /** 调用来源方法名 */
  source: 'boot' | 'type' | 'submit' | 'bloom' | 'unknown';
  freq: number;
  duration: number;
  type: OscillatorType;
  when: number;
  vol: number;
  /** 调用时的单调递增序号 */
  seq: number;
}

class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;

  // ===== 测试钩子：记录所有 beep 调用 =====
  private callLog: BeepRecord[] = [];
  private seqCounter = 0;
  private currentSource: BeepRecord['source'] = 'unknown';

  /** 浏览器策略：AudioContext 必须在用户首次交互后才能创建/恢复 */
  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      try {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        this.ctx = new Ctor();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.18; // 主音量
        this.masterGain.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** 用户首次交互时调用，解锁音频上下文 */
  unlock(): void {
    this.ensureCtx();
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  toggleMuted(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * 播放一个 8-bit 音符
   * @param freq 频率 (Hz)
   * @param duration 持续时间 (秒)
   * @param type 波形类型，默认方波
   * @param when 延迟多少秒后播放
   * @param vol 音量 0..1
   */
  private beep(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    when = 0,
    vol = 1,
  ): void {
    // 记录调用（无论是否静音，便于测试验证调用次数）
    this.callLog.push({
      source: this.currentSource,
      freq,
      duration,
      type,
      when,
      vol,
      seq: this.seqCounter++,
    });

    if (this.muted) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);

    // 简单 ADSR：快速起音 + 指数衰减，模拟 8-bit 风格
    const peak = vol * 0.6;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  /** 打字声：极短的高频方波 tick */
  type(): void {
    this.currentSource = 'type';
    // 频率轻微抖动让连打不显单调
    const freq = 1100 + Math.random() * 300;
    this.beep(freq, 0.04, 'square', 0, 0.5);
    this.currentSource = 'unknown';
  }

  /** 提交声：下行三连音 */
  submit(): void {
    this.currentSource = 'submit';
    this.beep(880, 0.06, 'square', 0, 0.6);
    this.beep(660, 0.06, 'square', 0.07, 0.6);
    this.beep(440, 0.08, 'square', 0.14, 0.6);
    this.currentSource = 'unknown';
  }

  /** 生长/绽放声：上行音阶（C-E-G-C），喜悦正向 */
  bloom(): void {
    this.currentSource = 'bloom';
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this.beep(f, 0.12, 'square', i * 0.09, 0.7);
    });
    // 收尾的亮音
    this.beep(1318.51, 0.18, 'triangle', notes.length * 0.09, 0.5);
    this.currentSource = 'unknown';
  }

  /** 启动音效：低频电源开启 + 上行琶音 */
  boot(): void {
    this.currentSource = 'boot';
    this.beep(110, 0.18, 'sawtooth', 0, 0.4);
    this.beep(220, 0.18, 'square', 0.12, 0.4);
    const notes = [392, 523.25, 659.25, 783.99];
    notes.forEach((f, i) => {
      this.beep(f, 0.1, 'square', 0.3 + i * 0.08, 0.5);
    });
    this.currentSource = 'unknown';
  }

  // ===== 测试 API =====

  /** 获取所有 beep 调用记录（测试用） */
  getCallLog(): BeepRecord[] {
    return [...this.callLog];
  }

  /** 获取指定来源的 beep 调用次数 */
  getCountBySource(source: BeepRecord['source']): number {
    return this.callLog.filter((r) => r.source === source).length;
  }

  /** 获取总 beep 调用次数 */
  getTotalCount(): number {
    return this.callLog.length;
  }

  /** 重置调用日志（测试用） */
  resetLog(): void {
    this.callLog = [];
    this.seqCounter = 0;
  }

  /** 检查 AudioContext 是否已创建且处于运行状态 */
  isContextRunning(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }
}

export const sound = new SoundService();
