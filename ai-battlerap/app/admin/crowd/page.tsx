// CROWD HARNESS (owner ask, 2026-08-31): "if they're cropped, I wanna tell you
// where they're cropped so you can organize them properly." Every body in the
// family at 2x, with its AUTO-DETECTED cut edges drawn in red and the placement
// rule that detection buys it. Eyeball a wrong call, name the file, and the
// tag gets corrected in lib/crowd-family.json.
import Link from 'next/link';
import familyRaw from '@/lib/crowd-family.json';

type Member = { src: string; mood: string; demo: string; gender: string; crop?: string[] };
const FAMILY = familyRaw as Member[];

const MOOD_ORDER = ['hype', 'oooh', 'laugh', 'nod', 'talk', 'watch', 'unimpressed', 'dismiss', 'boo'];

function ruleFor(crop?: string[]): string {
  if (!crop?.length) return 'ANYWHERE · CAN FLIP';
  const parts: string[] = [];
  if (crop.includes('left') && crop.includes('right')) parts.push('ROW START ONLY');
  else if (crop.includes('left')) parts.push('LEFT END OF ROW');
  else if (crop.includes('right')) parts.push('RIGHT END OF ROW');
  if (crop.includes('top')) parts.push('BACK ROW');
  parts.push('NEVER FLIPS');
  return parts.join(' · ');
}

export const metadata = { title: 'Crowd Harness — Battle Rap University' };

export default function CrowdHarnessPage() {
  const total = FAMILY.length;
  const cropped = FAMILY.filter((m) => m.crop?.length).length;
  return (
    <div className="fs min-h-screen bg-[#0F0F12] pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        <Link href="/dashboard" className="font-mono text-[12px] uppercase tracking-[0.25em] text-zinc-500 hover:text-[#F5731A]">
          ← Dashboard
        </Link>
        <div className="mt-4 mb-2 flex items-end justify-between flex-wrap gap-3">
          <h1 style={{ fontFamily: 'var(--font-poster)', fontSize: 48, lineHeight: 1 }} className="text-zinc-100 uppercase">
            Crowd Harness
          </h1>
          <span className="font-mono text-[12px] uppercase tracking-[0.3em] text-[#F5731A]">
            DEV · {total} bodies · {cropped} edge-cropped
          </span>
        </div>
        <p className="text-[14px] text-zinc-400 max-w-3xl mb-3">
          Red lines = where the ART is cut off at its canvas edge (auto-detected from transparency). The room
          placer obeys them: cut-right bodies stand at the right end of a row, cut-left at the left end,
          cut-top ride the back row where the frame crops them naturally. Side-cropped bodies never mirror.
        </p>
        <p className="font-mono text-[12px] uppercase tracking-wider text-zinc-600 mb-10">
          See a wrong call? Name the file and the side — the tag gets fixed at the source.
        </p>

        {MOOD_ORDER.map((mood) => {
          const members = FAMILY.filter((m) => m.mood === mood);
          if (members.length === 0) return null;
          return (
            <section key={mood} className="mb-10">
              <h2 style={{ fontFamily: 'var(--font-poster)', fontSize: 26 }} className="text-zinc-100 uppercase mb-4">
                {mood} <span className="font-mono text-[13px] text-zinc-500 normal-case">×{members.length}</span>
              </h2>
              <div className="flex flex-wrap gap-4">
                {members.map((m) => {
                  const file = m.src.split('/').pop();
                  const c = m.crop ?? [];
                  return (
                    <div key={m.src} className="bg-[#17181C] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,.45)] p-3">
                      <div
                        className="relative"
                        style={{
                          width: 224,
                          height: 256,
                          background:
                            'repeating-conic-gradient(#1c1d22 0% 25%, #24252b 0% 50%) 0 0 / 24px 24px',
                        }}
                      >
                        {/* integer-scale law: 112x128 art at exactly 2x */}
                        <img src={m.src} alt={file} width={224} height={256} style={{ imageRendering: 'pixelated' }} />
                        {c.includes('left') && (
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E23A2E]" />
                        )}
                        {c.includes('right') && (
                          <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#E23A2E]" />
                        )}
                        {c.includes('top') && (
                          <div className="absolute left-0 right-0 top-0 h-[3px] bg-[#E23A2E]" />
                        )}
                      </div>
                      <p className="font-mono text-[12px] text-zinc-300 mt-2">{file}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wide mt-0.5" style={{ color: c.length ? '#E23A2E' : '#35C46B' }}>
                        {c.length ? `CUT: ${c.join(' + ').toUpperCase()}` : 'CLEAN'}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-zinc-500 mt-0.5">{ruleFor(m.crop)}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
