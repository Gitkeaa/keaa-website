import { useId, useState } from 'react';

/**
 * A small hover/focus tooltip for inline help — "Reason is mandatory", "Upload the customer
 * quotation PDF", and the like. Keyboard-reachable (shows on focus, not just hover) and linked
 * to its trigger with aria-describedby so a screen reader announces it.
 *
 * The bubble is `bg-navy-900` — a fixed brand navy the `.admin-dark` theme leaves alone, so it
 * reads as the same dark chip in both light and dark. Wrap any element:
 *
 *   <Tooltip label="Reason is mandatory">
 *     <button>Lost</button>
 *   </Tooltip>
 */
export default function Tooltip({ label, children, side = 'top' }) {
  const [show, setShow] = useState(false);
  const id = useId();

  const pos =
    side === 'bottom'
      ? 'top-full left-1/2 -translate-x-1/2 mt-2'
      : side === 'left'
      ? 'right-full top-1/2 -translate-y-1/2 mr-2'
      : side === 'right'
      ? 'left-full top-1/2 -translate-y-1/2 ml-2'
      : 'bottom-full left-1/2 -translate-x-1/2 mb-2';

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      <span aria-describedby={show ? id : undefined} className="inline-flex">
        {children}
      </span>
      {show && (
        <span
          role="tooltip"
          id={id}
          className={`pointer-events-none absolute z-50 w-max max-w-[14rem] rounded-md bg-navy-900 px-2.5 py-1.5 text-center text-xs font-medium leading-snug text-white shadow-lg ${pos}`}
        >
          {label}
        </span>
      )}
    </span>
  );
}
