import { useEffect, useId, useRef, useState } from 'react';
import { headerControlCls } from './headerControl';

/**
 * The shared shell behind the header's language and region controls.
 *
 * Both need the same three behaviours and they are easy to get subtly wrong twice, so they
 * live here once: close on outside pointer-down, close on Escape (returning focus to the
 * trigger, which is what keyboard users expect), and expose the `aria-expanded` /
 * `aria-controls` pair that makes the trigger read as a real disclosure button.
 *
 * `pointerdown` rather than `click` for the outside handler: a `click` listener fires after
 * the target's own handler, so clicking the OTHER header popover's trigger would close this
 * one and immediately reopen it. Reacting on pointerdown closes this panel before the other
 * trigger's click ever runs.
 *
 * Positioning is right-anchored (`right-0`) because every consumer sits in the header's
 * right-hand action cluster — a left-anchored panel would overflow the viewport there.
 */
export default function HeaderPopover({
  label,
  srLabel,
  children,
  panelClassName = 'w-72',
  align = 'right',
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={srLabel}
        className={headerControlCls(open)}
      >
        {label}
      </button>

      {open && (
        <div
          id={panelId}
          className={`absolute top-full z-50 mt-2 overflow-hidden rounded-card border border-border bg-white shadow-cardHover ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${panelClassName}`}
        >
          {/* Children receive `close` so a selection can dismiss the panel itself. */}
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}
