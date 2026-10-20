"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  titleBn: string;
  shortTitleBn: string;
  subtitleBn: string;
  shortDescBn: string;
  price: number;
  originalPrice: number;
  thumbnailUrl: string;
  category: 'এআই অ্যান্ড অটোমেশন' | 'টেক ডকুমেন্টারি' | 'ভিডিও এডিটিং' | 'ফ্রিল্যান্সিং ও ক্যারিয়ার';
  studentsCount: string;
  rating: string;
  totalDuration: string;
  status: 'PUBLISHED' | 'DRAFT';
  featured: boolean;
  outcomes: string[];
  modules: CourseModule[];
  resources: CourseResource[];
}

export interface AdminProduct {
  id: string;
  slug: string;
  titleBn: string;
  shortTitleBn: string;
  shortDescBn: string;
  price: number;
  originalPrice: number;
  thumbnailUrl: string;
  category: 'SFX Pack' | 'Prompt Vault' | 'LUT & Presets' | 'Template & E-Book';
  rating: string;
  salesCount: string;
  fileFormat?: string;
  fileSize?: string;
  status: 'PUBLISHED' | 'DRAFT';
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
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  itemType: 'course' | 'product';
  itemSlug: string;
  itemTitleBn: string;
  amountBdt: number;
  paymentMethod: 'UddoktaPay' | 'bKash' | 'Nagad' | 'Rocket';
  trxId: string;
  couponUsed: string | null;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
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
    id: 'course-ai-complete',
    slug: 'complete-ai-mastery-zero-to-pro',
    titleBn: 'সম্পূর্ণ এআই (AI) কিভাবে শিখবো: জিরো থেকে প্রো মাস্টারক্লাস',
    shortTitleBn: 'সম্পূর্ণ এআই (AI) মাস্টারি কোর্স',
    subtitleBn: 'মোবাইল ও পিসিতে ChatGPT, Claude, প্রম্পট ইঞ্জিনিয়ারিং ও এআই অটোমেশন গাইড।',
    shortDescBn: 'একদম বেসিক থেকে শুরু করে প্রফেশনাল প্রম্পট ইঞ্জিনিয়ারিং, এআই দিয়ে কনটেন্ট রিসার্চ, ওয়েব অ্যাপ তৈরি এবং অটোমেশন ওয়ার্কফ্লো শিখুন ধাপে ধাপে।',
    price: 1250,
    originalPrice: 3000,
    thumbnailUrl: AI_COURSE_IMG,
    category: 'এআই অ্যান্ড অটোমেশন',
    studentsCount: '৪,৮৯০+',
    rating: '৪.৯',
    totalDuration: '১৬ ঘণ্টা',
    status: 'PUBLISHED',
    featured: true,
    outcomes: [
      'ChatGPT, Claude ও Gemini-এর অ্যাডভান্সড সিস্টেম প্রম্পট ইঞ্জিনিয়ারিং',
      'মোবাইল ও পিসি দিয়ে AI ওয়েবসাইট, ল্যান্ডিং পেজ ও টুল তৈরি',
      '১ ঘণ্টার ডিপ রিসার্চ ও স্ক্রিপ্ট রাইটিং মাত্র ১০ মিনিটে সম্পন্ন করার ফর্মুলা',
      'এআই ভিজ্যুয়াল, ভয়েসওভার ও নো-কোড ওয়ার্কফ্লো অটোমেশন সেটআপ'
    ],
    modules: [
      {
        id: 'mod-ai-1',
        title: 'মডিউল ১: এআই ফাউন্ডেশন ও সিস্টেম প্রম্পট ইঞ্জিনিয়ারিং',
        order: 1,
        lessons: [
          {
            id: 'les-ai-101',
            title: '১.১ [ফ্রি প্রিভিউ] সম্পূর্ণ এআই রোডম্যাপ: কীভাবে AI আপনার কাজ ১০ গুণ সহজ করবে',
            duration: '১৯:৩০',
            isPreview: true,
            videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
            summaryBn: 'বিগিনার থেকে প্রো লেভেলে এআই ব্যবহারের সঠিক মাইন্ডসেট এবং টুলস পরিচিতি।'
          },
          {
            id: 'les-ai-102',
            title: '১.২ [ফ্রি প্রিভিউ] হ্যালুসিনেশন ছাড়া ১০০% নির্ভুল আউটপুট পাওয়ার প্রম্পট ফর্মুলা',
            duration: '২৫:১০',
            isPreview: true,
            videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
            summaryBn: 'Role, Context, Constraint এবং Few-Shot ফ্রেমওয়ার্কের প্র্যাকটিক্যাল ব্যবহার।'
          }
        ]
      },
      {
        id: 'mod-ai-2',
        title: 'মডিউল ২: AI ওয়েব প্রজেক্ট, অটোমেশন ও মনিটাইজেশন',
        order: 2,
        lessons: [
          {
            id: 'les-ai-201',
            title: '২.১ কোডিং ছাড়াই AI দিয়ে প্রফেশনাল ওয়েব অ্যাপ ও ল্যান্ডিং পেজ তৈরি',
            duration: '৩৫:২০',
            isPreview: false,
            videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
            summaryBn: 'প্রম্পট দিয়ে ফুল-স্ট্যাক প্রজেক্ট তৈরি, গিটহাব ও ভার্সেলে লাইভ ডিপ্লয়মেন্ট।'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'res-ai-1',
        title: 'এআই অটোমেশন ও সিস্টেম প্রম্পট মাস্টার শিট',
        size: '28 KB',
        filename: 'MobinIQ_Complete_AI_Mastery_Prompts.txt',
        content: '# MobinIQ Complete AI Mastery Prompts\n'
      }
    ]
  },
  {
    id: 'course-doc-mastery',
    slug: 'cinematic-tech-documentary-masterclass',
    titleBn: 'সিনেমাটিক টেক ডকুমেন্টারি ও ডিপ রিসার্চ মাস্টারক্লাস',
    shortTitleBn: 'সিনেমাটিক টেক ডকুমেন্টারি ব্লুপ্রিন্ট',
    subtitleBn: 'ডিপ রিসার্চ, অ্যানালিটিক্যাল স্ক্রিপ্টিং ও ভিজ্যুয়াল স্টোরিটেলিং গাইড।',
    shortDescBn: 'আন্তর্জাতিক মানের টেক ডকুমেন্টারি তৈরি, ডেটা রিসার্চ, সাউন্ড ডিজাইন এবং রিটেনশন এডিটিং শিখুন এক কোর্সে।',
    price: 1490,
    originalPrice: 3500,
    thumbnailUrl: DOC_COURSE_IMG,
    category: 'টেক ডকুমেন্টারি',
    studentsCount: '৪,২৫০+',
    rating: '৪.৯',
    totalDuration: '১৮ ঘণ্টা',
    status: 'PUBLISHED',
    featured: true,
    outcomes: [
      'হাই-রিটেনশন ডকুমেন্টারি টপিক রিসার্চ ও ফ্যাক্ট-চেকিং',
      'প্রথম ৩০ সেকেন্ডের হুক ও ৩-অ্যাক্ট অ্যানালিটিক্যাল স্ক্রিপ্ট রাইটিং',
      'সিনেমাটিক সাউন্ড ডিজাইন, সাব-বেস ও অডিও মিক্সিং'
    ],
    modules: [
      {
        id: 'mod-doc-1',
        title: 'মডিউল ১: ডিপ রিসার্চ ও স্ক্রিপ্ট আর্কিটেকচার',
        order: 1,
        lessons: [
          {
            id: 'les-doc-101',
            title: '১.১ [ফ্রি প্রিভিউ] অ্যানালিটিক্যাল টেক ডকুমেন্টারি স্ট্রাকচার ও কেস স্টাডি',
            duration: '১৮:২০',
            isPreview: true,
            videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
            summaryBn: 'হাই-আইকিউ দর্শক ধরে রাখার স্টোরি আর্কিটেকচার এবং প্রথম ৩০ সেকেন্ডের হুক ফর্মুলা।'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'res-doc-1',
        title: 'ডকুমেন্টারি স্ক্রিপ্ট ও রিসার্চ টেমপ্লেট',
        size: '24 KB',
        filename: 'MobinIQ_Documentary_Script_Template.md',
        content: '# Mobin IQ Documentary Script Template\n'
      }
    ]
  },
  {
    id: 'course-free-editing',
    slug: 'high-retention-video-editing-fundamentals',
    titleBn: 'হাই-রিটেনশন ভিডিও এডিটিং ও ইউটিউব গ্রোথ ব্লুপ্রিন্ট',
    shortTitleBn: 'ভিডিও এডিটিং ও ইউটিউব গ্রোথ',
    subtitleBn: 'মোবাইল ও পিসিতে সিনেমাটিক কাট, স্পিড গ্রাফ ও কালার গ্রেডিং।',
    shortDescBn: 'CapCut, Premiere Pro ও After Effects-এ স্মুথ কি-ফ্রেম অ্যানিমেশন, পেসিং এবং ডার্ক সিনেমাটিক কালার গ্রেডিংয়ের প্র্যাকটিক্যাল গাইড।',
    price: 790,
    originalPrice: 1990,
    thumbnailUrl: EDIT_COURSE_IMG,
    category: 'ভিডিও এডিটিং',
    studentsCount: '৫,১২০+',
    rating: '৫.০',
    totalDuration: '১২ ঘণ্টা',
    status: 'PUBLISHED',
    featured: true,
    outcomes: [
      'ফ্রেম-পারফেক্ট J-Cut, L-Cut ও ৩-সেকেন্ড ভিজ্যুয়াল রিসেট রুল',
      'কাস্টম কি-ফ্রেম ইজিং ও স্মুথ স্পিড গ্রাফ কন্ট্রোল'
    ],
    modules: [
      {
        id: 'mod-edit-1',
        title: 'মডিউল ১: রিটেনশন পেসিং ও কি-ফ্রেম মাস্টারি',
        order: 1,
        lessons: [
          {
            id: 'les-edit-101',
            title: '১.১ [ফ্রি প্রিভিউ] দ্য রুল অব ৩ সেকেন্ডস ও ভিজ্যুয়াল ফ্লো',
            duration: '১৯:৪৫',
            isPreview: true,
            videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
            summaryBn: 'দর্শকের মনোযোগ ধরে রাখার জন্য জুম ডায়নামিক্স এবং সাউন্ড ব্রিজিংয়ের ব্যবহার।'
          }
        ]
      }
    ],
    resources: []
  }
];

const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: 'prod-sfx-pack',
    slug: 'cinematic-tech-documentary-sfx-pack',
    titleBn: '১০০+ সিনেমাটিক টেক ডকুমেন্টারি সাউন্ড এফেক্টস (SFX) প্যাক',
    shortTitleBn: '১০০+ সিনেমাটিক SFX সাউন্ড প্যাক',
    shortDescBn: 'সাব-বেস ড্রপ, ডিপ হুশ, ডেটা টেলিমেট্রি বিপ ও ডার্ক অ্যাম্বিয়েন্ট ব্যাকগ্রাউন্ড ড্রোন সাউন্ড প্যাক।',
    price: 199,
    originalPrice: 499,
    thumbnailUrl: DOC_COURSE_IMG,
    category: 'SFX Pack',
    rating: '৪.৯',
    salesCount: '১,৮৫০+',
    status: 'PUBLISHED',
    featuresBn: [
      '২৫+ ডিপ সাব-বেস হিট ও সিনেমাটিক ইমপ্যাক্টস',
      '৩০+ ডেটা টেলিমেট্রি, টেক টাইপরাইটার ও গ্লিচ সাউন্ড',
      '২৫+ স্মুথ হুশ ও টেনশন রাইজার (CapCut ও Premiere Pro রেডি)'
    ],
    downloadFilename: 'MobinIQ_100_Cinematic_SFX_Pack.txt',
    downloadContent: 'Mobin IQ 100+ Cinematic SFX Pack — Master Download Links\n'
  },
  {
    id: 'prod-prompt-vault',
    slug: '200-tested-ai-mega-prompt-vault',
    titleBn: '২০০+ টেস্টেড এআই মেগা প্রম্পট ভল্ট (ChatGPT & Claude)',
    shortTitleBn: '২০০+ এআই মেগা প্রম্পট ভল্ট',
    shortDescBn: 'স্ক্রিপ্ট রাইটিং, ডিপ রিসার্চ, ইউটিউব গ্রোথ, অ্যাড কপি ও কোডিং অটোমেশনের রেডিমেড প্রম্পট লাইব্রেরি।',
    price: 149,
    originalPrice: 399,
    thumbnailUrl: AI_COURSE_IMG,
    category: 'Prompt Vault',
    rating: '৫.০',
    salesCount: '২,৪১০+',
    status: 'PUBLISHED',
    featuresBn: [
      '৬০+ ডকুমেন্টারি রিসার্চ ও হাই-রিটেনশন স্ক্রিপ্ট রাইটিং প্রম্পট',
      '৫০+ ভাইরাল ইউটিউব টাইটেল, থাম্বনেইল ও ৩০-সেকেন্ড হুক জেনারেটর',
      '৫০+ ফেসবুক অ্যাড কপি, ল্যান্ডিং পেজ ও সেলস ফানেল প্রম্পট'
    ],
    downloadFilename: 'MobinIQ_200_AI_Prompt_Vault.md',
    downloadContent: '# Mobin IQ 200+ AI Mega Prompt Vault\n'
  }
];

const INITIAL_HERO_SLIDES: AdminHeroSlide[] = [
  {
    id: 'slide-1',
    badge: '🔥 ধামাকা অফার চলছে',
    topLine: 'মোবাইল ও পিসি দিয়ে',
    highlight: 'সম্পূর্ণ AI মাস্টারি',
    subBadge: 'প্রম্পট, ওয়েব ও অটোমেশন',
    bottomTitle: 'বেসিক টু অ্যাডভান্স',
    image: HERO_IMG,
    slug: 'complete-ai-mastery-zero-to-pro',
    pills: ['Mobile Learning', 'AI Powered', 'Free Resources'],
    active: true
  },
  {
    id: 'slide-2',
    badge: '🔥 ধামাকা অফার চলছে',
    topLine: 'সিনেমাটিক টেক',
    highlight: 'ডকুমেন্টারি মেকিং',
    subBadge: 'ডিপ রিসার্চ ও স্টোরিটেলিং',
    bottomTitle: 'মাস্টারক্লাস ব্লুপ্রিন্ট',
    image: DOC_COURSE_IMG,
    slug: 'cinematic-tech-documentary-masterclass',
    pills: ['Deep Research', 'Sound Design', '3D Motion'],
    active: true
  },
  {
    id: 'slide-3',
    badge: '🔥 ধামাকা অফার চলছে',
    topLine: 'VIDEO EDITING',
    highlight: '• YOUTUBE GROWTH',
    subBadge: 'হাই-রিটেনশন এডিটিং',
    bottomTitle: 'মোবাইল ও পিসি গাইড',
    image: EDIT_COURSE_IMG,
    slug: 'high-retention-video-editing-fundamentals',
    pills: ['High Retention', 'Speed Graph', 'Color Grading'],
    active: true
  }
];

const INITIAL_ORDERS: OrderRecord[] = [];

const INITIAL_USERS: ManagedUser[] = [];

const INITIAL_COUPONS: PromoCoupon[] = [
  { code: 'MOBIN20', discountPct: 20, usageCount: 142, active: true, descriptionBn: 'বিশেষ ২০% ভিআইপি ছাড়' },
  { code: 'ADSPECIAL10', discountPct: 10, usageCount: 89, active: true, descriptionBn: 'ফেসবুক অ্যাড ও রিকভারি ১০% ছাড়' },
  { code: 'MOBIN100', discountPct: 100, usageCount: 4, active: true, descriptionBn: 'টেস্ট ও স্কলারশিপ ১০০% ফ্রি কুপন' }
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
    if (ev.target?.result) {
      callback(ev.target.result as string);
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

  // Synchronized Persistent Admin Database State
  const [courses, setCourses] = useState<AdminCourse[]>(() => {
    const raw = safeGet<AdminCourse[]>('mobiniq_admin_courses_v1', INITIAL_COURSES);
    return Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_COURSES;
  });
  const [products, setProducts] = useState<AdminProduct[]>(() => {
    const raw = safeGet<AdminProduct[]>('mobiniq_admin_products_v1', INITIAL_PRODUCTS);
    return Array.isArray(raw) && raw.length > 0 ? raw : INITIAL_PRODUCTS;
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
  const [users, setUsers] = useState<ManagedUser[]>(() =>
    safeGet('mobiniq_admin_users_v1', INITIAL_USERS)
  );
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
      bkashNumber: '01947-575870',
      nagadNumber: '01947-575870',
      rocketNumber: '01947-575870',
      manualAccountType: 'Personal (Send Money)',
      supportPhone: '01947-575870',
      supportWhatsapp: '01947575870',
      supportEmail: 'support@mobiniq.com',
      supportMessenger: 'https://m.me/mobiniq',
      supportHours: 'সকাল ১০:০০ - রাত ১০:০০ (প্রতিদিন)',
      fbPixelId: '149283746501928',
      fbCapiToken: 'EAABsbCS1iHgBO9x8MobinIQToken',
      fbTestEventCode: 'TEST49281',
      tiktokPixelId: 'C98X2Y3Z4A5B6C',
      ga4MeasurementId: 'G-MOBINIQ2026',
      pixelEnabled: true,
      firebaseProjectId: 'mobiniq-edtech-bd',
      firebaseApiKey: 'AIzaSyD-MobinIQ-FirebaseKey',
      firebaseAuthDomain: 'mobiniq-edtech-bd.firebaseapp.com',
      adminEmail: 'admin@mobiniq.com'
    })
  );

  // ============================================================================
  // ADMIN AUTHENTICATION & SECURITY STATE
  // ============================================================================
  const [adminUser, setAdminUser] = useState<{ email: string; name?: string } | null>(() =>
    safeGet<{ email: string; name?: string } | null>('mobiniq_admin_session_v1', null)
  );
  const [adminLoginEmail, setAdminLoginEmail] = useState('admin@mobiniq.com');
  const [adminLoginPass, setAdminLoginPass] = useState('admin123456');
  const [showPassword, setShowPassword] = useState(false);
  const [adminSecretKeyInput, setAdminSecretKeyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);

  // Real-time bidirectional subscriptions to Firebase Firestore collections
  useEffect(() => {
    // 0. Ensure Firebase Auth is active with Admin credentials in background
    adminSignInWithEmail('admin@mobiniq.com', 'admin123456').catch(() => {});

    // 1. Live courses from Firestore
    const unsubCourses = subscribeToCourses((cloudCourses) => {
      if (Array.isArray(cloudCourses) && cloudCourses.length > 0) {
        setCourses(cloudCourses as AdminCourse[]);
        safeSet('mobiniq_admin_courses_v1', cloudCourses);
      }
    });

    // 2. Live products from Firestore
    const unsubProducts = subscribeToProducts((cloudProducts) => {
      if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
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
        setUsers(cloudUsers as ManagedUser[]);
        safeSet('mobiniq_admin_users_v1', cloudUsers);
      }
    });

    // 9. Live blocked phones & IPs
    const unsubBlocked = subscribeToBlockedEntities((data) => {
      if (data.phones?.length) setBlockedPhones(data.phones);
      if (data.ips?.length) setBlockedIps(data.ips);
    });

    // 10. Firebase Auth state
    const unsubAuth = subscribeToAdminAuth((fbUser) => {
      if (fbUser) {
        const u = {
          email: fbUser.email || 'admin@mobiniq.com',
          name: fbUser.displayName || 'এডমিন'
        };
        setAdminUser(u);
        safeSet('mobiniq_admin_session_v1', u);
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

  // Google Sign In Handler
  const handleGoogleAdminLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const u = await adminSignInWithGoogle();
      const session = { email: u.email || 'admin@mobiniq.com', name: u.displayName || 'এডমিন' };
      setAdminUser(session);
      safeSet('mobiniq_admin_session_v1', session);
      notify(`স্বাগতম ${session.name || session.email}! সেন্ট্রাল কমান্ড আনলক হয়েছে।`);
    } catch (err: any) {
      setAuthError(err.message || 'গুগল সাইন-ইনে সমস্যা হয়েছে। পাসকী দিয়ে চেষ্টা করুন।');
    } finally {
      setAuthLoading(false);
    }
  };

  // Email & Password Login Handler (Primary Secure Admin Gateway)
  const handleEmailAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminLoginEmail || !adminLoginPass) {
      setAuthError('ইমেইল ও পাসওয়ার্ড উভয়ই পূরণ করুন।');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const u = await adminSignInWithEmail(adminLoginEmail.trim(), adminLoginPass);
      const session = { email: u.email || adminLoginEmail.trim(), name: u.displayName || 'এডমিন' };
      setAdminUser(session);
      safeSet('mobiniq_admin_session_v1', session);
      notify(`🔥 স্বাগতম! অ্যাডমিন হিসেবে লগইন সফল হয়েছে।`);
    } catch (err: any) {
      console.error('Admin login error:', err);
      let msg = err.message || 'ভুল ইমেইল বা পাসওয়ার্ড।';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'ভুল পাসওয়ার্ড অথবা ইমেইল। সঠিক ক্রেডেনশিয়াল লিখুন বা মাস্টার পাসকী দিন।';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'অতিরিক্ত চেষ্টা করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন বা মাস্টার পাসকী দিন।';
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Passkey Login Handler
  const handlePasskeyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const key = adminSecretKeyInput.trim();
    if (key === 'admin123' || key === 'mobiniq2026' || key === 'miq_sync_live_9f8e7d6c5b4a3210' || key === siteConfig.apiSyncSecret) {
      const session = { email: 'admin@mobiniq.com', name: 'মাস্টার অ্যাডমিন' };
      setAdminUser(session);
      safeSet('mobiniq_admin_session_v1', session);
      notify('🔥 মাস্টার পাসকী ভেরিফাইড! সেন্ট্রাল কমান্ড অ্যাক্সেস গ্রান্টেড।');
    } else {
      setAuthError('ভুল সিক্রেট পাসকী! সঠিক অ্যাডমিন কোড দিন। (ডিফল্ট: admin123 বা mobiniq2026)');
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
    titleBn: string;
    shortTitleBn: string;
    slug: string;
    subtitleBn: string;
    shortDescBn: string;
    category: AdminCourse['category'];
    price: number;
    originalPrice: number;
    totalDuration: string;
    thumbnailUrl: string;
    status: 'PUBLISHED' | 'DRAFT';
    featured: boolean;
    outcomesText: string;
    modules: CourseModule[];
  }>({
    titleBn: '',
    shortTitleBn: '',
    slug: '',
    subtitleBn: '',
    shortDescBn: '',
    category: 'এআই অ্যান্ড অটোমেশন',
    price: 1250,
    originalPrice: 3000,
    totalDuration: '১৫ ঘণ্টা',
    thumbnailUrl: AI_COURSE_IMG,
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
      titleBn: '',
      shortTitleBn: '',
      slug: '',
      subtitleBn: '',
      shortDescBn: '',
      category: 'এআই অ্যান্ড অটোমেশন',
      price: 990,
      originalPrice: 2500,
      totalDuration: '১৪ ঘণ্টা',
      thumbnailUrl: AI_COURSE_IMG,
      status: 'PUBLISHED',
      featured: true,
      outcomesText: 'প্র্যাকটিক্যাল প্রজেক্ট ভিত্তিক গাইডলাইন\nলাইফটাইম আপডেট ও রিসোর্স ফাইল',
      modules: [
        {
          id: `mod-${Date.now()}`,
          title: 'মডিউল ১: বেসিক থেকে অ্যাডভান্সড গাইডলাইন',
          order: 1,
          lessons: [
            {
              id: `les-${Date.now()}`,
              title: '১.১ [ফ্রি প্রিভিউ] ওরিয়েন্টেশন ও টুলস পরিচিতি',
              duration: '১৮:০০',
              isPreview: true,
              videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
              summaryBn: 'প্রাথমিক ধারণা ও কাজের পরিবেশ তৈরি।'
            }
          ]
        }
      ]
    });
    setShowCourseForm(true);
  };

  const startEditCourse = (c: AdminCourse) => {
    setEditingCourseId(c.id);
    setCourseDraft({
      titleBn: c.titleBn,
      shortTitleBn: c.shortTitleBn,
      slug: c.slug,
      subtitleBn: c.subtitleBn,
      shortDescBn: c.shortDescBn,
      category: c.category,
      price: c.price,
      originalPrice: c.originalPrice,
      totalDuration: c.totalDuration,
      thumbnailUrl: c.thumbnailUrl || AI_COURSE_IMG,
      status: c.status,
      featured: c.featured,
      outcomesText: c.outcomes.join('\n'),
      modules: c.modules
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

    notify('⏳ কোর্স সেভ হচ্ছে...');
    try {
      if (editingCourseId) {
        const existing = courses.find((c) => c.id === editingCourseId);
        const updatedCourse: AdminCourse = {
          id: editingCourseId,
          titleBn: courseDraft.titleBn.trim(),
          shortTitleBn: courseDraft.shortTitleBn.trim() || courseDraft.titleBn.trim(),
          slug: cleanSlug,
          subtitleBn: courseDraft.subtitleBn.trim(),
          shortDescBn: courseDraft.shortDescBn.trim(),
          category: courseDraft.category,
          price: Number(courseDraft.price) || 0,
          originalPrice: Number(courseDraft.originalPrice) || 0,
          totalDuration: courseDraft.totalDuration.trim(),
          thumbnailUrl: courseDraft.thumbnailUrl || AI_COURSE_IMG,
          status: courseDraft.status,
          featured: courseDraft.featured,
          outcomes,
          modules: courseDraft.modules,
          resources: existing?.resources || [],
          studentsCount: existing?.studentsCount || '১,২০০+',
          rating: existing?.rating || '৪.৯'
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
          titleBn: courseDraft.titleBn.trim(),
          shortTitleBn: courseDraft.shortTitleBn.trim() || courseDraft.titleBn.trim(),
          subtitleBn: courseDraft.subtitleBn.trim() || courseDraft.titleBn.trim(),
          shortDescBn: courseDraft.shortDescBn.trim() || courseDraft.subtitleBn.trim(),
          price: Number(courseDraft.price) || 0,
          originalPrice: Number(courseDraft.originalPrice) || 0,
          thumbnailUrl: courseDraft.thumbnailUrl || AI_COURSE_IMG,
          category: courseDraft.category,
          studentsCount: 'নতুন',
          rating: '৫.০',
          totalDuration: courseDraft.totalDuration.trim() || '১০ ঘণ্টা',
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
    titleBn: string;
    shortTitleBn: string;
    slug: string;
    shortDescBn: string;
    category: AdminProduct['category'];
    price: number;
    originalPrice: number;
    thumbnailUrl: string;
    status: 'PUBLISHED' | 'DRAFT';
    featuresText: string;
    downloadFilename: string;
    downloadContent: string;
  }>({
    titleBn: '',
    shortTitleBn: '',
    slug: '',
    shortDescBn: '',
    category: 'Prompt Vault',
    price: 199,
    originalPrice: 499,
    thumbnailUrl: AI_COURSE_IMG,
    status: 'PUBLISHED',
    featuresText: '১০০% টেস্টেড প্রিমিয়াম রিসোর্স\nমোবাইল ও পিসি সাপোর্টেড\nলাইফটাইম ডাউনলোড অ্যাক্সেস',
    downloadFilename: 'MobinIQ_Digital_Pack.txt',
    downloadContent: '# MobinIQ Digital Resource Download Link\n'
  });

  const startNewProduct = () => {
    setEditingProductId(null);
    setProductDraft({
      titleBn: '',
      shortTitleBn: '',
      slug: '',
      shortDescBn: '',
      category: 'Prompt Vault',
      price: 199,
      originalPrice: 499,
      thumbnailUrl: AI_COURSE_IMG,
      status: 'PUBLISHED',
      featuresText: '১০০% টেস্টেড প্রিমিয়াম রিসোর্স\nইনস্ট্যান্ট ডাউনলোড অ্যাক্সেস',
      downloadFilename: 'MobinIQ_Asset_Pack.txt',
      downloadContent: '# MobinIQ Instant Download Asset\n'
    });
    setShowProductForm(true);
  };

  const startEditProduct = (p: AdminProduct) => {
    setEditingProductId(p.id);
    setProductDraft({
      titleBn: p.titleBn,
      shortTitleBn: p.shortTitleBn,
      slug: p.slug,
      shortDescBn: p.shortDescBn,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      thumbnailUrl: p.thumbnailUrl || AI_COURSE_IMG,
      status: p.status,
      featuresText: p.featuresBn.join('\n'),
      downloadFilename: p.downloadFilename,
      downloadContent: p.downloadContent
    });
    setShowProductForm(true);
  };

  const saveProductDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productDraft.titleBn.trim()) {
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

    notify('⏳ প্রোডাক্ট সেভ হচ্ছে...');
    try {
      if (editingProductId) {
        const updatedProd: AdminProduct = {
          id: editingProductId,
          titleBn: productDraft.titleBn.trim(),
          shortTitleBn: productDraft.shortTitleBn.trim() || productDraft.titleBn.trim(),
          slug: cleanSlug,
          shortDescBn: productDraft.shortDescBn.trim(),
          category: productDraft.category,
          price: Number(productDraft.price) || 0,
          originalPrice: Number(productDraft.originalPrice) || 0,
          thumbnailUrl: productDraft.thumbnailUrl || AI_COURSE_IMG,
          status: productDraft.status,
          featuresBn,
          downloadFilename: productDraft.downloadFilename.trim(),
          downloadContent: productDraft.downloadContent,
          rating: '৫.০',
          salesCount: 'চলমান'
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
          titleBn: productDraft.titleBn.trim(),
          shortTitleBn: productDraft.shortTitleBn.trim() || productDraft.titleBn.trim(),
          shortDescBn: productDraft.shortDescBn.trim() || productDraft.titleBn.trim(),
          price: Number(productDraft.price) || 0,
          originalPrice: Number(productDraft.originalPrice) || 0,
          thumbnailUrl: productDraft.thumbnailUrl || AI_COURSE_IMG,
          category: productDraft.category,
          rating: '৫.০',
          salesCount: 'নতুন',
          status: productDraft.status,
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
      showOverlay: slide.showOverlay ?? Boolean(slide.highlight?.trim()),
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
      const sanitizedDraft: AdminHeroSlide = {
        ...heroSlideDraft,
        showOverlay: Boolean(heroSlideDraft.showOverlay),
        showCta: heroSlideDraft.showCta ?? true,
        ctaText: heroSlideDraft.ctaText?.trim() || 'এখনই কিনুন',
        badge: heroSlideDraft.badge?.trim() || '',
        topLine: heroSlideDraft.topLine?.trim() || '',
        highlight: heroSlideDraft.highlight?.trim() || '',
        subBadge: heroSlideDraft.subBadge?.trim() || '',
        bottomTitle: heroSlideDraft.bottomTitle?.trim() || '',
        pills: Array.isArray(heroSlideDraft.pills) ? heroSlideDraft.pills.filter(Boolean) : []
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
  const [newBlockPhone, setNewBlockPhone] = useState<string>('');
  const [newBlockIp, setNewBlockIp] = useState<string>('');

  const toggleUserCourseAccess = (uid: string, courseSlug: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.uid !== uid) return u;
        const has = u.enrolledSlugs.includes(courseSlug);
        return {
          ...u,
          enrolledSlugs: has
            ? u.enrolledSlugs.filter((s) => s !== courseSlug)
            : [...u.enrolledSlugs, courseSlug]
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
    () => orders.filter((o) => o.status === 'COMPLETED'),
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
    () => completedOrders.reduce((s, o) => s + o.amountBdt, 0),
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
      const statusOk = orderFilterStatus === 'ALL' || o.status === orderFilterStatus;
      const q = orderSearch.trim().toLowerCase();
      const searchOk =
        !q ||
        o.orderCode.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.trxId.toLowerCase().includes(q) ||
        o.itemTitleBn.toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [orders, orderFilterStatus, orderSearch]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.uid.toLowerCase().includes(q)
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

          {/* Primary Admin Login: Email & Password */}
          <div className="space-y-4">
            <form onSubmit={handleEmailAdminLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>এডমিন জিমেইল / ইমেইল *</span>
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono">admin@mobiniq.com</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@mobiniq.com"
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
                    className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'হাইড করুন' : 'পাসওয়ার্ড দেখুন'}</span>
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="পাসওয়ার্ড লিখুন (যেমন: admin123456)"
                    value={adminLoginPass}
                    onChange={(e) => setAdminLoginPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#06080f] border border-white/15 text-white text-xs sm:text-sm font-mono focus:border-emerald-400 focus:outline-none transition-all shadow-inner pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Fill Credentials Helper */}
              <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setAdminLoginEmail('admin@mobiniq.com');
                    setAdminLoginPass('admin123456');
                    notify('অ্যাডমিন ক্রেডেনশিয়াল অটো-ফিল করা হয়েছে!');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all text-[10px] font-bold"
                >
                  ⚡ টেস্ট ক্রেডেনশিয়াল ফিল করুন (admin@mobiniq.com)
                </button>
                <span className="text-[10px] text-slate-500 font-mono">Pass: admin123456</span>
              </div>

              {/* Login Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
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
                    placeholder="admin123 বা mobiniq2026"
                    value={adminSecretKeyInput}
                    onChange={(e) => setAdminSecretKeyInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#06080f] border border-white/15 text-white text-xs font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-amber-400 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-[14px] bg-[#06080f] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
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
                      <label className="text-xs font-bold text-slate-300">কোর্সের পূর্ণ নাম (বাংলায়) *</label>
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
                      <label className="text-xs font-bold text-slate-300">কোর্সের ক্যাটাগরি *</label>
                      <select
                        value={courseDraft.category}
                        onChange={(e) =>
                          setCourseDraft((p) => ({
                            ...p,
                            category: e.target.value as AdminCourse['category']
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      >
                        <option value="এআই অ্যান্ড অটোমেশন">এআই অ্যান্ড অটোমেশন</option>
                        <option value="টেক ডকুমেন্টারি">টেক ডকুমেন্টারি</option>
                        <option value="ভিডিও এডিটিং">ভিডিও এডিটিং</option>
                        <option value="ফ্রিল্যান্সিং ও ক্যারিয়ার">ফ্রিল্যান্সিং ও ক্যারিয়ার</option>
                      </select>
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
                      <label className="text-xs font-bold text-slate-300">URL Slug (Facebook Ad লিংকের জন্য)</label>
                      <input
                        type="text"
                        value={courseDraft.slug}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, slug: e.target.value }))}
                        placeholder="complete-ai-mastery-zero-to-pro"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-emerald-300 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">মোট সময়কাল (Duration)</label>
                      <input
                        type="text"
                        value={courseDraft.totalDuration}
                        onChange={(e) => setCourseDraft((p) => ({ ...p, totalDuration: e.target.value }))}
                        placeholder="১৬ ঘণ্টা"
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
                  const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
                  return (
                    <div
                      key={course.id}
                      className="admin-card rounded-2xl overflow-hidden flex flex-col justify-between border border-white/10"
                    >
                      <div>
                        <div className="relative aspect-video">
                          <img
                            src={course.thumbnailUrl}
                            alt={course.titleBn}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/90 text-emerald-300 text-[10px] font-bold">
                            {course.category}
                          </span>
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold">
                            {course.status}
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="text-base font-extrabold text-white line-clamp-1">
                            {course.shortTitleBn}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {course.subtitleBn}
                          </p>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{toBn(course.modules.length)} মডিউল</span>
                            <span>•</span>
                            <span>{toBn(lessonCount)} লেসন</span>
                            <span>•</span>
                            <span>{course.totalDuration}</span>
                          </div>
                          <div className="flex items-baseline gap-2 pt-1">
                            <span className="text-lg font-extrabold text-emerald-400">
                              ৳{toBn(course.price)}
                            </span>
                            <span className="text-xs text-slate-500 line-through">
                              ৳{toBn(course.originalPrice)}
                            </span>
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
                      <label className="text-xs font-bold text-slate-300">প্রোডাক্টের নাম (বাংলায়) *</label>
                      <input
                        type="text"
                        required
                        value={productDraft.titleBn}
                        onChange={(e) => setProductDraft((p) => ({ ...p, titleBn: e.target.value }))}
                        placeholder="যেমন: ১০০+ সিনেমাটিক সাউন্ড এফেক্টস প্যাক"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">প্রোডাক্টের ধরন (Category)</label>
                      <select
                        value={productDraft.category}
                        onChange={(e) =>
                          setProductDraft((p) => ({
                            ...p,
                            category: e.target.value as AdminProduct['category']
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs sm:text-sm text-white"
                      >
                        <option value="SFX Pack">SFX Pack</option>
                        <option value="Prompt Vault">Prompt Vault</option>
                        <option value="LUT & Presets">LUT & Presets</option>
                        <option value="Template & E-Book">Template & E-Book</option>
                      </select>
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
                      <label className="text-xs font-bold text-slate-300">রেগুলার মূল্য (৳)</label>
                      <input
                        type="number"
                        value={productDraft.originalPrice}
                        onChange={(e) =>
                          setProductDraft((p) => ({ ...p, originalPrice: Number(e.target.value) }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-sm text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 p-3.5 rounded-2xl bg-[#090d18] border border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>প্রোডাক্ট থাম্বনেইল / ছবি *</span>
                      </label>
                      <span className="text-[11px] text-cyan-400">
                        ইমেজ লিংক দিন অথবা কম্পিউটার/মোবাইল থেকে সরাসরি আপলোড করুন
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        required
                        value={productDraft.thumbnailUrl}
                        onChange={(e) => setProductDraft((p) => ({ ...p, thumbnailUrl: e.target.value }))}
                        placeholder="https://... অথবা ছবি আপলোড করুন"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-white/15 text-xs text-white"
                      />
                      <label className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold cursor-pointer shrink-0 flex items-center justify-center gap-1.5 transition-colors">
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
                                setProductDraft((p) => ({ ...p, thumbnailUrl: dataUrl }))
                              );
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400">প্রিসেট:</span>
                        <button
                          type="button"
                          onClick={() => setProductDraft((p) => ({ ...p, thumbnailUrl: DOC_COURSE_IMG }))}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                        >
                          সাউন্ড প্যাক
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductDraft((p) => ({ ...p, thumbnailUrl: AI_COURSE_IMG }))}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                        >
                          প্রম্পট ভল্ট
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductDraft((p) => ({ ...p, thumbnailUrl: EDIT_COURSE_IMG }))}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] text-slate-300"
                        >
                          LUT & প্রিসেট
                        </button>
                      </div>
                      {productDraft.thumbnailUrl && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">লাইভ প্রিভিউ:</span>
                          <div className="w-16 h-10 rounded-lg overflow-hidden border border-cyan-500/40">
                            <img src={productDraft.thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
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
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 text-[10px] font-bold">
                          {prod.category}
                        </span>
                        <h3 className="text-base font-extrabold text-white">{prod.titleBn}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{prod.shortDescBn}</p>
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
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/[0.02]">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-extrabold text-white block">
                              {ord.orderCode}
                            </span>
                            <span className="text-[11px] text-slate-400">{ord.createdAt}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">{ord.customerName}</span>
                            <span className="font-mono text-amber-300 text-[11px] block">
                              {ord.customerPhone}
                            </span>
                            <span className="text-[10px] text-slate-400">{ord.customerEmail}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-200 block">{ord.itemTitleBn}</span>
                            <span className="text-emerald-400 font-extrabold">
                              ৳{toBn(ord.amountBdt)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">
                              {ord.paymentMethod}
                            </span>
                            <span className="font-mono text-cyan-300 block mt-1">
                              TrxID: {ord.trxId}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {ord.status === 'COMPLETED' && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold">
                                সম্পন্ন ✓
                              </span>
                            )}
                            {ord.status === 'PENDING' && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold">
                                পেন্ডিং ভেরিফিকেশন
                              </span>
                            )}
                            {ord.status === 'REJECTED' && (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold">
                                রিজেক্টেড
                              </span>
                            )}
                            <span className="block text-[10px] text-slate-400 mt-1">
                              {ord.verifiedBy}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {ord.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => approveOrder(ord.id)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[11px]"
                                >
                                  ✓ অ্যাপ্রুভ
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
                                    `Invoice_${ord.orderCode}.txt`,
                                    `MobinIQ Official Payment Invoice\nOrder: ${ord.orderCode}\nCustomer: ${ord.customerName} (${ord.customerPhone})\nItem: ${ord.itemTitleBn}\nAmount: BDT ${ord.amountBdt}\nTrxID: ${ord.trxId}\nStatus: ${ord.status}\n`
                                  );
                                  notify(`ইনভয়েস ${ord.orderCode} ডাউনলোড হয়েছে!`);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                                title="Download Invoice"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                        <button
                          onClick={() =>
                            setSelectedUserForEnroll(selectedUserForEnroll === u.uid ? null : u.uid)
                          }
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold"
                        >
                          🎓 কোর্স অ্যাক্সেস ({toBn(u.enrolledSlugs.length)})
                        </button>
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

                    {/* Expandable Course Access Toggles for this Student */}
                    {selectedUserForEnroll === u.uid && (
                      <div className="p-3.5 rounded-xl bg-[#06080f] border border-white/10 space-y-2 smooth-fade">
                        <span className="text-xs font-bold text-slate-300 block">
                          টিক দিয়ে এই স্টুডেন্টের জন্য যেকোনো কোর্স আনলক বা লক করুন:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {courses.map((c) => {
                            const enrolled = u.enrolledSlugs.includes(c.slug);
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

                <button
                  onClick={() => triggerCloudSync('পেমেন্ট গেটওয়ে ও বিকাশ/নগদ নম্বর মেইন সাইটে আপডেট হয়েছে!')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs sm:text-sm"
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
                      placeholder="01947575870"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06080f] border border-emerald-500/40 text-xs sm:text-sm text-emerald-300 font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-500 block">
                      সরাসরি লিংক হবে: https://wa.me/88{siteConfig.supportWhatsapp.replace(/[^0-9]/g, '')}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      হটলাইন কল নম্বর (সরাসরি ডায়াল)
                    </label>
                    <input
                      type="text"
                      value={siteConfig.supportPhone}
                      onChange={(e) => setSiteConfig((p) => ({ ...p, supportPhone: e.target.value }))}
                      placeholder="01947-575870"
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

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">
                      সাপোর্ট ও রেসপন্স সময়কাল (Working Hours)
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
                  onClick={() => triggerCloudSync('সাপোর্ট চ্যানেল ও হটলাইন নম্বর আপডেট হয়েছে!')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>💾 সাপোর্ট সেটিংস সেভ ও সিঙ্ক করুন</span>
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
