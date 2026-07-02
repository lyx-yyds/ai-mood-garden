// AI Mood Garden — Mood Analysis Service
// 提供情绪分析（mock 关键词检测）与 ASCII 艺术映射

import type { Mood, MoodResult, Energy } from '../types';

/* ===========================================================
   ASCII Art Library — 每种情绪对应一株植物/景象
   =========================================================== */

const ART: Record<Mood, string> = {
  Joy: [
    '        \\ | /        ',
    '       -- @ --       ',
    '        / | \\        ',
    '         \\|/         ',
    '     \\  .-"""-.  /   ',
    '      "-|  @  |-"     ',
    '        | @@@ |       ',
    '         \\___/        ',
    '           |          ',
    '           |          ',
    '         _/|\\_        ',
    '       //     \\\\      ',
  ].join('\n'),

  Sadness: [
    '       .-""""-.       ',
    '      /   _    \\      ',
    '     |  ( )   |       ',
    '      \\      /        ',
    '       \\____/         ',
    '    .-"`    `"`-.     ',
    '   /            \\     ',
    '  |   ;    ;     |    ',
    '   \\ ;  ;  ; ;  /     ',
    '    `"; ; ; ;"`       ',
    '       || ||          ',
    '      //  \\\\          ',
  ].join('\n'),

  Anger: [
    '          \\  |  /     ',
    '       \\   \\ | /   /  ',
    '        \\   \\|/   /   ',
    '      .-"`-._|_.-`"-.  ',
    '     /   @  @  @   \\  ',
    '    |   !  @  !  @  |  ',
    '     \\  !  !  !  ! /  ',
    '      `"""""""""""`   ',
    '           ||         ',
    '           ||         ',
    '          /||\\        ',
    '         //  \\\\       ',
  ].join('\n'),

  Calm: [
    '         .--.         ',
    '        /    \\        ',
    '       |  ()  |       ',
    '        \\    /        ',
    '     .--"`    `"--.   ',
    '    /              \\  ',
    '   |    ~~~~~~~~    |  ',
    '   |  ~~~~~~~~~~~~  |  ',
    '   | ~~~~~~~~~~~~~~ |  ',
    '    \\______________/  ',
    '    ~~~~~~~~~~~~~~~~  ',
    '  ~~~~~~~~~~~~~~~~~~~  ',
  ].join('\n'),

  Love: [
    '      .::::::::::.    ',
    '    .::::\\\\  //::::.  ',
    '   ::::::\\\\||//:::::  ',
    '   :::::::|||:::::::  ',
    '   :::::://||\\\\::::::  ',
    '    \\\\::// || \\\\:://   ',
    '     \\\\//  ||  \\\\//    ',
    '           ||         ',
    '        \\  ||  /      ',
    '         \\\\||//        ',
    '          \\||/         ',
    '           |          ',
  ].join('\n'),
};

const MOOD_COLOR: Record<Mood, string> = {
  Joy: '#ffe600',
  Sadness: '#5fa8ff',
  Anger: '#ff4444',
  Calm: '#9dffd9',
  Love: '#ff5fb0',
};

const NEGATIVE_MOODS: Mood[] = ['Sadness', 'Anger'];

/* ===========================================================
   Keyword dictionary (bilingual: EN + ZH)
   =========================================================== */

const KEYWORDS: Record<Mood, string[]> = {
  Joy: [
    'happy', 'joy', 'glad', 'excited', 'great', 'awesome', 'wonderful',
    'sunshine', 'smile', 'laugh', 'bright', 'cheerful', 'delighted',
    'energetic', 'fantastic', 'good', 'fun',
    '开心', '快乐', '高兴', '兴奋', '愉快', '棒', '阳光', '笑',
  ],
  Sadness: [
    'sad', 'down', 'blue', 'unhappy', 'depressed', 'cry', 'tears',
    'lonely', 'gloomy', 'melancholy', 'hurt', 'sorrow', 'rain',
    '难过', '伤心', '悲伤', '哭', '孤独', '失落', '郁闷', '泪',
  ],
  Anger: [
    'angry', 'mad', 'furious', 'rage', 'hate', 'annoyed', 'irritated',
    'frustrated', 'pissed', 'upset', 'fire',
    '生气', '愤怒', '讨厌', '烦躁', '气', '怒', '火',
  ],
  Calm: [
    'calm', 'peaceful', 'relaxed', 'serene', 'quiet', 'tranquil',
    'still', 'rest', 'breeze', 'meditate', 'gentle', 'soft',
    '平静', '安静', '放松', '宁静', '祥和', '悠闲', '淡',
  ],
  Love: [
    'love', 'adore', 'cherish', 'affection', 'romantic', 'heart',
    'beloved', 'caring', 'tender', 'warm', 'sweet', 'fond',
    '爱', '喜欢', '心动', '温暖', '甜蜜', '深情', '恋',
  ],
};

/* ===========================================================
   analyzeMood — 分析情绪文本
   若无可识别关键词则返回 Calm 作为默认中性情绪
   =========================================================== */

function countMatches(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  return words.reduce(
    (acc, w) => acc + (lower.includes(w.toLowerCase()) ? 1 : 0),
    0,
  );
}

export function analyzeMood(text: string): Promise<MoodResult> {
  return new Promise((resolve) => {
    // 模拟 AI 网络延迟
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const scores: Record<Mood, number> = {
        Joy: 0,
        Sadness: 0,
        Anger: 0,
        Calm: 0,
        Love: 0,
      };

      (Object.keys(KEYWORDS) as Mood[]).forEach((mood) => {
        scores[mood] = countMatches(text, KEYWORDS[mood]);
      });

      // 找出得分最高的情绪
      let best: Mood = 'Calm';
      let bestScore = 0;
      (Object.keys(scores) as Mood[]).forEach((mood) => {
        if (scores[mood] > bestScore) {
          bestScore = scores[mood];
          best = mood;
        }
      });

      // 无匹配时默认 Calm
      if (bestScore === 0) {
        best = 'Calm';
        bestScore = 1;
      }

      // 强度归一化 0.3..1
      const intensity = Math.min(1, 0.3 + bestScore * 0.25);
      const HIGH_ENERGY = new Set<Mood>(['Joy', 'Anger', 'Love']);
      const energy: Energy = HIGH_ENERGY.has(best) ? 'High' : 'Low';

      resolve({
        mood: best,
        energy,
        intensity,
        art: ART[best],
        color: MOOD_COLOR[best],
        glitch: NEGATIVE_MOODS.includes(best),
      });
    }, delay);
  });
}

export function getMoodColor(mood: Mood): string {
  return MOOD_COLOR[mood];
}

export const ALL_MOODS: Mood[] = ['Joy', 'Sadness', 'Anger', 'Calm', 'Love'];
