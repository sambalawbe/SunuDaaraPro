import React from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Link2, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface AvatarSelectorProps {
  value: string;
  onChange: (url: string) => void;
  t: (key: string) => string;
  defaultCategory?: 'child' | 'man' | 'woman';
}

const PRESETS = {
  child: [
    { name: 'Liam', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
    { name: 'Emma', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    { name: 'Noah', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah' },
    { name: 'Olivia', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia' },
  ],
  man: [
    { name: 'Jack', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
    { name: 'Oliver', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver' },
    { name: 'James', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' },
    { name: 'Lucas', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas' },
  ],
  woman: [
    { name: 'Sophia', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' },
    { name: 'Isabella', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella' },
    { name: 'Mia', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia' },
    { name: 'Charlotte', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte' },
  ]
};

export function AvatarSelector({ value, onChange, t, defaultCategory = 'child' }: AvatarSelectorProps) {
  // Determine if current value is custom URL or preset
  const allPresetUrls = Object.values(PRESETS).flatMap(category => category.map(item => item.url));
  const isPreset = !value || allPresetUrls.includes(value);

  const [mode, setMode] = React.useState<'preset' | 'url'>(isPreset ? 'preset' : 'url');
  const [activeCategory, setActiveCategory] = React.useState<'child' | 'man' | 'woman'>(() => {
    if (!isPreset) return defaultCategory;
    // Find category of the value
    for (const [cat, list] of Object.entries(PRESETS)) {
      if (list.some(item => item.url === value)) {
        return cat as 'child' | 'man' | 'woman';
      }
    }
    return defaultCategory;
  });

  const handleSelectPreset = (url: string) => {
    onChange(url);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start md:col-span-2">
      {/* Live Preview Column */}
      <div className="flex flex-col items-center gap-3 shrink-0">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('photo_or_avatar')}</span>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-green-600/20 to-emerald-500/20 rounded-2xl blur-md opacity-70" />
          <div className="relative w-24 h-24 rounded-2xl bg-white border border-gray-100 overflow-hidden flex items-center justify-center shadow-inner">
            {value ? (
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback icon on image error
                  (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder';
                }}
              />
            ) : (
              <User className="w-12 h-12 text-gray-300 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Control Panel Column */}
      <div className="flex-1 w-full space-y-4">
        {/* Toggle Mode Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setMode('preset')}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2",
              mode === 'preset'
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            {t('avatar_mode')}
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2",
              mode === 'url'
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Link2 className="w-3.5 h-3.5" />
            {t('url_mode')}
          </button>
        </div>

        {/* Content depending on selected mode */}
        {mode === 'preset' ? (
          <div className="space-y-3.5">
            {/* Category selection */}
            <div className="flex gap-2">
              {(['child', 'man', 'woman'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                    activeCategory === cat
                      ? "bg-green-50 border-green-200 text-green-700 font-bold"
                      : "bg-white border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
                  )}
                >
                  {cat === 'child' ? t('avatar_type_child') : cat === 'man' ? t('avatar_type_man') : t('avatar_type_woman')}
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-3 max-w-sm">
              {PRESETS[activeCategory].map((item) => {
                const isSelected = value === item.url;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectPreset(item.url)}
                    className={cn(
                      "relative aspect-square rounded-xl bg-white border overflow-hidden transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 group focus:outline-none",
                      isSelected
                        ? "border-green-600 ring-2 ring-green-600/20 shadow-md shadow-green-700/5"
                        : "border-gray-200/70 hover:border-gray-300"
                    )}
                  >
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover p-0.5" />
                    {isSelected && (
                      <motion.div
                        layoutId="active-avatar-dot"
                        className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-green-600 rounded-full border border-white"
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('custom_url')}</label>
            <div className="relative">
              <input
                type="url"
                value={isPreset ? '' : value}
                onChange={handleUrlChange}
                placeholder={t('custom_url_placeholder')}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/20 text-sm text-black placeholder:text-gray-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
