import { GoogleGenAI, Type } from '@google/genai';
import type { StudyMaterial } from '../types';

export async function generateStudyMaterial(inputContent: string): Promise<StudyMaterial> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('مفتاح الـ API غير موجود! تأكد من إعدادات البيئة');
    }

    const ai = new GoogleGenAI({ apiKey });
    const cleanInput = inputContent.trim();

    // التحقق مما إذا كان الإدخال رابطاً مباشراً (يوتيوب أو صفحة ويب)
    const isUrl = /^https?:\/\/[^\s]+$/i.test(cleanInput);
    const isYouTube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(cleanInput);

    const baseInstructions = `
    حلل محتوى المحاضرة التالي واستخرج بصيغة JSON:
    1. عنوان مناسب ومختصر للمحاضرة (title).
    2. ملخص من 10 نقاط مركزة (summary).
    3. بطاقات استذكار من 12 بطاقة سؤال وجواب (flashcards).
    4. اختبار من 15 سؤال اختيار من متعدد مع رقم الإجابة الصحيحة 0-3 وتوضيح مختصر (quiz).
    اجعل لغة المخرجات مطابقة للغة المحتوى المدخل.
    `;

    // تجهيز المحتوى والأدوات حسب نوع الإدخال (رابط يوتيوب، رابط موقع، أو نص/ملف)
    let contentsPayload: any;
    let extraConfig: any = {};

    if (isYouTube) {
        contentsPayload = [
            {
                fileData: {
                    fileUri: cleanInput,
                },
            },
            {
                text: baseInstructions,
            },
        ];
    } else if (isUrl) {
        contentsPayload = `${baseInstructions}\n\nاقرأ محتوى المحاضرة مباشرة من هذا الرابط وحلله:\n${cleanInput}`;
        extraConfig = {
            tools: [{ urlContext: {} }],
        };
    } else {
        const trimmedText = cleanInput.slice(0, 20000);
        contentsPayload = `${baseInstructions}\n\nالنص:\n${trimmedText}`;
    }

    const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-3-flash-preview',
        'gemini-3.5-flash-lite'
    ];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
        try {
            const response = await ai.models.generateContent({
                model: modelName,
                contents: contentsPayload,
                config: {
                    ...extraConfig,
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

    throw new Error(`تعذر معالجة المحتوى حالياً: ${lastError?.message || ''}`);
}
