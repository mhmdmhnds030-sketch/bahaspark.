import { GoogleGenAI, Type } from '@google/genai';
import type { StudyMaterial } from '../types';

export async function generateStudyMaterial(lectureText: string): Promise<StudyMaterial> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('مفتاح الـ API غير موجود! تأكد من ملف .env.local');
    }

    const ai = new GoogleGenAI({ apiKey });
    const trimmedText = lectureText.slice(0, 20000);

    const prompt = `
    حلل نص المحاضرة التالي واستخرج بصيغة JSON:
    1. عنوان مناسب ومختصر للمحاضرة (title).
    2. ملخص من 10 نقاط مركزة (summary).
    3. بطاقات استذكار من 12 بطاقة سؤال وجواب (flashcards).
    4. اختبار من 15 سؤال اختيار من متعدد مع رقم الإجابة الصحيحة 0-3 وتوضيح مختصر (quiz).
    اجعل لغة المخرجات مطابقة للغة النص المدخل.

    النص:
    ${trimmedText}
  `;

    const modelsToTry = [
        'gemini-3.5-flash-lite',
        'gemini-3-flash-preview',
        'gemini-2.5-flash'
    ];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
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
        } catch (err: any) {
            lastError = err;
        }
    }

    throw new Error(`جميع الخوادم مزدحمة حالياً: ${lastError?.message || ''}`);
}
