const WAVE =
  "M0,8 Q30,5 60,8 T120,8 T180,8 T240,8 T300,8 T360,8 T420,8 T480,8 T540,8 T600,8 T660,8 T720,8 T780,8 T840,8 T900,8 T960,8 T1020,8 T1080,8 T1140,8 T1200,8"

export function Footer() {
  return (
    <footer className="shrink-0">
      {/* Above this curve stays transparent (page background); only the fill
          below it — and everything under the svg — is painted yellow. */}
      <svg viewBox="0 0 1200 16" preserveAspectRatio="none" className="block h-3 w-full" aria-hidden="true">
        <path d={`${WAVE} L1200,16 L0,16 Z`} fill="#FFC93C" />
        <path d={WAVE} fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="bg-[#FFC93C] px-4 py-3 text-center">
        <p className="text-sm font-semibold text-black">
          All Rights Reserved &copy;{" "}
          <a
            href="https://hihasan.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            Hihasan
          </a>
        </p>
      </div>
    </footer>
  )
}
