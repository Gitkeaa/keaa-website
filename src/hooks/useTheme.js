import { useEffect, useState } from 'react';

export default function useTheme() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('keaa-theme') === 'dark' ||
      (!localStorage.getItem('keaa-theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('keaa-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('keaa-theme', 'light');
    }
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}