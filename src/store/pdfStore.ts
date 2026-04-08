import { create } from 'zustand';

export interface PDFDocument {
    id: string;
    name: string;
    type: 'cotizacion' | 'plano' | 'reporte';
    projectId?: string;
    projectName: string;
    clientName: string;
    createdAt: Date;
    url?: string;
}

interface PDFStore {
    documents: PDFDocument[];
    addDocument: (doc: Omit<PDFDocument, 'id' | 'createdAt'>) => void;
    deleteDocument: (id: string) => void;
    getRecentDocuments: (limit?: number) => PDFDocument[];
}

export const usePDFStore = create<PDFStore>((set, get) => ({
    documents: JSON.parse(localStorage.getItem('pdfDocuments') || '[]').map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt)
    })),

    addDocument: (doc) => {
        const newDoc: PDFDocument = {
            ...doc,
            id: Date.now().toString(),
            createdAt: new Date()
        };
        const updated = [newDoc, ...get().documents];
        set({ documents: updated });
        localStorage.setItem('pdfDocuments', JSON.stringify(updated));
    },

    deleteDocument: (id) => {
        const updated = get().documents.filter(d => d.id !== id);
        set({ documents: updated });
        localStorage.setItem('pdfDocuments', JSON.stringify(updated));
    },

    getRecentDocuments: (limit = 5) => {
        return get().documents.slice(0, limit);
    }
}));
