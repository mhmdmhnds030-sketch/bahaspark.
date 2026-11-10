export interface Flashcard {
    question: string;
    answer: string;
}

export interface QuizQuestion {
    question: string;
    options: Array<string>;
    correctAnswerIndex: number;
    explanation: string;
}

export interface StudyMaterial {
    id: string;
    title: string;
    createdAt: string;
    summary: Array<string>;
    flashcards: Array<Flashcard>;
    quiz: Array<QuizQuestion>;
}
