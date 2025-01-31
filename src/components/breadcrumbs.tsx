'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useChain } from '@/lib/chain-switcher/chain-context';

export function Breadcrumbs() {
  const pathname = usePathname();
  const { selectedChain } = useChain();

  // Don't show breadcrumbs on home page
  if (pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    let label = segment;
    let isClickable = true;

    // Format the label based on the segment type
    if (index === 0) {
      // Chain segment
      label = selectedChain.name;
    } else if (segment === 'token' || segment === 'account') {
      label = segment.charAt(0).toUpperCase() + segment.slice(1);
      isClickable = false;
    } else if (index === pathSegments.length - 1 && segment.length > 12) {
      // Last segment and it's a long ID - truncate it
      label = `${segment.slice(0, 6)}...${segment.slice(-4)}`;
    }

    return {
      path,
      label,
      isLast: index === pathSegments.length - 1,
      isClickable
    };
  });

  return (
    <div className="w-full">
      <div className="mx-8 py-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-1 text-sm text-text-secondary">
            {breadcrumbs.map(({ path, label, isLast, isClickable }, index) => (
              <div key={path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 mx-1.5 text-text-tertiary flex-shrink-0" />
                )}
                {isLast || !isClickable ? (
                  <span className="text-text-primary font-medium">{label}</span>
                ) : (
                  <Link 
                    href={path}
                    className="hover:text-text-primary transition-colors"
                  >
                    {label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 
