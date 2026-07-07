export default function Logo({ light = false, className = '' }) {
  const textColor = light ? 'text-white' : 'text-navy-950';
  const subColor = light ? 'text-white/60' : 'text-slate-450';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Exact 3D Cube Icon matching the user's logo with transparent gaps */}
      <svg viewBox="0 0 100 100" className="h-10 w-10 flex-shrink-0" aria-hidden="true">
        <defs>
          {/* Mask to create the transparent gaps between the three faces */}
          <mask id="cube-gap-mask">
            {/* White means keep/visible */}
            <rect x="0" y="0" width="100" height="100" fill="white" />
            {/* Black means cut out/transparent */}
            {/* Horizontal gap (center to left) */}
            <line x1="50" y1="50" x2="5" y2="50" stroke="black" strokeWidth="5.5" strokeLinecap="butt" />
            {/* Diagonal gap (center to top-right) */}
            <line x1="50" y1="50" x2="73" y2="10" stroke="black" strokeWidth="5.5" strokeLinecap="butt" />
            {/* Diagonal gap (center to bottom-right) */}
            <line x1="50" y1="50" x2="73" y2="90" stroke="black" strokeWidth="5.5" strokeLinecap="butt" />
          </mask>
        </defs>

        <g mask="url(#cube-gap-mask)">
          {/* Top Face (Light Blue) */}
          <polygon points="10,50 30,15.36 70,15.36 50,50" fill="#79c7f9" />
          
          {/* Bottom-Left Face (Medium Blue) */}
          <polygon points="10,50 50,50 70,84.64 30,84.64" fill="#2b84da" />
          
          {/* Right Face (Dark Blue) */}
          <polygon points="50,50 70,15.36 90,50 70,84.64" fill="#2065be" />
        </g>
      </svg>
      
      <div className="flex flex-col justify-center">
        {/* "keaa" in lowercase, bold geometric sans-serif */}
        <span className={`font-body text-2xl font-bold tracking-tight leading-[1.1] ${textColor}`}>
          keaa
        </span>
        {/* "INTERNATIONAL" in uppercase, wide letter-spacing */}
        <span 
          className={`text-[9px] font-semibold tracking-[0.22em] uppercase leading-none ${subColor}`}
          style={!light ? { color: '#8A99AD' } : {}}
        >
          INTERNATIONAL
        </span>
      </div>
    </div>
  );
}


