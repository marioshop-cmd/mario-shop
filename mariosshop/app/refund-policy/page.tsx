'use client';

import Link from 'next/link';
import { useLanguage } from '@/app/language/LanguageContext';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type Language = 'tn' | 'en' | 'fr';

interface PolicySection {
  heading: string;
  body: string;
}

interface PolicyContent {
  title: string;
  updatedLabel: string;
  intro: string;
  sections: PolicySection[];
  warning: string;
}

/* -------------------------------------------------------------------------- */
/*  Content — English                                                        */
/* -------------------------------------------------------------------------- */

const EN_CONTENT: PolicyContent = {
  title: 'Refund & Warranty Policy',
  updatedLabel: 'Every product has its own refund & warranty conditions',
  intro: `At Marios Shop, refund and warranty conditions may vary from one product to another.

Because our products and services have different delivery methods, usage conditions, and warranty periods, there is no single refund rule that applies to every product.

The refund and warranty information displayed on the individual product page is an important part of the product's purchase conditions.

Customers are responsible for reviewing these conditions before completing a purchase.`,
  sections: [
    {
      heading: '1. Product-Specific Refund Conditions',
      body: `Each product available on Marios Shop may have its own refund and warranty conditions.

Before purchasing a product, customers should check the product page for information such as:

• Whether the product includes a warranty
• The duration of the warranty
• Whether refunds are available
• Whether refunds are partial or full
• Conditions required for a refund
• Conditions that may invalidate the warranty
• Any additional requirements or restrictions

The conditions displayed on the product page for that specific product will determine whether a refund or warranty claim is available.`,
    },
    {
      heading: '2. Products With a Warranty',
      body: `If a product is sold with a warranty, the warranty period and conditions will be clearly indicated on the product page.

During the stated warranty period, the customer may contact Marios Shop Support if the product stops working or does not function according to the conditions described on the product page.

Depending on the product and the circumstances, Marios Shop may:

• Troubleshoot the issue
• Restore access or functionality
• Replace the product
• Replace the remaining service period
• Provide an equivalent product
• Issue a full or partial refund if the product's stated refund conditions allow it

A warranty does not automatically mean that every problem qualifies for a refund.

The specific warranty conditions displayed on the product page will apply.`,
    },
    {
      heading: '3. Products Without a Warranty',
      body: `If a product is clearly marked as "No Warranty", "No Refund", or otherwise states that warranty/refund protection is not included, the purchase will generally not qualify for a refund or replacement after successful delivery.

Customers should carefully review the product information before purchasing products without warranty coverage.

Once the product has been successfully delivered, Marios Shop is not obligated to provide compensation simply because the customer later changes their mind or no longer wants the product.`,
    },
    {
      heading: '4. Warranty Period',
      body: `When a product includes a warranty, the exact warranty duration will be displayed on the product page.

For example, a product may have:

• 7-day warranty
• 30-day warranty
• 60-day warranty
• 90-day warranty
• 180-day warranty
• No warranty

These are only examples. The warranty period for each product is determined individually and will be shown on its product page.

The warranty period normally begins from the date the product is successfully delivered or activated, unless a different starting point is specified on the product page.`,
    },
    {
      heading: '5. What the Warranty Covers',
      body: `A warranty generally applies only to problems that occur under normal use and are not caused by the customer's actions.

Depending on the product, warranty coverage may include situations such as:

• The product stops functioning unexpectedly
• Access is lost for a reason covered by the product warranty
• A delivered product does not work as described
• A covered service becomes unavailable during the warranty period

However, warranty coverage is product-specific.

Customers should always refer to the warranty conditions shown on the product page.`,
    },
    {
      heading: '6. Situations That May Void a Warranty',
      body: `Even when a product includes a warranty, the warranty may become invalid if the problem results from the customer's actions.

Depending on the product, this may include:

• Changing account information
• Changing passwords or security information
• Sharing an account when prohibited
• Removing an account owner or administrator
• Leaving a family or group subscription
• Modifying the product or account without authorization
• Violating the third-party service's Terms of Service
• Misusing the product
• Ignoring the instructions provided with the product
• Providing incorrect information
• Any other action that causes or contributes to the product becoming unusable

The exact exclusions may vary depending on the product.`,
    },
    {
      heading: '7. Refunds During the Warranty Period',
      body: `A product having a warranty does not automatically guarantee a refund.

When a valid issue is reported, Marios Shop may first attempt to resolve the problem or provide a replacement.

If the issue cannot reasonably be resolved and the product's specific refund conditions allow compensation, Marios Shop may provide:

• A full refund
• A partial refund
• A replacement
• Replacement of the remaining service period
• Another appropriate resolution

The available resolution depends on the product's individual conditions.`,
    },
    {
      heading: '8. Partial Refunds',
      body: `Some products may allow partial refunds based on the remaining unused portion of the product's warranty or service period.

If a product uses a proportional refund system, the calculation method will be determined by the conditions specified for that product.

For example:

Refund Amount = Unused Eligible Period ÷ Total Eligible Period × Purchase Price

This calculation does not automatically apply to every product.

If a product has a different refund calculation or does not offer partial refunds, its individual product conditions will apply instead.`,
    },
    {
      heading: '9. Products With No Refund Option',
      body: `Some products may explicitly state that refunds are not available, even if technical support or another form of assistance is provided.

If the product page states that the purchase is non-refundable, customers should consider the purchase final once the product has been successfully delivered.

Any exception will be handled only where required by applicable law or where Marios Shop voluntarily approves an exception.`,
    },
    {
      heading: '10. Customer Errors',
      body: `Refund eligibility may also depend on whether the issue was caused by the customer.

Examples may include:

• Purchasing the wrong product
• Entering incorrect account information
• Providing incorrect delivery information
• Purchasing a product without meeting its listed requirements
• Using the product incorrectly
• Failing to follow activation instructions
• Making unauthorized changes to the product or account

If the product page contains specific rules regarding these situations, those rules will apply.`,
    },
    {
      heading: '11. How to Request a Refund or Warranty Claim',
      body: `If you experience an issue with a product, contact Marios Shop Support through the available support system.

Your request should include:

• Order number
• Product name
• Description of the problem
• Relevant screenshots or evidence when requested
• Any other information necessary to verify the issue

Our support team may investigate the order and determine whether the reported problem falls within the product's stated warranty or refund conditions.`,
    },
    {
      heading: '12. Refund Method',
      body: `If a refund is approved, the available refund method may depend on the original payment method and the specific conditions of the product.

Depending on the circumstances, an approved refund may be provided through:

• Marios Shop account balance
• Original payment method, where technically possible
• Another method agreed upon by Marios Shop

The applicable refund method may be communicated when the refund is approved.`,
    },
    {
      heading: '13. Abuse and Fraud',
      body: `Marios Shop reserves the right to reject warranty or refund requests when there is evidence of abuse, fraud, manipulation, or an attempt to obtain an unauthorized benefit.

This may include:

• False refund claims
• Repeated abusive claims
• Chargeback abuse
• Unauthorized account modifications
• Sharing products where prohibited
• Deliberately causing a product to stop working
• Attempting to bypass product restrictions
• Providing false or misleading information
• Attempting to exploit the refund system

Accounts involved in repeated abuse may be restricted or suspended.`,
    },
    {
      heading: '14. Important Notice Before Purchase',
      body: `Please always check the refund and warranty information displayed on the product page before purchasing.

Because every product may have different conditions, the product page is the primary reference for determining:

• Whether the product has a warranty
• How long the warranty lasts
• Whether a refund is available
• What situations are covered
• What situations are excluded
• Whether refunds are full or partial
• Any additional product-specific requirements

By completing a purchase, the customer acknowledges that they have had the opportunity to review the applicable product information and its refund/warranty conditions.`,
    },
    {
      heading: '15. Policy Updates',
      body: `Marios Shop may update this Refund & Warranty Policy when necessary.

Any updated version will be published on this page.

Product-specific refund and warranty conditions may also be updated where appropriate, but the conditions applicable to an existing order will be determined according to the information and terms applicable to that purchase, subject to applicable law.`,
    },
  ],
  warning:
    '⚠️ Refund and warranty conditions are different for each product. Always check the product page before purchasing. The warranty/refund information shown on the product page applies to that specific product.',
};

