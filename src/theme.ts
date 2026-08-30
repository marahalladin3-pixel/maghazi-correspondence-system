export type ThemeChoice='فاتح'|'داكن'|'حسب الجهاز';
export const storedTheme=():ThemeChoice=>(localStorage.getItem('municipality-theme') as ThemeChoice)||'فاتح';
export function applyTheme(choice:ThemeChoice){
  const dark=choice==='داكن'||(choice==='حسب الجهاز'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=dark?'dark':'light';
  document.documentElement.style.colorScheme=dark?'dark':'light';
}
export function saveTheme(choice:ThemeChoice){localStorage.setItem('municipality-theme',choice);applyTheme(choice)}
