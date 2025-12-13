import { useAuth } from '../context/AuthContext';

export const useUserColors = () => {
  const { userType } = useAuth();
  
  const isPolice = userType === 'police';
  
  return {
    // Base colors
    accent: isPolice ? 'police' : 'citizen',
    accentHex: isPolice ? '#1A3D64' : '#8E1616',
    
    // Tailwind classes
    bg: isPolice ? 'bg-police' : 'bg-citizen',
    bgLight: isPolice ? 'bg-police-light' : 'bg-citizen-light',
    bgDark: isPolice ? 'bg-police-dark' : 'bg-citizen-dark',
    text: isPolice ? 'text-police' : 'text-citizen',
    textLight: isPolice ? 'text-police-light' : 'text-citizen-light',
    textDark: isPolice ? 'text-police-dark' : 'text-citizen-dark',
    border: isPolice ? 'border-police' : 'border-citizen',
    hoverBg: isPolice ? 'hover:bg-police' : 'hover:bg-citizen',
    hoverBgLight: isPolice ? 'hover:bg-police-light' : 'hover:bg-citizen-light',
    hoverText: isPolice ? 'hover:text-police' : 'hover:text-citizen',
    focusRing: isPolice ? 'focus:ring-police' : 'focus:ring-citizen',
    focusBorder: isPolice ? 'focus:border-police' : 'focus:border-citizen',
  };
};
