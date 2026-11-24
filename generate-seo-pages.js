'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const PARTS_PATH = path.join(ROOT_DIR, 'parts.json');
const INDEX_PATH = path.join(ROOT_DIR, 'index.html');
const SITEMAP_PATH = path.join(ROOT_DIR, 'sitemap.xml');
const BUILDS_DIR = path.join(ROOT_DIR, 'builds');
const SITE_BASE_URL = 'https://pcbuilder-ar.pages.dev';
const TODAY_ISO = new Date().toISOString().slice(0, 10);

// ============================================================================
// 1. Load parts.json & extract gamesCatalog / monitorCatalog / coupons from index.html
// ============================================================================
function loadDatabase() {
  if (!fs.existsSync(PARTS_PATH)) {
    throw new Error(`Missing parts.json at ${PARTS_PATH}`);
  }
  return JSON.parse(fs.readFileSync(PARTS_PATH, 'utf8'));
}

function extractGamesCatalog(indexHtml) {
  const match = indexHtml.match(/const\s+gamesCatalog\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error('Could not find gamesCatalog in index.html');
  }
  // Evaluate JS array literal safely in an isolated Function
  return Function(`"use strict"; return (${match[1]});`)();
}

function extractCoupons(indexHtml) {
  const match = indexHtml.match(/const\s+ALIEXPRESS_COUPONS\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) {
    return [
      { minUsd: 29, discountUsd: 3, code: 'BFAR03' },
      { minUsd: 69, discountUsd: 8, code: 'BFAR08' },
      { minUsd: 169, discountUsd: 20, code: 'BFAR20' },
      { minUsd: 239, discountUsd: 30, code: 'BFAR30' },
      { minUsd: 369, discountUsd: 50, code: 'BFAR50' },
      { minUsd: 499, discountUsd: 70, code: 'BFAR70' }
    ];
  }
  return Function(`"use strict"; return (${match[1]});`)();
}

function extractMonitorCatalog(indexHtml) {
  const match = indexHtml.match(/const\s+monitorCatalog\s*=\s*(\{[\s\S]*?\n\s*\});/);
  if (!match) {
    return {
      entry: { badge: '1080p FHD • 144Hz - 180Hz IPS', desc: 'دقة Full HD تمنحك أعلى سلاسة واستجابة سريعة.', items: [] },
      mid: { badge: '1080p 240Hz أو 2K QHD 165Hz', desc: 'كارت الشاشة قادر على تشغيل الألعاب بدقة 2K بسلاسة.', items: [] },
      ultra: { badge: '2K QHD 240Hz أو 4K UHD 144Hz', desc: 'تجميعتك من الفئة العليا وتستحق شاشة 2K سريعة أو 4K.', items: [] }
    };
  }
  return Function(`"use strict"; return (${match[1]});`)();
}

