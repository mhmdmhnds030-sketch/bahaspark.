import { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export function PomodoroTimer() {
    const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
    const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

    useEffect(() => {
        if (!isTimerRunning) return;
        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setIsTimerRunning(false);
                    const nextMode = timerMode === 'focus' ? 'break' : 'focus';
                    setTimerMode(nextMode);
                    return nextMode === 'focus' ? 25 * 60 : 5 * 60;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isTimerRunning, timerMode]);

    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');

    const toggleMode = () => {
        setIsTimerRunning(false);
        const nextMode = timerMode === 'focus' ? 'break' : 'focus';
        setTimerMode(nextMode);
        setSecondsLeft(nextMode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const resetTimer = () => {
        setIsTimerRunning(false);
        setSecondsLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60);
    };

    return (
        <div className={`pomodoro-box ${timerMode}`}>
            <button className="mode-pill" onClick={toggleMode} title="تبديل الوضع">
                <Timer size={16} />
                <span>{timerMode === 'focus' ? 'وقت التركيز' : 'استراحة'}</span>
            </button>
            <span className="timer-display">{mins}:{secs}</span>
            <div className="timer-controls">
                <button className="icon-btn" onClick={() => setIsTimerRunning(!isTimerRunning)}>
                    {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button className="icon-btn" onClick={resetTimer}>
                    <RotateCcw size={16} />
                </button>
            </div>
        </div>
    );
}
