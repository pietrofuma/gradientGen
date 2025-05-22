
export interface ColorStop {
  id: string;
  color: string;    // Hex color string, e.g., #RRGGBB
  opacity: number;  // 0 to 1
  position: number; // 0 to 100
}

export enum GradientType {
  LINEAR = 'linear',
  RADIAL = 'radial',
}

export enum RadialShape {
  CIRCLE = 'circle',
  ELLIPSE = 'ellipse',
}
    