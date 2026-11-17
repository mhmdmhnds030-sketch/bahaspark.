import { HeaderTools } from './components/HeaderTools';

import { PomodoroTimer } from './components/PomodoroTimer';

import { FileUploader } from './components/FileUploader';





import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Sparkles,

  RotateCw,
  Trash2,
  FileText,
  HelpCircle,
  Loader2,
  Award,
} from 'lucide-react';
import type { StudyMaterial } from './types';
import { generateStudyMaterial } from './services/geminiService';
import './App.css';

export function App() {

  const [lectureText, setLectureText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [materials, setMaterials] = useState<Array<StudyMaterial>>(() => {
    const saved = localStorage.getItem('studypulse_materials');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(
    materials.length > 0 ? materials[0] : null
  );
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary');
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    localStorage.setItem('studypulse_materials', JSON.stringify(materials));
  }, [materials]);


  const handleGenerate = async (directText?: string) => {
    const textToAnalyze = typeof directText === 'string' ? directText : lectureText;
    if (!textToAnalyze.trim()) {
      setError('يرجى لصق نص المحاضرة أو رفع ملف أولاً.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await generateStudyMaterial(textToAnalyze);

      setMaterials((prev) => [result, ...prev]);
      setActiveMaterial(result);
      setActiveTab('summary');
      setFlippedCards({});
      setQuizAnswers({});
      setLectureText('');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. تأكد من صحة مفتاح الـ API.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = materials.filter((m) => m.id !== id);
    setMaterials(updated);
    if (activeMaterial?.id === id) {
      setActiveMaterial(updated.length > 0 ? updated[0] : null);
    }
  };

  const calculateQuizScore = () => {
    if (!activeMaterial) return 0;
    let score = 0;
    activeMaterial.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswerIndex) score++;
    });
    return score;
  };

  return (
    <div className="app-container" dir="rtl">



      <header className="navbar">
        <div className="brand">
          <Brain className="brand-icon" size={30} />
          <div>
            <h1>BahaaSpark</h1>
            <span>رفيقك الدراسي الذكي للامتحانات</span>
          </div>
        </div>

        <div className="navbar-actions">
          <PomodoroTimer />
          <HeaderTools />
        </div>


      </header>





      <main className="main-grid">
        <aside className="sidebar">
          <div className="input-card">
            <h2>
              <Sparkles size={20} /> محاضرة جديدة
            </h2>
            <FileUploader onFileLoaded={(text) => handleGenerate(text)} />

            <textarea
              rows={7}
              placeholder="الصق هنا نص المحاضرة، ملخص الدرس، أو أي فقرة علمية بالعربية أو الإنجليزية..."
              value={lectureText}
              onChange={(e) => setLectureText(e.target.value)}
            />
            {error && <div className="error-msg">{error}</div>}
            <button className="btn-primary full-width" onClick={() => handleGenerate()} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="spin" size={20} /> جاري التحليل وتوليد الأسئلة...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> تحويل إلى خطة دراسة ذكية
                </>
              )}
            </button>
          </div>

          <div className="history-card">
            <h3>محاضراتي المحفوظة ({materials.length})</h3>
            {materials.length === 0 ? (
              <p className="empty-text">لا توجد محاضرات محفوظة بعد. ابدأ بإضافة أول محاضرة!</p>
            ) : (
              <ul className="history-list">
                {materials.map((item) => (
                  <li
                    key={item.id}
                    className={activeMaterial?.id === item.id ? 'active' : ''}
                    onClick={() => {
                      setActiveMaterial(item);
                      setFlippedCards({});
                      setQuizAnswers({});
                    }}
                  >
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.createdAt}</small>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteMaterial(item.id, e)}
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className="content-area">
          {!activeMaterial ? (
            <div className="welcome-box">
              <BookOpen size={60} className="welcome-icon" />
              <h2>استعد لامتحاناتك بذكاء وسرعة</h2>
              <p>
                الصق محتوى أي محاضرة في القائمة الجانبية ليقوم الذكاء الاصطناعي فوراً بتلخيصها،
                وإنشاء بطاقات استذكار تفاعلية، واختبار قصير لقياس فهمك.
              </p>
            </div>
          ) : (
            <div className="study-workspace">
              <div className="workspace-header">
                <h2>{activeMaterial.title}</h2>
                <div className="tabs">
                  <button
                    className={activeTab === 'summary' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('summary')}
                  >
                    <FileText size={18} /> الملخص المركز
                  </button>
                  <button
                    className={activeTab === 'flashcards' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('flashcards')}
                  >
                    <RotateCw size={18} /> بطاقات الاستذكار ({activeMaterial.flashcards.length})
                  </button>
                  <button
                    className={activeTab === 'quiz' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('quiz')}
                  >
                    <HelpCircle size={18} /> اختبار الفهم ({activeMaterial.quiz.length})
                  </button>
                </div>
              </div>

              {activeTab === 'summary' && (
                <div className="summary-section">
                  <h3>أهم النقاط والمفاهيم الأساسية:</h3>
                  <ul className="summary-list">
                    {activeMaterial.summary.map((point, index) => (
                      <li key={index}>
                        <CheckCircle2 className="check-icon" size={20} />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'flashcards' && (
                <div className="flashcards-grid">
                  {activeMaterial.flashcards.map((card, idx) => {
                    const isFlipped = !!flippedCards[idx];
                    return (
                      <div
                        key={idx}
                        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                        onClick={() =>
                          setFlippedCards((prev) => ({ ...prev, [idx]: !prev[idx] }))
                        }
                      >
                        <div className="card-badge">{isFlipped ? 'الإجابة' : `سؤال #${idx + 1}`}</div>
                        <p>{isFlipped ? card.answer : card.question}</p>
                        <small>انقر لقلب البطاقة</small>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="quiz-section">
                  {Object.keys(quizAnswers).length === activeMaterial.quiz.length && (
                    <div className="score-banner">
                      <Award size={28} />
                      <span>
                        نتيجتك النهائية: <strong>{calculateQuizScore()}</strong> من{' '}
                        <strong>{activeMaterial.quiz.length}</strong>
                      </span>
                    </div>
                  )}

                  {activeMaterial.quiz.map((q, qIdx) => {
                    const selected = quizAnswers[qIdx];
                    const isAnswered = selected !== undefined;
                    return (
                      <div key={qIdx} className="quiz-card">
                        <h4>
                          {qIdx + 1}. {q.question}
                        </h4>
                        <div className="options-grid">
                          {q.options.map((opt, optIdx) => {
                            let btnClass = 'option-btn';
                            if (isAnswered) {
                              if (optIdx === q.correctAnswerIndex) btnClass += ' correct';
                              else if (optIdx === selected) btnClass += ' wrong';
                            }
                            return (
                              <button
                                key={optIdx}
                                className={btnClass}
                                disabled={isAnswered}
                                onClick={() =>
                                  setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
                                }
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {isAnswered && (
                          <div className="explanation-box">
                            <strong>التوضيح:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
