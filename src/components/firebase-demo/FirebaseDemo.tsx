import React, { useState, useEffect } from 'react';
import { loginUser, logoutUser, subscribeToAuthChanges } from '../../lib/firebase/auth';
import { saveProject, getUserProjects, ProjectData } from '../../lib/firebase/db';
import { DEFAULT_WINDOW, DesignElement } from '../../types';
import { DEFAULT_PRICING_CONFIG, calcularCotizacionSaaS } from '../../services/pricing';
import { calcularMaterialesVentana } from '../../services/manufacturing';
import { User } from 'firebase/auth';

/**
 * 💡 ESTE ES UN COMPONENTE DE EJEMPLO
 * Muestra cómo integrar la Autenticación y la Base de Datos
 * en la lógica de React de WinDoor SaaS.
 */
const FirebaseDemo: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // 1. Escuchar cambios en la autenticación
    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((currentUser) => {
            setUser(currentUser);
            setLoading(false);

            // Si el usuario inicia sesión, cargamos sus proyectos automáticamente
            if (currentUser) {
                fetchProjects(currentUser.uid);
            } else {
                setProjects([]);
            }
        });

        return () => unsubscribe(); // Limpiamos el listener al desmontar
    }, []);

    const fetchProjects = async (uid: string) => {
        try {
            const data = await getUserProjects(uid);
            setProjects(data);
        } catch (error) {
            console.error("Error cargando proyectos:", error);
        }
    };

    const handleLoginEjemplo = async () => {
        try {
            // En la vida real, usarías form inputs. 
            // Si no existe este usuario, fallará. Asegúrate de registrar uno con `registerUser(email, pw)`.
            await loginUser('test@windoor.com', '123456');
        } catch (error) {
            alert("Fallo el login. Quizá necesitas crear el usuario en tu consola de Firebase primero.");
        }
    };

    const handleGuardarProyectoEjemplo = async () => {
        if (!user) return alert("Debes iniciar sesión primero");

        // Simulamos un proyecto de ventana con sus medidas y cotización
        const mockWindow: DesignElement = {
            ...DEFAULT_WINDOW,
            id: 'mock-1',
            x: 50,
            y: 50,
            width: 2500,
            height: 1800
        };

        // Calculamos materiales
        const calcResult = calcularMaterialesVentana({
            ancho: mockWindow.width,
            alto: mockWindow.height,
            tipo: 'corrediza',
            hojas: 2
        });

        // Cotizamos usando nuestro SaaS
        const quotation = calcularCotizacionSaaS(calcResult, DEFAULT_PRICING_CONFIG);

        const newProject: ProjectData = {
            userId: user.uid,
            clientName: "Cliente Demo de React",
            projectName: "Ventanal Terraza",
            status: "draft",
            elements: [mockWindow], // Aquí van los JSONs de Konva
            quotation: quotation    // La cotización exacta
        };

        try {
            const savedId = await saveProject(newProject);
            alert(`¡Proyecto guardado con éxito! ID: ${savedId}`);

            // Recargar la lista
            fetchProjects(user.uid);
        } catch (error) {
            alert("Error guardando proyecto en Firestore");
        }
    };

    if (loading) return <div>Iniciando Firebase...</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow mt-10">
            <h2 className="text-xl font-bold mb-4">Integración Firebase (Ejemplo)</h2>

            {!user ? (
                <div>
                    <p className="mb-4 text-slate-500">No hay sesión activa.</p>
                    <button
                        onClick={handleLoginEjemplo}
                        className="bg-sky-600 text-white px-4 py-2 rounded font-bold"
                    >
                        Log in (test@windoor.com)
                    </button>
                </div>
            ) : (
                <div>
                    <p className="mb-4 text-emerald-600 font-bold">Autenticado como: {user.email}</p>
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={handleGuardarProyectoEjemplo}
                            className="bg-slate-900 text-white px-4 py-2 rounded font-bold"
                        >
                            Guardar Nuevo Proyecto con Cotización
                        </button>
                        <button
                            onClick={logoutUser}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded font-bold"
                        >
                            Cerrar Sesión
                        </button>
                    </div>

                    <h3 className="font-bold text-lg mb-2">Mis Proyectos Cloud ({projects.length}):</h3>
                    <ul className="space-y-3">
                        {projects.map(p => (
                            <li key={p.id} className="p-3 border rounded border-slate-200">
                                <p className="font-bold">{p.projectName}</p>
                                <p className="text-sm text-slate-500">Cliente: {p.clientName}</p>
                                {p.quotation && (
                                    <p className="text-sm font-bold text-emerald-600 mt-2">
                                        Cotización Total: ${p.quotation.totales.precioVenta.toLocaleString()} MXN
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FirebaseDemo;
