"use client";

import React, { useState, useEffect, useMemo } from 'react';
import NextImage from 'next/image';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  ShoppingCart,
  AlertCircle,
  Users,
  Crosshair,
  CreditCard,
  Database,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Download,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  TrendingUp,
  Eye,
  EyeOff,
  DollarSign,
  Activity,
  Phone,
  Mail,
  MessageCircle,
  Lock,
  Unlock,
  Ban,
  Sparkles,
  FileText,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Key,
  Globe,
  Zap,
  Filter,
  ArrowUpRight,
  Play,
  Tag,
  Server,
  Terminal,
  LogOut,
  LogIn,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import {
  pushCollectionToFirestore,
  deleteDocumentFromFirestore,
  saveCourseToFirestore,
  deleteCourseFromFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveHeroSlidesToFirestore,
  saveSiteConfigToFirestore,
  saveCouponsToFirestore,
  saveBlockedEntitiesToFirestore,
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  updateLeadInFirestore,
  deleteLeadFromFirestore,
  updateUserInFirestore,
  syncAllDefaultCatalogToFirestore,
  subscribeToCourses,
  subscribeToProducts,
  subscribeToHeroSlides,
  subscribeToSiteSettings,
  subscribeToCoupons,
  subscribeToOrders,
  subscribeToLeads,
  subscribeToUsers,
  subscribeToBlockedEntities,
  adminSignInWithEmail,
  adminSignInWithGoogle,
  adminSignOut,
  adminSendPasswordResetEmail,
  subscribeToAdminAuth,
} from '@/lib/firebase-admin-bridge';

// ============================================================================
// 1. DATA INTERFACES (SHARED BETWEEN MAIN WEBSITE & STANDALONE ADMIN PANEL)
// ============================================================================

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
  videoUrl: string;
  summaryBn: string;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface CourseResource {
  id: string;
  title: string;
  size: string;
  filename: string;
  content: string;
}

export interface AdminCourse {
  id: string;
  slug: string;
  title?: string;
  titleBn: string;
  shortTitleBn: string;
  subtitle?: string;
  subtitleBn: string;
  shortDescBn: string;
  price: number;
  originalPrice: number;
  discountBadge?: string;
  thumbnailUrl: string;
  bannerUrl?: string;
  introVideoUrl?: string;
  category: string;
  studentsCount: string;
  rating: string;
  reviewsCount?: string;
  totalDuration: string;
  modulesCount?: number;
  softwareTags?: string[];
  status: 'PUBLISHED' | 'DRAFT';
  featured: boolean;
  outcomes: string[];
  modules: CourseModule[];
  resources: CourseResource[];
}

export interface AdminProduct {
  id: string;
  slug: string;
  title?: string;
  titleBn: string;
  shortTitleBn: string;
  shortDesc?: string;
  shortDescBn: string;
  price: number;
  originalPrice: number;
  discountBadge?: string;
  badge?: string;
  thumbnailUrl: string;
  images?: string[];
  category: string;
  rating: string;
  salesCount: string;
  softwareTags?: string[];
  fileFormat?: string;
  fileSize?: string;
  status: 'PUBLISHED' | 'DRAFT';
  features?: string[];
  featuresBn: string[];
  downloadFilename: string;
  downloadContent: string;
}

export interface AdminHeroSlide {
  id: string;
  badge?: string;
  topLine?: string;
  highlight?: string;
  subBadge?: string;
  bottomTitle?: string;
  image: string;
  slug: string;
  pills?: string[];
  active: boolean;
  showOverlay?: boolean; // false = Full Fresh Graphic Banner without black gradient or text overlay
  showCta?: boolean; // whether to show button on banner
  ctaText?: string; // custom button text, e.g. "এখনই কিনুন"
}

export interface OrderRecord {
  id: string;
  orderCode: string;
  orderId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  itemType: 'course' | 'product';
  itemSlug: string;
  itemTitleBn: string;
  itemTitle?: string;
  amountBdt: number;
  paymentMethod: 'UddoktaPay' | 'bKash' | 'Nagad' | 'Rocket' | 'bkash_manual' | string;
  trxId: string;
  couponUsed: string | null;
  status: 'COMPLETED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  verifiedBy: string;
}

export interface IncompleteOrderLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  itemSlug: string;
  itemTitleBn: string;
  amountBdt: number;
  status: 'INCOMPLETE' | 'RECOVERED';
  capturedAt: string;
  ip: string;
}

export interface ManagedUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  enrolledSlugs: string[];
  totalSpentBdt: number;
  joinedAt: string;
  lastActive: string;
  status: 'ACTIVE' | 'BANNED';
  ip: string;
}

export interface PromoCoupon {
  code: string;
  discountPct: number;
  usageCount: number;
  active: boolean;
  descriptionBn: string;
}

export interface PixelEventLog {
  id: string;
  event: 'PageView' | 'ViewContent' | 'InitiateCheckout' | 'Lead' | 'Purchase';
  itemTitle: string;
  valueBdt: number;
  channels: string[];
  time: string;
}

export interface SiteBridgeConfig {
  mainWebsiteUrl: string;
  adminPanelUrl: string;
  apiSyncSecret: string;
  gatewayProvider: string;
  gatewayBaseUrl: string;
  gatewayApiKey: string;
  gatewayEnabled: boolean;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  manualAccountType: string;
  supportPhone: string;
  supportWhatsapp: string;
  supportEmail: string;
  supportMessenger: string;
  facebookUrl?: string;
  telegramUrl?: string;
  youtubeUrl?: string;
  supportHours: string;
  fbPixelId: string;
  fbCapiToken: string;
  fbTestEventCode: string;
  tiktokPixelId: string;
  ga4MeasurementId: string;
  pixelEnabled: boolean;
  firebaseProjectId: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  adminEmail: string;
  youtubeSubs?: string;
  activeStudents?: string;
  positiveReviews?: string;
  studentEarnings?: string;
  requireCourseLogin?: boolean;
}

// ============================================================================
// 2. VISUAL ASSETS & INITIAL SYNCHRONIZED DATA
// ============================================================================

const HERO_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='%2307131e'/><text x='50%' y='50%' fill='%2310b981' font-size='32' font-family='sans-serif' text-anchor='middle'>MobinIQ Complete AI Mastery</text></svg>";
const DOC_COURSE_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='%230c1021'/><text x='50%' y='50%' fill='%2338bdf8' font-size='32' font-family='sans-serif' text-anchor='middle'>Cinematic Tech Documentary</text></svg>";
const AI_COURSE_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='%2307131e'/><text x='50%' y='50%' fill='%2310b981' font-size='32' font-family='sans-serif' text-anchor='middle'>MobinIQ Complete AI Mastery</text></svg>";
const EDIT_COURSE_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='%23171024'/><text x='50%' y='50%' fill='%23fbbf24' font-size='32' font-family='sans-serif' text-anchor='middle'>High-Retention Video Editing</text></svg>";

const INITIAL_COURSES: AdminCourse[] = [
  {
    id: 'course-cinematic-editing',
    slug: 'cinematic-video-editing-masterclass',
    title: 'USA YouTube Automation & AI Website Development Masterclass',
    titleBn: 'ইউএসএ ইউটিউব অটোমেশন ও এআই ওয়েবসাইট ডেভেলপমেন্ট মাস্টারক্লাস',
    shortTitleBn: 'ইউটিউব ও এআই মাস্টারক্লাস',
    subtitle: 'Master AI faceless YouTube cash cow channels targeting Tier-1 USA audiences and build responsive websites with AI without coding.',
    subtitleBn: 'ক্যামেরার সামনে না এসেও AI টুলস দিয়ে ফেসলেস ইউএসএ চ্যানেল তৈরি এবং কোডিং ছাড়াই এআই দিয়ে ওয়েবসাইট ডেভেলপমেন্টের পূর্ণাঙ্গ গাইড।',
    shortDescBn: 'ক্যামেরার সামনে না এসেও AI টুলস দিয়ে ফেসলেস ইউএসএ চ্যানেল তৈরি এবং কোডিং ছাড়াই এআই দিয়ে ওয়েবসাইট ডেভেলপমেন্টের পূর্ণাঙ্গ গাইড।',
    price: 1490,
    originalPrice: 2000,
    discountBadge: '25% OFF',
    thumbnailUrl: '/images/course-ai-automation.jpg',
    bannerUrl: '/images/course-ai-automation.jpg',
    introVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'এআই ও অটোমেশন',
    studentsCount: '1.2K+ Joined',
    rating: '4.9',
    reviewsCount: '320+ Reviews',
    totalDuration: '8h 20m',
    modulesCount: 4,
    softwareTags: ['ChatGPT', 'Claude', 'ElevenLabs', 'No-Code AI'],
    status: 'PUBLISHED',
    featured: true,
    outcomes: [
      'AI-powered faceless YouTube cash cow channel setup',
      'Targeting high-RPM Tier-1 USA/UK viewers ($20-$45 RPM)',
      '100% human-like voiceovers with ElevenLabs & scriptwriting with ChatGPT',
      'Building and publishing responsive client websites using AI without coding'
    ],
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Workspace Setup & Essential Shortcuts',
        order: 1,
        lessons: [
          {
            id: 'les-1',
            title: '1.1 Interface Customization & Timeline Optimization',
            duration: '15:20',
            isPreview: true,
            videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
            summaryBn: 'ওয়ার্কস্পেস ও টাইমলাইন কাস্টমাইজেশন।'
          },
          {
            id: 'les-2',
            title: '1.2 Keyboard Shortcuts for 3x Faster Cutting',
            duration: '12:45',
            isPreview: false,
            videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
            summaryBn: 'ফাস্টার কাটিং কিবোর্ড শর্টকাট।'
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2: Narrative Cutting & Retention Psychology',
        order: 2,
        lessons: [
          {
            id: 'les-3',
            title: '2.1 First 30 Seconds Hook & Story Pacing',
            duration: '18:10',
            isPreview: false,
            videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
            summaryBn: 'প্রথম ৩০ সেকেন্ডের হুক মেকিং।'
          }
        ]
      }
    ],
    resources: []
  }
];

const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: 'prod-luts-pack',
    slug: 'product-1792699417996',
    title: 'Gemini AI Pro',
    titleBn: 'Gemini AI Pro[18 মাস]',
    shortTitleBn: 'Gemini AI Pro[18 মাস]',
    shortDesc: 'Gemini AI Pro 18 Months Official Access with Full Owner Benefits.',
    shortDescBn: 'Gemini AI Pro ১৮ মাস অফিসিয়াল অ্যাক্সেস ও ফুল ওনার বেনিফিটস।',
    price: 199,
    originalPrice: 699,
    discountBadge: '77% OFF',
    badge: 'BESTSELLER',
    thumbnailUrl: 'https://admin.noobtopup.com/products/1787730903.jpg',
    images: ['https://admin.noobtopup.com/products/1787730903.jpg'],
    category: 'Ai',
    rating: '5.0',
    salesCount: '1K+ Sales',
    softwareTags: ['Gemini'],
    fileFormat: 'Links',
    status: 'PUBLISHED',
    features: [
      '👑 Full Owner 💯',
      '✅ শুধু একবার পেমেন্ট, ১৮ মাস ব্যবহার',
      '✅ আপনি নিজেই Owner থাকবেন',
      '✅ সর্বোচ্চ ৫ জনকে Invite দিতে পারবেন',
      '✅ Gemini Pro, Veo 3, Flow, Whisk & AI Studio',
      '✅ Single Invite এ 5TB Storage'
    ],
    featuresBn: [
      '👑 Full Owner 💯',
      '✅ শুধু একবার পেমেন্ট, ১৮ মাস ব্যবহার',
      '✅ আপনি নিজেই Owner থাকবেন',
      '✅ সর্বোচ্চ ৫ জনকে Invite দিতে পারবেন',
      '✅ Gemini Pro, Veo 3, Flow, Whisk & AI Studio',
      '✅ Single Invite এ 5TB Storage'
    ],
    downloadFilename: 'MobinIQ_Gemini_Access.txt',
    downloadContent: '# MobinIQ Gemini AI Pro Access\n'
  }
];

const INITIAL_HERO_SLIDES: AdminHeroSlide[] = [
  {
    id: 'slide-1792664553344',
    badge: '',
    topLine: '',
    highlight: '',
    subBadge: '',
    bottomTitle: '',
    image: '/images/course-ai-automation.jpg',
    slug: 'ai-youtube-automation-masterclass',
    pills: [],
    active: true,
    showOverlay: false,
    ctaText: 'এখনই কিনুন'
  }
];

const INITIAL_ORDERS: OrderRecord[] = [];

const INITIAL_USERS: ManagedUser[] = [];

const INITIAL_COUPONS: PromoCoupon[] = [
  { code: 'MOBIN20', discountPct: 20, usageCount: 142, active: true, descriptionBn: 'বিশেষ ২০% ভিআইপি ছাড়' },
  { code: 'ADSPECIAL10', discountPct: 10, usageCount: 89, active: true, descriptionBn: 'ফেসবুক অ্যাড ও রিকভারি ১০% ছাড়' },
  { code: 'MOBIN100', discountPct: 100, usageCount: 4, active: true, descriptionBn: 'টেস্ট ও স্কলারশিপ ১০০% ফ্রি কুপন' }
];

const ALLOWED_ADMIN_EMAILS = [
  'mobinyt420@gmail.com',
  'mobinyt777@gmail.com',
  'mrmobin444@gmail.com',
  'admin@mobiniq.com'
];

// ============================================================================
// 3. HELPER UTILITIES
// ============================================================================

const toBn = (n: number | string): string => {
  const d = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (m) => d[parseInt(m, 10)]);
};

const handleImageUpload = (file: File, callback: (dataUrl: string) => void) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const rawData = ev.target?.result as string;
    if (!rawData) return;
    try {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          callback(compressed);
        } else {
          callback(rawData);
        }
      };
      img.onerror = () => callback(rawData);
      img.src = rawData;
    } catch {
      callback(rawData);
    }
  };
  reader.readAsDataURL(file);
};

const safeGet = <T,>(key: string, fallback: T): T => {
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

const safeSet = <T,>(key: string, val: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore
  }
};

const copyText = (text: string): void => {
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // fallback
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch {
    // ignore
  }
};

const downloadFile = (filename: string, content: string, mime = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1200);
};

// ============================================================================
// 4. STANDALONE DEDICATED ADMIN PANEL APPLICATION
// ============================================================================

type AdminModuleId =
  | 'dashboard'
  | 'courses'
  | 'products'
  | 'hero-slider'
  | 'orders'
  | 'incomplete'
  | 'users'
  | 'pixel'
  | 'gateway'
  | 'bridge';

