import {
  Atom,
  Beaker,
  FlaskConical,
  Dna,
  Microscope,
  TestTubes,
  Droplets,
  Syringe,
  Layers,
  Boxes,
  Thermometer,
  Pipette,
  CircleDot,
  GraduationCap,
  Building2,
  Pill,
  Stethoscope,
  Activity,
  Landmark,
  ClipboardList,
  ShieldCheck,
  Globe2,
  BadgeIndianRupee,
  Truck,
  Headset,
  Award,
} from "lucide-react";

export const productCategories = [
  {
    name: "Laboratory Chemicals",
    icon: FlaskConical,
    desc: "Bulk and fine chemicals with batch-wise CoA documentation.",
  },
  {
    name: "Organic Chemicals",
    icon: Atom,
    desc: "Solvents, intermediates and building blocks for synthesis.",
  },
  {
    name: "Inorganic Chemicals",
    icon: CircleDot,
    desc: "Salts, acids, bases and metal compounds at assured purity.",
  },
  {
    name: "Analytical Reagents",
    icon: Pipette,
    desc: "AR/HPLC/LC-MS grade reagents for precision analytics.",
  },
  {
    name: "Cell Culture Media",
    icon: Layers,
    desc: "Classical media, supplements, buffers and sterile solutions.",
  },
  {
    name: "Antibodies",
    icon: Dna,
    desc: "Primary, secondary, monoclonal and polyclonal antibodies.",
  },
  {
    name: "Fetal Bovine Serum (FBS)",
    icon: Droplets,
    desc: "Origin-traceable, gamma-irradiated and filtered serum lots.",
  },
  {
    name: "ELISA Kits",
    icon: Syringe,
    desc: "Validated immunoassay kits across human and animal targets.",
  },
  {
    name: "Molecular Biology Reagents",
    icon: TestTubes,
    desc: "Polymerases, kits, ladders, dNTPs and transfection reagents.",
  },
  {
    name: "Proteins & Enzymes",
    icon: Beaker,
    desc: "Recombinant proteins, cytokines and research-grade enzymes.",
  },
  {
    name: "Laboratory Glassware",
    icon: Thermometer,
    desc: "Borosilicate glassware and volumetric ware for daily bench use.",
  },
  {
    name: "Laboratory Instruments",
    icon: Microscope,
    desc: "Analytical, imaging and sample-preparation instrumentation.",
  },
  {
    name: "Scientific Consumables",
    icon: Boxes,
    desc: "Plasticware, filtration, tips, plates and PPE essentials.",
  },
];

export const industries = [
  { name: "Universities", icon: GraduationCap, desc: "Teaching labs and core research facilities." },
  { name: "Biotechnology Companies", icon: Dna, desc: "Discovery, scale-up and process development." },
  { name: "Pharmaceutical Companies", icon: Pill, desc: "QC, formulation and analytical development." },
  { name: "Hospitals", icon: Stethoscope, desc: "Clinical and pathology laboratory supplies." },
  { name: "Diagnostic Laboratories", icon: Activity, desc: "Assay kits, reagents and consumables." },
  { name: "Research Institutes", icon: Landmark, desc: "Government and autonomous research bodies." },
  { name: "CROs", icon: ClipboardList, desc: "Contract research and testing organisations." },
];

export const advantages = [
  { name: "Premium Quality Products", icon: Award, desc: "Every consignment ships with documentation and lot traceability." },
  { name: "Global Brands", icon: Globe2, desc: "Authorised sourcing from internationally recognised manufacturers." },
  { name: "Competitive Pricing", icon: BadgeIndianRupee, desc: "Institutional pricing, rate contracts and tender support." },
  { name: "Fast Delivery Across India", icon: Truck, desc: "Cold-chain and standard logistics to every major research hub." },
  { name: "Technical Support", icon: Headset, desc: "Application guidance from scientifically trained specialists." },
  { name: "Secure Procurement", icon: ShieldCheck, desc: "GST-compliant paperwork, GeM and e-procurement readiness." },
];

export const brands = [
  { name: "Thermo Fisher", logo: "thermo" },
  { name: "Sigma-Aldrich", logo: "sigma" },
  { name: "HiMedia", logo: "himedia" },
  { name: "Abcam", logo: "abcam" },
  { name: "Bio-Rad", logo: "biorad" },
  { name: "Corning", logo: "corning" },
  { name: "Qiagen", logo: "qiagen" },
  { name: "Gibco", logo: "gibco" },
  { name: "Eppendorf", logo: "eppendorf" },
  { name: "Borosil", logo: "borosil" },
  { name: "Sartorius", logo: "sartorius" },
];

export const faqs = [
  {
    q: "Do you supply to government institutes and universities?",
    a: "Yes. We regularly supply to central and state universities, CSIR/ICMR/DBT institutes and IITs, and we support GeM, e-tender and rate-contract procurement with complete documentation.",
  },
  {
    q: "Can you provide Certificates of Analysis and MSDS?",
    a: "Batch-specific CoA, MSDS and, where applicable, origin and sterility certificates accompany every dispatch.",
  },
  {
    q: "How is Fetal Bovine Serum shipped?",
    a: "FBS and other temperature-sensitive products are shipped in validated cold-chain packaging with dry ice or gel packs and temperature monitoring on request.",
  },
  {
    q: "What is the typical delivery timeline?",
    a: "Stocked items dispatch within 24–48 hours. Indent and import items typically take 2–4 weeks depending on the manufacturer and product line.",
  },
  {
    q: "Do you offer bulk or annual supply contracts?",
    a: "Yes. We offer annual rate contracts, consignment stocking and bulk pack sizes for high-consumption reagents and chemicals.",
  },
  {
    q: "Can you source a product that is not listed?",
    a: "Share the catalogue number or specification in the quote form and our sourcing team will revert with availability, pricing and lead time.",
  },
];

export const contact = {
  phone: "+91 7303442030",
  email: "hello@evolvelifesciences.in",
  address: "Faridabad, Haryana 121003, India",
  gstin: "06AAPPW0546E1ZJ",
};