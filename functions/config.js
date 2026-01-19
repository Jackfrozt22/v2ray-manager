// V2Ray Telegram Bot Configuration and Localization

// =========================================================================
// CONFIGURATION
// =========================================================================

// Global Keys for KV Storage
export const BOT_USERS_KEY = 'bot_users';
export const USER_STATE_KEY = 'user_state';
export const USER_PREMIUM_KEYS_KEY = 'user_premium_keys';

// Timezone handling for Asia/Yangon (UTC + 6 hours 30 minutes)
export const MMT_OFFSET_SECONDS = 6.5 * 3600;

// Bot Configuration (Placeholder: MUST BE UPDATED IN PRODUCTION)
// NOTE: BOT_TOKEN will be provided via environment variables (e.g., env.TELEGRAM_BOT_TOKEN)
export const TELEGRAM_BOT_TOKEN_ENV = 'TELEGRAM_BOT_TOKEN'; // Expected environment variable name
export const BOT_USERNAME = 'JackFrozt_V2rayBot';
// API_URL will be constructed dynamically in utils.js

// Admin Configuration
export const ADMIN_IDS = [8532838293,];
export const OWNER_ID = 7500643946;
export const OWNER_URL = 'tg://user?id=' + OWNER_ID;

// V2Ray API Configuration
export const V2RAY_API_URL = 'https://iam404.serv00.net/404-v2ray-checker/v3/api.php';

// Channel URL and ID
export const CHANNEL_URL = 'https://t.me/DaGe_4u';
export const CHANNEL_ID = '-1003489881710';

// Server Configuration
export const SERVER_NAMES = {
    1: '🇸🇬 Singapore #1',
    2: '🇸🇬 Singapore #2',
    3: '🇸🇬 Singapore #3',
    // Add more panels as needed
};
export const PREMIUM_DEFAULT_PANEL = 1; // Default panel if not specified for credit redemption

// Stats configuration
export const USERS_PER_PAGE = 9;
export const ONLINE_USERS_PER_PAGE = 10;
export const REDEEMED_KEYS_PER_PAGE = 5;
export const BROADCAST_BATCH_SIZE = 10;
export const BROADCAST_DELAY_MS = 2500; // ⚠️ Delay between batches (2.5 seconds)

// --- PREMIUM PLAN CONFIGURATION ---
export const PREMIUM_PLANS = {
    150: { gb: 150, price: '4,000 MMK' },
    250: { gb: 250, price: '5,500 MMK' },
    500: { gb: 500, price: '7,500 MMK' },
};
export const PREMIUM_DEFAULT_DAYS = 30;
export const PREMIUM_PANEL_ID = 2; // Kept for legacy non-configurable premium

// --- REFERRAL & CREDIT CONFIGURATION ---
export const PREMIUM_CREDIT_PLANS = {
    5: { gb: 5, cost: 0.5 },
    10: { gb: 10, cost: 1.0 }
};
export const CREDIT_COST_PER_GB = 0.1;
export const REFERRAL_REWARD = 0.5; // 0.5 Credits awarded to REFERRER

// --- PAYMENT METHOD CONFIGURATION ---
export const PAYMENT_METHODS = {
    'wavepay': { name_en: 'Wave Pay', name_my: 'Wave Pay', account_name: 'Nyein Ko Ko Aung', number: '09651600998' },
    'kbzpay': { name_en: 'KBZ Pay', name_my: 'KBZ Pay', account_name: 'Nyein KoKoAung', number: '09651600998' },
    'ayapay': { name_en: 'AYA Pay', name_my: 'AYA Pay', account_name: 'Nyein Ko Ko Aung', number: '09651600998' },
};

// --- Localization Constants ---
export const LANG_MY = 'my';
export const LANG_EN = 'en';
export const DEFAULT_LANG = LANG_EN;

// =========================================================================
// LOCALIZATION DATA
// =========================================================================

