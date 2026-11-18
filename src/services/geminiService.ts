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
export const firebaseAI = getAI(app, { backend: new GoogleAIBackend() });

const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,

    httpOptions: { apiVersion: 'v1beta' },
});

export async function generateStudyMaterial(inputContent: string): Promise<StudyMaterial> {
    const cleanInput = inputContent.trim().slice(0, 20000);
    const prompt = `حلل محتوى المحاضرة التالي واستخرج بصيغة JSON: 1. عنوان مناسب (title). 2. ملخص من 10 نقاط مركزة (summary). 3. 12 بطاقة سؤال وجواب (flashcards). 4. اختبار من 15 سؤال اختيار من متعدد مع رقم الإجابة الصحيحة 0-3 وتوضيح مختصر (quiz). اجعل لغة المخرجات مطابقة للغة المحتوى المدخل.\n\nالمحتوى:\n${cleanInput}`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',


        contents: prompt,
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
        title: data.title || 'محاضرة جديدة',
        createdAt: new Date().toLocaleDateString('ar-EG'),
        summary: data.summary || [],
        flashcards: data.flashcards || [],
        quiz: data.quiz || [],
    };
}