// ============================================================================
// 2. Define 25 SEO-Targeted PC Build Articles
// ============================================================================
const BUILDS_CONFIG = [
  {
    slug: 'budget-gaming-pc-build',
    keyword: 'تجميعة ألعاب اقتصادية',
    title: 'أفضل تجميعة ألعاب اقتصادية 2026: أداء ممتاز بسعر لا يُنافس',
    category: 'تجميعات اقتصادية',
    badgeEmoji: '💸',
    targetRes: '1080p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['ea_fc_26', 'valorant', 'gta_v', 'fortnite'],
    parts: { cpu: 'i3_12100f', cooler: 'stock_cooler', mb: 'h610m_e', ram: 'ram_16_d4', gpu: 'rx580_8g', storage: 'nvme_512', psu: 'psu_550w_bronze' },
    metaDesc: 'دليل شامل لأفضل تجميعة ألعاب اقتصادية لعام 2026 بمعالج Core i3-12100F وكارت RX 580 8GB ورام 16GB، مع جدول القطع وتقدير FPS في أشهر الألعاب ورابط التعديل المباشر.',
    summary: 'إذا كنت تبحث عن تجميعة ألعاب اقتصادية بأقل تكلفة ممكنة تشغل أشهر الألعاب مثل GTA V و EA FC 26 و Valorant بدقة 1080p، فهذه التجميعة تمنحك أعلى قيمة مقابل كل دولار.',
    whyText: 'تم اعتماد معالج Intel Core i3-12100F لأدائه القوي في النواة الواحدة وسعره المنخفض مع لوحة H610M-E اقتصادية، واقترانه بكارت RX 580 8GB الذي لا يزال ملك الفئة الاقتصادية في دقة 1080p بفضل ذاكرة 8GB VRAM.',
    audienceText: 'مناسبة للاعبين بميزانية محدودة، طلاب المدارس والجامعات، ومحبي ألعاب الرياضات الإلكترونية والألعاب الشعبية على شاشات 1080p.',
    upgradePath: 'مستقبلاً يمكنك ترقية كارت الشاشة إلى RX 6600 أو RTX 4060 دون الحاجة لتغيير المعالج أو مزود الطاقة (550W)، كما تدعم اللوحة الترقية إلى معالج Core i5-12400F أو i5-13400F.'
  },
  {
    slug: '4k-video-editing-workstation-pc',
    keyword: 'تجميعة مونتاج 4K',
    title: 'أقوى تجميعة مونتاج 4K احترافية 2026: رندر فائق السرعة بدون تقطيع',
    category: 'مونتاج وصناعة محتوى',
    badgeEmoji: '🎬',
    targetRes: '4K',
    readTime: '6 دقائق قراءة',
    featuredGames: ['cyberpunk_2077', 'wukong', 'rdr2', 'warzone'],
    parts: { cpu: 'i7_14700kf', cooler: 'aio_360_liquid', mb: 'b760m_a_wifi', ram: 'ram_64_d5', gpu: 'rtx5070_ti_16g', storage: 'nvme_2tb', psu: 'psu_850w_gold' },
    metaDesc: 'تجميعة مونتاج 4K احترافية لعام 2026 بمعالج Intel Core i7-14700KF وذاكرة 64GB DDR5 وكارت RTX 5070 Ti 16GB، مثالية لبرامج Premiere Pro و DaVinci Resolve و After Effects.',
    summary: 'تجميعة مونتاج 4K متكاملة مصممة للمحررين وصناع المحتوى: تجمع بين 20 نواة لمعالجة التايملاين الثقيل، 64GB DDR5، وكارت RTX 5070 Ti بذاكرة 16GB لتسريع التصدير والذكاء الاصطناعي.',
    whyText: 'يعتمد المونتاج الاحترافي بدقة 4K وعمليات تصحيح الألوان في DaVinci Resolve و Premiere Pro على تعدد الأنوية وسعة الرام الكبيرة وذاكرة الكارت. لذلك اخترنا i7-14700KF مع مبرد مائي 360mm ورام 64GB DDR5 بسرعة 6000MHz وقرص Samsung 990 Pro / KC3000 Gen4 بسعة 2TB.',
    audienceText: 'صنّاع المحتوى على يوتيوب، مونتيرو الفيديو بدقة 4K RAW، ومستخدمو After Effects و Blender الباحثون عن أوقات رندر قياسية.',
    upgradePath: 'التجميعة تأتي بباور 850W Gold PCIe 5.1 وقابلة لإضافة قرص NVMe ثانوي مخصص لملفات الكاش (Scratch Disk) أو الترقية مستقبلاً إلى RTX 5080.'
  },
  {
    slug: '1080p-high-fps-gaming-pc',
    keyword: 'تجميعة 1080p فريمات عالية',
    title: 'أفضل تجميعة 1080p فريمات عالية 2026: سلاسة 144Hz+ في كل الألعاب',
    category: 'قيمنق 1080p احترافي',
    badgeEmoji: '🎯',
    targetRes: '1080p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['valorant', 'cs2', 'warzone', 'fortnite'],
    parts: { cpu: 'r5_5600', cooler: 'single_tower_argb', mb: 'b550m_ds3h', ram: 'ram_16_d4', gpu: 'rx6600_8g', storage: 'nvme_1tb', psu: 'psu_550w_bronze' },
    metaDesc: 'تجميعة 1080p فريمات عالية لعام 2026 بمعالج Ryzen 5 5600 وكارت Radeon RX 6600 8GB وقرص 1TB NVMe Gen4، متوازنة تماماً لشاشات 144Hz و 180Hz.',
    summary: 'التوليفة الذهبية لعشاق اللعب التنافسي: تجميعة 1080p فريمات عالية تضمن لك تشغيل ألعاب الشوتر والباتل رويال بمعدل إطارات يتجاوز 144 FPS دون عنق زجاجة.',
    whyText: 'معالج Ryzen 5 5600 مع كارت RX 6600 8GB يشكلان ثنائياً متوازناً بنسبة عنق زجاجة 0% تقريباً، مع لوحة B550 تدعم PCIe 4.0 وواي فاي مدمج وتخزين سريع 1TB NVMe Gen4 لاستيعاب الألعاب الحديثة.',
    audienceText: 'اللاعبون الباحثون عن تجميعة 1080p فريمات عالية لاستغلال شاشات 144Hz و 165Hz و 180Hz بأفضل سعر ممكن.',
    upgradePath: 'تسمح منصة AM4 ولوحة B550 بالترقية لاحقاً إلى معالج Ryzen 7 5700X3D وزيادة الرام إلى 32GB لإطالة عمر الجهاز سنوات إضافية.'
  },
  {
    slug: 'ultra-budget-apu-gaming-pc',
    keyword: 'تجميعة ألعاب اقتصادية بدون كارت شاشة',
    title: 'تجميعة ألعاب اقتصادية بدون كارت شاشة (Ryzen 5 5600GT): ابدأ بأقل ميزانية',
    category: 'تجميعات اقتصادية',
    badgeEmoji: '🌱',
    targetRes: '1080p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['valorant', 'ea_fc_26', 'gta_v', 'fortnite'],
    parts: { cpu: 'r5_5600gt', cooler: 'stock_cooler', mb: 'a520m_a_pro', ram: 'ram_16_d4', gpu: 'none', storage: 'nvme_512', psu: 'psu_450w_bronze' },
    metaDesc: 'أرخص تجميعة ألعاب اقتصادية بدون كارت شاشة منفصل بمعالج Ryzen 5 5600GT وكارت مدمج Vega 7 ورام 16GB، مثالية للدراسة والألعاب الخفيفة.',
    summary: 'تجميعة موجهة لأصحاب الميزانية المحدودة جداً أو الدراسة: تعتمد على كارت Vega 7 المدمج في Ryzen 5 5600GT مع رام ثنائي القناة 16GB لتشغيل الألعاب التنافسية فوراً.',
    whyText: 'يمتلك معالج Ryzen 5 5600GT معالجاً رسومياً مدمجاً قوياً (Vega 7) يغنيك مؤقتاً عن شراء كارت شاشة منفصل، وبوجود 16GB RAM (2x8GB) Dual Channel ستحصل على أقصى أداء ممكن من الكارت المدمج.',
    audienceText: 'الطلاب، المبتدئون في عالم الـ PC، ومن يرغب في شراء جهاز دراسة وعمل وألعاب خفيفة الآن ثم إضافة كارت شاشة لاحقاً.',
    upgradePath: 'بفضل باور 450W Bronze، يمكنك مستقبلاً تركيب كارت GTX 1650 أو RTX 4060 مباشرة لتحويل الجهاز إلى منصة ألعاب قوية.'
  },
  {
    slug: 'budget-gaming-pc-gtx-1660-super',
    keyword: 'تجميعة ألعاب اقتصادية GTX 1660 Super',
    title: 'تجميعة ألعاب اقتصادية بكارت GTX 1660 Super: توازن مثالي للألعاب والعمل',
    category: 'تجميعات اقتصادية',
    badgeEmoji: '🎮',
    targetRes: '1080p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['gta_v', 'ea_fc_26', 'apex_legends', 'pubg'],
    parts: { cpu: 'r5_5500', cooler: 'stock_cooler', mb: 'b450m_k', ram: 'ram_16_d4', gpu: 'gtx1660_super', storage: 'combo_256_1tb', psu: 'psu_550w_bronze' },
    metaDesc: 'مواصفات تجميعة ألعاب اقتصادية بكارت NVIDIA GTX 1660 Super ومعالج Ryzen 5 5500 وتخزين 1.25TB بسعر اقتصادي وأداء مستقر في 1080p.',
    summary: 'خيار ممتاز لمحبي كروت إنفيديا ضمن الميزانية الاقتصادية، مع مساحة تخزين مجمعة 256GB NVMe للنظام + 1TB HDD للألعاب.',
    whyText: 'يقدم معالج Ryzen 5 5500 ستة أنوية و 12 مساراً بتكلفة منخفضة، ويتكامل مع كارت GTX 1660 Super لتقديم تجربة 1080p مستقرة في PUBG و GTA V و Forza Horizon 5 مع دعم ترميز NVENC للبث الخفيف.',
    audienceText: 'من يفضل كروت NVIDIA في الفئة الاقتصادية ويرغب في سعة تخزين كبيرة من اليوم الأول.',
    upgradePath: 'يمكن ترقية الرام إلى 32GB DDR4 واستبدال الكارت مستقبلاً بـ RTX 4060 أو RTX 5060.'
  },
  {
    slug: 'best-value-1080p-rtx-4060-build',
    keyword: 'تجميعة 1080p ألترا RTX 4060',
    title: 'تجميعة 1080p ألترا بكارت RTX 4060 8GB: تقنيات DLSS 3 واستهلاك طاقة منخفض',
    category: 'قيمنق 1080p احترافي',
    badgeEmoji: '🚀',
    targetRes: '1080p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['cyberpunk_2077', 'warzone', 'elden_ring', 'forza_horizon_5'],
    parts: { cpu: 'i5_12400f', cooler: 'single_tower_argb', mb: 'b760m_k_d4', ram: 'ram_16_d4', gpu: 'rtx4060_8g', storage: 'nvme_1tb', psu: 'psu_550w_bronze' },
    metaDesc: 'تجميعة ألعاب 1080p ألترا بكارت RTX 4060 8GB ومعالج Core i5-12400F، مثالية لتشغيل الألعاب الحديثة بإعدادات عالية وتفعيل DLSS 3.',
    summary: 'تجمع هذه التجميعة بين موثوقية معالج i5-12400F وكفاءة معمارية Ada Lovelace في RTX 4060 باستهلاك طاقة لا يتجاوز 115 واط للكارت.',
    whyText: 'يتفوق i5-12400F في الألعاب اليومية ويمنحك منصة LGA1700 مستقرة مع لوحة ASUS B760M-K، بينما يوفر كارت RTX 4060 تقنية Frame Generation لمضاعفة الإطارات في الألعاب الثقيلة.',
    audienceText: 'اللاعبون الذين يريدون تشغيل جميع ألعاب AAA الحديثة على إعدادات High/Ultra بدقة 1080p مع هدوء وحرارة منخفضة.',
    upgradePath: 'توفر لوحة B760M-K قابلية ترقية المعالج إلى الجيل 13 أو 14 ورفع الرام إلى 32GB.'
  },
  {
    slug: 'competitive-esports-valorant-cs2-pc',
    keyword: 'تجميعة ألعاب تنافسية فريمات عالية',
    title: 'تجميعة ألعاب تنافسية Valorant و CS2: استجابة فائقة وفريمات +240 FPS',
    category: 'ألعاب تنافسية Esports',
    badgeEmoji: '⚡',
    targetRes: '1080p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['valorant', 'cs2', 'fortnite', 'apex_legends'],
    parts: { cpu: 'r5_7600x', cooler: 'single_tower_argb', mb: 'b650m_gaming_wifi', ram: 'ram_32_d5', gpu: 'rtx5060_8g', storage: 'nvme_1tb', psu: 'psu_650w_bronze' },
    metaDesc: 'تجميعة ألعاب تنافسية 1080p فريمات عالية تتجاوز 240 FPS في Valorant و CS2 و Fortnite بمعالج Ryzen 5 7600X وذاكرة DDR5 6000MHz وكارت RTX 5060.',
    summary: 'مصممة خصيصاً لشاشات 240Hz: معالج سريع على منصة AM5 مع رام 32GB DDR5 CL30 لضمان أقل زمن استجابة (Input Lag) وأعلى ثبات للإطارات.',
    whyText: 'ألعاب Esports تعتمد بشكل كبير على سرعة النواة الواحدة والذاكرة السريعة. يوفر Ryzen 5 7600X مع DDR5 6000MHz CL30 دفعة هائلة في الحد الأدنى للإطارات (1% Lows)، ومع RTX 5060 ستحصل على دعم NVIDIA Reflex.',
    audienceText: 'لاعبو Valorant و CS2 و Fortnite التنافسيون أصحاب شاشات 180Hz و 240Hz.',
    upgradePath: 'لوحة B650M تدعم الترقية مستقبلاً إلى معالجات Ryzen 7 9800X3D دون تغيير اللوحة أو الرام.'
  },
  {
    slug: 'am5-budget-gaming-pc-7500f-arc-b580',
    keyword: 'تجميعة AM5 اقتصادية',
    title: 'أفضل تجميعة AM5 اقتصادية للجيل الجديد 2026: Ryzen 5 7500F مع Arc B580 12GB',
    category: 'قيمة مقابل السعر',
    badgeEmoji: '💎',
    targetRes: '1080p / 1440p',
    readTime: '6 دقائق قراءة',
    featuredGames: ['hogwarts_legacy', 'cyberpunk_2077', 'warzone', 'ea_fc_26'],
    parts: { cpu: 'r5_7500f', cooler: 'single_tower_argb', mb: 'a620m_hdv', ram: 'ram_16_d5', gpu: 'arc_b580_12g', storage: 'nvme_1tb', psu: 'psu_650w_bronze' },
    metaDesc: 'تجميعة AM5 اقتصادية متكاملة بمعالج Ryzen 5 7500F وكارت Intel Arc B580 12GB ورام DDR5، تدخل عالم الجيل الجديد بأقل تكلفة.',
    summary: 'بوابة الدخول الأذكى لمنصة AM5 الحديثة: معالج Ryzen 5 7500F القوي مع كارت Intel Arc B580 بذاكرة 12GB VRAM بسعر منافس جداً.',
    whyText: 'معالج Ryzen 5 7500F يعطي تقريباً نفس أداء 7600X في الألعاب بسعر أقل لغياب الكارت المدمج، بينما يمنحك كارت Intel Arc B580 سعة 12GB VRAM التي تحميك من امتلاء الذاكرة في ألعاب 2026.',
    audienceText: 'اللاعبون الأذكياء الذين يريدون منصة حديثة DDR5 قابلة للتطوير مع كارت شاشة قوي في 1080p و 2K.',
    upgradePath: 'يمكن ترقية الرام إلى 32GB DDR5 أو المعالج إلى سلسلة X3D لاحقاً بكل سهولة.'
  },
  {
    slug: '1440p-2k-gaming-pc-rtx-5070',
    keyword: 'تجميعة ألعاب 2K RTX 5070',
    title: 'تجميعة ألعاب 2K مثالية 2026 بكارت RTX 5070 12GB ومعالج Ryzen 5 9600X',
    category: 'قيمنق 2K (1440p)',
    badgeEmoji: '🔥',
    targetRes: '1440p (2K)',
    readTime: '6 دقائق قراءة',
    featuredGames: ['cyberpunk_2077', 'wukong', 'rdr2', 'starfield'],
    parts: { cpu: 'r5_9600x', cooler: 'dual_tower_pro', mb: 'b650m_gaming_wifi', ram: 'ram_32_d5', gpu: 'rtx5070_12g', storage: 'nvme_1tb', psu: 'psu_750w_gold' },
    metaDesc: 'مواصفات أفضل تجميعة ألعاب 2K لعام 2026 بكارت NVIDIA RTX 5070 12GB ومعالج Ryzen 5 9600X ورام 32GB DDR5 6000MHz مع تقدير FPS.',
    summary: 'الخيار الأول لشاشات 1440p 165Hz: تجمع معمارية Zen 5 مع قوة RTX 5070 وباور 750W 80+ Gold ATX 3.1 لأداء 2K خارق.',
    whyText: 'يمتلك معالج Ryzen 5 9600X كفاءة طاقة ممتازة وأداءً عالياً في الألعاب، ويقترن بمبرد Dual Tower احترافي ورام 32GB DDR5 CL30 لإطلاق كامل طاقة كارت RTX 5070 12GB.',
    audienceText: 'اللاعبون الطامحون للعب بدقة 2K QHD بإعدادات Ultra وتفعيل تتبع الأشعة بسلاسة.',
    upgradePath: 'منصة AM5 مع باور 750W Gold تسمح بترقية المعالج أو إضافة قرص NVMe 2TB بسلاسة.'
  },
  {
    slug: '1440p-gaming-pc-rx-7800-xt',
    keyword: 'تجميعة 2K RX 7800 XT',
    title: 'تجميعة قيمنق 2K بأفضل قيمة: Ryzen 7 5700X مع كارت RX 7800 XT 16GB',
    category: 'قيمنق 2K (1440p)',
    badgeEmoji: '🛡️',
    targetRes: '1440p (2K)',
    readTime: '5 دقائق قراءة',
    featuredGames: ['rdr2', 'elden_ring', 'warzone', 'forza_horizon_5'],
    parts: { cpu: 'r7_5700x', cooler: 'dual_tower_pro', mb: 'b550m_pro_vdh', ram: 'ram_32_d4', gpu: 'rx7800xt_16g', storage: 'nvme_1tb', psu: 'psu_750w_gold' },
    metaDesc: 'تجميعة ألعاب 2K اقتصادية نسبياً بكارت AMD Radeon RX 7800 XT 16GB ومعالج Ryzen 7 5700X ورام 32GB DDR4، أداء جبار بسعر ذكي.',
    summary: 'كيف تحصل على أداء 2K ألترا وذاكرة 16GB VRAM دون دفع تكلفة DDR5 المرتفعة؟ هذا البناء يجمع AM4 الناضجة مع RX 7800 XT.',
    whyText: 'تتيح لنا منصة DDR4 توفير الميزانية وتوجيهها نحو كارت RX 7800 XT 16GB ومعالج 8 أنوية Ryzen 7 5700X مع رام 32GB، مما يعطي أداءً ممتازاً في الألعاب والمونتاج معاً.',
    audienceText: 'اللاعبون الباحثون عن أقصى إطارات بدقة 1440p بأفضل تكلفة إجمالية.',
    upgradePath: 'يمكن ترقية المعالج مستقبلاً إلى Ryzen 7 5700X3D على نفس اللوحة لزيادة الفريمات في الألعاب التنافسية.'
  },
  {
    slug: '4k-ultra-gaming-pc-9800x3d-rtx-5080',
    keyword: 'تجميعة ألعاب 4K بلا تنازلات',
    title: 'تجميعة النخبة 4K بلا تنازلات 2026: Ryzen 7 9800X3D مع RTX 5080 16GB',
    category: 'فئة النخبة 4K',
    badgeEmoji: '👑',
    targetRes: '4K Ultra',
    readTime: '6 دقائق قراءة',
    featuredGames: ['wukong', 'cyberpunk_2077', 'starfield', 'rdr2'],
    parts: { cpu: 'r7_9800x3d', cooler: 'aio_360_liquid', mb: 'b850_tomahawk_wifi', ram: 'ram_32_d5', gpu: 'rtx5080_16g', storage: 'nvme_2tb', psu: 'psu_1000w_gold' },
    metaDesc: 'أقوى تجميعة ألعاب 4K في العالم لعام 2026 بمعالج Ryzen 7 9800X3D وكارت RTX 5080 16GB ورام DDR5 6000MHz وباور 1000W Gold.',
    summary: 'قمة الهرم التقني في 2026: ملك معالجات الألعاب Ryzen 7 9800X3D مع وحش الـ 4K كارت RTX 5080 16GB ولوحة B850 Tomahawk.',
    whyText: 'بفضل تقنية 3D V-Cache في 9800X3D ومعمارية RTX 5080 مع 16GB VRAM وتبريد مائي 360mm ومزود طاقة 1000W ATX 3.1، ستحصل على تجربة 4K بأعلى إعدادات ممكنة لسنوات طويلة.',
    audienceText: 'عشاق الفئة العليا أصحاب شاشات 4K 144Hz أو شاشات OLED 240Hz ومن لا يقبلون بأي تنازلات.',
    upgradePath: 'التجميعة في أعلى مستويات السوق حالياً وتدعم رفع الرام إلى 64GB أو إضافة وحدات تخزين PCIe 5.0.'
  },
  {
    slug: '4k-gaming-pc-rx-9070-xt',
    keyword: 'تجميعة ألعاب 4K RX 9070 XT',
    title: 'تجميعة 4K و 2K القوية بكارت Radeon RX 9070 XT 16GB ومعالج Ryzen 7 9700X',
    category: 'فئة النخبة 4K',
    badgeEmoji: '🌋',
    targetRes: '4K / 1440p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['wukong', 'cyberpunk_2077', 'hogwarts_legacy', 'forza_horizon_5'],
    parts: { cpu: 'r7_9700x', cooler: 'dual_tower_pro', mb: 'b850_tomahawk_wifi', ram: 'ram_32_d5', gpu: 'rx9070_xt_16g', storage: 'nvme_2tb', psu: 'psu_850w_gold' },
    metaDesc: 'تجميعة ألعاب 4K ممتازة القيمة بكارت AMD Radeon RX 9070 XT 16GB ومعالج Ryzen 7 9700X وقرص 2TB NVMe Gen4.',
    summary: 'قوة رسومية هائلة بدقة 2K و 4K بذاكرة 16GB مع كفاءة معالج Ryzen 7 9700X الحرارية المنخفضة (65W TDP) ولوحة B850.',
    whyText: 'يمتاز معالج 9700X بـ 8 أنوية Zen 5 واستهلاك طاقة منخفض يسهل تبريده بمبرد هوائي مزدوج، بينما ينافس كارت RX 9070 XT بقوة في الأداء الخام مع 16GB VRAM.',
    audienceText: 'اللاعبون الباحثون عن أداء 4K و 1440p عالٍ بسعر أكثر تنافسية من كروت الفئة العليا المنافسة.',
    upgradePath: 'تسمح لوحة B850 وباور 850W بالترقية مستقبلاً لأي جيل قادم على مقبس AM5.'
  },
  {
    slug: 'streaming-and-gaming-pc-rtx-5060',
    keyword: 'تجميعة بث مباشر وألعاب',
    title: 'تجميعة بث مباشر وألعاب (Streaming PC) 2026: العب وبث على Twitch و Kick بسلاسة',
    category: 'بث مباشر وصناعة محتوى',
    badgeEmoji: '📡',
    targetRes: '1080p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['warzone', 'valorant', 'fortnite', 'gta_v'],
    parts: { cpu: 'i5_13400f', cooler: 'single_tower_argb', mb: 'b760m_k_d4', ram: 'ram_32_d4', gpu: 'rtx5060_8g', storage: 'nvme_1tb', psu: 'psu_650w_bronze' },
    metaDesc: 'أفضل تجميعة بث مباشر وألعاب 2026 بمعالج Core i5-13400F (10 أنوية) ورام 32GB وكارت RTX 5060 مع مشفر NVENC لبث 1080p60 بدون فقدان فريمات.',
    summary: 'لتشغيل اللعبة وبرنامج OBS والكاميرا والمحادثة في آنٍ واحد دون تقطيع، تحتاج إلى 10 أنوية، 32GB RAM، ومشفر NVIDIA NVENC الحديث.',
    whyText: 'يقدم معالج Core i5-13400F أنوية كفاءة إضافية (E-Cores) تتولى مهام الخلفية و OBS، بينما يتكفل مشفر NVENC في RTX 5060 بترميز البث المباشر دون استهلاك طاقة المعالج.',
    audienceText: 'الستريمرز المبتدئون والمحترفون على منصات Twitch و YouTube و Kick.',
    upgradePath: 'إمكانية زيادة التخزين لحفظ التسجيلات أو ترقية المعالج إلى i5-14600KF.'
  },
  {
    slug: 'premiere-after-effects-editing-pc',
    keyword: 'تجميعة مونتاج اقتصادية ومتوسطة',
    title: 'تجميعة مونتاج متوسطة 2026: أداء ممتاز لـ Premiere و CapCut بتكلفة ذكية',
    category: 'مونتاج وصناعة محتوى',
    badgeEmoji: '🎞️',
    targetRes: '1080p / 4K',
    readTime: '5 دقائق قراءة',
    featuredGames: ['gta_v', 'ea_fc_26', 'rdr2', 'valorant'],
    parts: { cpu: 'i5_14600kf', cooler: 'dual_tower_pro', mb: 'b760m_a_wifi', ram: 'ram_32_d5', gpu: 'rtx3060_12g', storage: 'nvme_1tb', psu: 'psu_650w_bronze' },
    metaDesc: 'تجميعة مونتاج ذكية السعر بمعالج Core i5-14600KF ذي 14 نواة وكارت RTX 3060 12GB ورام 32GB DDR5 لسرعة تحرير الفيديو وتصميم الجرافيك.',
    summary: 'بناء موجه للمونتاج متوسط التكلفة: 14 نواة من إنتل مع رام 32GB DDR5 وكارت RTX 3060 بذاكرة 12GB VRAM.',
    whyText: 'كارت RTX 3060 12GB يمنحك سعة ذاكرة رسومية كبيرة بسعر معقول لتشغيل فلاتر Premiere و After Effects، بينما تتولى أنوية i5-14600KF الـ 14 معالجة التايملاين بسلاسة.',
    audienceText: 'المصممون ومحرروا الفيديو المستقلون (Freelancers) ومنتجو محتوى السوشيال ميديا.',
    upgradePath: 'يمكن مضاعفة الرام إلى 64GB DDR5 وإضافة قرص SSD 2TB عند توسع المشاريع.'
  },
  {
    slug: '3d-rendering-blender-pc-rtx-5070-ti',
    keyword: 'تجميعة تصميم ثلاثي الأبعاد Blender',
    title: 'تجميعة تصميم ثلاثي الأبعاد Blender و Unreal Engine 5: قوة OptiX و 16GB VRAM',
    category: 'تصميم ثلاثي الأبعاد والذكاء الاصطناعي',
    badgeEmoji: '🧊',
    targetRes: '4K Workstation',
    readTime: '6 دقائق قراءة',
    featuredGames: ['wukong', 'cyberpunk_2077', 'starfield', 'elden_ring'],
    parts: { cpu: 'ultra7_265k', cooler: 'aio_360_liquid', mb: 'z890_gaming_wifi', ram: 'ram_64_d5', gpu: 'rtx5070_ti_16g', storage: 'nvme_2tb', psu: 'psu_850w_gold' },
    metaDesc: 'تجميعة عمل احترافية لتصميم 3D و Blender و Unreal Engine 5 بمعالج Core Ultra 7 265K ورام 64GB DDR5 وكارت RTX 5070 Ti 16GB.',
    summary: 'محطة عمل متطورة لمصممي الـ 3D والمهندسين المعماريين: 64GB RAM و 16GB VRAM مع أحدث معمارية Intel LGA1851.',
    whyText: 'تستفيد برامج Blender Cycles و Lumion و Unreal Engine 5 بشكل مباشر من أنوية CUDA/OptiX وذاكرة 16GB في RTX 5070 Ti، كما يوفر Core Ultra 7 265K أداءً ممتازاً في المهام متعددة الخيوط.',
    audienceText: 'مصممو الـ 3D، المعماريون، ومطورو الألعاب على Unreal Engine.',
    upgradePath: 'تدعم لوحة Z890 توسعة الرام والتخزين PCIe Gen4/Gen5 وحتى ترقية الكارت إلى RTX 5080.'
  },
  {
    slug: 'programming-ai-workstation-ultra-7',
    keyword: 'تجميعة برمجة وذكاء اصطناعي',
    title: 'تجميعة برمجة وذكاء اصطناعي محلي 2026: Core Ultra 7 مع 64GB DDR5',
    category: 'برمجة وذكاء اصطناعي',
    badgeEmoji: '🤖',
    targetRes: '1440p / AI',
    readTime: '5 دقائق قراءة',
    featuredGames: ['cyberpunk_2077', 'cs2', 'rdr2', 'rust'],
    parts: { cpu: 'ultra7_265k', cooler: 'aio_360_liquid', mb: 'b860m_a_wifi', ram: 'ram_64_d5', gpu: 'rtx4070_super', storage: 'nvme_2tb', psu: 'psu_750w_gold' },
    metaDesc: 'أفضل تجميعة للبرمجة وتشغيل نماذج الذكاء الاصطناعي Docker و Android Studio بمعالج Core Ultra 7 265K ورام 64GB DDR5 وكارت RTX 4070 Super.',
    summary: 'مصممة للمطورين ومهندسي البيانات: تشغل الحاويات (Docker)، محاكيات الهواتف، ونماذج LLM المحلية بكل أريحية.',
    whyText: 'تجميع المشاريع البرمجية الضخمة يتطلب نواة قوية ورام لا تقل عن 64GB مع قرص NVMe Gen4 سريع 2TB، بينما يسرّع RTX 4070 Super تدريب واستنتاج نماذج الذكاء الاصطناعي عبر CUDA.',
    audienceText: 'المبرمجون، مهندسو البرمجيات، وباحثو الذكاء الاصطناعي.',
    upgradePath: 'يمكن ترقية كارت الشاشة لاحقاً لكارت بذاكرة 16GB أو أكثر لتشغيل نماذج ذكاء اصطناعي أكبر حجماً.'
  },
  {
    slug: 'student-study-programming-pc-5600g',
    keyword: 'تجميعة دراسة وبرمجة رخيصة',
    title: 'تجميعة دراسة وبرمجة وأعمال مكتبية اقتصادية: Ryzen 5 5600G بأقل سعر',
    category: 'تجميعات اقتصادية',
    badgeEmoji: '🎓',
    targetRes: '1080p',
    readTime: '4 دقائق قراءة',
    featuredGames: ['valorant', 'gta_v', 'ea_fc_26', 'cs2'],
    parts: { cpu: 'r5_5600g', cooler: 'stock_cooler', mb: 'b450m_k', ram: 'ram_16_d4', gpu: 'none', storage: 'nvme_512', psu: 'psu_450w_bronze' },
    metaDesc: 'تجميعة كمبيوتر للدراسة والبرمجة والتصميم الخفيف بأرخص سعر في 2026 بمعالج Ryzen 5 5600G ورام 16GB وقرص 512GB NVMe.',
    summary: 'جهاز هادئ وموثوق للدراسة الجامعية، البرمجة، وبرامج الأوفيس مع قدرة على تشغيل ألعاب خفيفة في وقت الفراغ.',
    whyText: 'معالج Ryzen 5 5600G يجمع 6 أنوية مع معالج رسومي مدمج في شريحة واحدة باستهلاك طاقة ضئيل، وقرص 512GB NVMe يضمن إقلاعاً سريعاً للنظام والبرامج.',
    audienceText: 'الطلاب، المبرمجون المبتدئون، وأصحاب الأعمال المكتبية.',
    upgradePath: 'إمكانية إضافة كارت شاشة منفصل لاحقاً أو قرص تخزين إضافي.'
  },
  {
    slug: 'gta-v-ea-fc-26-gaming-pc',
    keyword: 'تجميعة GTA V و EA FC 26',
    title: 'تجميعة تشغيل GTA V و EA FC 26 بأعلى سلاسة وبميزانية متوسطة',
    category: 'تجميعات اقتصادية',
    badgeEmoji: '⚽',
    targetRes: '1080p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['ea_fc_26', 'gta_v', 'valorant', 'forza_horizon_5'],
    parts: { cpu: 'i3_14100f', cooler: 'stock_cooler', mb: 'h610m_e', ram: 'ram_16_d4', gpu: 'rx6600_8g', storage: 'combo_256_1tb', psu: 'psu_550w_bronze' },
    metaDesc: 'تجميعة مخصصة لتشغيل EA FC 26 و GTA V بأكثر من 100 فريم على 1080p بمعالج Core i3-14100F وكارت RX 6600 8GB ومساحة 1.25TB.',
    summary: 'توليفة مخصصة لأكثر الألعاب شعبية في العالم العربي (EA FC 26 و GTA V Online) مع سعة تخزين كافية لجميع التحديثات.',
    whyText: 'يعطي معالج i3-14100F سرعة تردد عالية مناسبة جداً للألعاب، بينما يشغل كارت RX 6600 لعبتي EA FC 26 و GTA V بإعدادات مرتفعة تتجاوز 100 FPS بسهولة.',
    audienceText: 'عشاق كرة القدم وألعاب العالم المفتوح الباحثون عن جهاز متكامل بسعر متوسط.',
    upgradePath: 'تسمح اللوحة بالترقية إلى Core i5-14600KF لاحقاً عند الحاجة.'
  },
  {
    slug: 'warzone-fortnite-high-fps-pc',
    keyword: 'تجميعة Warzone و Fortnite فريمات عالية',
    title: 'تجميعة باتل رويال Warzone و Fortnite: فريمات عالية 1080p بدون دروب',
    category: 'قيمنق 1080p احترافي',
    badgeEmoji: '🪂',
    targetRes: '1080p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['warzone', 'fortnite', 'apex_legends', 'pubg'],
    parts: { cpu: 'r7_5700x3d', cooler: 'dual_tower_pro', mb: 'b550m_pro_vdh', ram: 'ram_32_d4', gpu: 'rtx4060_8g', storage: 'nvme_1tb', psu: 'psu_650w_bronze' },
    metaDesc: 'تجميعة 1080p فريمات عالية لألعاب الباتل رويال Warzone و Fortnite و PUBG بمعالج Ryzen 7 5700X3D وكارت RTX 4060 ورام 32GB.',
    summary: 'خرائط الباتل رويال الضخمة تعشق ذاكرة الكاش الكبيرة في معالجات X3D: ثبات مذهل للإطارات حتى في أشد المواجهات.',
    whyText: 'تمنح ذاكرة 96MB L3 Cache في معالج Ryzen 7 5700X3D أفضلية كبيرة في Warzone و Fortnite لمنع الهبوط المفاجئ في الإطارات، ومع 32GB RAM لن تعاني من أي تقطيع.',
    audienceText: 'لاعبو الباتل رويال التنافسيون على دقة 1080p.',
    upgradePath: 'باور 650W وكفاءة اللوحة يتيحان ترقية كارت الشاشة مستقبلاً إلى فئة RTX 5070.'
  },
  {
    slug: 'cyberpunk-wukong-aaa-gaming-pc',
    keyword: 'تجميعة ألعاب AAA الثقيلة',
    title: 'تجميعة ألعاب AAA الثقيلة 2026: تشغيل Cyberpunk 2077 و Black Myth Wukong بأعلى جودة',
    category: 'قيمنق 2K (1440p)',
    badgeEmoji: '⚔️',
    targetRes: '1440p (2K)',
    readTime: '6 دقائق قراءة',
    featuredGames: ['wukong', 'cyberpunk_2077', 'hogwarts_legacy', 'starfield'],
    parts: { cpu: 'r5_7600x', cooler: 'dual_tower_pro', mb: 'b650m_gaming_wifi', ram: 'ram_32_d5', gpu: 'rtx4070_super', storage: 'nvme_2tb', psu: 'psu_750w_gold' },
    metaDesc: 'تجميعة متخصصة للألعاب القصصية الثقيلة Cyberpunk 2077 و Black Myth Wukong بدقة 2K Ultra مع كارت RTX 4070 Super ومعالج Ryzen 5 7600X.',
    summary: 'تم تصميم هذه التجميعة لتشغيل أثقل ألعاب الجيل الحالي بفضل كارت RTX 4070 Super 12GB وسرعة منصة AM5 ومساحة 2TB السريعة.',
    whyText: 'الألعاب القصصية الحديثة تستهلك مساحات تخزين تتجاوز 100GB للعبة الواحدة وتتطلب قوة تتبع أشعة عالية؛ لذلك جمعنا بين RTX 4070 Super وتخزين 2TB Gen4.',
    audienceText: 'محبو الألعاب القصصية الفردية ذات الرسوميات السينمائية على دقة 1440p.',
    upgradePath: 'يمكن ترقية المعالج مستقبلاً إلى 9800X3D على نفس اللوحة والذاكرة.'
  },
  {
    slug: 'rtx-3060-12gb-budget-creator-pc',
    keyword: 'تجميعة ألعاب ومونتاج اقتصادية',
    title: 'تجميعة ألعاب ومونتاج اقتصادية بكارت RTX 3060 12GB ومعالج Ryzen 5 5600',
    category: 'تجميعات متوازنة',
    badgeEmoji: '🎨',
    targetRes: '1080p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['rdr2', 'gta_v', 'cyberpunk_2077', 'ea_fc_26'],
    parts: { cpu: 'r5_5600', cooler: 'single_tower_argb', mb: 'b550m_ds3h', ram: 'ram_32_d4', gpu: 'rtx3060_12g', storage: 'combo_512_2tb', psu: 'psu_650w_bronze' },
    metaDesc: 'تجميعة شاملة للألعاب والمونتاج بميزانية اقتصادية متوسطة: Ryzen 5 5600 مع RTX 3060 12GB ورام 32GB ومساحة 2.5TB.',
    summary: 'حل متوازن لمن يريد اللعب بدقة 1080p والعمل على التصميم والمونتاج مع مساحة تخزين ضخمة 2.5TB.',
    whyText: 'سعة 12GB VRAM في RTX 3060 ورام 32GB DDR4 تمنحانك مساحة مريحة جداً في برامج التصميم وتحميل الخامات عالية الدقة، مع قرص Combo 512GB NVMe + 2TB HDD.',
    audienceText: 'الطلاب الجامعيون في التخصصات الهندسية والإعلامية وهواة الألعاب.',
    upgradePath: 'ترقية المعالج إلى Ryzen 7 5700X أو 5700X3D في المستقبل.'
  },
  {
    slug: 'i5-14600kf-high-refresh-gaming-pc',
    keyword: 'تجميعة إنتل فريمات عالية',
    title: 'تجميعة إنتل 1080p و 2K فريمات عالية: Core i5-14600KF مع RTX 5070 12GB',
    category: 'قيمنق 2K (1440p)',
    badgeEmoji: '⚡',
    targetRes: '1440p / 1080p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['warzone', 'apex_legends', 'cyberpunk_2077', 'forza_horizon_5'],
    parts: { cpu: 'i5_14600kf', cooler: 'dual_tower_pro', mb: 'b760m_a_wifi', ram: 'ram_32_d5', gpu: 'rtx5070_12g', storage: 'nvme_1tb', psu: 'psu_750w_gold' },
    metaDesc: 'تجميعة إنتل قوية للألعاب والمهام المتعددة بمعالج Core i5-14600KF وكارت RTX 5070 12GB ورام 32GB DDR5 6000MHz.',
    summary: 'مزيج هجومي من إنتل وإنفيديا: معالج i5-14600KF بتردداته العالية وكارت RTX 5070 لتحطيم أرقام الفريمات على 1080p و 1440p.',
    whyText: 'يمتلك i5-14600KF أداءً مذهلاً في الألعاب والإنتاجية على حد سواء، ومع مبرد Peerless Assassin 120 SE وباور 750W Gold سيعمل بثبات وهدوء.',
    audienceText: 'محبو معالجات Intel الذين يبحثون عن أداء ألعاب وعمل مرتفع.',
    upgradePath: 'تدعم اللوحة الترقية إلى i7-14700KF أو رفع الرام إلى 64GB DDR5.'
  },
  {
    slug: 'ryzen-7-7800x3d-esports-king-pc',
    keyword: 'تجميعة Ryzen 7 7800X3D',
    title: 'تجميعة البطولات والرياضات الإلكترونية: Ryzen 7 7800X3D مع RX 9070 XT 16GB',
    category: 'ألعاب تنافسية Esports',
    badgeEmoji: '🏆',
    targetRes: '1440p 240Hz',
    readTime: '6 دقائق قراءة',
    featuredGames: ['valorant', 'cs2', 'warzone', 'apex_legends'],
    parts: { cpu: 'r7_7800x3d', cooler: 'dual_tower_pro', mb: 'b650m_gaming_wifi', ram: 'ram_32_d5', gpu: 'rx9070_xt_16g', storage: 'nvme_2tb', psu: 'psu_850w_gold' },
    metaDesc: 'تجميعة قيمنق فائقة السرعة بمعالج Ryzen 7 7800X3D وكارت RX 9070 XT 16GB ورام 32GB DDR5 CL30 لشاشات 240Hz.',
    summary: 'بناء موجه للمنافسات الجادة: أحد أفضل معالجات الألعاب في التاريخ مع كارت 16GB قوي جداً على دقة 1080p و 1440p.',
    whyText: 'معالج 7800X3D يشتهر بكفاءته العالية واستقراره المذهل في الفريمات الدنيا (1% Low)، مما يمنحك تفوقاً واضحاً في ألعاب التصويب التنافسية.',
    audienceText: 'اللاعبون المحترفون وملاك شاشات 240Hz و 360Hz.',
    upgradePath: 'تسمح منصة AM5 بالترقية مستقبلاً لأي معالج أحدث دون تغيير البنية الأساسية.'
  },
  {
    slug: 'ddr5-future-proof-gaming-pc-9600x',
    keyword: 'تجميعة DDR5 قابلة للتطوير',
    title: 'تجميعة الجيل الحديث DDR5 قابلة للتطوير: Ryzen 5 9600X مع كارت RTX 5060 8GB',
    category: 'تجميعات متوازنة',
    badgeEmoji: '🔮',
    targetRes: '1080p / 1440p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['ea_fc_26', 'fortnite', 'gta_v', 'elden_ring'],
    parts: { cpu: 'r5_9600x', cooler: 'single_tower_argb', mb: 'b650m_gaming_wifi', ram: 'ram_32_d5', gpu: 'rtx5060_8g', storage: 'nvme_1tb', psu: 'psu_650w_bronze' },
    metaDesc: 'تجميعة ألعاب حديثة بمعمارية Zen 5 وذاكرة DDR5 32GB وكارت RTX 5060 8GB: استثمار طويل الأمد بسعر منطقي.',
    summary: 'تجمع أحدث تقنيات AMD و NVIDIA في الفئة المتوسطة مع لوحة B650 وذاكرة 32GB DDR5 لضمان استمرارية الجهاز لسنوات.',
    whyText: 'بدلاً من الاستثمار في منصات قديمة، يمنحك معالج 9600X ورام 32GB DDR5 CL30 أساساً قوياً يدوم طويلاً مع كارت RTX 5060 الموفر للطاقة.',
    audienceText: 'من يشترون حاسوباً جديداً في 2026 ويريدون أحدث معمارية وأسهل قابلية ترقية مستقبلية.',
    upgradePath: 'ترقية الكارت مستقبلاً إلى RTX 5070 أو ما بعده مع ترقية الباور عند اللزوم.'
  },
  {
    slug: 'intel-core-ultra-5-245k-all-rounder-pc',
    keyword: 'تجميعة متعددة الاستخدامات 2026',
    title: 'تجميعة متعددة الاستخدامات للألعاب والمونتاج 2026: Core Ultra 5 245K مع Arc B580',
    category: 'تجميعات متوازنة',
    badgeEmoji: '⚙️',
    targetRes: '1080p / 1440p',
    readTime: '5 دقائق قراءة',
    featuredGames: ['forza_horizon_5', 'rust', 'gta_v', 'pubg'],
    parts: { cpu: 'ultra5_245k', cooler: 'dual_tower_pro', mb: 'b860m_a_wifi', ram: 'ram_32_d5', gpu: 'arc_b580_12g', storage: 'nvme_1tb', psu: 'psu_650w_bronze' },
    metaDesc: 'تجميعة متكاملة من إنتل لعام 2026 تجمع معالج Core Ultra 5 245K وكارت Intel Arc B580 12GB ورام 32GB DDR5 للألعاب والمونتاج.',
    summary: 'منصة إنتل الأحدث LGA1851 مع كارت Arc B580 بذاكرة 12GB، تقدم توازناً مبهراً في الألعاب وترميز AV1 وصناعة المحتوى.',
    whyText: 'يتميز Core Ultra 5 245K بانخفاض استهلاك الطاقة مقارنة بالجيل السابق وأداء عالٍ في الإنتاجية، ومع تقنية Deep Link وترميز AV1 في Arc B580 تحصل على أداء ممتاز في المونتاج.',
    audienceText: 'المستخدمون الباحثون عن جهاز شامل للألعاب والعمل والمونتاج بمعمارية 2026.',
    upgradePath: 'يمكن ترقية المعالج إلى Ultra 7 265K أو الكارت إلى فئة أعلى على لوحة B860M-A WiFi.'
  }
];

