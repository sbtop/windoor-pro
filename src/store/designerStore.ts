import { create } from 'zustand';
import { DesignElement, ElementType, ClientData, DEFAULT_WINDOW, DEFAULT_DOOR } from '../types';

interface DesignerState {
    // Estado Global
    elements: DesignElement[];
    selectedId: string | null;
    activeClient: ClientData | null;
    activeProjectId: string | null;

    // Selectores de conveniencia
    selectedElement: () => DesignElement | null;

    // Acciones (Mutaciones)
    addElement: (type: ElementType) => void;
    updateElement: (id: string, changes: Partial<DesignElement>) => void;
    deleteElement: (id: string) => void;
    selectElement: (id: string | null) => void;
    setElements: (elements: DesignElement[]) => void;
    clearCanvas: () => void;
    setActiveClient: (client: ClientData | null) => void;
    setActiveProjectId: (id: string | null) => void;
}

/**
 * 🌍 Store Global de Zustand
 * Orquesta el flujo de vida del diseño:
 * Diseño 2D -> Motor de Cálculo -> Cotizador -> PDF
 */
export const useDesignerStore = create<DesignerState>((set, get) => ({
    elements: [],
    selectedId: null,
    activeClient: null,
    activeProjectId: null,

    // Devolver el elemento actualmente seleccionado
    selectedElement: () => {
        const state = get();
        return state.elements.find(el => el.id === state.selectedId) || null;
    },

    // Añadir un nuevo elemento al lienzo
    addElement: (type) => {
        const defaults = type === 'window' ? DEFAULT_WINDOW : DEFAULT_DOOR;
        const id = `${type}-${Date.now()}`;
        const newEl: DesignElement = {
            ...defaults,
            id,
            x: 80 + Math.random() * 200,
            y: 80 + Math.random() * 100,
            selected: false,
        };

        set((state) => ({
            elements: [...state.elements, newEl],
            selectedId: id
        }));
    },

    // Actualizar propiedades matemáticas/visuales de un elemento
    updateElement: (id, changes) => set((state) => ({
        elements: state.elements.map(el => el.id === id ? { ...el, ...changes } : el)
    })),

    // Eliminar elemento del lienzo
    deleteElement: (id) => set((state) => ({
        elements: state.elements.filter(el => el.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId
    })),

    // Seleccionar elemento activo
    selectElement: (id) => set({ selectedId: id }),

    // Cargar estado inicial (e.g., desde Firebase)
    setElements: (elements) => set({ elements }),

    // Limpiar lienzo
    clearCanvas: () => set({ 
        elements: [], 
        selectedId: null, 
        activeProjectId: null 
    }),

    // Gestión de cliente activo
    setActiveClient: (client) => set({ activeClient: client }),

    // Gestión de proyecto activo
    setActiveProjectId: (id) => set({ activeProjectId: id }),
}));

