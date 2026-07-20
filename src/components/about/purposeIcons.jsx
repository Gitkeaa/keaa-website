/**
 * Icons for the Our Purpose band.
 *
 * These three are hand-drawn rather than imported because lucide-react 0.408 has
 * no mountain-with-flag, no target-with-arrow and no people-with-star — the marks
 * the client's reference actually uses for the medallions. The nearest lucide
 * exports (MountainSnow, Goal, Users) each read as a different idea: Goal, for
 * instance, is a pennant inside an arc, not a bullseye.
 *
 * Only the medallions carry icons. The five core values are set as text alone.
 *
 * They deliberately match lucide's drawing conventions so they sit beside the real
 * lucide icons elsewhere on the page without looking like a different set: 24x24
 * viewBox, no fill, 1.75 stroke, round caps and joins, and `currentColor` so the
 * caller's text colour drives them.
 */

function Svg({ children, className = '', ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Two peaks with a pennant planted on the taller one. */
export function PeakFlag(props) {
  return (
    <Svg {...props}>
      <path d="M2.5 20.5h19" />
      <path d="M4 20.5 10 9l3 5 2.5-3.5 4.5 10" />
      <path d="M10 9V3" />
      <path d="M10 3.5h4.4l-1.5 1.7 1.5 1.7H10" />
    </Svg>
  );
}

/** Bullseye with an arrow driven into the centre from the upper right. */
export function TargetArrow(props) {
  return (
    <Svg {...props}>
      <circle cx="10.5" cy="13.5" r="8.5" />
      <circle cx="10.5" cy="13.5" r="4.4" />
      <circle cx="10.5" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="m10.5 13.5 9.8-9.8" />
      <path d="M15.4 3.7h4.9v4.9" />
    </Svg>
  );
}

/** Three figures under a star — the group, and what it is held to. */
export function PeopleStar(props) {
  return (
    <Svg {...props}>
      <path d="M12 1.2l.9 2.1 2.3.2-1.7 1.5.5 2.2L12 6.1 10 7.2l.5-2.2-1.7-1.5 2.3-.2z" />
      <circle cx="12" cy="12.4" r="2.7" />
      <path d="M7.4 21.4a4.6 4.6 0 0 1 9.2 0" />
      <circle cx="4.8" cy="14.6" r="1.9" />
      <path d="M1.6 21.4a3.3 3.3 0 0 1 3.3-3.3" />
      <circle cx="19.2" cy="14.6" r="1.9" />
      <path d="M22.4 21.4a3.3 3.3 0 0 0-3.3-3.3" />
    </Svg>
  );
}
