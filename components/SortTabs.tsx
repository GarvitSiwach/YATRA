import Link from 'next/link';

type SortTabsProps = {
  activeSort: 'latest' | 'top';
};

export default function SortTabs({ activeSort }: SortTabsProps): JSX.Element {
  const tabs: Array<{ id: 'latest' | 'top'; label: string; href: string }> = [
    { id: 'latest', label: 'Latest', href: '/feed?sort=latest' },
    { id: 'top', label: 'Most Liked (Top Trips)', href: '/feed?sort=top' }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = activeSort === tab.id;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ease-out ${
              active
                ? 'bg-[#1B1B1F] text-white shadow-glow'
                : 'border border-[#1B1B1F]/15 text-[#1B1B1F]/75 hover:border-[#CBA258] hover:text-[#1B1B1F]'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
