
import { UserCheck } from 'lucide-react';
import { LoginModal } from './components/LoginModal';
import React, { useState, useEffect } from 'react';


import {
  BookOpen, Brain, CheckCircle2, Sparkles, RotateCw, Trash2,
  FileText, HelpCircle, Loader2, Award, Link as LinkIcon,
  Upload, Type as TypeIcon, Globe,
} from 'lucide-react';
import { HeaderTools } from './components/HeaderTools';
import { PomodoroTimer } from './components/PomodoroTimer';
import { FileUploader } from './components/FileUploader';
import { HeroSection } from './components/HeroSection';
import { AboutAndFooter } from './components/AboutAndFooter';
import { generateStudyMaterial } from './services/geminiService';
import { translations } from './siteData';
import './App.css';

const e = React.createElement;

export function App() {
  const [lang, setLang] = useState('en');
  const t = (translations as any)[lang];
  const [inputMode, setInputMode] = useState('file');
  const [lectureText, setLectureText] = useState('');
  const [lectureUrl, setLectureUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [materials, setMaterials] = useState(function () {
    const saved = localStorage.getItem('studypulse_materials');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeMaterial, setActiveMaterial] = useState(materials.length > 0 ? materials.at(0) : null);

  const [activeTab, setActiveTab] = useState('summary');
  const [flippedCards, setFlippedCards] = useState({} as any);
  const [quizAnswers, setQuizAnswers] = useState({} as any);

  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState(function () {
    const savedUser = localStorage.getItem('bahaaspark_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });



  useEffect(function () {
    localStorage.setItem('studypulse_materials', JSON.stringify(materials));
  }, [materials]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleGenerate(directText?: string) {
    let contentToAnalyze = '';
    if (typeof directText === 'string') {
      contentToAnalyze = directText;
    } else if (inputMode === 'link') {
      if (!lectureUrl.trim()) { setError(t.errEmpty); return; }
      if (!lectureUrl.trim().startsWith('http')) { setError(t.errInvalidUrl); return; }
      contentToAnalyze = lectureUrl.trim();
    } else {
      contentToAnalyze = lectureText;
    }

    if (!contentToAnalyze.trim()) { setError(t.errEmpty); return; }

    setLoading(true);
    setError('');
    try {
      const result = await generateStudyMaterial(contentToAnalyze, lang as any);
      setMaterials(function (prev: any) { return [result, ...prev]; });
      setActiveMaterial(result);
      setActiveTab('summary');
      setFlippedCards({});
      setQuizAnswers({});
      setLectureText('');
      setLectureUrl('');
    } catch (err: any) {
      setError(err.message || 'Error connecting to AI service.');
    } finally {
      setLoading(false);
    }
  }
  function handleDeleteMaterial(id: string, ev: any) {
    ev.stopPropagation();
    const updated = materials.filter(function (m: any) { return m.id !== id; });
    setMaterials(updated);
    if (activeMaterial && activeMaterial.id === id) {
      setActiveMaterial(updated.length > 0 ? updated.at(0) : null);
    }
  }


  function calculateQuizScore() {
    if (!activeMaterial) return 0;
    let score = 0;
    activeMaterial.quiz.forEach(function (q: any, idx: number) {
      if (quizAnswers[idx] === q.correctAnswerIndex) score++;
    });
    return score;
  }

  return e('div', { className: 'app-container', dir: lang === 'ar' ? 'rtl' : 'ltr' },
    e('header', { className: 'navbar pro-navbar' },
      e('div', { className: 'brand', onClick: function () { scrollToSection('home'); }, style: { cursor: 'pointer' } },
        e(Brain, { className: 'brand-icon', size: 30 }),
        e('div', null, e('h1', null, 'BahaaSpark'), e('span', null, t.brandSub))
      ),
      e('nav', { className: 'nav-links' },
        e('button', { type: 'button', onClick: function () { scrollToSection('home'); } }, t.navHome),
        e('button', { type: 'button', onClick: function () { scrollToSection('workspace'); } }, t.navWorkspace),
        e('button', { type: 'button', onClick: function () { scrollToSection('about'); } }, t.navAbout),
        e('button', { type: 'button', onClick: function () { scrollToSection('footer'); } }, t.navContact)
      ),
      e('div', { className: 'navbar-actions' },
        e('button', {
          type: 'button',
          className: 'lang-toggle-btn',
          onClick: function () { setLang(function (prev) { return prev === 'ar' ? 'en' : 'ar'; }); },
        }, e(Globe, { size: 17 }), e('span', null, lang === 'ar' ? 'EN' : 'عربي')),
        e('button', {
          type: 'button',
          className: 'lang-toggle-btn',
          onClick: function () { setShowLogin(true); }
        }, e(UserCheck, { size: 17 }), e('span', null, currentUser ? currentUser.USERNAME : (lang === 'ar' ? 'تسجيل الدخول' : 'Login'))),

        e(PomodoroTimer),
        e(HeaderTools)
      )
    ),
    e(HeroSection, { t: t, onStart: function () { scrollToSection('workspace'); }, onAbout: function () { scrollToSection('about'); } }),
    e('main', { id: 'workspace', className: 'main-grid' },
      e('aside', { className: 'sidebar' },
        e('div', { className: 'input-card' },
          e('h2', null, e(Sparkles, { size: 20 }), ' ', t.newLecture),
          e('div', { className: 'input-mode-tabs' },
            e('button', { type: 'button', className: inputMode === 'file' ? 'mode-tab active' : 'mode-tab', onClick: function () { setInputMode('file'); setError(''); } }, e(Upload, { size: 15 }), ' ', t.tabFile),
            e('button', { type: 'button', className: inputMode === 'link' ? 'mode-tab active' : 'mode-tab', onClick: function () { setInputMode('link'); setError(''); } }, e(LinkIcon, { size: 15 }), ' ', t.tabLink),
            e('button', { type: 'button', className: inputMode === 'text' ? 'mode-tab active' : 'mode-tab', onClick: function () { setInputMode('text'); setError(''); } }, e(TypeIcon, { size: 15 }), ' ', t.tabText)
          ),
          inputMode === 'file' && e('div', { className: 'mode-panel' }, e(FileUploader, { onFileLoaded: function (txt: string) { handleGenerate(txt); } })),
          inputMode === 'link' && e('div', { className: 'mode-panel' },
            e('input', { type: 'url', className: 'url-input', dir: 'ltr', placeholder: t.linkPlaceholder, value: lectureUrl, onChange: function (ev: any) { setLectureUrl(ev.target.value); } })
          ),
          inputMode === 'text' && e('div', { className: 'mode-panel' },
            e('textarea', { rows: 6, placeholder: t.textPlaceholder, value: lectureText, onChange: function (ev: any) { setLectureText(ev.target.value); } })
          ),
          error && e('div', { className: 'error-msg' }, error),
          inputMode !== 'file' && e('button', { className: 'btn-primary full-width', onClick: function () { handleGenerate(); }, disabled: loading },
            loading ? e(React.Fragment, null, e(Loader2, { className: 'spin', size: 20 }), ' ', t.generatingBtn)
              : e(React.Fragment, null, e(Sparkles, { size: 20 }), ' ', t.generateBtn)
          )
        ),
        e('div', { className: 'history-card' },
          e('h3', null, t.savedLectures + ' (' + materials.length + ')'),
          materials.length === 0
            ? e('p', { className: 'empty-text' }, t.noLectures)
            : e('ul', { className: 'history-list' },
              materials.map(function (item: any) {
                return e('li', {
                  key: item.id,
                  className: activeMaterial && activeMaterial.id === item.id ? 'active' : '',
                  onClick: function () { setActiveMaterial(item); setFlippedCards({}); setQuizAnswers({}); }
                },
                  e('div', null, e('strong', null, item.title), e('small', null, item.createdAt)),
                  e('button', { className: 'delete-btn', onClick: function (ev: any) { handleDeleteMaterial(item.id, ev); } }, e(Trash2, { size: 16 }))
                );
              })
            )
        )
      ),
      e('section', { className: 'content-area' },
        !activeMaterial
          ? e('div', { className: 'welcome-box' }, e(BookOpen, { size: 60, className: 'welcome-icon' }), e('h2', null, t.welcomeTitle), e('p', null, t.welcomeDesc))
          : e('div', { className: 'study-workspace' },
            e('div', { className: 'workspace-header' },
              e('h2', null, activeMaterial.title),
              e('div', { className: 'tabs' },
                e('button', { className: activeTab === 'summary' ? 'tab active' : 'tab', onClick: function () { setActiveTab('summary'); } }, e(FileText, { size: 18 }), ' ', t.tabSummary),
                e('button', { className: activeTab === 'flashcards' ? 'tab active' : 'tab', onClick: function () { setActiveTab('flashcards'); } }, e(RotateCw, { size: 18 }), ' ' + t.tabFlashcards + ' (' + activeMaterial.flashcards.length + ')'),
                e('button', { className: activeTab === 'quiz' ? 'tab active' : 'tab', onClick: function () { setActiveTab('quiz'); } }, e(HelpCircle, { size: 18 }), ' ' + t.tabQuiz + ' (' + activeMaterial.quiz.length + ')')
              )
            ),
            activeTab === 'summary' && e('div', { className: 'summary-section' },
              e('h3', null, t.summaryHeading),
              e('ul', { className: 'summary-list' },
                activeMaterial.summary.map(function (pt: string, idx: number) { return e('li', { key: idx }, e(CheckCircle2, { className: 'check-icon', size: 20 }), e('span', null, pt)); })
              )
            ),
            activeTab === 'flashcards' && e('div', { className: 'flashcards-grid' },
              activeMaterial.flashcards.map(function (card: any, idx: number) {
                const isFlipped = !!flippedCards[idx];
                return e('div', {
                  key: idx,
                  className: isFlipped ? 'flashcard flipped' : 'flashcard',
                  onClick: function () { setFlippedCards(function (prev: any) { return { ...prev, [idx]: !prev[idx] }; }); }
                },
                  e('div', { className: 'card-badge' }, isFlipped ? t.answerBadge : t.questionBadge + ' #' + (idx + 1)),
                  e('p', null, isFlipped ? card.answer : card.question),
                  e('small', null, t.flipHint)
                );
              })
            ),
            activeTab === 'quiz' && e('div', { className: 'quiz-section' },
              Object.keys(quizAnswers).length === activeMaterial.quiz.length &&
              e('div', { className: 'score-banner' },
                e(Award, { size: 28 }),
                e('span', null, t.finalScore, ' ', e('strong', null, calculateQuizScore()), ' ', t.of, ' ', e('strong', null, activeMaterial.quiz.length))
              ),
              activeMaterial.quiz.map(function (q: any, qIdx: number) {
                const selected = quizAnswers[qIdx];
                const isAnswered = selected !== undefined;
                return e('div', { key: qIdx, className: 'quiz-card' },
                  e('h4', null, (qIdx + 1) + '. ' + q.question),
                  e('div', { className: 'options-grid' },
                    q.options.map(function (opt: string, optIdx: number) {
                      let btnClass = 'option-btn';
                      if (isAnswered) {
                        if (optIdx === q.correctAnswerIndex) btnClass += ' correct';
                        else if (optIdx === selected) btnClass += ' wrong';
                      }
                      return e('button', {
                        key: optIdx,
                        className: btnClass,
                        disabled: isAnswered,
                        onClick: function () { setQuizAnswers(function (prev: any) { return { ...prev, [qIdx]: optIdx }; }); }
                      }, opt);
                    })
                  ),
                  isAnswered && e('div', { className: 'explanation-box' }, e('strong', null, t.explanation), ' ', q.explanation)
                );
              })
            )
          )
      )
    ),
    e(AboutAndFooter, { t: t, onNavigate: scrollToSection }),
    showLogin && e(LoginModal, {
      lang: lang,
      onClose: function () { setShowLogin(false); },
      onLoginSuccess: function (record: any) {
        setCurrentUser(record);
        localStorage.setItem('bahaaspark_user', JSON.stringify(record));
        setShowLogin(false);
      }
    })

  );
}


export default App;
