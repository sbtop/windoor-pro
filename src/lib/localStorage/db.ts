/**
 * 🗄️ localStorage Database API
 * Drop-in replacement for src/lib/firebase/db.ts
 * Same function signatures — just swap the import, everything works.
 *
 * Data layout in localStorage:
 *   windoor-projects-v1  → ProjectData[]
 *   windoor-clients-v1   → ClientData[]
 */

import { ClientData } from '../../types';

// ── Re-export ProjectData so callers don't need to change imports ─────────────
export interface ProjectData {
    id?: string;
    userId: string;
    clientName: string;
    projectName?: string;
    siteAddress?: string;
    contactPhone?: string;
    projectType?: string;
    status: 'draft' | 'quoted' | 'in-production' | 'completed';
    elements: any[];
    sitePhotos?: string[]; // base64 or URL strings
    quotation?: any;
    createdAt?: string;
    updatedAt?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const PROJECTS_KEY = 'windoor-projects-v2';
const CLIENTS_KEY  = 'windoor-clients-v2';

const generateId = (): string => {
    const hex = () => Math.floor(Math.random() * 0xFFFF).toString(16).padStart(4, '0');
    return `${hex()}${hex()}-${hex()}-${hex()}`;
};

function readProjects(): ProjectData[] {
    try {
        return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
    } catch {
        return [];
    }
}

function writeProjects(data: ProjectData[]): void {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(data));
}

function readClients(): ClientData[] {
    try {
        return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
    } catch {
        return [];
    }
}

function writeClients(data: ClientData[]): void {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(data));
}

// ── Projects API ──────────────────────────────────────────────────────────────

/**
 * Returns all projects belonging to a userId.
 * Returns empty array (not mock data) — mock data lives in Workspace.tsx.
 */
export async function getUserProjects(userId: string): Promise<ProjectData[]> {
    const all = readProjects();
    return all.filter((p) => p.userId === userId);
}

/**
 * Creates or updates a project.
 * If project has no id, a new one is generated.
 * Returns the project id.
 */
export async function saveProject(project: ProjectData): Promise<string> {
    const all = readProjects();
    const id = project.id || generateId();
    const now = new Date().toISOString();

    const idx = all.findIndex((p) => p.id === id);
    const updated: ProjectData = { ...project, id, updatedAt: now };

    if (idx >= 0) {
        all[idx] = updated;
    } else {
        all.push({ ...updated, createdAt: now });
    }

    writeProjects(all);
    return id;
}

/**
 * Deletes a project by id.
 */
export async function deleteProject(id: string): Promise<void> {
    const all = readProjects().filter((p) => p.id !== id);
    writeProjects(all);
}

/**
 * Updates specific fields on a project (partial update).
 */
export async function updateProject(id: string, changes: Partial<ProjectData>): Promise<void> {
    const all = readProjects();
    const idx = all.findIndex((p) => p.id === id);
    if (idx >= 0) {
        all[idx] = { ...all[idx], ...changes, updatedAt: new Date().toISOString() };
        writeProjects(all);
    }
}

// ── Clients API ───────────────────────────────────────────────────────────────

/**
 * Returns all clients belonging to a userId.
 */
export async function getUserClients(userId: string): Promise<ClientData[]> {
    const all = readClients();
    return all.filter((c) => c.userId === userId);
}

/**
 * Creates or updates a client.
 * Returns the client id.
 */
export async function saveClient(client: ClientData): Promise<string> {
    const all = readClients();
    const id = client.id || generateId();
    const now = new Date().toISOString();

    const idx = all.findIndex((c) => c.id === id);
    const updated: ClientData = { ...client, id, updatedAt: now };

    if (idx >= 0) {
        all[idx] = updated;
    } else {
        all.push({ ...updated, createdAt: now });
    }

    writeClients(all);
    return id;
}

/**
 * Deletes a client by id.
 */
export async function deleteClient(id: string): Promise<void> {
    const all = readClients().filter((c) => c.id !== id);
    writeClients(all);
}
