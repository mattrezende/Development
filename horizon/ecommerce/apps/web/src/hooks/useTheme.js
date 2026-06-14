
import { useEffect, useState } from 'react';
import pb from '@/lib/pocketbaseClient';

// Helper to convert HEX to HSL string for Tailwind
const hexToHSL = (hex) => {
  if (!hex) return null;
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  } else {
    return null;
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const useTheme = () => {
  const [themeSettings, setThemeSettings] = useState(null);

  const applyTheme = (settings) => {
    const root = document.documentElement;
    if (settings.primary_color) {
      const hsl = hexToHSL(settings.primary_color);
      if (hsl) root.style.setProperty('--primary', hsl);
    }
    if (settings.secondary_color) {
      const hsl = hexToHSL(settings.secondary_color);
      if (hsl) root.style.setProperty('--secondary', hsl);
    }
    if (settings.accent_color) {
      const hsl = hexToHSL(settings.accent_color);
      if (hsl) root.style.setProperty('--accent', hsl);
    }
  };

  const loadTheme = async () => {
    try {
      const result = await pb.collection('theme_settings').getList(1, 1, { $autoCancel: false });
      if (result.items.length > 0) {
        const settings = result.items[0];
        setThemeSettings(settings);
        applyTheme(settings);
      }
    } catch (error) {
      console.error("Error loading theme settings:", error);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  return { themeSettings, updateTheme: loadTheme };
};
