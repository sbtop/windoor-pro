import React, { useState, useRef } from 'react';
import { Camera, Plus, X, Maximize2, Image as ImageIcon, Upload } from 'lucide-react';

interface ProjectGalleryProps {
    photos: string[];
    // Now receives the base64 string of the selected file
    onAddPhoto?: (base64: string) => void;
    onRemovePhoto?: (index: number) => void;
}

const ProjectGallery: React.FC<ProjectGalleryProps> = ({ photos, onAddPhoto, onRemovePhoto }) => {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Convert the selected file to a base64 string and pass it up
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onAddPhoto) return;

        // Validate type
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen (JPG, PNG, WEBP, etc.)');
            return;
        }

        // Warn if file is very large (> 3 MB)
        if (file.size > 3 * 1024 * 1024) {
            const ok = confirm(
                `La imagen pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Las imágenes muy grandes consumen mucho espacio en almacenamiento local.\n¿Deseas continuar?`
            );
            if (!ok) return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            onAddPhoto(base64);
            setUploading(false);
        };
        reader.onerror = () => {
            alert('Error al leer el archivo');
            setUploading(false);
        };
        reader.readAsDataURL(file);

        // Reset input so the same file can be re-selected
        e.target.value = '';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-slate-800">Galería de Obra</h3>
                    {photos.length > 0 && (
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {photos.length} foto{photos.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Hidden real file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                            Subiendo...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            Subir Foto
                        </>
                    )}
                </button>
            </div>

            {photos.length === 0 ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] text-center cursor-pointer hover:border-sky-300 hover:bg-sky-50/30 transition-all group"
                >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:shadow-md transition-shadow">
                        <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-sky-300 transition-colors" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">No hay fotos en este proyecto</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                        Haz clic aquí o en "Subir Foto" para añadir evidencia fotográfica de la instalación.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((src, index) => (
                        <div key={index} className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md">
                            <img
                                src={src}
                                alt={`Obra ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                            {/* Overlay actions */}
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <button
                                    onClick={() => setSelectedPhoto(src)}
                                    className="p-2 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/40 transition-colors"
                                    title="Ver en pantalla completa"
                                >
                                    <Maximize2 className="w-5 h-5" />
                                </button>
                                {onRemovePhoto && (
                                    <button
                                        onClick={() => onRemovePhoto(index)}
                                        className="p-2 bg-red-500/80 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition-colors"
                                        title="Eliminar foto"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Add more button within the grid */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-sky-300 hover:bg-sky-50/30 transition-all group"
                    >
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                            <Plus className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 group-hover:text-sky-500 transition-colors">
                            Agregar foto
                        </span>
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={selectedPhoto}
                        alt="Zoom Obra"
                        className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500"
                    />
                </div>
            )}
        </div>
    );
};

export default ProjectGallery;
