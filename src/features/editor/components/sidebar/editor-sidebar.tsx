import {useCallback, useEffect, useMemo, useRef} from 'react';
import {formatShortcutTooltip} from '@/features/editor/lib/shortcut-definitions';
import {useAutoBlurController} from '@/features/editor/hooks/use-auto-blur-controller';
import type {BlurType} from '@/features/editor/state/types';
import {useEditorStore} from '@/features/editor/state/use-editor-store';
import {BlurTemplatePanel} from './blur-template-panel';
import {BlurSettingsSection} from './editor-sidebar/blur-settings-section';
import {ShortcutsSection} from './editor-sidebar/shortcuts-section';

interface EditorSidebarProps {
  selectedStrokeIndices: number[];
}

export function EditorSidebar({selectedStrokeIndices}: EditorSidebarProps) {
  const pendingSelectedStrengthHistoryRef = useRef(false);
  const pendingSelectedRadiusHistoryRef = useRef(false);

  const image1 = useEditorStore((state) => state.image1);
  const image2 = useEditorStore((state) => state.image2);
  const imageWidth = useEditorStore((state) => state.imageWidth);
  const imageHeight = useEditorStore((state) => state.imageHeight);
  const blurType = useEditorStore((state) => state.blurType);
  const blurStrokeShape = useEditorStore((state) => state.blurStrokeShape);
  const brushRadius = useEditorStore((state) => state.brushRadius);
  const brushStrength = useEditorStore((state) => state.brushStrength);
  const blurStrokes = useEditorStore((state) => state.blurStrokes);
  const splitRatio = useEditorStore((state) => state.splitRatio);
  const splitDirection = useEditorStore((state) => state.splitDirection);
  const showBlurOutlines = useEditorStore((state) => state.showBlurOutlines);
  const historyIndex = useEditorStore((state) => state.historyIndex);

  const setBlurType = useEditorStore((state) => state.setBlurType);
  const setBlurStrokeShape = useEditorStore((state) => state.setBlurStrokeShape);
  const setBrushRadius = useEditorStore((state) => state.setBrushRadius);
  const setBrushStrength = useEditorStore((state) => state.setBrushStrength);
  const updateBlurStrokesAtIndices = useEditorStore((state) => state.updateBlurStrokesAtIndices);
  const appendBlurStrokes = useEditorStore((state) => state.appendBlurStrokes);
  const pushHistorySnapshot = useEditorStore((state) => state.pushHistorySnapshot);
  const clearBlurStrokes = useEditorStore((state) => state.clearBlurStrokes);
  const setShowBlurOutlines = useEditorStore((state) => state.setShowBlurOutlines);
  const openShortcutsModal = useEditorStore((state) => state.openShortcutsModal);

  const modeTooltip = 'Hold Shift to temporarily switch modes';
  const blurTypeTooltip = formatShortcutTooltip('Toggle blur type', ['toggle-blur-type']);
  const outlinesTooltip = formatShortcutTooltip('Toggle outlines', ['toggle-outlines']);
  const radiusTooltip = formatShortcutTooltip('Radius +/-', ['radius-step']);
  const strengthTooltip = formatShortcutTooltip('Strength +/-', ['strength-step']);
  const shortcutsTooltip = formatShortcutTooltip('Shortcuts', ['shortcuts-modal']);
  const autoBlurTooltip = formatShortcutTooltip('Auto blur text patterns', ['open-auto-blur-menu']);

  const validSelectedStrokeIndices = useMemo(() => {
    const unique = [...new Set(selectedStrokeIndices)];
    return unique
      .filter((index) => Number.isInteger(index))
      .filter((index) => index >= 0 && index < blurStrokes.length);
  }, [blurStrokes.length, selectedStrokeIndices]);

  const hasSelectedStrokes = validSelectedStrokeIndices.length > 0;
  const selectedSourceStroke = hasSelectedStrokes
    ? (blurStrokes[validSelectedStrokeIndices[0]] ?? null)
    : null;
  const displayedBlurType = selectedSourceStroke?.blurType ?? blurType;
  const displayedStrength = selectedSourceStroke?.strength ?? brushStrength;
  const displayedRadius = selectedSourceStroke?.radius ?? brushRadius;

  const autoBlur = useAutoBlurController({
    image1,
    image2,
    imageWidth,
    imageHeight,
    splitDirection,
    splitRatio,
    blurType,
    brushStrength,
    brushRadius,
    historyIndex,
    appendBlurStrokes,
    setShowBlurOutlines,
  });
  const autoBlurDisabled = !autoBlur.canAutoBlur || autoBlur.isAutoBlurPending;

  const handleBlurTypeChange = useCallback(
    (nextType: BlurType) => {
      if (hasSelectedStrokes) {
        updateBlurStrokesAtIndices(
          validSelectedStrokeIndices,
          {blurType: nextType},
          {commitHistory: true},
        );
        return;
      }
      setBlurType(nextType);
    },
    [hasSelectedStrokes, setBlurType, updateBlurStrokesAtIndices, validSelectedStrokeIndices],
  );

  const handleStrengthChange = useCallback(
    (nextStrength: number) => {
      if (hasSelectedStrokes) {
        const changed = updateBlurStrokesAtIndices(
          validSelectedStrokeIndices,
          {strength: nextStrength},
          {commitHistory: false},
        );
        if (changed) {
          pendingSelectedStrengthHistoryRef.current = true;
        }
        return;
      }
      setBrushStrength(nextStrength);
    },
    [hasSelectedStrokes, setBrushStrength, updateBlurStrokesAtIndices, validSelectedStrokeIndices],
  );

  const handleStrengthCommit = useCallback(
    (nextStrength: number) => {
      if (!hasSelectedStrokes) {
        setBrushStrength(nextStrength);
        return;
      }

      const changed = updateBlurStrokesAtIndices(
        validSelectedStrokeIndices,
        {strength: nextStrength},
        {commitHistory: false},
      );
      if (changed) {
        pendingSelectedStrengthHistoryRef.current = true;
      }

      if (pendingSelectedStrengthHistoryRef.current) {
        pushHistorySnapshot();
        pendingSelectedStrengthHistoryRef.current = false;
      }
    },
    [
      hasSelectedStrokes,
      pushHistorySnapshot,
      setBrushStrength,
      updateBlurStrokesAtIndices,
      validSelectedStrokeIndices,
    ],
  );

  const handleRadiusChange = useCallback(
    (nextRadius: number) => {
      if (hasSelectedStrokes) {
        const changed = updateBlurStrokesAtIndices(
          validSelectedStrokeIndices,
          {radius: nextRadius},
          {commitHistory: false},
        );
        if (changed) {
          pendingSelectedRadiusHistoryRef.current = true;
        }
        return;
      }
      setBrushRadius(nextRadius);
    },
    [hasSelectedStrokes, setBrushRadius, updateBlurStrokesAtIndices, validSelectedStrokeIndices],
  );

  const handleRadiusCommit = useCallback(
    (nextRadius: number) => {
      if (!hasSelectedStrokes) {
        setBrushRadius(nextRadius);
        return;
      }

      const changed = updateBlurStrokesAtIndices(
        validSelectedStrokeIndices,
        {radius: nextRadius},
        {commitHistory: false},
      );
      if (changed) {
        pendingSelectedRadiusHistoryRef.current = true;
      }

      if (pendingSelectedRadiusHistoryRef.current) {
        pushHistorySnapshot();
        pendingSelectedRadiusHistoryRef.current = false;
      }
    },
    [
      hasSelectedStrokes,
      pushHistorySnapshot,
      setBrushRadius,
      updateBlurStrokesAtIndices,
      validSelectedStrokeIndices,
    ],
  );

  useEffect(() => {
    if (!hasSelectedStrokes) {
      pendingSelectedStrengthHistoryRef.current = false;
      pendingSelectedRadiusHistoryRef.current = false;
    }
  }, [hasSelectedStrokes]);

  return (
    <aside
      className="border-border flex h-full w-72 flex-shrink-0 flex-col overflow-y-auto border-r-2"
      style={{background: 'oklch(var(--sidebar-background))'}}
    >
      <BlurSettingsSection
        modeTooltip={modeTooltip}
        blurTypeTooltip={blurTypeTooltip}
        outlinesTooltip={outlinesTooltip}
        radiusTooltip={radiusTooltip}
        strengthTooltip={strengthTooltip}
        outlinesTogglePressed={showBlurOutlines}
        blurStrokeShape={blurStrokeShape}
        displayedBlurType={displayedBlurType}
        displayedStrength={displayedStrength}
        displayedRadius={displayedRadius}
        onBlurStrokeShapeChange={setBlurStrokeShape}
        onToggleOutlines={() => setShowBlurOutlines(!showBlurOutlines)}
        onClearBlurStrokes={clearBlurStrokes}
        onBlurTypeChange={handleBlurTypeChange}
        onStrengthChange={handleStrengthChange}
        onStrengthCommit={handleStrengthCommit}
        onRadiusChange={handleRadiusChange}
        onRadiusCommit={handleRadiusCommit}
        onAutoBlurEmails={autoBlur.handleAutoBlurEmails}
        onAutoBlurPhoneNumbers={autoBlur.handleAutoBlurPhoneNumbers}
        onAutoBlurCustomText={autoBlur.handleAutoBlurCustomText}
        onDeleteAutoBlurCustomText={autoBlur.handleDeleteAutoBlurCustomText}
        autoBlurStrength={brushStrength}
        onAutoBlurStrengthChange={setBrushStrength}
        autoBlurApplyOnLoadEmail={autoBlur.autoBlurDefaults.email}
        autoBlurApplyOnLoadPhone={autoBlur.autoBlurDefaults.phone}
        isAutoBlurApplyOnLoadCustomText={autoBlur.isAutoBlurCustomTextDefaultEnabled}
        onToggleAutoBlurApplyOnLoadEmail={autoBlur.toggleAutoBlurEmailDefault}
        onToggleAutoBlurApplyOnLoadPhone={autoBlur.toggleAutoBlurPhoneDefault}
        onToggleAutoBlurApplyOnLoadCustomText={autoBlur.toggleAutoBlurCustomTextDefault}
        savedAutoBlurCustomTexts={autoBlur.savedAutoBlurCustomTexts}
        isAutoBlurPending={autoBlur.isAutoBlurPending}
        autoBlurDisabled={autoBlurDisabled}
        autoBlurTooltip={autoBlurTooltip}
        autoBlurStatus={autoBlur.autoBlurStatus}
      />
      <BlurTemplatePanel />

      <ShortcutsSection
        shortcutsTooltip={shortcutsTooltip}
        onOpenShortcutsModal={openShortcutsModal}
      />
    </aside>
  );
}
