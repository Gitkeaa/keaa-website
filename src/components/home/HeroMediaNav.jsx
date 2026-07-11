import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react';

/**
 * The hero's media control: previous / next chevrons either side of a pill of dots, with
 * the active dot stretched into a lozenge.
 *
 * It moves the *background* only. The headline, buttons and stat card never change, so
 * there is no slide copy to write and no claim to invent — the dots simply choose which
 * film or photograph sits behind the same words.
 *
 * The play/mute pair appears only while the film is showing. It is part of this bar
 * rather than floating in the hero's own corner, because AiChat and BackToTop are both
 * `fixed bottom-6 right-6` and would sit on top of anything parked there.
 */

function IconButton({ onClick, label, children, pressed }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-text transition-colors hover:bg-text/[0.06] focus-visible:bg-text/[0.06]"
    >
      {children}
    </button>
  );
}

export default function HeroMediaNav({
  count,
  index,
  onSelect,
  onPrev,
  onNext,
  labels = [],
  showMediaControls = false,
  playing,
  muted,
  onTogglePlay,
  onToggleMute,
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-2xl bg-surface-raised/[0.88] p-1.5 shadow-[0_1px_2px_-1px_rgb(var(--color-text)_/_0.1),0_18px_40px_-28px_rgb(var(--color-text)_/_0.45)] ring-1 ring-border backdrop-blur-sm sm:gap-2 sm:p-2">
      <IconButton onClick={onPrev} label="Previous background">
        <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
      </IconButton>

      <div className="flex items-center gap-2 rounded-full bg-surface-tint px-3 py-2 ring-1 ring-border/60 sm:gap-2.5 sm:px-3.5">
        {Array.from({ length: count }, (_, i) => {
          const active = i === index;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={labels[i] ? `Show ${labels[i]}` : `Show background ${i + 1}`}
              aria-current={active ? 'true' : undefined}
              /* The hit area is 24px tall; only the ink inside it is 8px. */
              className="group flex h-6 items-center justify-center py-2"
            >
              <span
                aria-hidden
                className={`block h-2 rounded-full transition-all duration-300 ${
                  active ? 'w-7 bg-text' : 'w-2 bg-text/40 group-hover:bg-text/70'
                }`}
              />
            </button>
          );
        })}
      </div>

      <IconButton onClick={onNext} label="Next background">
        <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
      </IconButton>

      {showMediaControls && (
        <>
          <span aria-hidden className="mx-0.5 h-6 w-px flex-shrink-0 bg-border" />
          <IconButton
            onClick={onTogglePlay}
            label={playing ? 'Pause the background film' : 'Play the background film'}
            pressed={!playing}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
          </IconButton>
          <IconButton
            onClick={onToggleMute}
            label={muted ? 'Unmute the background film' : 'Mute the background film'}
            pressed={muted}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </IconButton>
        </>
      )}
    </div>
  );
}
