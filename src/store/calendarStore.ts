import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ScheduledJob {
    id: string;
    title: string;
    client: string;
    date: string; // ISO string for safe serialization
    time: string;
    duration: string;
    type: 'installation' | 'measurement' | 'delivery' | 'maintenance';
    address: string;
    reminder: boolean;
    notes?: string;
}

interface CalendarState {
    jobs: ScheduledJob[];
    addJob: (job: Omit<ScheduledJob, 'id'>) => void;
    updateJob: (id: string, changes: Partial<ScheduledJob>) => void;
    deleteJob: (id: string) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────
/**
 * 📅 Calendar Store
 * Persists scheduled jobs (installations, measurements, deliveries)
 * in localStorage. Uses ISO strings for dates to ensure safe JSON
 * serialization/deserialization.
 */
export const useCalendarStore = create<CalendarState>()(
    persist(
        (set, get) => ({
            jobs: [
                // Seed data — only shown on first load (before any user data exists)
                {
                    id: 'seed-1',
                    title: 'Instalación Ventana Principal',
                    client: 'Juan Pérez',
                    date: new Date().toISOString(),
                    time: '09:00',
                    duration: '2h',
                    type: 'installation',
                    address: 'Av. Principal 123, Ciudad',
                    reminder: true,
                    notes: 'Traer herramientas de corte',
                },
                {
                    id: 'seed-2',
                    title: 'Medición Puerta Patio',
                    client: 'María García',
                    date: new Date(Date.now() + 86400000).toISOString(),
                    time: '14:30',
                    duration: '1h',
                    type: 'measurement',
                    address: 'Calle 45, Barrio Norte',
                    reminder: true,
                },
                {
                    id: 'seed-3',
                    title: 'Entrega Mampara Baño',
                    client: 'Carlos López',
                    date: new Date(Date.now() + 172800000).toISOString(),
                    time: '11:00',
                    duration: '30min',
                    type: 'delivery',
                    address: 'Av. Libertad 789',
                    reminder: false,
                },
            ],

            addJob: (job) => {
                const newJob: ScheduledJob = {
                    ...job,
                    id: `job-${Date.now()}`,
                };
                set((state) => ({ jobs: [...state.jobs, newJob] }));
            },

            updateJob: (id, changes) => {
                set((state) => ({
                    jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...changes } : j)),
                }));
            },

            deleteJob: (id) => {
                set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }));
            },
        }),
        {
            name: 'windoor-calendar-v2', // localStorage key
        }
    )
);
