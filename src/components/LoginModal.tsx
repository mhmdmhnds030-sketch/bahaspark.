import React, { useState } from 'react';
import { UserCheck, LogIn, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/geminiService';

const e = React.createElement;

export function LoginModal({ lang, onClose, onLoginSuccess }: any) {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    async function handleSubmit(ev: any) {
        ev.preventDefault();
        const cleanName = username.trim();
        if (!cleanName) return;
        setLoading(true);
        setErr('');

        try {
            const loginTime = new Date().toLocaleString('en-GB');
            const docRef = await addDoc(collection(db, 'STUDENT'), {
                USERNAME: cleanName,
                LOGIN_TIME: loginTime,
                CREATED_AT: serverTimestamp(),
            });

            fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: cleanName }),
            }).catch(function () { });

            onLoginSuccess({
                ID: docRef.id,
                USERNAME: cleanName,
                LOGIN_TIME: loginTime,
            });
        } catch (error: any) {
            setErr(error.message || 'Cloud Save Failed');
        } finally {
            setLoading(false);
        }
    }

    return e('div', { className: 'login-overlay' },
        e('form', { className: 'login-card', onSubmit: handleSubmit },
            e('button', { type: 'button', className: 'close-modal-btn', onClick: onClose }, e(X, { size: 20 })),
            e('div', { className: 'login-icon' }, e(UserCheck, { size: 32 })),
            e('h2', null, lang === 'ar' ? 'تسجيل الدخول إلى BahaaSpark' : 'Sign in to BahaaSpark'),
            e('p', null, lang === 'ar' ? 'أدخل اسمك ليتم توثيق دخولك وتوقيته سحابياً 24/7' : 'Enter your name to log your session & timestamp in the cloud 24/7'),
            e('input', {
                type: 'text',
                className: 'url-input',
                placeholder: lang === 'ar' ? 'اكتب اسمك هنا...' : 'Enter your name...',
                value: username,
                onChange: function (ev: any) { setUsername(ev.target.value); },
                required: true,
            }),
            err && e('div', { className: 'error-msg' }, err),
            e('button', { type: 'submit', className: 'btn-primary full-width', disabled: loading },
                e(LogIn, { size: 18 }),
                e('span', null, loading ? (lang === 'ar' ? 'جاري التسجيل...' : 'Logging in...') : (lang === 'ar' ? 'تسجيل الدخول' : 'Login'))
            )
        )
    );
}
