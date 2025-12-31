'use client';

import { useState, useEffect } from 'react';
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
};

const STYLE_TAGS = [
  { value: 'angles', label: 'Angles', description: 'Personal attacks' },
  { value: 'comedy', label: 'Comedy', description: 'Humor and wit' },
  { value: 'storytelling', label: 'Storytelling', description: 'Narrative verses' },
  { value: 'gun_bars', label: 'Gun Bars', description: 'Violent imagery' },
  { value: 'wordplay', label: 'Wordplay', description: 'Word manipulation' },
  { value: 'freestyle', label: 'Freestyle', description: 'Improvisation' },
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
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data
  const [selectedTemplate, setSelectedTemplate] = useState<BattlerTemplate | null>(null);
  const [stageName, setStageName] = useState('');
  const [region, setRegion] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [allocatedAttributes, setAllocatedAttributes] = useState<AllocatedAttributes | null>(null);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.stageName) setStageName(parsed.stageName);
        if (parsed.region) setRegion(parsed.region);
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
        region,
        selectedLeague,
        allocatedAttributes,
        selectedStyles,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [step, stageName, region, selectedLeague, allocatedAttributes, selectedStyles]);

  useEffect(() => {
    const fetchLeagues = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('leagues').select('*').order('round_length_minutes');
      if (data) {
        setLeagues(data);
      }
    };
    fetchLeagues();
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
          region: region || null,
          primary_league_id: selectedLeague,
          style_tags: selectedStyles,
          allocated_attributes: allocatedAttributes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create battler');
      }

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

  // Get selected league object
  const selectedLeagueObj = leagues.find((l) => l.id === selectedLeague);

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

          {/* Step 2: Identity */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-6">YOUR IDENTITY</h2>
                <div className="space-y-4">
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
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-xs uppercase tracking-wider text-zinc-500 font-bold">
                        Region (Optional)
                      </label>
                      <Tooltip content="Your geographical origin. This is purely for flavor and doesn't affect gameplay.">
                        <span className="text-zinc-500 cursor-help text-xs">ⓘ</span>
                      </Tooltip>
                    </div>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g., NYC, LONDON, LA"
                      className="w-full px-4 py-3 bg-[#18191c] border-2 border-[#3a3d44] text-zinc-100 placeholder-zinc-600 focus:border-[#ff8c42] focus:outline-none uppercase tracking-wide"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep(3)}
                disabled={!stageName.trim()}
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
                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">LEAGUE SELECTION</h2>
                <p className="text-sm text-zinc-500 uppercase tracking-wide">CHOOSE YOUR COMPETITION FORMAT</p>
              </div>

              {/* 2-Column Grid matching mockup */}
              <div className="grid grid-cols-2 gap-4">
                {leagues.slice(0, 2).map((league) => {
                  const visuals = getLeagueVisuals(league.name);
                  return (
                    <div
                      key={league.id}
                      onClick={() => setSelectedLeague(league.id)}
                      className={`relative overflow-hidden cursor-pointer transition group min-h-[300px] ${
                        selectedLeague === league.id
                          ? 'border-[#ff8c42] border-[3px] shadow-[0_0_20px_rgba(255,140,66,0.5)]'
                          : 'border-[#3a3d44] border-2 hover:border-zinc-600'
                      }`}
                    >
                      {/* Background - gradient fallback */}
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />

                      {/* Venue Image */}
                      <div className="absolute inset-0">
                        <Image
                          src={visuals.venue}
                          alt={`${league.name} venue`}
                          fill
                          className="object-cover opacity-60"
                          unoptimized
                          onError={(e) => {
                            // Hide broken image
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      {/* League Name & Description - Centered at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
                        <h3 className="text-3xl font-black uppercase tracking-tight mb-3 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                          {league.name}
                        </h3>
                        <p className="text-base text-zinc-200 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {league.name === 'Small Room Circuit'
                            ? 'Intimate battles.\nFocus on bars & performance.'
                            : 'Grand stage.\nHigh stakes, media attention.'}
                        </p>
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
                  onClick={() => setStep(4)}
                  disabled={!selectedLeague}
                  className="flex-1 py-4 bg-[#ff8c42] hover:bg-[#ff9d5c] text-black font-black uppercase tracking-wider transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  NEXT
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
                    angles: '🎯',
                    comedy: '😂',
                    storytelling: '📖',
                    gun_bars: '💥',
                    wordplay: '💬',
                    freestyle: '⚡',
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
                      <span className="text-2xl">{icons[style.value]}</span>
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
              region={region}
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
                <div className="text-5xl mb-4 animate-pulse">🎤</div>
                <p className="text-xl font-black uppercase tracking-wider">CREATING YOUR BATTLER...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
