import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, AlertCircle, Bell, Plus, X } from 'lucide-react';
import { useCalendarStore, ScheduledJob } from '../store/calendarStore';

interface CalendarProps {
    variant?: 'full' | 'mini';
    onExpand?: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ variant = 'full', onExpand }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showNewJobModal, setShowNewJobModal] = useState(false);
    const [showJobDetails, setShowJobDetails] = useState<ScheduledJob | null>(null);

    // 🗄️ Persistent state from calendarStore (saved to localStorage automatically)
    const { jobs, addJob, deleteJob } = useCalendarStore();

    const [newJob, setNewJob] = useState<Partial<Omit<ScheduledJob, 'id' | 'date'>>>({
        title: '',
        client: '',
        time: '09:00',
        duration: '1h',
        type: 'installation',
        address: '',
        reminder: true,
        notes: '',
    });

    const jobTypeColors = {
        installation: { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-700', icon: 'bg-emerald-500' },
        measurement:  { bg: 'bg-blue-100',    border: 'border-blue-400',    text: 'text-blue-700',    icon: 'bg-blue-500'    },
        delivery:     { bg: 'bg-amber-100',    border: 'border-amber-400',   text: 'text-amber-700',   icon: 'bg-amber-500'   },
        maintenance:  { bg: 'bg-purple-100',   border: 'border-purple-400',  text: 'text-purple-700',  icon: 'bg-purple-500'  },
    };

    const jobTypeLabels = {
        installation: 'Instalación',
        measurement:  'Medición',
        delivery:     'Entrega',
        maintenance:  'Mantenimiento',
    };

    const getDaysInMonth = (date: Date) => {
        const year  = date.getFullYear();
        const month = date.getMonth();
        const firstDay   = new Date(year, month, 1);
        const lastDay    = new Date(year, month + 1, 0);
        const daysInMonth      = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (number | null)[] = [];
        for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };

    // Parse ISO date from store and compare with a calendar day
    const getJobsForDate = (day: number) => {
        return jobs.filter(job => {
            const d = new Date(job.date);
            return (
                d.getDate()     === day &&
                d.getMonth()    === currentDate.getMonth() &&
                d.getFullYear() === currentDate.getFullYear()
            );
        });
    };

    const handleAddJob = () => {
        if (!selectedDate || !newJob.title || !newJob.client) return;

        addJob({
            title:    newJob.title,
            client:   newJob.client,
            date:     selectedDate.toISOString(), // store as ISO string
            time:     newJob.time     || '09:00',
            duration: newJob.duration || '1h',
            type:     (newJob.type as ScheduledJob['type']) || 'installation',
            address:  newJob.address  || '',
            reminder: newJob.reminder ?? false,
            notes:    newJob.notes,
        });

        setShowNewJobModal(false);
        setNewJob({
            title: '', client: '', time: '09:00', duration: '1h',
            type: 'installation', address: '', reminder: true, notes: '',
        });
    };

    const handleDeleteJob = (id: string) => {
        deleteJob(id);
        setShowJobDetails(null);
    };

    const days      = getDaysInMonth(currentDate);
    const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const weekDays   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

    // ── MINI VARIANT ──────────────────────────────────────────────────────────
    if (variant === 'mini') {
        const miniDays = getDaysInMonth(currentDate);
        return (
            <div
                onClick={onExpand}
                className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-primary/10 cursor-pointer hover:bg-white hover:border-primary/30 transition-all group shadow-sm"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {monthNames[currentDate.getMonth()]}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
                            }}
                            className="p-0.5 hover:bg-slate-100 rounded text-slate-400"
                        >
                            <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
                            }}
                            className="p-0.5 hover:bg-slate-100 rounded text-slate-400"
                        >
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                    {weekDays.map(day => (
                        <div key={day} className="text-[8px] font-bold text-slate-300 text-center uppercase">
                            {day.charAt(0)}
                        </div>
                    ))}
                    {miniDays.map((day, index) => {
                        if (day === null) return <div key={`empty-${index}`} className="h-4" />;
                        const dayJobs = getJobsForDate(day);
                        const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={day}
                                className={`h-4 flex flex-col items-center justify-center rounded-sm relative ${isToday ? 'bg-primary/10' : ''}`}
                            >
                                <span className={`text-[8px] ${isToday ? 'text-primary font-bold' : 'text-slate-500'}`}>
                                    {day}
                                </span>
                                {dayJobs.length > 0 && (
                                    <div className="flex gap-0.5 mt-0.5">
                                        {dayJobs.slice(0, 3).map(job => (
                                            <div
                                                key={job.id}
                                                className={`w-1 h-1 rounded-full ${jobTypeColors[job.type].icon}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ── FULL VARIANT ──────────────────────────────────────────────────────────
    return (
        <div className="bg-white rounded-2xl shadow-soft-md border border-slate-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-primary" />
                        Programación de Trabajos
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Gestiona tus visitas e instalaciones</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <span className="font-bold text-slate-700 min-w-[140px] text-center">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-6">
                {Object.entries(jobTypeLabels).map(([type, label]) => (
                    <div key={type} className="flex items-center gap-2 text-sm">
                        <div className={`w-3 h-3 rounded-full ${jobTypeColors[type as keyof typeof jobTypeColors].icon}`} />
                        <span className="text-slate-600">{label}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase py-2">
                        {day}
                    </div>
                ))}
                {days.map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="h-24" />;
                    }
                    const dayJobs = getJobsForDate(day);
                    const isToday =
                        new Date().getDate()     === day &&
                        new Date().getMonth()    === currentDate.getMonth() &&
                        new Date().getFullYear() === currentDate.getFullYear();

                    return (
                        <div
                            key={day}
                            onClick={() => {
                                setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                                setShowNewJobModal(true);
                            }}
                            className={`h-24 border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                                isToday ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-primary/30'
                            }`}
                        >
                            <div className={`text-sm font-bold mb-1 ${isToday ? 'text-primary' : 'text-slate-700'}`}>
                                {day}
                            </div>
                            <div className="space-y-1">
                                {dayJobs.slice(0, 2).map(job => (
                                    <div
                                        key={job.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowJobDetails(job);
                                        }}
                                        className={`text-[10px] px-1.5 py-0.5 rounded border-l-2 truncate ${
                                            jobTypeColors[job.type].bg
                                        } ${jobTypeColors[job.type].border} ${jobTypeColors[job.type].text}`}
                                    >
                                        {job.time} - {job.title}
                                    </div>
                                ))}
                                {dayJobs.length > 2 && (
                                    <div className="text-[10px] text-slate-400 text-center">
                                        +{dayJobs.length - 2} más
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reminders Section */}
            <div className="border-t border-slate-100 pt-4 mt-4">
                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    Próximos Trabajos con Recordatorio
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {jobs
                        .filter(job => job.reminder && new Date(job.date) >= new Date())
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 5)
                        .map(job => (
                            <div
                                key={job.id}
                                onClick={() => setShowJobDetails(job)}
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                            >
                                <div className={`w-2 h-2 rounded-full ${jobTypeColors[job.type].icon}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-700 truncate">{job.title}</p>
                                    <p className="text-xs text-slate-500">
                                        {job.client} • {new Date(job.date).toLocaleDateString('es-MX')}
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-primary">{job.time}</span>
                            </div>
                        ))
                    }
                    {jobs.filter(j => j.reminder && new Date(j.date) >= new Date()).length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">
                            No hay recordatorios próximos. Haz clic en un día del calendario para agendar un trabajo.
                        </p>
                    )}
                </div>
            </div>

            {/* ── NEW JOB MODAL ────────────────────────────────────────────────── */}
            {showNewJobModal && selectedDate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">Nuevo Trabajo</h3>
                            <button
                                onClick={() => setShowNewJobModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Fecha</label>
                                <p className="text-sm font-bold text-slate-700">
                                    {selectedDate.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Título</label>
                                <input
                                    type="text"
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ej: Instalación Ventana Principal"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Cliente</label>
                                <input
                                    type="text"
                                    value={newJob.client}
                                    onChange={(e) => setNewJob({ ...newJob, client: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Nombre del cliente"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Hora</label>
                                    <input
                                        type="time"
                                        value={newJob.time}
                                        onChange={(e) => setNewJob({ ...newJob, time: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Duración</label>
                                    <select
                                        value={newJob.duration}
                                        onChange={(e) => setNewJob({ ...newJob, duration: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="30min">30 min</option>
                                        <option value="1h">1 hora</option>
                                        <option value="2h">2 horas</option>
                                        <option value="3h">3 horas</option>
                                        <option value="4h">4 horas</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Tipo</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(jobTypeLabels).map(([type, label]) => (
                                        <button
                                            key={type}
                                            onClick={() => setNewJob({ ...newJob, type: type as ScheduledJob['type'] })}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                                newJob.type === type
                                                    ? 'bg-primary text-white'
                                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Dirección</label>
                                <input
                                    type="text"
                                    value={newJob.address}
                                    onChange={(e) => setNewJob({ ...newJob, address: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Dirección del trabajo"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Notas</label>
                                <input
                                    type="text"
                                    value={newJob.notes}
                                    onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Observaciones opcionales..."
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="reminder"
                                    checked={newJob.reminder}
                                    onChange={(e) => setNewJob({ ...newJob, reminder: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                                />
                                <label htmlFor="reminder" className="text-sm font-medium text-slate-700">
                                    Activar recordatorio
                                </label>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setShowNewJobModal(false)}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddJob}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── JOB DETAILS MODAL ────────────────────────────────────────────── */}
            {showJobDetails && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className={`p-6 border-b ${jobTypeColors[showJobDetails.type].bg} ${jobTypeColors[showJobDetails.type].border}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${jobTypeColors[showJobDetails.type].bg} ${jobTypeColors[showJobDetails.type].text} mb-2`}>
                                        {jobTypeLabels[showJobDetails.type]}
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-800">{showJobDetails.title}</h3>
                                </div>
                                <button
                                    onClick={() => setShowJobDetails(null)}
                                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-600" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="font-bold text-slate-700">
                                        {new Date(showJobDetails.date).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {showJobDetails.time} • Duración: {showJobDetails.duration}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {showJobDetails.client.charAt(0)}
                                </div>
                                <p className="font-medium text-slate-700">{showJobDetails.client}</p>
                            </div>
                            {showJobDetails.address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                                    <p className="text-slate-600">{showJobDetails.address}</p>
                                </div>
                            )}
                            {showJobDetails.reminder && (
                                <div className="flex items-center gap-2 bg-amber-50 p-3 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm text-amber-700">Recordatorio activado</span>
                                </div>
                            )}
                            {showJobDetails.notes && (
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Notas</p>
                                    <p className="text-sm text-slate-600">{showJobDetails.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => handleDeleteJob(showJobDetails.id)}
                                className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors"
                            >
                                Eliminar
                            </button>
                            <button
                                onClick={() => setShowJobDetails(null)}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
