# MobinIQ Dedicated Standalone Admin Panel (`admin.mobiniq.com`)

এই প্রজেক্টটি **MobinIQ**-এর সম্পূর্ণ আলাদা ও ডেডিকেটেড অ্যাডমিন কমান্ড সেন্টার। এটি আপনি আলাদা গিটহাব রিপোজিটরি এবং আলাদা ডোমেইন/সাবডোমেইনে (যেমন `admin.mobiniq.com`) হোস্ট করতে পারবেন।

## কীভাবে মেইন ওয়েবসাইটের সাথে যুক্ত থাকবে? (Dual Connection Architecture)

১. **Shared Firebase Firestore Database (`src/lib/firebase-admin-bridge.ts`):**
   - আপনার মেইন ওয়েবসাইট (`mobiniq.com`) এবং এই অ্যাডমিন প্যানেল (`admin.mobiniq.com`) উভয় প্রজেক্টের `.env.local` ফাইলে একই **Firebase Project ID ও API Key** বসাবেন।
   - ফলে অ্যাডমিন প্যানেল থেকে নতুন কোর্স অ্যাড করা, দাম পরিবর্তন করা, প্রোডাক্ট আপলোড করা বা অর্ডার অ্যাপ্রুভ করার সাথে সাথে মেইন ওয়েবসাইটে রিয়েল-টাইমে আপডেট হয়ে যাবে।

২. **Cross-Server REST Sync & Meta CAPI API (`src/app/api/sync/route.ts` & `src/app/api/orders/verify/route.ts`):**
   - অ্যাডমিন প্যানেল থেকে কোনো পরিবর্তন করলে `HMAC-SHA256` সিগনেচারসহ মেইন সাইটে ওয়েবহুক সিঙ্ক পাঠায় এবং অর্ডার অ্যাপ্রুভ করলে সার্ভার থেকে সরাসরি **Facebook Conversions API (CAPI)**-তে `Purchase` ইভেন্ট পাঠায়।
