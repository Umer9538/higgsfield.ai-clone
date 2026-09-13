/**
 * Pricing content, transcribed from recon/pricing screenshots.
 * Annual prices are the headline; monthly is the struck-through comparison.
 */

export type PlanId = "basic" | "pro" | "max";

export interface FeatureRow {
  label: string;
  included: boolean;
  badges?: { label: string; tone: "lime" | "pink" | "neutral" | "green" }[];
  note?: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Per-month price when billed annually */
  annual: number;
  /** Per-month price when billed monthly */
  monthly: number;
  discountLabel?: string;
  bestValue?: boolean;
  credits: {
    /** Fixed allowance, or a slider range */
    fixed?: number;
    min?: number;
    max?: number;
    steps?: number[];
    approximations: string[];
    fixedNote?: string;
  };
  seedance: {
    heading: string;
    sub: string;
    available: boolean;
    rows: FeatureRow[];
  };
  unlimited: FeatureRow[];
  unlimitedMore?: string;
  capabilities: FeatureRow[];
}

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "For first-time AI creators",
    annual: 9,
    monthly: 9,
    credits: {
      fixed: 120,
      approximations: ["≈ 60 Nano Banana Pro Generations", "≈ 7 Seedance 2.0 Fast videos"],
      fixedNote: "Fixed amount of 120 credits/mo",
    },
    seedance: {
      heading: "No access to Seedance 2.5",
      sub: "Available from Pro plan",
      available: false,
      rows: [
        { label: "Seedance 2.5", included: false, note: "No access" },
        { label: "Seedance 2.0", included: false, note: "No access" },
      ],
    },
    unlimited: [
      { label: "Nano Banana Pro", included: false },
      { label: "Nano Banana 2", included: false },
      { label: "Kling 3.0", included: false },
      { label: "No other unlimited models", included: false },
    ],
    capabilities: [
      { label: "Parallel generations: up to 2 Videos, 2 Images", included: true },
      { label: "Access to Supercomputer", included: true },
      { label: "Access to Seedance 2.0 Fast & 2.0 Mini", included: true },
      { label: "Access to selected models & features", included: true },
      { label: "Early access to advanced AI features", included: false },
      { label: "Access to unlimited marketplace", included: false },
      { label: "Lowest cost per credit", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For everyday AI creation",
    annual: 20,
    monthly: 29,
    discountLabel: "31% OFF",
    credits: {
      min: 600,
      max: 900,
      steps: [600, 900],
      approximations: [
        "≈ 300 Nano Banana Pro Generations",
        "≈ 27 Seedance 2.0 videos",
      ],
    },
    seedance: {
      heading: "Access to Seedance models",
      sub: "Full line-up included",
      available: true,
      rows: [
        {
          label: "Seedance 2.5",
          included: true,
          badges: [
            { label: "1080p", tone: "neutral" },
            { label: "Full access", tone: "lime" },
          ],
        },
        {
          label: "Seedance 2.0",
          included: true,
          badges: [
            { label: "4K", tone: "neutral" },
            { label: "Full access", tone: "lime" },
          ],
        },
      ],
    },
    unlimited: [
      { label: "Nano Banana Pro", included: false, note: "No unlimited" },
      {
        label: "Nano Banana 2",
        included: true,
        badges: [
          { label: "2K", tone: "neutral" },
          { label: "7-day unlimited", tone: "lime" },
        ],
      },
      {
        label: "Kling 3.0",
        included: true,
        badges: [{ label: "7-day unlimited", tone: "lime" }],
      },
    ],
    unlimitedMore: "7 unlimited & free generation models",
    capabilities: [
      { label: "Unlimited paid parallel generations", included: true, badges: [{ label: "New", tone: "pink" }] },
      { label: "Access to Supercomputer", included: true },
      { label: "Access to all Seedance models", included: true },
      { label: "Access to all models & features", included: true },
      { label: "Early access to advanced AI features", included: true },
      { label: "Access to unlimited marketplace", included: true },
      { label: "Lowest cost per credit", included: false },
    ],
  },
  {
    id: "max",
    name: "Max",
    tagline: "For ambitious AI projects",
    annual: 45,
    monthly: 79,
    discountLabel: "43% OFF",
    bestValue: true,
    credits: {
      min: 1800,
      max: 5400,
      steps: [1800, 3600, 5400],
      approximations: [
        "≈ 900 Nano Banana Pro Generations",
        "≈ 80 Seedance 2.0 videos",
      ],
    },
    seedance: {
      heading: "Access to Seedance models",
      sub: "Full line-up included",
      available: true,
      rows: [
        {
          label: "Seedance 2.5",
          included: true,
          badges: [
            { label: "1080p", tone: "neutral" },
            { label: "Full access", tone: "lime" },
          ],
        },
        {
          label: "Seedance 2.0",
          included: true,
          badges: [
            { label: "4K", tone: "neutral" },
            { label: "Full access", tone: "lime" },
          ],
        },
      ],
    },
    unlimited: [
      {
        label: "Nano Banana Pro",
        included: true,
        badges: [
          { label: "2K", tone: "neutral" },
          { label: "7-day unlimited", tone: "lime" },
        ],
      },
      {
        label: "Nano Banana 2",
        included: true,
        badges: [
          { label: "2K", tone: "neutral" },
          { label: "7-day unlimited", tone: "lime" },
        ],
      },
      { label: "Kling 3.0", included: true, badges: [{ label: "7-day unlimited", tone: "lime" }] },
    ],
    unlimitedMore: "7 unlimited & free generation models",
    capabilities: [
      { label: "Unlimited paid parallel generations", included: true, badges: [{ label: "New", tone: "pink" }] },
      { label: "Access to Supercomputer", included: true },
      { label: "Access to all Seedance models", included: true },
      { label: "Access to all models & features", included: true },
      { label: "Early access to advanced AI features", included: true },
      { label: "Access to unlimited marketplace", included: true },
      {
        label: "Lowest cost per credit",
        included: true,
        badges: [{ label: "70% CHEAPER", tone: "green" }],
      },
    ],
  },
];

