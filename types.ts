
export enum CameraAngle {
  Front = 'Front View',
  Side = 'Side View',
  TopDown = 'Top-Down / Flat Lay',
  EyeLevel = 'Eye Level',
  LowAngle = 'Low Angle / Hero View',
  Diagonal = '45-Degree Angle'
}

export enum LightingType {
  SoftStudio = 'Soft Studio Lighting',
  Cinematic = 'Cinematic & Moody',
  Dramatic = 'Dramatic Shadows',
  NaturalSunlight = 'Natural Sunlight',
  Neon = 'Cyberpunk Neon',
  Luxury = 'Golden Hour Luxury'
}

export enum MockupEnvironment {
  None = 'None',
  Supermarket = 'Supermarket Shelf',
  Cafe = 'Cafe Table',
  Billboard = 'Outdoor Billboard',
  Nature = 'Natural Landscape',
  Sunset = 'Beach Sunset'
}

export enum ManipulationEffect {
  None = 'None',
  SmartMasking = 'Smart Masking',
  PerspectiveMatch = 'Perspective Match',
  FogParticles = 'Fog & Particles',
  LiquidSplash = 'Liquid Splash'
}

export enum ProductRetouch {
  None = 'None',
  CleanUp = 'Clean-Up',
  EdgeRefinement = 'Edge Refinement',
  Polish = 'Plastic/Metal Polish',
  ColorMastering = 'Color Mastering'
}

export enum PeopleRetouch {
  None = 'None',
  NaturalSkin = 'Natural Skin',
  EyeEnhancement = 'Eye Enhancement',
  HairCleanup = 'Hair Cleanup'
}

export enum AspectRatio {
  Square = '1:1',
  Landscape = '16:9',
  Portrait = '9:16'
}

export interface GenerationSettings {
  angle: CameraAngle;
  lighting: LightingType;
  mockup: MockupEnvironment;
  manipulation: ManipulationEffect;
  productRetouch: ProductRetouch;
  peopleRetouch: PeopleRetouch;
  aspectRatio: AspectRatio;
  transparentBackground: boolean;
  prompt: string;
}

export interface GeneratedAsset {
  id: string;
  url: string;
  timestamp: number;
}
