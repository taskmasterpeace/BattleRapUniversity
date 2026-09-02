'use client';

import { useState, useEffect, useMemo } from 'react';
import Icon, { type IconName } from '@/components/ui/Icon';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/db/client';
import AttributeAllocationStep, { AllocatedAttributes } from './AttributeAllocationStep';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import TemplateSelector from '@/components/onboarding/TemplateSelector';
import ReviewStep from '@/components/onboarding/ReviewStep';
import OnboardingSuccess from '@/components/onboarding/OnboardingSuccess';
import { BattlerTemplate } from '@/lib/game/battlerTemplates';
import Tooltip from '@/components/onboarding/Tooltip';
import { getCityBonus } from '@/lib/game/cityBonuses';
import { portraitFillStyle } from '@/lib/sprite-crops';
import spriteMetaRaw from '@/lib/game/characterSpriteMeta.json';
import { HOMETOWN_OPTIONS } from '@/lib/data/hometownCities';

// Owner ask 2026-08-31: "we gotta identify males or females so they know" —
// every pool face carries a hand-classified gender tag.
const SPRITE_GENDER = spriteMetaRaw as Record<string, string>;

type League = {
  id: string;
  name: string;
  short_code: string;
  round_length_minutes: number;
  description: string;
  writing_weight: number;
  performance_weight: number;
  logo_url?: string | null;
  base_crowd_factor: number;
  city_id?: string | null;
  prestige_level?: number | null;
  base_payout?: number | null;
};

// Prestige → the culture's ladder rung. Online/virtual leagues (no city) are
// the true bottom: text and app battling before you ever touch a stage.
function leagueTier(prestige: number | null | undefined, cityId?: string | null): string {
  if (!cityId) return 'ONLINE';
  const p = prestige ?? 0;
  if (p >= 8) return 'PREMIER';
  if (p >= 5) return 'REGIONAL';
  if (p >= 3) return 'UP-AND-COMING';
  return 'UNDERGROUND';
}

type City = {
  id: string;
  name: string;
  state: string | null;
  country: string | null;
  culture_style: string | null;
  scene_size: string | null;
  skyline_url: string | null;
};

type AvatarPool = {
  total: number;
  claimed: number;
  available: string[];
};

const STYLE_TAGS = [
  { value: 'angles', label: 'Angles', description: 'Personal attacks' },
  { value: 'comedy', label: 'Comedy', description: 'Humor and wit' },
  { value: 'storytelling', label: 'Storytelling', description: 'Narrative verses' },
  { value: 'gun_bars', label: 'Gun Bars', description: 'Violent imagery' },
  { value: 'wordplay', label: 'Wordplay', description: 'Word manipulation' },
  { value: 'freestyle', label: 'Freestyle', description: 'Improvisation' },
];

// Origin path — how you came up. Baked at creation into a permanent identity
// label (PEN FIRST / INTERNET BATTLER / CIRCLE TESTED). See lib/game/labels.
const ORIGIN_OPTIONS: {
  value: 'text_forums' | 'app_camera' | 'crew';
  label: string;
  lane: string;
  icon: IconName;
  description: string;
}[] = [
  { value: 'text_forums', label: 'Text Forums', lane: 'Writer', icon: 'pen', description: 'Came up on the boards — pen and schemes before any stage.' },
  { value: 'app_camera', label: 'App Camera', lane: 'Performer', icon: 'film', description: 'Made your name through the phone — bars straight to the feed.' },
  { value: 'crew', label: 'Crew', lane: 'Street', icon: 'users', description: 'Forged in a crew — street-rooted, co-signed from day one.' },
];