export const PLAN_FOOTNOTES = {
  links: ["How do Higgsfield plans work?", "What are Unlimited models?"],
  disclaimers: [
    "Unlimited models and Free Generations on plans are accessible only via higgsfield.ai and are not accessible via MCP/CLI, Canvas or Supercomputer.",
    "Prices exclude VAT and local taxes, calculated at checkout. Unlimited usage may be subject to dynamic speed adjustments during high-traffic periods.",
    "Access to new models and advanced features may be done on a rolling basis and not available to all users at launch.",
  ],
};

export interface ComparisonRow {
  label: string;
  note?: string;
  values: [string | boolean, string | boolean, string | boolean];
}

export interface ComparisonGroup {
  title: string;
  rows: ComparisonRow[];
}

/** Column order is Basic, Pro, Max throughout. */
export const COMPARISON: ComparisonGroup[] = [
  {
    title: "Video",
    rows: [
      {
        label: "Concurrent Jobs",
        values: ["2 concurrent jobs", "3 concurrent jobs", "8 concurrent jobs"],
      },
      {
        label: "Seedance 2.0 720p",
        note: "\u224822 credits/5s",
        values: [false, "320 videos", "960 videos"],
      },
      {
        label: "Seedance 2.0 1080p",
        note: "\u224845 credits/5s",
        values: [false, "160 videos", "480 videos"],
      },
      {
        label: "Seedance 2.0 4K",
        note: "\u224885 credits/5s",
        values: [false, "85 videos", "188 videos"],
      },
      {
        label: "Seedance 2.5",
        note: "Available from Pro plan",
        values: [false, true, true],
      },
      { label: "Kling 3.0", note: "\u224814 credits/8s", values: [false, true, true] },
    ],
  },
  {
    title: "Image",
    rows: [
      {
        label: "Concurrent Jobs",
        values: ["2 concurrent jobs", "6 concurrent jobs", "12 concurrent jobs"],
      },
      {
        label: "Nano Banana Pro",
        note: "\u22482 credits each",
        values: ["60 images", "450 images", "2,700 images"],
      },
      { label: "Nano Banana 2", note: "7-day unlimited on Pro and Max", values: [false, true, true] },
      { label: "GPT Image 2", note: "4K, near-perfect text", values: [true, true, true] },
      { label: "Soul ID Character", values: [false, true, true] },
    ],
  },
  {
    title: "Audio",
    rows: [
      { label: "Text to Speech", note: "Seed Audio 1.0", values: [true, true, true] },
      { label: "Voice Change", values: [false, true, true] },
      { label: "Multi-speaker scenes", values: [false, false, true] },
    ],
  },
  {
    title: "Platform",
    rows: [
      { label: "Supercomputer", values: [true, true, true] },
      { label: "MCP & CLI", values: ["Basic", "Full", "Full"] },
      { label: "Early access to advanced AI features", values: [false, true, true] },
      { label: "Access to unlimited marketplace", values: [false, true, true] },
      { label: "Commercial usage rights", values: [true, true, true] },
      { label: "Priority support", values: [false, false, true] },
    ],
  },
];

