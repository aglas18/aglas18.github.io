export type WorkFrontmatter = {
  title: string;
  slug: string;

  // Homepage / shared content
  cardImage: {
    src: string;
    alt: string;
  };
  shortDescription: string;

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
};

// The shape of the imported markdown file
export type WorkFile = {
  frontmatter: WorkFrontmatter;
  // optionally: you may also have 'Content' or 'default' if using MDX
  // default?: any;
};
