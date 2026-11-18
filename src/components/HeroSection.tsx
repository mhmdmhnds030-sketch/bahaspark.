import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowDown, Brain, FileText, RotateCw, HelpCircle, CheckCircle2 } from 'lucide-react';

const e = React.createElement;

export function HeroSection({ t, onStart, onAbout }: any) {
  const phrases = t.heroTitle.includes('حوّل')
    ? [
      'مع منصة BahaaSpark.. حوّل محاضراتك وفيديوهاتك إلى خطة تفوق ذكية في ثوانٍ',
      'مع منصة BahaaSpark.. افهم أصعب المواد الدراسية بالذكاء الاصطناعي',
      'مع منصة BahaaSpark.. اختبر نفسك وتفوّق في امتحاناتك بكل ثقة',
    ]
    : [
      'With BahaaSpark.. Turn Lectures & Videos into a Smart Study Plan in Seconds',
      'With BahaaSpark.. Master Any Subject Faster with AI Flashcards & Quizzes',
      'With BahaaSpark.. Your Ultimate AI Companion for Exam Excellence',
    ];

  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(function () {
    setPhraseIdx(0);
    setCharIdx(0);
    setIsDeleting(false);
  }, [t.heroTitle]);

  useEffect(function () {
    const currentPhrase = phrases[phraseIdx];
    let speed = isDeleting ? 22 : 45;

    if (!isDeleting && charIdx === currentPhrase.length) {
      speed = 1800;
    } else if (isDeleting && charIdx === 0) {
      speed = 300;
    }

    const timer = setTimeout(function () {
      if (!isDeleting && charIdx < currentPhrase.length) {
        setCharIdx(function (c) { return c + 1; });
      } else if (!isDeleting && charIdx === currentPhrase.length) {
        setIsDeleting(true);
      } else if (isDeleting && charIdx > 0) {
        setCharIdx(function (c) { return c - 1; });
      } else {
        setIsDeleting(false);
        setPhraseIdx(function (p) { return (p + 1) % phrases.length; });
      }
    }, speed);

    return function () { clearTimeout(timer); };
  }, [charIdx, isDeleting, phraseIdx, t.heroTitle]);

  const displayedText = phrases[phraseIdx].slice(0, charIdx);

  return e('section', { id: 'home', className: 'hero-section hero-split' },
    e('div', { className: 'hero-content' },
      e('div', { className: 'hero-badge' }, e(Sparkles, { size: 16 }), e('span', null, t.heroBadge)),
      e('h2', { className: 'hero-title typewriter-heading' },
        displayedText,
        e('span', { className: 'typewriter-cursor' }, '|')
      ),
      e('p', { className: 'hero-desc' }, t.heroDesc),
      e('div', { className: 'hero-buttons' },
        e('button', { type: 'button', className: 'btn-primary hero-btn-main', onClick: onStart },
          e(Sparkles, { size: 20 }), e('span', null, t.heroCta), e(ArrowDown, { size: 18 })
        ),
        e('button', { type: 'button', className: 'btn-secondary hero-btn-alt', onClick: onAbout },
          e('span', null, t.heroSecondary)
        )
      )
    ),
    e('div', { className: 'hero-visual-card' },
      e('div', { className: 'visual-glow' }),
      e('div', { className: 'ai-showcase-box' },
        e('div', { className: 'showcase-top' },
          e('div', { className: 'ai-pulse-circle' }, e(Brain, { size: 34 })),
          e('div', null,
            e('strong', null, 'BahaaSpark AI Engine'),
            e('small', null, 'Gemini 3.5 Flash Lite • Active')
          )
        ),
        e('div', { className: 'showcase-steps' },
          e('div', { className: 'step-pill' }, e(FileText, { size: 18 }), e('span', null, t.tabSummary), e(CheckCircle2, { size: 16, className: 'ok-icon' })),
          e('div', { className: 'step-pill' }, e(RotateCw, { size: 18 }), e('span', null, t.tabFlashcards), e(CheckCircle2, { size: 16, className: 'ok-icon' })),
          e('div', { className: 'step-pill' }, e(HelpCircle, { size: 18 }), e('span', null, t.tabQuiz), e(CheckCircle2, { size: 16, className: 'ok-icon' }))
        )
      )
    )
  );
}
