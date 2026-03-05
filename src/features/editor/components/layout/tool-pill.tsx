import {Droplets, Hand, MousePointer2} from 'lucide-react';
import {ShortcutTooltip} from '@/features/editor/components/common/shortcut-tooltip';
import type {ActiveTool} from '@/features/editor/state/types';
import {useEditorStore} from '@/features/editor/state/use-editor-store';

interface ToolPillButton {
  label: 'Drag' | 'Select' | 'Blur';
  tool: ActiveTool;
  icon: typeof Hand;
  tooltip: string;
}

const TOOL_BUTTONS: ToolPillButton[] = [
  {label: 'Drag', tool: 'drag', icon: Hand, tooltip: 'Alt + Mouseclick'},
  {label: 'Select', tool: 'select', icon: MousePointer2, tooltip: 'Select'},
  {label: 'Blur', tool: 'blur', icon: Droplets, tooltip: 'Blur'},
];

export function ToolPill() {
  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);

  return (
    <div
      data-testid="tool-pill"
      className="tool-pill border-border/60 bg-card/90 pointer-events-auto flex items-center gap-0.5 rounded-full border p-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md"
    >
      {TOOL_BUTTONS.map(({label, tool, icon: Icon, tooltip}) => (
        <ShortcutTooltip key={tool} content={tooltip}>
          <button
            type="button"
            aria-label={label}
            aria-pressed={activeTool === tool}
            onClick={() => setActiveTool(tool)}
            className={`tool-pill-button focus-visible:ring-ring flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-0 ${
              activeTool === tool
                ? 'bg-secondary text-foreground shadow-[inset_0_0_0_1px_oklch(var(--border)/0.45)]'
                : 'text-muted-foreground hover:bg-secondary/35 hover:text-foreground bg-transparent'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        </ShortcutTooltip>
      ))}
    </div>
  );
}
