// Cities index — browse every city in the scene with its skyline, leagues, and culture.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/db/server';

type City = {
  id: string;
  name: string;
  state: string | null;
  country: string | null;
  scene_size: string | null;
  culture_style: string | null;
  background_url: string | null;
  skyline_url: string | null;
};

type LeagueRow = {
  id: string;
  name: string;
  short_code: string;
  city_id: string | null;
  logo_url: string | null;
};

export default async function CitiesIndexPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const supabase = await createServerSupabaseClient();

  const [{ data: cities }, { data: leagues }] = await Promise.all([
    supabase
      .from('cities')
      .select('id, name, state, country, scene_size, culture_style, background_url, skyline_url')
      .order('name'),
    supabase
      .from('leagues')
      .select('id, name, short_code, city_id, logo_url'),
  ]);

  const cityList: City[] = cities ?? [];
  const leaguesByCity = new Map<string, LeagueRow[]>();
  for (const l of (leagues ?? []) as LeagueRow[]) {
    if (!l.city_id) continue;
    const arr = leaguesByCity.get(l.city_id) ?? [];
    arr.push(l);
    leaguesByCity.set(l.city_id, arr);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 animate-fade-in-up">
      <div className="border-b-2 border-[#3a3d44] bg-[#18191c]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-display font-black tracking-tighter mb-2 text-zinc-100">
            CITIES
          </h1>
          <p className="text-zinc-400 text-sm uppercase tracking-wide">
            {cityList.length} cities in the scene — each with its own leagues, culture, and battlers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cityList.map((city) => {
            const cityLeagues = leaguesByCity.get(city.id) ?? [];
            const hero = city.background_url || city.skyline_url;
            return (
              <div
                key={city.id}
                className="group bg-[#18191c] border-2 border-[#3a3d44] hover:border-[#ff8c42] hover:-translate-y-[2px] hover:shadow-[0_14px_36px_-18px_rgba(255,140,66,0.6)] transition-all duration-200 overflow-hidden"
              >
                {/* Skyline / background image */}
                <div
                  className="aspect-[16/9] bg-[#2d2f35] bg-cover bg-center relative transition-transform duration-500 group-hover:scale-[1.03]"
                  style={hero ? { backgroundImage: `url(${hero})` } : undefined}
                >
                  {!hero && (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs uppercase tracking-widest">
                      No skyline
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18191c] via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-100 drop-shadow-lg">
                      {city.name}
                    </h2>
                    <p className="text-xs uppercase tracking-widest text-zinc-300 drop-shadow">
                      {[city.state, city.country].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-bold">
                    {city.scene_size && (
                      <span className="px-2 py-1 border border-[#3a3d44] text-zinc-300">
                        {city.scene_size} scene
                      </span>
                    )}
                    {city.culture_style && (
                      <span className="px-2 py-1 border border-[#ff8c42]/40 text-[#ff8c42]">
                        {city.culture_style}
                      </span>
                    )}
                  </div>

                  {cityLeagues.length > 0 ? (
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                        {cityLeagues.length} {cityLeagues.length === 1 ? 'league' : 'leagues'} based here
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cityLeagues.slice(0, 4).map((l) => (
                          <Link
                            key={l.id}
                            href={`/leagues/${l.id}`}
                            className="text-xs font-bold uppercase tracking-wider text-zinc-200 hover:text-[#ff8c42] border-b border-dashed border-zinc-700 hover:border-[#ff8c42]"
                          >
                            {l.short_code}
                          </Link>
                        ))}
                        {cityLeagues.length > 4 && (
                          <span className="text-xs text-zinc-500">+{cityLeagues.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs uppercase tracking-wider text-zinc-600">
                      No leagues based here yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