// ============================================================================
// 3. Validation & Computation Helpers (Mirrors index.html exactly)
// ============================================================================
function findPart(list, id, label) {
  const item = list.find(x => x.id === id);
  if (!item) throw new Error(`Part not found in ${label}: "${id}"`);
  return item;
}

function resolveAndValidateBuild(cfg, db, gamesCatalog, coupons) {
  const cpu = findPart(db.cpus, cfg.parts.cpu, 'cpus');
  const cooler = findPart(db.coolers, cfg.parts.cooler, 'coolers');
  const mb = findPart(db.motherboards, cfg.parts.mb, 'motherboards');
  const ram = findPart(db.rams, cfg.parts.ram, 'rams');
  const gpu = findPart(db.gpus, cfg.parts.gpu, 'gpus');
  const storage = findPart(db.storages, cfg.parts.storage, 'storages');
  const psu = findPart(db.psus, cfg.parts.psu, 'psus');

  const errors = [];
  if (cpu.socket !== mb.socket) {
    errors.push(`Socket mismatch: CPU ${cpu.id} (${cpu.socket}) vs MB ${mb.id} (${mb.socket})`);
  }
  if (mb.ram_type !== ram.type) {
    errors.push(`RAM type mismatch: MB ${mb.id} (${mb.ram_type}) vs RAM ${ram.id} (${ram.type})`);
  }
  if (gpu.id === 'none' && cpu.igpu_score === 0) {
    errors.push(`CPU ${cpu.id} has no iGPU and GPU is 'none'`);
  }
  if (cpu.tdp > cooler.max_tdp) {
    errors.push(`Thermal warning: CPU ${cpu.id} (${cpu.tdp}W) > Cooler ${cooler.id} (${cooler.max_tdp}W)`);
  }

  const totalTdp = cpu.tdp + cooler.tdp + mb.tdp + ram.tdp + gpu.tdp + storage.tdp;
  const safeMinWatts = Math.max(450, Math.ceil((totalTdp + 120) / 50) * 50);
  if (psu.wattage < safeMinWatts) {
    errors.push(`PSU insufficient: ${psu.id} (${psu.wattage}W) < safeMinWatts (${safeMinWatts}W)`);
  }

  if (errors.length > 0) {
    throw new Error(`Compatibility error in build "${cfg.slug}":\n - ${errors.join('\n - ')}`);
  }

  const totalUsd = cpu.price_usd + cooler.price_usd + mb.price_usd + ram.price_usd + gpu.price_usd + storage.price_usd + psu.price_usd;
  const effectiveGpuScore = gpu.id === 'none' ? cpu.igpu_score : gpu.score;
  const gamingIndex = (effectiveGpuScore * 0.8) + (cpu.score * 0.2);

  // Bottleneck assessment matching index.html
  let bottleneckTitle = 'معالج مدمج (iGPU)';
  let bottleneckDesc = 'مناسب للألعاب الخفيفة والعمل المكتبي والدراسة.';
  let bottleneckClass = 'text-sky-600 dark:text-sky-400';
  if (gpu.id !== 'none') {
    const diff = Math.abs(cpu.score - effectiveGpuScore);
    if (diff <= 15) {
      bottleneckTitle = '✅ توازن مثالي (0% عنق زجاجة)';
      bottleneckDesc = 'المعالج وكارت الشاشة متكافئان تماماً دون أي هدر في الأداء.';
      bottleneckClass = 'text-emerald-600 dark:text-emerald-400';
    } else if (cpu.score < effectiveGpuScore) {
      bottleneckTitle = `⚠️ عنق زجاجة طفيف من المعالج (~${diff}%)`;
      bottleneckDesc = 'كارت الشاشة أقوى من المعالج؛ يظهر الأداء الأفضل عند رفع الدقة إلى 1440p أو ترقية المعالج لاحقاً.';
      bottleneckClass = 'text-amber-600 dark:text-amber-400';
    } else {
      bottleneckTitle = 'ℹ️ المعالج أقوى من الكارت';
      bottleneckDesc = 'ممتاز للبرمجة والمونتاج والتطبيقات الاحترافية وقابل لترقية الكارت مستقبلاً.';
      bottleneckClass = 'text-sky-600 dark:text-sky-400';
    }
  }

  // Editing & Coding scores matching index.html
  const ramBonus = ram.capacity_gb >= 32 ? 15 : (ram.capacity_gb >= 16 ? 6 : 0);
  const editScore = Math.min(100, Math.round((cpu.score * 0.5) + (effectiveGpuScore * 0.35) + ramBonus));
  const codeScore = Math.min(100, Math.round((cpu.score * 0.75) + ramBonus + 10));
  const editLabel = editScore >= 75 ? 'ممتاز (4K)' : (editScore >= 50 ? 'جيد جداً (1080p)' : 'مقبول');
  const codeLabel = codeScore >= 80 ? 'احترافي فائق السرعة' : 'ممتاز وسلس';

  // Monitor tier matching index.html
  const monitorTierKey = effectiveGpuScore >= 90 ? 'ultra' : (effectiveGpuScore >= 72 ? 'mid' : 'entry');

  // FPS per game from gamesCatalog
  const gameFps = gamesCatalog.map(g => {
    const fps = Math.round(gamingIndex * g.fpsMultiplier);
    const isUnderperforming = gamingIndex < g.minScore;
    return { ...g, fps, isUnderperforming };
  });

  // Eligible coupon
  const eligibleCoupons = coupons.filter(c => totalUsd >= c.minUsd);
  const bestCoupon = eligibleCoupons.length > 0
    ? eligibleCoupons.reduce((max, c) => (c.discountUsd > max.discountUsd ? c : max), eligibleCoupons[0])
    : null;

  // Direct Auto-Builder URL query params (matches loadFromURL() in index.html)
  const builderParams = new URLSearchParams({
    cpu: cpu.id,
    cooler: cooler.id,
    mb: mb.id,
    ram: ram.id,
    gpu: gpu.id,
    storage: storage.id,
    psu: psu.id
  });
  const builderRelativeUrl = `../index.html?${builderParams.toString()}`;
  const builderAbsoluteUrl = `${SITE_BASE_URL}/index.html?${builderParams.toString()}`;

  return {
    cfg,
    parts: { cpu, cooler, mb, ram, gpu, storage, psu },
    totalTdp,
    safeMinWatts,
    totalUsd,
    effectiveGpuScore,
    gamingIndex,
    bottleneckTitle,
    bottleneckDesc,
    bottleneckClass,
    editScore,
    editLabel,
    codeScore,
    codeLabel,
    monitorTierKey,
    gameFps,
    bestCoupon,
    builderRelativeUrl,
    builderAbsoluteUrl
  };
}

