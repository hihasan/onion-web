const VIEWBOX_WIDTH = 1200
const VIEWBOX_HEIGHT = 40
const BASELINE = 20
const AMPLITUDE = 8
const WAVE_COUNT = 75

function buildWavePath() {
  const segmentWidth = VIEWBOX_WIDTH / WAVE_COUNT
  let d = `M0,${BASELINE}`
  for (let i = 0; i < WAVE_COUNT; i++) {
    const x = (i + 1) * segmentWidth
    const controlX = x - segmentWidth / 2
    const controlY = i % 2 === 0 ? BASELINE - AMPLITUDE : BASELINE + AMPLITUDE
    d += ` Q${controlX},${controlY} ${x},${BASELINE}`
  }
  return d
}

const WAVE = buildWavePath()

export function Footer() {
  return (
    <footer className="shrink-0">
      {/* Above this curve stays transparent (page background); only the fill
          below it — and everything under the svg — is painted yellow. */}
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        className="block h-8 w-full"
        aria-hidden="true"
      >
        <path d={`${WAVE} L${VIEWBOX_WIDTH},${VIEWBOX_HEIGHT} L0,${VIEWBOX_HEIGHT} Z`} fill="#FFC93C" />
        <path
          d={WAVE}
          fill="none"
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
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
