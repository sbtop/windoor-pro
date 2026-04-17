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
export interface ProjectVersion {
    version: number;
    timestamp: string;
    changes: string;
    elements: any[];
    quotation?: any;
    author?: string;
}

export interface ApprovalRecord {
    id: string;
    timestamp: string;
    quotationData: any;
    status: 'pending' | 'approved' | 'rejected';
    clientName: string;
    clientEmail?: string;
    clientSignature?: string; // Base64 signature
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    sentBy?: string;
}

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
    versionHistory?: ProjectVersion[];
    currentVersion?: number;
    approvalHistory?: ApprovalRecord[];
    currentApproval?: ApprovalRecord;
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
 * Automatically creates a version when elements or quotation change.
 */
export async function saveProject(project: ProjectData, changes?: string): Promise<string> {
    const all = readProjects();
    const id = project.id || generateId();
    const now = new Date().toISOString();

    const idx = all.findIndex((p) => p.id === id);
    const updated: ProjectData = { ...project, id, updatedAt: now };

    if (idx >= 0) {
        const existingProject = all[idx];
        
        // Check if elements or quotation changed significantly
        const elementsChanged = JSON.stringify(existingProject.elements) !== JSON.stringify(project.elements);
        const quotationChanged = JSON.stringify(existingProject.quotation) !== JSON.stringify(project.quotation);
        
        if (elementsChanged || quotationChanged) {
            // Create a version snapshot before updating
            const currentVersion = existingProject.currentVersion || 0;
            const newVersion = currentVersion + 1;
            
            const version: ProjectVersion = {
                version: newVersion,
                timestamp: now,
                changes: changes || (elementsChanged ? 'Elementos modificados' : 'Cotización actualizada'),
                elements: JSON.parse(JSON.stringify(existingProject.elements)),
                quotation: existingProject.quotation ? JSON.parse(JSON.stringify(existingProject.quotation)) : undefined,
                author: 'Usuario'
            };
            
            const versionHistory = existingProject.versionHistory || [];
            versionHistory.push(version);
            
            // Keep only last 20 versions
            const trimmedHistory = versionHistory.slice(-20);
            
            updated.versionHistory = trimmedHistory;
            updated.currentVersion = newVersion;
        } else {
            // Preserve existing version history if no significant changes
            updated.versionHistory = existingProject.versionHistory;
            updated.currentVersion = existingProject.currentVersion;
        }
        
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

/**
 * Creates a new version snapshot of a project.
 * Call this before making significant changes to elements or quotation.
 */
export async function createProjectVersion(
    projectId: string,
    changes: string,
    author?: string
): Promise<void> {
    const all = readProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx >= 0) {
        const project = all[idx];
        const currentVersion = project.currentVersion || 0;
        const newVersion = currentVersion + 1;
        
        const version: ProjectVersion = {
            version: newVersion,
            timestamp: new Date().toISOString(),
            changes,
            elements: JSON.parse(JSON.stringify(project.elements)),
            quotation: project.quotation ? JSON.parse(JSON.stringify(project.quotation)) : undefined,
            author
        };
        
        const versionHistory = project.versionHistory || [];
        versionHistory.push(version);
        
        // Keep only last 20 versions to avoid storage bloat
        const trimmedHistory = versionHistory.slice(-20);
        
        all[idx] = {
            ...project,
            versionHistory: trimmedHistory,
            currentVersion: newVersion,
            updatedAt: new Date().toISOString()
        };
        
        writeProjects(all);
    }
}

/**
 * Restores a project to a specific version.
 */
export async function restoreProjectVersion(projectId: string, version: number): Promise<void> {
    const all = readProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx >= 0) {
        const project = all[idx];
        const versionToRestore = project.versionHistory?.find(v => v.version === version);
        
        if (versionToRestore) {
            all[idx] = {
                ...project,
                elements: JSON.parse(JSON.stringify(versionToRestore.elements)),
                quotation: versionToRestore.quotation ? JSON.parse(JSON.stringify(versionToRestore.quotation)) : undefined,
                currentVersion: version,
                updatedAt: new Date().toISOString()
            };
            
            writeProjects(all);
        }
    }
}

/**
 * Gets the version history for a project.
 */
export async function getProjectVersionHistory(projectId: string): Promise<ProjectVersion[]> {
    const all = readProjects();
    const project = all.find((p) => p.id === projectId);
    return project?.versionHistory || [];
}

/**
 * Sends a quotation for client approval.
 */
export async function sendForApproval(
    projectId: string,
    clientEmail?: string,
    sentBy?: string
): Promise<string> {
    const all = readProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx >= 0) {
        const project = all[idx];
        
        const approval: ApprovalRecord = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            quotationData: project.quotation ? JSON.parse(JSON.stringify(project.quotation)) : null,
            status: 'pending',
            clientName: project.clientName,
            clientEmail,
            sentBy
        };
        
        const approvalHistory = project.approvalHistory || [];
        approvalHistory.push(approval);
        
        all[idx] = {
            ...project,
            approvalHistory,
            currentApproval: approval,
            status: 'quoted',
            updatedAt: new Date().toISOString()
        };
        
        writeProjects(all);
        return approval.id;
    }
    throw new Error('Project not found');
}

/**
 * Approves a quotation with client signature.
 */
export async function approveQuotation(
    projectId: string,
    approvalId: string,
    signature: string,
    clientEmail?: string
): Promise<void> {
    const all = readProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx >= 0) {
        const project = all[idx];
        const approvalIndex = project.approvalHistory?.findIndex(a => a.id === approvalId);
        
        if (approvalIndex !== undefined && approvalIndex >= 0) {
            const approval = project.approvalHistory![approvalIndex];
            approval.status = 'approved';
            approval.clientSignature = signature;
            approval.clientEmail = clientEmail || approval.clientEmail;
            approval.approvedAt = new Date().toISOString();
            
            all[idx] = {
                ...project,
                approvalHistory: project.approvalHistory,
                currentApproval: approval,
                status: 'in-production',
                updatedAt: new Date().toISOString()
            };
            
            writeProjects(all);
        }
    }
}

/**
 * Rejects a quotation with reason.
 */
export async function rejectQuotation(
    projectId: string,
    approvalId: string,
    reason: string
): Promise<void> {
    const all = readProjects();
    const idx = all.findIndex((p) => p.id === projectId);
    if (idx >= 0) {
        const project = all[idx];
        const approvalIndex = project.approvalHistory?.findIndex(a => a.id === approvalId);
        
        if (approvalIndex !== undefined && approvalIndex >= 0) {
            const approval = project.approvalHistory![approvalIndex];
            approval.status = 'rejected';
            approval.rejectionReason = reason;
            approval.rejectedAt = new Date().toISOString();
            
            all[idx] = {
                ...project,
                approvalHistory: project.approvalHistory,
                currentApproval: approval,
                status: 'quoted',
                updatedAt: new Date().toISOString()
            };
            
            writeProjects(all);
        }
    }
}

/**
 * Gets approval history for a project.
 */
export async function getApprovalHistory(projectId: string): Promise<ApprovalRecord[]> {
    const all = readProjects();
    const project = all.find((p) => p.id === projectId);
    return project?.approvalHistory || [];
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