export const PRICING_PROMO = {
  badge: "Personal 54% OFF",
  headline: "Nano Banana Pro, 2 & Kling 3.0 Unlimited.",
  subheadline: "Upgrade with Personal 54% OFF",
  note: "This offer is active for limited time only. Get Premium plans with 54% OFF",
  countdownLabel: "Personal promo expires in...",
  durationSeconds: 1 * 3600 + 33 * 60 + 1,
};

export const CALCULATOR = {
  intro: "Choose what you want to create and get what you need",
  goals: [
    { id: "social", label: "Social media videos" },
    { id: "avatar", label: "Talking-avatar videos" },
    { id: "ugc", label: "UGC & product video ads" },
    { id: "marketing", label: "Marketing product photos" },
    { id: "cinematic", label: "Cinematic videos" },
    { id: "personal", label: "Personal use" },
  ],
  /** Credit cost per unit, used to compute the recommendation. */
  sliders: [
    {
      id: "video",
      label: "Kling 3.0 videos",
      note: "≈ 14 credits each · per Kling 3.0 generation, 8s, 720p",
      creditsEach: 14,
      max: 200,
      defaultValue: 50,
    },
    {
      id: "image",
      label: "Nano Banana Pro images",
      note: "≈ 2 credits each · per Nano Banana Pro generation",
      creditsEach: 2,
      max: 500,
      defaultValue: 60,
    },
  ],
  features: [
    { id: "image-gen", label: "AI image generation" },
    { id: "video-gen", label: "AI video generation" },
    { id: "mcp", label: "MCP & Supercomputer", tier: "Basic" },
  ],
};

export const FAQS: { question: string; answer: string }[] = [
  {
    question: "How do credits work?",
    answer:
      "Credits are spent each time you generate. Different models cost different amounts — a Nano Banana Pro image is around 2 credits, a Kling 3.0 video around 14. Your allowance refreshes every month and unused credits do not roll over.",
  },
  {
    question: "Is my subscription automatically renewed?",
    answer:
      "Yes. Plans renew automatically at the end of each billing period, monthly or annually depending on what you chose. You can cancel any time from account settings and keep access until the period ends.",
  },
  {
    question: "How many images or videos can I generate?",
    answer:
      "It depends on your credit allowance and which models you use. As a guide, 600 credits is roughly 300 Nano Banana Pro images or about 27 Seedance 2.0 videos.",
  },
  {
    question: "How can I purchase extra credits?",
    answer:
      "Top-up packs are available from your billing page at any point in the cycle. Purchased credits sit on top of your monthly allowance and are used only once the monthly credits run out.",
  },
  {
    question: "How does Unlimited work?",
    answer:
      "Unlimited models can be generated without spending credits, subject to fair-use rate limits. Which models are unlimited depends on your plan — Max includes Nano Banana Pro, Pro does not.",
  },
  {
    question: "How does 365 Unlimited promo work?",
    answer:
      "The promo grants a full year of unlimited access to the included models at the discounted rate. It applies from the moment you upgrade and runs for 365 days.",
  },
  {
    question: "Can I change my subscription after purchase?",
    answer:
      "Yes. Upgrades apply immediately and are prorated against what you have already paid. Downgrades take effect at the start of your next billing period.",
  },
  {
    question: "How much does it cost to use Higgsfield Supercomputer?",
    answer:
      "Supercomputer is included on every paid plan. Runs consume credits from your normal allowance based on the models the agent calls, so there is no separate subscription.",
  },
];
