import { useWindowDimensions } from 'react-native';
import { Breakpoints } from '@/constants/theme';

/**
 * Hook para Responsive Design y simulación de Media Queries en React Native / Expo.
 * Escucha cambios en tiempo real de ancho, alto, rotación y redimensionamiento de pantalla.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // Estados de pantalla (Breakpoints)
  const isSmallMobile = width < Breakpoints.xs;  // < 380px
  const isMobile = width < Breakpoints.md;       // < 768px
  const isTablet = width >= Breakpoints.md && width < Breakpoints.lg; // 768px a 991px
  const isDesktop = width >= Breakpoints.lg;     // >= 992px
  const isLandscape = width > height;

  /**
   * Helper tipo CSS Media Query:
   * Ejemplo: mediaQuery({ minWidth: 768 }) => true / false
   */
  const mediaQuery = (query) => {
    if (query.minWidth !== undefined && width < query.minWidth) return false;
    if (query.maxWidth !== undefined && width > query.maxWidth) return false;
    if (query.minHeight !== undefined && height < query.minHeight) return false;
    if (query.maxHeight !== undefined && height > query.maxHeight) return false;
    if (query.orientation) {
      const currentOrientation = isLandscape ? 'landscape' : 'portrait';
      if (query.orientation !== currentOrientation) return false;
    }
    return true;
  };

  /**
   * Helper selector según breakpoint (mobile, tablet, desktop)
   * Ejemplo: select({ mobile: 14, tablet: 16, desktop: 18 })
   */
  const select = (values) => {
    if (isDesktop && values.desktop !== undefined) return values.desktop;
    if (isTablet && values.tablet !== undefined) return values.tablet;
    if (isMobile && values.mobile !== undefined) return values.mobile;
    return values.default !== undefined ? values.default : (values.mobile ?? values.tablet ?? values.desktop);
  };

  /**
   * Calcula el número de columnas para un Grid dinámico
   * @param {number} itemMinWidth Ancho mínimo que debe tener cada tarjeta
   * @param {number} maxContainerWidth Ancho máximo del contenedor padre (por defecto 900)
   */
  const getGridColumns = (itemMinWidth = 280, maxContainerWidth = 900) => {
    const effectiveWidth = Math.min(width - 32, maxContainerWidth);
    return Math.max(1, Math.floor(effectiveWidth / itemMinWidth));
  };

  /**
   * Ancho porcentual seguro para tarjetas en grid flexWrap
   * @param {number} columns Cantidad de columnas (1, 2, 3, etc.)
   * @param {number} gap Espaciado entre tarjetas en px
   */
  const getCardWidth = (columns = 1, gap = 12) => {
    if (columns <= 1) return '100%';
    const totalGap = gap * (columns - 1);
    return `${Math.floor((100 - (totalGap / width) * 100) / columns)}%`;
  };

  return {
    width,
    height,
    isSmallMobile,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    mediaQuery,
    select,
    getGridColumns,
    getCardWidth
  };
}