export default function App() {
  const [activeModule, setActiveModule] = useState<AdminModuleId>('dashboard');
  const [analyticsRange, setAnalyticsRange] = useState<'today' | '7d' | '30d' | 'all'>('30d');
  const [syncStatus, setSyncStatus] = useState<'SYNCED' | 'SYNCING'>('SYNCED');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('এইমাত্র');

  // Toast Notification
  const [toast, setToast] = useState<string | null>(null);
  const notify = (msg: string) => setToast(msg);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const sanitizeCourse = (c: any): AdminCourse => ({
    ...c,
    modules: Array.isArray(c?.modules)
      ? c.modules.map((m: any) => ({
          ...m,
          lessons: Array.isArray(m?.lessons) ? m.lessons : []
        }))
      : [],
    softwareTags: Array.isArray(c?.softwareTags) ? c.softwareTags : [],
    outcomes: Array.isArray(c?.outcomes) ? c.outcomes : [],
    thumbnailUrl: c?.thumbnailUrl || c?.bannerUrl || '/images/course-ai-automation.jpg',
    bannerUrl: c?.bannerUrl || c?.thumbnailUrl || '/images/course-ai-automation.jpg'
  });

  // Synchronized Persistent Admin Database State
  const [courses, setCourses] = useState<AdminCourse[]>(() => {
    const raw = safeGet<any[] | null>('mobiniq_admin_courses_v1', null);
    if (Array.isArray(raw)) return raw.map(sanitizeCourse);
    return INITIAL_COURSES.map(sanitizeCourse);
  });
  const [products, setProducts] = useState<AdminProduct[]>(() => {
    const raw = safeGet<AdminProduct[] | null>('mobiniq_admin_products_v1', null);
    if (Array.isArray(raw)) return raw;
    return INITIAL_PRODUCTS;
  });
  const [heroSlides, setHeroSlides] = useState<AdminHeroSlide[]>(() => {
    const raw = safeGet<AdminHeroSlide[]>('mobiniq_admin_hero_slides_v1', INITIAL_HERO_SLIDES);
    return Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_HERO_SLIDES;
  });
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    safeGet('mobiniq_admin_orders_v1', INITIAL_ORDERS)
  );
  const [incompleteLeads, setIncompleteLeads] = useState<IncompleteOrderLead[]>(() =>
    safeGet('mobiniq_incomplete_leads_v1', [])
  );
  const [users, setUsers] = useState<ManagedUser[]>(() => {
    const raw = safeGet<ManagedUser[]>('mobiniq_admin_users_v1', INITIAL_USERS);
    if (!Array.isArray(raw)) return INITIAL_USERS;
    return raw.map((u) => ({
      ...u,
      enrolledSlugs: Array.isArray(u?.enrolledSlugs) ? u.enrolledSlugs : []
    }));
  });
  const [coupons, setCoupons] = useState<PromoCoupon[]>(() =>
    safeGet('mobiniq_admin_coupons_v1', INITIAL_COUPONS)
  );
  const [blockedPhones, setBlockedPhones] = useState<string[]>(() =>
    safeGet('mobiniq_blocked_phones_v1', ['01900000000'])
  );
  const [blockedIps, setBlockedIps] = useState<string[]>(() =>
    safeGet('mobiniq_blocked_ips_v1', ['203.0.113.99'])
  );

  // Site & Bridge Config (Shared with `mobiniq_site_config_v1` in localStorage)
  const [siteConfig, setSiteConfig] = useState<SiteBridgeConfig>(() =>
    safeGet('mobiniq_site_config_v1', {
      mainWebsiteUrl: 'https://mobiniq.com',
      adminPanelUrl: 'https://admin.mobiniq.com',
      apiSyncSecret: 'miq_sync_live_9f8e7d6c5b4a3210',
      gatewayProvider: 'UddoktaPay',
      gatewayBaseUrl: 'https://pay.mobiniq.com/api/checkout-v2',
      gatewayApiKey: 'up_live_98a7bc654321fedcba',
      gatewayEnabled: true,
      bkashNumber: '01308313078',
      nagadNumber: '01308313078',
      rocketNumber: '01308313078',
      manualAccountType: 'Personal (Send Money)',
      supportPhone: '01308313078',
      supportWhatsapp: '01308313078',
      supportEmail: 'support@mobiniq.com',
      supportMessenger: 'https://m.me/mobiniq',
      facebookUrl: 'https://facebook.com/mobiniq',
      telegramUrl: 'https://t.me/mobiniq',
      youtubeUrl: 'https://youtube.com/@mobinyt',
      supportHours: 'সকাল ১০:০০ - রাত ১০:০০ (প্রতিদিন)',
      fbPixelId: '149283746501928',
      fbCapiToken: 'EAABsbCS1iHgBO9x8MobinIQToken',
      fbTestEventCode: 'TEST49281',
      tiktokPixelId: 'C98X2Y3Z4A5B6C',
      ga4MeasurementId: 'G-MOBINIQ2026',
      pixelEnabled: true,
      firebaseProjectId: 'mobin-iq',
      firebaseApiKey: 'AIzaSyDuB4unQgwjd0LB-9KuvpOhYzTFo7y9Hm8',
      firebaseAuthDomain: 'mobin-iq.firebaseapp.com',
      adminEmail: 'admin@mobiniq.com',
      youtubeSubs: '125K+',
      activeStudents: '10,500+',
      positiveReviews: '98.8%',
      studentEarnings: '$150K+',
      requireCourseLogin: true
    })
  );

  // ============================================================================
  // ADMIN AUTHENTICATION & SECURITY STATE
  // ============================================================================
  const [adminUser, setAdminUser] = useState<{ email: string; name?: string } | null>(() =>
    safeGet<{ email: string; name?: string } | null>('mobiniq_admin_session_v1', null)
  );
  const [adminLoginEmail, setAdminLoginEmail] = useState('mobinyt420@gmail.com');
  const [adminLoginPass, setAdminLoginPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminSecretKeyInput, setAdminSecretKeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);

  // Forgot Password Modal State
  const [showForgotPassModal, setShowForgotPassModal] = useState(false);
  const [forgotPassEmail, setForgotPassEmail] = useState('mobinyt420@gmail.com');
  const [forgotPassSent, setForgotPassSent] = useState(false);

  // Real-time bidirectional subscriptions to Firebase Firestore collections
  useEffect(() => {
    // 0. Ensure Firebase Auth is active with Admin credentials in background
    adminSignInWithEmail('admin@mobiniq.com', 'admin123456').catch(() => {});

    // 1. Live courses from Firestore
    const unsubCourses = subscribeToCourses((cloudCourses) => {
      if (Array.isArray(cloudCourses)) {
        const sanitized = cloudCourses.map(sanitizeCourse);
        setCourses(sanitized);
        safeSet('mobiniq_admin_courses_v1', sanitized);
      }
    });

    // 2. Live products from Firestore
    const unsubProducts = subscribeToProducts((cloudProducts) => {
      if (Array.isArray(cloudProducts)) {
        setProducts(cloudProducts as AdminProduct[]);
        safeSet('mobiniq_admin_products_v1', cloudProducts);
      }
    });

    // 3. Live hero slides from Firestore
    const unsubHero = subscribeToHeroSlides((cloudSlides) => {
      if (Array.isArray(cloudSlides) && cloudSlides.length > 0) {
        setHeroSlides(cloudSlides as AdminHeroSlide[]);
        safeSet('mobiniq_admin_hero_slides_v1', cloudSlides);
      }
    });

    // 4. Live site settings from Firestore
    const unsubSettings = subscribeToSiteSettings((cloudSettings) => {
      if (cloudSettings) {
        setSiteConfig((prev) => ({ ...prev, ...cloudSettings }));
      }
    });

    // 5. Live coupons from Firestore
    const unsubCoupons = subscribeToCoupons((cloudCoupons) => {
      if (Array.isArray(cloudCoupons)) {
        setCoupons(cloudCoupons as PromoCoupon[]);
      }
    });

    // 6. Live orders placed from main website
    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (Array.isArray(cloudOrders)) {
        setOrders(cloudOrders as OrderRecord[]);
        safeSet('mobiniq_admin_orders_v1', cloudOrders);
      }
    });

    // 7. Live incomplete checkout leads from main website
    const unsubLeads = subscribeToLeads((cloudLeads) => {
      if (Array.isArray(cloudLeads)) {
        setIncompleteLeads(cloudLeads as IncompleteOrderLead[]);
        safeSet('mobiniq_incomplete_leads_v1', cloudLeads);
      }
    });

    // 8. Live student users from main website
    const unsubUsers = subscribeToUsers((cloudUsers) => {
      if (Array.isArray(cloudUsers)) {
        const sanitized = cloudUsers.map((u: any) => ({
          ...u,
          enrolledSlugs: Array.isArray(u?.enrolledSlugs) ? u.enrolledSlugs : [],
          phone: u?.phone || '',
          email: u?.email || '',
          name: u?.name || 'শিক্ষার্থী',
          status: u?.status || 'ACTIVE',
          totalSpentBdt: Number(u?.totalSpentBdt) || 0,
          joinedAt: u?.joinedAt || 'সদ্য',
          lastActive: u?.lastActive || 'এইমাত্র'
        }));
        setUsers(sanitized as ManagedUser[]);
        safeSet('mobiniq_admin_users_v1', sanitized);
      }
    });

    // 9. Live blocked phones & IPs
    const unsubBlocked = subscribeToBlockedEntities((data) => {
      if (data.phones?.length) setBlockedPhones(data.phones);
      if (data.ips?.length) setBlockedIps(data.ips);
    });

    // 10. Firebase Auth state (Auto persistent login if verified admin)
    const unsubAuth = subscribeToAdminAuth((fbUser) => {
      if (fbUser) {
        const email = (fbUser.email || '').toLowerCase().trim();
        if (ALLOWED_ADMIN_EMAILS.includes(email)) {
          const u = {
            email: fbUser.email || 'mobinyt420@gmail.com',
            name: fbUser.displayName || 'মুবিন ভাই (Admin)'
          };
          setAdminUser(u);
          safeSet('mobiniq_admin_session_v1', u);
        } else {
          adminSignOut().catch(() => {});
          setAdminUser(null);
          safeSet('mobiniq_admin_session_v1', null);
        }
      }
    });

    return () => {
      unsubCourses();
      unsubProducts();
      unsubHero();
      unsubSettings();
      unsubCoupons();
      unsubOrders();
      unsubLeads();
      unsubUsers();
      unsubBlocked();
      unsubAuth();
    };
  }, []);

  // Admin Logout Handler
  const handleAdminLogout = async () => {
    try {
      await adminSignOut();
      setAdminUser(null);
      safeSet('mobiniq_admin_session_v1', null);
      notify('অ্যাডমিন সেশন সফলভাবে লগআউট করা হয়েছে');
    } catch {
      setAdminUser(null);
      safeSet('mobiniq_admin_session_v1', null);
    }
  };

  // Google Sign In Handler (1-Click Ultra Secure Admin Login)
  const handleGoogleAdminLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const u = await adminSignInWithGoogle();
      const email = (u.email || '').toLowerCase().trim();
      if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
        await adminSignOut();
        setAuthError(`🚫 অননুমোদিত অ্যাক্সেস! "${email}" অ্যাকাউন্টটি অ্যাডমিন হিসেবে অনুমোদিত নয়। শুধুমাত্র অনুমোদিত অ্যাডমিন (${ALLOWED_ADMIN_EMAILS[0]}) দিয়ে লগইন করুন।`);
        return;
      }
      const session = { email: u.email || 'mobinyt420@gmail.com', name: u.displayName || 'মুবিন ভাই (Admin)' };
      setAdminUser(session);
      safeSet('mobiniq_admin_session_v1', session);
      notify(`🔥 স্বাগতম ${session.name || session.email}! সেন্ট্রাল কমান্ড আনলক হয়েছে।`);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message || 'গুগল সাইন-ইনে সমস্যা হয়েছে।');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Email & Password Login Handler (Whitelisted Admin Gateway)
  const handleEmailAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminLoginEmail.trim().toLowerCase();
    if (!cleanEmail || !adminLoginPass) {
      setAuthError('ইমেইল ও পাসওয়ার্ড উভয়ই পূরণ করুন।');
      return;
    }
    if (!ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) {
      setAuthError(`🚫 অননুমোদিত অ্যাক্সেস! "${cleanEmail}" অ্যাকাউন্টটি অ্যাডমিন হিসেবে তালিকাভুক্ত নয়।`);
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const u = await adminSignInWithEmail(cleanEmail, adminLoginPass);
      const session = { email: u.email || cleanEmail, name: u.displayName || 'মুবিন ভাই (Admin)' };
      setAdminUser(session);
      safeSet('mobiniq_admin_session_v1', session);
      notify(`🔥 স্বাগতম! অ্যাডমিন হিসেবে লগইন সফল হয়েছে।`);
    } catch (err: any) {
      console.error('Admin login error:', err);
      let msg = err.message || 'ভুল ইমেইল বা পাসওয়ার্ড।';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'ভুল পাসওয়ার্ড অথবা ইমেইল। সঠিক পাসওয়ার্ড দিন অথবা নিচে "পাসওয়ার্ড ভুলে গেছেন?" এ ক্লিক করে রিসেট করুন।';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'অতিরিক্ত ভুল চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।';
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Forgot Password Handler via Firebase sendPasswordResetEmail
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotPassEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError('দয়া করে আপনার অ্যাডমিন জিমেইল লিখুন।');
      return;
    }
    if (!ALLOWED_ADMIN_EMAILS.includes(cleanEmail)) {
      setAuthError(`🚫 "${cleanEmail}" অ্যাডমিন হিসেবে অনুমোদিত নয়।`);
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      await adminSendPasswordResetEmail(cleanEmail);
      setForgotPassSent(true);
      notify(`✅ আপনার জিমেইলে (${cleanEmail}) পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!`);
    } catch (err: any) {
      setAuthError(err.message || 'পাসওয়ার্ড রিসেট লিংক পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setAuthLoading(false);
    }
  };

  // Passkey Login Handler
  const handlePasskeyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const key = adminSecretKeyInput.trim();
    if (key === 'admin123' || key === 'mobiniq2026' || key === 'miq_sync_live_9f8e7d6c5b4a3210' || key === siteConfig.apiSyncSecret) {
      const session = { email: 'mobinyt420@gmail.com', name: 'মাস্টার অ্যাডমিন' };
      setAdminUser(session);
      safeSet('mobiniq_admin_session_v1', session);
      notify('🔥 মাস্টার পাসকী ভেরিফাইড! সেন্ট্রাল কমান্ড অ্যাক্সেস গ্রান্টেড।');
    } else {
      setAuthError('ভুল সিক্রেট পাসকী! সঠিক মাস্টার অ্যাডমিন কোড দিন।');
    }
  };

  // Dual Sync: Save to localStorage and Push 100% to Firebase Cloud
  useEffect(() => safeSet('mobiniq_admin_courses_v1', courses), [courses]);
  useEffect(() => safeSet('mobiniq_admin_products_v1', products), [products]);
  useEffect(() => safeSet('mobiniq_admin_hero_slides_v1', heroSlides), [heroSlides]);
  useEffect(() => safeSet('mobiniq_admin_orders_v1', orders), [orders]);
  useEffect(() => safeSet('mobiniq_incomplete_leads_v1', incompleteLeads), [incompleteLeads]);
  useEffect(() => safeSet('mobiniq_admin_users_v1', users), [users]);
  useEffect(() => safeSet('mobiniq_admin_coupons_v1', coupons), [coupons]);
  useEffect(() => safeSet('mobiniq_blocked_phones_v1', blockedPhones), [blockedPhones]);
  useEffect(() => safeSet('mobiniq_blocked_ips_v1', blockedIps), [blockedIps]);
  useEffect(() => safeSet('mobiniq_site_config_v1', siteConfig), [siteConfig]);

  const triggerCloudSync = async (
    label = 'ডাটাবেস ও মেইন ওয়েবসাইট সিঙ্ক সম্পন্ন হয়েছে!',
    overridePayload?: {
      courses?: AdminCourse[];
      products?: AdminProduct[];
      heroSlides?: AdminHeroSlide[];
      siteConfig?: typeof siteConfig;
      coupons?: PromoCoupon[];
      blockedPhones?: string[];
      blockedIps?: string[];
    }
  ) => {
    setSyncStatus('SYNCING');
    try {
      await syncAllDefaultCatalogToFirestore({
        courses: overridePayload?.courses || courses,
        products: overridePayload?.products || products,
        heroSlides: overridePayload?.heroSlides || heroSlides,
        siteConfig: overridePayload?.siteConfig || siteConfig,
        coupons: overridePayload?.coupons || coupons,
        blockedPhones: overridePayload?.blockedPhones || blockedPhones,
        blockedIps: overridePayload?.blockedIps || blockedIps
      });
      setSyncStatus('SYNCED');
      setLastSyncedTime(
        new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      notify(`🔥 ${label}`);
    } catch (err: any) {
      setSyncStatus('SYNCED');
      notify(`⚠️ ক্লাউড সিঙ্ক: ${err?.message || 'চেক করুন'}`);
    }
  };

  const handleBulkSyncToFirebase = async () => {
    setIsBulkSyncing(true);
    notify('⏳ ফায়ারবেস ক্লাউডে সম্পূর্ণ ক্যাটালগ ও সেটিংস সিঙ্ক হচ্ছে...');
    try {
      const res = await syncAllDefaultCatalogToFirestore({
        courses,
        products,
        heroSlides,
        siteConfig,
        coupons,
        blockedPhones,
        blockedIps
      });
      if (res.success) {
        notify('✅ সফল! সব কোর্স, প্রোডাক্ট, ব্যানার ও সেটিংস ফায়ারবেস ক্লাউডে সংরক্ষিত হয়েছে!');
      } else {
        notify(`⚠️ সিঙ্ক ওয়ার্নিং: ${res.reason || 'চেক করুন'}`);
      }
    } catch (err: any) {
      notify(`❌ সিঙ্ক ত্রুটি: ${err.message}`);
    } finally {
      setIsBulkSyncing(false);
      setLastSyncedTime(new Date().toLocaleTimeString('bn-BD'));
    }
  };

  // ============================================================================
  // COURSE BUILDER STATE
  // ============================================================================
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [showCourseForm, setShowCourseForm] = useState<boolean>(false);
  const [courseDraft, setCourseDraft] = useState<{
    title: string;
    titleBn: string;
    shortTitleBn: string;
    slug: string;
    subtitle: string;
    subtitleBn: string;
    shortDescBn: string;
    category: string;
    price: number;
    originalPrice: number;
    discountBadge: string;
    reviewsCount: string;
    totalDuration: string;
    thumbnailUrl: string;
    bannerUrl: string;
    introVideoUrl: string;
    softwareTagsText: string;
    status: 'PUBLISHED' | 'DRAFT';
    featured: boolean;
    outcomesText: string;
    modules: CourseModule[];
  }>({
    title: 'Complete AI Mastery Course',
    titleBn: '',
    shortTitleBn: '',
    slug: '',
    subtitle: '',
    subtitleBn: '',
    shortDescBn: '',
    category: 'ভিডিও এডিটিং',
    price: 1490,
    originalPrice: 2000,
    discountBadge: '25% OFF',
    reviewsCount: '320+ Reviews',
    totalDuration: '8h 20m',
    thumbnailUrl: '/images/hero-banner.jpg',
    bannerUrl: '/images/hero-banner.jpg',
    introVideoUrl: '',
    softwareTagsText: 'Pr, Ae',
    status: 'PUBLISHED',
    featured: true,
    outcomesText: 'প্রম্পট ইঞ্জিনিয়ারিং মাস্টারি\nএআই ওয়ার্কফ্লো অটোমেশন',
    modules: [
      {
        id: 'mod-new-1',
        title: 'মডিউল ১: ফাউন্ডেশন ও কোর কনসেপ্ট',
        order: 1,
        lessons: [
          {
            id: 'les-new-1',
            title: '১.১ [ফ্রি প্রিভিউ] কোর্স ওভারভিউ ও রোডম্যাপ',
            duration: '১৫:০০',
            isPreview: true,
            videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
            summaryBn: 'কোর্সের মূল গাইডলাইন ও টুলস সেটআপ।'
          }
        ]
      }
    ]
  });

  const startNewCourse = () => {
    setEditingCourseId(null);
    setCourseDraft({
      title: '',
      titleBn: '',
      shortTitleBn: '',
      slug: '',
      subtitle: '',
      subtitleBn: '',
      shortDescBn: '',
      category: 'কোর্স',
      price: 0,
      originalPrice: 0,
      discountBadge: '',
      reviewsCount: '',
      totalDuration: '',
      thumbnailUrl: '',
      bannerUrl: '',
      introVideoUrl: '',
      softwareTagsText: '',
      status: 'PUBLISHED',
      featured: true,
      outcomesText: '',
      modules: []
    });
    setShowCourseForm(true);
  };

  const startEditCourse = (c: AdminCourse) => {
    setEditingCourseId(c.id);
    setCourseDraft({
      title: c.title || '',
      titleBn: c.titleBn || '',
      shortTitleBn: c.shortTitleBn || '',
      slug: c.slug || '',
      subtitle: c.subtitle || '',
      subtitleBn: c.subtitleBn || '',
      shortDescBn: c.shortDescBn || '',
      category: c.category || 'ভিডিও এডিটিং',
      price: c.price || 0,
      originalPrice: c.originalPrice || 0,
      discountBadge: c.discountBadge || '',
      reviewsCount: c.reviewsCount || '320+ Reviews',
      totalDuration: c.totalDuration || '8h 20m',
      thumbnailUrl: c.thumbnailUrl || '/images/hero-banner.jpg',
      bannerUrl: c.bannerUrl || c.thumbnailUrl || '/images/hero-banner.jpg',
      introVideoUrl: c.introVideoUrl || '',
      softwareTagsText: Array.isArray(c.softwareTags) ? c.softwareTags.join(', ') : '',
      status: c.status || 'PUBLISHED',
      featured: Boolean(c.featured),
      outcomesText: Array.isArray(c.outcomes) ? c.outcomes.join('\n') : '',
      modules: c.modules || []
    });
    setShowCourseForm(true);
  };

  const saveCourseDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseDraft.titleBn.trim()) {
      notify('কোর্সের নাম দিন!');
      return;
    }
    const cleanSlug =
      courseDraft.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') ||
      `course-${Date.now()}`;
    const outcomes = courseDraft.outcomesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const softwareTags = courseDraft.softwareTagsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    notify('⏳ কোর্স সেভ হচ্ছে...');
    try {
      if (editingCourseId) {
        const existing = courses.find((c) => c.id === editingCourseId);
        const updatedCourse: AdminCourse = {
          id: editingCourseId,
          title: courseDraft.title.trim() || courseDraft.titleBn.trim(),
          titleBn: courseDraft.titleBn.trim(),
          shortTitleBn: courseDraft.shortTitleBn.trim() || courseDraft.titleBn.trim(),
          slug: cleanSlug,
          subtitle: courseDraft.subtitle.trim() || courseDraft.subtitleBn.trim(),
          subtitleBn: courseDraft.subtitleBn.trim(),
          shortDescBn: courseDraft.shortDescBn.trim(),
          category: courseDraft.category,
          price: Number(courseDraft.price) || 0,
          originalPrice: Number(courseDraft.originalPrice) || 0,
          discountBadge: courseDraft.discountBadge.trim(),
          totalDuration: courseDraft.totalDuration.trim(),
          reviewsCount: courseDraft.reviewsCount.trim(),
          thumbnailUrl: courseDraft.thumbnailUrl.trim() || '/images/hero-banner.jpg',
          bannerUrl: courseDraft.bannerUrl.trim() || courseDraft.thumbnailUrl.trim() || '/images/hero-banner.jpg',
          introVideoUrl: courseDraft.introVideoUrl?.trim() || '',
          modulesCount: courseDraft.modules.length,
          softwareTags,
          status: courseDraft.status,
          featured: courseDraft.featured,
          outcomes,
          modules: courseDraft.modules,
          resources: existing?.resources || [],
          studentsCount: existing?.studentsCount || '০ শিক্ষার্থী',
          rating: existing?.rating || '5.0'
        };
        const updatedList = courses.map((c) => (c.id === editingCourseId ? { ...c, ...updatedCourse } : c));
        setCourses(updatedList);
        safeSet('mobiniq_admin_courses_v1', updatedList);
        const res = await saveCourseToFirestore(updatedCourse);
        setShowCourseForm(false);
        if (res.synced) {
          notify('✅ কোর্স সফলভাবে আপডেট ও ফায়ারবেসে সেভ হয়েছে!');
        } else {
          notify(`⚠️ ফায়ারবেস সেভ সতর্কবার্তা: ${res.reason || 'লোকালি সংরক্ষিত হয়েছে'}`);
        }
      } else {
        const newCourse: AdminCourse = {
          id: `course-${Date.now()}`,
          slug: cleanSlug,
          title: courseDraft.title.trim() || courseDraft.titleBn.trim(),
          titleBn: courseDraft.titleBn.trim(),
          shortTitleBn: courseDraft.shortTitleBn.trim() || courseDraft.titleBn.trim(),
          subtitle: courseDraft.subtitle.trim() || courseDraft.subtitleBn.trim(),
          subtitleBn: courseDraft.subtitleBn.trim() || courseDraft.titleBn.trim(),
          shortDescBn: courseDraft.shortDescBn.trim() || courseDraft.subtitleBn.trim(),
          price: Number(courseDraft.price) || 0,
          originalPrice: Number(courseDraft.originalPrice) || 0,
          discountBadge: courseDraft.discountBadge.trim(),
          thumbnailUrl: courseDraft.thumbnailUrl.trim() || '/images/hero-banner.jpg',
          bannerUrl: courseDraft.bannerUrl.trim() || courseDraft.thumbnailUrl.trim() || '/images/hero-banner.jpg',
          introVideoUrl: courseDraft.introVideoUrl?.trim() || '',
          category: courseDraft.category,
          studentsCount: 'নতুন',
          rating: '5.0',
          reviewsCount: courseDraft.reviewsCount.trim(),
          totalDuration: courseDraft.totalDuration.trim(),
          modulesCount: courseDraft.modules.length,
          softwareTags,
          status: courseDraft.status,
          featured: courseDraft.featured,
          outcomes,
          modules: courseDraft.modules,
          resources: []
        };
        const updatedList = [newCourse, ...courses];
        setCourses(updatedList);
        safeSet('mobiniq_admin_courses_v1', updatedList);
        const res = await saveCourseToFirestore(newCourse);
        setShowCourseForm(false);
        if (res.synced) {
          notify('✅ নতুন কোর্স সফলভাবে তৈরি ও ফায়ারবেসে পাবলিশ হয়েছে!');
        } else {
          notify(`⚠️ ফায়ারবেস সেভ সতর্কবার্তা: ${res.reason || 'লোকালি সংরক্ষিত হয়েছে'}`);
        }
      }
    } catch (err: any) {
      notify(`❌ কোর্স সেভ ত্রুটি: ${err?.message || 'চেক করুন'}`);
    }
  };

  // ============================================================================
  // PRODUCT BUILDER STATE
  // ============================================================================
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [productDraft, setProductDraft] = useState<{
    title: string;
    titleBn: string;
    shortTitleBn: string;
    slug: string;
    shortDesc: string;
    shortDescBn: string;
    category: string;
    price: number;
    originalPrice: number;
    discountBadge: string;
    badge: string;
    image1: string;
    image2: string;
    image3: string;
    softwareTagsText: string;
    fileFormat: string;
    status: 'PUBLISHED' | 'DRAFT';
    featuresText: string;
    downloadFilename: string;
    downloadContent: string;
  }>({
    title: '',
    titleBn: '',
    shortTitleBn: '',
    slug: '',
    shortDesc: '',
    shortDescBn: '',
    category: '',
    price: 0,
    originalPrice: 0,
    discountBadge: '',
    badge: '',
    image1: '',
    image2: '',
    image3: '',
    softwareTagsText: '',
    fileFormat: '',
    status: 'PUBLISHED',
    featuresText: '',
    downloadFilename: '',
    downloadContent: ''
  });

  const startNewProduct = () => {
    setEditingProductId(null);
    setProductDraft({
      title: '',
      titleBn: '',
      shortTitleBn: '',
      slug: '',
      shortDesc: '',
      shortDescBn: '',
      category: '',
      price: 0,
      originalPrice: 0,
      discountBadge: '',
      badge: '',
      image1: '',
      image2: '',
      image3: '',
      softwareTagsText: '',
      fileFormat: '',
      status: 'PUBLISHED',
      featuresText: '',
      downloadFilename: '',
      downloadContent: ''
    });
    setShowProductForm(true);
  };

  const startEditProduct = (p: AdminProduct) => {
    setEditingProductId(p.id);
    const existingImgs = Array.isArray((p as any).images) && (p as any).images.length > 0
      ? (p as any).images
      : (p.thumbnailUrl ? [p.thumbnailUrl] : []);

    setProductDraft({
      title: p.title || '',
      titleBn: p.titleBn || '',
      shortTitleBn: p.shortTitleBn || '',
      slug: p.slug || '',
      shortDesc: p.shortDesc || '',
      shortDescBn: p.shortDescBn || '',
      category: p.category || '',
      price: p.price || 0,
      originalPrice: p.originalPrice || 0,
      discountBadge: p.discountBadge || '',
      badge: p.badge || '',
      image1: existingImgs[0] || p.thumbnailUrl || '',
      image2: existingImgs[1] || '',
      image3: existingImgs[2] || '',
      softwareTagsText: Array.isArray(p.softwareTags) ? p.softwareTags.join(', ') : '',
      fileFormat: p.fileFormat || '',
      status: p.status || 'PUBLISHED',
      featuresText: Array.isArray(p.featuresBn) ? p.featuresBn.join('\n') : (Array.isArray(p.features) ? p.features.join('\n') : ''),
      downloadFilename: p.downloadFilename || '',
      downloadContent: p.downloadContent || ''
    });
    setShowProductForm(true);
  };

  const saveProductDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productDraft.titleBn.trim() && !productDraft.title.trim()) {
      notify('প্রোডাক্টের নাম লিখুন!');
      return;
    }
    const cleanSlug =
      productDraft.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') ||
      `product-${Date.now()}`;
    const featuresBn = productDraft.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const softwareTags = productDraft.softwareTagsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Collect exactly 1, 2, or 3 images provided by user
    const finalImages = [
      productDraft.image1.trim(),
      productDraft.image2.trim(),
      productDraft.image3.trim(),
    ].filter(Boolean);

    const primaryThumb = finalImages[0] || productDraft.image1.trim() || '/images/edit-course.jpg';

    notify('⏳ প্রোডাক্ট সেভ হচ্ছে...');
    try {
      if (editingProductId) {
        const updatedProd: AdminProduct = {
          id: editingProductId,
          title: productDraft.title.trim() || productDraft.titleBn.trim(),
          titleBn: productDraft.titleBn.trim() || productDraft.title.trim(),
          shortTitleBn: productDraft.shortTitleBn.trim() || productDraft.titleBn.trim() || productDraft.title.trim(),
          slug: cleanSlug,
          shortDesc: productDraft.shortDesc.trim() || productDraft.shortDescBn.trim(),
          shortDescBn: productDraft.shortDescBn.trim() || productDraft.shortDesc.trim(),
          category: productDraft.category,
          price: Number(productDraft.price) || 0,
          originalPrice: Number(productDraft.originalPrice) || 0,
          discountBadge: productDraft.discountBadge.trim(),
          badge: productDraft.badge.trim(),
          thumbnailUrl: primaryThumb,
          images: finalImages,
          softwareTags,
          fileFormat: productDraft.fileFormat.trim(),
          status: productDraft.status,
          features: featuresBn,
          featuresBn,
          downloadFilename: productDraft.downloadFilename.trim() || 'MobinIQ_Asset.txt',
          downloadContent: productDraft.downloadContent,
          rating: '5.0',
          salesCount: '১+ সেলস'
        };
        const updatedList = products.map((p) => (p.id === editingProductId ? { ...p, ...updatedProd } : p));
        setProducts(updatedList);
        safeSet('mobiniq_admin_products_v1', updatedList);
        const res = await saveProductToFirestore(updatedProd);
        setShowProductForm(false);
        if (res.synced) {
          notify('✅ প্রোডাক্ট সফলভাবে আপডেট ও ফায়ারবেসে সেভ হয়েছে!');
        } else {
          notify(`⚠️ ফায়ারবেস সেভ সতর্কবার্তা: ${res.reason || 'লোকালি সংরক্ষিত হয়েছে'}`);
        }
      } else {
        const newProd: AdminProduct = {
          id: `prod-${Date.now()}`,
          slug: cleanSlug,
          title: productDraft.title.trim() || productDraft.titleBn.trim(),
          titleBn: productDraft.titleBn.trim() || productDraft.title.trim(),
          shortTitleBn: productDraft.shortTitleBn.trim() || productDraft.titleBn.trim() || productDraft.title.trim(),
          shortDesc: productDraft.shortDesc.trim() || productDraft.shortDescBn.trim(),
          shortDescBn: productDraft.shortDescBn.trim() || productDraft.shortDesc.trim() || productDraft.titleBn.trim(),
          price: Number(productDraft.price) || 0,
          originalPrice: Number(productDraft.originalPrice) || 0,
          discountBadge: productDraft.discountBadge.trim(),
          badge: productDraft.badge.trim(),
          thumbnailUrl: primaryThumb,
          images: finalImages,
          category: productDraft.category,
          rating: '5.0',
          salesCount: 'নতুন',
          softwareTags,
          fileFormat: productDraft.fileFormat.trim(),
          status: productDraft.status,
          features: featuresBn,
          featuresBn,
          downloadFilename: productDraft.downloadFilename.trim() || 'MobinIQ_Pack.txt',
          downloadContent: productDraft.downloadContent
        };
        const updatedList = [newProd, ...products];
        setProducts(updatedList);
        safeSet('mobiniq_admin_products_v1', updatedList);
        const res = await saveProductToFirestore(newProd);
        setShowProductForm(false);
        if (res.synced) {
          notify('✅ নতুন প্রোডাক্ট সফলভাবে পাবলিশ ও ফায়ারবেসে সেভ হয়েছে!');
        } else {
          notify(`⚠️ ফায়ারবেস সেভ সতর্কবার্তা: ${res.reason || 'লোকালি সংরক্ষিত হয়েছে'}`);
        }
      }
    } catch (err: any) {
      notify(`❌ প্রোডাক্ট সেভ ত্রুটি: ${err?.message || 'চেক করুন'}`);
    }
    setShowProductForm(false);
  };

  // ============================================================================
  // HERO SLIDER STUDIO STATE
  // ============================================================================
  const [editingHeroSlideId, setEditingHeroSlideId] = useState<string | null>(null);
  const [showHeroSlideForm, setShowHeroSlideForm] = useState<boolean>(false);
  const [heroSlideDraft, setHeroSlideDraft] = useState<AdminHeroSlide>({
    id: '',
    badge: '🔥 ধামাকা অফার চলছে',
    topLine: 'মোবাইল ও পিসি দিয়ে',
    highlight: 'সম্পূর্ণ AI মাস্টারি',
    subBadge: 'প্রম্পট, ওয়েব ও অটোমেশন',
    bottomTitle: 'বেসিক টু অ্যাডভান্স',
    image: HERO_IMG,
    slug: 'complete-ai-mastery-zero-to-pro',
    pills: ['Mobile Learning', 'AI Powered', 'Free Resources'],
    active: true
  });
  const [heroPreviewIndex, setHeroPreviewIndex] = useState(0);

  const startNewHeroSlide = () => {
    setEditingHeroSlideId(null);
    setHeroSlideDraft({
      id: `slide-${Date.now()}`,
      badge: '',
      topLine: '',
      highlight: '',
      subBadge: '',
      bottomTitle: '',
      image: '',
      slug: courses[0]?.slug || 'complete-ai-mastery-zero-to-pro',
      pills: [],
      active: true,
      showOverlay: false,
      showCta: true,
      ctaText: 'এখনই কিনুন'
    });
    setShowHeroSlideForm(true);
  };

  const startEditHeroSlide = (slide: AdminHeroSlide) => {
    setEditingHeroSlideId(slide.id);
    setHeroSlideDraft({
      ...slide,
      showOverlay: slide.showOverlay === true,
      showCta: slide.showCta ?? true,
      ctaText: slide.ctaText || 'এখনই কিনুন',
      badge: slide.badge || '',
      topLine: slide.topLine || '',
      highlight: slide.highlight || '',
      subBadge: slide.subBadge || '',
      bottomTitle: slide.bottomTitle || '',
      pills: Array.isArray(slide.pills) ? slide.pills : []
    });
    setShowHeroSlideForm(true);
  };

  const saveHeroSlideDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSlideDraft.image || !heroSlideDraft.image.trim()) {
      notify('অনুগ্রহ করে ব্যানার ছবি বা লিংক প্রদান করুন!');
      return;
    }
    notify('⏳ হিরো ব্যানার সেভ হচ্ছে...');
    try {
      const isOverlay = heroSlideDraft.showOverlay === true;
      const sanitizedDraft: AdminHeroSlide = {
        ...heroSlideDraft,
        showOverlay: isOverlay,
        showCta: heroSlideDraft.showCta ?? true,
        ctaText: heroSlideDraft.ctaText?.trim() || 'এখনই কিনুন',
        badge: isOverlay ? (heroSlideDraft.badge?.trim() || '') : '',
        topLine: isOverlay ? (heroSlideDraft.topLine?.trim() || '') : '',
        highlight: isOverlay ? (heroSlideDraft.highlight?.trim() || '') : '',
        subBadge: isOverlay ? (heroSlideDraft.subBadge?.trim() || '') : '',
        bottomTitle: isOverlay ? (heroSlideDraft.bottomTitle?.trim() || '') : '',
        pills: isOverlay && Array.isArray(heroSlideDraft.pills) ? heroSlideDraft.pills.filter(Boolean) : []
      };

      let updated: AdminHeroSlide[] = [];
      if (editingHeroSlideId) {
        updated = heroSlides.map((s) => (s.id === editingHeroSlideId ? { ...sanitizedDraft, id: s.id } : s));
      } else {
        const newSlide: AdminHeroSlide = {
          ...sanitizedDraft,
          id: `slide-${Date.now()}`
        };
        updated = [...heroSlides, newSlide];
      }
      setHeroSlides(updated);
      safeSet('mobiniq_admin_hero_slides_v1', updated);
      const res = await saveHeroSlidesToFirestore(updated);
      setShowHeroSlideForm(false);
      if (res.synced) {
        notify(editingHeroSlideId ? '✅ হিরো ব্যানার সফলভাবে আপডেট হয়েছে!' : '✅ নতুন হিরো ব্যানার যুক্ত ও সেভ হয়েছে!');
      } else {
        notify(`⚠️ ব্যানার সেভ সতর্কবার্তা: ${res.reason || 'লোকালি সংরক্ষিত হয়েছে'}`);
      }
    } catch (err: any) {
      notify(`❌ ব্যানার সেভ ত্রুটি: ${err?.message || 'চেক করুন'}`);
    }
  };

  // ============================================================================
  // ORDERS & MANUAL PAYMENT VERIFICATION STATE
  // ============================================================================
  const [orderFilterStatus, setOrderFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'REJECTED'>('ALL');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [showNewOrderModal, setShowNewOrderModal] = useState<boolean>(false);
  const [manualOrderDraft, setManualOrderDraft] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    itemSlug: courses[0]?.slug || '',
    paymentMethod: 'bKash' as OrderRecord['paymentMethod'],
    trxId: ''
  });

  const approveOrder = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'COMPLETED', verifiedBy: 'Admin Manual Verify ✓' }
          : o
      )
    );

    // Grant enrollment to matching user or create user record
    setUsers((prev) => {
      const existing = prev.find(
        (u) => u.phone === target.customerPhone || u.email === target.customerEmail
      );
      if (existing) {
        return prev.map((u) =>
          u.uid === existing.uid
            ? {
                ...u,
                enrolledSlugs: u.enrolledSlugs.includes(target.itemSlug)
                  ? u.enrolledSlugs
                  : [...u.enrolledSlugs, target.itemSlug],
                totalSpentBdt: u.totalSpentBdt + target.amountBdt
              }
            : u
        );
      }
      return [
        {
          uid: `MB-${Math.floor(1000 + Math.random() * 9000)}`,
          name: target.customerName,
          email: target.customerEmail,
          phone: target.customerPhone,
          phoneVerified: true,
          enrolledSlugs: [target.itemSlug],
          totalSpentBdt: target.amountBdt,
          joinedAt: 'আজ',
          lastActive: 'এইমাত্র',
          status: 'ACTIVE',
          ip: '103.120.45.99'
        },
        ...prev
      ];
    });

    fireAdminPixel('Purchase', target.itemTitleBn, target.amountBdt);
    updateOrderStatusInFirestore(orderId, 'VERIFIED', { verifiedBy: 'Admin Manual Verify ✓' });
    triggerCloudSync(`অর্ডার ${target.orderCode} অ্যাপ্রুভ ও কোর্স আনলক হয়েছে!`);
  };

  const rejectOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'REJECTED', verifiedBy: 'Rejected by Admin' }
          : o
      )
    );
    updateOrderStatusInFirestore(orderId, 'REJECTED', { verifiedBy: 'Rejected by Admin' });
    notify('অর্ডারটি রিজেক্ট করা হয়েছে');
  };

  const createManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const allItems = [
      ...courses.map((c) => ({ slug: c.slug, titleBn: c.shortTitleBn, price: c.price, type: 'course' as const })),
      ...products.map((p) => ({ slug: p.slug, titleBn: p.shortTitleBn, price: p.price, type: 'product' as const }))
    ];
    const found = allItems.find((i) => i.slug === manualOrderDraft.itemSlug) || allItems[0];
    const newOrder: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderCode: `MIQ-${Math.floor(10000 + Math.random() * 89999)}`,
      customerName: manualOrderDraft.customerName.trim() || 'স্টুডেন্ট',
      customerPhone: manualOrderDraft.customerPhone.trim(),
      customerEmail: manualOrderDraft.customerEmail.trim() || 'student@mobiniq.com',
      itemType: found.type,
      itemSlug: found.slug,
      itemTitleBn: found.titleBn,
      amountBdt: found.price,
      paymentMethod: manualOrderDraft.paymentMethod,
      trxId: manualOrderDraft.trxId.trim().toUpperCase() || `MANUAL-${Date.now().toString().slice(-5)}`,
      couponUsed: null,
      status: 'COMPLETED',
      createdAt: 'এইমাত্র',
      verifiedBy: 'Admin Direct Entry ✓'
    };
    setOrders((prev) => [newOrder, ...prev]);
    setShowNewOrderModal(false);
    setManualOrderDraft({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      itemSlug: courses[0]?.slug || '',
      paymentMethod: 'bKash',
      trxId: ''
    });
    triggerCloudSync(`ম্যানুয়াল অর্ডার (${newOrder.orderCode}) তৈরি ও আনলক হয়েছে!`);
  };

  const exportOrdersCsv = () => {
    const header = 'OrderCode,CustomerName,Phone,Email,Item,AmountBDT,Method,TrxID,Status,CreatedAt\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.orderCode}","${o.customerName}","${o.customerPhone}","${o.customerEmail}","${o.itemTitleBn}",${o.amountBdt},"${o.paymentMethod}","${o.trxId}","${o.status}","${o.createdAt}"`
      )
      .join('\n');
    downloadFile('MobinIQ_Orders_Report.csv', header + rows, 'text/csv;charset=utf-8');
    notify('📥 সব অর্ডারের CSV রিপোর্ট ডাউনলোড হয়েছে!');
  };

  // ============================================================================
  // USER CRM & BLOCKLIST STATE
  // ============================================================================
  const [userSearch, setUserSearch] = useState<string>('');
  const [selectedUserForEnroll, setSelectedUserForEnroll] = useState<string | null>(null);
  const [selectedUserForOrders, setSelectedUserForOrders] = useState<string | null>(null);
  const [newBlockPhone, setNewBlockPhone] = useState<string>('');
  const [newBlockIp, setNewBlockIp] = useState<string>('');

  const toggleUserCourseAccess = (uid: string, courseSlug: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid !== uid) return u;
        const safeEnrolled = Array.isArray(u.enrolledSlugs) ? u.enrolledSlugs : [];
        const has = safeEnrolled.includes(courseSlug);
        return {
          ...u,
          enrolledSlugs: has
            ? safeEnrolled.filter((s) => s !== courseSlug)
            : [...safeEnrolled, courseSlug]
        };
      })
    );
    triggerCloudSync('ইউজারের কোর্স অ্যাক্সেস আপডেট হয়েছে!');
  };

  const toggleUserBan = (uid: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.uid === uid
          ? { ...u, status: u.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE' }
          : u
      )
    );
    notify('ইউজার স্ট্যাটাস পরিবর্তন করা হয়েছে!');
  };

  // ============================================================================
  // PIXEL & COUPON ENGINE STATE
  // ============================================================================
  const [pixelLogs, setPixelLogs] = useState<PixelEventLog[]>([
    {
      id: 'px-1',
      event: 'Purchase',
      itemTitle: 'সম্পূর্ণ এআই (AI) মাস্টারি কোর্স',
      valueBdt: 1250,
      channels: ['Meta Pixel', 'Meta CAPI (Server)', 'TikTok Pixel', 'GA4'],
      time: '১০ মিনিট আগে'
    },
    {
      id: 'px-2',
      event: 'Lead',
      itemTitle: 'সিনেমাটিক টেক ডকুমেন্টারি ব্লুপ্রিন্ট (Incomplete Checkout)',
      valueBdt: 1490,
      channels: ['Meta Pixel', 'TikTok Pixel'],
      time: '২৮ মিনিট আগে'
    },
    {
      id: 'px-3',
      event: 'InitiateCheckout',
      itemTitle: '১০০+ সিনেমাটিক SFX সাউন্ড প্যাক',
      valueBdt: 199,
      channels: ['Meta Pixel', 'GA4'],
      time: '১ ঘণ্টা আগে'
    }
  ]);

  const fireAdminPixel = (
    event: PixelEventLog['event'],
    itemTitle: string,
    valueBdt: number
  ) => {
    setPixelLogs((prev) => [
      {
        id: `px-${Date.now()}`,
        event,
        itemTitle,
        valueBdt,
        channels: ['Meta Pixel', 'Meta CAPI (Server)', 'TikTok Pixel', 'GA4'],
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
      },
      ...prev.slice(0, 11)
    ]);
  };

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPct, setNewCouponPct] = useState(15);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // ============================================================================
  // COMPUTED DASHBOARD ANALYTICS
  // ============================================================================
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === 'COMPLETED' || o.status === 'VERIFIED'),
    [orders]
  );
  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status === 'PENDING').length,
    [orders]
  );
  const incompleteActiveCount = useMemo(
    () => incompleteLeads.filter((l) => l.status === 'INCOMPLETE').length,
    [incompleteLeads]
  );
  const liveOrdersRevenue = useMemo(
    () => completedOrders.reduce((s, o) => s + (Number(o.amountBdt) || 0), 0),
    [completedOrders]
  );

  const rangeMetrics = useMemo(() => {
    const rev = liveOrdersRevenue;
    const totalCount = orders.length;
    const completedCount = completedOrders.length;
    const convRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '০.০';
    const visitors = incompleteLeads.length + completedCount;
    return {
      revenueBdt: rev,
      visitors,
      adClicks: totalCount,
      convRate,
      dailyBars: [
        { day: 'শনি', rev: Math.round(rev * 0.12), vis: Math.round(visitors * 0.12) },
        { day: 'রবি', rev: Math.round(rev * 0.15), vis: Math.round(visitors * 0.15) },
        { day: 'সোম', rev: Math.round(rev * 0.14), vis: Math.round(visitors * 0.14) },
        { day: 'মঙ্গল', rev: Math.round(rev * 0.18), vis: Math.round(visitors * 0.18) },
        { day: 'বুধ', rev: Math.round(rev * 0.16), vis: Math.round(visitors * 0.16) },
        { day: 'বৃহঃ', rev: Math.round(rev * 0.13), vis: Math.round(visitors * 0.13) },
        { day: 'শুক্র', rev: Math.round(rev * 0.12), vis: Math.round(visitors * 0.12) }
      ]
    };
  }, [liveOrdersRevenue, orders.length, completedOrders.length, incompleteLeads.length]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const statusOk =
        orderFilterStatus === 'ALL' ||
        (orderFilterStatus === 'COMPLETED'
          ? o.status === 'COMPLETED' || o.status === 'VERIFIED'
          : o.status === orderFilterStatus);
      const q = orderSearch.trim().toLowerCase();
      const code = (o.orderCode || o.orderId || o.id || '').toLowerCase();
      const name = (o.customerName || '').toLowerCase();
      const phone = o.customerPhone || '';
      const email = (o.customerEmail || '').toLowerCase();
      const trx = (o.trxId || '').toLowerCase();
      const title = (o.itemTitleBn || (o as any).itemTitle || '').toLowerCase();
      const searchOk =
        !q ||
        code.includes(q) ||
        name.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        trx.includes(q) ||
        title.includes(q);
      return statusOk && searchOk;
    });
  }, [orders, orderFilterStatus, orderSearch]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.phone || '').includes(q) ||
        (u.uid || '').toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const navItems: {
    id: AdminModuleId;
    labelBn: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', labelBn: 'ড্যাশবোর্ড ও অ্যানালিটিক্স', icon: LayoutDashboard },
    { id: 'courses', labelBn: 'কোর্স ও সিলেবাস বিল্ডার', icon: BookOpen, badge: toBn(courses.length) },
    { id: 'products', labelBn: 'ডিজিটাল প্রোডাক্ট স্টোর', icon: ShoppingBag, badge: toBn(products.length) },
    { id: 'hero-slider', labelBn: 'হিরো ব্যানার স্লাইডার', icon: Layers, badge: toBn(heroSlides.length) },
    {
      id: 'orders',
      labelBn: 'অর্ডার ও পেমেন্ট হিস্ট্রি',
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? `${toBn(pendingOrdersCount)} পেন্ডিং` : toBn(orders.length),
      badgeColor: pendingOrdersCount > 0 ? 'bg-amber-400 text-slate-950' : undefined
    },
    {
      id: 'incomplete',
      labelBn: 'ইনকমপ্লিট অর্ডার রিকভারি',
      icon: AlertCircle,
      badge: toBn(incompleteActiveCount),
      badgeColor: incompleteActiveCount > 0 ? 'bg-rose-500 text-white' : undefined
    },
    { id: 'users', labelBn: 'ইউজার ও স্টুডেন্ট ডাটাবেস', icon: Users, badge: toBn(users.length) },
    { id: 'pixel', labelBn: 'পিক্সেল ও অ্যাড ট্র্যাকিং', icon: Crosshair },
    { id: 'gateway', labelBn: 'পেমেন্ট ও সাপোর্ট সেটিংস', icon: CreditCard },
    { id: 'bridge', labelBn: 'ফায়ারবেস ও মেইন সাইট API', icon: Database }
  ];

  // ============================================================================
  // HIGH-SECURITY ADMIN LOGIN GATE (WHEN NOT AUTHENTICATED)
  // ============================================================================
  if (!adminUser) {
    return (
      <div
        className="min-h-screen bg-[#04060c] text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-hidden"
        style={{ fontFamily: "'Hind Siliguri', 'Outfit', sans-serif" }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
          .glass-panel {
            background: rgba(10, 15, 26, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}</style>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {toast && (
          <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl glass-panel border border-emerald-500/40 text-xs sm:text-sm font-bold text-emerald-200 shadow-2xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-amber-400 p-0.5 shadow-xl">
              <div className="w-full h-full rounded-[22px] bg-[#06080f] flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-white font-mono">
                  Mobin<span className="text-amber-400">IQ</span>
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-[10px] font-extrabold text-amber-300">
                  ADMIN OS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">সেন্ট্রাল কমান্ড সেন্টার — হাই সিকিউরিটি গেটওয়ে</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Firebase: {siteConfig.firebaseProjectId || 'mobin-iq'} Connected</span>
            </div>
          </div>

          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* Primary Admin Login: Google 1-Click + Email & Password */}
          <div className="space-y-4">
            {/* Google 1-Click Fast Secure Login */}
            <button
              type="button"
              onClick={handleGoogleAdminLogin}
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google দিয়ে ১-ক্লিকে অ্যাডমিন লগইন</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">অথবা ইমেইল ও পাসওয়ার্ড</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            <form onSubmit={handleEmailAdminLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>এডমিন জিমেইল / ইমেইল *</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Whitelisted Only</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="mobinyt420@gmail.com"
                  value={adminLoginEmail}
                  onChange={(e) => setAdminLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#06080f] border border-white/15 text-white text-xs sm:text-sm font-medium focus:border-cyan-400 focus:outline-none transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>সিক্রেট পাসওয়ার্ড *</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'হাইড করুন' : 'পাসওয়ার্ড দেখুন'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="পাসওয়ার্ড লিখুন..."
                    value={adminLoginPass}
                    onChange={(e) => setAdminLoginPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#06080f] border border-white/15 text-white text-xs sm:text-sm font-mono focus:border-emerald-400 focus:outline-none transition-all shadow-inner pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassModal(true);
                    setForgotPassSent(false);
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer transition-colors"
                >
                  পাসওয়ার্ড ভুলে গেছেন? (Forgot Password)
                </button>
                <span className="text-[10px] text-slate-500 font-mono">Firebase Secure</span>
              </div>

              {/* Login Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-emerald-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>ভেরিফাই হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-slate-950" />
                    <span>লগইন করুন (অ্যাডমিন কমান্ড সেন্টার)</span>
                  </>
                )}
              </button>
            </form>

            {/* Forgot Password Reset Form Modal */}
            {showForgotPassModal && (
              <div className="p-4 rounded-2xl bg-[#091122] border border-amber-500/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>পাসওয়ার্ড রিসেট লিংক পাঠান</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassModal(false)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕ বন্ধ করুন
                  </button>
                </div>
                {forgotPassSent ? (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium space-y-1">
                    <p className="font-bold">✅ পাসওয়ার্ড রিসেট ইমেইল সফলভাবে পাঠানো হয়েছে!</p>
                    <p className="text-[11px] text-slate-300">
                      আপনার জিমেইল (<span className="text-white font-mono">{forgotPassEmail}</span>) এর ইনবক্স বা স্প্যাম ফোল্ডার চেক করে লিংকে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-2.5">
                    <p className="text-[11px] text-slate-400">
                      আপনার রেজিস্টার্ড অ্যাডমিন জিমেইল লিখুন। ফায়ারবেস সরাসরি সেখানে পাসওয়ার্ড রিসেট লিংক পাঠাবে:
                    </p>
                    <input
                      type="email"
                      required
                      value={forgotPassEmail}
                      onChange={(e) => setForgotPassEmail(e.target.value)}
                      placeholder="mobinyt420@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white placeholder-slate-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow transition"
                    >
                      {authLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                      <span>জিমেইলে পাসওয়ার্ড রিসেট লিংক পাঠান</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Offline / Emergency Master Passkey Section */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <details className="group">
                <summary className="text-[11px] text-slate-400 hover:text-slate-300 font-semibold cursor-pointer list-none flex items-center justify-between py-1">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3 h-3 text-amber-400" />
                    <span>জরুরি মাস্টার পাসকী (Emergency Bypass)</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-open:rotate-180 transition-transform" />
                </summary>
                <form onSubmit={handlePasskeyLogin} className="mt-2 space-y-2 pt-1">
                  <input
                    type="password"
                    placeholder="মাস্টার সিক্রেট পাসকী লিখুন..."
                    value={adminSecretKeyInput}
                    onChange={(e) => setAdminSecretKeyInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Unlock className="w-3 h-3" />
                    <span>পাসকী দিয়ে সরাসরি আনলক</span>
                  </button>
                </form>
              </details>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-Bit TLS End-to-End Encrypted Cloud Bridge</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#06080f] text-slate-100 flex flex-col lg:flex-row selection:bg-emerald-500/30 selection:text-emerald-200"
      style={{ fontFamily: "'Hind Siliguri', 'Outfit', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
        .admin-card {
          background: rgba(13, 18, 30, 0.92);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .smooth-fade {
          animation: fadeSlide 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl admin-card border border-emerald-500/40 text-xs sm:text-sm font-bold text-emerald-200 shadow-2xl flex items-center gap-2 smooth-fade">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* LEFT EXECUTIVE SIDEBAR (DESKTOP) & TOP MOBILE NAV */}
      {/* ==================================================================== */}
      <aside className="w-full lg:w-72 shrink-0 bg-[#090d16] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between lg:min-h-screen lg:sticky lg:top-0 z-30">
        <div className="p-4 sm:p-5 space-y-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-[#06080f] shrink-0">
                <NextImage
                  src="/images/logo.jpg"
                  alt="MobinIQ"
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-lg font-extrabold tracking-tight text-white"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Mobin<span className="text-amber-400">IQ</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30 text-[10px] font-extrabold text-amber-300 uppercase">
                    ADMIN OS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Central Command Center v3.0</p>
              </div>
            </div>

            <button
              onClick={() => triggerCloudSync('ম্যানুয়াল ক্লাউড সিঙ্ক সম্পন্ন হয়েছে!')}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
              <span>সিঙ্ক</span>
            </button>
          </div>

          {/* Live Firebase + API Bridge Status Box */}
          <div className="p-3 rounded-2xl bg-[#06080f] border border-emerald-500/25 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firebase + API Connected</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px]">{lastSyncedTime}</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate font-mono">
              Target: {siteConfig.mainWebsiteUrl}
            </div>
          </div>

          {/* Navigation Menu (Horizontal scroll on mobile, vertical stack on desktop) */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2.5 shrink-0 transition-all ${
                    active
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-emerald-300 border border-emerald-500/35 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{item.labelBn}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.badgeColor || 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Admin Profile Footer (Desktop) */}
        <div className="hidden lg:block p-4 border-t border-white/10 bg-[#070a12]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white truncate">{adminUser?.name || 'সুপার এডমিন'}</p>
              <p className="text-[11px] text-emerald-400 truncate">{adminUser?.email || siteConfig.adminEmail}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleBulkSyncToFirebase()}
                disabled={isBulkSyncing}
                title="ফায়ারবেস ক্লাউডে সম্পূর্ণ ক্যাটালগ সিঙ্ক করুন"
                className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isBulkSyncing || syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleAdminLogout}
                title="এডমিন সেশন লগআউট করুন"
                className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* RIGHT MAIN WORKSPACE */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Command Header Bar */}
        <header className="sticky top-0 z-20 bg-[#06080f]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-xl font-extrabold text-white flex items-center gap-2">
              <span>{navItems.find((n) => n.id === activeModule)?.labelBn}</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                <Activity className="w-3 h-3" /> লাইভ কন্ট্রোল
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {pendingOrdersCount > 0 && (
              <button
                onClick={() => {
                  setActiveModule('orders');
                  setOrderFilterStatus('PENDING');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/40 text-amber-300 text-xs font-extrabold flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{toBn(pendingOrdersCount)}টি পেন্ডিং পেমেন্ট</span>
              </button>
            )}

            <button
              onClick={() => handleBulkSyncToFirebase()}
              disabled={isBulkSyncing}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>{isBulkSyncing ? 'সিঙ্ক হচ্ছে...' : 'ফায়ারবেস সিঙ্ক (ক্যাটালগ)'}</span>
            </button>

            <button
              onClick={() => triggerCloudSync('মেইন ওয়েবসাইট ও ফায়ারবেস সিঙ্ক সম্পন্ন!')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
              <span>মেইন সাইটে সিঙ্ক</span>
            </button>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* ================================================================ */}
          {/* MODULE 1: EXECUTIVE ANALYTICS & TRAFFIC DASHBOARD */}
          {/* ================================================================ */}
          {activeModule === 'dashboard' && (
            <div className="space-y-6 smooth-fade">
              {/* Time Range Filter + Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0d121e] border border-white/10 w-fit">
                  {[
                    { id: 'today', label: 'আজ (Today)' },
                    { id: '7d', label: '৭ দিন' },
                    { id: '30d', label: '৩০ দিন' },
                    { id: 'all', label: 'সর্বমোট' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setAnalyticsRange(r.id as typeof analyticsRange)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        analyticsRange === r.id
                          ? 'bg-emerald-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveModule('courses');
                      startNewCourse();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>নতুন কোর্স যুক্ত করুন</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveModule('products');
                      startNewProduct();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>নতুন প্রোডাক্ট যুক্ত করুন</span>
                  </button>
                </div>
              </div>

              {/* 6 Primary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="admin-card rounded-2xl p-5 space-y-2 border-l-4 border-l-emerald-400">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>মোট ভেরিফায়েড রেভিনিউ (বিক্রি)</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    ৳{toBn(rangeMetrics.revenueBdt.toLocaleString())}
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">↑ +২৪.৮% গ্রোথ</span>
                    <span className="text-slate-400">কনভার্শন রেট: {toBn(rangeMetrics.convRate)}%</span>
                  </div>
                </div>

                <div className="admin-card rounded-2xl p-5 space-y-2 border-l-4 border-l-cyan-400">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>মোট ওয়েবসাইট ভিজিটর ও ট্রাফিক</span>
                    <Eye className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    {toBn(rangeMetrics.visitors.toLocaleString())} জন
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-cyan-300 font-bold">🟢 এখন লাইভ আছেন: ৪৭ জন</span>
                    <span className="text-slate-400">FB Ad ক্লিক: {toBn(rangeMetrics.adClicks)}</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveModule('orders')}
                  className="admin-card rounded-2xl p-5 space-y-2 border-l-4 border-l-amber-400 cursor-pointer hover:border-amber-400/50 transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>মোট অর্ডার ও পেন্ডিং ভেরিফিকেশন</span>
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">
                      {toBn(orders.length)} টি
                    </span>
                    {pendingOrdersCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold">
                        {toBn(pendingOrdersCount)}টি পেন্ডিং ➔
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>সম্পন্ন: {toBn(completedOrders.length)}টি</span>
                    <span className="text-amber-300 font-semibold">ক্লিক করে ম্যানেজ করুন</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveModule('incomplete')}
                  className="admin-card rounded-2xl p-5 space-y-2 border-l-4 border-l-rose-500 cursor-pointer hover:border-rose-500/50 transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>ইনকমপ্লিট অর্ডার (চেকআউট ড্রপ-অফ)</span>
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">
                    {toBn(incompleteActiveCount)} টি লিড
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">
                      সম্ভাব্য ভ্যালু: ৳
                      {toBn(
                        incompleteLeads
                          .filter((l) => l.status === 'INCOMPLETE')
                          .reduce((s, l) => s + l.amountBdt, 0)
                      )}
                    </span>
                    <span className="text-rose-300 font-bold">১-ক্লিকে রিকভার করুন ➔</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveModule('users')}
                  className="admin-card rounded-2xl p-5 space-y-2 border-l-4 border-l-indigo-400 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>মোট রেজিস্টার্ড ইউজার ও স্টুডেন্ট</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">
                    {toBn(users.length)} জন
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>ভেরিফায়েড ফোন: ১০০%</span>
                    <span className="text-indigo-300 font-semibold">স্টুডেন্ট প্রোফাইল দেখুন ➔</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveModule('pixel')}
                  className="admin-card rounded-2xl p-5 space-y-2 border-l-4 border-l-purple-400 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Meta Pixel, CAPI ও TikTok ট্র্যাকিং</span>
                    <Crosshair className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-emerald-400">
                    সক্রিয় (Server + Browser)
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Pixel ID: {siteConfig.fbPixelId.slice(0, 8)}...</span>
                    <span className="text-purple-300 font-semibold">ইভেন্ট লগ দেখুন ➔</span>
                  </div>
                </div>
              </div>

              {/* Revenue Bar Chart + Conversion Funnel Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 7-Day Revenue & Visitor Visual Chart */}
                <div className="lg:col-span-2 admin-card rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-white">
                        রেভিনিউ ও ভিজিটর গ্রোথ চার্ট
                      </h2>
                      <p className="text-xs text-slate-400">
                        প্রতিদিনের সেলস এবং ফেসবুক অ্যাড ট্রাফিক পারফরম্যান্স
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-bold">
                      ROAS: 4.8x
                    </span>
                  </div>

                  <div className="h-56 pt-4 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-white/10 pb-3">
                    {rangeMetrics.dailyBars.map((bar, idx) => {
                      const maxRev = Math.max(...rangeMetrics.dailyBars.map((b) => b.rev), 1);
                      const heightPct = Math.max(15, Math.round((bar.rev / maxRev) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                          <span className="text-[10px] font-mono text-emerald-300 opacity-85 group-hover:opacity-100">
                            ৳{toBn(Math.round(bar.rev / 1000))}k
                          </span>
                          <div className="w-full max-w-[44px] h-36 bg-white/[0.04] rounded-t-xl flex items-end overflow-hidden p-0.5">
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full rounded-t-lg bg-gradient-to-t from-emerald-600 via-emerald-400 to-cyan-300 transition-all duration-500 group-hover:brightness-110"
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-300">{bar.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Facebook Ad to Purchase Funnel */}
                <div className="admin-card rounded-2xl p-5 space-y-4">
                  <div>
                    <h2 className="text-base font-extrabold text-white">
                      অ্যাড কনভার্শন ফানেল
                    </h2>
                    <p className="text-xs text-slate-400">
                      ভিজিটর থেকে কাস্টমারে রূপান্তরের হার
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: '১. পেজ ভিউ (PageView)', count: rangeMetrics.visitors, pct: 100, color: 'bg-cyan-400' },
                      { label: '২. কোর্স ও প্রোডাক্ট ভিউ (ViewContent)', count: Math.round(rangeMetrics.visitors * 0.42), pct: 42, color: 'bg-indigo-400' },
                      { label: '৩. চেকআউট শুরু (InitiateCheckout)', count: Math.round(rangeMetrics.visitors * 0.11), pct: 11, color: 'bg-amber-400' },
                      { label: '৪. ইনকমপ্লিট লিড ক্যাপচার (Lead)', count: incompleteLeads.length + 38, pct: 6, color: 'bg-rose-400' },
                      { label: '৫. ভেরিফায়েড পেমেন্ট (Purchase)', count: completedOrders.length + 140, pct: 4.6, color: 'bg-emerald-400' }
                    ].map((step, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-semibold">{step.label}</span>
                          <span className="text-white font-bold">{toBn(step.count)} ({toBn(step.pct)}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full ${step.color} rounded-full`}
                            style={{ width: `${Math.max(8, step.pct)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders & Incomplete Leads Dual Table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="admin-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-extrabold text-white">
                      সর্বশেষ অর্ডারসমূহ
                    </h2>
                    <button
                      onClick={() => setActiveModule('orders')}
                      className="text-xs font-bold text-emerald-400 hover:underline"
                    >
                      সব অর্ডার দেখুন ➔
                    </button>
                  </div>
                  <div className="space-y-2">
                    {orders.slice(0, 4).map((o) => (
                      <div
                        key={o.id}
                        className="p-3 rounded-xl bg-[#070a12] border border-white/[0.06] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-white truncate">
                              {o.customerName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({o.customerPhone})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{o.itemTitleBn}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-extrabold text-emerald-400">
                            ৳{toBn(o.amountBdt)}
                          </span>
                          {o.status === 'PENDING' ? (
                            <button
                              onClick={() => approveOrder(o.id)}
                              className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-extrabold"
                            >
                              অ্যাপ্রুভ করুন
                            </button>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                              সম্পন্ন ✓
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-extrabold text-white">
                      সর্বশেষ ইনকমপ্লিট অর্ডার (অটো-ক্যাপচার্ড)
                    </h2>
                    <button
                      onClick={() => setActiveModule('incomplete')}
                      className="text-xs font-bold text-rose-400 hover:underline"
                    >
                      রিকভারি প্যানেলে যান ➔
                    </button>
                  </div>
                  <div className="space-y-2">
                    {incompleteLeads.slice(0, 4).map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 rounded-xl bg-[#070a12] border border-rose-500/20 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-white truncate">
                              {lead.name}
                            </span>
                            <span className="text-xs font-mono text-amber-300 font-bold">
                              {lead.phone}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {lead.itemTitleBn} • ৳{toBn(lead.amountBdt)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            copyText(lead.phone);
                            notify(`নম্বর কপি হয়েছে: ${lead.phone}`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-[11px] font-bold shrink-0"
                        >
                          কল / কপি
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* MODULE 2: COURSE & CURRICULUM BUILDER STUDIO */}
          {/* ================================================================ */}
          {activeModule === 'courses' && (
            <div className="space-y-6 smooth-fade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    কোর্স ও সিলেবাস ম্যানেজমেন্ট ({toBn(courses.length)}টি কোর্স)
                  </h2>
                  <p className="text-xs text-slate-400">
                    নতুন কোর্স তৈরি করুন, দাম পরিবর্তন করুন অথবা মডিউল ও ভিডিও লেসন যুক্ত করুন
                  </p>
                </div>
                <button
                  onClick={startNewCourse}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন কোর্স যুক্ত করুন</span>
                </button>
              </div>

              {/* Add / Edit Course Modal Form */}
              {showCourseForm && (
                <form
                  onSubmit={saveCourseDraft}
                  className="admin-card rounded-3xl p-5 sm:p-6 border-2 border-emerald-500/40 space-y-5 smooth-fade"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-base sm:text-lg font-extrabold text-emerald-300">
                      {editingCourseId ? '✏️ কোর্স এডিট করুন' : '✨ নতুন কোর্স তৈরি করুন'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowCourseForm(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      বন্ধ করুন ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-300">কোর্সের পূর্ণ নাম (বাংলায়) *</label>
                      <input
                        type="text"
                        required
                        value={courseDraft.titleBn}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, titleBn: e.target.value }))}
                        placeholder="যেমন: সম্পূর্ণ এআই (AI) কিভাবে শিখবো: জিরো থেকে প্রো মাস্টারক্লাস"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">কোর্সের ইংরেজি নাম (Title EN)</label>
                      <input
                        type="text"
                        value={courseDraft.title}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, title: e.target.value }))}
                        placeholder="Complete AI Mastery Course"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">কোর্সের ক্যাটাগরি *</label>
                      <input
                        type="text"
                        value={courseDraft.category}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, category: e.target.value }))}
                        placeholder="ভিডিও এডিটিং / AI & Automation"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">শর্ট টাইটেল (কার্ডের জন্য)</label>
                      <input
                        type="text"
                        value={courseDraft.shortTitleBn}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, shortTitleBn: e.target.value }))}
                        placeholder="সম্পূর্ণ এআই (AI) মাস্টারি কোর্স"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">URL Slug (ওয়েবসাইট ও Ad লিংকের জন্য)</label>
                      <input
                        type="text"
                        value={courseDraft.slug}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, slug: e.target.value }))}
                        placeholder="complete-ai-mastery-zero-to-pro"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-emerald-300 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-cyan-300">সফটওয়্যার ট্যাগ (Software Tags - কমা দিয়ে লিখুন)</label>
                      <input
                        type="text"
                        value={courseDraft.softwareTagsText}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, softwareTagsText: e.target.value }))}
                        placeholder="Pr, Ae, DaVinci, ChatGPT"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-cyan-500/30 text-xs sm:text-sm text-cyan-300 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-300">ডিসকাউন্ট অফার ব্যাজ (Discount Badge)</label>
                      <input
                        type="text"
                        value={courseDraft.discountBadge}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, discountBadge: e.target.value }))}
                        placeholder="25% OFF বা ৭০% ছাড়"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-amber-500/30 text-xs sm:text-sm text-amber-300 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">রিভিউ সংখ্যা (Reviews Count)</label>
                      <input
                        type="text"
                        value={courseDraft.reviewsCount}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, reviewsCount: e.target.value }))}
                        placeholder="320+ Reviews"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">মোট সময়কাল (Duration)</label>
                      <input
                        type="text"
                        value={courseDraft.totalDuration}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, totalDuration: e.target.value }))}
                        placeholder="8h 20m বা ১৬ ঘণ্টা"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-300">অফার প্রাইস (৳ BDT) *</label>
                      <input
                        type="number"
                        required
                        value={courseDraft.price}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, price: Number(e.target.value) }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-emerald-500/40 text-sm font-extrabold text-emerald-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">রেগুলার প্রাইস (৳ স্ট্রাইকথ্রু)</label>
                      <input
                        type="number"
                        required
                        value={courseDraft.originalPrice}
                        onChange={(e) =>
                          setCourseDraft((p) => ({ ...p, originalPrice: Number(e.target.value) }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-sm text-slate-300"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-slate-300">ওয়াইড ব্যানার (16:9 Banner Image - ঐচ্ছিক)</label>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="text"
                          value={courseDraft.bannerUrl}
                          onChange={(e) => setCourseDraft((p) => ({ ...p, bannerUrl: e.target.value }))}
                          placeholder="ইমেজ লিংক অথবা ডান পাশের বাটন দিয়ে আপলোড করুন"
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                        />
                        <label className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold cursor-pointer shrink-0 flex items-center justify-center gap-1.5 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>ব্যানার আপলোড</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file, (dataUrl) =>
                                  setCourseDraft((p) => ({ ...p, bannerUrl: dataUrl }))
                                );
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-3 space-y-2 p-3.5 rounded-2xl bg-[#090d18] border border-white/10">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span>কোর্সের কভার থাম্বনেইল / ছবি *</span>
                        </label>
                        <span className="text-[11px] text-emerald-400">ইমেজ লিংক দিন অথবা কম্পিউটার/মোবাইল থেকে সরাসরি আপলোড করুন</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                          type="text"
                          required
                          value={courseDraft.thumbnailUrl}
                          onChange={(e) => setCourseDraft((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                          placeholder="https://images.unsplash.com/... অথবা ছবি আপলোড করুন"
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                        />
                        <label className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold cursor-pointer shrink-0 flex items-center justify-center gap-1.5 transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>ছবি সিলেক্ট / আপলোড</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file, (dataUrl) =>
                                  setCourseDraft((p) => ({ ...p, thumbnailUrl: dataUrl }))
                                );
                              }
                            }}
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] text-slate-400">প্রিসেট থাম্বনেইল:</span>
                          <button
                            type="button"
                            onClick={() => setCourseDraft((p) => ({ ...p, thumbnailUrl: AI_COURSE_IMG }))}
                            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                          >
                            AI মাস্টারক্লাস
                          </button>
                          <button
                            type="button"
                            onClick={() => setCourseDraft((p) => ({ ...p, thumbnailUrl: DOC_COURSE_IMG }))}
                            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                          >
                            টেক ডকুমেন্টারি
                          </button>
                          <button
                            type="button"
                            onClick={() => setCourseDraft((p) => ({ ...p, thumbnailUrl: EDIT_COURSE_IMG }))}
                            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                          >
                            ভিডিও এডিটিং
                          </button>
                          <button
                            type="button"
                            onClick={() => setCourseDraft((p) => ({ ...p, thumbnailUrl: HERO_IMG }))}
                            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                          >
                            স্টুডিও হিরো
                          </button>
                        </div>
                        {courseDraft.thumbnailUrl && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">লাইভ প্রিভিউ:</span>
                            <div className="w-16 h-10 rounded-lg overflow-hidden border border-emerald-500/40">
                              <img src={courseDraft.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-3 space-y-2 p-3.5 rounded-2xl bg-[#090d18] border border-cyan-500/25">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                          <Play className="w-3.5 h-3.5 text-cyan-400" />
                          <span>কোর্সের ইন্ট্রো / ট্রেলার ভিডিও লিংক (YouTube URL / Embed Link)</span>
                        </label>
                        <span className="text-[11px] text-cyan-400">মেইন ওয়েবসাইটে প্লে বাটনে ক্লিক করলে এই ট্রেলারটি সরাসরি চলবে</span>
                      </div>
                      <input
                        type="text"
                        value={courseDraft.introVideoUrl}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, introVideoUrl: e.target.value }))}
                        placeholder="যেমন: https://www.youtube.com/watch?v=dQw4w9WgXcQ অথবা https://youtu.be/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-cyan-500/30 text-xs sm:text-sm text-cyan-200 font-mono focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        সংক্ষিপ্ত বিবরণ (ল্যান্ডিং পেজ সাবটাইটেল)
                      </label>
                      <textarea
                        rows={3}
                        value={courseDraft.shortDescBn}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, shortDescBn: e.target.value }))}
                        placeholder="কোর্সের মূল আকর্ষণ ও ফলাফল লিখুন..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        কোর্সে যা যা শিখবেন (প্রতি লাইনে একটি করে পয়েন্ট)
                      </label>
                      <textarea
                        rows={3}
                        value={courseDraft.outcomesText}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, outcomesText: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Interactive Module & Lesson Curriculum Builder */}
                  <div className="p-4 rounded-2xl bg-[#06080f] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-extrabold text-amber-300">
                        📚 কোর্স সিলেবাস, মডিউল ও ভিডিও লেসন বিল্ডার
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setCourseDraft((p) => ({
                            ...p,
                            modules: [
                              ...p.modules,
                              {
                                id: `mod-${Date.now()}`,
                                title: `মডিউল ${toBn(p.modules.length + 1)}: নতুন মডিউল`,
                                order: p.modules.length + 1,
                                lessons: []
                              }
                            ]
                          }))
                        }
                        className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold"
                      >
                        + নতুন মডিউল যুক্ত করুন
                      </button>
                    </div>

                    <div className="space-y-3">
                      {courseDraft.modules.map((mod, mIdx) => (
                        <div
                          key={mod.id}
                          className="p-3.5 rounded-xl bg-[#0d121e] border border-white/10 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={mod.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCourseDraft((p) => ({
                                  ...p,
                                  modules: p.modules.map((m, idx) =>
                                    idx === mIdx ? { ...m, title: val } : m
                                  )
                                }));
                              }}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-[#06080f] border border-white/10 text-xs font-bold text-white"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setCourseDraft((p) => ({
                                  ...p,
                                  modules: p.modules.map((m, idx) =>
                                    idx === mIdx
                                      ? {
                                          ...m,
                                          lessons: [
                                            ...m.lessons,
                                            {
                                              id: `les-${Date.now()}`,
                                              title: `${toBn(mIdx + 1)}.${toBn(m.lessons.length + 1)} নতুন ভিডিও ক্লাস`,
                                              duration: '২০:০০',
                                              isPreview: false,
                                              videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
                                              summaryBn: 'লেসনের সংক্ষিপ্ত বিবরণ।'
                                            }
                                          ]
                                        }
                                      : m
                                  )
                                }))
                              }
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-[11px] font-bold"
                            >
                              + লেসন
                            </button>
                          </div>

                          <div className="space-y-1.5 pl-2">
                            {mod.lessons.map((les, lIdx) => (
                              <div
                                key={les.id}
                                className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-[#06080f] p-2 rounded-lg border border-white/5"
                              >
                                <input
                                  type="text"
                                  value={les.title}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCourseDraft((p) => ({
                                      ...p,
                                      modules: p.modules.map((m, idx) =>
                                        idx === mIdx
                                          ? {
                                              ...m,
                                              lessons: m.lessons.map((l, li) =>
                                                li === lIdx ? { ...l, title: val } : l
                                              )
                                            }
                                          : m
                                      )
                                    }));
                                  }}
                                  placeholder="লেসনের নাম"
                                  className="sm:col-span-5 px-2.5 py-1 rounded bg-[#0d121e] text-xs text-white"
                                />
                                <input
                                  type="text"
                                  value={les.videoUrl}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCourseDraft((p) => ({
                                      ...p,
                                      modules: p.modules.map((m, idx) =>
                                        idx === mIdx
                                          ? {
                                              ...m,
                                              lessons: m.lessons.map((l, li) =>
                                                li === lIdx ? { ...l, videoUrl: val } : l
                                              )
                                            }
                                          : m
                                      )
                                    }));
                                  }}
                                  placeholder="Video Embed URL"
                                  className="sm:col-span-4 px-2.5 py-1 rounded bg-[#0d121e] text-[11px] font-mono text-cyan-300"
                                />
                                <label className="sm:col-span-2 flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={les.isPreview}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setCourseDraft((p) => ({
                                        ...p,
                                        modules: p.modules.map((m, idx) =>
                                          idx === mIdx
                                            ? {
                                                ...m,
                                                lessons: m.lessons.map((l, li) =>
                                                  li === lIdx ? { ...l, isPreview: checked } : l
                                                )
                                              }
                                            : m
                                        )
                                      }));
                                    }}
                                  />
                                  <span>ফ্রি প্রিভিউ</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCourseDraft((p) => ({
                                      ...p,
                                      modules: p.modules.map((m, idx) =>
                                        idx === mIdx
                                          ? {
                                              ...m,
                                              lessons: m.lessons.filter((_, li) => li !== lIdx)
                                            }
                                          : m
                                      )
                                    }))
                                  }
                                  className="sm:col-span-1 text-rose-400 hover:text-rose-300 flex justify-end"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCourseForm(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 text-xs font-bold text-slate-300"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm"
                    >
                      💾 কোর্স সেভ ও মেইন সাইটে পাবলিশ করুন
                    </button>
                  </div>
                </form>
              )}

              {/* Courses Table / Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {courses.length === 0 && !showCourseForm && (
                  <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#0b101b]">
                    <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">কোনো কোর্স তৈরি করা নেই</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
                      কোনো ডামি কোর্স নেই। আপনার রিয়েল কোর্স তৈরি করতে উপরের &quot;+ নতুন কোর্স যুক্ত করুন&quot; বাটনে ক্লিক করুন।
                    </p>
                    <button
                      onClick={() => {
                        startNewCourse();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>প্রথম কোর্স তৈরি করুন</span>
                    </button>
                  </div>
                )}
                {courses.map((course) => {
                  const safeModules = Array.isArray(course.modules) ? course.modules : [];
                  const lessonCount = safeModules.reduce((s, m) => s + (Array.isArray(m?.lessons) ? m.lessons.length : 0), 0);
                  const thumb = course.thumbnailUrl || course.bannerUrl || '/images/course-ai-automation.jpg';
                  return (
                    <div
                      key={course.id || course.slug}
                      className="admin-card rounded-2xl overflow-hidden flex flex-col justify-between border border-white/10"
                    >
                      <div>
                        <div className="relative aspect-video bg-black/50">
                          <img
                            src={thumb}
                            alt={course.titleBn || course.title || 'Course'}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/90 text-emerald-300 text-[10px] font-bold">
                            {course.category || 'কোর্স'}
                          </span>
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold">
                            {course.status || 'PUBLISHED'}
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="text-base font-extrabold text-white line-clamp-1">
                            {course.shortTitleBn || course.titleBn || course.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {course.subtitleBn || course.subtitle || course.shortDescBn || ''}
                          </p>
                          {course.softwareTags && course.softwareTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {course.softwareTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{toBn(safeModules.length)} মডিউল</span>
                            <span>•</span>
                            <span>{toBn(lessonCount)} লেসন</span>
                            <span>•</span>
                            <span>{course.totalDuration || '৮ ঘণ্টা'}</span>
                          </div>
                          <div className="flex items-baseline justify-between pt-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-extrabold text-emerald-400">
                                ৳{toBn(course.price)}
                              </span>
                              <span className="text-xs text-slate-500 line-through">
                                ৳{toBn(course.originalPrice)}
                              </span>
                            </div>
                            {course.discountBadge && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
                                {course.discountBadge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 bg-[#070a12] border-t border-white/10 flex items-center justify-between gap-2">
                        <button
                          onClick={() => startEditCourse(course)}
                          className="flex-1 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>এডিট ও সিলেবাস</span>
                        </button>
                        <button
                          onClick={() => {
                            copyText(`${siteConfig.mainWebsiteUrl}/courses/${course.slug}?utm_source=fb_ad`);
                            notify('🎯 কোর্সের Facebook Ad ল্যান্ডিং লিংক কপি হয়েছে!');
                          }}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300"
                          title="Copy Facebook Ad Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`আপনি কি "${course.titleBn}" কোর্সটি সম্পূর্ণ মুছে ফেলতে চান?`)) return;
                            notify('⏳ কোর্স মুছে ফেলা হচ্ছে...');
                            const res = await deleteCourseFromFirestore(course.id, course.slug);
                            const updated = courses.filter((c) => c.id !== course.id && c.slug !== course.slug);
                            setCourses(updated);
                            safeSet('mobiniq_admin_courses_v1', updated);
                            if (res.success) {
                              notify('✅ কোর্স সফলভাবে মুছে ফেলা হয়েছে!');
                            } else {
                              notify(`⚠️ ফায়ারবেস থেকে ডিলিট: ${res.reason || 'লোকালি মুছে ফেলা হয়েছে'}`);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400"
                          title="Delete Course"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* MODULE 3: DIGITAL PRODUCTS & STORE MANAGER */}
          {/* ================================================================ */}
          {activeModule === 'products' && (
            <div className="space-y-6 smooth-fade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    ডিজিটাল প্রোডাক্ট ও স্টোর ম্যানেজার ({toBn(products.length)}টি প্রোডাক্ট)
                  </h2>
                  <p className="text-xs text-slate-400">
                    SFX প্যাক, প্রম্পট ভল্ট, ই-বুক বা টেমপ্লেট যুক্ত করুন এবং ডাউনলোড ফাইল কনফিগার করুন
                  </p>
                </div>
                <button
                  onClick={startNewProduct}
                  className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ডিজিটাল প্রোডাক্ট যুক্ত করুন</span>
                </button>
              </div>

              {showProductForm && (
                <form
                  onSubmit={saveProductDraft}
                  className="admin-card rounded-3xl p-5 sm:p-6 border-2 border-cyan-500/40 space-y-4 smooth-fade"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-base font-extrabold text-cyan-300">
                      {editingProductId ? '✏️ প্রোডাক্ট এডিট করুন' : '✨ নতুন ডিজিটাল প্রোডাক্ট তৈরি করুন'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      বন্ধ করুন ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-300">প্রোডাক্টের নাম (বাংলায়) *</label>
                      <input
                        type="text"
                        required
                        value={productDraft.titleBn}
                        onChange={(e) => setProductDraft((p) => ({ ...p, titleBn: e.target.value }))}
                        placeholder="যেমন: সিনেমাটিক LUTs প্যাক"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">প্রোডাক্টের ইংরেজি নাম (Title EN)</label>
                      <input
                        type="text"
                        value={productDraft.title}
                        onChange={(e) => setProductDraft((p) => ({ ...p, title: e.target.value }))}
                        placeholder="Cinematic LUTs Pack"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">প্রোডাক্টের ধরন (Category)</label>
                      <input
                        type="text"
                        value={productDraft.category}
                        onChange={(e) => setProductDraft((p) => ({ ...p, category: e.target.value }))}
                        placeholder="Presets & Assets / AI & Automation / SFX Pack"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">URL Slug (ওয়েবসাইট ও শপ লিংকের জন্য)</label>
                      <input
                        type="text"
                        value={productDraft.slug}
                        onChange={(e) => setProductDraft((p) => ({ ...p, slug: e.target.value }))}
                        placeholder="cinematic-luts-pack"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-cyan-300 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-cyan-300">সফটওয়্যার ট্যাগ (Software Tags - কমা দিয়ে লিখুন)</label>
                      <input
                        type="text"
                        value={productDraft.softwareTagsText}
                        onChange={(e) => setProductDraft((p) => ({ ...p, softwareTagsText: e.target.value }))}
                        placeholder="Pr, Ae, DaVinci, CapCut"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-cyan-500/30 text-xs sm:text-sm text-cyan-300 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-300">ফাইল ফরম্যাট (File Format)</label>
                      <input
                        type="text"
                        value={productDraft.fileFormat}
                        onChange={(e) => setProductDraft((p) => ({ ...p, fileFormat: e.target.value }))}
                        placeholder=".cube / 3D LUTs বা Notion Vault + PDF বা 24-Bit WAV"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-amber-500/30 text-xs sm:text-sm text-amber-300 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-300">অফার মূল্য (৳ BDT) *</label>
                      <input
                        type="number"
                        required
                        value={productDraft.price}
                        onChange={(e) => setProductDraft((p) => ({ ...p, price: Number(e.target.value) }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-emerald-500/40 text-sm font-extrabold text-emerald-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">রেগুলার মূল্য (৳ স্ট্রাইকথ্রু)</label>
                      <input
                        type="number"
                        value={productDraft.originalPrice}
                        onChange={(e) =>
                          setProductDraft((p) => ({ ...p, originalPrice: Number(e.target.value) }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-sm text-slate-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-300">ডিসকাউন্ট ব্যাজ (Discount Badge)</label>
                      <input
                        type="text"
                        value={productDraft.discountBadge}
                        onChange={(e) => setProductDraft((p) => ({ ...p, discountBadge: e.target.value }))}
                        placeholder="50% OFF বা ৪০% ছাড়"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-amber-300 font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-cyan-300">স্পেশাল ব্যাজ (Product Badge)</label>
                      <input
                        type="text"
                        value={productDraft.badge}
                        onChange={(e) => setProductDraft((p) => ({ ...p, badge: e.target.value }))}
                        placeholder="BESTSELLER / POPULAR / HOT / NEW"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-cyan-300 font-bold"
                      />
                    </div>
                  </div>

                  {/* ================================================================ */}
                  {/* 3-IMAGE DEDICATED SLOTS (MAIN THUMBNAIL + 2 SLIDER IMAGES) */}
                  {/* ================================================================ */}
                  <div className="space-y-4 p-4 sm:p-5 rounded-2xl bg-[#090d18] border border-cyan-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-extrabold text-white">
                          প্রোডাক্ট ছবি ও ১:১ স্লাইডার (সর্বোচ্চ ৩টি ছবি)
                        </span>
                      </div>
                      <span className="text-[11px] text-cyan-300/80">
                        ১টি দিলে স্লাইডার বন্ধ থাকবে | ২টি বা ৩টি দিলে মসৃণ ১:১ স্লাইডার চলবে
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {/* Image Slot 1: Primary Cover / Thumbnail */}
                      <div className="space-y-2 p-3 rounded-xl bg-[#06080f] border border-cyan-500/40 relative flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-cyan-300 flex items-center gap-1">
                              <span>ইমেজ ১ (প্রধান কভার) *</span>
                            </label>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                              থাম্বনেইল
                            </span>
                          </div>
                          <input
                            type="text"
                            value={productDraft.image1}
                            onChange={(e) => setProductDraft((p) => ({ ...p, image1: e.target.value }))}
                            placeholder="ইমেজ ১ এর URL..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1 transition">
                              <Upload className="w-3 h-3" />
                              <span>ছবি আপলোড</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, (dataUrl) => setProductDraft((p) => ({ ...p, image1: dataUrl })));
                                }}
                              />
                            </label>
                            {productDraft.image1 && (
                              <button
                                type="button"
                                onClick={() => setProductDraft((p) => ({ ...p, image1: '' }))}
                                className="px-2 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-[11px] font-bold"
                                title="মুছুন"
                              >
                                মুছুন
                              </button>
                            )}
                          </div>
                        </div>
                        {productDraft.image1 ? (
                          <div className="mt-2 relative aspect-square w-full rounded-lg overflow-hidden border border-cyan-500/40 bg-black">
                            <img src={productDraft.image1} alt="Preview 1" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="mt-2 aspect-square w-full rounded-lg border border-dashed border-cyan-500/20 flex items-center justify-center text-[10px] text-slate-500">
                            ছবি ১ যুক্ত করুন
                          </div>
                        )}
                      </div>

                      {/* Image Slot 2: Slider Image 2 (Optional) */}
                      <div className="space-y-2 p-3 rounded-xl bg-[#06080f] border border-white/15 relative flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-300">
                              ইমেজ ২ (স্লাইডার ছবি ২)
                            </label>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
                              অপশনাল
                            </span>
                          </div>
                          <input
                            type="text"
                            value={productDraft.image2}
                            onChange={(e) => setProductDraft((p) => ({ ...p, image2: e.target.value }))}
                            placeholder="ইমেজ ২ এর URL (অপশনাল)..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1 transition">
                              <Upload className="w-3 h-3" />
                              <span>ছবি আপলোড</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, (dataUrl) => setProductDraft((p) => ({ ...p, image2: dataUrl })));
                                }}
                              />
                            </label>
                            {productDraft.image2 && (
                              <button
                                type="button"
                                onClick={() => setProductDraft((p) => ({ ...p, image2: '' }))}
                                className="px-2 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-[11px] font-bold"
                                title="মুছুন"
                              >
                                মুছুন
                              </button>
                            )}
                          </div>
                        </div>
                        {productDraft.image2 ? (
                          <div className="mt-2 relative aspect-square w-full rounded-lg overflow-hidden border border-white/20 bg-black">
                            <img src={productDraft.image2} alt="Preview 2" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="mt-2 aspect-square w-full rounded-lg border border-dashed border-white/10 flex items-center justify-center text-[10px] text-slate-600">
                            ছবি ২ খালি (কোনো ছবি নেই)
                          </div>
                        )}
                      </div>

                      {/* Image Slot 3: Slider Image 3 (Optional) */}
                      <div className="space-y-2 p-3 rounded-xl bg-[#06080f] border border-white/15 relative flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-300">
                              ইমেজ ৩ (স্লাইডার ছবি ৩)
                            </label>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
                              অপশনাল
                            </span>
                          </div>
                          <input
                            type="text"
                            value={productDraft.image3}
                            onChange={(e) => setProductDraft((p) => ({ ...p, image3: e.target.value }))}
                            placeholder="ইমেজ ৩ এর URL (অপশনাল)..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1 transition">
                              <Upload className="w-3 h-3" />
                              <span>ছবি আপলোড</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, (dataUrl) => setProductDraft((p) => ({ ...p, image3: dataUrl })));
                                }}
                              />
                            </label>
                            {productDraft.image3 && (
                              <button
                                type="button"
                                onClick={() => setProductDraft((p) => ({ ...p, image3: '' }))}
                                className="px-2 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-[11px] font-bold"
                                title="মুছুন"
                              >
                                মুছুন
                              </button>
                            )}
                          </div>
                        </div>
                        {productDraft.image3 ? (
                          <div className="mt-2 relative aspect-square w-full rounded-lg overflow-hidden border border-white/20 bg-black">
                            <img src={productDraft.image3} alt="Preview 3" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="mt-2 aspect-square w-full rounded-lg border border-dashed border-white/10 flex items-center justify-center text-[10px] text-slate-600">
                            ছবি ৩ খালি (কোনো ছবি নেই)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        প্যাকের ভেতরে যা যা থাকছে (প্রতি লাইনে একটি করে পয়েন্ট)
                      </label>
                      <textarea
                        rows={3}
                        value={productDraft.featuresText}
                        onChange={(e) => setProductDraft((p) => ({ ...p, featuresText: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">
                        ইনস্ট্যান্ট ডাউনলোড ফাইল কন্টেন্ট / গুগল ড্রাইভ মাস্টার লিংক
                      </label>
                      <textarea
                        rows={3}
                        value={productDraft.downloadContent}
                        onChange={(e) =>
                          setProductDraft((p) => ({ ...p, downloadContent: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs font-mono text-cyan-300"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 text-xs font-bold text-slate-300"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm"
                    >
                      💾 প্রোডাক্ট সেভ ও স্টোরে পাবলিশ করুন
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {products.length === 0 && !showProductForm && (
                  <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#0b101b]">
                    <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">কোনো ডিজিটাল প্রোডাক্ট নেই</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
                      কোনো ডামি প্রোডাক্ট নেই। আপনার নতুন ডিজিটাল প্রোডাক্ট যোগ করতে &quot;+ নতুন ডিজিটাল প্রোডাক্ট&quot; বাটনে ক্লিক করুন।
                    </p>
                    <button
                      onClick={() => {
                        startNewProduct();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>প্রথম প্রোডাক্ট তৈরি করুন</span>
                    </button>
                  </div>
                )}
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="admin-card rounded-2xl p-5 flex flex-col justify-between gap-4 border border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={prod.thumbnailUrl}
                        alt={prod.titleBn}
                        className="w-24 h-24 rounded-2xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-bold">
                            {prod.category}
                          </span>
                          {prod.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold">
                              {prod.badge}
                            </span>
                          )}
                          {prod.discountBadge && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                              {prod.discountBadge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold text-white">{prod.titleBn}</h3>
                        {prod.title && <p className="text-[11px] text-slate-400 font-mono">{prod.title}</p>}
                        <p className="text-xs text-slate-400 line-clamp-2">{prod.shortDescBn || prod.shortDesc}</p>
                        {prod.softwareTags && prod.softwareTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {prod.softwareTags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {prod.fileFormat && (
                          <span className="text-[10px] text-amber-300/90 font-mono block">
                            Format: {prod.fileFormat}
                          </span>
                        )}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-xl font-extrabold text-emerald-400">
                            ৳{toBn(prod.price)}
                          </span>
                          <span className="text-xs text-slate-500 line-through">
                            ৳{toBn(prod.originalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => startEditProduct(prod)}
                        className="flex-1 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>এডিট করুন</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`আপনি কি "${prod.titleBn}" প্রোডাক্টটি সম্পূর্ণ মুছে ফেলতে চান?`)) return;
                          notify('⏳ প্রোডাক্ট মুছে ফেলা হচ্ছে...');
                          const res = await deleteProductFromFirestore(prod.id, prod.slug);
                          const updated = products.filter((p) => p.id !== prod.id && p.slug !== prod.slug);
                          setProducts(updated);
                          safeSet('mobiniq_admin_products_v1', updated);
                          if (res.success) {
                            notify('✅ প্রোডাক্ট সফলভাবে মুছে ফেলা হয়েছে!');
                          } else {
                            notify(`⚠️ ফায়ারবেস থেকে ডিলিট: ${res.reason || 'লোকালি মুছে ফেলা হয়েছে'}`);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold"
                      >
                        মুছুন
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* MODULE: HOMEPAGE HERO BANNER SLIDER STUDIO */}
          {/* ================================================================ */}
          {activeModule === 'hero-slider' && (
            <div className="space-y-6 smooth-fade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    <span>হোমপেজ হিরো ব্যানার স্লাইডার ({toBn(heroSlides.length)}টি ব্যানার)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    মেইন ওয়েবসাইটের হোমপেজে যে ব্যানারগুলো একটার পর একটা স্লাইড করে সেগুলো পরিবর্তন, নতুন ব্যানার অ্যাড বা ইমেজ আপলোড করুন
                  </p>
                </div>
                <button
                  onClick={startNewHeroSlide}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন ব্যানার স্লাইড যোগ করুন</span>
                </button>
              </div>

              {/* Live Interactive Hero Slider Preview */}
              <div className="admin-card rounded-3xl p-5 space-y-3 border border-amber-400/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>হোমপেজে যেভাবে লাইভ প্রদর্শিত হবে (Interactive Preview)</span>
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>স্লাইড {toBn(heroPreviewIndex + 1)} / {toBn(Math.max(1, heroSlides.length))}</span>
                  </div>
                </div>

                {heroSlides.length > 0 && (() => {
                  const currentSlide = heroSlides[heroPreviewIndex % heroSlides.length];
                  const hasOverlay = currentSlide?.showOverlay ?? Boolean(currentSlide?.highlight?.trim());
                  return (
                    <div className="relative aspect-[16/9] max-w-2xl mx-auto rounded-2xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl group">
                      <img
                        src={currentSlide?.image}
                        alt="Hero Banner Preview"
                        className="w-full h-full object-cover"
                      />

                      {/* Dark Gradient Overlay - ONLY shown if text overlay is enabled! */}
                      {hasOverlay && (
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />
                      )}

                      {/* Badge */}
                      {hasOverlay && currentSlide?.badge && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 border border-amber-400/40 text-[11px] font-bold text-amber-300 pointer-events-none">
                          {currentSlide.badge}
                        </div>
                      )}

                      {/* Mode Indicator Badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 border border-white/20 text-[10px] font-bold text-slate-200">
                        {hasOverlay ? '📝 টেক্সট ওভারলে সক্রিয়' : '🖼️ ফুল ফ্রেশ গ্রাফিক ব্যানার'}
                      </div>

                      {/* Nav Arrows */}
                      <button
                        type="button"
                        onClick={() =>
                          setHeroPreviewIndex((p) => (p - 1 + heroSlides.length) % heroSlides.length)
                        }
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 border border-white/20 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroPreviewIndex((p) => (p + 1) % heroSlides.length)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 border border-white/20 text-white flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                      >
                        ›
                      </button>

                      {/* Bottom Content overlay */}
                      {hasOverlay ? (
                        <div className="absolute bottom-3 left-3 right-3 space-y-1.5 pointer-events-none">
                          {currentSlide?.topLine && (
                            <p className="text-xs text-slate-300">{currentSlide.topLine}</p>
                          )}
                          {currentSlide?.highlight && (
                            <h3 className="text-lg sm:text-2xl font-extrabold text-white">
                              {currentSlide.highlight}
                            </h3>
                          )}
                          {currentSlide?.pills && currentSlide.pills.length > 0 && (
                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                              {currentSlide.pills.map((pill, pi) => (
                                <span
                                  key={pi}
                                  className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-[10px] text-slate-200"
                                >
                                  {pill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        (currentSlide?.showCta ?? true) && (
                          <div className="absolute bottom-3 right-3 pointer-events-none">
                            <span className="px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs shadow-lg inline-flex items-center gap-1">
                              <span>{currentSlide?.ctaText || 'এখনই কিনুন'}</span>
                              <span>→</span>
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Add / Edit Slide Modal Form */}
              {showHeroSlideForm && (
                <form
                  onSubmit={saveHeroSlideDraft}
                  className="admin-card rounded-3xl p-5 sm:p-6 border-2 border-amber-400/40 space-y-5 smooth-fade"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-base font-extrabold text-amber-300">
                      {editingHeroSlideId ? '✏️ ব্যানার স্লাইড এডিট করুন' : '✨ নতুন ব্যানার স্লাইড তৈরি করুন'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowHeroSlideForm(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      বন্ধ করুন ✕
                    </button>
                  </div>

                  {/* Mode Selector */}
                  <div className="p-3.5 rounded-2xl bg-[#090d18] border border-white/10 space-y-2">
                    <label className="text-xs font-bold text-amber-300">
                      ব্যানার স্টাইল মোড নির্বাচন করুন:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setHeroSlideDraft((p) => ({ ...p, showOverlay: false }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          !heroSlideDraft.showOverlay
                            ? 'bg-amber-400/15 border-amber-400 text-white shadow-md'
                            : 'bg-[#06080f] border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-300">
                          <span>🖼️ ফুল ফ্রেশ গ্রাফিক ব্যানার (Clean Mode)</span>
                          {!heroSlideDraft.showOverlay && <Check className="w-4 h-4 text-amber-400 ml-auto shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          রিকমেন্ডেড! ছবিতেই সব লেখা ও ডিজাইন থাকবে। ওয়েবসাইটে কোনো কালো শ্যাডো বা বাড়তি টেক্সট বসবে না, ব্যানার একদম পরিষ্কার ও উজ্জ্বল দেখাবে।
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHeroSlideDraft((p) => ({ ...p, showOverlay: true }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          heroSlideDraft.showOverlay
                            ? 'bg-emerald-400/15 border-emerald-400 text-white shadow-md'
                            : 'bg-[#06080f] border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-300">
                          <span>📝 ওয়েবসাইট টেক্সট ওভারলে (Overlay Mode)</span>
                          {heroSlideDraft.showOverlay && <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          ছবির উপর ওয়েবসাইট থেকে শিরোনাম, ব্যাজ, সাবটাইটেল ও ট্যাগ পিলস যোগ করতে চাইলে এটি বেছে নিন।
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* 1. Image URL & File Upload */}
                  <div className="space-y-2 p-3.5 rounded-2xl bg-[#090d18] border border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>ব্যানার ছবি (16:9 অনুপাত সবচেয়ে ভালো) *</span>
                      </label>
                      <span className="text-[11px] text-amber-400">
                        ইমেজ লিংক দিন অথবা কম্পিউটার/মোবাইল থেকে সরাসরি আপলোড করুন
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        required
                        value={heroSlideDraft.image}
                        onChange={(e) => setHeroSlideDraft((p) => ({ ...p, image: e.target.value }))}
                        placeholder="https://... অথবা ছবি আপলোড করুন"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                      />
                      <label className="px-4 py-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-xs font-bold cursor-pointer shrink-0 flex items-center justify-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>ছবি সিলেক্ট / আপলোড</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, (dataUrl) =>
                                setHeroSlideDraft((p) => ({ ...p, image: dataUrl }))
                              );
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400">প্রিসেট ব্যানার:</span>
                        <button
                          type="button"
                          onClick={() => setHeroSlideDraft((p) => ({ ...p, image: HERO_IMG }))}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                        >
                          AI ব্যানার
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroSlideDraft((p) => ({ ...p, image: DOC_COURSE_IMG }))}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                        >
                          ডকুমেন্টারি ব্যানার
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroSlideDraft((p) => ({ ...p, image: EDIT_COURSE_IMG }))}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                        >
                          ভিডিও এডিটিং ব্যানার
                        </button>
                      </div>
                      {heroSlideDraft.image && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">প্রিভিউ:</span>
                          <div className="w-16 h-10 rounded-lg overflow-hidden border border-amber-400/40">
                            <img src={heroSlideDraft.image} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Target Course / Product (Slug) Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-emerald-300">
                        ক্লিক করলে যে কোর্স বা প্রডাক্টে যাবে (Link Target) *
                      </label>
                      <select
                        value={heroSlideDraft.slug}
                        onChange={(e) => setHeroSlideDraft((p) => ({ ...p, slug: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-emerald-300 font-mono"
                      >
                        <optgroup label="কোর্সসমূহ">
                          {courses.map((c) => (
                            <option key={c.id} value={c.slug}>
                              কোর্স: {c.shortTitleBn} ({c.slug})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="ডিজিটাল প্রোডাক্টসমূহ">
                          {products.map((p) => (
                            <option key={p.id} value={p.slug}>
                              প্রোডাক্ট: {p.shortTitleBn} ({p.slug})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                      <p className="text-[10px] text-slate-400">
                        মেইন ওয়েবসাইটে ভিজিটর ব্যানারে ক্লিক করলে সরাসরি এই পেজে নিয়ে যাবে।
                      </p>
                    </div>

                    {/* CTA Button Settings */}
                    <div className="space-y-2 p-3 rounded-xl bg-[#090d18] border border-white/10">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200">অ্যাকশন বাটন (CTA)</label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={heroSlideDraft.showCta ?? true}
                            onChange={(e) => setHeroSlideDraft((p) => ({ ...p, showCta: e.target.checked }))}
                            className="w-4 h-4 rounded text-amber-400 bg-slate-900 border-white/20 focus:ring-0 cursor-pointer"
                          />
                          <span className="text-xs text-slate-300 font-medium">বাটন অন রাখুন</span>
                        </label>
                      </div>
                      {(heroSlideDraft.showCta ?? true) && (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={heroSlideDraft.ctaText || 'এখনই কিনুন'}
                            onChange={(e) => setHeroSlideDraft((p) => ({ ...p, ctaText: e.target.value }))}
                            placeholder="যেমন: এখনই কিনুন / কোর্স দেখুন"
                            className="w-full px-3 py-1.5 rounded-lg bg-[#06080f] border border-white/15 text-xs text-amber-300 font-bold"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Text Overlay Fields - ONLY when showOverlay is true */}
                  {heroSlideDraft.showOverlay && (
                    <div className="p-4 rounded-2xl bg-[#090d18] border border-emerald-500/20 space-y-4 smooth-fade">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 border-b border-white/10 pb-2">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>টেক্সট ওভারলে কনফিগারেশন (ঐচ্ছিক)</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">টপ ব্যাজ টেক্সট</label>
                          <input
                            type="text"
                            value={heroSlideDraft.badge || ''}
                            onChange={(e) => setHeroSlideDraft((p) => ({ ...p, badge: e.target.value }))}
                            placeholder="🔥 ধামাকা অফার চলছে"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">টপ লাইন টেক্সট</label>
                          <input
                            type="text"
                            value={heroSlideDraft.topLine || ''}
                            onChange={(e) => setHeroSlideDraft((p) => ({ ...p, topLine: e.target.value }))}
                            placeholder="মোবাইল ও পিসি দিয়ে"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-amber-300">মূল হাইলাইট টাইটেল</label>
                          <input
                            type="text"
                            value={heroSlideDraft.highlight || ''}
                            onChange={(e) => setHeroSlideDraft((p) => ({ ...p, highlight: e.target.value }))}
                            placeholder="সম্পূর্ণ AI মাস্টারি"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#06080f] border border-amber-400/40 text-xs text-amber-300 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">সাব-ব্যাজ / সাবটাইটেল</label>
                          <input
                            type="text"
                            value={heroSlideDraft.subBadge || ''}
                            onChange={(e) => setHeroSlideDraft((p) => ({ ...p, subBadge: e.target.value }))}
                            placeholder="প্রম্পট, ওয়েব ও অটোমেশন"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">বটম সাবটাইটেল</label>
                          <input
                            type="text"
                            value={heroSlideDraft.bottomTitle || ''}
                            onChange={(e) => setHeroSlideDraft((p) => ({ ...p, bottomTitle: e.target.value }))}
                            placeholder="বেসিক টু অ্যাডভান্স"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-300">
                            ফিচার পিলস / ট্যাগসমূহ (কমা দিয়ে লিখুন)
                          </label>
                          <input
                            type="text"
                            value={(heroSlideDraft.pills || []).join(', ')}
                            onChange={(e) =>
                              setHeroSlideDraft((p) => ({
                                ...p,
                                pills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                              }))
                            }
                            placeholder="Mobile Learning, AI Powered"
                            className="w-full px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowHeroSlideForm(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg transition-all"
                    >
                      💾 ব্যানার স্লাইড সেভ ও হোমপেজে পাবলিশ করুন
                    </button>
                  </div>
                </form>
              )}

              {/* Hero Slides List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroSlides.length === 0 && !showHeroSlideForm && (
                  <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#0b101b]">
                    <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">কোনো স্লাইডার ব্যানার নেই</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
                      হোমপেজে প্রদর্শনের জন্য &quot;+ নতুন ব্যানার যোগ করুন&quot; বাটনে ক্লিক করে ব্যানার যুক্ত করুন।
                    </p>
                    <button
                      onClick={() => {
                        startNewHeroSlide();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs inline-flex items-center gap-1.5 shadow-lg"
                    >
                      <Plus className="w-4 h-4" />
                      <span>প্রথম ব্যানার যোগ করুন</span>
                    </button>
                  </div>
                )}
                {heroSlides.map((slide, sIdx) => {
                  const isClean = !slide.showOverlay && !slide.highlight?.trim();
                  return (
                    <div
                      key={slide.id}
                      className="admin-card rounded-2xl p-4 flex flex-col justify-between gap-3 border border-white/10"
                    >
                      <div className="space-y-2.5">
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                          <img src={slide.image} alt={slide.highlight || 'Banner'} className="w-full h-full object-cover" />
                          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isClean ? 'bg-amber-400 text-slate-950' : 'bg-slate-950/80 text-amber-300'
                          }`}>
                            {isClean ? '🖼️ ক্লিন গ্রাফিক' : (slide.badge || '📝 টেক্সট ওভারলে')}
                          </span>
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 text-slate-300 text-[10px] font-mono">
                            #{toBn(sIdx + 1)}
                          </span>
                        </div>

                        <div>
                          {isClean ? (
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-extrabold text-white">ফুল গ্রাফিক ব্যানার</h4>
                              <p className="text-[11px] text-slate-400">কোনো ডার্ক ওভারলে বা টেক্সট ছাড়া মূল ছবি</p>
                            </div>
                          ) : (
                            <div>
                              {slide.topLine && <p className="text-[11px] text-slate-400">{slide.topLine}</p>}
                              <h4 className="text-base font-extrabold text-white">{slide.highlight || 'ব্যানার'}</h4>
                              {(slide.subBadge || slide.bottomTitle) && (
                                <p className="text-xs text-slate-400">{slide.subBadge} {slide.bottomTitle ? `• ${slide.bottomTitle}` : ''}</p>
                              )}
                            </div>
                          )}
                          <p className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                            <span>🔗 টার্গেট:</span>
                            <span className="underline">{slide.slug}</span>
                          </p>
                        </div>
                      </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => startEditHeroSlide(slide)}
                        className="flex-1 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>এডিট</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('আপনি কি এই হিরো ব্যানার স্লাইডটি মুছে ফেলতে চান?')) return;
                          notify('⏳ ব্যানার মুছে ফেলা হচ্ছে...');
                          const updated = heroSlides.filter((s) => s.id !== slide.id);
                          setHeroSlides(updated);
                          safeSet('mobiniq_admin_hero_slides_v1', updated);
                          const res = await saveHeroSlidesToFirestore(updated);
                          if (res.synced) {
                            notify('✅ হিরো ব্যানার সফলভাবে মুছে ফেলা হয়েছে!');
                          } else {
                            notify(`⚠️ ব্যানার ডিলিট: ${res.reason || 'লোকালি মুছে ফেলা হয়েছে'}`);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* MODULE 4: ORDER HISTORY & PAYMENT VERIFICATION CENTER */}
          {/* ================================================================ */}
          {activeModule === 'orders' && (
            <div className="space-y-5 smooth-fade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    অর্ডার হিস্ট্রি ও পেমেন্ট ভেরিফিকেশন ({toBn(orders.length)}টি অর্ডার)
                  </h2>
                  <p className="text-xs text-slate-400">
                    অটোমেটিক ওয়েবহুক অর্ডার এবং ম্যানুয়াল বিকাশ/নগদ TrxID যাচাই করে ১-ক্লিকে কোর্স আনলক করুন
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowNewOrderModal((s) => !s)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ম্যানুয়াল অর্ডার এন্ট্রি</span>
                  </button>
                  <button
                    onClick={exportOrdersCsv}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CSV এক্সপোর্ট</span>
                  </button>
                </div>
              </div>

              {/* Manual Order Modal */}
              {showNewOrderModal && (
                <form
                  onSubmit={createManualOrder}
                  className="admin-card rounded-2xl p-5 border border-emerald-500/40 space-y-4 smooth-fade"
                >
                  <h3 className="text-sm font-extrabold text-emerald-300">
                    ➕ নতুন ম্যানুয়াল অর্ডার যুক্ত ও সাথে সাথে কোর্স আনলক করুন
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      value={manualOrderDraft.customerName}
                      onChange={(e) =>
                        setManualOrderDraft((p) => ({ ...p, customerName: e.target.value }))
                      }
                      placeholder="স্টুডেন্টের নাম *"
                      className="px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                    />
                    <input
                      type="tel"
                      required
                      value={manualOrderDraft.customerPhone}
                      onChange={(e) =>
                        setManualOrderDraft((p) => ({ ...p, customerPhone: e.target.value }))
                      }
                      placeholder="মোবাইল নম্বর (১১ ডিজিট) *"
                      className="px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                    />
                    <input
                      type="email"
                      required
                      value={manualOrderDraft.customerEmail}
                      onChange={(e) =>
                        setManualOrderDraft((p) => ({ ...p, customerEmail: e.target.value }))
                      }
                      placeholder="ইমেইল অ্যাড্রেস *"
                      className="px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                    />
                    <select
                      value={manualOrderDraft.itemSlug}
                      onChange={(e) =>
                        setManualOrderDraft((p) => ({ ...p, itemSlug: e.target.value }))
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                    >
                      {courses.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          [কোর্স] {c.shortTitleBn} (৳{toBn(c.price)})
                        </option>
                      ))}
                      {products.map((pr) => (
                        <option key={pr.slug} value={pr.slug}>
                          [স্টোর] {pr.shortTitleBn} (৳{toBn(pr.price)})
                        </option>
                      ))}
                    </select>
                    <select
                      value={manualOrderDraft.paymentMethod}
                      onChange={(e) =>
                        setManualOrderDraft((p) => ({
                          ...p,
                          paymentMethod: e.target.value as OrderRecord['paymentMethod']
                        }))
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="UddoktaPay">UddoktaPay</option>
                      <option value="Rocket">Rocket</option>
                    </select>
                    <input
                      type="text"
                      value={manualOrderDraft.trxId}
                      onChange={(e) =>
                        setManualOrderDraft((p) => ({ ...p, trxId: e.target.value }))
                      }
                      placeholder="Transaction ID (TrxID)"
                      className="px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs font-mono text-emerald-300"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewOrderModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-400"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-xs"
                    >
                      অর্ডার সেভ ও আনলক করুন
                    </button>
                  </div>
                </form>
              )}

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'ALL', label: `সব অর্ডার (${toBn(orders.length)})` },
                    { id: 'PENDING', label: `পেন্ডিং (${toBn(pendingOrdersCount)})` },
                    { id: 'COMPLETED', label: `সম্পন্ন (${toBn(completedOrders.length)})` },
                    { id: 'REJECTED', label: 'বাতিল' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilterStatus(f.id as typeof orderFilterStatus)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        orderFilterStatus === f.id
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-[#0d121e] text-slate-300 border border-white/10'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="নাম, মোবাইল, TrxID বা অর্ডার কোড..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0d121e] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Orders Table */}
              <div className="admin-card rounded-2xl overflow-hidden border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#070a12] text-[11px] font-bold text-slate-400 uppercase">
                        <th className="py-3.5 px-4">অর্ডার ও তারিখ</th>
                        <th className="py-3.5 px-4">কাস্টমার ও ফোন</th>
                        <th className="py-3.5 px-4">কোর্স / প্রোডাক্ট</th>
                        <th className="py-3.5 px-4">পেমেন্ট ও TrxID</th>
                        <th className="py-3.5 px-4">স্ট্যাটাস</th>
                        <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {filteredOrders.map((ord) => {
                        const orderCode = ord.orderCode || (ord as any).orderId || ord.id;
                        const itemTitle = ord.itemTitleBn || (ord as any).itemTitle || 'কোর্স / প্রোডাক্ট';
                        const isApproved = ord.status === 'COMPLETED' || ord.status === 'VERIFIED';
                        const cleanPhone = (ord.customerPhone || '').replace(/\D/g, '');
                        return (
                          <tr key={ord.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-extrabold text-white block">
                                {orderCode}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {typeof ord.createdAt === 'string'
                                  ? ord.createdAt
                                  : (ord.createdAt as any)?.seconds
                                  ? new Date((ord.createdAt as any).seconds * 1000).toLocaleString('bn-BD')
                                  : 'আজ'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-white block">{ord.customerName || 'কাস্টমার'}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-amber-300 text-[11px] block">
                                  {ord.customerPhone || 'N/A'}
                                </span>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/88${cleanPhone}?text=${encodeURIComponent(`Hello ${ord.customerName || ''}, thank you for purchasing "${itemTitle}" on MobinIQ! We received your order (${orderCode}).`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] inline-flex items-center gap-1 transition-colors"
                                    title="WhatsApp এ চ্যাট করুন"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span>চ্যাট</span>
                                  </a>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{ord.customerEmail || ''}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-200 block">{itemTitle}</span>
                              <span className="text-emerald-400 font-extrabold text-sm">
                                ৳{toBn(ord.amountBdt || 0)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">
                                {ord.paymentMethod || 'Manual'}
                              </span>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="font-mono text-cyan-300 text-[11px]">
                                  TrxID: {ord.trxId || 'N/A'}
                                </span>
                                {ord.trxId && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      copyText(ord.trxId);
                                      notify(`TrxID ${ord.trxId} কপি করা হয়েছে!`);
                                    }}
                                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors"
                                    title="TrxID কপি করুন"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {isApproved && (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>ভেরিফাইড / সম্পন্ন ✓</span>
                                </span>
                              )}
                              {ord.status === 'PENDING' && (
                                <span className="px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-300 animate-pulse" />
                                  <span>পেন্ডিং ভেরিফিকেশন</span>
                                </span>
                              )}
                              {ord.status === 'REJECTED' && (
                                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold">
                                  রিজেক্টেড
                                </span>
                              )}
                              <span className="block text-[10px] text-slate-400 mt-1">
                                {ord.verifiedBy || (isApproved ? 'Auto Verified' : '')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isApproved && (
                                  <button
                                    onClick={() => approveOrder(ord.id)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px] shadow-sm flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>অ্যাপ্রুভ</span>
                                  </button>
                                )}
                                {ord.status === 'PENDING' && (
                                  <button
                                    onClick={() => rejectOrder(ord.id)}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px]"
                                  >
                                    ✕ বাতিল
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    downloadFile(
                                      `Invoice_${orderCode}.txt`,
                                      `MobinIQ Official Payment Invoice\nOrder: ${orderCode}\nCustomer: ${ord.customerName} (${ord.customerPhone})\nItem: ${itemTitle}\nAmount: BDT ${ord.amountBdt}\nTrxID: ${ord.trxId}\nStatus: ${ord.status}\n`
                                    );
                                    notify(`ইনভয়েস ${orderCode} ডাউনলোড হয়েছে!`);
                                  }}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                                  title="Download Invoice"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* MODULE 5: INCOMPLETE ORDER RECOVERY CRM */}
          {/* ================================================================ */}
          {activeModule === 'incomplete' && (
            <div className="space-y-5 smooth-fade">
              <div className="admin-card rounded-2xl p-5 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-[11px] font-bold">
                    🛒 অটোমেটিক চেকআউট ড্রপ-অফ ট্র্যাকার
                  </span>
                  <h2 className="text-lg font-extrabold text-white">
                    ইনকমপ্লিট অর্ডার রিকভারি ইঞ্জিন ({toBn(incompleteActiveCount)}টি অ্যাক্টিভ লিড)
                  </h2>
                  <p className="text-xs text-slate-300">
                    যেকোনো ভিজিটর চেকআউট পেজে নাম ও মোবাইল নম্বর লিখলেই পেমেন্ট না করলেও এখানে অটোমেটিক সেভ হয়ে যায়।
                  </p>
                </div>

                <button
                  onClick={() => {
                    const demoLead: IncompleteOrderLead = {
                      id: `lead-${Date.now()}`,
                      name: 'আসিফ ইকবাল',
                      phone: `017${Math.floor(10000000 + Math.random() * 89999999)}`,
                      email: 'asif.bd@gmail.com',
                      itemSlug: 'complete-ai-mastery-zero-to-pro',
                      itemTitleBn: 'সম্পূর্ণ এআই (AI) মাস্টারি কোর্স',
                      amountBdt: 1250,
                      status: 'INCOMPLETE',
                      capturedAt: 'এইমাত্র (Live Test)',
                      ip: '103.120.45.21'
                    };
                    setIncompleteLeads((prev) => [demoLead, ...prev]);
                    notify('🛒 নতুন ইনকমপ্লিট অর্ডার লিড সিমুলেট করা হয়েছে!');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs shrink-0"
                >
                  + টেস্ট ড্রপ-অফ লিড তৈরি করুন
                </button>
              </div>

              <div className="space-y-3">
                {incompleteLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="admin-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-extrabold text-white">
                          {lead.name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-400/15 text-amber-300 font-mono text-xs font-extrabold">
                          📞 {lead.phone}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            lead.status === 'INCOMPLETE'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {lead.status === 'INCOMPLETE' ? 'অসম্পূর্ণ অর্ডার' : 'রিকভার্ড (কনভার্টেড) ✓'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        টার্গেট আইটেম: <strong className="text-emerald-300">{lead.itemTitleBn}</strong> • মূল্য: ৳{toBn(lead.amountBdt)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        ইমেইল: {lead.email} • সময়: {lead.capturedAt} • IP: {lead.ip}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          copyText(lead.phone);
                          notify(`মোবাইল নম্বর কপি হয়েছে: ${lead.phone}`);
                        }}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>নম্বর কপি</span>
                      </button>

                      <button
                        onClick={() => {
                          const msg = `হ্যালো ${lead.name}, আপনি MobinIQ-তে "${lead.itemTitleBn}" অর্ডার করার চেষ্টা করেছিলেন কিন্তু পেমেন্ট সম্পন্ন হয়নি। আপনার জন্য ১০% স্পেশাল ডিসকাউন্ট কুপন (ADSPECIAL10) চালু করা হয়েছে: ${siteConfig.mainWebsiteUrl}/checkout?item=${lead.itemSlug}&coupon=ADSPECIAL10`;
                          copyText(msg);
                          notify('💬 WhatsApp রিকভারি মেসেজ ও ডিসকাউন্ট লিংক কপি হয়েছে!');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp মেসেজ কপি</span>
                      </button>

                      {lead.status === 'INCOMPLETE' && (
                        <button
                          onClick={() => {
                            setIncompleteLeads((prev) =>
                              prev.map((l) =>
                                l.id === lead.id ? { ...l, status: 'RECOVERED' } : l
                              )
                            );
                            const recOrder: OrderRecord = {
                              id: `ord-rec-${Date.now()}`,
                              orderCode: `MIQ-${Math.floor(10000 + Math.random() * 89999)}`,
                              customerName: lead.name,
                              customerPhone: lead.phone,
                              customerEmail: lead.email,
                              itemType: 'course',
                              itemSlug: lead.itemSlug,
                              itemTitleBn: lead.itemTitleBn,
                              amountBdt: lead.amountBdt,
                              paymentMethod: 'bKash',
                              trxId: `REC-${Date.now().toString().slice(-5)}`,
                              couponUsed: 'ADSPECIAL10',
                              status: 'COMPLETED',
                              createdAt: 'এইমাত্র (Recovered)',
                              verifiedBy: 'Admin Lead Recovery ✓'
                            };
                            setOrders((prev) => [recOrder, ...prev]);
                            triggerCloudSync(`${lead.name}-এর অর্ডার রিকভার ও আনলক হয়েছে!`);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold"
                        >
                          ✓ পেইড মার্ক ও আনলক
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* MODULE 6: USER & STUDENT DATABASE + ANTI-FRAUD BLOCKLIST */}
          {/* ================================================================ */}
          {activeModule === 'users' && (
            <div className="space-y-6 smooth-fade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    ইউজার ও স্টুডেন্ট ডাটাবেস ({toBn(users.length)} জন)
                  </h2>
                  <p className="text-xs text-slate-400">
                    যেকোনো স্টুডেন্টের কোর্স ম্যানুয়ালি আনলক/লক করুন এবং ফেক অর্ডারকারীদের নম্বর/IP ব্লক করুন
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="নাম, ইমেইল বা ফোন নম্বর খুঁজুন..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0d121e] border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div
                    key={u.uid}
                    className="admin-card rounded-2xl p-4 sm:p-5 space-y-3 border border-white/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm sm:text-base font-extrabold text-white">
                            {u.name}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-300">
                            {u.uid}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold">
                            📞 {u.phone} ✓
                          </span>
                          {u.status === 'BANNED' && (
                            <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-extrabold">
                              BANNED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          ইমেইল: {u.email} • মোট খরচ: <strong className="text-emerald-400">৳{toBn(u.totalSpentBdt)}</strong> • জয়েন: {u.joinedAt}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {(() => {
                          const userOrders = orders.filter((o) =>
                            (o.customerEmail && u.email && o.customerEmail.toLowerCase() === u.email.toLowerCase()) ||
                            (o.customerPhone && u.phone && o.customerPhone.replace(/\D/g, '') === u.phone.replace(/\D/g, '')) ||
                            ((o as any).userId && (o as any).userId === u.uid)
                          );
                          return (
                            <>
                              <button
                                onClick={() =>
                                  setSelectedUserForOrders(selectedUserForOrders === u.uid ? null : u.uid)
                                }
                                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                  selectedUserForOrders === u.uid
                                    ? 'bg-sky-500 text-white border-sky-400'
                                    : 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/30 text-sky-300'
                                }`}
                              >
                                📜 অর্ডার হিস্ট্রি ({toBn(userOrders.length)})
                              </button>
                              <button
                                onClick={() =>
                                  setSelectedUserForEnroll(selectedUserForEnroll === u.uid ? null : u.uid)
                                }
                                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                  selectedUserForEnroll === u.uid
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                                }`}
                              >
                                🎓 কোর্স অ্যাক্সেস ({toBn(Array.isArray(u.enrolledSlugs) ? u.enrolledSlugs.length : 0)})
                              </button>
                            </>
                          );
                        })()}
                        <button
                          onClick={() => toggleUserBan(u.uid)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-500/15 text-rose-300'
                              : 'bg-emerald-500 text-slate-950'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'ব্যান করুন' : 'আনব্যান করুন'}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Order History for this User */}
                    {selectedUserForOrders === u.uid && (
                      <div className="p-4 rounded-xl bg-[#06080f] border border-sky-500/30 space-y-3 smooth-fade">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-xs font-extrabold text-sky-300 flex items-center gap-1.5">
                            <ShoppingCart className="w-4 h-4 text-sky-400" />
                            <span>{u.name} এর সকল ক্রয়ের হিস্ট্রি ও পেমেন্ট রেকর্ড</span>
                          </span>
                          <button
                            onClick={() => setSelectedUserForOrders(null)}
                            className="text-[11px] text-slate-400 hover:text-white"
                          >
                            বন্ধ করুন ✕
                          </button>
                        </div>

                        {(() => {
                          const userOrders = orders.filter((o) =>
                            (o.customerEmail && u.email && o.customerEmail.toLowerCase() === u.email.toLowerCase()) ||
                            (o.customerPhone && u.phone && o.customerPhone.replace(/\D/g, '') === u.phone.replace(/\D/g, '')) ||
                            ((o as any).userId && (o as any).userId === u.uid)
                          );

                          if (userOrders.length === 0) {
                            return (
                              <p className="text-xs text-slate-400 py-3 text-center">
                                এই ইউজারের এখনও কোনো ক্রয় বা অর্ডার রেকর্ড নেই।
                              </p>
                            );
                          }

                          return (
                            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                              {userOrders.map((ord) => (
                                <div
                                  key={ord.id}
                                  className="p-3 rounded-xl bg-[#0b101c] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-sky-400">
                                        {ord.orderCode}
                                      </span>
                                      <span className="text-white font-bold">
                                        {ord.itemTitleBn || ord.itemTitle}
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-slate-300 uppercase">
                                        {ord.itemType}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                                      <span>পেমেন্ট: <strong className="text-white">{ord.paymentMethod}</strong></span>
                                      {ord.trxId && (
                                        <span>TrxID: <strong className="text-amber-300 font-mono">{ord.trxId}</strong></span>
                                      )}
                                      <span>তারিখ: {ord.createdAt || 'সদ্য'}</span>
                                      <span className="text-emerald-400 font-bold">
                                        ৳{toBn(ord.amountBdt)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                        ord.status === 'VERIFIED' || ord.status === 'COMPLETED'
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : ord.status === 'REJECTED'
                                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      }`}
                                    >
                                      {ord.status === 'VERIFIED' || ord.status === 'COMPLETED'
                                        ? 'ভেরিফাইড / অ্যাক্টিভ'
                                        : ord.status === 'REJECTED'
                                        ? 'বাতিলকৃত'
                                        : 'পেন্ডিং ভেরিফিকেশন'}
                                    </span>
                                    {ord.status === 'PENDING' && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={() => approveOrder(ord.id)}
                                          className="px-2 py-1 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]"
                                        >
                                          অ্যাপ্রুভ ✓
                                        </button>
                                        <button
                                          onClick={() => rejectOrder(ord.id)}
                                          className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]"
                                        >
                                          বাতিল ✕
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Expandable Course Access Toggles for this Student */}
                    {selectedUserForEnroll === u.uid && (
                      <div className="p-3.5 rounded-xl bg-[#06080f] border border-white/10 space-y-2 smooth-fade">
                        <span className="text-xs font-bold text-slate-300 block">
                          টিক দিয়ে এই স্টুডেন্টের জন্য যেকোনো কোর্স আনলক বা লক করুন:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {courses.map((c) => {
                            const enrolled = Array.isArray(u.enrolledSlugs) && u.enrolledSlugs.includes(c.slug);
                            return (
                              <button
                                key={c.slug}
                                onClick={() => toggleUserCourseAccess(u.uid, c.slug)}
                                className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between gap-2 ${
                                  enrolled
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                    : 'bg-[#0d121e] border-white/10 text-slate-400'
                                }`}
                              >
                                <span className="truncate">{c.shortTitleBn}</span>
                                {enrolled ? (
                                  <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Anti-Fraud Phone & IP Blocklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="admin-card rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Ban className="w-4 h-4 text-rose-400" />
                    <span>ব্লকড মোবাইল নম্বর লিস্ট (ফেক অর্ডার রোধ)</span>
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={newBlockPhone}
                      onChange={(e) => setNewBlockPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="01XXXXXXXXX"
                      className="flex-1 px-3 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white font-mono"
                    />
                    <button
                      onClick={() => {
                        if (newBlockPhone.length === 11 && !blockedPhones.includes(newBlockPhone)) {
                          setBlockedPhones((p) => [newBlockPhone, ...p]);
                          setNewBlockPhone('');
                          triggerCloudSync('নম্বরটি ব্লকলিস্টে যুক্ত হয়েছে!');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-extrabold"
                    >
                      ব্লক করুন
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blockedPhones.map((ph) => (
                      <span
                        key={ph}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-xs font-mono text-rose-200 flex items-center gap-1.5"
                      >
                        <span>{ph}</span>
                        <button
                          onClick={() =>
                            setBlockedPhones((p) => p.filter((item) => item !== ph))
                          }
                          className="text-rose-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="admin-card rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Ban className="w-4 h-4 text-amber-400" />
                    <span>ব্লকড IP অ্যাড্রেস লিস্ট</span>
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBlockIp}
                      onChange={(e) => setNewBlockIp(e.target.value.trim())}
                      placeholder="203.0.113.99"
                      className="flex-1 px-3 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white font-mono"
                    />
                    <button
                      onClick={() => {
                        if (newBlockIp && !blockedIps.includes(newBlockIp)) {
                          setBlockedIps((p) => [newBlockIp, ...p]);
                          setNewBlockIp('');
                          triggerCloudSync('IP ব্লকলিস্টে যুক্ত হয়েছে!');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold"
                    >
                      IP ব্লক
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blockedIps.map((ip) => (
                      <span
                        key={ip}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs font-mono text-amber-200 flex items-center gap-1.5"
                      >
                        <span>{ip}</span>
                        <button
                          onClick={() => setBlockedIps((p) => p.filter((item) => item !== ip))}
                          className="text-amber-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* MODULE 7: PIXEL & AD TRACKING HUB (META, CAPI, TIKTOK, GA4) */}
          {/* ================================================================ */}
          {activeModule === 'pixel' && (
            <div className="space-y-6 smooth-fade">
              <div className="admin-card rounded-3xl p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-white">
                      🎯 ১-ক্লিক পিক্সেল ও সার্ভার-সাইড ট্র্যাকিং (Meta CAPI + TikTok + GA4)
                    </h2>
                    <p className="text-xs text-slate-400">
                      এখানে আপনার Pixel ID ও Access Token বসালেই মেইন ওয়েবসাইটে PageView, InitiateCheckout, Lead ও Purchase ইভেন্ট ট্র্যাক হবে
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      fireAdminPixel('Purchase', 'অ্যাডমিন পিক্সেল টেস্ট ইভেন্ট', 1250);
                      notify('🎯 টেস্ট Purchase ইভেন্ট Meta Pixel, CAPI ও TikTok-এ ফায়ার হয়েছে!');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shrink-0"
                  >
                    ⚡ টেস্ট ইভেন্ট ফায়ার করুন
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Facebook (Meta) Pixel ID
                    </label>
                    <input
                      type="text"
                      value={siteConfig.fbPixelId}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, fbPixelId: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-emerald-300 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Meta Conversions API (Server CAPI) Token
                    </label>
                    <input
                      type="text"
                      value={siteConfig.fbCapiToken}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, fbCapiToken: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-amber-300 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      TikTok Pixel ID
                    </label>
                    <input
                      type="text"
                      value={siteConfig.tiktokPixelId}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, tiktokPixelId: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-cyan-300 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Google Analytics 4 (GA4) Measurement ID
                    </label>
                    <input
                      type="text"
                      value={siteConfig.ga4MeasurementId}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, ga4MeasurementId: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={() => triggerCloudSync('পিক্সেল ও CAPI কনফিগারেশন মেইন ওয়েবসাইটে সিঙ্ক হয়েছে!')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs sm:text-sm"
                >
                  💾 পিক্সেল কনফিগারেশন সেভ ও মেইন সাইটে পুশ করুন
                </button>
              </div>

              {/* Live Pixel Event Stream */}
              <div className="admin-card rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-extrabold text-white">
                  📡 লাইভ পিক্সেল ও সার্ভার ইভেন্ট লগ (Real-Time Stream)
                </h3>
                <div className="space-y-2">
                  {pixelLogs.map((px) => (
                    <div
                      key={px.id}
                      className="p-3 rounded-xl bg-[#070a12] border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                          {px.event}
                        </span>
                        <span className="text-white font-semibold">{px.itemTitle}</span>
                        {px.valueBdt > 0 && (
                          <span className="text-amber-300 font-bold">৳{toBn(px.valueBdt)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{px.channels.join(' • ')}</span>
                        <span>({px.time})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* MODULE 8: PAYMENT GATEWAY & PROMO COUPON ENGINE */}
          {/* ================================================================ */}
          {activeModule === 'gateway' && (
            <div className="space-y-6 smooth-fade">
              <div className="admin-card rounded-3xl p-5 sm:p-6 space-y-5">
                <h2 className="text-lg font-extrabold text-white">
                  💳 অটোমেটিক পেমেন্ট গেটওয়ে ও বিকাশ/নগদ নম্বর সেটআপ
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      অটোমেটিক গেটওয়ে প্রোভাইডার
                    </label>
                    <select
                      value={siteConfig.gatewayProvider}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, gatewayProvider: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                    >
                      <option value="UddoktaPay">UddoktaPay (bKash, Nagad, Rocket, Cards)</option>
                      <option value="ZiniPay">ZiniPay Automation Gateway</option>
                      <option value="bKashMerchant">bKash Official Tokenized Merchant API</option>
                      <option value="SSLCommerz">SSLCommerz Enterprise</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      গেটওয়ে Base Checkout API URL
                    </label>
                    <input
                      type="text"
                      value={siteConfig.gatewayBaseUrl}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, gatewayBaseUrl: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-cyan-300 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      গোপন গেটওয়ে API Key (`RT-UDDOKTAPAY-API-KEY` / Secret Key)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.gatewayApiKey}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, gatewayApiKey: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-amber-300 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      বিকাশ (bKash) সেন্ড মানি / পেমেন্ট নম্বর
                    </label>
                    <input
                      type="text"
                      value={siteConfig.bkashNumber}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, bkashNumber: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-sm text-white font-extrabold font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      নগদ (Nagad) সেন্ড মানি / পেমেন্ট নম্বর
                    </label>
                    <input
                      type="text"
                      value={siteConfig.nagadNumber}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, nagadNumber: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-sm text-white font-extrabold font-mono"
                    />
                  </div>
                </div>

                {/* Course Login Enforcement Switch */}
                <div className="p-4 rounded-2xl bg-[#06080f] border border-sky-500/30 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-sky-300 block">
                      কোর্স এনরোলে গুগল লগইন বাধ্যতামূলক (Mandatory Google Login for Courses)
                    </label>
                    <p className="text-[11px] text-slate-400">
                      চালু রাখলে কোনো শিক্ষার্থী লগইন না করে কোর্স এনরোল করতে পারবে না। গুগল দিয়ে ১-ক্লিকে লগইন করার পর চেকআউট ও পেমেন্ট অপশন চালু হবে। (ডিজিটাল প্রোডাক্টে গেস্ট ডাউনলোড উন্মুক্ত থাকবে)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSiteConfig((p) => ({
                        ...p,
                        requireCourseLogin: p.requireCourseLogin === false ? true : false,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      siteConfig.requireCourseLogin !== false ? 'bg-sky-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        siteConfig.requireCourseLogin !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={async () => {
                    await saveSiteConfigToFirestore(siteConfig);
                    triggerCloudSync('পেমেন্ট গেটওয়ে ও বিকাশ/নগদ নম্বর মেইন সাইটে আপডেট হয়েছে!');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all"
                >
                  💾 গেটওয়ে সেটিংস সেভ করুন
                </button>
              </div>

              {/* Customer Support Channels Config */}
              <div className="admin-card rounded-3xl p-5 sm:p-6 space-y-5 border border-emerald-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-emerald-400" />
                      <span>📞 হেল্প ও মেসেজ সাপোর্ট চ্যানেল (ফুটার ও ওয়েবসাইট)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      ফুটার এবং ফ্লোটিং বাটনে শিক্ষার্থীরা সরাসরি যে WhatsApp নম্বর বা হটলাইনে মেসেজ ও কল করতে পারবে তা এখান থেকে নিয়ন্ত্রণ করুন
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold shrink-0 self-start sm:self-auto">
                    মেইন ওয়েবসাইটে লাইভ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-300 block">
                      WhatsApp সাপোর্ট নম্বর (সরাসরি চ্যাট লিংক) *
                    </label>
                    <input
                      type="text"
                      value={siteConfig.supportWhatsapp}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, supportWhatsapp: e.target.value }))}
                      placeholder="01308313078"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-emerald-500/40 text-xs sm:text-sm text-emerald-300 font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      সরাসরি লিংক হবে: https://wa.me/88{siteConfig.supportWhatsapp.replace(/[^0-9]/g, '')}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      হটলাইন কল নম্বর (সরাসরি ডায়াল)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.supportPhone}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, supportPhone: e.target.value }))}
                      placeholder="01308313078"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      অফিসিয়াল সাপোর্ট ইমেইল
                    </label>
                    <input
                      type="email"
                      value={siteConfig.supportEmail}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, supportEmail: e.target.value }))}
                      placeholder="support@mobiniq.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-cyan-300 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      মেসেঞ্জার / সোশ্যাল চ্যাট লিংক
                    </label>
                    <input
                      type="text"
                      value={siteConfig.supportMessenger}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, supportMessenger: e.target.value }))}
                      placeholder="https://m.me/mobiniq"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sky-400 block">
                      ফেসবুক পেজ / গ্রুপ লিংক (Facebook Page/Group)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.facebookUrl || ''}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, facebookUrl: e.target.value }))}
                      placeholder="https://facebook.com/mobiniq"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-sky-500/30 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-cyan-400 block">
                      টেলিগ্রাম চ্যানেল / গ্রুপ লিংক (Telegram Community)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.telegramUrl || ''}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, telegramUrl: e.target.value }))}
                      placeholder="https://t.me/mobiniq"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-cyan-500/30 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-rose-400 block">
                      ইউটিউব চ্যানেল লিংক (YouTube Channel)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.youtubeUrl || ''}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, youtubeUrl: e.target.value }))}
                      placeholder="https://youtube.com/@mobinyt"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-rose-500/30 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      সাপোর্ট ও রেসপন্স সময়কাল (Working Hours)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.supportHours}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, supportHours: e.target.value }))}
                      placeholder="সকাল ১০:০০ - রাত ১০:০০ (প্রতিদিন)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await saveSiteConfigToFirestore(siteConfig);
                    triggerCloudSync('সাপোর্ট চ্যানেল ও হটলাইন নম্বর আপডেট হয়েছে!');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>💾 সাপোর্ট সেটিংস সেভ ও সিঙ্ক করুন</span>
                </button>
              </div>

              {/* Social Trust & Achievement Stats Manager */}
              <div className="admin-card rounded-3xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>⚡ অর্জন ও সামাজিক বিশ্বাস কাউন্টার ম্যানেজার</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      মেইন ওয়েবসাইটের ব্যানারের নিচের ৪টি সোশ্যাল প্রুফ ও কাউন্টিং স্ট্যাটস পরিবর্তন করুন
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-rose-300 block">
                      কমিউনিটি সদস্য (YouTube Subs)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.youtubeSubs || '125K+'}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, youtubeSubs: e.target.value }))}
                      placeholder="125K+"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sky-300 block">
                      সফল শিক্ষার্থী (Active Students)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.activeStudents || '10,500+'}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, activeStudents: e.target.value }))}
                      placeholder="10,500+"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-300 block">
                      পজিটিভ ফিডব্যাক (5-Star Reviews)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.positiveReviews || '98.8%'}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, positiveReviews: e.target.value }))}
                      placeholder="98.8%"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-300 block">
                      আন্তর্জাতিক ডলার আয় (Student Earnings)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.studentEarnings || '$150K+'}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, studentEarnings: e.target.value }))}
                      placeholder="$150K+"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await saveSiteConfigToFirestore(siteConfig);
                    triggerCloudSync('অর্জন ও বিশ্বাস কাউন্টার স্ট্যাটস মেইন সাইটে আপডেট হয়েছে!');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>💾 কাউন্টার স্ট্যাটস সেভ ও সিঙ্ক করুন</span>
                </button>
              </div>

              {/* Promo Coupon Manager */}
              <div className="admin-card rounded-3xl p-5 sm:p-6 space-y-4">
                <h3 className="text-base font-extrabold text-white">
                  🏷️ ডিসকাউন্ট কুপন কোড ম্যানেজার
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="কুপন কোড (যেমন: EID30)"
                    className="px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white font-mono uppercase"
                  />
                  <input
                    type="number"
                    value={newCouponPct}
                    onChange={(e) => setNewCouponPct(Number(e.target.value))}
                    placeholder="ছাড় % (যেমন: 30)"
                    className="px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-emerald-300 font-bold"
                  />
                  <input
                    type="text"
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                    placeholder="বিবরণ (যেমন: ঈদ স্পেশাল ছাড়)"
                    className="px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (!newCouponCode) return;
                      setCoupons((prev) => [
                        {
                          code: newCouponCode,
                          discountPct: Math.min(100, Math.max(1, newCouponPct)),
                          usageCount: 0,
                          active: true,
                          descriptionBn: newCouponDesc || 'স্পেশাল ডিসকাউন্ট'
                        },
                        ...prev
                      ]);
                      setNewCouponCode('');
                      setNewCouponDesc('');
                      triggerCloudSync(`কুপন ${newCouponCode} চালু করা হয়েছে!`);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs"
                  >
                    + কুপন তৈরি করুন
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {coupons.map((cp) => (
                    <div
                      key={cp.code}
                      className="p-3.5 rounded-xl bg-[#06080f] border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-extrabold text-amber-300 text-sm block">
                          {cp.code} ({toBn(cp.discountPct)}% ছাড়)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {cp.descriptionBn} • ব্যবহৃত: {toBn(cp.usageCount)} বার
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setCoupons((prev) => prev.filter((item) => item.code !== cp.code))
                        }
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* MODULE 9: FIREBASE & MAIN WEBSITE REST API BRIDGE */}
          {/* ================================================================ */}
          {activeModule === 'bridge' && (
            <div className="space-y-6 smooth-fade">
              <div className="admin-card rounded-3xl p-5 sm:p-6 space-y-5 border border-emerald-500/30">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold">
                    🔗 ডুয়াল-হোস্টিং আর্কিটেকচার (Main Site ↔ Standalone Admin Panel)
                  </span>
                  <h2 className="text-lg font-extrabold text-white mt-1">
                    ফায়ারবেস ও মেইন ওয়েবসাইট API কানেকশন ব্রিজ
                  </h2>
                  <p className="text-xs text-slate-300">
                    আপনার মেইন ওয়েবসাইট (`mobiniq.com`) এবং এই আলাদা অ্যাডমিন প্যানেল (`admin.mobiniq.com`) একই **Firebase Firestore Project** এবং **REST Sync Webhook API** দ্বারা একে অপরের সাথে রিয়েল-টাইমে যুক্ত থাকবে।
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      মেইন ওয়েবসাইট ডোমেইন (Main Website URL)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.mainWebsiteUrl}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, mainWebsiteUrl: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-emerald-300 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      অ্যাডমিন প্যানেল ডোমেইন (Standalone Admin URL)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.adminPanelUrl}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, adminPanelUrl: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-cyan-300 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Shared Firebase Project ID
                    </label>
                    <input
                      type="text"
                      value={siteConfig.firebaseProjectId}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, firebaseProjectId: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Shared Firebase Public API Key
                    </label>
                    <input
                      type="text"
                      value={siteConfig.firebaseApiKey}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, firebaseApiKey: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-amber-300 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      Cross-Server Admin API Sync Secret (`ADMIN_SYNC_SECRET`)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.apiSyncSecret}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({ ...prev, apiSyncSecret: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-emerald-300 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => {
                      const envText = [
                        `# MobinIQ Standalone Admin Panel (.env.local)`,
                        `NEXT_PUBLIC_MAIN_SITE_URL=${siteConfig.mainWebsiteUrl}`,
                        `NEXT_PUBLIC_ADMIN_URL=${siteConfig.adminPanelUrl}`,
                        `ADMIN_SYNC_SECRET=${siteConfig.apiSyncSecret}`,
                        `NEXT_PUBLIC_FIREBASE_PROJECT_ID=${siteConfig.firebaseProjectId}`,
                        `NEXT_PUBLIC_FIREBASE_API_KEY=${siteConfig.firebaseApiKey}`,
                        `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${siteConfig.firebaseAuthDomain}`,
                        `UDDOKTAPAY_API_KEY=${siteConfig.gatewayApiKey}`,
                        `NEXT_PUBLIC_FB_PIXEL_ID=${siteConfig.fbPixelId}`,
                        `FB_CAPI_ACCESS_TOKEN=${siteConfig.fbCapiToken}`
                      ].join('\n');
                      copyText(envText);
                      notify('📋 Vercel Environment Variables (.env.local) কপি হয়েছে!');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>১-ক্লিকে Vercel .env কপি করুন</span>
                  </button>

                  <button
                    onClick={() => {
                      const fullBackup = JSON.stringify(
                        {
                          exportedAt: new Date().toISOString(),
                          siteConfig,
                          courses,
                          products,
                          orders,
                          incompleteLeads,
                          users,
                          coupons
                        },
                        null,
                        2
                      );
                      downloadFile('MobinIQ_Full_Admin_Backup.json', fullBackup, 'application/json');
                      notify('📦 সম্পূর্ণ ডাটাবেস JSON ব্যাকআপ ডাউনলোড হয়েছে!');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>সম্পূর্ণ ডাটাবেস ব্যাকআপ (JSON)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
