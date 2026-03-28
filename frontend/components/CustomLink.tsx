'use client';

import Link from 'next/link';
import { ComponentProps, ReactNode } from 'react';
import NProgress from 'nprogress';

interface CustomLinkProps extends Omit<ComponentProps<typeof Link>, 'onClick'> {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function CustomLink({ href, children, onClick, ...props }: CustomLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    NProgress.start();
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}