import aboutYaml from './about.yml';
import awardsYaml from './awards.yml';
import contactFormYaml from './contact-form.yml';
import footerYaml from './footer.yml';
import homeYaml from './home.yml';
import industryYaml from './industry.yml';
import jobsYaml from './jobs.yml';
import navigationYaml from './navigation.yml';
import resourcingYaml from './resourcing.yml';
import siteYaml from './site.yml';
import softwareYaml from './software.yml';
import systemIntegrationYaml from './system-integration.yml';
import telecomYaml from './telecom.yml';

type AssetModule = { default?: ImageMetadata } | ImageMetadata;

const assetModules = import.meta.glob<AssetModule>('../../assets/*', {
  eager: true,
});

const assets = Object.fromEntries(
  Object.entries(assetModules).map(([path, module]) => {
    const asset = 'default' in module && module.default ? module.default : module;
    return [path.split('/').pop(), asset as ImageMetadata];
  }),
);

export function getCmsAsset(filename: string): ImageMetadata {
  const assetName =
    filename
      .replace(/^src\/assets\//, '')
      .split('/')
      .pop() ?? filename;
  const asset = assets[assetName];
  if (!asset) {
    throw new Error(`CMS asset not found: ${filename}`);
  }

  return asset;
}

export function getCmsAssetSrc(filename: string): string {
  return getCmsAsset(filename).src;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueSlug(value: string, usedSlugs: Set<string>): string {
  const baseSlug = slugify(value) || 'item';
  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
}

function formatStepNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

export interface CmsLink {
  label: string;
  url: string;
}

export interface CmsNavItem {
  title: string;
  desc: string;
  url: string;
  icon: string;
}

export interface IndustryTechStackSection {
  enabled?: boolean;
  id?: string;
  title: string;
  description: string;
  items: CmsLink[];
}

export interface IndustryClientLogo {
  name: string;
  logoSrc?: ImageMetadata;
}

export interface IndustryCaseStudyClientStat {
  value: string;
  label: string;
}

export interface IndustryCaseStudyClientItem {
  title: string;
  eyebrow: string;
  description: string;
  image?: ImageMetadata;
  url?: string;
  stats: IndustryCaseStudyClientStat[];
}

export interface IndustryCaseStudyClientTestimonial {
  quote: string;
  name: string;
  title: string;
}

export interface IndustryCaseStudyClientSection {
  enabled?: boolean;
  id?: string;
  title: string;
  description: string;
  clientLogos: IndustryClientLogo[];
  caseStudies: IndustryCaseStudyClientItem[];
  testimonials: IndustryCaseStudyClientTestimonial[];
}

export interface IndustryData {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  navOrder?: number;
  summary: string;
  heroSubtitle: string;
  iconName: string;
  techStack: IndustryTechStackSection;
  caseStudyClients?: IndustryCaseStudyClientSection;
  heroId?: string;
  heroEyebrowPill?: string;
  heroEyebrowMuted?: string;
  heroBackgroundImage: ImageMetadata;
  heroTitle: string;
  heroSummary: string;
  heroMetrics?: string[];
  heroCtaLabel: string;
  heroCtaUrl: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaUrl?: string;
  MarkdownContent?: any;
  sections: CaseStudySection[];
}

export interface CaseStudySectionItem {
  eyebrow?: string;
  iconName?: string;
  title: string;
  text?: string;
}

export interface CaseStudySection {
  id?: string;
  layout: 'image-left' | 'image-right' | 'no-image';
  heroImage?: ImageMetadata;
  heroImageAlt?: string;
  accentColor: 'blue' | 'green' | 'yellow' | 'red';
  iconName?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  content: {
    variant:
      | 'template1-card'
      | 'template2-list'
      | 'template3-list-card'
      | 'template4-metrics'
      | 'template5-icon-card'
      | 'template6-scroll-card';
    description?: string;
    items: CaseStudySectionItem[];
  };
}

export interface CaseStudyData {
  id: number; // Dynamically assigned based on array index
  slug: string;
  title: string;
  description: string;
  thumbnailImage: string;
  thumbnailSrc: ImageMetadata;
  solution: string;
  industry: string;
  tags: string[];
  heroId?: string;
  heroEyebrow?: string;
  heroBackgroundImage: ImageMetadata;
  heroTitle: string;
  heroSummary: string;
  heroMetrics?: string[];
  heroCtaLabel: string;
  heroCtaUrl: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaUrl?: string;
  MarkdownContent?: any;
  sections: CaseStudySection[];
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
  imageSrc: string;
}

export interface TeamMember {
  img: string;
  name: string;
  role: string;
  desc: string;
}

export interface FootprintMetric {
  value: string;
  suffix?: string;
  label: string;
}

export interface GlobeMarker {
  name: string;
  detail?: string;
  latitude: number;
  longitude: number;
  size: number;
}

export interface ClientLogo {
  image: ImageMetadata;
  alt: string;
}

export interface TestimonialItem {
  quote: string;
  name: string;
  title: string;
}

export interface ArticlePost {
  embedCode: string;
  src: string;
  url: string;
  height: number;
  width: number;
  title: string;
  fallbackTitle: string;
}

export interface SocialPost {
  platform: 'facebook' | 'instagram' | 'linkedin';
  embedCode: string;
  src: string;
  url: string;
  height: number;
  width: number;
  title: string;
  fallbackTitle: string;
}

export interface AwardGalleryItem {
  id: number;
  type: 'award' | 'certificate';
  title: string;
  slug?: string;
  organization: string;
  date: string;
  thumbnailSrc: ImageMetadata;
  images: Array<{
    src: ImageMetadata;
    alt: string;
  }>;
}

export interface SoftwarePortfolioItem {
  title: string;
  desc: string;
  image: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface SoftwarePortfolioTab {
  id: string;
  label: string;
  shortLabel?: string;
  iconName?: string;
  description: string;
  items: SoftwarePortfolioItem[];
}

export interface SoftwareCaseStudyItem {
  title: string;
  solution: string;
  impact: string;
  image: string;
  ctaUrl?: string;
  url?: string;
}

export interface SoftwareEngineeringStackCard {
  title: string;
  description: string;
  image: ImageMetadata;
  alt: string;
}

export interface SoftwareEngineeringStackSection {
  sectionId?: string;
  backgroundImage: ImageMetadata;
  heading: string;
  description: string;
  cards: SoftwareEngineeringStackCard[];
}

export interface SoftwareArchitecturalPrincipleItem {
  title: string;
  description: string;
}

export interface SoftwareArchitecturalPrinciplesSection {
  sectionId?: string;
  backgroundImageSrc: string;
  heading: string;
  description: string;
  items: SoftwareArchitecturalPrincipleItem[];
}

export interface SoftwareOnboardingStep {
  number: string;
  title: string;
  description: string;
}

export interface SoftwareOnboardingSection {
  sectionId?: string;
  backgroundImage: ImageMetadata;
  eyebrow: string;
  heading: string;
  steps: SoftwareOnboardingStep[];
}

type HomeServiceId = 'telecom' | 'resourcing' | 'software' | 'system';

export interface HomeServiceMetric {
  value: string;
  label: string;
}

export interface HomeServiceFeature {
  iconName: string;
  label: string;
  description: string;
}

export interface HomeService {
  id: HomeServiceId;
  titleHtml: string;
  href: string;
  features: HomeServiceFeature[];
  metrics: HomeServiceMetric[];
}

interface HomeYaml {
  hero: {
    sectionId?: string;
    backgroundImage: string;
    titlePrefix: string;
    rotatingWords: string[];
    subtitle: string;
    ctaLabel: string;
    ctaUrl: string;
    trustedByLabel: string;
    partnerLogos: Array<{ image: string; alt: string }>;
  };
  services: {
    sectionId?: string;
    headingHtml: string;
    backgroundImage: string;
    items: HomeService[];
  };
  journey: {
    sectionId?: string;
    title: string;
    subtitle: string;
    milestones: Array<Omit<Milestone, 'imageSrc'> & { image: string }>;
  };
  team: {
    sectionId?: string;
    backgroundImage: string;
    meetTeamImage: string;
    heading: string;
    description: string;
    ctaTitle: string;
    ctaLabel: string;
    ctaUrl: string;
    members: Array<{ name: string; role: string; desc: string; image: string }>;
  };
  footprint: {
    sectionId?: string;
    heading: string;
    metrics: FootprintMetric[];
    globe: {
      markers: GlobeMarker[];
    };
  };
  clients: {
    sectionId?: string;
    heading: string;
    ctaUrl: string;
    ctaLabel: string;
    logos: Array<{ image: string; alt: string }>;
  };
  testimonials: {
    sectionId?: string;
    heading: string;
    ctaUrl: string;
    ctaLabel: string;
    awardsImage: string;
    awardsImageAlt: string;
    items: TestimonialItem[];
  };
  articles: {
    enabled: boolean;
    sectionId?: string;
    eyebrow: string;
    heading: string;
    ctaLabel: string;
    ctaUrl: string;
    posts: Array<{ embedCode: string; fallbackTitle?: string }>;
  };
}

interface AboutYaml {
  title: string;
  hero: {
    sectionId?: string;
    backgroundImage: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaUrl: string;
  };
  mission: {
    sectionId?: string;
    image: string;
    imageAlt: string;
    cards: Array<{
      title: string;
      description: string;
    }>;
  };
  lifeAtHtis: {
    sectionId?: string;
    backgroundImage: string;
    image: string;
    imageAlt: string;
    title: string;
    body: string[];
    ctaLabel: string;
    ctaUrl: string;
  };
  team: {
    sectionId?: string;
    title: string;
    description: string;
    members: Array<{
      name: string;
      role: string;
      dept: string;
      image: string;
    }>;
  };
  ourPresence: {
    sectionId?: string;
    title: string;
    description: string;
    globalTabLabel: string;
    indiaTabLabel: string;
    globalLocations: AboutLocation[];
    indiaOffices: AboutLocation[];
  };
  principles: {
    sectionId?: string;
    image: string;
    imageAlt: string;
    title: string;
    description: string;
    items: string[];
  };
  social: {
    enabled: boolean;
    sectionId?: string;
    eyebrow: string;
    heading: string;
    posts: Array<{
      platform: 'facebook' | 'instagram' | 'linkedin';
      embedCode: string;
      fallbackTitle?: string;
    }>;
  };
}

interface AboutLocation {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  lat: number;
  lng: number;
  isHQ?: boolean;
  mapUrl?: string;
}

interface AwardsYaml {
  title: string;
  hero: {
    sectionId?: string;
    backgroundImage: string;
    title: string;
    subtitle: string;
  };
  gallery: {
    sectionId: string;
    items: Array<{
      type: 'award' | 'certificate';
      title: string;
      slug?: string;
      organization: string;
      date: string;
      thumbnail?: string;
      image?: string;
      imageAlt?: string;
      images?: Array<{
        image: string;
        alt: string;
      }>;
    }>;
  };
}

interface IndustryPageYaml {
  hero: {
    sectionID: string;
    title: string;
    heroImage: string;
    heroBackground: string;
    description: string;
    ctaBtn: string;
    ctaUrl: string;
  };
}

interface PageHeroYaml {
  sectionId?: string;
  backgroundImage: string;
  foregroundImage?: string;
  title: string;
  highlight?: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  carouselImages?: string[];
}

interface SystemIntegrationHeroYaml {
  sectionId?: string;
  backgroundImage: string;
  foregroundImage?: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  carouselImages?: string[];
}

interface ExecutionPillarYaml {
  iconName: string;
  title: string;
  description: string;
  url?: string;
}

interface ExecutionMetricYaml {
  target: number;
  showDecimalAnimation?: boolean;
  unit?: string;
  suffix?: string;
  label: string;
  subLabel?: string;
}

interface ExecutionYaml {
  sectionId?: string;
  heading: string;
  metrics: ExecutionMetricYaml[];
  pillars: ExecutionPillarYaml[];
}

interface MetricsOnlyExecutionYaml {
  sectionId?: string;
  heading: string;
  metrics: ExecutionMetricYaml[];
}

interface TelecomProcessYaml {
  title: string;
  description: string;
  image: string;
  details: Array<{
    name: string;
    desc: string;
  }>;
}

interface TelecomDeploymentYaml {
  title: string;
  description: string;
  href?: string;
  badges: string[];
}

interface PartnerTabYaml {
  iconName: string;
  title: string;
  subtitle: string;
  description: string;
  partners: Array<{ name: string; logo?: string }>;
}

interface PartnerEcosystemYaml {
  sectionId?: string;
  heading: string;
  description: string;
  tabs: PartnerTabYaml[];
}

interface StrategicPillarCardYaml {
  iconName: string;
  title: string;
  description: string;
  content: string;
  column: 'left' | 'center' | 'right';
}

interface CaseStudyYaml {
  title: string;
  description?: string;
  ctaLabel: string;
  ctaUrl: string;
}

interface CaseStudyContentYaml {
  slug: string;
  metadata: {
    title: string;
    description: string;
    thumbnailImage: string;
    solution: string;
    industry: string;
    tags: string[];
  };
  hero: {
    id?: string;
    eyebrow?: string;
    backgroundImage: string;
    title: string;
    summary: string;
    metrics?: string[];
    ctaLabel: string;
    ctaUrl: string;
    secondaryCtaLabel?: string;
    secondaryCtaUrl?: string;
  };
  sections?: Array<
    Omit<CaseStudySection, 'heroImage' | 'accentColor'> & {
      heroImage?: string;
      accentColor?: CaseStudySection['accentColor'];
    }
  >;
}

interface IndustryContentYaml {
  slug: string;
  metadata: {
    title: string;
    description: string;
    shortTitle: string;
    navOrder?: number;
    iconName: string;
  };
  hero: {
    id?: string;
    heroEyebrowPill?: string;
    heroEyebrowMuted?: string;
    backgroundImage: string;
    title: string;
    summary: string;
    metrics?: string[];
    ctaLabel: string;
    ctaUrl: string;
    secondaryCtaLabel?: string;
    secondaryCtaUrl?: string;
  };
  techStack?: IndustryTechStackSection;
  caseStudyClients?: Omit<
    IndustryCaseStudyClientSection,
    'clientLogos' | 'caseStudies'
  > & {
    clientLogos?: Array<{
      name: string;
      logoSrc?: string;
    }>;
    caseStudies?: Array<Omit<IndustryCaseStudyClientItem, 'image'> & { image?: string }>;
  };
  sections?: Array<
    Omit<CaseStudySection, 'heroImage' | 'accentColor'> & {
      heroImage?: string;
      accentColor?: CaseStudySection['accentColor'];
    }
  >;
}

interface TelecomYaml {
  title: string;
  hero: PageHeroYaml;
  capabilities: {
    sectionId?: string;
    backgroundImage: string;
    heading: string;
    description: string;
    items: Array<{
      label: string;
      shortLabel?: string;
      image: string;
      invertImageInDarkMode?: boolean;
      items: Array<{
        title: string;
        desc: string;
      }>;
    }>;
  };
  processes: {
    sectionId?: string;
    heading: string;
    items: TelecomProcessYaml[];
  };
  deployments: {
    sectionId?: string;
    heading: string;
    description: string;
    href?: string;
    items: TelecomDeploymentYaml[];
  };
  execution: ExecutionYaml & { sectionId?: string };
}

interface SystemIntegrationYaml {
  title: string;
  hero: SystemIntegrationHeroYaml;
  strategicPillars: {
    sectionId?: string;
    backgroundImage: string;
    centerImage: string;
    heading: string;
    cards: StrategicPillarCardYaml[];
  };
  partnerEcosystem: PartnerEcosystemYaml;
  execution: ExecutionYaml & { sectionId?: string };
  deployments: {
    sectionId?: string;
    heading: string;
    image: string;
    imageAlt: string;
    featured: CaseStudyYaml;
    items: CaseStudyYaml[];
  };
}

interface SoftwareYaml {
  title: string;
  hero: Omit<PageHeroYaml, 'carouselImages'>;
  portfolio: {
    sectionId?: string;
    backgroundImage: string;
    heading: string;
    description: string;
    capabilities: Array<
      Omit<SoftwarePortfolioTab, 'id' | 'items'> & {
        items: Array<Omit<SoftwarePortfolioItem, 'image'> & { image: string }>;
      }
    >;
  };
  engineeringStack: Omit<SoftwareEngineeringStackSection, 'backgroundImage' | 'cards'> & {
    backgroundImage: string;
    cards: Array<Omit<SoftwareEngineeringStackCard, 'image'> & { image: string }>;
  };
  architecturalPrinciples: Omit<
    SoftwareArchitecturalPrinciplesSection,
    'backgroundImageSrc'
  > & {
    backgroundImage: string;
  };
  onboarding: Omit<SoftwareOnboardingSection, 'backgroundImage'> & {
    backgroundImage: string;
  };
  execution: ExecutionYaml;
  caseStudies: {
    sectionId?: string;
    heading: string;
    items: Array<Omit<SoftwareCaseStudyItem, 'image'> & { image: string }>;
  };
}

interface ResourcingYaml {
  title: string;
  hero: {
    sectionId?: string;
    backgroundImage: string;
    foregroundImage?: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaUrl: string;
    carouselImages?: string[];
  };
  capabilities: {
    sectionId?: string;
    backgroundImage: string;
    heading: string;
    description: string;
    items: Array<{
      iconName: string;
      title: string;
      desc: string;
      colSpan?: boolean;
    }>;
  };
  standard: {
    sectionId?: string;
    heading: string;
    description: string;
    items: Array<{
      iconName: string;
      title: string;
      desc: string;
    }>;
    images: Array<{
      image: string;
      alt: string;
    }>;
  };
  workforce: {
    sectionId?: string;
    heading: string;
    tabs: Array<{
      title: string;
      description: string;
      image: string;
      ctaLabel: string;
      ctaUrl: string;
      tools: Array<{
        iconName: string;
        name: string;
      }>;
    }>;
  };
  execution: MetricsOnlyExecutionYaml;
  caseStudies: {
    sectionId?: string;
    heading: string;
    items: Array<{
      image: string;
      imageAlt: string;
      description: string;
      ctaLabel: string;
      ctaUrl: string;
    }>;
  };
}

interface LegalPageYaml {
  metadata: {
    title: string;
    metaTitle: string;
    lastUpdated: string;
  };
  pageHeader: {
    backLink: CmsLink;
  };
  MarkdownContent?: any;
}

interface JobsYaml {
  api: {
    jobListEndpoint: string;
    jobDetailEndpoint: string;
    applyJobEndpoint: string;
    noticePeriodDdlEndpoint: string;
    technicalSkillAutoFillEndpoint: string;
  };
}

const industryMarkdownModules = import.meta.glob<{
  frontmatter: IndustryContentYaml;
  Content: any;
  rawContent?: () => string;
}>('./industries/*.md', {
  eager: true,
});

const caseStudyMarkdownModules = import.meta.glob<{
  frontmatter: CaseStudyContentYaml;
  Content: any;
  rawContent?: () => string;
}>('./case-studies/*.md', {
  eager: true,
});

const privacyMarkdownModules = import.meta.glob<{
  frontmatter: LegalPageYaml;
  Content: any;
  rawContent?: () => string;
}>('./privacy.md', {
  eager: true,
});

const termsMarkdownModules = import.meta.glob<{
  frontmatter: LegalPageYaml;
  Content: any;
  rawContent?: () => string;
}>('./terms.md', {
  eager: true,
});

export const site = siteYaml as {
  defaultTitle: string;
  language: string;
  defaultTheme: 'light' | 'dark' | 'system default';
  favicon: string;
  seo: {
    description: string;
    siteUrl: string;
    siteName: string;
    ogImage: string;
    robots: string;
  };
  globalToast: {
    enabled: boolean;
    message: string;
  };
};

export const navigation = navigationYaml as {
  logo: { image: string; alt: string };
  primary: {
    home: { title: string; url: string };
    career: { title: string; url: string };
    contact: { title: string; url: string };
  };
  solutions: {
    label: string;
    heading: string;
    card: {
      image: string;
      alt: string;
      title: string;
      description: string;
      ctaLabel: string;
      ctaUrl: string;
    };
    items: CmsNavItem[];
  };
  industries: {
    label: string;
    heading: string;
    viewAll: CmsNavItem;
  };
  resources: {
    label: string;
    heading: string;
    card: {
      image: string;
      alt: string;
      title: string;
      description: string;
      ctaLabel: string;
      ctaUrl: string;
    };
    items: CmsNavItem[];
  };
};

export interface OfficeItem {
  name: string;
  companyName: string;
  address: string;
  phone: string;
  email: string;
}

export interface CountryItem {
  name: string;
  code: string;
}

export const footer = footerYaml as {
  logo: { image: string; alt: string };
  description: string;
  company: { heading: string; links: CmsLink[] };
  services: { heading: string; links: CmsLink[] };
  socials: { links: Array<CmsLink & { icon: string }> };
  contact: { heading: string; phone: string; email: string };
  offices: {
    heading: string;
    indiaFlagCode: string;
    list: OfficeItem[];
  };
  globalPresence: {
    heading: string;
    ctaLabel?: string;
    ctaUrl?: string;
    countries: CountryItem[];
  };
  copyright: string;
  legalLinks: CmsLink[];
};

export const contactForm = contactFormYaml as {
  heading: string;
  postUrl: string;
  categories: string[];
};

export const home = (() => {
  const data = homeYaml as HomeYaml;

  return {
    hero: {
      ...data.hero,
      backgroundImage: getCmsAsset(data.hero.backgroundImage),
      partnerLogos: data.hero.partnerLogos.map((logo) => ({
        ...logo,
        image: getCmsAsset(logo.image),
      })),
    },
    journey: {
      ...data.journey,
      milestones: data.journey.milestones.map(({ image, ...milestone }) => ({
        ...milestone,
        image: getCmsAsset(image),
      })),
    },
    services: {
      ...validateHomeServices(data.services),
      backgroundImage: getCmsAsset(data.services.backgroundImage),
    },
    team: {
      ...data.team,
      backgroundImage: getCmsAsset(data.team.backgroundImage),
      meetTeamImage: getCmsAsset(data.team.meetTeamImage),
      members: data.team.members.map((member) => ({
        img: getCmsAsset(member.image),
        name: member.name,
        role: member.role,
        desc: member.desc,
      })),
    },
    footprint: data.footprint,
    clients: {
      ...data.clients,
      logos: data.clients.logos.map((logo) => ({
        ...logo,
        image: getCmsAsset(logo.image),
      })),
    },
    testimonials: {
      ...data.testimonials,
      awardsImage: getCmsAsset(data.testimonials.awardsImage),
    },
    articles: {
      ...data.articles,
      posts: data.articles.posts.map(resolveLinkedInEmbed),
    },
  };
})();

function getIframeAttribute(embedCode: string, attributeName: string) {
  const pattern = new RegExp(
    `<iframe\\b[^>]*?\\s${attributeName}\\s*=\\s*["']([^"']+)["']`,
    'i',
  );
  return embedCode.match(pattern)?.[1];
}

function getInstagramPermalink(embedCode: string) {
  const pattern = /<blockquote\b[^>]*?\sdata-instgrm-permalink\s*=\s*["']([^"']+)["']/i;
  return embedCode.match(pattern)?.[1];
}

function resolveLinkedInEmbed(post: {
  embedCode: string;
  fallbackTitle?: string;
}): ArticlePost {
  const src = getIframeAttribute(post.embedCode, 'src');
  if (!src) {
    throw new Error('LinkedIn iframe embed is missing a src attribute.');
  }

  const embedUrl = new URL(src);
  if (
    embedUrl.hostname !== 'www.linkedin.com' ||
    !embedUrl.pathname.startsWith('/embed/feed/update/')
  ) {
    throw new Error(`Unsupported LinkedIn embed URL "${src}"`);
  }

  const heightValue = Number(getIframeAttribute(post.embedCode, 'height'));
  const widthValue = Number(getIframeAttribute(post.embedCode, 'width'));
  const title = getIframeAttribute(post.embedCode, 'title') || 'Embedded LinkedIn post';
  const fallbackTitle =
    post.fallbackTitle?.trim() && post.fallbackTitle.trim() !== 'Embedded post'
      ? post.fallbackTitle.trim()
      : 'View this update from HTIS Telecom on LinkedIn.';

  return {
    embedCode: post.embedCode,
    src: embedUrl.toString(),
    url: `https://www.linkedin.com${embedUrl.pathname.replace(
      '/embed/feed/update/',
      '/feed/update/',
    )}`,
    height: Number.isFinite(heightValue) && heightValue > 0 ? heightValue : 670,
    width: Number.isFinite(widthValue) && widthValue > 0 ? widthValue : 504,
    title,
    fallbackTitle,
  };
}

function resolveSocialEmbed(post: {
  platform: 'facebook' | 'instagram' | 'linkedin';
  embedCode: string;
  fallbackTitle?: string;
}): SocialPost {
  if (post.platform === 'linkedin') {
    return {
      ...resolveLinkedInEmbed(post),
      platform: 'linkedin',
    };
  }

  const iframeSrc = getIframeAttribute(post.embedCode, 'src');
  const permalink = getInstagramPermalink(post.embedCode);
  const source = iframeSrc || permalink;

  if (!source) {
    throw new Error(
      `About social: ${post.platform} embed code is missing an iframe src or Instagram permalink.`,
    );
  }

  const sourceUrl = new URL(source.replace(/&amp;/g, '&'));
  let embedUrl: URL;
  let postUrl: URL;
  let defaultHeight: number;

  if (post.platform === 'facebook') {
    if (
      sourceUrl.hostname !== 'www.facebook.com' ||
      sourceUrl.pathname !== '/plugins/post.php'
    ) {
      throw new Error(`About social: unsupported Facebook embed URL "${source}"`);
    }

    const href = sourceUrl.searchParams.get('href');
    if (!href) {
      throw new Error('About social: Facebook embed URL is missing its post href.');
    }

    embedUrl = sourceUrl;
    postUrl = new URL(href);
    defaultHeight = sourceUrl.searchParams.get('show_text') === 'false' ? 498 : 757;
  } else {
    if (
      sourceUrl.hostname !== 'www.instagram.com' ||
      !/^\/(p|reel)\/[^/]+\//.test(sourceUrl.pathname)
    ) {
      throw new Error(`About social: unsupported Instagram embed URL "${source}"`);
    }

    const postPath = sourceUrl.pathname.replace(/\/(embed(?:\/captioned)?\/?$)/, '/');
    const captioned =
      /data-instgrm-captioned/i.test(post.embedCode) ||
      /\/captioned\/?$/.test(sourceUrl.pathname);
    postUrl = new URL(postPath, 'https://www.instagram.com');
    embedUrl = new URL(
      `${postPath}embed/${captioned ? 'captioned/' : ''}`,
      postUrl.origin,
    );
    defaultHeight = captioned ? 820 : 680;
  }

  const heightValue = Number(getIframeAttribute(post.embedCode, 'height'));
  const widthValue = Number(getIframeAttribute(post.embedCode, 'width'));
  const platformName = post.platform === 'facebook' ? 'Facebook' : 'Instagram';

  return {
    ...post,
    src: embedUrl.toString(),
    url: postUrl.toString(),
    height:
      post.platform === 'instagram'
        ? Number.isFinite(heightValue) && heightValue > 0
          ? Math.max(heightValue, defaultHeight)
          : defaultHeight
        : Number.isFinite(heightValue) && heightValue > 0
          ? heightValue
          : defaultHeight,
    width:
      Number.isFinite(widthValue) && widthValue > 0
        ? widthValue
        : post.platform === 'facebook'
          ? 500
          : 540,
    title: getIframeAttribute(post.embedCode, 'title') || `Embedded ${platformName} post`,
    fallbackTitle:
      post.fallbackTitle?.trim() ||
      `View this update from HTIS Telecom on ${platformName}.`,
  };
}

export const about = (() => {
  const data = aboutYaml as AboutYaml;

  return {
    ...data,
    hero: {
      ...data.hero,
      backgroundImage: getCmsAsset(data.hero.backgroundImage),
    },
    mission: {
      ...data.mission,
      image: getCmsAsset(data.mission.image),
    },
    lifeAtHtis: {
      ...data.lifeAtHtis,
      backgroundImage: getCmsAsset(data.lifeAtHtis.backgroundImage),
      image: getCmsAsset(data.lifeAtHtis.image),
    },
    team: {
      sectionId: data.team.sectionId,
      title: data.team.title,
      description: data.team.description,
      members: data.team.members.map((member) => ({
        name: member.name,
        role: member.role,
        dept: member.dept,
        img: getCmsAsset(member.image),
      })),
    },
    principles: {
      ...data.principles,
      image: getCmsAsset(data.principles.image),
    },
    social: {
      ...data.social,
      posts: data.social.posts.map(resolveSocialEmbed),
    },
  };
})();

export const awards: {
  title: string;
  hero: {
    sectionId?: string;
    backgroundImage: ImageMetadata;
    title: string;
    subtitle: string;
  };
  gallery: {
    sectionId: string;
    items: AwardGalleryItem[];
  };
} = (() => {
  const data = awardsYaml as AwardsYaml;

  return {
    ...data,
    hero: {
      ...data.hero,
      backgroundImage: getCmsAsset(data.hero.backgroundImage),
    },
    gallery: {
      sectionId: data.gallery.sectionId,
      items: data.gallery.items.map((item, index) => {
        const fallbackImage = item.image ?? item.thumbnail;
        if (!fallbackImage) {
          throw new Error(`Awards: "${item.title}" is missing a thumbnail or image.`);
        }

        const fallbackAlt = item.imageAlt ?? item.title;
        const images = item.images?.length
          ? item.images
          : [{ image: fallbackImage, alt: fallbackAlt }];
        const thumbnail = item.thumbnail ?? fallbackImage;

        return {
          id: index + 1,
          type: item.type,
          title: item.title,
          slug: item.slug,
          organization: item.organization,
          date: item.date,
          thumbnailSrc: getCmsAsset(thumbnail),
          images: images.map((image) => ({
            src: getCmsAsset(image.image),
            alt: image.alt,
          })),
        };
      }),
    },
  };
})();

export const industry = (() => {
  const data = industryYaml as IndustryPageYaml;

  return {
    hero: {
      ...data.hero,
      heroImage: getCmsAsset(data.hero.heroImage),
      heroBackground: getCmsAsset(data.hero.heroBackground),
    },
  };
})();

function resolveSplitHero<T extends PageHeroYaml | SystemIntegrationHeroYaml>(hero: T) {
  return {
    ...hero,
    backgroundImage: getCmsAsset(hero.backgroundImage),
    foregroundImage: hero.foregroundImage ? getCmsAsset(hero.foregroundImage) : undefined,
  };
}

function resolveHero<T extends PageHeroYaml | SystemIntegrationHeroYaml>(hero: T) {
  return {
    ...resolveSplitHero(hero),
    carouselImages: hero.carouselImages?.map(getCmsAsset) ?? [],
  };
}

function validateHomeServices(services: HomeYaml['services']) {
  const expectedIds: HomeServiceId[] = ['telecom', 'resourcing', 'software', 'system'];

  if (services.items.length !== 4) {
    throw new Error(
      `Home services: expected exactly 4 services, received ${services.items.length}`,
    );
  }

  const seenIds = new Set<string>();
  for (const service of services.items) {
    if (!expectedIds.includes(service.id)) {
      throw new Error(`Home services: unsupported service id "${service.id}"`);
    }

    if (seenIds.has(service.id)) {
      throw new Error(`Home services: duplicate service id "${service.id}"`);
    }
    seenIds.add(service.id);

    if (service.features.length !== 6) {
      throw new Error(
        `Home services: "${service.id}" must have exactly 6 features, received ${service.features.length}`,
      );
    }

    if (service.metrics.length !== 4) {
      throw new Error(
        `Home services: "${service.id}" must have exactly 4 metrics, received ${service.metrics.length}`,
      );
    }
  }

  return services;
}

function resolveExecution<T extends MetricsOnlyExecutionYaml>(execution: T) {
  return {
    ...execution,
    headingHtml: execution.heading.replace(/\n/g, '<br />'),
  };
}

export const telecom = (() => {
  const data = telecomYaml as TelecomYaml;
  const capabilityIds = new Set<string>();

  return {
    ...data,
    hero: resolveHero(data.hero),
    capabilities: {
      ...data.capabilities,
      backgroundImage: getCmsAsset(data.capabilities.backgroundImage),
      items: data.capabilities.items.map((tab) => ({
        ...tab,
        id: uniqueSlug(tab.label, capabilityIds),
        image: getCmsAsset(tab.image),
      })),
    },
    processes: {
      ...data.processes,
      items: data.processes.items.map((process, index) => ({
        ...process,
        id: formatStepNumber(index),
        image: getCmsAsset(process.image),
      })),
    },
    execution: resolveExecution(data.execution),
  };
})();

export const systemIntegration = (() => {
  const data = systemIntegrationYaml as SystemIntegrationYaml;

  return {
    ...data,
    hero: resolveHero(data.hero),
    strategicPillars: {
      ...data.strategicPillars,
      backgroundImage: getCmsAsset(data.strategicPillars.backgroundImage),
      centerImage: getCmsAsset(data.strategicPillars.centerImage),
    },
    partnerEcosystem: {
      ...data.partnerEcosystem,
      tabs: data.partnerEcosystem.tabs.map((tab) => ({
        ...tab,
        partners: tab.partners.map((partner) => ({
          name: partner.name,
          logo: partner.logo ? getCmsAsset(partner.logo) : undefined,
        })),
      })),
    },
    execution: resolveExecution(data.execution),
    deployments: {
      ...data.deployments,
      image: getCmsAsset(data.deployments.image),
    },
  };
})();

export const software = (() => {
  const data = softwareYaml as SoftwareYaml;
  const usedPortfolioTabIds = new Set<string>();

  return {
    ...data,
    hero: resolveSplitHero(data.hero),
    portfolio: {
      ...data.portfolio,
      backgroundImage: getCmsAsset(data.portfolio.backgroundImage),
      capabilities: data.portfolio.capabilities.map((tab) => ({
        ...tab,
        id: uniqueSlug(tab.label, usedPortfolioTabIds),
        items: tab.items.map((item) => ({
          ...item,
          image: getCmsAsset(item.image),
        })),
      })),
    },
    engineeringStack: {
      ...data.engineeringStack,
      backgroundImage: getCmsAsset(data.engineeringStack.backgroundImage),
      cards: data.engineeringStack.cards.map((card) => ({
        ...card,
        image: getCmsAsset(card.image),
      })),
    },
    architecturalPrinciples: {
      ...data.architecturalPrinciples,
      backgroundImage: getCmsAsset(data.architecturalPrinciples.backgroundImage),
    },
    onboarding: {
      ...data.onboarding,
      backgroundImage: getCmsAsset(data.onboarding.backgroundImage),
    },
    execution: resolveExecution(data.execution),
    caseStudies: {
      ...data.caseStudies,
      items: data.caseStudies.items.map((item) => ({
        ...item,
        image: getCmsAsset(item.image),
      })),
    },
  };
})();

export const resourcing = (() => {
  const data = resourcingYaml as ResourcingYaml;

  return {
    ...data,
    hero: resolveHero(data.hero),
    capabilities: {
      ...data.capabilities,
      backgroundImage: getCmsAsset(data.capabilities.backgroundImage),
    },
    standard: {
      ...data.standard,
      images: data.standard.images.map((item) => ({
        ...item,
        image: getCmsAsset(item.image),
      })),
    },
    workforce: {
      ...data.workforce,
      tabs: data.workforce.tabs.map((tab) => ({
        ...tab,
        image: getCmsAsset(tab.image),
      })),
    },
    execution: resolveExecution(data.execution),
    caseStudies: {
      ...data.caseStudies,
      items: data.caseStudies.items.map((item) => ({
        ...item,
        image: getCmsAsset(item.image),
      })),
    },
  };
})();

const privacyMarkdown = Object.values(privacyMarkdownModules)[0];
const privacyMarkdownBody = privacyMarkdown?.rawContent?.().trim() ?? '';

if (!privacyMarkdown) {
  throw new Error('Privacy markdown file not found: src/data/cms/privacy.md');
}

export const privacy: LegalPageYaml = {
  ...privacyMarkdown.frontmatter,
  MarkdownContent: privacyMarkdownBody ? privacyMarkdown.Content : undefined,
};

const termsMarkdown = Object.values(termsMarkdownModules)[0];
const termsMarkdownBody = termsMarkdown?.rawContent?.().trim() ?? '';

if (!termsMarkdown) {
  throw new Error('Terms markdown file not found: src/data/cms/terms.md');
}

export const terms: LegalPageYaml = {
  ...termsMarkdown.frontmatter,
  MarkdownContent: termsMarkdownBody ? termsMarkdown.Content : undefined,
};

export const jobs = jobsYaml as JobsYaml;

function resolveDynamicSections(
  sections?: IndustryContentYaml['sections'] | CaseStudyContentYaml['sections'],
) {
  return (sections ?? []).map((section) => ({
    ...section,
    accentColor: section.accentColor ?? 'green',
    heroImage: section.heroImage ? getCmsAsset(section.heroImage) : undefined,
  }));
}

function resolveIndustryCaseStudyClients(
  section?: IndustryContentYaml['caseStudyClients'],
) {
  if (!section) return undefined;

  return {
    enabled: section.enabled ?? true,
    id: section.id,
    title: section.title,
    description: section.description,
    clientLogos: (section.clientLogos ?? []).map((logo) => ({
      ...logo,
      logoSrc: logo.logoSrc ? getCmsAsset(logo.logoSrc) : undefined,
    })),
    caseStudies: (section.caseStudies ?? []).map((study) => ({
      ...study,
      image: study.image ? getCmsAsset(study.image) : undefined,
      stats: study.stats ?? [],
    })),
    testimonials: section.testimonials ?? [],
  };
}

function resolveIndustry(
  industry: IndustryContentYaml,
  index: number,
  markdown?: {
    Content: any;
    rawContent?: () => string;
  },
): IndustryData {
  const markdownBody = markdown?.rawContent?.().trim() ?? '';

  return {
    slug: industry.slug,
    id: index,
    title: industry.metadata.title,
    shortTitle: industry.metadata.shortTitle,
    navOrder: industry.metadata.navOrder,
    summary: industry.metadata.description,
    heroSubtitle: industry.hero.summary,
    iconName: industry.metadata.iconName,
    techStack: industry.techStack ?? {
      enabled: true,
      title: 'Technologies & Frameworks',
      description:
        'We architect secure infrastructures matching international compliance standards and state-of-the-art tech platforms.',
      items: [],
    },
    caseStudyClients: resolveIndustryCaseStudyClients(industry.caseStudyClients),
    heroId: industry.hero.id,
    heroEyebrowPill: industry.hero.heroEyebrowPill,
    heroEyebrowMuted: industry.hero.heroEyebrowMuted,
    heroBackgroundImage: getCmsAsset(industry.hero.backgroundImage),
    heroTitle: industry.hero.title,
    heroSummary: industry.hero.summary,
    heroMetrics: industry.hero.metrics,
    heroCtaLabel: industry.hero.ctaLabel,
    heroCtaUrl: industry.hero.ctaUrl,
    heroSecondaryCtaLabel: industry.hero.secondaryCtaLabel,
    heroSecondaryCtaUrl: industry.hero.secondaryCtaUrl,
    MarkdownContent: markdownBody ? markdown?.Content : undefined,
    sections: resolveDynamicSections(industry.sections),
  };
}

export const industriesData = Object.values(industryMarkdownModules)
  .sort((a, b) => {
    const navOrderA = a.frontmatter.metadata.navOrder ?? Number.MAX_SAFE_INTEGER;
    const navOrderB = b.frontmatter.metadata.navOrder ?? Number.MAX_SAFE_INTEGER;

    return (
      navOrderA - navOrderB ||
      a.frontmatter.metadata.title.localeCompare(b.frontmatter.metadata.title) ||
      a.frontmatter.slug.localeCompare(b.frontmatter.slug)
    );
  })
  .map((markdown, index) => resolveIndustry(markdown.frontmatter, index, markdown));

function resolveCaseStudy(
  study: CaseStudyContentYaml,
  index: number,
  markdown?: {
    Content: any;
    rawContent?: () => string;
  },
): CaseStudyData {
  const markdownBody = markdown?.rawContent?.().trim() ?? '';

  return {
    ...study.metadata,
    slug: study.slug,
    id: index,
    thumbnailSrc: getCmsAsset(study.metadata.thumbnailImage),
    heroId: study.hero.id,
    heroEyebrow: study.hero.eyebrow,
    heroBackgroundImage: getCmsAsset(study.hero.backgroundImage),
    heroTitle: study.hero.title,
    heroSummary: study.hero.summary,
    heroMetrics: study.hero.metrics,
    heroCtaLabel: study.hero.ctaLabel,
    heroCtaUrl: study.hero.ctaUrl,
    heroSecondaryCtaLabel: study.hero.secondaryCtaLabel,
    heroSecondaryCtaUrl: study.hero.secondaryCtaUrl,
    MarkdownContent: markdownBody ? markdown?.Content : undefined,
    sections: resolveDynamicSections(study.sections),
  };
}

export const caseStudiesData = Object.values(caseStudyMarkdownModules)
  .sort((a, b) => a.frontmatter.slug.localeCompare(b.frontmatter.slug))
  .map((markdown, index) => resolveCaseStudy(markdown.frontmatter, index, markdown));

export const industryNavItems: CmsNavItem[] = industriesData.map((industry) => ({
  title: industry.title,
  desc: industry.summary,
  url: `/industry/${industry.slug}`,
  icon: industry.iconName,
}));
