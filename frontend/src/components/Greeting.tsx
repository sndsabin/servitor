interface Props {
  greeting: string;
  message: string;
}

const Greeting = ({ greeting, message }: Props) => {
  return (
    <div className="from-accent-100 to-accent-100/60 relative mb-6 overflow-hidden rounded-2xl bg-linear-to-br px-8 py-8">
      <svg
        className="pointer-events-none absolute top-0 right-0 h-full w-72 opacity-90"
        viewBox="0 0 300 200"
        preserveAspectRatio="xMaxYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(300, 0)">
          <g fill="var(--color-accent-600)" opacity="0.8">
            <path d="M 0,0 L -160,0 C -160,50 -120,120 0,0 Z" />
            <path d="M 0,0 L 0,160 C -50,160 -120,120 0,0 Z" />
            <path d="M 0,0 L -113,113 C -140,70 -70,140 0,0 Z" />
          </g>

          <path
            d="
                M 0,0 
                L -150,0 
                Q -165,35 -130,55 
                Q -160,80 -110,110 
                Q -80,160 -55,130 
                Q -35,165 0,150 
                Z
            "
            fill="var(--color-accent-500)"
            opacity="0.55"
            stroke="var(--color-accent-400)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          <circle
            cx="0"
            cy="0"
            r="55"
            fill="none"
            stroke="var(--color-accent-400)"
            strokeWidth="2.5"
            opacity="0.6"
          />
        </g>
      </svg>

      <div className="relative">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {greeting} <span className="align-middle">👋</span>
        </h1>
        <p className="mt-1.5 text-[13.5px] text-slate-600">{message}</p>
      </div>
    </div>
  );
};

export default Greeting;
