'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, MessageSquare, BookOpen, Phone, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { href: '/', key: 'home', label: 'Home', icon: Home },
  { href: '/map', key: 'map', label: 'Map', icon: Map },
  { href: '/chat', key: 'chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/first-aid', key: 'emergency', label: 'First Aid', icon: BookOpen },
  { href: '/directory', key: 'directory', label: 'Services', icon: Phone },
  { href: '/settings', key: 'settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-gray-950/95 backdrop-blur-xl"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around px-1 pb-safe">
        {NAV_ITEMS.map(({ href, key, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 min-w-[52px] rounded-xl transition-colors',
                active ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              <span className={cn('text-[9px] font-semibold tracking-wide', active ? 'text-red-500' : 'text-gray-500')}>
                {t(`nav.${key}`, label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