/* -------------------------------------------------------------------------- */
/*  Content — Tunisian / Arabic script (site's "tn" slot)                    */
/* -------------------------------------------------------------------------- */

const TN_CONTENT: PolicyContent = {
  title: 'سياسة الاسترداد والضمان',
  updatedLabel: 'لكل منتج شروط استرداد وضمان خاصة به',
  intro: `في Marios Shop، قد تختلف شروط الاسترداد والضمان من منتج إلى آخر.

نظرًا لاختلاف المنتجات والخدمات من حيث طريقة التسليم وشروط الاستخدام ومدة الضمان، لا توجد قاعدة موحدة للاسترداد تنطبق على جميع المنتجات.

تُعد معلومات الاسترداد والضمان الموضحة في صفحة كل منتج جزءًا مهمًا من شروط شراء ذلك المنتج.

يتحمل العميل مسؤولية مراجعة هذه الشروط قبل إتمام عملية الشراء.`,
  sections: [
    {
      heading: '1. شروط الاسترداد الخاصة بكل منتج',
      body: `قد تكون لكل منتج متوفر على Marios Shop شروطه الخاصة المتعلقة بالاسترداد والضمان.

قبل شراء أي منتج، يجب على العميل مراجعة صفحة المنتج لمعرفة:

• ما إذا كان المنتج يشمل ضمانًا
• مدة الضمان
• ما إذا كان الاسترداد متاحًا
• ما إذا كان الاسترداد كاملًا أو جزئيًا
• الشروط المطلوبة للحصول على الاسترداد
• الحالات التي قد تؤدي إلى إلغاء الضمان
• أي متطلبات أو قيود إضافية

تحدد الشروط الموضحة في صفحة المنتج المحدد ما إذا كان العميل مؤهلًا للاسترداد أو الاستفادة من الضمان.`,
    },
    {
      heading: '2. المنتجات التي تشمل ضمانًا',
      body: `إذا كان المنتج يُباع مع ضمان، فسيتم توضيح مدة الضمان وشروطه في صفحة المنتج.

خلال فترة الضمان المحددة، يمكن للعميل التواصل مع دعم Marios Shop إذا توقف المنتج عن العمل أو لم يعد يعمل وفقًا للشروط الموضحة في صفحة المنتج.

وبحسب نوع المنتج والظروف، قد تقوم Marios Shop بـ:

• محاولة حل المشكلة
• استعادة الوصول أو الوظائف
• استبدال المنتج
• تعويض الفترة المتبقية من الخدمة
• توفير منتج بديل مماثل
• تقديم استرداد كامل أو جزئي إذا كانت شروط المنتج تسمح بذلك

وجود ضمان للمنتج لا يعني تلقائيًا أن كل مشكلة تؤهل العميل للحصول على استرداد مالي.

وتطبق شروط الضمان المحددة الموضحة في صفحة المنتج.`,
    },
    {
      heading: '3. المنتجات التي لا تشمل ضمانًا',
      body: `إذا كان المنتج موضحًا بشكل صريح بأنه "بدون ضمان" أو "غير قابل للاسترداد" أو إذا كانت صفحة المنتج تنص على عدم وجود حماية من الضمان أو الاسترداد، فلن يكون المنتج مؤهلًا بشكل عام للاسترداد أو الاستبدال بعد نجاح عملية التسليم.

يجب على العملاء مراجعة معلومات المنتج بعناية قبل شراء المنتجات التي لا تشمل ضمانًا.

بعد تسليم المنتج بنجاح، لا تلتزم Marios Shop بتقديم تعويض لمجرد تغيير العميل لرأيه أو عدم رغبته في المنتج.`,
    },
    {
      heading: '4. مدة الضمان',
      body: `عندما يتضمن المنتج ضمانًا، سيتم توضيح مدة الضمان بشكل دقيق في صفحة المنتج.

على سبيل المثال، قد تكون مدة الضمان:

• 7 أيام
• 30 يومًا
• 60 يومًا
• 90 يومًا
• 180 يومًا
• بدون ضمان

هذه مجرد أمثلة. تُحدد مدة الضمان لكل منتج بشكل منفصل ويتم عرضها في صفحة المنتج الخاصة به.

تبدأ فترة الضمان عادةً من تاريخ تسليم المنتج أو تفعيله بنجاح، ما لم يتم تحديد تاريخ بداية مختلف في صفحة المنتج.`,
    },
    {
      heading: '5. ما الذي يشمله الضمان؟',
      body: `يطبق الضمان عادةً على المشكلات التي تحدث أثناء الاستخدام الطبيعي للمنتج والتي لا تكون ناتجة عن تصرفات العميل.

وبحسب المنتج، قد يشمل الضمان حالات مثل:

• توقف المنتج عن العمل بشكل غير متوقع
• فقدان الوصول لسبب مشمول بالضمان
• عدم عمل المنتج كما هو موضح في صفحة المنتج
• توقف خدمة مشمولة بالضمان عن العمل خلال فترة الضمان

ومع ذلك، فإن تغطية الضمان تختلف حسب المنتج.

يجب على العميل دائمًا الرجوع إلى شروط الضمان الموضحة في صفحة المنتج.`,
    },
    {
      heading: '6. الحالات التي قد تؤدي إلى إلغاء الضمان',
      body: `حتى إذا كان المنتج يشمل ضمانًا، فقد يصبح الضمان غير صالح إذا كانت المشكلة ناتجة عن تصرفات العميل.

وقد يشمل ذلك، بحسب المنتج:

• تغيير معلومات الحساب
• تغيير كلمات المرور أو معلومات الأمان
• مشاركة الحساب عندما يكون ذلك ممنوعًا
• إزالة مالك الحساب أو المسؤول عنه
• مغادرة اشتراك عائلي أو مجموعة
• تعديل المنتج أو الحساب دون تصريح
• مخالفة شروط استخدام الخدمة التابعة لجهة خارجية
• إساءة استخدام المنتج
• عدم اتباع التعليمات المقدمة مع المنتج
• تقديم معلومات غير صحيحة
• أي تصرف آخر يؤدي إلى عدم إمكانية استخدام المنتج أو يساهم في ذلك

قد تختلف الاستثناءات والشروط من منتج إلى آخر.`,
    },
    {
      heading: '7. الاسترداد خلال فترة الضمان',
      body: `وجود ضمان للمنتج لا يعني تلقائيًا ضمان الحصول على استرداد مالي.

عند الإبلاغ عن مشكلة صحيحة، قد تحاول Marios Shop أولًا حل المشكلة أو تقديم منتج بديل.

إذا تعذر حل المشكلة بشكل معقول وكانت شروط الاسترداد الخاصة بالمنتج تسمح بالتعويض، فقد تقدم Marios Shop:

• استردادًا كاملًا
• استردادًا جزئيًا
• استبدال المنتج
• تعويض الفترة المتبقية من الخدمة
• حلًا آخر مناسبًا

ويعتمد الحل المتاح على الشروط الخاصة بالمنتج.`,
    },
    {
      heading: '8. الاسترداد الجزئي',
      body: `قد تسمح بعض المنتجات باسترداد جزئي بناءً على الفترة المتبقية غير المستخدمة من الضمان أو مدة الخدمة.

إذا كان المنتج يستخدم نظامًا للاسترداد النسبي، فسيتم تحديد طريقة الحساب وفقًا للشروط الموضحة لذلك المنتج.

على سبيل المثال:

مبلغ الاسترداد = الفترة المؤهلة غير المستخدمة ÷ إجمالي الفترة المؤهلة × سعر الشراء

ولا يتم تطبيق هذه المعادلة تلقائيًا على جميع المنتجات.

إذا كان للمنتج طريقة مختلفة لحساب الاسترداد أو لم يكن يوفر استردادًا جزئيًا، فستطبق شروط المنتج الخاصة بدلًا من ذلك.`,
    },
    {
      heading: '9. المنتجات غير القابلة للاسترداد',
      body: `قد تنص بعض المنتجات بشكل صريح على أن الاسترداد غير متاح، حتى في حال توفير الدعم الفني أو أي نوع آخر من المساعدة.

إذا كانت صفحة المنتج تنص على أن عملية الشراء غير قابلة للاسترداد، فيجب على العميل اعتبار عملية الشراء نهائية بعد نجاح تسليم المنتج.

ويُستثنى من ذلك أي حالة يفرض فيها القانون المعمول به تقديم استرداد، أو أي استثناء توافق عليه Marios Shop بشكل اختياري.`,
    },
    {
      heading: '10. أخطاء العميل',
      body: `قد تعتمد أهلية العميل للحصول على الاسترداد أيضًا على ما إذا كانت المشكلة ناتجة عن خطأ من العميل.

ومن أمثلة ذلك:

• شراء المنتج الخطأ
• إدخال معلومات حساب غير صحيحة
• تقديم معلومات تسليم غير صحيحة
• شراء منتج دون استيفاء المتطلبات الموضحة
• استخدام المنتج بطريقة غير صحيحة
• عدم اتباع تعليمات التفعيل
• إجراء تغييرات غير مصرح بها على المنتج أو الحساب

إذا كانت صفحة المنتج تتضمن قواعد محددة لهذه الحالات، فستطبق تلك القواعد.`,
    },
    {
      heading: '11. كيفية طلب الاسترداد أو الاستفادة من الضمان',
      body: `إذا واجهت مشكلة في أحد المنتجات، يرجى التواصل مع دعم Marios Shop من خلال نظام الدعم المتاح.

يجب أن يتضمن طلبك:

• رقم الطلب
• اسم المنتج
• وصف المشكلة
• لقطات شاشة أو أدلة ذات صلة عند طلبها
• أي معلومات أخرى ضرورية للتحقق من المشكلة

قد يقوم فريق الدعم بمراجعة الطلب وتحديد ما إذا كانت المشكلة المبلغ عنها مشمولة بشروط الضمان أو الاسترداد الخاصة بالمنتج.`,
    },
    {
      heading: '12. طريقة الاسترداد',
      body: `إذا تمت الموافقة على الاسترداد، فقد تعتمد طريقة الاسترداد المتاحة على طريقة الدفع الأصلية والشروط الخاصة بالمنتج.

وبحسب الحالة، قد يتم تقديم الاسترداد من خلال:

• رصيد حساب Marios Shop
• طريقة الدفع الأصلية، عندما يكون ذلك ممكنًا تقنيًا
• طريقة أخرى يتم الاتفاق عليها مع Marios Shop

سيتم توضيح طريقة الاسترداد عند الموافقة على الطلب.`,
    },
    {
      heading: '13. إساءة الاستخدام والاحتيال',
      body: `تحتفظ Marios Shop بالحق في رفض طلبات الاسترداد أو الضمان في حال وجود أدلة على إساءة الاستخدام أو الاحتيال أو التلاعب أو محاولة الحصول على منفعة غير مصرح بها.

وقد يشمل ذلك:

• تقديم طلبات استرداد كاذبة
• تكرار الطلبات بشكل مسيء
• إساءة استخدام عمليات الاعتراض على المدفوعات
• إجراء تعديلات غير مصرح بها على الحساب
• مشاركة المنتجات عندما يكون ذلك ممنوعًا
• التسبب عمدًا في توقف المنتج عن العمل
• محاولة تجاوز قيود المنتج
• تقديم معلومات كاذبة أو مضللة
• محاولة استغلال نظام الاسترداد

وقد يتم تقييد أو تعليق الحسابات التي تشارك في إساءة استخدام متكررة.`,
    },
    {
      heading: '14. تنبيه مهم قبل الشراء',
      body: `يرجى دائمًا مراجعة معلومات الاسترداد والضمان الموضحة في صفحة المنتج قبل الشراء.

نظرًا لأن كل منتج قد تكون له شروط مختلفة، فإن صفحة المنتج هي المرجع الأساسي لتحديد:

• ما إذا كان المنتج يشمل ضمانًا
• مدة الضمان
• ما إذا كان الاسترداد متاحًا
• الحالات التي يشملها الضمان
• الحالات المستثناة
• ما إذا كان الاسترداد كاملًا أو جزئيًا
• أي متطلبات إضافية خاصة بالمنتج

بإتمام عملية الشراء، يقر العميل بأنه أُتيحت له الفرصة لمراجعة معلومات المنتج وشروط الاسترداد والضمان المطبقة عليه.`,
    },
    {
      heading: '15. تحديثات السياسة',
      body: `قد تقوم Marios Shop بتحديث سياسة الاسترداد والضمان هذه عند الحاجة.

سيتم نشر أي نسخة محدثة من هذه السياسة على هذه الصفحة.

كما قد يتم تحديث شروط الاسترداد والضمان الخاصة بالمنتجات عند الحاجة، ولكن الشروط المطبقة على طلب قائم سيتم تحديدها وفقًا للمعلومات والشروط المعمول بها عند إجراء عملية الشراء، مع مراعاة القوانين المعمول بها.`,
    },
  ],
  warning:
    'تختلف شروط الاسترداد والضمان من منتج إلى آخر. يرجى دائمًا مراجعة صفحة المنتج قبل الشراء. وتُطبق معلومات الضمان والاسترداد الموضحة في صفحة المنتج على ذلك المنتج تحديدًا.',
};

