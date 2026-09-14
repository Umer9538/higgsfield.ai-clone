/**
 * Enterprise copy transcribed from the live higgsfield.ai/enterprise and
 * /team-plan pages on 2026-09-14.
 */

export const ENTERPRISE_HERO = {
  eyebrow: "Higgsfield.AI Enterprise",
  headline: "The AI-native creative suite built for enterprise",
  proof: "390 of the Fortune 500 already work with us",
  sub: "Purpose-built for the modern creative enterprise",
  cta: "Contact Sales",
};

export const IMPACT_STATS = [
  { value: "10x", label: "Faster production" },
  { value: "$12k", label: "Saved per created content" },
  { value: "40%", label: "Higher engagement" },
];

export const TRUST_LINE = "Private & Secure  ·  SOC 2 & ISO 42001 aligned  ·  GDPR compliant";

export const PILLARS = [
  {
    id: "admin",
    title: "Admin & Access",
    body: "SSO/SAML, role-based access control and centralized user provisioning from one dashboard.",
  },
  {
    id: "data",
    title: "Data & Compliance",
    body: "SOC 2-aligned controls, GDPR compliance and a contractual no-train guarantee on your data.",
  },
  {
    id: "support",
    title: "Dedicated Support",
    body: "A dedicated account manager, private Slack channel and hands-on onboarding from an AI Educator.",
  },
];

export const WORKSPACE_GROUPS = [
  {
    title: "Work as one team",
    items: [
      "Shared team workspace with approvals & comments",
      "Sub-workspaces",
      "Unlimited number of seats",
    ],
  },
  {
    title: "Exclusive features",
    items: ["Unlimited number of seats", "10x more concurrent generations", "Dedicated capacity"],
  },
  {
    title: "Pro control over workflow",
    items: [
      "Credit pooling & allocation across teams",
      "Centralized billing via invoice or PO",
      "Extended admin controls & usage analytics",
      "SSO / SAML & role-based access control",
    ],
  },
];

export const CAPABILITIES = [
  {
    id: "models",
    title: "50+ Models",
    lead: "All-in-one suite with 50+ models.",
    body: "Our platform includes dedicated video, image, and audio models, along with proprietary tools built for creative scaling.",
  },
  {
    id: "marketing",
    title: "Marketing Studio",
    lead: "Scale your marketing output.",
    body: "Create UGC ads and commercials for any product or service with pre-built hooks and settings. Total flexibility for your marketing department.",
  },
  {
    id: "cinema",
    title: "Cinema Studio",
    lead: "Complete solution for your production studio.",
    body: "Shape every shot with precise control over camera, lens, and light with Cinema Studio.",
  },
  {
    id: "mcp",
    title: "MCP & CLI",
    lead: "Enhance your best workflows with MCP & CLI.",
    body: "Integrate your Higgsfield Enterprise workspace with existing solutions like Claude, ChatGPT, Figma and more.",
  },
  {
    id: "agentic",
    title: "Agentic Engine",
    lead: "Design smart, develop like a pro.",
    body: "Use Supercomputer's skills, connectors and automations to build, generate and market anything.",
  },
  {
    id: "canvas",
    title: "Canvas",
    lead: "One canvas to rule them all.",
    body: "Connect your assets logically in one node-based canvas across your whole team.",
  },
  {
    id: "character",
    title: "Character Studio",
    lead: "Create your own enterprise characters, mascots, and brand faces.",
    body: "Upload photos from multiple angles to train your character, then use it consistently across new images and videos.",
  },
];

export const SALES_FEATURES = [
  "No training on your data",
  "50+ top video, image, and audio models in one workspace",
  "Easy seat, role, and credit management",
  "Integrations with Adobe, Figma, and more",
];

/** Credit volume bands offered in the Contact Sales form. */
export const CREDIT_TIERS = [
  { id: "team", label: "Team", credits: "50,000 credits/mo", seats: "Up to 25 seats" },
  { id: "scale", label: "Scale", credits: "250,000 credits/mo", seats: "Up to 100 seats", featured: true },
  { id: "custom", label: "Custom", credits: "Unlimited pooled credits", seats: "Unlimited seats" },
];

export const CONTACT_FIELDS = [
  { id: "first-name", label: "First name", type: "text" },
  { id: "last-name", label: "Last name", type: "text" },
  { id: "company", label: "Company name", type: "text" },
  { id: "job-title", label: "Job title", type: "text" },
  { id: "email", label: "Business email", type: "email" },
  { id: "website", label: "Website", type: "url" },
];

export const CONTACT_REASONS = [
  "Select a reason",
  "Marketing & advertising content",
  "Film & production",
  "Product & e-commerce visuals",
  "Agency client work",
  "Something else",
];

export const ENTERPRISE_FAQS = [
  {
    question: "What is Higgsfield Enterprise?",
    answer:
      "Higgsfield Enterprise is an AI video and image generation platform for business teams. It combines 50+ leading generative models in one secure workspace with SSO, role-based access control, shared credit pools, and dedicated GPU capacity — so marketing, design, and content teams can produce campaign-ready video at scale with full commercial rights.",
  },
  {
    question: "Which AI models are included in Higgsfield Enterprise?",
    answer:
      "Higgsfield Enterprise includes 50+ state-of-the-art image, video, and audio models in one subscription — including Seedance, Kling, Nano Banana Pro, GPT Image, and Higgsfield's own Soul model — plus 250+ VFX presets, camera controls, and consistent characters. One workspace and one credit pool cover every model, with new models added at launch.",
  },
  {
    question: "Can we use AI-generated videos commercially?",
    answer:
      "Yes. Every output created in Higgsfield Enterprise is cleared for commercial use — ads, product content, social media, and client work. Enterprise agreements include full IP ownership of your outputs and contract-backed indemnification, so brands and agencies can publish AI-generated video with legal confidence.",
  },
  {
    question: "Does Higgsfield train AI models on our data?",
    answer:
      "No. Higgsfield Enterprise never trains models on your data. Your prompts, uploads, brand assets, and generated content stay within your private workspace under a contractual no-train guarantee, with granular access controls — protection built for unreleased products, embargoed campaigns, and confidential client material.",
  },
  {
    question: "Is Higgsfield secure enough for enterprise use?",
    answer:
      "Yes. Higgsfield Enterprise is built to enterprise security standards: SOC 2-aligned controls, GDPR compliance, single sign-on (SSO/SAML), role-based access control, private team workspaces, and centralized user provisioning. Security documentation is available for review during procurement, and our team supports vendor security assessments.",
  },
  {
    question: "How much does Higgsfield Enterprise cost?",
    answer:
      "Higgsfield Enterprise uses credit-based pricing on annual contracts with monthly payments, sized to your team's seats and generation volume.",
  },
  {
    question: "Does Higgsfield integrate with our existing creative tools?",
    answer:
      "Yes. Higgsfield offers native plugins for Adobe Premiere Pro, After Effects, Photoshop, DaVinci Resolve, and Figma, so generations land inside the tools your team already uses. Developers and agentic workflows connect through Higgsfield's MCP server and CLI, and the Supercomputer agent can automate full content pipelines end to end.",
  },
  {
    question: "How quickly can our team start producing with Higgsfield Enterprise?",
    answer:
      "Most teams are generating within days. After signing, your workspace goes live and a dedicated AI Educator runs hands-on onboarding built around your first real project — prompt craft, camera direction, and brand workflows — with ongoing support through a private Slack channel and a dedicated account manager.",
  },
];
