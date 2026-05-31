// Represents how Sanity stores images
export interface SanityImage {
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
  };
}

// Represents the Legacy Stats object
export interface Stat {
  _key: string;
  _type: "stat";
  label: string;
  value: string;
}

// Represents a resolved Event reference
export interface FeaturedEvent {
  title: string;
  eventDate: string;
  coverImage: SanityImage;
}

// Represents a resolved Gallery Item reference
export interface FeaturedGalleryItem {
  title: string;
  image: SanityImage;
}

// The final shape of our Homepage query
export interface HomepageData {
  presidentMessage: string;
  presidentPhoto: SanityImage;
  legacyStats: Stat[];
  featuredEvents: FeaturedEvent[];
  featuredGallery: FeaturedGalleryItem[];
}

// Represents a resolved Team Member (for Club Heads/Vice Heads)
export interface ClubHead {
  name: string;
  photo: SanityImage;
  grade: string;
}

// The final shape of our Single Club query
export interface ClubData {
  name: string;
  slug: { current: string };
  description: string;
  logo: SanityImage;
  heroImage: SanityImage;
  clubHeads: ClubHead[];
  viceHeads: ClubHead[];
  achievements: string[];
}