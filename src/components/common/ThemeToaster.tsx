'use client';

import { Toaster as Sonner } from 'sonner';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function ThemeToaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 dark:group-[.toaster]:bg-slate-900 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-slate-800',
          description: 'group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400',
          actionButton:
            'group-[.toast]:bg-sky-600 group-[.toast]:text-white dark:group-[.toast]:bg-sky-700',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-400',
        },
      }}
      {...props}
    />
  );
}