// Map leagues to venue backgrounds and atmosphere
const getLeagueVisuals = (leagueName: string) => {
  const visuals: Record<string, { venue: string; atmosphere: string }> = {
    'Small Room Circuit': {
      venue: '/sprites/cities/east-coast/new-york-city-night.png',
      atmosphere: 'Intimate small room, technical crowd, bar-focused energy',
    },
    'Main Stage Arena': {
      venue: '/sprites/cities/west-coast/los-angeles-night.png',
      atmosphere: 'Big stage, hot lights, massive crowd reactions',
    },
    'East Coast Elites': {
      venue: '/sprites/cities/east-coast/new-york-city-dusk.png',
      atmosphere: 'NYC grit, technical bars, sophisticated wordplay crowd',
    },
    'West Coast Warriors': {
      venue: '/sprites/cities/west-coast/los-angeles-dusk.png',
      atmosphere: 'West Coast swagger, performance-heavy, style matters',
    },
    'Midwest Massacre': {
      venue: '/sprites/cities/midwest/chicago-night.png',
      atmosphere: 'Blue collar energy, hard-hitting bars, no-nonsense crowd',
    },
    'Southern Showdown': {
      venue: '/sprites/cities/south/atlanta-night.png',
      atmosphere: 'Southern hospitality meets aggressive delivery',
    },
    'International Circuit': {
      venue: '/sprites/cities/canada/toronto-night.png',
      atmosphere: 'Global stage, diverse styles, multicultural crowd',
    },
    'Punchline Paradise': {
      venue: '/sprites/cities/east-coast/philadelphia-night.png',
      atmosphere: 'Bar-heavy crowd, no filler tolerated, pure lyricism',
    },
    'Lyrical Warfare': {
      venue: '/sprites/cities/east-coast/boston-dusk.png',
      atmosphere: 'Technical excellence, complex schemes, elite writing',
    },
    'Storyteller\'s Summit': {
      venue: '/sprites/cities/midwest/minneapolis-dusk.png',
      atmosphere: 'Creative expression, narrative focus, artistic crowd',
    },
    'Freestyle Frenzy': {
      venue: '/sprites/cities/west-coast/oakland-night.png',
      atmosphere: 'Raw improv energy, no prep, pure spontaneous fire',
    },
    'Urban Warfare League': {
      venue: '/sprites/cities/east-coast/baltimore-night.png',
      atmosphere: 'Street-style battles, raw and unfiltered, real hip-hop',
    },
    'Royal Massacre': {
      venue: '/sprites/cities/west-coast/las-vegas-night.png',
      atmosphere: 'Aggressive crowds, performance spectacle, violence expected',
    },
    'Apex Battle Arena': {
      venue: '/sprites/cities/south/miami-night.png',
      atmosphere: 'Premium venue, elite competition, high production value',
    },
    'Champion\'s Circle Grand Prix': {
      venue: '/sprites/cities/west-coast/san-francisco-dusk.png',
      atmosphere: 'Championship atmosphere, massive stakes, legends made here',
    },
  };

  return visuals[leagueName] || {
    venue: '/sprites/cities/east-coast/new-york-city-night.png',
    atmosphere: 'Competitive battle rap environment',
  };
};

