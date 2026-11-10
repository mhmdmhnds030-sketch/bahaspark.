import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface FileUploaderProps {
    onFileLoaded: (text: string) => void;
}

export function FileUploader({ onFileLoaded }: FileUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [extracting, setExtracting] = useState(false);

    const extractTextFromPdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        // مسح ذكي موزع يغطي الملف بالكامل سواء كان 10 صفحات أو 1000 صفحة
        const maxPagesToSample = 40;
        const step = totalPages > maxPagesToSample ? totalPages / maxPagesToSample : 1;
        let fullText = '';

        for (let i = 0; i < Math.min(totalPages, maxPagesToSample); i++) {
            const pageNum = Math.min(totalPages, Math.floor(i * step) + 1);
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += `[صفحة ${pageNum}]: ${pageText}\n\n`;
            if (fullText.length >= 60000) break;
        }

        return fullText;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setExtracting(true);
        try {
            let extractedText = '';
            if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                extractedText = await extractTextFromPdf(file);
            } else {
                extractedText = await file.text();
            }

            if (!extractedText.trim()) {
                alert('لم يتم العثور على نص مقروء في هذا الملف.');
            } else {
                onFileLoaded(extractedText.slice(0, 60000));
            }
        } catch {
            alert('تعذر قراءة الملف، تأكد من سلامته وحاول مجدداً.');
        } finally {
            setExtracting(false);
            e.target.value = '';
        }
    };

    return (
        <div className="file-upload-wrapper">
            <input
                type="file"
                accept=".pdf,.txt,.md"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
            <button
                type="button"
                className="btn-secondary full-width upload-btn"
                disabled={extracting}
                onClick={() => fileInputRef.current?.click()}
            >
                {extracting ? (
                    <>
                        <Loader2 className="spin" size={16} />
                        <span>جاري تحليل صفحات الملف...</span>
                    </>
                ) : (
                    <>
                        <Upload size={16} />
                        <span>رفع ملف أو كتاب (PDF / TXT)</span>
                    </>
                )}
            </button>
        </div>
    );
}