export const MESSAGES = {
    // --- General / Welcome ---
    'welcome_start_line1': { [LANG_EN]: "Hi %s! Welcome to this bot", [LANG_MY]: "မင်္ဂလာပါ %s! ဤဘော့သို့ ကြိုဆိုပါတယ်" },
    'welcome_separator': { [LANG_EN]: "━━━━━━━━━━━━━━━━━━━━━━", [LANG_MY]: "━━━━━━━━━━━━━━━━━━━━━━" },
    'welcome_bot_desc': { [LANG_EN]: "V2Ray Manager Bot is your reliable V2Ray account management assistant!\nUse /premium to view our plans.", [LANG_MY]: "V2Ray Manager Bot သည် သင်၏ ယုံကြည်စိတ်ချရသော V2Ray အကောင့် စီမံခန့်ခွဲမှု လက်ထောက်ဖြစ်ပါသည်။\nPlan များကို ကြည့်ရန် /premium ကို အသုံးပြုပါ။" },
    'welcome_join_prompt': {
        [LANG_EN]: `Don't forget to [join](${CHANNEL_URL}) for updates!`,
        [LANG_MY]: `သတင်းအချက်အလက်များအတွက် [join](${CHANNEL_URL}) ထားဖို့ မမေ့ပါနဲ့!`
    },
    'welcome_invited_by': { [LANG_EN]: "\n\n🤝 You were invited by %s!", [LANG_MY]: "\n\n🤝 သင့်ကို %s မှ ဖိတ်ခေါ်ထားပါတယ်!" },

    // --- Command Descriptions (Main Menu) ---
    'available_commands': { [LANG_EN]: "📋 *Available Commands:*", [LANG_MY]: "📋 *အသုံးပြုနိုင်သည့် Command များ*:" },
    'quick_check_tip': { [LANG_EN]: "⚡ *Quick Check:* Just send your V2Ray config to check account status!", [LANG_MY]: "⚡ *အမြန်စစ်ဆေးခြင်း:* သင်၏ V2Ray config ကို ပို့ရုံဖြင့် အကောင့်အခြေအနေကို စစ်ဆေးနိုင်ပါသည်။" },
    'powered_by': { [LANG_EN]: "⚡ Powered by Channel 404 Team", [LANG_MY]: "⚡ Channel 404 Team မှ ပံ့ပိုးသည်" },
    'features_title': { [LANG_EN]: "💡 *Features:*", [LANG_MY]: "💡 *လုပ်ဆောင်ချက်များ*:" },
    'features_list': {
        [LANG_EN]: "• Auto trial account creation\n• Traffic monitoring\n• Expiry tracking\n• Multi-protocol support",
        [LANG_MY]: "• အစမ်းသုံးအကောင့် အလိုအလျောက် ဖန်တီးပေးခြင်း\n• Traffic စောင့်ကြည့်ခြင်း\n• သက်တမ်းကုန်ဆုံးမှု ခြေရာခံခြင်း\n• Protocol မျိုးစုံကို ထောက်ပံ့ခြင်း"
    },
    'cmd_admin': { [LANG_EN]: "/admin - Open the Admin Control Panel", [LANG_MY]: "/admin - Admin ထိန်းချုပ်ရေး Panel ဖွင့်ရန်" },
    'cmd_premium': { [LANG_EN]: "/premium - View premium plans and purchase", [LANG_MY]: "/premium - Premium Plan များကို ကြည့်ရှုဝယ်ယူရန်" },
    'cmd_trial': { [LANG_EN]: "/trial - Create a new trial account", [LANG_MY]: "/trial - အစမ်းသုံးအကောင့်အသစ် ဖန်တီးရန်" },
    'cmd_mytrial': { [LANG_EN]: "/mytrial - Get your existing trial account", [LANG_MY]: "/mytrial - သင်၏ လက်ရှိအစမ်းသုံးအကောင့်ကို ရယူရန်" },
    'cmd_apps': { [LANG_EN]: "/apps - Get VPN apps for your device", [LANG_MY]: "/apps - သင့်စက်အတွက် VPN App များရယူရန်" },
    'cmd_id': { [LANG_EN]: "/id <ID/USERNAME> - Get user information", [LANG_MY]: "/id <ID/USERNAME> - သုံးစွဲသူ အချက်အလက်များ ရယူရန်" },
    'cmd_language': { [LANG_EN]: "/language - Change bot language (English/Burmese)", [LANG_MY]: "/language - ဘော့ဘာသာစကားပြောင်းရန် (အင်္ဂလိပ်/မြန်မာ)" },
    'cmd_help': { [LANG_EN]: "/help - Show help information", [LANG_MY]: "/help - အကူအညီအချက်အလက်များကို ပြသရန်" },
    'cmd_referral': { [LANG_EN]: "/referral - Manage your referral link and credits", [LANG_MY]: "/referral - သင်၏ဖိတ်ခေါ်လင့်ခ်နှင့် Credits များကို စီမံရန်" },
    'cmd_online': { [LANG_EN]: "/online - View currently connected users", [LANG_MY]: "/online - လက်ရှိချိတ်ဆက်ထားသော သုံးစွဲသူများအား ကြည့်ရန်" },

    // --- Menu Buttons ---
    'button_main_menu': { [LANG_EN]: "⚙️ Main Menu", [LANG_MY]: "⚙️ မူရင်း Menu" },
    'button_about_me': { [LANG_EN]: "ℹ️ About Me", [LANG_MY]: "ℹ️ ဘော့အကြောင်း" },
    'button_policy_terms': { [LANG_EN]: "📄 Policy & Terms", [LANG_MY]: "📄 ပေါ်လစီနှင့် စည်းမျဉ်းများ" },
    'button_back_to_start': { [LANG_EN]: "⬅️ Back to Start Menu", [LANG_MY]: "⬅️ အစမှစသည့် Menu သို့ ပြန်သွားရန်" },
    'button_back': { [LANG_EN]: '⬅️ Back', [LANG_MY]: '⬅️ ပြန်သွားရန်' },
    'button_contact_admin': { [LANG_EN]: "📩 Contact Admin", [LANG_MY]: "📩 Admin အား ဆက်သွယ်ရန်" },
    'button_channel_link': { [LANG_EN]: "CHANNEL 404 [🇲🇲]", [LANG_MY]: "CHANNEL 404 [🇲🇲]" },

    // --- About Me Menu Content ---
    'about_name': { [LANG_EN]: "Name: V2Ray Manager ⚙️", [LANG_MY]: "အမည်: V2Ray Manager ⚙️" },
    'about_version': { [LANG_EN]: "Version: v2.0 (Beta) 🛠", [LANG_MY]: "ဗားရှင်း: v2.0 (Beta) 🛠" },
    'about_dev_team': { [LANG_EN]: "Development Team:", [LANG_MY]: "တီထွင်သူ အဖွဲ့:" },
    'about_creator': { [LANG_EN]: "- Creator: [4 0 4 \\ 2.0 - 🇲🇲](tg://user?id=1273841502) 👨‍💻", [LANG_MY]: "- ဖန်တီးသူ: [4 0 4 \\ 2.0 - 🇲🇲](tg://user?id=1273841502) 👨‍💻" },
    'about_tech_stack': { [LANG_EN]: "Technical Stack:", [LANG_MY]: "နည်းပညာပိုင်းဆိုင်ရာ အခြေခံ:" },
    'about_language': { [LANG_EN]: "- Language: JavaScript 🌐", [LANG_MY]: "- ဘာသာစကား: JavaScript 🌐" },
    'about_database': { [LANG_EN]: "- Database: Cloudflare KV 🗄", [LANG_MY]: "- ဒေတာဘေ့စ်: Cloudflare KV 🗄" },
    'about_hosting': { [LANG_EN]: "- Hosting: Cloudflare Worker ☁️", [LANG_MY]: "- Hosting: Cloudflare Worker ☁️" },
    'about_main_desc': {
        [LANG_EN]: "About: This bot is developed to simplify the management of V2Ray accounts, including trial creation, account checking, and premium services. We aim to provide a secure and efficient service.",
        [LANG_MY]: "အကြောင်း: ဤဘော့ကို အစမ်းသုံးအကောင့်ဖန်တီးခြင်း၊ အကောင့်စစ်ဆေးခြင်းနှင့် ပရီမီယံဝန်ဆောင်မှုများအပါအဝင် V2Ray အကောင့်များကို စီမံခန့်ခွဲရာတွင် လွယ်ကူစေရန် တီထွင်ထားပါသည်။ ကျွန်ုပ်တို့သည် လုံခြုံပြီး ထိရောက်သော ဝန်ဆောင်မှုများကို ပေးအပ်ရန် ရည်ရွယ်ပါသည်။"
    },
    'button_stats_about': { [LANG_EN]: "📊 Statistics", [LANG_MY]: "📊 စာရင်းအင်းများ" },
    'button_server_info': { [LANG_EN]: "💾 Server", [LANG_MY]: "💾 ဆာဗာ အချက်အလက်" },

    // --- Server Info content (UPDATED) ---
    'server_info_title': { [LANG_EN]: "💾 *Server & Panel Status*", [LANG_MY]: "💾 *ဆာဗာနှင့် Panel အခြေအနေ*" },
    'server_info_content': {
        [LANG_EN]: "Our V2Ray management system operates across multiple panels to ensure high availability and load balancing.\n\n" +
            "• *API Endpoint:* `iam404.serv00.net`\n" +
            "• *Online Panels:* 3 (Panel 1, 2, 3)\n" +
            "• *Uptime Target:* 99.99 %\n\n" +
            `For real-time status and maintenance announcements, please check our [Channel](${CHANNEL_URL}).`,
        [LANG_MY]: "ကျွန်ုပ်တို့၏ V2Ray စီမံခန့်ခွဲမှု စနစ်သည် မြင့်မားသော အသုံးပြုနိုင်မှုနှင့် ဝန်မျှတမှု (load balancing) ကို သေချာစေရန် Panel များစွာတွင် လည်ပတ်ပါသည်။\n\n" +
            "• *API Endpoint:* `iam404.serv00.net`\n" +
            "• *Online Panels:* ၃ ခု (Panel 1, 2, 3)\n" +
            "• *ဆက်လက်လည်ပတ်မှု ပစ်မှတ်:* 99.99 %\n\n" +
            `အချိန်နှင့်တပြေးညီ အခြေအနေနှင့် ထိန်းသိမ်းမှု ကြေညာချက်များအတွက် ကျွန်ုပ်တို့၏ [Channel](${CHANNEL_URL}) ကို စစ်ဆေးပါ။`
    },
    'server_info_online_panels': { [LANG_EN]: "• *Online Panels:* %d / %d", [LANG_MY]: "• *Online Panels:* %d / %d" },
    'server_info_panel_status': { [LANG_EN]: "Status of Panel %s: %s", [LANG_MY]: "Panel %s ၏ အခြေအနေ: %s" },
    'server_info_api_error': { [LANG_EN]: "Error fetching panel stats: %s", [LANG_MY]: "Panel စာရင်းအင်းများ ရယူရာတွင် အမှားဖြစ်သည်: %s" },

    // --- Other Menu Contents ---
    'menu_main_title': { [LANG_EN]: "⚙️ *Main Menu Commands*", [LANG_MY]: "⚙️ *မူရင်း Menu Command များ*" },
    'menu_policy_content': {
        [LANG_EN]: "*📄 Policy & Terms*\n\n1. Trial accounts are valid for 24 hours only.\n2. Do not use the service for illegal activities.\n3. Abuse will result in permanent account deletion.\n4. All sales are final and non-refundable.",
        [LANG_MY]: "*📄 ပေါ်လစီနှင့် စည်းမျဉ်းများ*\n\n၁။ အစမ်းသုံးအကောင့်များသည် ၂၄ နာရီသာ အကျုံးဝင်ပါသည်။\n၂။ ဝန်ဆောင်မှုများကို တရားမဝင်သော လုပ်ဆောင်မှုများအတွက် အသုံးမပြုရပါ။\n၃။ အလွဲသုံးစားပြုပါက အကောင့်ကို အပြီးအပိုင် ဖျက်သိမ်းသွားမည်ဖြစ်သည်။\n၄။ ရောင်းချပြီးသော ဝန်ဆောင်မှုများအတွက် ငွေပြန်အမ်းမည်မဟုတ်ပါ။"
    },

    // --- PREMIUM PLAN DESCRIPTION LOCALIZATION ---
    'button_view_plans': { [LANG_EN]: "📄 View Plan Details", [LANG_MY]: "📄 Plan အသေးစိတ် ကြည့်ရန်" },
    'menu_premium_desc_title': { [LANG_EN]: "💎 Premium Plan Details", [LANG_MY]: "💎 Premium Plan အသေးစိတ်" },
    'menu_premium_desc_content': {
        [LANG_EN]: "*Standard (150 GB) - 4,000 MMK*\n_Affordable for everyone_\n- Unlimited Devices\n- 150 GB Premium Servers\n- High-Speed Private Servers\n- No-Log Policy\n- 30 Days Validity\n\n*Premium (250 GB) - 5,500 MMK*\n_For media consumption_\n- Unlimited Devices\n- 250 GB Premium Servers\n- High-Speed Private Servers\n- No-Log Policy\n- 30 Days Validity\n\n*Premium+ (500 GB) - 7,500 MMK*\n_Suitable for multi-device usage_\n- Unlimited Devices\n- 500 GB Premium Servers\n- High-Speed Private Servers\n- No-Log Policy\n- 30 Days Validity",
        [LANG_MY]: "*Standard (150 GB) - 4,000 MMK*\n_လူတိုင်းအတွက် တတ်နိုင်သောစျေးနှုန်း_\n- Unlimited Devices\n- 150 GB Premium Servers\n- High-Speed Private Servers\n- No-Log Policy\n- ရက် 30 သက်တမ်း\n\n*Premium (250 GB) - 5,500 MMK*\n_မီဒီယာအသုံးပြုရန်အတွက်_\n- Unlimited Devices\n- 250 GB Premium Servers\n- High-Speed Private Servers\n- No-Log Policy\n- ရက် 30 သက်တမ်း\n\n*Premium+ (500 GB) - 7,500 MMK*\n_စက်များစွာ အသုံးပြုရန် သင့်တော်သည်_\n- Unlimited Devices\n- 500 GB Premium Servers\n- High-Speed Private Servers\n- No-Log Policy\n- ရက် 30 သက်တမ်း"
    },

    // --- PREMIUM PAYMENT LOCALIZATION ---
    'menu_premium_title': { [LANG_EN]: "💎 Premium V2Ray Plans", [LANG_MY]: "💎 Premium V2Ray Plan များ" },
    'premium_select_plan': { [LANG_EN]: "*Select a plan to purchase (30 Days Validity):*", [LANG_MY]: "*ဝယ်ယူလိုသော Plan ကို ရွေးချယ်ပါ (ရက် 30 သက်တမ်း)*:" },
    'button_plan': { [LANG_EN]: "%dGB - %s", [LANG_MY]: "%dGB - %s" },

    'prompt_select_method': { [LANG_EN]: "💳 *Select your payment method for %dGB (%s):*", [LANG_MY]: "💳 *%dGB (%s) အတွက် ငွေပေးချေမှုနည်းလမ်း ရွေးချယ်ပါ*:" },
    'button_wavepay': { [LANG_EN]: "💶 Wave Pay", [LANG_MY]: "💶 Wave Pay" },
    'button_kbzpay': { [LANG_EN]: "💵 KBZ Pay", [LANG_MY]: "💵 KBZ Pay" },
    'button_ayapay': { [LANG_EN]: "💴 AYA Pay", [LANG_MY]: "💴 AYA Pay" },

    'plan_details_title': { [LANG_EN]: "Selected Plan: %dGB (%s)", [LANG_MY]: "ရွေးချယ်ထားသော Plan: %dGB (%s)" },
    'payment_instructions_title': { [LANG_EN]: "🏦 Payment Instructions", [LANG_MY]: "🏦 ငွေပေးချေမှု ညွှန်ကြားချက်များ" },

    'payment_instructions_detail': {
        [LANG_EN]: "Please pay to the account below:\n\n*Method:* %s\n*Account Name:* %s\n*Account Number:* `%s`\n\n*Note:* After payment, send your Transaction ID (TxID) in the next message. *You may send the full TxID or the last 5 digits.*",
        [LANG_MY]: "ကျေးဇူးပြု၍ အောက်ပါအကောင့်သို့ ငွေပေးချေပါ:\n\n*နည်းလမ်း:* %s\n*အကောင့်အမည်:* %s\n*အကောင့်နံပါတ်:* `%s`\n\n*မှတ်ချက်:* ငွေပေးချေပြီးပါက သင်၏ Transaction ID (TxID) ကို နောက်ထပ်မက်ဆေ့ချ်တွင် ပို့ပေးပါ။ *TxID အပြည့်အစုံ သို့မဟုတ် နောက်ဆုံး ၅ လုံးကို ပို့နိုင်ပါသည်။*"
    },

    'prompt_txid': { [LANG_EN]: "✅ *Waiting for Transaction ID (TxID)*. Please send the TxID or screenshot text now:", [LANG_MY]: "✅ *Transaction ID (TxID) ကို စောင့်ဆိုင်းနေသည်*. ကျေးဇူးပြု၍ TxID သို့မဟုတ် စကရင်ရှော့စာသားကို ယခုပို့ပေးပါ:" },
    'error_no_txid': { [LANG_EN]: "❌ *Submission failed. Please send the Transaction ID (TxID) only*.", [LANG_MY]: "❌ *တင်ပြမှု မအောင်မြင်ပါ။ Transaction ID (TxID) ကို သာ ပို့ပေးပါ။*" },
    'txid_submitted_user': { [LANG_EN]: "⏳ *TxID Submitted!* We received your TxID: `%s`. Your request is now pending admin approval. We will notify you once approved.", [LANG_MY]: "⏳ *TxID တင်ပြပြီးပါပြီ!* သင်၏ TxID: `%s` ကို လက်ခံရရှိပါပြီ။ သင်၏တောင်းဆိုမှုအား Admin မှ ခွင့်ပြုချက်ပေးရန် စောင့်ဆိုင်းနေပါသည်။ ခွင့်ပြုသည်နှင့် သင့်အား အကြောင်းကြားပါမည်။" },

    // --- Admin Notification Fields ---
    'admin_new_purchase': { [LANG_EN]: "🔔 *NEW PREMIUM PURCHASE PENDING!*", [LANG_MY]: "🔔 *Premium ဝယ်ယူမှုအသစ် ခွင့်ပြုချက် စောင့်ဆိုင်းနေသည်!*" },
    'admin_field_method': { [LANG_EN]: "🏦 Method:", [LANG_MY]: "🏦 နည်းလမ်း:" },
    'admin_field_txid': { [LANG_EN]: "🔢 Transaction ID:", [LANG_MY]: "🔢 Transaction ID:" },
    'admin_field_userid': { [LANG_EN]: "🆔 User ID:", [LANG_MY]: "🆔 User ID:" },
    'admin_field_time': { [LANG_EN]: "⏰ Time:", [LANG_MY]: "⏰ အချိန်:" },
    'admin_approve_btn': { [LANG_EN]: "✅ Approve & Create %dGB", [LANG_MY]: "✅ ခွင့်ပြုပြီး %dGB ဖန်တီးပါ" },
    'admin_reject_btn': { [LANG_EN]: "❌ Reject & Notify", [LANG_MY]: "❌ ငြင်းပယ်ပြီး အကြောင်းကြားပါ" },
    'admin_usage_approve': { [LANG_EN]: "❌ *Usage:* /approve `<USER_ID> <GB_PLAN>`", [LANG_MY]: "❌ *အသုံးပြုပုံ:* /approve `<USER_ID> <GB_PLAN>`" },
    'admin_usage_reject': { [LANG_EN]: "❌ *Usage:* /reject `<USER_ID>`", [LANG_MY]: "❌ *အသုံးပြုပုံ:* /reject `<USER_ID>`" },
    'approval_success_user': { [LANG_EN]: "✅ *Payment Approved!*\nYour %dGB Premium Account is now active!", [LANG_MY]: "✅ *ငွေပေးချေမှု ခွင့်ပြုပါသည်!*\nသင်၏ %dGB Premium Account ကို စတင်အသုံးပြုနိုင်ပါပြီ!" },
    'approval_rejected_user': { [LANG_EN]: "❌ *Payment Rejected.* Please check your payment details and contact support @nkka404 if needed. (TxID: `%s`)", [LANG_MY]: "❌ *ငွေပေးချေမှု ငြင်းပယ်ပါသည်*. သင်၏ငွေပေးချေမှု အချက်အလက်များကို စစ်ဆေးပါ၊ လိုအပ်ပါက Support @nkka404 ကို ဆက်သွယ်ပါ။ (TxID: `%s`)" },
    'error_plan_not_found': { [LANG_EN]: "❌ *Invalid plan selected.*", [LANG_MY]: "❌ *မမှန်ကန်သော Plan ကို ရွေးချယ်ထားပါသည်။*" },
    'error_admin_approval_failed': { [LANG_EN]: "❌ *Approval Failed*. Admin must use the correct /approve format.", [LANG_MY]: "❌ *ခွင့်ပြုချက် မအောင်မြင်ပါ*. Admin သည် မှန်ကန်သော /approve ပုံစံကို သုံးရပါမည်။" },
    'error_admin_reject_failed': { [LANG_EN]: "❌ *Rejection Failed*. Could not find user state.", [LANG_MY]: "❌ *ငြင်းပယ်မှု မအောင်မြင်ပါ*. သုံးစွဲသူ၏ အခြေအနေကို ရှာမတွေ့ပါ။" },
    'admin_rejection_done': { [LANG_EN]: "✅ *User %d notified of rejection.*", [LANG_MY]: "✅ *သုံးစွဲသူ %d ကို ငြင်းပယ်ကြောင်း အကြောင်းကြားပြီးပါပြီ။*" },
    'error_already_waiting': { [LANG_EN]: "⚠️ You already have a pending purchase for %dGB. Please send the TxID or use /start to cancel.", [LANG_MY]: "⚠️ သင်သည် %dGB အတွက် ဝယ်ယူမှုတစ်ခု ပြုလုပ်ထားပြီးဖြစ်သည်။ ကျေးဇူးပြု၍ TxID ကို ပို့ပါ သို့မဟုတ် ပယ်ဖျက်ရန် /start ကို သုံးပါ။" },
    'field_account_name': { [LANG_EN]: "🔑 *Account Name (Key):*", [LANG_MY]: "🔑 *အကောင့်အမည် (Key):*" },

    // --- Ban/Unban Localization ---
    'cmd_ban': { [LANG_EN]: "/ban `<ID/USERNAME>` - Ban a user from the bot", [LANG_MY]: "/ban `<ID/USERNAME>` - သုံးစွဲသူအား ဘော့အသုံးပြုခွင့် ပိတ်ရန်" },
    'cmd_unban': { [LANG_EN]: "/unban `<ID/USERNAME>` - Unban a user from the bot", [LANG_MY]: "/unban `<ID/USERNAME>` - သုံးစွဲသူအား ဘော့အသုံးပြုခွင့် ဖွင့်ရန်" },
    'error_user_already_banned': { [LANG_EN]: "❌ *User already banned*", [LANG_MY]: "❌ *သုံးစွဲသူသည် ပိတ်ပင်ထားပြီးသားဖြစ်သည်*" },
    'error_user_not_banned': { [LANG_EN]: "❌ *User is not currently banned*", [LANG_MY]: "❌ *သုံးစွဲသူအား ပိတ်ပင်ထားခြင်းမရှိပါ*" },
    'error_cannot_ban_admin': { [LANG_EN]: "❌ *Cannot ban an admin*", [LANG_MY]: "❌ *Admin အား ပိတ်ပင်ခွင့်မပြုပါ*" },
    'ban_success_admin': { [LANG_EN]: "✅ *User %s has been successfully banned.*", [LANG_MY]: "✅ *သုံးစွဲသူ %s အား ပိတ်ပင်လိုက်ပါပြီ။*" },
    'unban_success_admin': { [LANG_EN]: "✅ *User %s has been successfully unbanned.*", [LANG_MY]: "✅ *သုံးစွဲသူ %s အား ပိတ်ပင်မှုမှ ပြန်လည်ဖွင့်လိုက်ပါပြီ။*" },
    'user_banned_notification': {
        [LANG_EN]: "❌ *Account Suspension Notice*\n━━━━━━━━━━━━━━━━━\nYou are currently banned from using this bot due to policy violation or abuse.\n\n_If you believe this was a mistake or want to appeal, please contact the admin._",
        [LANG_MY]: "❌ *အကောင့်ပိတ်သိမ်းခြင်း အကြောင်းကြားစာ*\n━━━━━━━━━━━━━━━━━\nပေါ်လစီချိုးဖောက်မှု သို့မဟုတ် အလွဲသုံးစားပြုမှုကြောင့် ဤဘော့အသုံးပြုခွင့်ကို ပိတ်ပင်ထားပါသည်။\n\n_အကယ်၍ မှားယွင်းမှုဖြစ်ကြောင်း သို့မဟုတ် ပြန်လည်တောင်းဆိုလိုပါက Admin အား ဆက်သွယ်ပါ။_"
    },
    'user_unbanned_notification': {
        [LANG_EN]: "✅ *Account Reactivated*\n━━━━━━━━━━━━━━━━━\nYour ban has been lifted. You can now use the bot again. Welcome back!",
        [LANG_MY]: "✅ *အကောင့်ပြန်လည်အသုံးပြုနိုင်ပါပြီ*\n━━━━━━━━━━━━━━━━━\nသင်၏ ပိတ်ပင်မှုအား ရုပ်သိမ်းလိုက်ပါပြီ။ ဘော့ကို ပြန်လည်အသုံးပြုနိုင်ပါပြီ။ ပြန်လည်ကြိုဆိုပါသည်။"
    },
    'access_denied_banned': {
        [LANG_EN]: "*❌ Access Denied!*\n━━━━━━━━━━━━━━━━━\n*You are currently banned from using this bot.*\n\n_If you believe this was a mistake or want to appeal, please contact the admin._",
        [LANG_MY]: "*❌ အသုံးပြုခွင့် ငြင်းပယ်ပါသည်!*\n━━━━━━━━━━━━━━━━━\n*သင်သည် ဤဘော့အသုံးပြုခွင့် ပိတ်ပင်ခံထားရပါသည်။*\n\n_အကယ်၍ မှားယွင်းမှုဖြစ်ကြောင်း သို့မဟုတ် ပြန်လည်တောင်းဆိုလိုပါက Admin အား ဆက်သွယ်ပါ။_"
    },

    // --- Admin Commands (UPDATED) ---
    'button_admin_menu': { [LANG_EN]: "👑 Admin Tools", [LANG_MY]: "👑 Admin ကိရိယာများ" },
    'button_admin_manage': { [LANG_EN]: "🛠 Manage Accounts", [LANG_MY]: "🛠 အကောင့်စီမံရန်" },
    'button_admin_automation': { [LANG_EN]: "⚙️ Automation", [LANG_MY]: "⚙️ အလိုအလျောက်လုပ်ဆောင်ခြင်း" },
    'button_admin_kv': { [LANG_EN]: "🗄 KV Tools", [LANG_MY]: "🗄 KV ကိရိယာများ" },
    'menu_admin_title': { [LANG_EN]: "👑 *Admin Control Panel*", [LANG_MY]: "👑 *Admin ထိန်းချုပ်ရေး Panel*" },
    'admin_menu_desc': { [LANG_EN]: "Select a category to manage V2Ray accounts and bot operations:", [LANG_MY]: "V2Ray အကောင့်များနှင့် ဘော့လုပ်ဆောင်မှုများကို စီမံခန့်ခွဲရန် အမျိုးအစားတစ်ခုကို ရွေးချယ်ပါ:" },

    'admin_commands': { [LANG_EN]: "👑 *Admin Commands:*", [LANG_MY]: "👑 *Admin Command များ*:" },
    'cmd_create': { [LANG_EN]: "/create `<GB> <NAME> <DAYS> [PANEL]` - Create premium", [LANG_MY]: "/create `<GB> <NAME> <DAYS> [PANEL]` - Premium ဖန်တီးရန်" },
    'cmd_delprem': { [LANG_EN]: "/delprem `<NAME> <PANEL>` - Delete premium", [LANG_MY]: "/delprem `<NAME> <PANEL>` - Premium ဖျက်ရန်" },
    'cmd_deltrial': { [LANG_EN]: "/deltrial `<ID>` - Delete trial account", [LANG_MY]: "/deltrial `<ID>` - အစမ်းသုံးအကောင့် ဖျက်ရန်" },
    'cmd_delexp': { [LANG_EN]: "/delexp `[PANEL]` - Delete expired accounts", [LANG_MY]: "/delexp `[PANEL]` - သက်တမ်းကုန် အကောင့်များ ဖျက်ရန်" },
    'cmd_stats': { [LANG_EN]: "/stats - View bot statistics", [LANG_MY]: "/stats - ဘော့ စာရင်းအင်းများကြည့်ရန်" },
    'cmd_broadcast': { [LANG_EN]: "/broadcast - Send message to all users", [LANG_MY]: "/broadcast - သုံးစွဲသူအားလုံးသို့ စာများပို့ရန်" },
    'cmd_reply': { [LANG_EN]: "/reply `<USER_ID> <MESSAGE>` - Reply to user", [LANG_MY]: "/reply `<USER_ID> <MESSAGE>` - သုံးစွဲသူအား ပြန်လည်ဖြေကြားရန်" },
    'cmd_approve': { [LANG_EN]: "/approve `<ID> <GB>` - Approve purchase", [LANG_MY]: "/approve `<ID> <GB>` - ဝယ်ယူမှုခွင့်ပြုရန်" },
    'cmd_reject': { [LANG_EN]: "/reject `<ID>` - Reject purchase", [LANG_MY]: "/reject `<ID>` - ဝယ်ယူမှုငြင်းပယ်ရန်" },
    'cmd_ban_full': { [LANG_EN]: "/ban `<ID/USERNAME>` - Ban a user from the bot", [LANG_MY]: "/ban `<ID/USERNAME>` - သုံးစွဲသူအား ဘော့အသုံးပြုခွင့် ပိတ်ရန်" },
    'cmd_unban_full': { [LANG_EN]: "/unban `<ID/USERNAME>` - Unban a user from the bot", [LANG_MY]: "/unban `<ID/USERNAME>` - သုံးစွဲသူအား ဘော့အသုံးပြုခွင့် ဖွင့်ရန်" },
    // NEW COMMANDS
    'cmd_transfer': { [LANG_EN]: "/transfer `<USER> <FROM> <TO>` - Transfer account between panels", [LANG_MY]: "/transfer `<USER> <FROM> <TO>` - အကောင့်တစ်ခုကို Panel များအကြား လွှဲပြောင်းရန်" },
    'cmd_resettraffic': { [LANG_EN]: "/reset `<USER> <PANEL>` - Reset user's traffic usage", [LANG_MY]: "/reset `<USER> <PANEL>` - သုံးစွဲသူ၏ Traffic အသုံးပြုမှုကို သတ်မှတ်ရန်" },
    'cmd_modify': { [LANG_EN]: "/mod `<USER> <P> <GB> <D> [PASS]` - Modify account details", [LANG_MY]: "/mod `<USER> <P> <GB> <D> [PASS]` - အကောင့်အသေးစိတ် ပြုပြင်ရန်" },
    'cmd_bulkcreate': { [LANG_EN]: "/bulk `<NAMES,> <GB> <DAYS> <P>` - Create multiple premium accounts", [LANG_MY]: "/bulk `<NAMES,> <GB> <DAYS> <P>` - Premium အကောင့်များစွာ ဖန်တီးရန်" },
    'cmd_runwarnings': { [LANG_EN]: "/runwarnings - Manually run account expiry warnings (Cron)", [LANG_MY]: "/runwarnings - သက်တမ်းကုန်ခါနီး သတိပေးချက်များကို ကိုယ်တိုင် စစ်ဆေးရန် (Cron)" },
    'cmd_optimal': { [LANG_EN]: "/optimal `[type]` - Suggest best panel for creation", [LANG_MY]: "/optimal `[type]` - အကောင်းဆုံး Panel ကို အကြံပြုရန်" },
    'cmd_getkv': { [LANG_EN]: "/getkv `<KEY>` - Retrieve KV key value", [LANG_MY]: "/getkv `<KEY>` - KV key value ကို ရယူရန်" },
    'cmd_setkv': { [LANG_EN]: "/setkv `<KEY> <JSON_VALUE>` - Set KV key value", [LANG_MY]: "/setkv `<KEY> <JSON_VALUE>` - KV key value ကို သတ်မှတ်ရန်" },
    'admin_kv_get_success': { [LANG_EN]: "✅ KV Data for key `%s`:", [LANG_MY]: "✅ KV Data key `%s` အတွက်:" },
    'admin_kv_set_success': { [LANG_EN]: "✅ KV Key `%s` updated successfully.", [LANG_MY]: "✅ KV Key `%s` ကို အောင်မြင်စွာ အပ်ဒိတ်လုပ်ပြီးပါပြီ။" },
    'admin_kv_error': { [LANG_EN]: "❌ KV Operation Failed: %s", [LANG_MY]: "❌ KV လုပ်ဆောင်မှု မအောင်မြင်ပါ: %s" },
    'admin_kv_usage_get': { [LANG_EN]: "❌ *Usage:* /getkv `<KEY>`", [LANG_MY]: "❌ *အသုံးပြုပုံ:* /getkv `<KEY>`" },
    'admin_kv_usage_set': { [LANG_EN]: "❌ *Usage:* /setkv `<KEY> <JSON_VALUE>`", [LANG_MY]: "❌ *အသုံးပြုပုံ:* /setkv `<KEY> <JSON_VALUE>`" },
    'admin_add_credit_success': { [LANG_EN]: "✅ Added %.1f credits to user %s. Current: %.1f", [LANG_MY]: "✅ သုံးစွဲသူ %s ထံသို့ %.1f Credits ပေါင်းထည့်ပြီးပါပြီ။ လက်ရှိ: %.1f" },
    'admin_remove_credit_success': { [LANG_EN]: "✅ Removed %.1f credits from user %s. Current: %.1f", [LANG_MY]: "✅ သုံးစွဲသူ %s ထံမှ %.1f Credits နုတ်ယူပြီးပါပြီ။ လက်ရှိ: %.1f" },
    'admin_credit_usage_add': { [LANG_EN]: "/addcredit `<ID/USERNAME> <AMOUNT>` - Add credit to user", [LANG_MY]: "/addcredit `<ID/USERNAME> <AMOUNT>` - သုံးစွဲသူအား Credit ထည့်ရန်" },
    'admin_credit_usage_remove': { [LANG_EN]: "/removecredit `<ID/USERNAME> <AMOUNT>` - Remove credit from user", [LANG_MY]: "/removecredit `<ID/USERNAME> <AMOUNT>` - သုံးစွဲသူထံမှ Credit နုတ်ရန်" },
    'admin_credit_value_error': { [LANG_EN]: "❌ Amount must be a positive number.", [LANG_MY]: "❌ ပမာဏသည် အပေါင်းကိန်းဂဏန်းဖြစ်ရမည်။" },

    // --- New Status Messages for Admin Commands ---
    'status_transferring': { [LANG_EN]: "🔄 *Transferring account %s from panel %d to %d...*", [LANG_MY]: "🔄 *အကောင့် %s ကို Panel %d မှ %d သို့ လွှဲပြောင်းနေသည်...*" },
    'status_resetting': { [LANG_EN]: "🔄 *Resetting traffic for account %s on panel %d...*", [LANG_MY]: "🔄 *Panel %d ရှိ အကောင့် %s ၏ Traffic ကို သတ်မှတ်နေသည်...*" },
    'status_modifying': { [LANG_EN]: "🔄 *Modifying account %s on panel %d...*", [LANG_MY]: "🔄 *Panel %d ရှိ အကောင့် %s ကို ပြုပြင်နေသည်...*" },
    'status_running_warnings': { [LANG_EN]: "🔄 *Running expiry warnings (Cron job emulation)...*", [LANG_MY]: "🔄 *သက်တမ်းကုန်ခါနီး သတိပေးချက်များ စစ်ဆေးနေသည် (Cron)...*" },
    'status_optimal_panel': { [LANG_EN]: "🔍 *Finding optimal %s panel...*", [LANG_MY]: "🔍 *အကောင်းဆုံး %s Panel ကို ရှာဖွေနေသည်...*" },
    'status_bulk_create': { [LANG_EN]: "🔄 *Starting bulk creation of %d accounts...*", [LANG_MY]: "🔄 *အကောင့် %d ခုအတွက် အစုလိုက် ဖန်တီးမှု စတင်နေသည်...*" },
    'status_fetching_online': { [LANG_EN]: "🔄 *Fetching online user list...*", [LANG_MY]: "🔄 *Online ဝင်နေသော သုံးစွဲသူစာရင်းကို ရယူနေသည်...*" },
    'transfer_success': { [LANG_EN]: "✅ *Account Transfer Successful!*\n\nFrom: Panel %s\nTo: Panel %s\nAccount: `%s`", [LANG_MY]: "✅ *အကောင့်လွှဲပြောင်းမှု အောင်မြင်ပါသည်!*\n\nမှ: Panel %s\nသို့: Panel %s\nအကောင့်: `%s`" },
    'reset_success': { [LANG_EN]: "✅ *Traffic Reset Successful!*\n\nAccount: `%s`\nPanel: %s\nStatus: %s", [LANG_MY]: "✅ *Traffic သတ်မှတ်မှု အောင်မြင်ပါသည်!*\n\nအကောင့်: `%s`\nPanel: %s\nအခြေအနေ: %s" },
    'modify_success': { [LANG_EN]: "✅ *Account Modification Successful!*\n\nAccount: `%s`\nPanel: %s\nStatus: %s", [LANG_MY]: "✅ *အကောင့်ပြုပြင်မှု အောင်မြင်ပါသည်!*\n\nအကောင့်: `%s`\nPanel: %s\nအခြေအနေ: %s" },
    'bulk_success': { [LANG_EN]: "✅ *Bulk Create Initiated!*", [LANG_MY]: "✅ *အစုလိုက်ဖန်တီးမှု စတင်ပါပြီ!*" },
    'warnings_success': { [LANG_EN]: "✅ *Expiry Warnings Run!*", [LANG_MY]: "✅ *သက်တမ်းကုန်ခါနီး သတိပေးချက်များ ပြီးဆုံးပါပြီ!*" },
    'optimal_success': { [LANG_EN]: "✅ *Optimal Panel Found:*\n\nPanel ID: %d\nName: %s\nType: %s", [LANG_MY]: "✅ *အကောင်းဆုံး Panel ကို တွေ့ရှိပါသည်:*\n\nPanel ID: %d\nအမည်: %s\nအမျိုးအစား: %s" },
    'usage_transfer': { [LANG_EN]: "❌ *Usage:* /transfer `<USER> <FROM_PANEL> <TO_PANEL>`\n\nExample: `/transfer user@test.com 1 2`", [LANG_MY]: "❌ *အသုံးပြုပုံ:* /transfer `<USER> <FROM_PANEL> <TO_PANEL>`\n\nဥပမာ: `/transfer user@test.com 1 2`" },
    'usage_resettraffic': { [LANG_EN]: "❌ *Usage:* /reset `<USER> <PANEL>`\n\nExample: `/reset user@test.com 1`", [LANG_MY]: "❌ *အသုံးပြုပုံ:* /reset `<USER> <PANEL>`\n\nဥပမာ: `/reset user@test.com 1`" },
    'usage_modify': { [LANG_EN]: "❌ *Usage:* /mod `<USER> <PANEL> <GB> <DAYS> [NEW_PASS]`\n\nExample: `/mod user@test.com 1 250 30` or `/mod user@test.com 1 0 0 newpass123`", [LANG_MY]: "❌ *အသုံးပြုပုံ:* /mod `<USER> <PANEL> <GB> <DAYS> [NEW_PASS]`\n\nဥပမာ: `/mod user@test.com 1 250 30` သို့မဟုတ် `/mod user@test.com 1 0 0 newpass123`" },
    'usage_bulkcreate': { [LANG_EN]: "❌ *Usage:* /bulk `<NAMES,> <GB> <DAYS> <PANEL>`\n\nExample: `/bulk user1,user2,user3 150 30 1`", [LANG_MY]: "❌ *အသုံးပြုပုံ:* /bulk `<NAMES,> <GB> <DAYS> <PANEL>`\n\nဥပမာ: `/bulk user1,user2,user3 150 30 1`" },
    'usage_optimal': { [LANG_EN]: "❌ *Usage:* /optimal `[premium/trial]`\n\nExample: `/optimal premium`", [LANG_MY]: "/optimal `[type]` - အကောင်းဆုံး Panel ကို အကြံပြုရန်" },
    'error_invalid_panel_range': { [LANG_EN]: "❌ Invalid Panel ID. Must be an integer > 0.", [LANG_MY]: "❌ Panel ID မမှန်ကန်ပါ။ integer > 0 ဖြစ်ရပါမည်။" },
    'error_no_panels_online': { [LANG_EN]: "❌ No panels are currently reported as online.", [LANG_MY]: "❌ လက်ရှိတွင် Online အဖြစ် သတင်းပို့ထားသော Panel မရှိပါ။" },
    'menu_online_users_title': { [LANG_EN]: "🌐 *Currently Online Users*", [LANG_MY]: "🌐 *လက်ရှိ Online ဝင်နေသော သုံးစွဲသူများ*" },
    'field_total_online': { [LANG_EN]: "👥 *Total Online:* %d", [LANG_MY]: "👥 *စုစုပေါင်း Online:* %d" },
    'field_online_on_panel': { [LANG_EN]: "📡 Panel %s (%d users):", [LANG_MY]: "📡 Panel %s (%d ယောက်):" },
    'nav_online_prev': { [LANG_EN]: "⬅️ Previous", [LANG_MY]: "⬅️ ယခင်စာမျက်နှာ" },
    'nav_online_next': { [LANG_EN]: "Next ➡️", [LANG_MY]: "နောက်စာမျက်နှာ ➡️" },
    'no_online_users_found': { [LANG_EN]: "✅ No users are currently reported as online on any panel.", [LANG_MY]: "✅ မည်သည့် Panel တွင်မှ Online ဝင်နေသော သုံးစွဲသူ မရှိပါ။" },

    // --- Language Command Specific ---
    'lang_select_title': { [LANG_EN]: "🌐 *Select your preferred language:*", [LANG_MY]: "🌐 *သင်နှစ်သက်သော ဘာသာစကားကို ရွေးချယ်ပါ*:" },
    'lang_button_en': { [LANG_EN]: "🇬🇧 English", [LANG_MY]: "🇬🇧 English" },
    'lang_button_my': { [LANG_EN]: "🇲🇲 မြန်မာ (Burmese)", [LANG_MY]: "🇲🇲 မြန်မာ (Burmese)" },
    'lang_confirmed': { [LANG_EN]: "✅ Language set to *%s*.", [LANG_MY]: "✅ ဘာသာစကားကို *%s* သို့ ပြောင်းလဲပြီးပါပြီ။" },
    'lang_name_en': { [LANG_EN]: "English", [LANG_MY]: "အင်္ဂလိပ်" },
    'lang_name_my': { [LANG_EN]: "Burmese", [LANG_MY]: "မြန်မာ" },

    // --- Referral / Credit Localization (UPDATED) ---
    'menu_referral_title': { [LANG_EN]: "🤝 Referral Program & Credits", [LANG_MY]: "🤝 ဖိတ်ခေါ်သူ အစီအစဉ်နှင့် Credits များ" },
    'referral_desc': {
        [LANG_EN]: "Invite friends! You get *%.1f Credits* when they join the channel and verify. They must verify channel join to redeem credits.",
        [LANG_MY]: "သူငယ်ချင်းများကို ဖိတ်ခေါ်ပါ။ သူတို့ Channel ဝင်ပြီး စစ်ဆေးသည်နှင့် *%.1f Credits* ရရှိမည်။ Credits လဲလှယ်ရန် Channel Join စစ်ဆေးရန် လိုအပ်ပါသည်။"
    },
    'field_your_credits': { [LANG_EN]: "💰 *Your Credits:*", [LANG_MY]: "💰 *သင်၏ Credits:*" },
    'field_referred_count': { [LANG_EN]: "👥 *Referred Users:*", [LANG_MY]: "👥 *ဖိတ်ခေါ်ထားသူ စုစုပေါင်း:*" },
    'field_your_link': { [LANG_EN]: "🔗 *Your Referral Link:*\n", [LANG_MY]: "🔗 *သင်၏ ဖိတ်ခေါ်လင့်ခ်:*\n" },
    'button_redeem_5gb': { [LANG_EN]: "💎 Redeem 5GB (%.1f Credits)", [LANG_MY]: "💎 5GB လဲလှယ်ရန် (%.1f Credits)" },
    'button_redeem_10gb': { [LANG_EN]: "💎 Redeem 10GB (%.1f Credits)", [LANG_MY]: "💎 10GB လဲလှယ်ရန် (%.1f Credits)" },
    'button_redeem_custom': { [LANG_EN]: "Custom GB Redemption", [LANG_MY]: "စိတ်ကြိုက် GB လဲလှယ်ခြင်း" },
    'prompt_redeem_custom_gb': { [LANG_EN]: "💰 *Enter the GB amount you wish to redeem (min 1GB, cost %.1f Credit/GB):*", [LANG_MY]: "💰 *လဲလှယ်လိုသော GB ပမာဏကို ရိုက်ထည့်ပါ (အနည်းဆုံး 1GB, ကုန်ကျစရိတ် %.1f Credit/GB)*:" },
    'error_invalid_gb_amount': { [LANG_EN]: "❌ Invalid GB amount. Must be an integer ≥ 1.", [LANG_MY]: "❌ GB ပမာဏ မမှန်ကန်ပါ။ integer ≥ 1 ဖြစ်ရပါမည်။" },
    'error_insufficient_credits_custom': { [LANG_EN]: "❌ Insufficient credits. %.1f GB requires %.1f credits.", [LANG_MY]: "❌ Credits မလုံလောက်ပါ။ %.1f GB အတွက် %.1f credits လိုအပ်ပါသည်။" },
    'button_verify_join': { [LANG_EN]: "✅ Verify Channel Join", [LANG_MY]: "✅ Channel Join စစ်ဆေးရန်" },
    'button_credit_history': { [LANG_EN]: "🧾 Credit History", [LANG_MY]: "🧾 Credit မှတ်တမ်း" },
    'button_view_my_keys': { [LANG_EN]: "🔑 View My Redeemed Keys", [LANG_MY]: "🔑 ကျွန်ုပ်လဲလှယ်ထားသော ကီးများ ကြည့်ရန်" },
    'menu_credit_history_title': { [LANG_EN]: "🧾 Your Credit Transaction History", [LANG_MY]: "🧾 သင်၏ Credit အသုံးပြုမှု မှတ်တမ်း" },
    'credit_history_entry_add': { [LANG_EN]: "+%.1f Credits (%s) on %s", [LANG_MY]: "+%.1f Credits (%s) %s တွင်" },
    'credit_history_entry_deduct': { [LANG_EN]: "-%.1f Credits (%s) on %s", [LANG_MY]: "-%.1f Credits (%s) %s တွင်" },
    'credit_history_empty': { [LANG_EN]: "No credit transactions yet.", [LANG_MY]: "Credit မှတ်တမ်း မရှိသေးပါ။" },
    'credit_source_referral': { [LANG_EN]: "Referral from %s", [LANG_MY]: "%s မှ ဖိတ်ခေါ်သူ" },
    'credit_source_admin_add': { [LANG_EN]: "Admin Add", [LANG_MY]: "Admin ထည့်သွင်း" },
    'credit_source_admin_deduct': { [LANG_EN]: "Admin Deduct", [LANG_MY]: "Admin နုတ်ယူ" },
    'credit_source_redeem': { [LANG_EN]: "%dGB Redemption", [LANG_MY]: "%dGB လဲလှယ်ခြင်း" },
    'join_channel_prompt': { [LANG_EN]: `Before verifying, please ensure you have joined our [Channel](${CHANNEL_URL}):`, [LANG_MY]: `မစစ်ဆေးမီ ကျွန်ုပ်တို့၏ [Channel](${CHANNEL_URL}) သို့ ဝင်ထားပြီးကြောင်း သေချာပါစေ။` },
    'status_not_joined': { [LANG_EN]: "❌ You must join the channel to get referral credits.", [LANG_MY]: "❌ Referral Credits ရရှိရန် Channel ကို ဝင်ရပါမည်။" },
    'status_already_joined': { [LANG_EN]: "✅ You have already joined and been verified. You can now redeem your credits.", [LANG_MY]: "✅ သင်သည် Channel ကို ဝင်ရောက်ပြီး စစ်ဆေးပြီးပါပြီ။ သင်၏ Credits များကို ယခုလဲလှယ်နိုင်ပါပြီ။" },
    'status_credit_rewarded_referrer': {
        [LANG_EN]: "🎉 Referral confirmed! You received %.1f Credits from referred user %s for joining the channel.",
        [LANG_MY]: "🎉 ဖိတ်ခေါ်မှု အတည်ပြုပြီးပါပြီ။ သုံးစွဲသူ %s မှ Channel ဝင်ခြင်းအတွက် သင် %.1f Credits ရရှိသွားပါပြီ။"
    },
    'error_channel_check_fail': { [LANG_EN]: "❌ Failed to check channel membership.", [LANG_MY]: "❌ Channel ဝင်ရောက်မှုကို စစ်ဆေးရန် မအောင်မြင်ပါ။" },
    'error_insufficient_credits': { [LANG_EN]: "❌ Insufficient credits. You need %.1f credits for this plan.", [LANG_MY]: "❌ Credits မလုံလောက်ပါ။ ဤ Plan အတွက် %.1f credits လိုအပ်ပါသည်။" },
    'error_unverified_redeem': { [LANG_EN]: "❌ Channel verification required to redeem. Please click '✅ Verify Channel Join' first.", [LANG_MY]: "❌ Credits လဲလှယ်ရန် Channel Join စစ်ဆေးရန် လိုအပ်ပါသည်။ ကျေးဇူးပြု၍ '✅ Channel Join စစ်ဆေးရန်' ကို အရင်နှိပ်ပါ။" },
    'status_redeeming': { [LANG_EN]: "🔄 *Redeeming %dGB Premium...*", [LANG_MY]: "🔄 *%dGB Premium လဲလှယ်နေသည်...*" },
    'redeem_success_user': { [LANG_EN]: "✅ Redemption Successful! %dGB Premium Account is now active on %s. %.1f credits deducted.", [LANG_MY]: "✅ လဲလှယ်မှု အောင်မြင်ပါသည်! %dGB Premium Account ကို %s တွင် စတင်အသုံးပြုနိုင်ပါပြီ။ %.1f Credits နုတ်ယူလိုက်ပါသည်။" },
    'field_redeemed_account': { [LANG_EN]: "✨ *Redeemed Account Details:*", [LANG_MY]: "✨ *လဲလှယ်ထားသော အကောင့်အသေးစိတ်*:" },
    'prompt_select_panel': { [LANG_EN]: "📡 *Select a Server Panel for your %dGB Premium:*", [LANG_MY]: "📡 *သင်၏ %dGB Premium အတွက် Server Panel ကို ရွေးချယ်ပါ*:" },
    'prompt_select_panel_create': { [LANG_EN]: "📡 *Select a Server Panel for %s (%dGB):*", [LANG_MY]: "📡 *%s (%dGB) အတွက် Server Panel ကို ရွေးချယ်ပါ*:" },
    'panel_button_name': { [LANG_EN]: "%s", [LANG_MY]: "%s" },
    'field_panel_name': { [LANG_EN]: "📡 *Server Panel:*", [LANG_MY]: "📡 *Server Panel:*" },

    // --- Key Management Localization (NEW) ---
    'menu_my_keys_title': { [LANG_EN]: "🔑 *Your Redeemed Premium Keys*", [LANG_MY]: "🔑 *သင်လဲလှယ်ထားသော Premium ကီးများ*" },
    'key_details_title': { [LANG_EN]: "Key Details: `%s`", [LANG_MY]: "Key အသေးစိတ်: `%s`" },
    'field_account_key': { [LANG_EN]: "🔑 *Account Key:*", [LANG_MY]: "🔑 *အကောင့်ကီး:*" },
    'field_key_limit': { [LANG_EN]: "📊 *Data Limit:*", [LANG_MY]: "📊 *ဒေတာကန့်သတ်ချက်:*" },
    'field_key_panel': { [LANG_EN]: "📡 *Panel:*", [LANG_MY]: "📡 *Panel:*" },
    'field_key_date': { [LANG_EN]: "📅 *Redeemed On:*", [LANG_MY]: "📅 *လဲလှယ်သည့်ရက်စွဲ:*" },
    'button_delete_key': { [LANG_EN]: "🗑️ Delete Key: %s", [LANG_MY]: "🗑️ ကီး ဖျက်ရန်: %s" },
    'button_view_key': { [LANG_EN]: "🔎 View Details", [LANG_MY]: "🔎 အသေးစိတ် ကြည့်ရန်" },
    'no_redeemed_keys': { [LANG_EN]: "You have not redeemed any keys yet.", [LANG_MY]: "သင်သည် ကီးများ လဲလှယ်ထားခြင်း မရှိသေးပါ။" },
    'error_key_not_found': { [LANG_EN]: "❌ Key not found or does not belong to you.", [LANG_MY]: "❌ ကီးကို ရှာမတွေ့ပါ သို့မဟုတ် သင့်အကောင့်မှ မဟုတ်ပါ။" },
    'error_delete_not_redeemed': { [LANG_EN]: "❌ Only keys purchased with credits can be deleted here.", [LANG_MY]: "❌ Credits ဖြင့် ဝယ်ယူထားသော ကီးများကိုသာ ဤနေရာမှ ဖျက်နိုင်ပါသည်။" },
    'confirm_delete_key': { [LANG_EN]: "⚠️ Are you sure you want to delete key `%s` from Panel %s?", [LANG_MY]: "⚠️ `%s` ကီးကို Panel %s မှ ဖျက်ပစ်ရန် သေချာပါသလား။" },
    'key_deleted_success': { [LANG_EN]: "✅ Key `%s` deleted successfully from Panel %s.", [LANG_MY]: "✅ `%s` ကီးကို Panel %s မှ အောင်မြင်စွာ ဖျက်ပစ်လိုက်ပါပြီ။" },
    'key_delete_fail': { [LANG_EN]: "❌ Failed to delete key `%s`. API Error: %s", [LANG_MY]: "❌ `%s` ကီးကို ဖျက်ရန် မအောင်မြင်ပါ။ API အမှား: %s" },
    'nav_key_prev': { [LANG_EN]: "⬅️ Previous", [LANG_MY]: "⬅️ ယခင်စာမျက်နှာ" },
    'nav_key_next': { [LANG_EN]: "Next ➡️", [LANG_MY]: "နောက်စာမျက်နှာ ➡️" },
    'error_redemption_state_fail': { [LANG_EN]: "❌ Redemption Error. Please try again from the referral menu.", [LANG_MY]: "❌ လဲလှယ်မှု အမှား။ ကျေးဇူးပြု၍ referral menu မှ ပြန်လည်စမ်းသပ်ပါ။" },

    // --- STATS MENU AND USAGE REPORT LOCALIZATION ---
    'button_usage_report': { [LANG_EN]: "📈 Usage Report", [LANG_MY]: "📈 အသုံးပြုမှု အစီရင်ခံစာ" },
    'button_top_users': { [LANG_EN]: "🏆 Top Users", [LANG_MY]: "🏆 ထိပ်တန်း သုံးစွဲသူများ" },

    'menu_basic_stats_title': { [LANG_EN]: "🗒 V2Ray Manager Basic Statistics Menu", [LANG_MY]: "🗒 V2Ray Manager အခြေခံ စာရင်းအင်း Menu" },
    'menu_basic_stats_tip': { [LANG_EN]: "Stay Updated With Real Time Insights....⚡️", [LANG_MY]: "အချိန်နှင့်တစ်ပြေးညီ အချက်အလက်များကို သိရှိနိုင်သည်....⚡️" },
    'menu_basic_stats_content': {
        [LANG_EN]: "๏ Full Statistics: Get Full Statistics Of V2Ray Manager ⚙️\n• Top Users: Get Top User's Leaderboard 🔥\n• Growth Trends: Get Knowledge About Growth 👁\n• Activity Times: See Which User Is Most Active ⏰\n• Milestones: Track Special Achievements 🏅\n\n💡 Select an option and take control:",
        [LANG_MY]: "• အပြည့်အစုံ စာရင်းအင်း: V2Ray Manager ၏ အပြည့်အစုံ စာရင်းအင်းများကို ရယူပါ ⚙️\n• ထိပ်တန်းသုံးစွဲသူများ: ထိပ်တန်း သုံးစွဲသူများ၏ ဦးဆောင်စာရင်းကို ရယူပါ 🔥\n• တိုးတက်မှုလမ်းကြောင်းများ: တိုးတက်မှုအကြောင်း သိရှိရန် 👁\n• လှုပ်ရှားမှုအချိန်များ: မည်သည့်သုံးစွဲသူသည် အများဆုံးအသုံးပြုကြောင်း ကြည့်ရန် ⏰\n• မှတ်တိုင်များ: အထူးအောင်မြင်မှုများကို ခြေရာခံပါ 🏅\n\n💡 ရွေးချယ်စရာတစ်ခုကို ရွေးချယ်ပြီး ထိန်းချုပ်ပါ:"
    },

    'stats_report_title': { [LANG_EN]: "V2Ray Manager Bot Status ✅", [LANG_MY]: "V2Ray Manager Bot Status ✅" },
    'stats_active_day': { [LANG_EN]: "1 Day: %d users were active", [LANG_MY]: "၁ ရက်အတွင်း: %d ဦး အသုံးပြုခဲ့သည်" },
    'stats_active_week': { [LANG_EN]: "1 Week: %d users were active", [LANG_MY]: "၁ ပတ်အတွင်း: %d ဦး အသုံးပြုခဲ့သည်" },
    'stats_active_month': { [LANG_EN]: "1 Month: %d users were active", [LANG_MY]: "၁ လအတွင်း: %d ဦး အသုံးပြုခဲ့သည်" },
    'stats_active_year': { [LANG_EN]: "1 Year: %d users were active", [LANG_MY]: "၁ နှစ်အတွင်း: %d ဦး အသုံးပြုခဲ့သည်" },
    'stats_total_users_line': { [LANG_EN]: "Total V2Ray Manager Users: %d ✅", [LANG_MY]: "စုစုပေါင်း V2Ray Manager သုံးစွဲသူ: %d ✅" },

    // --- Status / Error Messages (START) ---
    'status_creating_trial': { [LANG_EN]: "🔄 *Creating your trial account...*", [LANG_MY]: "🔄 *သင်၏ အစမ်းသုံးအကောင့် ဖန်တီးနေသည်...*" },
    'status_retrieving_trial': { [LANG_EN]: "🔍 *Retrieving your trial account...*", [LANG_MY]: "🔍 *သင်၏ အစမ်းသုံးအကောင့်ကို ရှာဖွေနေသည်...*" },
    'status_checking_config': { [LANG_EN]: "🔍 *Checking account status...*", [LANG_MY]: "🔍 *အကောင့်အခြေအနေ စစ်ဆေးနေသည်...*" },
    'status_retrieving_stats': { [LANG_EN]: "🔄 *Retrieving bot statistics...*", [LANG_MY]: "🔄 *ဘော့၏ စာရင်းအင်းများ ရယူနေသည်...*" },
    'status_broadcasting': { [LANG_EN]: "📢 *Broadcasting message to %d users (%d/%d)...*", [LANG_MY]: "📢 *သုံးစွဲသူ %d ဦးထံသို့ စာများ ပို့လွှတ်နေသည် (%d/%d)...*" },
    'trial_success_title': { [LANG_EN]: "🎉 *Trial Account Created Successfully!*", [LANG_MY]: "🎉 *အစမ်းသုံးအကောင့် ဖန်တီးမှု အောင်မြင်ပါသည်!*" },
    'trial_account_info_title': { [LANG_EN]: "🔍 *Your Trial Account*", [LANG_MY]: "🔍 *သင်၏ အစမ်းသုံးအကောင့်*" },
    'field_email': { [LANG_EN]: "📧 *Email:*", [LANG_MY]: "📧 *အီးမေးလ်:*" },
    'field_password': { [LANG_EN]: "🔑 *Password:*", [LANG_MY]: "🔑 *စကားဝှက်:*" },
    'field_data_limit': { [LANG_EN]: "📊 *Data Limit:*", [LANG_MY]: "📊 *ဒေတာကန့်သတ်ချက်:*" },
    'field_expiry': { [LANG_EN]: "⏰ *Expiry:*", [LANG_MY]: "⏰ *သက်တမ်း:*" },
    'field_link': { [LANG_EN]: "🔗 *Configuration Link:*", [LANG_MY]: "🔗 *Configuration Link:*" },
    'field_qr': { [LANG_EN]: "📱 *QR Code:*", [LANG_MY]: "📱 *QR ကုဒ်:*" },
    'tip_copy_link': { [LANG_EN]: "💡 *Copy the link or scan QR code to use your account*", [LANG_MY]: "💡 *အကောင့်အသုံးပြုရန် လင့်ခ်ကို ကူးယူပါ သို့မဟုတ် QR ကုဒ်ကို စကင်ဖတ်ပါ။*" },
    'field_data_usage': { [LANG_EN]: "📊 *Data Usage:*", [LANG_MY]: "📊 *ဒေတာအသုံးပြုမှု*:" },
    'field_upload': { [LANG_EN]: "⬆️ *Upload:*", [LANG_MY]: "⬆️ *Upload:*" },
    'field_download': { [LANG_EN]: "⬇️ *Download:*", [LANG_MY]: "⬇️ *Download:*" },
    'field_remaining': { [LANG_EN]: "📦 *Remaining:*", [LANG_MY]: "📦 *ကျန်ရှိသော:*" },
    'error_creation_failed': { [LANG_EN]: "❌ *Account Creation Failed*", [LANG_MY]: "❌ *အကောင့်ဖန်တီးမှု မအောင်မြင်ပါ*" },
    'error_prefix': { [LANG_EN]: "Error:", [LANG_MY]: "အမှားအယွင်း:" },
    'error_account_not_found': { [LANG_EN]: "❌ *Account Not Found*", [LANG_MY]: "❌ *အကောင့်ကို ရှာမတွေ့ပါ*" },
    'tip_create_new_trial': { [LANG_EN]: "💡 *Create a new trial account using /trial command*", [LANG_MY]: "💡 *အစမ်းသုံးအကောင့်အသစ်ကို /trial command ဖြင့် ဖန်တီးနိုင်ပါသည်။*" },
    'account_status_title': { [LANG_EN]: "📊 *Account Status*", [LANG_MY]: "📊 *အကောင့်အခြေအနေ*" },
    'field_protocol': { [LANG_EN]: "🛡️ *Protocol:*", [LANG_MY]: "🛡️ *Protocol:*" },
    'field_panel': { [LANG_EN]: "📡 *Panel:*", [LANG_MY]: "📡 *Panel:*" },
    'field_status': { [LANG_EN]: "🔧 *Status:*", [LANG_MY]: "🔧 *အခြေအနေ:*" },
    'status_active': { [LANG_EN]: "✅ Active", [LANG_MY]: "✅ အသုံးပြုနေ" },
    'status_disabled': { [LANG_EN]: "❌ Disabled", [LANG_MY]: "❌ ပိတ်ထားသည်" },
    'field_expiry_status': { [LANG_EN]: "⏰ *Expiry Status:*", [LANG_MY]: "⏰ *သက်တမ်းအခြေအနေ:*" },
    'expiry_expired': { [LANG_EN]: "❌ Expired", [LANG_MY]: "❌ သက်တမ်းကုန်" },
    'expiry_expiring_soon': { [LANG_EN]: "⚠️ Expiring Soon", [LANG_MY]: "⚠️ သက်တမ်းကုန်ခါနီး" },
    'traffic_usage_title': { [LANG_EN]: "📈 *Traffic Usage:*", [LANG_MY]: "📈 *Traffic အသုံးပြုမှု:*" },
    'field_total': { [LANG_EN]: "📦 Total:", [LANG_MY]: "📦 စုစုပေါင်း:" },
    'field_used': { [LANG_EN]: "📊 Used:", [LANG_MY]: "📊 အသုံးပြုပြီး:" },
    'field_remaining_traffic': { [LANG_EN]: "🎯 Remaining:", [LANG_MY]: "🎯 ကျန်ရှိသော:" },
    'field_usage_percent': { [LANG_EN]: "📊 Usage:", [LANG_MY]: "📊 အသုံးပြုမှုရာခိုင်နှုန်း:" },
    'expiry_details_title': { [LANG_EN]: "⏳ *Expiry Details:*", [LANG_MY]: "⏳ *သက်တမ်းအသေးစိတ်*:" },
    'field_remaining_time': { [LANG_EN]: "🕒 Remaining:", [LANG_MY]: "🕒 ကျန်ရှိချိန်:" },
    'field_expiry_date': { [LANG_EN]: "📅 Expiry Date:", [LANG_MY]: "📅 သက်တမ်းကုန်ဆုံးရက်:" },
    'field_days_left': { [LANG_EN]: "📆 Days Left:", [LANG_MY]: "📆 ကျန်ရှိရက်များ:" },
    'error_check_failed': { [LANG_EN]: "❌ *Account Check Failed*", [LANG_MY]: "❌ *အကောင့်စစ်ဆေးမှု မအောင်မြင်ပါ*" },
    'tip_check_config': { [LANG_EN]: "💡 *Please check your V2Ray configuration link or email*", [LANG_MY]: "💡 *သင်၏ V2Ray configuration link သို့မဟုတ် အီးမေးလ်ကို ကျေးဇူးပြု၍ စစ်ဆေးပါ။*" },
    'apps_select_device': { [LANG_EN]: "📱 *Please select the type of device you are using.*", [LANG_MY]: "📱 *သင်အသုံးပြုနေသော စက်အမျိုးအစားကို ရွေးချယ်ပါ။*" },
    'apps_ios_msg': { [LANG_EN]: "📱 *Outline VPN for iOS* is available from the App Store.", [LANG_MY]: "📱 *iOS အတွက် Outline VPN* ကို App Store မှ ရရှိနိုင်ပါသည်။" },
    'apps_android_msg': { [LANG_EN]: "🤖 *Outline VPN for Android* is available from the Google Play Store.", [LANG_MY]: "🤖 *Android အတွက် Outline VPN* ကို Google Play Store မှ ရရှိနိုင်ပါသည်။" },
    'apps_macos_msg': { [LANG_EN]: "🍎 *Outline VPN for macOS* is available from the App Store.", [LANG_MY]: "🍎 *macOS အတွက် Outline VPN* ကို App Store မှ ရရှိနိုင်ပါသည်။" },
    'apps_windows_msg': { [LANG_EN]: "🖥️ *Outline VPN for Windows*", [LANG_MY]: "🖥️ *Windows အတွက် Outline VPN*" },
    'apps_windows_link_body': { [LANG_EN]: "You can get Outline VPN for Windows directly from the link below:", [LANG_MY]: "Windows အတွက် Outline VPN ကို အောက်ပါလင့်ခ်မှ တိုက်ရိုက်ရယူနိုင်ပါသည်:" },
    'admin_access_denied': { [LANG_EN]: "❌ *Access Denied*\n\nThis command is for administrators only.", [LANG_MY]: "❌ *ခွင့်ပြုချက်မရှိပါ*\n\nဤ command သည် စီမံခန့်ခွဲသူများ (Administrators) အတွက်သာ ဖြစ်ပါသည်။" },
    'request_usage': { [LANG_EN]: "❌ *Usage:* /request `<your message>`\n\nExample: `/request I need help with my account`", [LANG_MY]: "❌ *အသုံးပြုပုံ:* /request `<သင်၏ မက်ဆေ့ချ်>`\n\nဥပမာ: `/request ကျွန်တော့်အကောင့်အတွက် အကူအညီလိုပါတယ်`" },
    'request_admin_sent': { [LANG_EN]: "✅ *Your request has been sent to administrators!*\n\nWe'll get back to you soon.", [LANG_MY]: "✅ *သင်၏ တောင်းဆိုချက်ကို စီမံခန့်ခွဲသူများထံ ပို့ပြီးပါပြီ။*\n\nမကြာမီ ပြန်ကြားပါမည်။" },
    'reply_from_admin': { [LANG_EN]: "💬 *Message from Administrator*", [LANG_MY]: "💬 *စီမံခန့်ခွဲသူထံမှ မက်ဆေ့ချ်*" },
    'reply_tip': { [LANG_EN]: "_You can reply using /request command_", [LANG_MY]: "_သင်သည် /request command ကို အသုံးပြု၍ ပြန်လည်ဖြေကြားနိုင်ပါသည်_" },
    'reply_success_admin': { [LANG_EN]: "✅ *Message sent successfully!*", [LANG_MY]: "✅ *မက်ဆေ့ချ်ပို့ခြင်း အောင်မြင်ပါသည်!*" },
    'reply_fail_admin': { [LANG_EN]: "❌ *Failed to send message to user!*\n\nUser might have blocked the bot.", [LANG_MY]: "❌ *သုံးစွဲသူထံသို့ မက်ဆေ့ချ်ပို့ရန် မအောင်မြင်ပါ။*\n\nသုံးစွဲသူသည် ဘော့ကို ပိတ်ထားနိုင်ပါသည်။" },
    'admin_to': { [LANG_EN]: "👤 *To:*", [LANG_MY]: "👤 *သို့:*" },
    'admin_message_content': { [LANG_EN]: "📝 *Message:*", [LANG_MY]: "📝 *မက်ဆေ့ချ်:*" },
    'stats_last_updated': { [LANG_EN]: "📅 *Last Updated:*", [LANG_MY]: "📅 *နောက်ဆုံး အဆင့်မြှင့်တင်ချိန်:*" },
    'stats_no_username': { [LANG_EN]: "No username", [LANG_MY]: "Username မရှိပါ" }, // KEEP THIS ONE
    'broadcast_usage': { [LANG_EN]: "📢 *Broadcast Message*\n\nTo send a broadcast:\n1. Type your message (text, photo, document)\n2. Reply to that message with /broadcast", [LANG_MY]: "📢 *Broadcast မက်ဆေ့ချ်*\n\nBroadcast ပို့ရန်:\n1. မက်ဆေ့ချ် (စာ၊ ဓာတ်ပုံ၊ စာရွက်စာတမ်း) ရိုက်ထည့်ပါ။\n2. ထိုမက်ဆေ့ချ်ကို /broadcast ဖြင့် အကြောင်းပြန်ပါ။" },
    'broadcast_complete': { [LANG_EN]: "✅ *Broadcast Completed!*", [LANG_MY]: "✅ *Broadcast လုပ်ဆောင်ခြင်း ပြီးပါပြီ!*" },
    'broadcast_success': { [LANG_EN]: "📤 Successful:", [LANG_MY]: "📤 အောင်မြင်သူ:" },
    'broadcast_failed': { [LANG_EN]: "❌ Failed:", [LANG_MY]: "❌ ကျရှုံးသူ:" },
    'broadcast_total': { [LANG_EN]: "👥 Total:", [LANG_MY]: "👥 စုစုပေါင်း:" },
    'broadcast_failed_error': { [LANG_EN]: "❌ *Broadcast Failed*", [LANG_MY]: "❌ *Broadcast မအောင်မြင်ပါ*" },
    'status_creating_premium': { [LANG_EN]: "🔄 *Creating premium account...*", [LANG_MY]: "🔄 *Premium အကောင့် ဖန်တီးနေသည်...*" },
    'status_deleting_premium': { [LANG_EN]: "🔄 *Deleting premium account...*", [LANG_MY]: "🔄 *Premium အကောင့် ဖျက်နေသည်...*" },
    'status_deleting_trial': { [LANG_EN]: "🔄 *Deleting trial account...*", [LANG_MY]: "🔄 *အစမ်းသုံးအကောင့် ဖျက်နေသည်...*" },
    'status_deleting_expired': { [LANG_EN]: "🔄 *Deleting expired %s...*", [LANG_MY]: "🔄 *သက်တမ်းကုန် %s များ ဖျက်နေသည်...*" },
    'delete_exp_premium_type': { [LANG_EN]: "premium accounts from panel %s", [LANG_MY]: "Panel %s မှ Premium အကောင့်များ" },
    'delete_exp_trial_type': { [LANG_EN]: "trial accounts", [LANG_MY]: "အစမ်းသုံးအကောင့်များ" },
    'admin_usage': { [LANG_EN]: "❌ *Usage:*", [LANG_MY]: "❌ *အသုံးပြုပုံ:*" },
    'create_success_title': { [LANG_EN]: "✅ *Premium Account Created Successfully!*", [LANG_MY]: "✅ *Premium အကောင့် ဖန်တီးမှု အောင်မြင်ပါသည်!*" },
    'field_expiry_days': { [LANG_EN]: "⏰ *Expiry:*", [LANG_MY]: "⏰ *သက်တမ်း:*" },
    'field_panel_id': { [LANG_EN]: "🛠️ *Panel:*", [LANG_MY]: "🛠️ *Panel:*" },
    'delete_prem_success': { [LANG_EN]: "✅ *Premium Account Deleted Successfully!*", [LANG_MY]: "✅ *Premium အကောင့် ဖျက်သိမ်းမှု အောင်မြင်ပါသည်!*" },
    'delete_trial_success': { [LANG_EN]: "✅ *Trial Account Deleted Successfully!*", [LANG_MY]: "✅ *အစမ်းသုံးအကောင့် ဖျက်သိမ်းမှု အောင်မြင်ပါသည်!*" },
    'field_telegram_id': { [LANG_EN]: "🆔 *Telegram ID:*", [LANG_MY]: "🆔 *Telegram ID:*" },
    'delete_exp_complete': { [LANG_EN]: "✅ *Expired Accounts Deletion Completed!*", [LANG_MY]: "✅ *သက်တမ်းကုန် အကောင့်များ ဖျက်သိမ်းခြင်း ပြီးပါပြီ!*" },
    'field_deleted_type': { [LANG_EN]: "📊 *Type:*", [LANG_MY]: "📊 *အမျိုးအစား:*" },
    'field_deleted_count': { [LANG_EN]: "✅ *Deleted:*", [LANG_MY]: "✅ *ဖျက်သိမ်းပြီး:*" },
    'field_total_expired': { [LANG_EN]: "📋 *Total Found:*", [LANG_MY]: "📋 *စုစုပေါင်း တွေ့ရှိ:*" },
    'field_failed_deletions': { [LANG_EN]: "❌ *Failed Deletions:*", [LANG_MY]: "❌ *ဖျက်သိမ်းမှု မအောင်မြင်သူများ:*" },
    'field_status_result': { [LANG_EN]: "📝 *Status:*", [LANG_MY]: "📝 *အခြေအနေ:*" },
    'error_admin_create_failed': { [LANG_EN]: "❌ *Premium Account Creation Failed*", [LANG_MY]: "❌ *Premium အကောင့် ဖန်တီးမှု မအောင်မြင်ပါ*" },
    'error_admin_delete_failed': { [LANG_EN]: "❌ *Premium Account Deletion Failed*", [LANG_MY]: "❌ *Premium အကောင့် ဖျက်သိမ်းမှု မအောင်မြင်ပါ*" },
    'error_admin_deltrial_failed': { [LANG_EN]: "❌ *Trial Account Deletion Failed*", [LANG_MY]: "❌ *အစမ်းသုံးအကောင့် ဖျက်သိမ်းမှု မအောင်မြင်ပါ*" },
    'error_admin_delexp_failed': { [LANG_EN]: "❌ *Expired Accounts Deletion Failed*", [LANG_MY]: "❌ *သက်တမ်းကုန် အကောင့်များ ဖျက်သိမ်းမှု မအောင်မြင်ပါ*" },
    'error_user_not_found': { [LANG_EN]: "❌ *User not found!*\n\nUser ID: `%s` not in database.", [LANG_MY]: "❌ *သုံးစွဲသူကို ရှာမတွေ့ပါ!* \n\nUser ID: `%s` သည် Database ထဲတွင် မရှိပါ။" },
    'check_usage': { [LANG_EN]: "❌ *Usage:* Send a V2Ray link (vmess://, vless://, trojan://, ss://) or a subscription email/UUID directly.\n\nExample: `vmess://...` or `user@example.com`", [LANG_MY]: "❌ *အသုံးပြုပုံ:* V2Ray link (vmess://, vless://, trojan://, ss://) သို့မဟုတ် subscription email/UUID ကို တိုက်ရိုက်ပို့ပါ။\n\nဥပမာ: `vmess://...` သို့မဟုတ် `user@example.com`" },
    'nav_next': { [LANG_EN]: "Next ➡", [LANG_MY]: "ရှေ့သို့ ➡" },
    'nav_prev': { [LANG_EN]: "⬅ Previous", [LANG_MY]: "⬅ နောက်သို့" },
    'nav_close': { [LANG_EN]: "⬅ Back to Menu", [LANG_MY]: "⬅ Menu သို့ ပြန်သွားရန်" },
    'stats_title': { [LANG_EN]: "📊 *Bot Statistics Summary*", [LANG_MY]: "📊 *ဘော့၏ စာရင်းအင်း အကျဉ်းချုပ်*" },
    'stats_total_users': { [LANG_EN]: "👥 *Total Users:*", [LANG_MY]: "👥 *စုစုပေါင်း သုံးစွဲသူ:*" },
    'stats_top_title': { [LANG_EN]: "🏆 *Top Users (All-time) — Page %d/%d:*", [LANG_MY]: "🏆 *ထိပ်တန်း သုံးစွဲသူများ (အချိန်အားလုံး) — စာမျက်နှာ %d/%d:*" },
    'user_id_label': { [LANG_EN]: " - User Id :", [LANG_MY]: " - User Id :" },
};
