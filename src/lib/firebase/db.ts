import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    addDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from './config';
import { DesignElement, ClientData } from '../../types';
import { PricingResult } from '../../services/pricing';

export interface ProjectData {
    id?: string;
    userId: string;
    clientName: string;
    projectName: string;
    siteAddress?: string;
    projectType?: string;
    contactPhone?: string;
    status: 'draft' | 'quoted' | 'approved' | 'in-production';
    elements: DesignElement[];
    quotation?: PricingResult;
    sitePhotos?: string[];
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

// ============================================================
// PROJECTS - localStorage
// ============================================================

const PROJECTS_KEY = 'projects';

/**
 * Guarda o actualiza un proyecto completo en localStorage
 */
export const saveProject = async (data: ProjectData, existingId?: string): Promise<string> => {
    try {
        const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
        
        if (existingId) {
            const index = projects.findIndex((p: ProjectData) => p.id === existingId);
            if (index >= 0) {
                projects[index] = { ...data, id: existingId, updatedAt: new Date().toISOString() };
            }
            localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
            return existingId;
        } else {
            const newId = Date.now().toString();
            const newProject = { ...data, id: newId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            projects.push(newProject);
            localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
            return newId;
        }
    } catch (error) {
        console.error("Error al guardar el proyecto:", error);
        throw error;
    }
};

/**
 * Obtiene todos los proyectos de un usuario específico
 */
export const getUserProjects = async (userId: string): Promise<ProjectData[]> => {
    try {
        const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
        return projects.filter((p: ProjectData) => p.userId === userId).sort((a: ProjectData, b: ProjectData) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
    } catch (error) {
        console.error("Error al obtener los proyectos:", error);
        return [];
    }
};

/**
 * Carga un solo proyecto por su ID
 */
export const getProjectById = async (projectId: string): Promise<ProjectData | null> => {
    try {
        const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
        return projects.find((p: ProjectData) => p.id === projectId) || null;
    } catch (error) {
        console.error("Error al obtener el proyecto:", error);
        return null;
    }
};

/**
 * Elimina un proyecto por su ID
 */
export const deleteProject = async (projectId: string): Promise<void> => {
    try {
        const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects.filter((p: ProjectData) => p.id !== projectId)));
    } catch (error) {
        console.error("Error al eliminar el proyecto:", error);
        throw error;
    }
};

// ============================================================
// CLIENTS - localStorage
// ============================================================

const CLIENTS_KEY = 'clients';

/**
 * Guarda o actualiza un cliente en localStorage
 */
export const saveClient = async (data: ClientData, existingId?: string): Promise<string> => {
    try {
        const clients = JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
        
        if (existingId) {
            const index = clients.findIndex((c: ClientData) => c.id === existingId);
            if (index >= 0) {
                clients[index] = { ...data, id: existingId, updatedAt: new Date().toISOString() };
            }
            localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
            return existingId;
        } else {
            const newId = Date.now().toString();
            const newClient = { ...data, id: newId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            clients.push(newClient);
            localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
            return newId;
        }
    } catch (error) {
        console.error("Error al guardar el cliente:", error);
        throw error;
    }
};

/**
 * Obtiene todos los clientes de un usuario
 */
export const getUserClients = async (userId: string): Promise<ClientData[]> => {
    try {
        const clients = JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
        return clients.filter((c: ClientData) => c.userId === userId);
    } catch (error) {
        console.error("Error al obtener los clientes:", error);
        return [];
    }
};

/**
 * Obtiene un cliente por su ID
 */
export const getClientById = async (clientId: string): Promise<ClientData | null> => {
    try {
        const clients = JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
        return clients.find((c: ClientData) => c.id === clientId) || null;
    } catch (error) {
        console.error("Error al obtener el cliente:", error);
        return null;
    }
};

/**
 * Elimina un cliente por su ID
 */
export const deleteClient = async (clientId: string): Promise<void> => {
    try {
        const clients = JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients.filter((c: ClientData) => c.id !== clientId)));
    } catch (error) {
        console.error("Error al eliminar el cliente:", error);
        throw error;
    }
};
