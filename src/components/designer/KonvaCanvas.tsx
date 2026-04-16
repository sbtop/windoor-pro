import React, { useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Text, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { DesignElement } from '../../types';

// ── Props ────────────────────────────────────────────────────────────────────

interface KonvaCanvasProps {
    elements: DesignElement[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onElementUpdate: (id: string, changes: Partial<DesignElement>) => void;
    stageSize: { width: number; height: number };
    showGrid?: boolean;
}

// ── Grid ─────────────────────────────────────────────────────────────────────

const GRID_SIZE = 20;

const GridLines: React.FC<{ width: number; height: number }> = ({ width, height }) => {
    const lines: React.ReactElement[] = [];
    for (let x = 0; x < width; x += GRID_SIZE) {
        lines.push(<Line key={`v${x}`} points={[x, 0, x, height]} stroke="#e2e8f0" strokeWidth={0.5} listening={false} />);
    }
    for (let y = 0; y < height; y += GRID_SIZE) {
        lines.push(<Line key={`h${y}`} points={[0, y, width, y]} stroke="#e2e8f0" strokeWidth={0.5} listening={false} />);
    }
    return <>{lines}</>;
};

// ── Single Element Shape ─────────────────────────────────────────────────────

interface ElementShapeProps {
    el: DesignElement;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (changes: Partial<DesignElement>) => void;
}

const VISUAL_SCALE = 0.15; // 1m (1000mm) = 150px on screen. Allows up to 7m to fit in ~1050px.

const ElementShape: React.FC<ElementShapeProps> = ({ el, isSelected, onSelect, onUpdate }) => {
    const shapeRef = useRef<Konva.Group>(null);
    const trRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    const FRAME = 10;
    const baseColor = el.type === 'window' ? '#6366f1' : '#0ea5e9';
    const frameColor = '#0f172a'; // Deep obsidian
    const glassColor = el.type === 'window' ? '#bae6fd' : '#dbeafe';

    const vW = el.width * VISUAL_SCALE;
    const vH = el.height * VISUAL_SCALE;
    const vX = el.x * VISUAL_SCALE;
    const vY = el.y * VISUAL_SCALE;

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        onUpdate({ x: e.target.x() / VISUAL_SCALE, y: e.target.y() / VISUAL_SCALE });
    };

    const handleTransformEnd = () => {
        const node = shapeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        onUpdate({
            x: node.x() / VISUAL_SCALE,
            y: node.y() / VISUAL_SCALE,
            width: Math.max(100, (node.width() * scaleX) / VISUAL_SCALE),
            height: Math.max(100, (node.height() * scaleY) / VISUAL_SCALE),
        });
    };

    const totalRatio = el.panels.reduce((acc, p) => acc + p.widthRatio, 0);

    return (
        <>
            <Group
                ref={shapeRef}
                x={vX}
                y={vY}
                width={vW}
                height={vH}
                draggable
                onClick={onSelect}
                onTap={onSelect}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
            >
                {/* Real Outer Shadow Layer */}
                <Rect
                    width={vW}
                    height={vH}
                    fill="#000"
                    opacity={0.15}
                    cornerRadius={6}
                    shadowColor="#000"
                    shadowBlur={25}
                    shadowOpacity={0.4}
                    shadowOffset={{ x: 0, y: 12 }}
                    listening={false}
                />

                {/* Main Frame */}
                <Rect
                    width={vW}
                    height={vH}
                    fill={frameColor}
                    cornerRadius={6}
                    stroke={isSelected ? baseColor : '#334155'}
                    strokeWidth={isSelected ? 3 : 1}
                />

                {/* Panels Area */}
                {el.panels.map((panel, idx) => {
                    const panelWidth = (panel.widthRatio / totalRatio) * (vW - FRAME * 2);
                    const panelX = FRAME + el.panels.slice(0, idx).reduce((acc, p) => acc + (p.widthRatio / totalRatio) * (vW - FRAME * 2), 0);
                    const innerH = vH - FRAME * 2;
                    const sep = idx < el.panels.length - 1;
                    const pW = panelWidth - (sep ? 2 : 0);

                    return (
                        <Group key={panel.id} x={panelX} y={FRAME}>
                            {/* Glass Layer with Gradient */}
                            <Rect 
                                width={pW} 
                                height={innerH} 
                                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                                fillLinearGradientEndPoint={{ x: pW, y: innerH }}
                                fillLinearGradientColorStops={[0, '#bae6fd', 1, '#7dd3fc']}
                                opacity={0.8}
                                cornerRadius={idx === 0 ? 2 : 0}
                            />
                            
                            {/* Panel Inner Border */}
                            <Rect 
                                width={pW} 
                                height={innerH} 
                                stroke={frameColor} 
                                strokeWidth={2}
                                opacity={0.3}
                                listening={false}
                            />

                            {/* Realistic Glass Gleam */}
                            <Line
                                points={[5, 15, pW - 15, innerH - 5]}
                                stroke="#fff"
                                strokeWidth={1}
                                opacity={0.4}
                                listening={false}
                            />

                            {/* ─── Opening Type Visuals ────────────────────── */}
                            {el.type === 'window' && el.openingType === 'fija' && (
                                <Group opacity={0.4}>
                                    <Line points={[10, 10, pW - 10, innerH - 10]} stroke="#0f172a" strokeWidth={0.5} />
                                    <Line points={[pW - 10, 10, 10, innerH - 10]} stroke="#0f172a" strokeWidth={0.5} />
                                </Group>
                            )}

                            {el.type === 'window' && el.openingType === 'abatible' && (
                                <Group opacity={0.6}>
                                    <Line
                                        points={[2, innerH - 2, pW / 2, 8, pW - 2, innerH - 2]}
                                        stroke={baseColor}
                                        strokeWidth={1.5}
                                        dash={[8, 5]}
                                    />
                                    {/* Designer Dot for Handle */}
                                    <Rect x={pW - 12} y={innerH / 2 - 8} width={4} height={16} fill={baseColor} cornerRadius={2} />
                                </Group>
                            )}

                            {el.type === 'window' && (el.openingType === 'corrediza' || !el.openingType) && (
                                <Group opacity={0.5}>
                                    <Rect x={pW / 2 - 2} y={innerH / 2 - 12} width={4} height={24} fill="#475569" cornerRadius={2} />
                                    <Line points={[pW * 0.3, innerH / 2, pW * 0.7, innerH / 2]} stroke="#475569" strokeWidth={1} />
                                </Group>
                            )}

                            {/* Door Handle Premium */}
                            {el.type === 'door' && (
                                <Group x={pW - 24} y={innerH * 0.45}>
                                    <Rect width={10} height={60} fill="#f1f5f9" cornerRadius={4} />
                                    <Rect x={-10} y={25} width={24} height={6} fill="#f1f5f9" cornerRadius={3} />
                                </Group>
                            )}
                        </Group>
                    );
                })}

                {/* Dimensions Labels - Premium Typography */}
                <Group y={-35} x={0}>
                    <Rect width={vW} height={24} fill="#0f172a" cornerRadius={12} shadowBlur={10} shadowOpacity={0.1} />
                    <Text
                        width={vW}
                        height={24}
                        verticalAlign="middle"
                        align="center"
                        text={`${(el.width / 1000).toFixed(2)} m`}
                        fontSize={10}
                        fontFamily="Outfit, Inter, sans-serif"
                        fontStyle="bold"
                        fill="#fff"
                        listening={false}
                    />
                </Group>

                <Group x={vW + 15} y={0}>
                    <Rect width={24} height={vH} fill="#0f172a" cornerRadius={12} shadowBlur={10} shadowOpacity={0.1} />
                    <Text
                        width={vH}
                        height={24}
                        rotation={90}
                        offsetX={vH / 2}
                        offsetY={-vH / 2}
                        verticalAlign="middle"
                        align="center"
                        text={`${(el.height / 1000).toFixed(2)} m`}
                        fontSize={10}
                        fontFamily="Outfit, Inter, sans-serif"
                        fontStyle="bold"
                        fill="#fff"
                        listening={false}
                    />
                </Group>
            </Group>

            {isSelected && (
                <Transformer
                    ref={trRef}
                    borderStroke={baseColor}
                    borderStrokeWidth={2}
                    borderDash={[4, 2]}
                    anchorFill="white"
                    anchorStroke={baseColor}
                    anchorSize={10}
                    anchorCornerRadius={3}
                    rotateEnabled={false}
                    keepRatio={false}
                    boundBoxFunc={(_, newBox) => ({
                        ...newBox,
                        width: Math.max(60, newBox.width),
                        height: Math.max(60, newBox.height),
                    })}
                />
            )}
        </>
    );
};

// ── Stage ────────────────────────────────────────────────────────────────────

const KonvaCanvas = React.forwardRef<Konva.Stage, KonvaCanvasProps>(({
    elements, selectedId, onSelect, onElementUpdate, stageSize, showGrid = true
}, ref) => {
    const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (e.target === e.target.getStage()) onSelect(null);
    }, [onSelect]);

    return (
        <Stage
            ref={ref}
            width={stageSize.width}
            height={stageSize.height}
            onClick={handleStageClick}
            onTap={handleStageClick}
        >
            {showGrid && (
                <Layer listening={false}>
                    <GridLines width={stageSize.width} height={stageSize.height} />
                </Layer>
            )}
            <Layer>
                {elements.map(el => (
                    <ElementShape
                        key={el.id}
                        el={el}
                        isSelected={selectedId === el.id}
                        onSelect={() => onSelect(el.id)}
                        onUpdate={(changes) => onElementUpdate(el.id, changes)}
                    />
                ))}
            </Layer>
        </Stage>
    );
});

KonvaCanvas.displayName = 'KonvaCanvas';

export default KonvaCanvas;
