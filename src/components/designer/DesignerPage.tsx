import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Square, DoorOpen, ZoomIn, ZoomOut, Maximize2, Trash2, Grid, Download, Cloud, UserCheck } from 'lucide-react';
import Konva from 'konva';
import KonvaCanvas from './KonvaCanvas';
import PropertiesPanel from './PropertiesPanel';
import { generateTechnicalPDF } from '../../services/pdfGenerator';
import { calcularMaterialesVentana } from '../../services/manufacturing';
import { calcularCotizacionSaaS } from '../../services/pricing';
import { saveProject, ProjectData } from '../../lib/localStorage/db';
import { useDesignerStore } from '../../store/designerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useUserStore } from '../../store/userStore';

const DesignerPage: React.FC = () => {
    // 🌍 Global State
    const {
        elements,
        selectedId,
        addElement,
        updateElement,
        deleteElement,
        selectElement,
        selectedElement: getSelected
    } = useDesignerStore();

    const selectedElement = getSelected();
    const activeClient = useDesignerStore(s => s.activeClient);
    const { pricingConfig } = useSettingsStore();
    const { currentUser } = useUserStore();

    // 🎨 Local UI State
    const [showGrid, setShowGrid] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
    const [zoom, setZoom] = useState(100);

    // Measure the available canvas area
    useEffect(() => {
        const measure = () => {
            if (containerRef.current) {
                setStageSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const deleteSelected = useCallback(() => {
        if (!selectedId) return;
        deleteElement(selectedId);
    }, [selectedId, deleteElement]);

    const handleExportPdf = () => {
        if (!selectedElement || selectedElement.type !== 'window' || !stageRef.current) return;

        // Render 2x pixel ratio for crispy quality
        const imageDataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });

        const calcResult = calcularMaterialesVentana({
            ancho: selectedElement.width,
            alto: selectedElement.height,
            tipo: selectedElement.openingType || 'corrediza',
            hojas: selectedElement.panels.length,
            glassType: selectedElement.glassType
        });

        const pricingResult = calcularCotizacionSaaS(calcResult, pricingConfig);

        generateTechnicalPDF(selectedElement, calcResult, imageDataUrl, pricingResult, pricingConfig.diccionario);
    };

    const handleSaveCloud = async () => {
        if (elements.length === 0) {
            alert("Añade al menos un elemento al canvas para guardar.");
            return;
        }

        const pName = prompt("Nombre del Proyecto:", "Mi Proyecto WinDoor");
        if (!pName) return;

        const cName = activeClient ? activeClient.name : (prompt("Nombre del Cliente:", "Cliente Mostrador") || "Cliente Mostrador");

        setIsSaving(true);
        try {
            // 1. Mapeo de Cotización: Buscamos el primer elemento (ventana o puerta) para el resumen
            let finalQuotation = undefined;
            const firstElement = elements[0];

            if (firstElement) {
                // Cálculo de materiales (usamos el motor de ventana como base para puertas también por ahora)
                const calcResult = calcularMaterialesVentana({
                    ancho: firstElement.width,
                    alto: firstElement.height,
                    tipo: (firstElement.openingType as any) || 'corrediza',
                    hojas: firstElement.panels.length,
                    glassType: firstElement.glassType
                });
                finalQuotation = calcularCotizacionSaaS(calcResult, pricingConfig);
            }

            const newProject: ProjectData = {
                userId: currentUser?.userId || "unknown-user",
                clientName: cName,
                projectName: pName,
                status: "draft",
                elements: elements,
                quotation: finalQuotation
            };

            // 2. Limpieza de datos (Firestore no permite 'undefined')
            const cleanProjectData = JSON.parse(JSON.stringify(newProject));

            const docId = await saveProject(cleanProjectData);
            alert(`¡Proyecto Guardado con éxito!`);
        } catch (error: any) {
            console.error("DEBUG LOCAL SAVE:", error);
            const errorMsg = error?.message || "Error desconocido";
            alert(`Error al guardar: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                deleteSelected();
            }
            if (e.key === 'Escape') selectElement(null);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, deleteSelected, selectElement]);

    return (
        <div className="flex flex-col md:flex-row h-full relative overflow-hidden bg-slate-50">
            {/* ─ Toolbar ─────────────────────────────────────────────── */}
            <div className="md:relative absolute bottom-4 md:bottom-auto left-4 right-4 md:left-auto md:right-auto md:w-20 bg-white/95 backdrop-blur-md md:bg-white border md:border-t-0 md:border-b-0 md:border-l-0 border-slate-200 md:border-r md:rounded-none rounded-2xl flex flex-row md:flex-col items-center p-2 md:py-6 gap-2 shadow-xl md:shadow-soft-sm z-[100] overflow-x-auto shrink-0 touch-pan-x no-scrollbar">
                {/* Active client indicator */}
                {activeClient && (
                    <div className="hidden md:flex items-center gap-1.5 px-2 py-1.5 bg-emerald-50 rounded-xl mb-2 w-full">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[8px] font-bold text-emerald-700 truncate leading-tight">{activeClient.name}</span>
                    </div>
                )}
                <p className="hidden md:block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 shrink-0">Añadir</p>

                <ToolButton
                    icon={<Square className="w-5 h-5" />}
                    label="Ventana"
                    color="indigo"
                    onClick={() => addElement('window')}
                />
                <ToolButton
                    icon={<DoorOpen className="w-5 h-5" />}
                    label="Puerta"
                    color="sky"
                    onClick={() => addElement('door')}
                />

                <div className="w-10 border-t border-slate-100 my-2" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Zoom</p>

                <ToolButton
                    icon={<ZoomIn className="w-5 h-5" />}
                    label="+"
                    color="slate"
                    onClick={() => setZoom(z => Math.min(z + 10, 200))}
                />
                <ToolButton
                    icon={<ZoomOut className="w-5 h-5" />}
                    label="-"
                    color="slate"
                    onClick={() => setZoom(z => Math.max(z - 10, 40))}
                />
                <ToolButton
                    icon={<Maximize2 className="w-5 h-5" />}
                    label="100%"
                    color="slate"
                    onClick={() => setZoom(100)}
                />

                <div className="w-10 border-t border-slate-100 my-2" />

                <ToolButton
                    icon={<Grid className="w-5 h-5" />}
                    label="Grid"
                    color={showGrid ? 'indigo' : 'slate'}
                    onClick={() => setShowGrid(g => !g)}
                    active={showGrid}
                />

                <div className="w-10 border-t border-slate-100 my-2" />

                <ToolButton
                    icon={<Cloud className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} />}
                    label="Guardar"
                    color="sky"
                    onClick={handleSaveCloud}
                />

                {selectedId && (
                    <>
                        <div className="w-10 border-t border-slate-100 my-2" />

                        {selectedElement?.type === 'window' && (
                            <ToolButton
                                icon={<Download className="w-5 h-5" />}
                                label="PDF"
                                color="sky"
                                onClick={handleExportPdf}
                            />
                        )}

                        <ToolButton
                            icon={<Trash2 className="w-5 h-5" />}
                            label="Borrar"
                            color="red"
                            onClick={deleteSelected}
                        />
                    </>
                )}
            </div>

            {/* ─ Canvas Area ───────────────────────────────────────────── */}
            <div
                ref={containerRef}
                className="flex-1 bg-slate-50 overflow-hidden relative"
                style={{ background: '#f8fafc' }}
            >
                {/* Zoom badge */}
                <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-indigo-50/90 backdrop-blur-sm border border-indigo-200 rounded-xl text-xs font-bold text-indigo-600 shadow-soft-sm">
                    {zoom}%
                </div>

                {/* Empty state */}
                {elements.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                        <p className="text-lg font-display font-bold text-indigo-300">Canvas Vacío</p>
                        <p className="text-sm text-indigo-300/70 mt-1 font-medium">Usa la barra izquierda para añadir ventanas o puertas</p>
                    </div>
                )}

                <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
                    <KonvaCanvas
                        ref={stageRef}
                        elements={elements}
                        selectedId={selectedId}
                        onSelect={selectElement}
                        onElementUpdate={updateElement}
                        stageSize={stageSize}
                        showGrid={showGrid}
                    />
                </div>
            </div>

            {/* ─ Properties Panel ──────────────────────────────────────── */}
            <PropertiesPanel />
        </div>
    );
};

// ── Reusable Toolbar Button ──────────────────────────────────────────────────

interface ToolButtonProps {
    icon: React.ReactNode;
    label: string;
    color: 'indigo' | 'sky' | 'slate' | 'red';
    onClick: () => void;
    active?: boolean;
}

const colorMap = {
    indigo: 'hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-indigo-100',
    sky: 'hover:bg-sky-50 hover:text-sky-600 hover:shadow-sky-100',
    slate: 'hover:bg-slate-50 hover:text-slate-700',
    red: 'hover:bg-red-50 hover:text-red-600 hover:shadow-red-100',
};

const activeMap = {
    indigo: 'bg-indigo-100 text-indigo-600',
    sky: 'bg-sky-100 text-sky-600',
    slate: 'bg-slate-100 text-slate-700',
    red: 'bg-red-100 text-red-600',
};

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, color, onClick, active }) => (
    <button
        title={label}
        onClick={onClick}
        className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-slate-400 border border-transparent transition-all shadow-soft-sm ${colorMap[color]} ${active ? activeMap[color] : 'bg-white border-slate-100'}`}
    >
        {icon}
        <span className="text-[8px] font-bold uppercase tracking-wider">{label}</span>
    </button>
);

export default DesignerPage;
