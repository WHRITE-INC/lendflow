import { IMG } from "@/lib/images";

export type Product = {
  slug: string;
  name: string;
  blurb: string;
  min: number;
  max: number;
  maxTerm: number;
  image: string;
  bullets: string[];
  comingSoon?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    slug: "personal", name: "Personal Loan",
    blurb: "Get from K500 to K250,000 for your personal needs — school fees, medical bills or emergencies.",
    min: 500, max: 250000, maxTerm: 36, image: IMG.family,
    bullets: ["Funds in your wallet same day", "Flexible 3–36 month plans", "No early-settlement penalty"],
  },
  {
    slug: "business", name: "Business Loan",
    blurb: "Boost your business with working capital from K500 to K1,000,000.",
    min: 500, max: 1000000, maxTerm: 36, image: IMG.shopOwner,
    bullets: ["Stock, equipment and expansion", "Grow your limit with each repayment", "Dedicated relationship manager"],
  },
  {
    slug: "agri", name: "Agri Loan",
    blurb: "Loans for farmers — fund seeds, fertiliser, irrigation and tools to grow your yield.",
    min: 1000, max: 400000, maxTerm: 24, image: IMG.farming,
    bullets: ["Repayment aligned to harvest", "Input financing partners", "Solar and irrigation packages"],
  },
  {
    slug: "civil-servant", name: "Civil Servant Loan",
    blurb: "Payroll-backed lending for government employees with easy monthly deductions.",
    min: 1000, max: 300000, maxTerm: 36, image: IMG.officeTalk,
    bullets: ["Payslip verification only", "Competitive commitment rate", "Up to 36 months"],
  },
  {
    slug: "salary-advance", name: "Salary Advance",
    blurb: "Bridge the gap before payday with a short-term advance on your salary.",
    min: 300, max: 20000, maxTerm: 3, image: IMG.phoneUser,
    bullets: ["Approved in minutes", "Repay on your next payday", "No paperwork"],
  },
  {
    slug: "asset-finance", name: "Asset Financing",
    blurb: "Finance vehicles, machinery and equipment with the asset as security.",
    min: 5000, max: 1500000, maxTerm: 36, image: IMG.meeting,
    bullets: ["Up to 80% asset value", "Insurance bundled", "Fixed monthly instalments"],
  },
  {
    slug: "invoice", name: "Invoice Discounting",
    blurb: "Unlock cash tied up in unpaid invoices from creditworthy buyers.",
    min: 5000, max: 2000000, maxTerm: 6, image: IMG.market,
    bullets: ["Advance up to 70% of invoice", "Order finance available", "48-hour turnaround"],
  },
  {
    slug: "bill-credit", name: "Bill Credit",
    blurb: "Airtime, data, pay TV, electricity and water on credit — pay later.",
    min: 50, max: 5000, maxTerm: 1, image: IMG.mobileMoney,
    bullets: ["Buy now, pay later", "Instant top-ups", "One tap from your dashboard"],
    comingSoon: true,
  },
];

export const getProduct = (slug: string) => PRODUCTS.find(p => p.slug === slug);
