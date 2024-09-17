'use client';

import { Link } from '@/navigation';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

type NavLink = {
  name: string;
  href: string;
};

interface NavigationProps {
  listClass?: string;
  headerNav: NavLink[];
  renderAfterItem?: (index: number, headerNav: NavLink[]) => React.ReactNode;
  onClickLink?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  headerNav,
  renderAfterItem,
  onClickLink,
  listClass = 'flex items-center',
}) => {
  const pathname = usePathname();

  return (
    <>
      {headerNav.map(({ name, href }, idx) => (
        <li className={`${listClass}`} key={name}>
          <Link
            aria-label="navigation link"
            href={href}
            onClick={onClickLink}
            className={clsx(
              'text-m font-medium uppercase leading-[1.25] transition-all duration-300 hover:text-hover',
              {
                'text-accent': pathname === href,
              }
            )}
          >
            {name}
          </Link>
          {renderAfterItem && renderAfterItem(idx, headerNav)}
        </li>
      ))}
    </>
  );
};
