'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from './ImageUpload';
import BattlerAvatar from './BattlerAvatar';
import BattlerBanner from './BattlerBanner';

type Props = {
  battler: {
    id: string;
    stage_name: string;
    avatar_url?: string | null;
    banner_url?: string | null;
    tier?: string;
  };
};

export default function ProfileSettingsClient({ battler: initialBattler }: Props) {
  const [battler, setBattler] = useState(initialBattler);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleAvatarUploadSuccess = (url: string) => {
    setBattler({ ...battler, avatar_url: url });
    setSuccessMessage('Avatar uploaded successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
    router.refresh();
  };

  const handleAvatarDeleteSuccess = () => {
    setBattler({ ...battler, avatar_url: null });
    setSuccessMessage('Avatar deleted successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
    router.refresh();
  };

  const handleBannerUploadSuccess = (url: string) => {
    setBattler({ ...battler, banner_url: url });
    setSuccessMessage('Banner uploaded successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
    router.refresh();
  };

  const handleBannerDeleteSuccess = () => {
    setBattler({ ...battler, banner_url: null });
    setSuccessMessage('Banner deleted successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#18191c]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-400 font-display font-black uppercase tracking-wider text-sm mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            BACK TO DASHBOARD
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-100 mb-2">
            PROFILE SETTINGS
          </h1>
          <p className="text-zinc-500 font-display font-black uppercase tracking-wide text-sm">
            {battler.stage_name}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border-2 border-green-500/30 rounded">
            <p className="text-green-500 font-display font-black uppercase tracking-wide text-sm">
              {successMessage}
            </p>
          </div>
        )}

        {/* Banner Section */}
        <div className="mb-8 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-100 mb-4">
            BANNER IMAGE
          </h2>
          <p className="text-zinc-500 font-display font-black uppercase tracking-wide text-xs mb-6">
            RECOMMENDED: 1200x300px • MAX 10MB
          </p>

          {/* Banner Preview */}
          <div className="mb-6">
            <BattlerBanner battler={battler} showOverlay={false} />
          </div>

          {/* Banner Upload */}
          <ImageUpload
            type="banner"
            currentImageUrl={battler.banner_url || null}
            onUploadSuccess={handleBannerUploadSuccess}
            onDeleteSuccess={handleBannerDeleteSuccess}
          />
        </div>

        {/* Avatar Section */}
        <div className="mb-8 bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-zinc-100 mb-4">
            AVATAR IMAGE
          </h2>
          <p className="text-zinc-500 font-display font-black uppercase tracking-wide text-xs mb-6">
            RECOMMENDED: 400x400px SQUARE • MAX 5MB
          </p>

          {/* Avatar Preview */}
          <div className="mb-6 flex justify-center">
            <BattlerAvatar battler={battler} size="2xl" showBorder />
          </div>

          {/* Avatar Upload */}
          <ImageUpload
            type="avatar"
            currentImageUrl={battler.avatar_url || null}
            onUploadSuccess={handleAvatarUploadSuccess}
            onDeleteSuccess={handleAvatarDeleteSuccess}
          />
        </div>

        {/* Image Guidelines */}
        <div className="bg-[#2d2f35] border-2 border-[#3a3d44] rounded-lg p-6">
          <h3 className="text-lg font-black uppercase tracking-tighter text-zinc-100 mb-4">
            IMAGE GUIDELINES
          </h3>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#ff8c42] font-bold">•</span>
              <span className="font-display font-black uppercase tracking-wide">
                ACCEPTED FORMATS: JPEG, PNG, WEBP
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ff8c42] font-bold">•</span>
              <span className="font-display font-black uppercase tracking-wide">
                AVATAR: SQUARE IMAGE (400x400px RECOMMENDED), MAX 5MB
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ff8c42] font-bold">•</span>
              <span className="font-display font-black uppercase tracking-wide">
                BANNER: WIDE IMAGE (1200x300px RECOMMENDED), MAX 10MB
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ff8c42] font-bold">•</span>
              <span className="font-display font-black uppercase tracking-wide">
                IMAGES ARE PUBLICLY VISIBLE IN BATTLES AND TOURNAMENTS
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ff8c42] font-bold">•</span>
              <span className="font-display font-black uppercase tracking-wide">
                IF NO IMAGE IS UPLOADED, A DEFAULT WILL BE SHOWN
              </span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[#ff8c42] text-zinc-950 rounded font-black uppercase tracking-wider text-sm hover:bg-[#ff9d5c]"
          >
            DONE
          </Link>
        </div>
      </div>
    </div>
  );
}
