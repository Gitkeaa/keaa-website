import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { visitorLanguage } from '../i18n/languages';
import { useLT } from '../i18n/LocaleContext';

/* ------------------------------------------------------------------ *
 * Dragging
 *
 * The assistant can be picked up and parked anywhere — by its header when open, by the
 * launcher when closed — because it otherwise sits on top of whatever is in the
 * bottom-right corner of the page the visitor is actually reading.
 *
 * The position is stored as an offset from the RIGHT and BOTTOM edges, not left/top. That
 * is what keeps the panel growing upward out of the launcher exactly as it does in its
 * default corner; anchoring by top would push the launcher off the bottom of the screen the
 * moment the panel opened.
 * ------------------------------------------------------------------ */
const POS_KEY = 'keaa:chat-position';
/** Pointer travel, in px, that makes a press a drag rather than a click on the launcher. */
const DRAG_SLOP = 4;
/** However far it is dragged, this much of the launcher stays on screen. */
const KEEP_VISIBLE = 72;
/**
 * Smallest gap between the widget and the edge it is pushed against. Zero, so it parks
 * genuinely flush instead of stopping short with a sliver of page showing beside it — that
 * leftover strip reads as a bug rather than a margin. The launcher's glow ring sits 3px
 * outside the button and gets trimmed by the viewport at this point, which is the intended
 * look for something pushed hard against the edge.
 */
const EDGE = 0;
/**
 * The gap the open panel keeps either side of it once it is as wide as the screen allows.
 * Matches the panel's own `w-[calc(100vw-3rem)]` gutter and the default `right-6` inset, so
 * the three cannot disagree and leave one side wider than the other.
 */
const PANEL_MIN_SIDE = 24;

/** Both guarded: storage throws outright in a privacy-locked browser, and a parked
 *  assistant is a convenience that must never take the widget down with it. */
function readPos() {
  try {
    const raw = window.localStorage.getItem(POS_KEY);
    const p = raw ? JSON.parse(raw) : null;
    return p && Number.isFinite(p.right) && Number.isFinite(p.bottom) ? p : null;
  } catch {
    return null;
  }
}

function writePos(p) {
  try {
    if (p) window.localStorage.setItem(POS_KEY, JSON.stringify(p));
    else window.localStorage.removeItem(POS_KEY);
  } catch {
    /* full, disabled or private mode — the position still holds for this session */
  }
}

