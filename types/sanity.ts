export type SanityImage = {
  asset: {
    _id: string;
    url: string;
    metadata?: {
      dimensions: {
        width: number;
        height: number;
        aspectRatio: number;
      };
    };
  };
};

export type SanityBlock = {
  _key: string;
  _type: string;
  children?: Array<{
    _key: string;
    _type: string;
    marks?: string[];
    text?: string;
  }>;
  markDefs?: Array<{
    _key: string;
    _type: string;
    href?: string;
  }>;
  style?: string;
};

export type SanityPost = {
  _id: string;
  _type: string;
  title: string;
  slug: string;
  publishedAt?: string;
  excerpt?: string;
  content?: Array<SanityBlock | (SanityBlock & {asset: SanityImage["asset"]})>;
  mainImage?: SanityImage;
};
