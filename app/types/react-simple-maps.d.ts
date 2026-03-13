declare module 'react-simple-maps' {
  import { ComponentType, SVGProps } from 'react';

  interface ComposableMapProps extends SVGProps<SVGSVGElement> {
    projection?: string;
    projectionConfig?: {
      rotate?: [number, number, number];
      scale?: number;
      center?: [number, number];
    };
    width?: number;
    height?: number;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (data: { geographies: GeographyType[] }) => React.ReactNode;
  }

  interface GeographyType {
    rsmKey: string;
    properties: {
      name: string;
      [key: string]: unknown;
    };
    id?: string;
  }

  interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: GeographyType;
  }

  interface MarkerProps extends SVGProps<SVGGElement> {
    coordinates: [number, number];
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const ZoomableGroup: ComponentType<any>;
  export const Line: ComponentType<any>;
  export const Sphere: ComponentType<any>;
  export const Graticule: ComponentType<any>;
}
