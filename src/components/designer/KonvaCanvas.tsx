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

    const FRAME = 8;
    const baseColor = el.type === 'window' ? '#6366f1' : '#0ea5e9';
    const frameColor = '#1e293b';
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
                {/* Outer frame */}
                <Rect
                    width={vW}
                    height={vH}
                    fill={frameColor}
                    cornerRadius={4}
                    shadowColor="rgba(0,0,0,0.25)"
                    shadowBlur={isSelected ? 20 : 8}
                    shadowOffset={{ x: 0, y: 4 }}
                    shadowOpacity={1}
                    stroke={isSelected ? baseColor : 'transparent'}
                    strokeWidth={2}
                />

                {/* Panels */}
                {el.panels.map((panel, idx) => {
                    const panelWidth = (panel.widthRatio / totalRatio) * (vW - FRAME * 2);
                    const panelX = FRAME + el.panels.slice(0, idx).reduce((acc, p) => acc + (p.widthRatio / totalRatio) * (vW - FRAME * 2), 0);
                    const innerH = vH - FRAME * 2;
                    const sep = idx < el.panels.length - 1;
                    const pW = panelWidth - (sep ? 4 : 0); // usable panel width

                    return (
                        <Group key={panel.id} x={panelX} y={FRAME}>
                            {/* Glass */}
                            <Rect width={pW} height={innerH} fill={glassColor} opacity={0.75} />
                            {/* Panel separator */}
                            {sep && <Rect x={panelWidth - 6} width={4} height={innerH} fill={frameColor} />}
                            {/* Gleam */}
                            <Rect x={4} y={4} width={Math.max(4, pW * 0.3)} height={innerH * 0.3} fill="white" opacity={0.3} cornerRadius={2} listening={false} />

                            {/* ─── Opening Type Visuals ────────────────────── */}
                            {el.type === 'window' && el.openingType === 'fija' && (
                                <>
                                    {/* Fixed window: X-cross pattern (industry standard) */}
                                    <Line
                                        points={[4, 4, pW - 4, innerH - 4]}
                                        stroke="#64748b"
                                        strokeWidth={1.5}
                                        opacity={0.5}
                                        listening={false}
                                    />
                                    <Line
                                        points={[pW - 4, 4, 4, innerH - 4]}
                                        stroke="#64748b"
                                        strokeWidth={1.5}
                                        opacity={0.5}
                                        listening={false}
                                    />
                                </>
                            )}

                            {el.type === 'window' && el.openingType === 'abatible' && (
                                <>
                                    {/* Casement window: triangle from hinge side to center top */}
                                    <Line
                                        points={[
                                            2, innerH - 2,       // bottom-left (hinge)
                                            pW / 2, 2,           // top center (swing peak)
                                            pW - 2, innerH - 2,  // bottom-right (hinge)
                                        ]}
                                        stroke="#6366f1"
                                        strokeWidth={1.5}
                                        opacity={0.55}
                                        dash={[6, 4]}
                                        closed={false}
                                        listening={false}
                                    />
                                    {/* Small arc indicator at top center */}
                                    <Line
                                        points={[pW / 2 - 8, 8, pW / 2, 2, pW / 2 + 8, 8]}
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        opacity={0.7}
                                        listening={false}
                                    />
                                    {/* Handle on the side */}
                                    {pW > 30 && (
                                        <Rect x={pW - 14} y={innerH / 2 - 10} width={6} height={20} fill="#6366f1" opacity={0.6} cornerRadius={3} />
                                    )}
                                </>
                            )}

                            {el.type === 'window' && (el.openingType === 'corrediza' || !el.openingType) && (
                                <>
                                    {/* Sliding window: horizontal arrow indicating slide direction */}
                                    {pW > 40 && (
                                        <>
                                            {/* Center handle */}
                                            <Rect x={pW / 2 - 3} y={innerH / 2 - 10} width={6} height={20} fill="#94a3b8" cornerRadius={3} />
                                            {/* Arrow line */}
                                            <Line
                                                points={[
                                                    pW * 0.2, innerH / 2,
                                                    pW * 0.8, innerH / 2,
                                                ]}
                                                stroke="#94a3b8"
                                                strokeWidth={1.5}
                                                opacity={0.5}
                                                listening={false}
                                            />
                                            {/* Arrow head right */}
                                            <Line
                                                points={[
                                                    pW * 0.75, innerH / 2 - 5,
                                                    pW * 0.8, innerH / 2,
                                                    pW * 0.75, innerH / 2 + 5,
                                                ]}
                                                stroke="#94a3b8"
                                                strokeWidth={1.5}
                                                opacity={0.5}
                                                listening={false}
                                            />
                                            {/* Arrow head left */}
                                            <Line
                                                points={[
                                                    pW * 0.25, innerH / 2 - 5,
                                                    pW * 0.2, innerH / 2,
                                                    pW * 0.25, innerH / 2 + 5,
                                                ]}
                                                stroke="#94a3b8"
                                                strokeWidth={1.5}
                                                opacity={0.5}
                                                listening={false}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            {/* Door handle */}
                            {el.type === 'door' && (
                                <>
                                    <Rect x={panelWidth - 22} y={innerH * 0.35} width={8} height={50} fill="#94a3b8" cornerRadius={4} />
                                    <Rect x={panelWidth - 26} y={innerH * 0.35 + 20} width={14} height={4} fill="#64748b" cornerRadius={2} />
                                </>
                            )}
                        </Group>
                    );
                })}

                {/* Width dimension label */}
                <Text
                    x={0} y={-22}
                    width={vW}
                    align="center"
                    text={`↔  ${(el.width / 1000).toFixed(2)} m`}
                    fontSize={11}
                    fontFamily="Inter, sans-serif"
                    fontStyle="bold"
                    fill={isSelected ? baseColor : '#94a3b8'}
                    listening={false}
                />
                {/* Height dimension label */}
                <Text
                    x={vW + 6}
                    y={vH / 2}
                    rotation={90}
                    text={`↔  ${(el.height / 1000).toFixed(2)} m`}
                    fontSize={11}
                    fontFamily="Inter, sans-serif"
                    fontStyle="bold"
                    fill={isSelected ? baseColor : '#94a3b8'}
                    listening={false}
                />
                {/* Type badge */}
                <Text x={8} y={8} text={el.type === 'window' ? '🪟' : '🚪'} fontSize={14} listening={false} />
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
