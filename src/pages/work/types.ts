export type WorkImage = {
  src: string;
  alt: string;
};

export type GoalSection = {
  title: string;
  body: string;
  image: WorkImage;
};

export type CaseStudySection =
  | {
      type: "mediaText";
      image: WorkImage;
      /** Optional second row (e.g. two logos) under the main image in the media column. */
      stackBottom?: WorkImage[];
      eyebrow?: string;
      title?: string;
      body: string;
      mediaPosition: "left" | "right";
    }
  | {
      type: "imageGrid";
      columns: 2 | 3;
      images: WorkImage[];
    }
  | {
      type: "text";
      eyebrow?: string;
      title?: string;
      body: string;
    }
  | {
      type: "figma";
      url: string;
    };

export type WorkPageLayout = "default" | "caseStudy";

export type WorkFrontmatter = {
  [x: string]: unknown;
  title: string;
  slug: string;

  /** Omit or `default` for the original gallery-first project page. (Not named `layout` — reserved by Astro content collections.) */
  pageTemplate?: WorkPageLayout;

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
  gallery: WorkImage[];
  figmaEmbed?: string; // Optional Figma embed URL

  /** Case study: intro paragraph beside hero (HTML). */
  heroIntro?: string;
  /** Case study: dark band after About/Tools. */
  goalSection?: GoalSection;
  /** Case study: narrative blocks on light background before bottom gallery. */
  caseSections?: CaseStudySection[];
};

// The shape of the imported markdown file
export type WorkFile = {
  frontmatter: WorkFrontmatter;
};
