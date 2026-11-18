import { getFirestore } from 'firebase/firestore';

import { initializeApp } from 'firebase/app';
import { getAI, GoogleAIBackend } from 'firebase/ai';
import { GoogleGenAI, Type } from '@google/genai';
import type { StudyMaterial } from '../types';

const firebaseConfig = {
    apiKey: "AIzaSyCrhBW1B-WHIvKepo9hxnrKA17-nPRm80s",
    authDomain: "://firebaseapp.com",
    projectId: "bahaaspark-41376",
    storageBucket: "bahaaspark-41376.firebasestorage.app",
    messagingSenderId: "709171835146",
    appId: "1:709171835146:web:96b4462209be6842b9caf3",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const firebaseAI = getAI(app, { backend: new GoogleAIBackend() });

const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function generateStudyMaterial(
    inputContent: string,
    lang: 'ar' | 'en' = 'en'
): Promise<StudyMaterial> {
    const cleanInput = inputContent.trim().slice(0, 20000);
    const isYoutube = cleanInput.startsWith('http') && (cleanInput.includes('youtube.com') || cleanInput.includes('youtu.be'));
    const targetLang = lang === 'ar' ? 'العربية' : 'English';

    const baseInstructions =
        'استخرج النتيجة بصيغة JSON فقط:\n' +
        '1. عنوان مناسب وواضح يعكس عنوان المحاضرة الحقيقي (title).\n' +
        '2. ملخص من 10 نقاط مركزة وشاملة من محتوى المحاضرة الفعلي (summary).\n' +
        '3. 12 بطاقة سؤال وجواب للمراجعة السريعة من داخل المحاضرة (flashcards).\n' +
        '4. اختبار من 15 سؤال اختيار من متعدد مع رقم الإجابة الصحيحة 0-3 وتوضيح مختصر (quiz).\n\n' +
        'مهم جداً: اكتب جميع المخرجات باللغة ' + targetLang + '.';

    const contentsPayload = isYoutube
        ? [
            { fileData: { fileUri: cleanInput } },
            { text: 'شاهد وحلل هذه المحاضرة التعليمية بالكامل بدقة عالية.\n' + baseInstructions },
        ]
        : 'حلل محتوى المحاضرة التالي بدقة:\n' + cleanInput + '\n\n' + baseInstructions;

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: contentsPayload,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    summary: { type: Type.ARRAY, items: { type: Type.STRING } },
                    flashcards: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                answer: { type: Type.STRING },
                            },
                            required: ['question', 'answer'],
                        },
                    },
                    quiz: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                correctAnswerIndex: { type: Type.INTEGER },
                                explanation: { type: Type.STRING },
                            },
                            required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
                        },
                    },
                },
                required: ['title', 'summary', 'flashcards', 'quiz'],
            },
        },
    });

    const data = JSON.parse(response.text || '{}');

    return {
        id: Date.now().toString(),
        title: data.title || (lang === 'ar' ? 'محاضرة جديدة' : 'New Lecture'),
        createdAt: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US'),
        summary: data.summary || [],
        flashcards: data.flashcards || [],
        quiz: data.quiz || [],
    };
}