/* -------------------------------------------------------------------------- */
/*  Content map                                                              */
/* -------------------------------------------------------------------------- */

// No French copy has been provided yet — French visitors see the English
// version for now. Once real French text is written, replace `fr: EN_CONTENT`
// below with its own PolicyContent object (same shape as EN_CONTENT/TN_CONTENT).
const POLICY_CONTENT: Record<Language, PolicyContent> = {
  en: EN_CONTENT,
  tn: TN_CONTENT,
  fr: EN_CONTENT,
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                     */
/* -------------------------------------------------------------------------- */

export default function RefundPolicyPage() {
  const { language } = useLanguage();
  const content = POLICY_CONTENT[language as Language] ?? EN_CONTENT;

  return (
    <main className="space-y-10 bg-zinc-950 px-4 pb-16 pt-28 text-white sm:px-6 sm:pt-32 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          ← Back to Marios Shop
        </Link>

        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-red-500">
            {content.updatedLabel}
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">{content.title}</h1>
        </div>

        {/* Warning callout */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-300 whitespace-pre-line">
          {content.warning}
        </div>

        {/* Intro */}
        <div className="rounded-3xl border border-zinc-800/60 bg-zinc-950/60 p-6 backdrop-blur-md md:p-8">
          <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">{content.intro}</p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {content.sections.map((section) => (
            <div
              key={section.heading}
              className="rounded-3xl border border-zinc-800/60 bg-zinc-950/60 p-6 backdrop-blur-md md:p-8"
            >
              <h2 className="mb-3 text-lg font-bold text-red-500">{section.heading}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Bottom back link */}
        <div className="text-center pt-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm font-bold text-white hover:border-red-500/40 transition"
          >
            Have a question about a specific order? Contact us →
          </Link>
        </div>
      </div>
    </main>
  );
}
