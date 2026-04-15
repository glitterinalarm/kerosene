export interface RubriqueConfig {
  name: string;
  slug: string;
  desc: string;
  subTags: string[];
  categories: string[];
}

export const THEMES_CONFIG: RubriqueConfig[] = [
  { 
    name: "GRAPHISME", 
    slug: "graphisme", 
    desc: "Identité visuelle, direction artistique et branding.", 
    subTags: ["Branding", "Typo", "Motion", "Packaging"],
    categories: ['GRAPHISME', 'DESIGN', 'BRANDING', 'LOGO', 'TYPOGRAPHIE', 'ILLUSTRATION']
  },
  { 
    name: "PUBLICITÉ", 
    slug: "publicite", 
    desc: "Campagnes, films publicitaires et stratégies de marque.", 
    subTags: ["Film", "Print", "Stunt", "Integrated"],
    categories: ['PUBLICITÉ', 'AD', 'PUB', 'CAMPAGNE', 'FILM', 'SPOT', 'ADVERTISING']
  },
  { 
    name: "SOCIAL MEDIA", 
    slug: "social-media", 
    desc: "Créativité sociale, activations digitales et formats natifs.", 
    subTags: ["Activation", "Content", "Viral", "TikTok"],
    categories: ['SOCIAL', 'SOCIAL MEDIA', 'TWEET', 'ACTIVATION', 'INSTAGRAM', 'TIKTOK']
  },
  { 
    name: "INNOVATION", 
    slug: "innovation", 
    desc: "Technologies émergentes, UX, digital et nouveaux usages.", 
    subTags: ["Web3", "UX/UI", "Tech", "Expérience"],
    categories: ['INNOVATION', 'TECH', 'DIGITAL', 'WEB', 'UX', 'WEB3']
  },
  { 
    name: "DROP", 
    slug: "drop", 
    desc: "Mode, culture sneaker et collaborations créatives.", 
    subTags: ["Sneakers", "Apparel", "Limited", "Retail"],
    categories: ['DROP', 'STREET', 'FASHION', 'SNEAKER', 'MODE', 'CULTURE']
  },
  { 
    name: "TREND", 
    slug: "trend", 
    desc: "Signaux émergents, tendances culturelles et zeitgeist.", 
    subTags: ["Lifestyle", "Culture", "Report", "Future"],
    categories: ['TREND', 'TENDANCE', 'CULTURE', 'SOCIÉTÉ']
  },
  { 
    name: "KÉROSÈNE", 
    slug: "kerosene", 
    desc: "Analyses exclusives et éditos signés par la rédaction.", 
    subTags: ["InSight", "Radar", "Long-Form", "DA Club"],
    categories: ['KÉROSÈNE', 'ÉDITORIAL', 'À LA UNE']
  },
  { 
    name: "IA CRÉATIVE", 
    slug: "ia-creative", 
    desc: "Outils génératifs, création d'images, vidéos, et prompt engineering.", 
    subTags: ["Gen-AI", "Midjourney", "Video", "Tools"],
    categories: ['IA CRÉATIVE', 'GEN AI', 'IA GENERATIVE', 'MIDJOURNEY', 'AI ART', 'GEN-AI']
  },
];
