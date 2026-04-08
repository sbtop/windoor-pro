// ============================================================
// Designer Element Types
// ============================================================

export type ViewType = 'window' | 'door' | 'projects' | 'home' | 'clients' | 'canvas' | 'calculator' | 'pdf' | 'designer' | 'quote' | 'notifications' | 'settings' | 'reports' | 'calendar';

export type ElementType = 'window' | 'door';

export interface Panel {
    id: string;
    widthRatio: number; // percentage of total element width
}

export interface DesignElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;    // in millimeters internally
    height: number;   // in millimeters internally
    panels: Panel[];  // one per hoja/panel division
    selected: boolean;
    material?: 'aluminio' | 'upvc';
    color?: string;
    openingType?: 'fija' | 'corrediza' | 'abatible'; // For manufacturing calculation
    glassType?: string; // Dictionary ID of the glass
}

// ============================================================
// Client / CRM Types
// ============================================================

export interface ClientData {
    id?: string;
    userId?: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    notes?: string;
    createdAt?: any;
    updatedAt?: any;
}

// 1 pixel = 1 mm for simplicity in this canvas (can be scaled)
export const MM_PER_PX = 1;

export const DEFAULT_WINDOW: Omit<DesignElement, 'id' | 'x' | 'y'> = {
    type: 'window',
    width: 1500, // Changed default to 1500mm (1.5m) to be more realistic
    height: 1200, // Changed default to 1200mm (1.2m)
    panels: [{ id: 'p1', widthRatio: 0.5 }, { id: 'p2', widthRatio: 0.5 }],
    selected: false,
    material: 'aluminio',
    color: '#6366f1',
    openingType: 'corrediza',
    glassType: 'vidrio_6mm',
};

export const DEFAULT_DOOR: Omit<DesignElement, 'id' | 'x' | 'y'> = {
    type: 'door',
    width: 900,  // 0.90m - medida real estándar de puerta
    height: 2100, // 2.10m - medida real estándar de puerta
    panels: [{ id: 'p1', widthRatio: 1 }],
    selected: false,
    material: 'aluminio',
    color: '#0ea5e9',
    openingType: 'abatible',
    glassType: 'vidrio_6mm',
};