// ============================================================================
// 4. HTML Escape & Formatting Helpers
// ============================================================================
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function amazonSearchUrl(partName) {
  const query = encodeURIComponent(partName.split('(')[0].trim());
  return `https://www.amazon.sa/s?k=${query}&tag=pcbuilder-21`;
}

function getFpsColorClass(fps, isUnderperforming) {
  if (isUnderperforming) return 'text-rose-600 dark:text-rose-400';
  if (fps >= 100) return 'text-emerald-600 dark:text-emerald-400';
  if (fps >= 60) return 'text-sky-600 dark:text-sky-400';
  if (fps >= 45) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

function getFpsBadge(fps, isUnderperforming) {
  if (isUnderperforming) {
    return '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60">⚠️ إعدادات منخفضة</span>';
  }
  if (fps >= 120) {
    return '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">⚡ فائق السلاسة</span>';
  }
  if (fps >= 60) {
    return '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700/60">✅ 1080p سلس ومستقر</span>';
  }
  return '<span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">🎮 مقبول (Medium)</span>';
}

// ============================================================================
// 5. Render Single SEO Build Article HTML Page
// ============================================================================
function renderBuildHtml(build, allBuilds, monitorCatalog) {
  const { cfg, parts, totalTdp, safeMinWatts, totalUsd, bottleneckTitle, bottleneckDesc, bottleneckClass, editScore, editLabel, codeScore, codeLabel, monitorTierKey, gameFps, bestCoupon, builderRelativeUrl } = build;
  const pageUrl = `${SITE_BASE_URL}/builds/${cfg.slug}.html`;
  const monGroup = monitorCatalog[monitorTierKey] || monitorCatalog.entry;

  const partRows = [
    {
      label: 'المعالج (CPU)',
      icon: '🧠',
      part: parts.cpu,
      spec: `مقبس ${parts.cpu.socket} • ${parts.cpu.tdp}W • تقييم ${parts.cpu.score}/100`
    },
    {
      label: 'مبرد المعالج (Cooler)',
      icon: '❄️',
      part: parts.cooler,
      spec: `قدرة تبريد حتى ${parts.cooler.max_tdp}W`
    },
    {
      label: 'اللوحة الأم (Motherboard)',
      icon: '🔌',
      part: parts.mb,
      spec: `مقبس ${parts.mb.socket} • دعم ${parts.mb.ram_type}`
    },
    {
      label: 'الذاكرة العشوائية (RAM)',
      icon: '⚡',
      part: parts.ram,
      spec: `${parts.ram.capacity_gb}GB ${parts.ram.type}`
    },
    {
      label: 'كارت الشاشة (GPU)',
      icon: '🎮',
      part: parts.gpu,
      spec: parts.gpu.id === 'none'
        ? `مدمج iGPU (تقييم ${parts.cpu.igpu_score}/100)`
        : `استهلاك ${parts.gpu.tdp}W • تقييم ${parts.gpu.score}/100`
    },
    {
      label: 'التخزين (SSD / HDD)',
      icon: '💾',
      part: parts.storage,
      spec: `النوع: ${parts.storage.type}`
    },
    {
      label: 'مزود الطاقة (PSU)',
      icon: '🔋',
      part: parts.psu,
      spec: `قدرة ${parts.psu.wattage}W (الحد الآمن ${safeMinWatts}W)`
    }
  ];

  // Pick 4 highlighted games from cfg.featuredGames
  const highlightedGames = cfg.featuredGames
    .map(id => gameFps.find(g => g.id === id))
    .filter(Boolean);

  // Pick 4 related builds (adjacent circularly so every page links cleanly)
  const currentIdx = allBuilds.findIndex(b => b.cfg.slug === cfg.slug);
  const relatedBuilds = [];
  for (let offset = 1; offset <= 4; offset++) {
    relatedBuilds.push(allBuilds[(currentIdx + offset) % allBuilds.length]);
  }

  const encodedPageUrl = encodeURIComponent(pageUrl);
  const encodedShareText = encodeURIComponent(`${cfg.title} — السعر التقريبي ~${totalUsd}$ | مُجمّع الحواسيب الذكي`);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: cfg.title,
    description: cfg.metaDesc,
    keywords: `${cfg.keyword}, تجميع كمبيوتر, PC Builder, ${parts.cpu.name}, ${parts.gpu.name}`,
    datePublished: '2026-11-24',
    dateModified: TODAY_ISO,
    inLanguage: 'ar',
    author: { '@type': 'Organization', name: 'مُجمّع الحواسيب الذكي' },
    publisher: {
      '@type': 'Organization',
      name: 'مُجمّع الحواسيب الذكي',
      logo: { '@type': 'ImageObject', url: `${SITE_BASE_URL}/og-banner.png` }
    },
    mainEntityOfPage: pageUrl
  };

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary SEO Meta Tags -->
  <title>${esc(cfg.title)} | مُجمّع الحواسيب الذكي</title>
  <meta name="description" content="${esc(cfg.metaDesc)}">
  <meta name="keywords" content="${esc(cfg.keyword)}, تجميع كمبيوتر, ${esc(parts.cpu.name)}, ${esc(parts.gpu.name)}, فحص توافق القطع, حاسبة FPS, PC Builder">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0f172a">
  <link rel="canonical" href="${esc(pageUrl)}">

  <!-- Embedded SVG Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='22' fill='%2310b981'/><text x='50' y='67' font-size='55' text-anchor='middle' fill='%230f172a' font-family='sans-serif' font-weight='bold'>PC</text></svg>">

  <!-- Open Graph / Social Sharing -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="مُجمّع الحواسيب الذكي • PC Builder">
  <meta property="og:url" content="${esc(pageUrl)}">
  <meta property="og:title" content="${esc(cfg.title)}">
  <meta property="og:description" content="${esc(cfg.metaDesc)}">
  <meta property="og:image" content="${SITE_BASE_URL}/og-banner.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(cfg.title)}">
  <meta name="twitter:description" content="${esc(cfg.metaDesc)}">
  <meta name="twitter:image" content="${SITE_BASE_URL}/og-banner.png">

  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

  <script>
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  </script>

  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: { sans: ['Cairo', 'sans-serif'] }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-200/80 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen py-6 px-3 sm:px-4 transition-colors duration-200">

  <div class="max-w-6xl mx-auto">

    <!-- HERO BANNER HEADER -->
    <header class="relative overflow-hidden rounded-3xl bg-gradient-to-l from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 md:p-8 mb-6 shadow-md border border-slate-700/60">
      <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(#10b981 1px, transparent 1px); background-size: 20px 20px;"></div>

      <div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div class="space-y-2 max-w-2xl">
          <div class="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold">
            <span>${cfg.badgeEmoji} ${esc(cfg.category)}</span>
            <span>•</span>
            <span>الكلمة المستهدفة: ${esc(cfg.keyword)}</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-black tracking-tight text-white leading-snug">
            ${esc(cfg.title)}
          </h1>
          <p class="text-slate-300 text-xs md:text-sm leading-relaxed">
            ${esc(cfg.summary)}
          </p>
        </div>

        <!-- Controls & Currency Switcher -->
        <div class="flex flex-wrap items-center gap-3 bg-slate-950/60 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80">
          <a href="${esc(builderRelativeUrl)}"
             class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-xs">
            <span>🛠️ فتح في المجمّع الذكي</span>
          </a>

          <div class="flex items-center gap-2">
            <label for="currency-select" class="text-xs font-bold text-slate-300">العملة:</label>
            <select id="currency-select" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-extrabold text-emerald-400 focus:outline-none">
              <option value="USD" data-rate="1" data-symbol="$" selected>🇺🇸 دولار (USD)</option>
              <option value="SAR" data-rate="3.75" data-symbol="ر.س">🇸🇦 ريال سعودي (SAR)</option>
              <option value="AED" data-rate="3.67" data-symbol="د.إ">🇦🇪 درهم إماراتي (AED)</option>
              <option value="KWD" data-rate="0.31" data-symbol="د.ك">🇰🇼 دينار كويتي (KWD)</option>
              <option value="DZD" data-rate="245" data-symbol="د.ج">🇩🇿 دينار جزائري (DZD)</option>
            </select>
          </div>

          <button id="btn-theme-toggle" type="button" class="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 transition cursor-pointer">
            🌙 وضع داكن
          </button>
        </div>
      </div>
    </header>

    <!-- STICKY BREADCRUMBS & QUICK JUMP -->
    <nav class="sticky top-3 z-40 flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-300/80 dark:border-slate-700 shadow-md">
      <div class="flex items-center gap-2 overflow-x-auto">
        <a href="../index.html" class="shrink-0 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
          <span>🏠</span>
          <span>أداة التجميع</span>
        </a>
        <span class="text-slate-400">/</span>
        <a href="../blog.html" class="shrink-0 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1.5">
          <span>📚</span>
          <span>المدونة والدليل</span>
        </a>
        <span class="text-slate-400">/</span>
        <span class="shrink-0 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 text-white shadow-xs">
          ${esc(cfg.keyword)}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <a href="#parts-table" class="px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition">📋 القطع</a>
        <a href="#fps-section" class="px-3 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition">🎮 الفريمات (FPS)</a>
        <a href="${esc(builderRelativeUrl)}" class="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition">⚡ فتح بالأداة</a>
      </div>
    </nav>

    <main class="space-y-8">

      <!-- TOP QUICK KPI SUMMARY + DIRECT BUILDER CTA + SHARE BUTTONS -->
      <section class="bg-white/95 dark:bg-slate-800/95 p-5 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-slate-700 shadow-sm space-y-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-700/50">
            <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">التكلفة الإجمالية التقديرية</span>
            <span data-usd="${totalUsd}" class="price-dyn text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">~${totalUsd.toLocaleString('en-US')}$</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">(شامل جميع القطع الـ 7)</span>
          </div>

          <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700">
            <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">حالة التوافق الهندسي</span>
            <span class="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 block">✅ متوافق وآمن 100%</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">فحص المقبس والرام والتبريد</span>
          </div>

          <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700">
            <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">الاستهلاك والباور المطلوب</span>
            <span class="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 block">${totalTdp}W / باور ${parts.psu.wattage}W</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">الحد الآمن: ${safeMinWatts}W</span>
          </div>

          <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700">
            <span class="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">الدقة المستهدفة والتوازن</span>
            <span class="text-base sm:text-lg font-black text-sky-600 dark:text-sky-400 mt-1 block">${esc(cfg.targetRes)}</span>
            <span class="text-[11px] ${bottleneckClass} font-bold block truncate">${esc(bottleneckTitle)}</span>
          </div>
        </div>

        <!-- Direct Auto-Builder CTA Banner -->
        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-l from-emerald-600/15 via-emerald-500/10 to-sky-500/10 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="space-y-1">
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              🛠️ جرّب هذه التجميعة أو عدّل قطعها مباشرة في المجمّع الذكي
            </h2>
            <p class="text-xs text-slate-600 dark:text-slate-300">
              سيتم تعبئة جميع القطع الـ 7 تلقائياً في الأداة لحساب الأسعار بعملتك المحلية وتجربة الترقية وتصدير بطاقة PNG.
            </p>
          </div>
          <a href="${esc(builderRelativeUrl)}"
             class="shrink-0 w-full md:w-auto text-center inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition transform hover:-translate-y-0.5">
            <span>⚡ فتح التجميعة في أداة البناء التلقائي</span>
            <span>←</span>
          </a>
        </div>

        <!-- Share Buttons Bar -->
        <div class="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 text-xs font-extrabold text-slate-600 dark:text-slate-300">
            <span>📤 شارك هذه التجميعة مع أصدقائك:</span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <a href="https://wa.me/?text=${encodedShareText}%20${encodedPageUrl}" target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-extrabold transition">
              <span>💬 واتساب</span>
            </a>
            <a href="https://t.me/share/url?url=${encodedPageUrl}&text=${encodedShareText}" target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-xs font-extrabold transition">
              <span>📢 تيليجرام</span>
            </a>
            <a href="https://twitter.com/intent/tweet?url=${encodedPageUrl}&text=${encodedShareText}" target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/10 dark:bg-slate-700/60 hover:bg-slate-900/20 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 text-xs font-extrabold transition">
              <span>𝕏 مشاركة</span>
            </a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedPageUrl}" target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs font-extrabold transition">
              <span>📘 فيسبوك</span>
            </a>
            <button type="button" id="btn-copy-page-link"
               class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 text-xs font-extrabold transition cursor-pointer">
              <span>🔗 نسخ الرابط</span>
            </button>
            <button type="button" id="btn-native-share"
               class="hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-extrabold transition cursor-pointer">
              <span>📲 مشاركة سريعة</span>
            </button>
          </div>
        </div>
      </section>

      <!-- PARTS TABLE SECTION -->
      <section id="parts-table" class="scroll-mt-20 bg-white/95 dark:bg-slate-800/95 p-5 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-slate-700 shadow-sm space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              1. جدول قطع التجميعة والأسعار التقديرية (7 مكونات متوافقة)
            </h2>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
              جميع القطع مأخوذة مباشرة من قاعدة بيانات الموقع ومفحوصة التوافق من حيث المقبس والرام والطاقة والتبريد.
            </p>
          </div>
          <a href="${esc(builderRelativeUrl)}" class="text-xs font-black text-emerald-700 dark:text-emerald-400 hover:underline">
            تعديل هذه القطع في المجمّع ←
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs sm:text-sm text-right border-collapse">
            <thead>
              <tr class="bg-slate-200/80 dark:bg-slate-700/80 text-slate-900 dark:text-white">
                <th class="p-3 rounded-r-xl font-black">المكوّن</th>
                <th class="p-3 font-black">القطعة المختارة</th>
                <th class="p-3 font-black">المواصفات التقنية</th>
                <th class="p-3 font-black">السعر التقديري</th>
                <th class="p-3 rounded-l-xl font-black text-center">روابط الشراء</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              ${partRows.map(row => `
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                <td class="p-3 font-extrabold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  <span class="ml-1">${row.icon}</span>${esc(row.label)}
                </td>
                <td class="p-3 font-black text-slate-900 dark:text-white">
                  ${esc(row.part.name)}
                </td>
                <td class="p-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  ${esc(row.spec)}
                </td>
                <td class="p-3 font-black text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                  <span data-usd="${row.part.price_usd}" class="price-dyn">${row.part.price_usd === 0 ? 'مشمول (0$)' : `~${row.part.price_usd}$`}</span>
                </td>
                <td class="p-3">
                  <div class="flex items-center justify-center gap-1.5">
                    <a href="${esc(amazonSearchUrl(row.part.name))}" target="_blank" rel="noopener noreferrer"
                       class="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] transition whitespace-nowrap">
                      Amazon ↗
                    </a>
                    <a href="${esc(row.part.affiliate_url)}" target="_blank" rel="noopener noreferrer"
                       class="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] transition whitespace-nowrap">
                      AliExpress ↗
                    </a>
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
            <tfoot>
              <tr class="bg-emerald-50/90 dark:bg-emerald-950/40 border-t-2 border-emerald-500/40">
                <td colspan="3" class="p-3.5 font-black text-slate-900 dark:text-white rounded-r-xl">
                  الإجمالي التقديري للتجميعة المتكاملة
                </td>
                <td class="p-3.5 font-black text-lg text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                  <span data-usd="${totalUsd}" class="price-dyn">~${totalUsd.toLocaleString('en-US')}$</span>
                </td>
                <td class="p-3.5 text-center rounded-l-xl">
                  <a href="${esc(builderRelativeUrl)}" class="inline-block px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition">
                    فتح بالأداة ↗
                  </a>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        ${bestCoupon ? `
        <div class="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-0.5">
            <span class="text-xs font-black text-amber-800 dark:text-amber-300 block">🎟️ كود خصم AliExpress المؤهل لهذه التجميعة:</span>
            <p class="text-xs text-slate-700 dark:text-slate-300">
              استخدم الكود <span class="font-mono font-black px-2 py-0.5 rounded bg-amber-400 text-slate-950 select-all">${esc(bestCoupon.code)}</span> لتوفير <strong class="text-emerald-700 dark:text-emerald-400"><span data-usd="${bestCoupon.discountUsd}" class="price-dyn">~$${bestCoupon.discountUsd}</span></strong> (الصافي التقديري: <strong class="text-emerald-700 dark:text-emerald-400"><span data-usd="${Math.max(0, totalUsd - bestCoupon.discountUsd)}" class="price-dyn">~${Math.max(0, totalUsd - bestCoupon.discountUsd)}$</span></strong>).
            </p>
          </div>
          <button type="button" onclick="copyCoupon('${esc(bestCoupon.code)}', this)" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 text-white text-xs font-black transition cursor-pointer">
            📋 نسخ الكود (${esc(bestCoupon.code)})
          </button>
        </div>` : ''}
      </section>

      <!-- FPS ESTIMATION SECTION FOR ALL SITE GAMES -->
      <section id="fps-section" class="scroll-mt-20 bg-white/95 dark:bg-slate-800/95 p-5 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-slate-700 shadow-sm space-y-6">
        <div class="border-b border-slate-200 dark:border-slate-700 pb-4">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            2. تقدير معدل الإطارات (FPS) في الألعاب الموجودة في الموقع (${gameFps.length} لعبة)
          </h2>
          <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
            القيم محسوبة بنفس معادلة الأداء المعتمدة في المجمّع الذكي على دقة 1080p بالإعدادات القياسية المناسبة لكل لعبة.
          </p>
        </div>

        <!-- Top 4 Highlighted Games -->
        <div>
          <h3 class="text-sm font-black text-slate-800 dark:text-slate-200 mb-3">🔥 أبرز الألعاب المقترحة لهذه التجميعة:</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${highlightedGames.map(g => `
            <div class="p-4 rounded-2xl ${g.isUnderperforming ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700/60' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700'} border text-center flex flex-col justify-between min-h-[115px]">
              <div>
                <span class="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">${esc(g.name)}</span>
                <span class="text-2xl font-black ${getFpsColorClass(g.fps, g.isUnderperforming)} mt-1 block">${g.fps} FPS</span>
              </div>
              <div class="mt-2">${getFpsBadge(g.fps, g.isUnderperforming)}</div>
            </div>`).join('')}
          </div>
        </div>

        <!-- Complete 16-Game FPS Table -->
        <div>
          <h3 class="text-sm font-black text-slate-800 dark:text-slate-200 mb-3">📊 جدول الأداء الكامل لجميع ألعاب الموقع (${gameFps.length} لعبة):</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${gameFps.map(g => `
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
              <div class="min-w-0">
                <span class="text-xs font-extrabold text-slate-900 dark:text-white block truncate">${esc(g.name)}</span>
                <div class="mt-1">${getFpsBadge(g.fps, g.isUnderperforming)}</div>
              </div>
              <span class="text-base font-black ${getFpsColorClass(g.fps, g.isUnderperforming)} shrink-0">${g.fps} FPS</span>
            </div>`).join('')}
          </div>
        </div>

        <!-- Workstation / Editing / Coding Bars + Bottleneck & Monitor -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 class="text-sm font-black text-slate-900 dark:text-white">🎬 أداء المونتاج والبرمجة وتعدد المهام</h3>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-bold text-slate-700 dark:text-slate-300">المونتاج وتعديل الفيديو (Premiere / CapCut)</span>
                <span class="font-extrabold text-emerald-700 dark:text-emerald-400">${esc(editLabel)} (${editScore}%)</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                <div class="bg-emerald-500 h-2.5 rounded-full" style="width: ${editScore}%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-bold text-slate-700 dark:text-slate-300">التصميم والبرمجة وتعدد المهام</span>
                <span class="font-extrabold text-sky-700 dark:text-sky-400">${esc(codeLabel)} (${codeScore}%)</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                <div class="bg-sky-500 h-2.5 rounded-full" style="width: ${codeScore}%"></div>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 class="text-sm font-black text-slate-900 dark:text-white">⚖️ تحليل عنق الزجاجة والشاشة المثالية</h3>
            <p class="text-xs font-extrabold ${bottleneckClass}">${esc(bottleneckTitle)}</p>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${esc(bottleneckDesc)}</p>
            <div class="pt-2 border-t border-slate-200 dark:border-slate-700">
              <span class="text-[11px] font-black text-emerald-700 dark:text-emerald-400 block">🖥️ الشاشة المقترحة: ${esc(monGroup.badge)}</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">${esc(monGroup.desc)}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ARTICLE ANALYSIS SECTION -->
      <article class="bg-white/95 dark:bg-slate-800/95 p-5 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-slate-700 shadow-sm space-y-5">
        <div class="border-b border-slate-200 dark:border-slate-700 pb-4">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            3. مراجعة تقنية تفصيلية: لماذا اخترنا هذه القطع؟
          </h2>
        </div>

        <div class="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">أولاً: فلسفة اختيار المعالج وكارت الشاشة</h3>
          <p>${esc(cfg.whyText)}</p>

          <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">ثانياً: لمن تناسب هذه التجميعة؟</h3>
          <p>${esc(cfg.audienceText)}</p>

          <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">ثالثاً: مسار الترقية المستقبلي وتوصيات الشراء</h3>
          <p>${esc(cfg.upgradePath)}</p>

          <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <h4 class="font-black text-emerald-800 dark:text-emerald-300 text-sm mb-1">💡 نصيحة التوفير الذكي:</h4>
            <p class="text-xs sm:text-sm">
              للحصول على أفضل سعر، قارن بين روابط <strong>Amazon</strong> و <strong>AliExpress</strong> في الجدول أعلاه، ولا تنسَ تقسيم طلبات AliExpress إذا كانت الجمارك في بلدك تفرض رسوماً على الطرود الكبيرة. يمكنك أيضاً فتح التجميعة في <a href="${esc(builderRelativeUrl)}" class="font-black text-emerald-700 dark:text-emerald-400 underline">أداة المجمّع الذكي</a> لاختبار بدائل أرخص أو أقوى بنقرة واحدة.
            </p>
          </div>
        </div>

        <!-- Bottom CTA & Share Repeat -->
        <div class="pt-5 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="${esc(builderRelativeUrl)}"
             class="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm transition shadow-sm">
            <span>🛠️ افتح هذه التجميعة الآن في المجمّع الذكي</span>
          </a>

          <div class="flex flex-wrap items-center gap-2">
            <a href="https://wa.me/?text=${encodedShareText}%20${encodedPageUrl}" target="_blank" rel="noopener noreferrer"
               class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition">💬 واتساب</a>
            <a href="https://t.me/share/url?url=${encodedPageUrl}&text=${encodedShareText}" target="_blank" rel="noopener noreferrer"
               class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition">📢 تيليجرام</a>
            <button type="button" onclick="copyCurrentUrl(this)"
               class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition cursor-pointer">🔗 نسخ الرابط</button>
          </div>
        </div>
      </article>

      <!-- RELATED BUILDS (INTERNAL SEO LINKING) -->
      <section class="bg-slate-100/90 dark:bg-slate-800/60 p-5 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-slate-700 space-y-4">
        <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
          🔄 تجميعات أخرى قد تهمك
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${relatedBuilds.map(rel => `
          <a href="${esc(rel.cfg.slug)}.html" class="group block p-4 rounded-2xl bg-white/95 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 hover:border-emerald-500 transition shadow-xs">
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400">${rel.cfg.badgeEmoji} ${esc(rel.cfg.category)}</span>
              <span data-usd="${rel.totalUsd}" class="price-dyn text-xs font-black text-slate-900 dark:text-white">~${rel.totalUsd}$</span>
            </div>
            <h3 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition leading-snug">
              ${esc(rel.cfg.title)}
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
              ${esc(rel.parts.cpu.name)} • ${esc(rel.parts.gpu.id === 'none' ? 'iGPU' : rel.parts.gpu.name)}
            </p>
          </a>`).join('')}
        </div>
      </section>

    </main>

    <!-- UNIFIED SITE FOOTER -->
    <footer class="mt-14 space-y-6">
      <!-- Telegram Channel Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-sky-500/30 shadow-lg">
        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 text-sky-400">
              <svg class="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            </div>
            <div class="space-y-1.5 text-right">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-extrabold border border-sky-400/30">
                <span>⚡ انضم لمجتمعنا على تيليجرام</span>
              </div>
              <h3 class="text-xl sm:text-2xl font-black text-white">
                قناة التليجرام الرسمية لصفقات الحواسيب والكوبونات
              </h3>
              <p class="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                انضم لقناتنا للحصول على عروض يومية فلاش، أحدث كوبونات التخفيض لـ AliExpress و Amazon، واستشارات التجميع.
              </p>
            </div>
          </div>
          <div class="shrink-0 w-full md:w-auto text-center">
            <a href="https://t.me/pcbuilder_ar" target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center justify-center gap-2.5 w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm transition shadow-lg">
              <span>انضم الآن إلى t.me/pcbuilder_ar ↗</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Footer Navigation & Affiliate Disclosure -->
      <div class="bg-white/95 dark:bg-slate-800/95 p-6 sm:p-8 rounded-3xl border border-slate-300/80 dark:border-slate-700 shadow-sm space-y-6">
        <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div class="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400">
            <span>⚖️ إفصاح التسويق بالعمولة والشفافية:</span>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
            بصفتنا شركاء في برامج التسويق بالعمولة (Amazon Associates و AliExpress)، قد نحصل على عمولة من عمليات الشراء المؤهلة عبر الروابط الموجودة في الموقع دون أي تكلفة إضافية عليك.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-700/50">
          <div>
            <span>© 2026 مُجمّع الحواسيب الذكي (pcbuilder-ar.pages.dev) • جميع الحقوق محفوظة</span>
          </div>
          <div class="flex items-center gap-4">
            <a href="../index.html" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition font-bold">الرئيسية</a>
            <span>•</span>
            <a href="../blog.html" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition font-bold">المدونة</a>
            <span>•</span>
            <a href="../legal.html" class="hover:text-emerald-600 dark:hover:text-emerald-400 transition font-bold">الخصوصية والشروط</a>
            <span>•</span>
            <a href="https://t.me/pcbuilder_ar" target="_blank" rel="noopener noreferrer" class="hover:text-sky-500 transition font-bold">تيليجرام</a>
          </div>
        </div>
      </div>
    </footer>

  </div>

  <script>
    // Theme Toggle
    const themeBtn = document.getElementById('btn-theme-toggle');
    function updateThemeBtn() {
      if (!themeBtn) return;
      const isDark = document.documentElement.classList.contains('dark');
      themeBtn.textContent = isDark ? '☀️ وضع فاتح' : '🌙 وضع داكن';
    }
    updateThemeBtn();
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeBtn();
      });
    }

    // Currency Converter
    const currencySelect = document.getElementById('currency-select');
    function updatePrices() {
      if (!currencySelect) return;
      const opt = currencySelect.options[currencySelect.selectedIndex];
      const code = currencySelect.value;
      const rate = parseFloat(opt.getAttribute('data-rate')) || 1;
      const symbol = opt.getAttribute('data-symbol') || '$';

      document.querySelectorAll('.price-dyn').forEach(el => {
        const usd = parseFloat(el.getAttribute('data-usd'));
        if (isNaN(usd)) return;
        if (usd === 0) {
          el.textContent = code === 'USD' ? 'مشمول (0$)' : 'مشمول (0 ' + symbol + ')';
          return;
        }
        if (code === 'USD') {
          el.textContent = '~' + Math.round(usd).toLocaleString('en-US') + '$';
        } else {
          el.textContent = '~' + Math.round(usd * rate).toLocaleString('en-US') + ' ' + symbol;
        }
      });

      const amzDomain = code === 'AED' ? 'amazon.ae' : 'amazon.sa';
      document.querySelectorAll('a[href*="amazon."]').forEach(link => {
        link.href = link.href.replace(/amazon\\.(sa|ae)/, amzDomain);
      });
    }
    if (currencySelect) {
      currencySelect.addEventListener('change', updatePrices);
    }

    // Copy & Share Helpers
    function copyTextWithFeedback(text, btn) {
      const origHtml = btn.innerHTML;
      const showDone = () => {
        btn.innerHTML = '<span>✅ تم النسخ!</span>';
        btn.classList.add('bg-emerald-600', 'text-white');
        setTimeout(() => {
          btn.innerHTML = origHtml;
          btn.classList.remove('bg-emerald-600', 'text-white');
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showDone).catch(() => {
          fallbackCopy(text);
          showDone();
        });
      } else {
        fallbackCopy(text);
        showDone();
      }
    }

    function fallbackCopy(text) {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(el);
    }

    function copyCurrentUrl(btn) {
      copyTextWithFeedback(window.location.href, btn);
    }

    function copyCoupon(code, btn) {
      copyTextWithFeedback(code, btn);
    }

    const copyPageBtn = document.getElementById('btn-copy-page-link');
    if (copyPageBtn) {
      copyPageBtn.addEventListener('click', () => copyCurrentUrl(copyPageBtn));
    }

    const nativeShareBtn = document.getElementById('btn-native-share');
    if (nativeShareBtn && navigator.share) {
      nativeShareBtn.classList.remove('hidden');
      nativeShareBtn.addEventListener('click', () => {
        navigator.share({
          title: document.title,
          url: window.location.href
        }).catch(() => {});
      });
    }
  </script>
</body>
</html>`;
}

// ============================================================================
// 6. Update sitemap.xml Idempotently
// ============================================================================
function updateSitemap(builds) {
  let baseEntries = [
    { loc: `${SITE_BASE_URL}/`, lastmod: '2026-11-20', changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_BASE_URL}/blog.html`, lastmod: '2026-11-20', changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE_BASE_URL}/legal.html`, lastmod: '2026-11-20', changefreq: 'monthly', priority: '0.8' }
  ];

  if (fs.existsSync(SITEMAP_PATH)) {
    const existingXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
    const urlBlocks = [...existingXml.matchAll(/<url>([\s\S]*?)<\/url>/g)];
    const parsedExisting = [];
    for (const m of urlBlocks) {
      const block = m[1];
      const loc = (block.match(/<loc>(.*?)<\/loc>/) || [])[1];
      if (!loc || loc.includes('/builds/')) continue;
      parsedExisting.push({
        loc: loc.trim(),
        lastmod: ((block.match(/<lastmod>(.*?)<\/lastmod>/) || [])[1] || TODAY_ISO).trim(),
        changefreq: ((block.match(/<changefreq>(.*?)<\/changefreq>/) || [])[1] || 'weekly').trim(),
        priority: ((block.match(/<priority>(.*?)<\/priority>/) || [])[1] || '0.8').trim()
      });
    }
    if (parsedExisting.length > 0) {
      baseEntries = parsedExisting;
    }
  }

  const buildEntries = builds.map(b => ({
    loc: `${SITE_BASE_URL}/builds/${b.cfg.slug}.html`,
    lastmod: TODAY_ISO,
    changefreq: 'weekly',
    priority: '0.8'
  }));

  const allEntries = [...baseEntries, ...buildEntries];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.map(u => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${esc(u.lastmod)}</lastmod>
    <changefreq>${esc(u.changefreq)}</changefreq>
    <priority>${esc(u.priority)}</priority>
  </url>`).join('\n')}
</urlset>
`;
  fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
  return allEntries.length;
}

// ============================================================================
// 7. Main Execution
// ============================================================================
function main() {
  if (BUILDS_CONFIG.length !== 25) {
    throw new Error(`Expected 25 builds, found ${BUILDS_CONFIG.length}`);
  }

  const db = loadDatabase();
  const indexHtml = fs.readFileSync(INDEX_PATH, 'utf8');
  const gamesCatalog = extractGamesCatalog(indexHtml);
  const coupons = extractCoupons(indexHtml);
  const monitorCatalog = extractMonitorCatalog(indexHtml);

  const resolvedBuilds = BUILDS_CONFIG.map(cfg =>
    resolveAndValidateBuild(cfg, db, gamesCatalog, coupons)
  );

  if (!fs.existsSync(BUILDS_DIR)) {
    fs.mkdirSync(BUILDS_DIR, { recursive: true });
  }

  for (const build of resolvedBuilds) {
    const html = renderBuildHtml(build, resolvedBuilds, monitorCatalog);
    const outPath = path.join(BUILDS_DIR, `${build.cfg.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
  }

  const totalSitemapUrls = updateSitemap(resolvedBuilds);

  console.log(`✅ Generated ${resolvedBuilds.length} RTL SEO build pages in: ${BUILDS_DIR}`);
  console.log(`🎮 Included FPS estimations for ${gamesCatalog.length} site games per page.`);
  console.log(`🗺️ Updated sitemap.xml with ${totalSitemapUrls} total URLs.`);
}

main();
