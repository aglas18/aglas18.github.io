export type WorkFrontmatter = {
  [x: string]: unknown;
  title: string;
  slug: string;

  // Homepage / shared content
  brand?: string;
  cardSubtitle?: string;
  cardImage: {
    src: string;
    alt: string;
  };
  shortDescription: string;
  projectType?: string;

  // Individual project page content
  longDescription: string;
  heroImage: {
    src: string;
    alt: string;
  };
  about: string[];
  tools: string[];
  gallery: {
    src: string;
    alt: string;
  }[];
  figmaEmbed?: string; // Optional Figma embed URL
};

// The shape of the imported markdown file
export type WorkFile = {
  frontmatter: WorkFrontmatter;
  // optionally: you may also have 'Content' or 'default' if using MDX
  // default?: any;
};
