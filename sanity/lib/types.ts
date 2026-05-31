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