function useDraggable(ref) {
  // null = the default corner, which also tracks the consent bar. A dragged widget opts
  // out of that and holds wherever it was put.
  const [pos, setPos] = useState(null);
  /**
   * Where the visitor actually PUT it, kept separate from `pos`, which is that position
   * clamped to whatever the widget currently measures. The two differ whenever the panel is
   * open: the launcher is 56px tall and the open panel is over 600, so a spot that is fine
   * for the closed launcher can push the panel off the top of the screen. Clamping for
   * display and remembering the intent separately means it returns to the chosen spot when
   * the panel closes, instead of creeping down the screen every time it is opened.
   */
  const desired = useRef(null);
  const moved = useRef(false);

  const clamp = useCallback(
    (p) => {
      const el = ref.current;
      const w = el?.offsetWidth ?? KEEP_VISIBLE;
      const h = el?.offsetHeight ?? KEEP_VISIBLE;
      const bottom = Math.min(Math.max(EDGE, p.bottom), Math.max(EDGE, window.innerHeight - h - EDGE));

      /**
       * Once the open panel is as wide as the screen allows there is no meaningful left or
       * right any more — dragging it can only make one margin bigger than the other, which is
       * what made it look lopsided on a narrow window. At that width it centres instead, so
       * the gap either side is identical.
       */
      if (w >= window.innerWidth - 2 * PANEL_MIN_SIDE) {
        return { right: Math.max(0, Math.round((window.innerWidth - w) / 2)), bottom };
      }

      return {
        right: Math.min(Math.max(EDGE, p.right), Math.max(EDGE, window.innerWidth - w - EDGE)),
        bottom,
      };
    },
    [ref],
  );

  /** Re-apply the clamp against the widget's current size. */
  const reclamp = useCallback(() => {
    if (!desired.current) return;
    setPos(clamp(desired.current));
  }, [clamp]);

  // Read on mount, not in the initialiser: localStorage does not exist during prerender,
  // and starting from null keeps the server markup and the first client render identical.
  useEffect(() => {
    const stored = readPos();
    if (stored) {
      desired.current = stored;
      setPos(clamp(stored));
    }
  }, [clamp]);

  // A rotate or a resize must not strand the widget off-screen.
  useEffect(() => {
    if (!pos) return undefined;
    window.addEventListener('resize', reclamp);
    return () => window.removeEventListener('resize', reclamp);
  }, [pos, reclamp]);

  /**
   * Window-level listeners rather than setPointerCapture: capturing on the wrapper can
   * retarget the click that follows, which would stop the launcher opening the chat.
   */
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el = ref.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const offR = r.right - e.clientX;
    const offB = r.bottom - e.clientY;
    const x0 = e.clientX;
    const y0 = e.clientY;
    moved.current = false;

    const onMove = (ev) => {
      if (!moved.current && Math.hypot(ev.clientX - x0, ev.clientY - y0) < DRAG_SLOP) return;
      moved.current = true;
      // Held to the viewport with only the launcher's footprint in mind, so a drag past the
      // edge parks it AT the edge instead of storing a wild offset that a later, larger
      // screen would honour literally.
      const raw = {
        right: window.innerWidth - (ev.clientX + offR),
        bottom: window.innerHeight - (ev.clientY + offB),
      };
      desired.current = {
        right: Math.min(Math.max(EDGE, raw.right), Math.max(EDGE, window.innerWidth - KEEP_VISIBLE)),
        bottom: Math.min(Math.max(EDGE, raw.bottom), Math.max(EDGE, window.innerHeight - KEEP_VISIBLE)),
      };
      setPos(clamp(desired.current));
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (moved.current) writePos(desired.current);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  /** Send it back to the default corner. Bound to a double-click on either handle. */
  const reset = () => {
    desired.current = null;
    setPos(null);
    writePos(null);
  };

  /**
   * True when a DRAGGED widget sits in the left half of the screen; it drives which way the
   * open panel's toggle row aligns. The un-dragged home position is responsive (left on
   * mobile, right from `sm` up) and is handled with CSS at the row instead, so this stays
   * false until the widget is actually moved.
   */
  const onLeft =
    pos != null && typeof window !== 'undefined' && pos.right > window.innerWidth / 2;

  return {
    pos,
    onLeft,
    reset,
    reclamp,
    /** True if the press that just ended was a drag — the launcher uses it to swallow the click. */
    wasDragged: () => moved.current,
    handleProps: {
      onPointerDown,
      onDoubleClick: reset,
      // touch-none stops a drag from scrolling the page under it.
      className: 'cursor-grab touch-none select-none active:cursor-grabbing',
      title: 'Drag to move · double-click to reset',
    },
  };
}

export default function AiChat() {
  const lt = useLT('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: lt('greeting', "Hello! I'm KEAA's AI Assistant. How can I help you today? I can answer questions about our products, services, and company."),
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const wrapRef = useRef(null);
  const { pos, onLeft, wasDragged, handleProps, reclamp } = useDraggable(wrapRef);

  // Opening turns a 56px launcher into a 600px panel. Re-clamp once that has rendered, or a
  // widget parked high on the screen would open straight off the top of the viewport.
  useEffect(() => {
    reclamp();
  }, [isOpen, reclamp]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          /* The widget mounts OUTSIDE <LocaleProvider> (see App.jsx), so the language is
             resolved directly: URL locale prefix first, stored choice second. The server
             answers in this language. */
          language: visitorLanguage(),
          conversationHistory: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      if (!response.ok) {
        let friendly = '';
        try {
          const errData = await response.json();
          friendly = errData?.error || errData?.details || '';
        } catch {
          /* body wasn't JSON — ignore */
        }
        const err = new Error(`Server responded ${response.status}. ${friendly}`);
        err.userMessage = friendly;
        err.status = response.status;
        throw err;
      }

      const data = await response.json();

      const botMessage = {
        id: messages.length + 2,
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // A TypeError from fetch() almost always means the Spring Boot backend on :8080
      // isn't running (the chat is a controller in it). Log the real reason for debugging.
      const offline = error instanceof TypeError;
      console.error('[KEAA AI Chat] request failed:', error);
      if (offline) {
        console.error(
          '[KEAA AI Chat] The chat backend is unreachable. Start it with "npm run dev:all" ' +
            '(or run KeaaAdminApiApplication in IntelliJ), then confirm ' +
            'http://localhost:8080/actuator/health responds.'
        );
      }
      const errorMessage = {
        id: messages.length + 2,
        text: offline
          ? lt('errors.offline', "I can't reach the assistant service right now. Please try again in a moment.")
          : error.userMessage ||
            lt('errors.generic', 'Sorry, I encountered an error. Please try again.'),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* Sits above the consent bar while it is showing. `--consent-bar-h` is published by
       CookieConsent and removed once a decision is stored, so the fallback of 0px is the
       normal case. Without this the bar covered the launcher on exactly the visit where a
       first-time visitor is most likely to want it. */
    <div
      ref={wrapRef}
      /* The bottom transition belongs to the consent bar only. Once the widget has been
         dragged it must follow the pointer exactly, so the transition comes off. Home corner
         is bottom-LEFT on mobile and bottom-RIGHT from `sm` up; those insets apply only while
         un-dragged, so a dragged position (stored as a right/bottom offset) never fights them. */
      className={`fixed z-50 ${
        pos ? '' : 'left-6 sm:left-auto sm:right-6 transition-[bottom] duration-300'
      }`}
      style={
        pos
          ? { right: `${pos.right}px`, bottom: `${pos.bottom}px` }
          : { bottom: 'calc(1.5rem + var(--consent-bar-h, 0px))' }
      }
    >
      {/*
        Chat Window.

        Below `sm` it takes the full width minus one 24px gutter each side — 24px being exactly
        the inset the widget parks at — so the gap left of the panel matches the gap right of
        it. A fixed 384px panel could not do that: anchored from one edge it left 24px on that
        side and whatever remained on the other, which is what made it look lopsided on a phone.
        From `sm` up it goes back to a 384px corner widget. The height is capped the same way so
        a short window never crops it.
      */}
      {isOpen && (
        <div className="bg-white rounded-card shadow-2xl w-[calc(100vw-3rem)] sm:w-96 h-[min(600px,calc(100vh-8rem))] flex flex-col border border-gray-200 mb-4">
          {/* Header. The brand blue (`primary-dark`), flat rather than a gradient. White on it
              measures 4.87:1, which passes AA but leaves no room to fade the "Online" line, so
              that stays solid white. Doubles as the drag handle while the panel is open. */}
          <div
            {...handleProps}
            title={lt('handle.title', 'Drag to move · double-click to reset')}
            className={`bg-primary-dark text-white p-4 rounded-t-card flex justify-between items-center ${handleProps.className}`}
          >
            <div>
              <h3 className="font-semibold">{lt('header.title', 'KEAA AI Assistant')}</h3>
              <p className="text-xs text-white">{lt('header.online', 'Online')}</p>
            </div>
            <button
              onClick={() => {
                if (wasDragged()) return; // the header is the drag handle; a move is not a click
                setIsOpen(false);
              }}
              aria-label={lt('closeAria', 'Close KEAA assistant')}
              className="cursor-pointer rounded-card px-2 py-1 text-[13px] font-bold uppercase tracking-[0.12em] transition hover:bg-white/15"
            >
              {lt('close', 'Close')}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[17rem] px-4 py-2 rounded-card ${
                    message.sender === 'user'
                      ? 'bg-primary-dark text-white rounded-br-none'
                      : 'bg-navy-50 text-text rounded-bl-none'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <p className="text-body-compact whitespace-pre-wrap">{message.text}</p>
                  ) : (
                    <div
                      className="text-sm leading-relaxed break-words
                        [&_p]:mb-2 [&_p:last-child]:mb-0
                        [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-4
                        [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-4
                        [&_li]:mb-1 [&_li]:marker:text-gray-400
                        [&_strong]:font-semibold [&_strong]:text-gray-900
                        [&_a]:text-primary-deep [&_a]:underline
                        [&_h1]:mt-1 [&_h1]:mb-1.5 [&_h1]:font-semibold
                        [&_h2]:mt-1 [&_h2]:mb-1.5 [&_h2]:font-semibold
                        [&_h3]:mt-1 [&_h3]:mb-1 [&_h3]:font-semibold
                        [&_code]:rounded-card [&_code]:bg-gray-300/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.8em]
                        [&_table]:my-1.5 [&_table]:w-full [&_table]:text-xs
                        [&_th]:border [&_th]:border-gray-300 [&_th]:px-1.5 [&_th]:py-0.5 [&_th]:text-left
                        [&_td]:border [&_td]:border-gray-300 [&_td]:px-1.5 [&_td]:py-0.5"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: (props) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                          ),
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-navy-50 text-text px-4 py-2 rounded-card rounded-bl-none">
                  <span className="text-[13px] font-bold uppercase tracking-[0.12em]">
                    {lt('loading', 'Loading…')}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-card">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={lt('input.placeholder', 'Type your message...')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-card focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                aria-label={lt('input.sendAria', 'Send message')}
                className="bg-primary-dark hover:bg-primary-darker disabled:bg-gray-300 text-white px-3 py-2 rounded-card transition flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em]"
              >
                {lt('input.send', 'Send')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button. Hugs whichever edge the widget has been parked against. Un-dragged,
          that edge is responsive: left on mobile, right from `sm` up. */}
      <div
        className={`flex ${
          pos == null ? 'justify-start sm:justify-end' : onLeft ? 'justify-start' : 'justify-end'
        }`}
      >
        {isOpen ? (
          <button
            onClick={() => setIsOpen(false)}
            aria-label={lt('closeAria', 'Close KEAA assistant')}
            className="relative flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 bg-navy-900 text-white shadow-xl transition-transform hover:scale-105"
          >
            <span className="text-[13px] font-bold uppercase tracking-[0.12em]">
              {lt('close', 'Close')}
            </span>
          </button>
        ) : (
          /* Closed, this is the drag handle. The launcher still opens the chat: a press only
             becomes a drag past DRAG_SLOP, and the click is swallowed below when it does, so a
             normal tap is never eaten by the drag. Just the round "Ask" button now — the
             "Ask keaa" label pill was removed. */
          <div {...handleProps} title={lt('handle.title', 'Drag to move · double-click to reset')}>
            {/* Launcher button with the brand radiation ring */}
            <button
              onClick={() => {
                if (wasDragged()) return; // the press that just ended was a move, not a tap
                setIsOpen(true);
              }}
              aria-label={lt('openAria', 'Open KEAA assistant')}
              className="group relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 cursor-pointer transition-transform hover:scale-105"
            >
              {/* Rotating brand ring. Built from the palette variables rather than pasted hex
                  values, so it follows the token instead of drifting from it. */}
              <span
                className="absolute -inset-[3px] rounded-full animate-spin motion-reduce:animate-none"
                style={{
                  animationDuration: '4s',
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, rgb(var(--color-primary) / 0.12) 130deg, rgb(var(--color-primary)) 300deg, rgb(var(--color-primary-light)) 345deg, transparent 360deg)',
                }}
              />
              {/* pulsing halo */}
              <span
                className="absolute inset-0 rounded-full bg-primary/30 animate-ping motion-reduce:animate-none"
                style={{ animationDuration: '2.6s' }}
              />
              {/* navy circle with the control word */}
              <span className="absolute inset-0 flex items-center justify-center rounded-full border border-primary/60 bg-navy-900 shadow-xl">
                <span className="text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.12em] text-white">
                  {lt('ask', 'Ask')}
                </span>
              </span>
              {/* notification badge */}
              <span className="absolute -right-0.5 -top-0.5 z-10 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary-dark text-[10px] sm:text-[11px] font-bold text-white ring-2 ring-white">
                1
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