const DRAFT_KEY = 'battler_draft';

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = welcome, 1 = template, 2 = identity, 3 = league, 4 = attributes, 5 = styles, 6 = review, 7 = success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leagues, setLeagues] = useState<League[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data
  const [selectedTemplate, setSelectedTemplate] = useState<BattlerTemplate | null>(null);
  const [stageName, setStageName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedHomeCity, setSelectedHomeCity] = useState<string | null>(null);
  // Detailed HOMETOWN (identity) — neighborhood-level, searchable. Separate from
  // the gameplay home city. Stored as `region`. See docs/design/CORE_LOOP_AND_ERAS.md.
  const [hometownQuery, setHometownQuery] = useState('');
  const [selectedHometown, setSelectedHometown] = useState<string | null>(null);
  // Origin path (how you came up) — bakes a permanent identity label at creation.
  const [selectedOrigin, setSelectedOrigin] = useState<'text_forums' | 'app_camera' | 'crew' | null>(null);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [allocatedAttributes, setAllocatedAttributes] = useState<AllocatedAttributes | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [createdAvatarUrl, setCreatedAvatarUrl] = useState<string | null>(null);

  // Face pool (exclusive: claimed faces never show up here)
  const [avatarPool, setAvatarPool] = useState<AvatarPool | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const fetchAvatarPool = async () => {
    setAvatarLoading(true);
    try {
      const res = await fetch('/api/avatars', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAvatarPool(data);
      }
    } catch (e) {
      console.error('Failed to load face pool:', e);
    } finally {
      setAvatarLoading(false);
    }
  };

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.stageName) setStageName(parsed.stageName);
        if (parsed.selectedAvatar) setSelectedAvatar(parsed.selectedAvatar);
        if (parsed.selectedHomeCity) setSelectedHomeCity(parsed.selectedHomeCity);
        if (parsed.selectedOrigin) setSelectedOrigin(parsed.selectedOrigin);
        if (parsed.selectedLeague) setSelectedLeague(parsed.selectedLeague);
        if (parsed.allocatedAttributes) setAllocatedAttributes(parsed.allocatedAttributes);
        if (parsed.selectedStyles) setSelectedStyles(parsed.selectedStyles);
        if (parsed.step && parsed.step > 0) setStep(parsed.step);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Save draft to localStorage
  useEffect(() => {
    if (step > 0 && step < 7) {
      const draft = {
        step,
        stageName,
        selectedAvatar,
        selectedHomeCity,
        selectedOrigin,
        selectedLeague,
        allocatedAttributes,
        selectedStyles,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [step, stageName, selectedAvatar, selectedHomeCity, selectedOrigin, selectedLeague, allocatedAttributes, selectedStyles]);

  useEffect(() => {
    const fetchLeagues = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('leagues').select('*').order('round_length_minutes');
      if (data) {
        setLeagues(data);
      }
    };
    const fetchCities = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('cities')
        .select('id, name, state, country, culture_style, scene_size, skyline_url')
        .order('name');
      if (data) {
        setCities(data);
      }
    };
    fetchLeagues();
    fetchCities();
    fetchAvatarPool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== style));
    } else {
      if (selectedStyles.length < 3) {
        setSelectedStyles([...selectedStyles, style]);
      }
    }
  };

  const handleTemplateSelect = (template: BattlerTemplate) => {
    setSelectedTemplate(template);

    // If custom, skip to identity
    if (template.id === 'custom') {
      setStep(2); // Identity step
      return;
    }

    // Pre-fill league
    if (template.suggestedLeague) {
      const league = leagues.find((l) => l.name === template.suggestedLeague);
      if (league) {
        setSelectedLeague(league.id);
      }
    }

    // Pre-fill styles
    if (template.suggestedStyles.length > 0) {
      setSelectedStyles(template.suggestedStyles);
    }

    // Pre-fill attributes
    if (template.attributes) {
      setAllocatedAttributes({
        writing: {
          lyricism: template.attributes.lyricism,
          wordplay: template.attributes.wordplay,
          creativity: template.attributes.creativity,
          flow: template.attributes.flow,
        },
        performance: {
          stage_presence: template.attributes.stage_presence,
          crowd_control: template.attributes.crowd_control,
          delivery: template.attributes.delivery,
        },
        personal: template.personal,
        resilience: template.attributes.resilience,
      });
    }

    setStep(2); // Go to identity step
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/battler/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage_name: stageName,
          avatar_url: selectedAvatar,
          home_city_id: selectedHomeCity,
          // Detailed hometown identity (neighborhood-level) → stored as region.
          region: selectedHometown || undefined,
          // Origin path (how you came up) → pins a permanent identity label.
          origin: selectedOrigin || undefined,
          primary_league_id: selectedLeague,
          style_tags: selectedStyles,
          allocated_attributes: allocatedAttributes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create battler');
      }

      // The server is the final arbiter of the face claim (race fallback) —
      // show whatever actually got assigned.
      setCreatedAvatarUrl(data?.battler?.avatar_url || selectedAvatar);

      // Clear draft
      localStorage.removeItem(DRAFT_KEY);

      // Show success screen
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSuccessContinue = () => {
    router.push('/dashboard');
    router.refresh();
  };

  // Get selected league/city objects
  const selectedLeagueObj = leagues.find((l) => l.id === selectedLeague);
  const selectedCityObj = cities.find((c) => c.id === selectedHomeCity);

  // Your first league is a LOCAL one. Offer the leagues based in the player's
  // chosen city, easiest rung first (start in the small rooms, not the premier
  // stage). Fall back to the two lowest-prestige leagues anywhere if the city
  // has no scene yet, so the step is never empty.
  const cityLeagues = useMemo(() => {
    // Online/virtual leagues (no city) are the universal entry rung — every
    // battler can start online before hitting a physical stage.
    const online = leagues
      .filter((l) => !l.city_id)
      .sort((a, b) => (a.prestige_level ?? 0) - (b.prestige_level ?? 0));
    const local = leagues
      .filter((l) => selectedHomeCity && l.city_id === selectedHomeCity)
      .sort((a, b) => (a.prestige_level ?? 0) - (b.prestige_level ?? 0));
    // Online first (start humble), then the city's rooms. Cap so the grid
    // stays clean: 1 online + the city's leagues, up to 3 total.
    const combined = [...online.slice(0, 1), ...local];
    if (combined.length > 0) return combined.slice(0, 3);
    return [...leagues]
      .sort((a, b) => (a.prestige_level ?? 0) - (b.prestige_level ?? 0))
      .slice(0, 2);
  }, [leagues, selectedHomeCity]);

  // Auto-select the most accessible local league when arriving at the step, so
  // the player is never staring at an un-continuable screen — but never
  // override a choice they already made among the current options.
  useEffect(() => {
    if (step !== 3 || cityLeagues.length === 0) return;
    if (!cityLeagues.some((l) => l.id === selectedLeague)) {
      setSelectedLeague(cityLeagues[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, cityLeagues]);

  // The face grid always includes the player's current pick, even after a
  // shuffle swaps the sample underneath them.
  const faceGrid = avatarPool
    ? selectedAvatar && !avatarPool.available.includes(selectedAvatar)
      ? [selectedAvatar, ...avatarPool.available.slice(0, Math.max(avatarPool.available.length - 1, 0))]
      : avatarPool.available
    : [];

  // Step 0: Welcome Screen
  if (step === 0) {
    return (
      <WelcomeScreen
        onQuickStart={() => setStep(1)}
        onCustomBuild={() => {
          setSelectedTemplate(null);
          setStep(2);
        }}
      />
    );
  }

  // Success Screen
  if (showSuccess && allocatedAttributes && selectedLeagueObj) {
    return (
      <OnboardingSuccess
        stageName={stageName}
        league={selectedLeagueObj.name}
        avatarUrl={createdAvatarUrl}
        cityName={selectedCityObj ? `${selectedCityObj.name}${selectedCityObj.state ? `, ${selectedCityObj.state}` : ''}` : null}
        attributes={allocatedAttributes}
        styles={selectedStyles}
        onContinue={handleSuccessContinue}
      />
    );
  }

  // Main wizard container
  return (
    <div className="min-h-screen bg-[#18191c] text-zinc-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-display font-black tracking-tighter mb-3">CREATE BATTLER</h1>
          <p className="text-zinc-500 uppercase tracking-wider text-sm">BUILD YOUR BATTLE RAP PERSONA</p>
        </div>

        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 transition-all ${
                    s <= step - 1 ? 'bg-[#ff8c42]' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs uppercase tracking-wider font-bold">
              <span className={step >= 1 ? 'text-[#ff8c42]' : 'text-zinc-600'}>
                {step === 1 ? '→ ' : ''}TEMPLATE
              </span>
              <span className={step >= 2 ? 'text-[#ff8c42]' : 'text-zinc-600'}>
                {step === 2 ? '→ ' : ''}IDENTITY
              </span>
              <span className={step >= 3 ? 'text-[#ff8c42]' : 'text-zinc-600'}>
                {step === 3 ? '→ ' : ''}LEAGUE
              </span>
              <span className={step >= 4 ? 'text-[#ff8c42]' : 'text-zinc-600'}>
                {step === 4 ? '→ ' : ''}ATTRIBUTES
              </span>
              <span className={step >= 5 ? 'text-[#ff8c42]' : 'text-zinc-600'}>
                {step === 5 ? '→ ' : ''}STYLES
              </span>
              <span className={step >= 6 ? 'text-[#ff8c42]' : 'text-zinc-600'}>
                {step === 6 ? '→ ' : ''}REVIEW
              </span>
            </div>
          </div>

          {/* Step 1: Template Selection */}
          {step === 1 && (
            <TemplateSelector
              onSelect={handleTemplateSelect}
              onBack={() => setStep(0)}
            />
          )}

          {/* Step 2: Identity — name, face, home city */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-display font-black uppercase tracking-tight mb-1">WHO ARE YOU — IDENTITY</h2>
                <p className="text-sm text-zinc-500 uppercase tracking-wide">NAME. FACE. CITY. THIS IS PERMANENT.</p>
              </div>

              {/* Stage Name */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold">
                    Stage Name *
                  </label>
                  <Tooltip content="Your battle rap persona name. This will be displayed in all battles and rankings. Choose wisely - you can't change it later!">
                    <span className="text-zinc-500 cursor-help text-xs">ⓘ</span>
                  </Tooltip>
                </div>
                <input
                  type="text"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  placeholder="Enter your battle name"
                  maxLength={30}
                  className="w-full px-4 py-3 bg-[#18191c] border-2 border-[#3a3d44] text-zinc-100 placeholder-zinc-600 focus:border-[#ff8c42] focus:outline-none uppercase font-bold tracking-wide"
                />
                <p className="text-xs text-zinc-600 mt-1">{stageName.length}/30 characters</p>
              </div>

              {/* Face Selection */}
              <div>
                <div className="flex items-end justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold">
                      Choose Your Face *
                    </label>
                    <Tooltip content="Faces are exclusive. Once a face gets claimed by any battler, it's gone from the pool forever. Shuffle to see more of what's left.">
                      <span className="text-zinc-500 cursor-help text-xs">ⓘ</span>
                    </Tooltip>
                  </div>
                  <button
                    onClick={fetchAvatarPool}
                    disabled={avatarLoading}
                    className="px-3 py-1.5 border-2 border-[#3a3d44] text-zinc-300 text-xs font-display font-black uppercase tracking-wider hover:border-[#ff8c42] hover:text-[#ff8c42] transition disabled:opacity-40"
                  >
                    SHUFFLE THE LINEUP
                  </button>
                </div>
                {avatarPool && (
                  <p className="font-mono text-[13px] uppercase tracking-wider text-zinc-500 mb-3">
                    <span className="text-[#ff8c42] font-bold">{avatarPool.claimed}</span> OF {avatarPool.total} FACES CLAIMED — YOURS IS FOREVER
                  </p>
                )}
                <div className="bg-[#101114] border-2 border-[#3a3d44] p-3">
                  {faceGrid.length === 0 ? (
                    <p className="py-10 text-center text-xs font-mono uppercase tracking-wider text-zinc-600">
                      {avatarLoading ? 'LOADING THE LINEUP...' : 'NO FACES LEFT IN THE POOL'}
                    </p>
                  ) : (
                    <div className={`grid grid-cols-6 gap-2 transition-opacity ${avatarLoading ? 'opacity-40' : 'opacity-100'}`}>
                      {faceGrid.map((sprite) => {
                        const isSelected = selectedAvatar === sprite;
                        return (
                          <div
                            key={sprite}
                            data-face={sprite}
                            onClick={() => setSelectedAvatar(sprite)}
                            className={`relative cursor-pointer aspect-square bg-[#0a0a0a] overflow-hidden transition ${
                              isSelected
                                ? 'border-[3px] border-[#ff8c42] shadow-[0_0_15px_rgba(255,140,66,0.6)]'
                                : 'border-2 border-[#3a3d44] hover:border-zinc-500'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sprite}
                              alt="Battler face"
                              style={portraitFillStyle(sprite)}
                              loading="lazy"
                            />
                            {SPRITE_GENDER[sprite] && (
                              <span
                                className={`absolute top-1 right-1 z-10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase leading-none border ${
                                  SPRITE_GENDER[sprite] === 'female'
                                    ? 'bg-[#E23A2E]/85 border-black text-white'
                                    : 'bg-[#101114]/85 border-[#3a3d44] text-zinc-300'
                                }`}
                              >
                                {SPRITE_GENDER[sprite] === 'female' ? 'F' : 'M'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Origin — how you came up. Bakes a PERMANENT identity label. */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold">
                    How You Came Up *
                  </label>
                  <Tooltip content="Your origin story. It bakes a permanent label on your record — PEN FIRST, INTERNET BATTLER, or CIRCLE TESTED — and it never comes off. Pick the lane you really started in.">
                    <span className="text-zinc-500 cursor-help text-xs">ⓘ</span>
                  </Tooltip>
                </div>
                <p className="font-mono text-[13px] uppercase tracking-wider text-zinc-500 mb-3">
                  EVERYBODY STARTED SOMEWHERE — THIS ONE STICKS FOR GOOD
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ORIGIN_OPTIONS.map((o) => {
                    const isSelected = selectedOrigin === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        data-origin={o.value}
                        onClick={() => setSelectedOrigin(o.value)}
                        className={`relative flex flex-col text-left cursor-pointer p-4 border-2 transition min-h-[132px] ${
                          isSelected
                            ? 'border-[#ff8c42] bg-[#ff8c42]/10 shadow-[0_0_15px_rgba(255,140,66,0.4)]'
                            : 'border-[#3a3d44] bg-[#2d2f35] hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name={o.icon} size={20} className={isSelected ? 'text-[#ff8c42]' : 'text-zinc-300'} />
                          <h4 className="font-display font-black uppercase tracking-tight text-sm text-white">
                            {o.label}
                          </h4>
                        </div>
                        <span
                          className={`self-start mb-2 px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider border ${
                            isSelected
                              ? 'bg-[#ff8c42]/20 border-[#ff8c42]/50 text-[#ff8c42]'
                              : 'bg-black/30 border-[#3a3d44] text-zinc-400'
                          }`}
                        >
                          {o.lane}
                        </span>
                        <p className="text-xs text-zinc-400 leading-snug">{o.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hometown — the detailed identity (neighborhood-level, searchable) */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold">
                    Where You Really From? *
                  </label>
                  <Tooltip content="Your hometown — down to the neighborhood. It's your identity on the mic, and the crowd rides different when you're on home turf.">
                    <span className="text-zinc-500 cursor-help text-xs">ⓘ</span>
                  </Tooltip>
                </div>
                <p className="font-mono text-[13px] uppercase tracking-wider text-zinc-500 mb-3">
                  TYPE YOUR CITY OR NEIGHBORHOOD — MIAMI GARDENS, BED-STUY, 3RD WARD…
                </p>
                {selectedHometown ? (
                  <div className="flex items-center justify-between bg-[#101114] border-2 border-[#ff8c42] px-4 py-3">
                    <span className="font-display font-black uppercase tracking-wide text-zinc-100">
                      {selectedHometown}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setSelectedHometown(null); setHometownQuery(''); }}
                      className="text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-[#ff8c42]"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={hometownQuery}
                      onChange={(e) => setHometownQuery(e.target.value)}
                      placeholder="Start typing your hometown…"
                      className="w-full bg-[#101114] border-2 border-[#3a3d44] focus:border-[#ff8c42] outline-none px-4 py-3 text-zinc-100 font-display uppercase tracking-wide"
                    />
                    {hometownQuery.trim().length >= 2 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-[#101114] border-2 border-[#3a3d44] shadow-[4px_4px_0_rgba(0,0,0,.5)]">
                        {HOMETOWN_OPTIONS
                          .filter((o) => o.search.includes(hometownQuery.trim().toLowerCase()))
                          .slice(0, 40)
                          .map((o) => (
                            <button
                              key={o.label}
                              type="button"
                              onClick={() => { setSelectedHometown(o.label); setHometownQuery(''); }}
                              className="w-full text-left px-4 py-2.5 hover:bg-[#ff8c42]/10 border-b border-[#2E2F35] last:border-0"
                            >
                              <span className="text-zinc-100 font-display font-bold uppercase text-sm">
                                {o.neighborhood ?? o.city}
                              </span>
                              {o.neighborhood && (
                                <span className="text-zinc-500 text-xs ml-2">{o.city}, {o.state}</span>
                              )}
                            </button>
                          ))}
                        {HOMETOWN_OPTIONS.filter((o) => o.search.includes(hometownQuery.trim().toLowerCase())).length === 0 && (
                          <p className="px-4 py-3 text-zinc-500 text-sm font-mono uppercase">No match — try the city name</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Home City Selection — the gameplay city (leagues + venues) */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold">
                    Claim Your Scene *
                  </label>
                  <Tooltip content="Your hometown is your identity. It's where your career starts, who you can recruit, and where the local crowd rides for you.">
                    <span className="text-zinc-500 cursor-help text-xs">ⓘ</span>
                  </Tooltip>
                </div>
                <p className="font-mono text-[13px] uppercase tracking-wider text-zinc-500 mb-3">
                  HOMETOWNS AREN'T MADE UP — PICK A REAL SCENE
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {cities.map((city) => {
                    const isSelected = selectedHomeCity === city.id;
                    return (
                      <div
                        key={city.id}
                        data-city={city.id}
                        onClick={() => setSelectedHomeCity(city.id)}
                        className={`relative cursor-pointer overflow-hidden min-h-[96px] transition group ${
                          isSelected
                            ? 'border-[3px] border-[#ff8c42] shadow-[0_0_15px_rgba(255,140,66,0.5)]'
                            : 'border-2 border-[#3a3d44] hover:border-zinc-500'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
                        {city.skyline_url && (
                          <div className="absolute inset-0">
                            <Image
                              src={city.skyline_url}
                              alt={`${city.name} skyline`}
                              fill
                              className="object-cover opacity-60 [image-rendering:pixelated] group-hover:opacity-75 transition-opacity"
                              unoptimized
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                        <div className="relative p-3 pt-8 flex flex-col justify-end h-full">
                          <h4 className="font-display font-black uppercase tracking-tight text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            {city.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono text-[12px] uppercase tracking-wider text-zinc-400">
                              {city.state || city.country || ''}
                            </span>
                            {city.culture_style && (
                              <span className="px-1.5 py-0.5 bg-[#ff8c42]/20 border border-[#ff8c42]/40 text-[#ff8c42] font-mono text-[11px] uppercase tracking-wider">
                                {city.culture_style}
                              </span>
                            )}
                          </div>
                          {/* Where you're from determines what you start with */}
                          <p className="font-mono text-[11px] uppercase tracking-wider text-green-400/90 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            {getCityBonus(city.culture_style, city.scene_size).labels.join(' · ')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!stageName.trim() || !selectedAvatar || !selectedOrigin || !selectedHomeCity}
                className="w-full py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-black uppercase tracking-wider transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                NEXT
              </button>
            </div>
          )}

          {/* Step 3: League Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-black uppercase tracking-tight mb-1">
                  YOUR HOME LEAGUE
                </h2>
                <p className="text-sm text-zinc-500 uppercase tracking-wide">
                  {selectedCityObj
                    ? `The rooms running in ${selectedCityObj.name} — start where they know your name`
                    : 'Choose your competition format'}
                </p>
              </div>

              {/* Your first booking happens in YOUR city — the leagues that
                  actually run in the scene you claimed, easiest rung first. */}
              <div className={`grid grid-cols-1 ${cityLeagues.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                {cityLeagues.map((league) => {
                  const isOnline = !league.city_id;
                  const venue = isOnline
                    ? getLeagueVisuals(league.name).venue
                    : selectedCityObj?.skyline_url || getLeagueVisuals(league.name).venue;
                  const tier = leagueTier(league.prestige_level, league.city_id);
                  const isSelected = selectedLeague === league.id;
                  return (
                    <div
                      key={league.id}
                      onClick={() => setSelectedLeague(league.id)}
                      className={`relative overflow-hidden cursor-pointer transition group min-h-[300px] ${
                        isSelected
                          ? 'border-[#ff8c42] border-[3px] shadow-[0_0_20px_rgba(255,140,66,0.5)]'
                          : 'border-[#3a3d44] border-2 hover:border-zinc-600'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
                      <div className="absolute inset-0">
                        <Image
                          src={venue}
                          alt={`${league.name} in ${selectedCityObj?.name || 'your city'}`}
                          fill
                          className="object-cover opacity-60 [image-rendering:pixelated]"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* Tier badge — top corner */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[12px] font-display font-black uppercase tracking-widest border ${
                          tier === 'PREMIER'
                            ? 'bg-[#ff8c42] text-black border-[#ff8c42]'
                            : tier === 'ONLINE'
                            ? 'bg-black/60 text-zinc-300 border-zinc-400/60'
                            : 'bg-black/60 text-[#ff8c42] border-[#ff8c42]/50'
                        }`}>
                          {tier}
                        </span>
                        <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                          {league.short_code}
                        </span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                        <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-2 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                          {league.name}
                        </h3>
                        <p className="text-xs text-zinc-200 font-bold leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mb-3 line-clamp-2">
                          {league.description || `${league.round_length_minutes}-minute rounds.`}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          {isOnline ? (
                            <span className="inline-block px-2 py-1 bg-black/60 border border-zinc-400/50 text-zinc-300 text-[11px] font-display font-black uppercase tracking-widest">
                              WORLDWIDE
                            </span>
                          ) : selectedCityObj && (
                            <span className="inline-block px-2 py-1 bg-black/60 border border-[#ff8c42]/50 text-[#ff8c42] text-[11px] font-display font-black uppercase tracking-widest">
                              {selectedCityObj.name}
                            </span>
                          )}
                          {league.base_payout ? (
                            <span className="inline-block px-2 py-1 bg-black/60 border border-green-500/50 text-green-400 text-[11px] font-display font-black uppercase tracking-widest">
                              ${Number(league.base_payout).toLocaleString()} PURSE
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 border-2 border-[#3a3d44] text-zinc-400 font-black uppercase tracking-wider hover:bg-zinc-800 transition"
                >
                  BACK
                </button>
                <button
                  // Quick Start: the template already set attributes + styles, so
                  // skip straight to review (edit buttons there reopen any step).
                  onClick={() =>
                    setStep(
                      selectedTemplate && selectedTemplate.id !== 'custom' && allocatedAttributes && selectedStyles.length > 0
                        ? 6
                        : 4
                    )
                  }
                  disabled={!selectedLeague}
                  className="flex-1 py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-black uppercase tracking-wider transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {selectedTemplate && selectedTemplate.id !== 'custom' && allocatedAttributes && selectedStyles.length > 0
                    ? 'REVIEW & CREATE →'
                    : 'NEXT'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Attributes */}
          {step === 4 && (
            <AttributeAllocationStep
              onNext={(attributes) => {
                setAllocatedAttributes(attributes);
                setStep(5);
              }}
              onBack={() => setStep(3)}
              initialAttributes={allocatedAttributes || undefined}
              suggestedLeague={selectedTemplate?.suggestedLeague || undefined}
            />
          )}

          {/* Step 5: Styles */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">DEFINE YOUR STYLE</h2>
                <p className="text-sm text-zinc-500 uppercase tracking-wide">SELECTED STYLES: {selectedStyles.length}/3</p>
              </div>

              {/* Grid of style buttons matching mockup */}
              <div className="grid grid-cols-3 gap-3">
                {STYLE_TAGS.map((style) => {
                  const icons: Record<string, string> = {
                    angles: 'target',
                    comedy: 'heart',
                    storytelling: 'book',
                    gun_bars: 'flame',
                    wordplay: 'pen',
                    freestyle: 'bolt',
                  };

                  return (
                    <button
                      key={style.value}
                      onClick={() => toggleStyle(style.value)}
                      disabled={!selectedStyles.includes(style.value) && selectedStyles.length >= 3}
                      className={`p-4 border-2 cursor-pointer transition font-display font-black uppercase tracking-wider text-base flex items-center justify-center gap-2 min-h-[60px] ${
                        selectedStyles.includes(style.value)
                          ? 'border-[#ff8c42] bg-[#ff8c42] text-black shadow-[0_0_15px_rgba(255,140,66,0.5)]'
                          : 'border-[#3a3d44] hover:border-zinc-600 text-white bg-[#2d2f35]'
                      } ${
                        !selectedStyles.includes(style.value) && selectedStyles.length >= 3
                          ? 'opacity-30 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      <Icon name={(icons[style.value] || 'star') as any} size={20} />
                      <span>{style.label}</span>
                    </button>
                  );
                })}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-4 border-2 border-[#3a3d44] text-white font-black uppercase tracking-wider hover:bg-zinc-800 transition"
                >
                  ← BACK
                </button>
                <button
                  onClick={() => setStep(6)}
                  disabled={selectedStyles.length === 0}
                  className="flex-1 py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-black uppercase tracking-wider transition disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,140,66,0.4)]"
                >
                  NEXT →
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {step === 6 && allocatedAttributes && selectedLeagueObj && (
            <ReviewStep
              stageName={stageName}
              avatarUrl={selectedAvatar}
              cityName={selectedCityObj ? `${selectedCityObj.name}${selectedCityObj.state ? `, ${selectedCityObj.state}` : ''}` : ''}
              league={selectedLeagueObj}
              attributes={allocatedAttributes}
              styles={selectedStyles}
              onBack={() => setStep(5)}
              onConfirm={handleSubmit}
              onEdit={(editStep) => setStep(editStep)}
            />
          )}

          {loading && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="text-center">
                <div className="mb-4 animate-pulse text-[#ff8c42] flex justify-center"><Icon name="mic" size={44} /></div>
                <p className="text-xl font-black uppercase tracking-wider">CREATING YOUR BATTLER...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
