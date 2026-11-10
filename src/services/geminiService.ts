import { GoogleGenAI, Type } from '@google/genai';
import type { StudyMaterial } from '../types';

const FAST_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3.5-flash-lite'];
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function generateStudyMaterial(
    lectureText: string,
    customApiKey?: string
): Promise<StudyMaterial> {
    const apiKey = customApiKey || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('يرجى إدخال مفتاح Gemini API أولاً لتشغيل التحليل الذكي.');
    }

    const ai = new GoogleGenAI({ apiKey });
    const trimmedText = lectureText.slice(0, 60000);

    const prompt = `
    أنت أستاذ جامعي خبير. حلل نص المحاضرة أو الكتاب التالي بعمق وشمولية دون تكرار، واستخرج:
    1. عنوان مناسب ومختصر للمادة.
    2. ملخص شامل ومنظم يتكون من 15 نقطة تغطي كافة أفكار وتفاصيل المحتوى.
    3. بطاقات استذكار تفاعلية تتكون من 25 بطاقة (سؤال وجواب مباشر).
    4. اختبار تقييمي شامل يتكون من 30 سؤال اختيار من متعدد (4 خيارات لكل سؤال، مع تحديد رقم الإجابة الصحيحة 0-3 وتوضيح مفيد من جملة واحدة).
    
    ملاحظة مهمة: التزم بالأعداد المطلوبة بدقة (15 نقطة، 25 بطاقة، 30 سؤالاً)، واجعل لغة المخرجات مطابقة للغة النص المدخل، وتجنب تكرار نفس الفكرة.

    النص:
    ${trimmedText}
  `;


    for (const modelName of FAST_MODELS) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                    config: {
                        maxOutputTokens: 8192,
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

                if (!response.text) throw new Error('لم يتم استلام استجابة.');
                const parsed = JSON.parse(response.text);

                return {
                    id: crypto.randomUUID(),
                    title: parsed.title,
                    createdAt: new Date().toLocaleDateString('ar-EG'),
                    summary: parsed.summary,
                    flashcards: parsed.flashcards,
                    quiz: parsed.quiz,
                };
            } catch (err: any) {
                const msg = err?.message || '';
                if (msg.includes('API key') || msg.includes('API_KEY_INVALID')) {
                    throw new Error('مفتاح الـ API غير صالح، يرجى التحقق منه.');
                }
                await wait(1200);
            }
        }
    }

    throw new Error('خوادم الذكاء الاصطناعي مزدحمة حالياً، يرجى المحاولة بعد ثوانٍ قليلة.');
}
