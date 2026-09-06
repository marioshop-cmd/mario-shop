// Central translation dictionary.
// Add new keys here as we translate more of the site.
// tn = Tunisian derja (تونسي، مكتوب بالعربي، مش فصحى), en = English, fr = French.
// Brand/product names (Steam, Discord, Instagram, Claude AI, Free Fire,
// Ooredoo, D17...) are kept in Latin script even in Tunisian mode.
// Layout stays left-to-right by design — Arabic text is not wrapped in a
// dir="rtl" container, per product decision.

export type Language = 'tn' | 'en' | 'fr';

export const translations: Record<string, Record<Language, string>> = {
  // Navbar
  nav_home: { tn: 'الرئيسية', en: 'HOME', fr: 'ACCUEIL' },
  nav_services: { tn: 'الخدمات', en: 'SERVICES', fr: 'SERVICES' },
  nav_orders: { tn: 'طلباتي', en: 'MY ORDERS', fr: 'MES COMMANDES' },
  nav_referral: { tn: 'جيب أصحابك', en: 'REFERRAL', fr: 'PARRAINAGE' },
  nav_contact: { tn: 'اتصل بينا', en: 'CONTACT US', fr: 'CONTACTEZ-NOUS' },
  nav_faq: { tn: 'أسئلة و أجوبة', en: 'FAQ', fr: 'FAQ' },
  search_placeholder: { tn: ' على شنوا تلوج..', en: 'What are you looking for', fr: 'Que recherchez-vous' },
  logout: { tn: 'خروج', en: 'Logout', fr: 'Déconnexion' },
  login: { tn: 'دخول', en: 'Login', fr: 'Connexion' },
  currency_name: { tn: 'بقشيش', en: 'Coins', fr: 'Pièces' },
  add_to_cart: { tn: 'حط في القفة', en: 'Add to Cart', fr: 'Ajouter au panier' },
  select_plan: { tn: 'اختار  لي تحب:', en: 'SELECT PLAN / OPTION:', fr: 'CHOISIR UNE OFFRE :' },
  in_stock: { tn: 'فما فلمخزون', en: 'in stock', fr: 'en stock' },

  // Services page
  cart_button: { tn: 'القفة', en: 'Cart', fr: 'Panier' },
  back_to_products: { tn: '← إرجع للمنتجات', en: '← Back to Products', fr: '← Retour aux produits' },
  description_label: { tn: 'الوصف', en: 'Description', fr: 'Description' },
  you_pay: { tn: 'تخلص', en: 'You Pay', fr: 'Vous payez' },
  contact_us_to_buy: { tn: 'اتصل بنا باش تشري', en: 'Contact Us to Buy', fr: 'Contactez-nous pour acheter' },
  or_pay_online: { tn: 'ولا خلص أونلاين', en: 'Or Pay Online', fr: 'Ou payez en ligne' },
  pay_with: { tn: 'خلص بـ', en: 'Pay with', fr: 'Payer avec' },
  what_you_get_with: { tn: 'شنوة تحصل عليه مع', en: 'What you get with', fr: 'Ce que vous obtenez avec' },
  important_information: { tn: 'حاجات مهمة تعرفها:', en: 'Important Information:', fr: 'Informations importantes :' },
  select_plan_option: { tn: 'اختار الخطة لي تحب:', en: 'Select Plan / Option:', fr: 'Choisir une offre :' },
  availability_label: { tn: 'فما ولا لا:', en: 'Availability:', fr: 'Disponibilité :' },
  sold_out: { tn: 'وفا فلمخزون', en: 'Sold Out', fr: 'Épuisé' },
  customer_reviews: { tn: 'آراء كليونات', en: 'Customer Reviews', fr: 'Avis clients' },
  write_a_review: { tn: '+ اكتب رأيك', en: '+ Write a Review', fr: '+ Rédiger un avis' },
  no_reviews_yet: {
    tn: 'مفماش آراء لهذا المنتج توا. كون أول واحد يكتب!',
    en: 'No reviews yet for this product. Be the first to leave one!',
    fr: "Pas encore d'avis pour ce produit. Soyez le premier à en laisser un !",
  },
  services_hero_title: { tn: "MARIO'S SHOP & SERVICES", en: "MARIO'S SHOP & SERVICES", fr: "MARIO'S SHOP & SERVICES" },
  explore_products_under: { tn: 'شوف منتجات', en: 'Explore products under', fr: 'Explorez les produits de' },
  services_hero_sub: {
    tn: 'دور ولا فلتري بالكاتيغوري تحت باش تلقى كارتات الهدايا، الشحن، و الحسابات.',
    en: 'Search or filter by categories below to browse gift cards, top-ups, and accounts.',
    fr: 'Recherchez ou filtrez par catégorie ci-dessous pour parcourir cartes cadeaux, recharges et comptes.',
  },
  search_services_placeholder: {
    tn: 'دور على خدمة (مثلا: Steam، Claude AI، Free Fire)...',
    en: 'Search services (e.g. Steam, Claude AI, Free Fire)...',
    fr: 'Rechercher un service (ex. Steam, Claude AI, Free Fire)...',
  },
  categories_label: { tn: 'الكاتيغوريات', en: 'Categories', fr: 'Catégories' },
  services_suffix: { tn: 'خدمات', en: 'Services', fr: 'Services' },
  available_label: { tn: 'موجود', en: 'Available', fr: 'disponibles' },
  sort_default: { tn: 'الترتيب: عادي', en: 'Sort: Default', fr: 'Trier : Par défaut' },
  sort_name_asc: { tn: 'حسب الاسم', en: 'Name A-Z', fr: 'Nom A-Z' },
  sort_most_products: { tn: 'أكثر منتجات', en: 'Most Products', fr: 'Plus de produits' },
  clear_filters: { tn: 'امسح الفلاتر', en: 'Clear filters', fr: 'Effacer les filtres' },
  cant_find_it_title: { tn: 'ما لقيتش لي تحب؟', en: "Can't find it?", fr: 'Vous ne trouvez pas ?' },
  cant_find_it_desc: {
    tn: 'نجيبولك أي لعبة، بطاقة هدية ولا منتج ديجيتال.',
    en: 'We can get any game, gift card or digital product.',
    fr: 'Nous pouvons trouver tout jeu, carte cadeau ou produit numérique.',
  },
  contact_us_button: { tn: 'اتصل بنا', en: 'Contact Us', fr: 'Contactez-nous' },
  no_services_found: {
    tn: 'ما لقيناش خدمات تطابق بحثك.',
    en: 'No services found matching your search.',
    fr: 'Aucun service ne correspond à votre recherche.',
  },
  products_count_label: { tn: 'منتجات', en: 'Products', fr: 'Produits' },
  view_all: { tn: 'شوف الكل ←', en: 'View All →', fr: 'Voir tout →' },
  from_price_label: { tn: 'من', en: 'From', fr: 'À partir de' },
  buy_now: { tn: 'اشري توا', en: 'Buy now', fr: 'Acheter' },
  back_to_services: { tn: '← لوّل للخدمات', en: '← Back to Services', fr: '← Retour aux services' },
  products_suffix: { tn: 'منتجات', en: 'Products', fr: 'Produits' },
  out_of_stock: { tn: 'وفا من المخزون', en: 'Out of Stock', fr: 'Épuisé' },
  unavailable: { tn: 'موش موجود', en: 'Unavailable', fr: 'Indisponible' },
  view_details: { tn: 'شوف التفاصيل ←', en: 'View Details →', fr: 'Voir les détails →' },
  view_options_buy: { tn: 'شوف الخيارات و اشري ←', en: 'View Options & Buy →', fr: 'Voir les offres et acheter →' },

  // Category names (display only — internal category values stay in English for filtering)
  cat_all: { tn: 'الكل', en: 'All', fr: 'Tous' },
  cat_ai: { tn: 'ذكاء اصطناعي', en: 'AI', fr: 'IA' },
  cat_giftcards: { tn: 'كارتات هدية', en: 'Gift Cards', fr: 'Cartes cadeaux' },
  cat_gaming: { tn: 'ألعاب', en: 'Gaming', fr: 'Jeux vidéo' },
  cat_gametopups: { tn: 'شحن الألعاب', en: 'Game Top-Ups', fr: 'Recharges de jeux' },
  cat_streaming: { tn: 'ستريمينغ', en: 'Streaming', fr: 'Streaming' },
  cat_subscriptions: { tn: 'اشتراكات', en: 'Subscriptions', fr: 'Abonnements' },
  cat_software: { tn: 'برمجيات', en: 'Software', fr: 'Logiciels' },
  cat_accounts: { tn: 'حسابات', en: 'Accounts', fr: 'Comptes' },
  cat_mobileapps: { tn: 'تطبيقات الجوال', en: 'Mobile Apps', fr: 'Applications mobiles' },
  cat_other: { tn: 'حاجات أخرى', en: 'Other', fr: 'Autre' },

  // Quick tag pills (Services page, below search bar)
  tag_subscriptions: { tn: 'اشتراكات', en: 'Subscriptions', fr: 'Abonnements' },
  tag_topups: { tn: 'شحن', en: 'Top ups', fr: 'Recharges' },
  tag_giftcards: { tn: 'كارتات هدية', en: 'Gift Cards', fr: 'Cartes cadeaux' },
  tag_games: { tn: 'ألعاب', en: 'Games', fr: 'Jeux' },
  tag_software: { tn: 'برمجيات', en: 'Software', fr: 'Logiciels' },
  tag_streaming: { tn: 'ستريمينغ', en: 'Streaming', fr: 'Streaming' },
  tag_aitools: { tn: 'أدوات الذكاء الاصطناعي', en: 'AI Tools', fr: "Outils IA" },
  tag_accounts: { tn: 'حسابات', en: 'Accounts', fr: 'Comptes' },

  // Contact page — hero
  connect_with_us: { tn: 'تواصل معانا', en: 'Connect With Us', fr: 'Restez connecté' },
  social_media_title_1: { tn: 'السوسيال ميديا ', en: 'OUR SOCIAL ', fr: 'NOS RÉSEAUX ' },
  social_media_title_highlight: { tn: 'متاعنا', en: 'MEDIA', fr: 'SOCIAUX' },
  social_media_sub: {
    tn: 'ابقى تابعنا باش توصلك آخر أخبار المخزون، المسابقات، و الدعم متاع الكوميونيتي.',
    en: 'Stay connected for instant stock updates, giveaways, and community support.',
    fr: 'Restez connecté pour les mises à jour de stock, les concours et le support communautaire.',
  },
  discord_label: { tn: 'DISCORD', en: 'DISCORD', fr: 'DISCORD' },
  instagram_label: { tn: 'INSTAGRAM', en: 'INSTAGRAM', fr: 'INSTAGRAM' },

  // Contact page — status bar
  all_systems_operational: { tn: 'كل شيء يخدم مليح', en: 'All Systems Operational', fr: 'Tous les systèmes opérationnels' },
  avg_response_label: { tn: 'وقت الرد تقريبا:', en: 'Avg. response:', fr: 'Réponse moy. :' },
  satisfaction_label: { tn: 'الرضا:', en: 'Satisfaction:', fr: 'Satisfaction :' },

  // Contact page — tabs
  help_center_tab: { tn: 'مركز المساعدة', en: 'Help Center', fr: "Centre d'aide" },
  contact_us_tab: { tn: 'اتصل بينا', en: 'Contact Us', fr: 'Nous contacter' },
  my_tickets_tab: { tn: 'تذاكري', en: 'My Tickets', fr: 'Mes tickets' },

  // Contact page — help categories
  order_issues_title: { tn: 'مشاكل في الطلب', en: 'Order Issues', fr: 'Problèmes de commande' },
  order_issues_sub: {
    tn: 'تتبع الطلب، تأخير في التوصيل، كود ناقص',
    en: 'Track orders, delivery delays, missing codes',
    fr: 'Suivi de commande, retards, codes manquants',
  },
  order_issues_item1: { tn: 'وين طلبي؟', en: 'Where is my order?', fr: 'Où est ma commande ?' },
  order_issues_item2: { tn: 'ما وصلنيش الكود متاعي', en: "I didn't receive my code", fr: "Je n'ai pas reçu mon code" },
  order_issues_item3: { tn: 'طلبي واحل', en: 'My order is stuck on processing', fr: 'Ma commande est bloquée en traitement' },

  code_problems_title: { tn: 'مشاكل في الكود', en: 'Code Problems', fr: 'Problèmes de code' },
  code_problems_sub: {
    tn: 'كود غالط، مستعمل قبل،',
    en: 'Invalid codes, already redeemed',
    fr: 'Codes invalides, déjà utilisés',
  },
  code_problems_item1: { tn: 'الكود متاعي ما يخدمش', en: "My code doesn't work", fr: 'Mon code ne fonctionne pas' },
  code_problems_item2: { tn: 'الكود يقول مستعمل من قبل', en: 'Code says already redeemed', fr: 'Le code indique déjà utilisé' },
 
  payment_billing_title: { tn: 'الدفع و الفاتورة', en: 'Payment & Billing', fr: 'Paiement & Facturation' },
  payment_billing_sub: {
    tn: 'الدفع ما مشاش، ',
    en: 'Payment failures, ',
    fr: 'Échecs de paiement, ',
  },
  payment_billing_item1: { tn: 'الدفع رفضوه', en: 'Payment was declined', fr: 'Paiement refusé' },

  refunds_returns_title: { tn: 'استرجاع الفلوس', en: 'Refunds & Returns', fr: 'Remboursements & Retours' },
  refunds_returns_sub: {
    tn: 'طلب استرجاع، وين وصل، الشروط',
    en: 'Request a refund, refund status, policy',
    fr: 'Demande de remboursement, statut, politique',
  },
  refunds_returns_item1: { tn: 'كيفاش نطلب استرجاع', en: 'How to request a refund', fr: 'Comment demander un remboursement' },
  refunds_returns_item2: { tn: 'قداش يوخذ الاسترجاع', en: 'Refund processing time', fr: 'Délai de traitement du remboursement' },
  refunds_returns_item3: { tn: 'شنية الشروط باش نسترجع', en: 'Refund eligibility', fr: 'Éligibilité au remboursement' },

  account_security_title: { tn: 'الحساب و الأمان', en: 'Account & Security', fr: 'Compte & Sécurité' },
  account_security_sub: {
    tn: 'ما نجمش ندخل، بدل كلمة السر، التحقق بخطوتين',
    en: 'Login issues, password reset, 2FA',
    fr: 'Problèmes de connexion, réinitialisation, 2FA',
  },
  account_security_item1: { tn: 'ما نجمش ندخل لحسابي', en: "Can't log into my account", fr: 'Impossible de me connecter' },
  account_security_item2: { tn: 'بدل كلمة السر متاعي', en: 'Reset my password', fr: 'Réinitialiser mon mot de passe' },
  account_security_item3: { tn: 'فعّل التحقق بخطوتين', en: 'Enable two-factor auth', fr: "Activer l'authentification à deux facteurs" },

  general_questions_title: { tn: 'أسئلة عامة', en: 'General Questions', fr: 'Questions générales' },
  general_questions_sub: {
    tn: 'الاشتراكات، المناطق، المنصات',
    en: 'Subscriptions, regions, platforms',
    fr: 'Abonnements, régions, plateformes',
  },
  general_questions_item1: { tn: 'كيفاش تخدم الاشتراكات', en: 'How subscriptions work', fr: 'Comment fonctionnent les abonnements' },
  general_questions_item2: { tn: 'أنهي منطقة نختار؟', en: 'Which region should I choose?', fr: 'Quelle région choisir ?' },
  general_questions_item3: { tn: 'أنهي منصات تخدم عندنا', en: 'Supported platforms', fr: 'Plateformes prises en charge' },

  // Contact page — ticket form
  submit_a_ticket_title: { tn: 'ابعث تذكرة', en: 'Submit a Ticket', fr: 'Soumettre un ticket' },
  submit_ticket_sub: {
    tn: 'عمر الفورم تحت و فريق الدعم متاعنا يرد عليك.',
    en: 'Fill out the form below and our support team will get back to you.',
    fr: 'Remplissez le formulaire ci-dessous et notre équipe vous répondra.',
  },
  ticket_submitted_success: { tn: '🎉 التذكرة توصلت، تباعثت بنجاح.', en: '🎉 Ticket submitted successfully.', fr: '🎉 Ticket envoyé avec succès.' },
  reference_label: { tn: 'المرجع:', en: 'Reference:', fr: 'Référence :' },
  track_replies_anytime: { tn: 'تابع الردود وقت ما تحب في', en: 'Track replies anytime in', fr: 'Suivez les réponses à tout moment dans' },
  ticket_error_message: {
    tn: 'صار مشكل و التذكرة ما تسجلتش. عاود جرب.',
    en: 'Something went wrong saving your ticket. Please try again.',
    fr: "Une erreur s'est produite lors de l'enregistrement du ticket. Veuillez réessayer.",
  },
  your_email_label: { tn: 'الإيميل متاعك', en: 'Your Email', fr: 'Votre email' },
  linked_to_account: { tn: 'مربوط بحسابك', en: 'Linked to your account', fr: 'Lié à votre compte' },
  email_field_placeholder: { tn: 'yourname@gmail.com', en: 'yourname@gmail.com', fr: 'votrenom@gmail.com' },
  log_in_link: { tn: 'دخول', en: 'Log in', fr: 'Se connecter' },
  to_track_replies_suffix: {
    tn: 'باش تلقى الردود على هذي التذكرة في بلاصة وحدة.',
    en: 'to track replies to this ticket in one place.',
    fr: 'pour suivre les réponses à ce ticket au même endroit.',
  },
  category_label: { tn: 'كاتيقوري', en: 'Category', fr: 'Catégorie' },
  select_a_category: { tn: 'اختار كاتيقوري ', en: 'Select a category', fr: 'Choisir une catégorie' },
  subject_label: { tn: 'الموضوع', en: 'Subject', fr: 'Sujet' },
  subject_placeholder: { tn: 'وصف قصير', en: 'Brief description', fr: 'Brève description' },
  message_label: { tn: 'الرسالة', en: 'Message', fr: 'Message' },
  message_placeholder: {
    tn: 'قلنا شنوة صار بالتفصيل...',
    en: 'Describe your issue in detail...',
    fr: 'Décrivez votre problème en détail...',
  },
  submitting_label: { tn: 'قاعد يتباعث...', en: 'Submitting...', fr: 'Envoi en cours...' },
  submit_ticket_button: { tn: 'ابعث التذكرة', en: 'Submit Ticket', fr: 'Envoyer le ticket' },

  // Contact page — validation errors
  err_email_required: { tn: 'حط الإيميل متاعك باش نجموا نوصلولك.', en: 'Enter your email so we can reach you.', fr: 'Entrez votre email pour que nous puissions vous contacter.' },
  err_email_invalid: { tn: 'حط إيميل صحيح.', en: 'Enter a valid email address.', fr: 'Entrez une adresse email valide.' },
  err_category_required: { tn: 'لازم تختار كاتيقوري.', en: 'Choose a category.', fr: 'Choisissez une catégorie.' },
  err_subject_required: { tn: 'حط عنوان قصير للتذكرة.', en: 'Give your ticket a short subject.', fr: 'Donnez un sujet court à votre ticket.' },
  err_subject_short: { tn: 'لازم العنوان يكون 4 حروف و أكثر.', en: 'Subject should be at least 4 characters.', fr: 'Le sujet doit contenir au moins 4 caractères.' },
  err_message_required: { tn: 'قلنا شنوة صار.', en: 'Describe your issue.', fr: 'Décrivez votre problème.' },
  err_message_short: { tn: 'زيد شوية تفاصيل (10 حروف و أكثر).', en: 'Add a few more details (10+ characters).', fr: 'Ajoutez plus de détails (10 caractères min.).' },
  err_message_long: { tn: 'حاول ما تزيدش على', en: 'Keep it under', fr: 'Limitez à' },
  err_message_long_suffix: { tn: 'حرف.', en: 'characters.', fr: 'caractères.' },

  // Contact page — other ways to reach us
  other_ways_title: { tn: 'طرق أخرى باش توصل لينا', en: 'Other Ways to Reach Us', fr: 'Autres moyens de nous contacter' },
  contact_method_email: { tn: 'إيميل', en: 'Email', fr: 'Email' },
  contact_method_live_chat: { tn: 'شات مباشر', en: 'Live Chat', fr: 'Chat en direct' },
  contact_method_response_time: { tn: 'وقت الرد', en: 'Response Time', fr: 'Délai de réponse' },
  contact_value_available: { tn: 'موجود لكل الزبائن', en: 'Available for all customers', fr: 'Disponible pour tous les clients' },
  contact_value_under_2h: { tn: 'أقل من ساعتين تقريبا', en: 'Under 2 hours on average', fr: 'Moins de 2 heures en moyenne' },

  // Contact page — floating chat widget
  chat_with_us_button: { tn: 'أحكي معانا معانا', en: 'CHAT WITH US', fr: 'DISCUTER AVEC NOUS' },
  live_support_label: { tn: 'دعم مباشر', en: 'Live Support', fr: 'Support en direct' },
  live_support_desc: {
    tn: 'محتاج مساعدة توا؟ ابعث تذكرة بالفورم ولا تواصل معانا مباشرة في Discord باش يجيك رد فوري.',
    en: 'Need quick help? Submit a ticket using the form or reach out directly on Discord for an instant reply.',
    fr: "Besoin d'aide rapide ? Soumettez un ticket via le formulaire ou contactez-nous directement sur Discord pour une réponse instantanée.",
  },
  open_support_ticket_button: { tn: 'افتح تذكرة دعم', en: 'Open Support Ticket', fr: 'Ouvrir un ticket de support' },

  // My Orders page
  order_status_pending: { tn: 'قاعدة تستنى', en: 'Pending', fr: 'En attente' },
  order_status_processing: { tn: 'قاعدين نحضروها', en: 'Processing', fr: 'En traitement' },
  order_status_delivered: { tn: 'وصلت', en: 'Delivered', fr: 'Livré' },
  order_cancelled_msg: { tn: '✕ هذا الطلب تلغى', en: '✕ This order was cancelled', fr: '✕ Cette commande a été annulée' },
  need_login_orders: {
    tn: 'لازم تدخل لحسابك باش تشوف طلباتك.',
    en: 'You need to be logged in to view your orders.',
    fr: 'Vous devez être connecté pour voir vos commandes.',
  },
  my_orders_title: { tn: 'طلباتي', en: 'My Orders', fr: 'Mes commandes' },
  my_orders_subtitle: {
    tn: 'تابع وين وصل كل شيء اشريته.',
    en: "Track the progress of everything you've bought.",
    fr: 'Suivez la progression de tous vos achats.',
  },
  browse_shop_button: { tn: '+ شوف الشوب', en: '+ Browse Shop', fr: '+ Parcourir la boutique' },
  no_orders_yet: { tn: 'ماكانش طلبات توا', en: 'No orders yet', fr: 'Aucune commande pour le moment' },
  no_orders_desc_pre: { tn: 'شوف في', en: 'Browse the', fr: 'Parcourez la' },
  shop_link_label: { tn: 'الشوب', en: 'shop', fr: 'boutique' },
  no_orders_desc_suffix: {
    tn: 'و مشترياتك يبانو هوني.',
    en: 'and your purchases will show up here.',
    fr: 'et vos achats apparaîtront ici.',
  },
  message_us_about_order: { tn: 'ابعثلنا رسالة على هذا الطلب', en: 'Message us about this order', fr: 'Envoyez-nous un message à propos de cette commande' },
  hide_label: { tn: 'خبي', en: 'Hide', fr: 'Masquer' },
  no_messages_yet_desc: {
    tn: 'ماكانش رسائل توا. محتاج تعطينا الإيميل متاع حسابك لاشتراك، ولا عندك سؤال؟ ابعثه تحت.',
    en: 'No messages yet. Need to share your account email for a subscription, or ask something? Send it below.',
    fr: "Aucun message pour l'instant. Besoin de partager votre email de compte pour un abonnement, ou une question ? Envoyez-la ci-dessous.",
  },
  you_label: { tn: 'انتي/انت', en: 'You', fr: 'Vous' },
  support_label: { tn: 'الدعم', en: 'Support', fr: 'Support' },
  message_input_placeholder: {
    tn: 'اكتب رسالة… (مثلا: الإيميل متاع حسابك لهذا الاشتراك)',
    en: 'Type a message… (e.g. your account email for this subscription)',
    fr: 'Écrivez un message… (ex. votre email de compte pour cet abonnement)',
  },
  send_button: { tn: 'ابعث', en: 'Send', fr: 'Envoyer' },

  // Referral page
  referral_badge: { tn: 'جيب أصحابك و اربح', en: 'Affiliate & Referral Hub', fr: "Espace Parrainage & Affiliation" },
  referral_hero_title_1: { tn: 'جيب أصحابك، اربح ', en: 'Invite Friends, Earn ', fr: 'Invitez vos amis, gagnez du ' },
  referral_hero_title_highlight: { tn: 'رصيد في الشوب', en: 'Store Credit', fr: 'Crédit Boutique' },
  referral_hero_sub: {
    tn: "شارك الكود ولا اللينك متاعك مع أصحابك باش تربح رصيد  .",
    en: "Share your unique referral code or link with friends to earn balance for Mario's Shop.",
    fr: "Partagez votre code ou lien de parrainage unique avec vos amis pour gagner du solde sur Mario's Shop.",
  },
  referral_total_referrals: { tn: 'قداش جبت', en: 'Total Referrals', fr: 'Total des parrainages' },
  referral_total_earnings: { tn: 'قداش ربحت', en: 'Total Earnings', fr: 'Gains totaux' },
  referral_your_code: { tn: 'الكود متاعك', en: 'Your Code', fr: 'Votre code' },
  referral_link_title: { tn: 'لينك الإحالة متاعك', en: 'Your Referral Link', fr: 'Votre lien de parrainage' },
  copy_link: { tn: 'انسخ اللينك', en: 'Copy Link', fr: 'Copier le lien' },
  copied: { tn: 'تنسخ!', en: 'Copied!', fr: 'Copié !' },
  rewards_rules_title: { tn: 'المكافآت و القوانين', en: 'Rewards & Rules', fr: 'Récompenses & Règles' },
  what_you_earn: { tn: 'شنوة تربح', en: 'What You Earn', fr: 'Ce que vous gagnez' },
  earn1_bold: { tn: '2 دينار رصيد في الشوب', en: '2 DT store credit', fr: '2 DT de crédit boutique' },
  earn1_text: {
    tn: ' كي صاحبك يشري أول مرة (طلب 10 دينار و أكثر)',
    en: ' when your friend makes their first purchase (min 10 DT order)',
    fr: " lorsque votre ami effectue son premier achat (commande min. de 10 DT)",
  },
  earn2_pre: { tn: 'صاحبك ياخذ ', en: 'Your friend gets ', fr: 'Votre ami reçoit ' },
  earn2_bold: { tn: '1 دينار رصيد ترحيبي', en: '1 DT welcome credit', fr: '1 DT de crédit de bienvenue' },
  earn2_text: { tn: ' كي يسجل', en: ' on signup', fr: " à l'inscription" },
  earn3: {
    tn: 'الرصيد تنجم تستعملو في الدفع على أي منتج',
    en: 'Store credit can be used at checkout on any product',
    fr: 'Le crédit boutique peut être utilisé au paiement sur tout produit',
  },
  rules_title: { tn: 'القوانين', en: 'Rules', fr: 'Règles' },
  rule1: {
    tn: 'لازم صاحبك يشري في ظرف 30 يوم من ما يسجل',
    en: 'Friend must purchase within 30 days of signing up',
    fr: "L'ami doit acheter dans les 30 jours suivant son inscription",
  },
  rule2: {
    tn: 'الربح في الشهر ما يفوتش 30 دينار لكل واحد',
    en: 'Monthly earnings capped at 30 DT per referrer',
    fr: 'Gains mensuels plafonnés à 30 DT par parrain',
  },
  rule3: {
    tn: 'ما تجيبش روحك و ما تعملش حسابات مزوّرة',
    en: 'Self-referrals and duplicate accounts are not allowed',
    fr: 'Auto-parrainage et comptes en double interdits',
  },
  rule4: {
    tn: 'إحالة وحدة برك لكل جهاز/IP',
    en: 'One referral per device/IP address',
    fr: 'Un seul parrainage par appareil/adresse IP',
  },
  step_label: { tn: 'خطوة', en: 'STEP', fr: 'ÉTAPE' },
  share_code_title: { tn: 'شارك الكود', en: 'Share Code', fr: 'Partagez le code' },
  share_code_desc: {
    tn: 'انسخ اللينك ولا الكود متاعك فوق و شاركه مع أصحابك.',
    en: 'Copy your referral link or code above and share it with your friends.',
    fr: 'Copiez votre lien ou code de parrainage ci-dessus et partagez-le avec vos amis.',
  },
  friend_signup_title: { tn: 'صاحبك يسجل', en: 'Friend Signs Up', fr: "Votre ami s'inscrit" },
  friend_signup_desc: {
    tn: 'صاحبك يسجل و ياخذ بونص 1 دينار يتزاد دغري في حسابه.',
    en: 'Your friend registers and gets a 1 DT bonus added instantly to their account.',
    fr: 'Votre ami s\'inscrit et reçoit instantanément un bonus de 1 DT sur son compte.',
  },
  get_credit_title: { tn: 'احصل على رصيد في الشوب', en: 'Get Store Credit', fr: 'Recevez du crédit boutique' },
  get_credit_desc: {
    tn: 'تربح 2 دينار رصيد أوتوماتيك كي يكمل أول طلب بـ10 دينار و أكثر.',
    en: 'Earn 2 DT credit automatically when they complete their first order of 10 DT or more.',
    fr: 'Recevez automatiquement 2 DT de crédit lorsqu\'ils passent leur première commande de 10 DT ou plus.',
  },

  // Homepage CTAs
  browse_catalog: { tn: 'شوف الكتالوغ', en: 'Browse Catalog', fr: 'Voir le catalogue' },
  join_discord: { tn: 'دخل الديسكورد متاعنا', en: 'Join Discord Community', fr: 'Rejoindre Discord' },

  // Trust stats
  stat_happy_customers: { tn: 'كليون راضي', en: 'Happy Customers', fr: 'Clients satisfaits' },
  stat_products_active: { tn: 'منتوج موجود', en: 'Products Active', fr: 'Produits actifs' },
  stat_avg_rating: { tn: 'التقييم متاعنا', en: 'Average Rating', fr: 'Note moyenne' },
  stat_all_services: { tn: 'في كل الخدمات', en: 'all services', fr: 'tous les services' },

  // Reviews section
  reviews_label: { tn: 'آراء كليونات', en: 'Customer Reviews', fr: 'Avis clients' },
  reviews_title: {
    tn: "آراء ناس شراو  ",
    en: "Reviews from people who bought     ",
    fr: "Avis des clients    ",
  },
  reviews_subtitle: {
    tn: 'آراء حقيقية من آخر الطلبات.',
    en: 'Real feedback from the latest orders.',
    fr: 'Avis authentiques des dernières commandes.',
  },
  add_review: { tn: 'زيد رأيك', en: 'Add a Review', fr: 'Ajouter un avis' },

  // How it works
  how_to_order: { tn: 'كيفاش تطلب', en: 'HOW TO ORDER', fr: 'COMMENT COMMANDER' },
  how_to_order_sub: {
    tn: 'باش توصلك الكودات الديجيتال متاعك، خذلك برك 3 كليكات.',
    en: 'Getting your digital asset keys onto your screen takes three easy clicks.',
    fr: 'Recevez vos clés numériques en seulement trois clics.',
  },

  // Payment methods
  payment_methods: { tn: 'طرق الدفع', en: 'Payment Methods', fr: 'Moyens de paiement' },
  payment_methods_sub: {
    tn: 'نخدمو مع أحسن منصات الدفع التونسية و آمنة، بتحقق فوري.',
    en: 'We support top secure Tunisian payment platforms with instant verification processing.',
    fr: 'Nous prenons en charge les principales plateformes de paiement tunisiennes sécurisées, avec vérification instantanée.',
  },

  // How it works steps
  step1_title: { tn: 'بقشيش', en: 'B9CHICH', fr: 'B9CHICH' },
  step1_desc: {
    tn: 'اتصل بينا باش نزيدولك بقشيش في حسابك، وباش تنجم تكمل الشراء.',
    en: 'Contact us so we can top up your account balance (B9CHICH), so you can check out.',
    fr: "Contactez-nous pour créditer votre compte en B9CHICH afin de pouvoir payer.",
  },
  step2_title: { tn: 'اشري لي تحب', en: 'Shop what you like', fr: 'Achetez ce que vous aimez' },
  step2_desc: {
    tn: 'اختار المنتج و اعمل عليه طلب',
    en: 'Select a product and place your order for it.',
    fr: 'Sélectionnez un produit et passez votre commande.',
  },
  step3_title: {
    tn: 'كان عجبك السرفيس ما تنساش تخلي رايكا',
    en: "Loved it? Don't forget to leave us a review",
    fr: "Vous avez aimé ? N'oubliez pas de laisser un avis",
  },
  step3_desc: {
    tn: 'كي يوصلك المنتوج ما تنساش تخلينا ريفيو، بالباهي ولا بالخايب.',
    en: 'Once your order arrives, leave us a review — good or bad, we want to hear it.',
    fr: 'Une fois votre commande reçue, laissez-nous un avis — bon ou mauvais, on veut le savoir.',
  },

  // Payment method cards
  payment1_title: { tn: 'D17 App', en: 'D17 App', fr: 'Application D17' },
  payment1_desc: {
    tn: 'تحويل فوري عبر حسابك في لابوست تونسية. بلا مصاريف مخبية.',
    en: 'Instant mobile transfers using your La Poste Tunisienne account. Zero hidden fees.',
    fr: 'Transferts mobiles instantanés via votre compte La Poste Tunisienne. Aucuns frais cachés.',
  },
  payment2_title: { tn: 'Ooredoo', en: 'Ooredoo', fr: 'Ooredoo' },
  payment2_desc: {
    tn: 'اشحن و كمل الشراء بسهولة بأكواد رصيد M-Mobicash.',
    en: 'Top up and complete checkout transactions seamlessly via M-Mobicash balance codes.',
    fr: 'Rechargez et finalisez vos achats facilement via les codes de solde M-Mobicash.',
  },
  payment3_title: { tn: 'لابوست تونسية', en: 'Poste Tunisie', fr: 'Poste Tunisienne' },
  payment3_desc: {
    tn: 'دفع مباشر ببطاقة e-Dinar، قسائم سريعة، ولا حوالات بريدية.',
    en: 'Direct payments utilizing e-Dinar smart cards, rapid vouchers, or postal mandates.',
    fr: "Paiements directs via carte e-Dinar, bons rapides ou mandats postaux.",
  },

  // Review modal
  write_review: { tn: 'اكتب رأيك', en: 'Write a Customer Review', fr: 'Rédiger un avis' },
  your_name: { tn: 'اسمك', en: 'Your Name', fr: 'Votre nom' },
  item_purchased: { tn: 'المنتوج لي شريت', en: 'Item Purchased', fr: 'Article acheté' },
  rating: { tn: 'التقييم', en: 'Rating', fr: 'Note' },
  comment: { tn: 'التعليق', en: 'Comment', fr: 'Commentaire' },
  comment_placeholder: {
    tn: "قلنا شنوة كانت التجربة متاعك مع ",
    en: "Share your experience ",
    fr: "Partagez votre expérience .",
  },
  cancel: { tn: 'إلغاء', en: 'Cancel', fr: 'Annuler' },
  submit_review: { tn: 'ابعث الرأي', en: 'Submit Review', fr: "Envoyer l'avis" },

  // FAQ section
  faq_badge: { tn: 'عندك سؤال؟', en: 'Got Questions?', fr: 'Des questions ?' },
  faq_title_1: { tn: 'أكثر أسئلة ', en: 'MOST ASKED ', fr: 'QUESTIONS LES PLUS ' },
  faq_title_highlight: { tn: 'متعاودة', en: 'QUESTIONS', fr: 'FRÉQUENTES' },
  faq_subtitle: {
    tn: 'كل شيء لازمك تعرفه على الشراء، شحن الرصيد، و التوصيل الفوري.',
    en: 'Everything you need to know about purchasing, balance top-ups, and Instant Delivery.',
    fr: "Tout ce qu'il faut savoir sur les achats, la recharge du solde et la livraison instantanée.",
  },

  cat_faq_all: { tn: 'الكل', en: 'ALL', fr: 'TOUT' },
  cat_faq_orders: { tn: 'الطلبات', en: 'ORDERS', fr: 'COMMANDES' },
  cat_faq_balance: { tn: 'الرصيد', en: 'BALANCE', fr: 'SOLDE' },
  cat_faq_refund: { tn: 'الاسترجاع', en: 'REFUND', fr: 'REMBOURSEMENT' },
  cat_faq_security: { tn: 'الأمان', en: 'SECURITY', fr: 'SÉCURITÉ' },

  faq_q1: { tn: 'قدّاش يقعد باش يوصلني المنتوج متاعي؟', en: 'How long does it take for my order to be delivered?', fr: 'Combien de temps prend la livraison de ma commande ?' },
  faq_a1: {
    tn: 'عادةً الطلب يوصل في ظرف 2 لـ 3 ساعات، حسب المنتوج والخدمة. وإذا صار أي تأخير، نعلموك عليه في  شات طلبك. وتنجم ديما تشوف حالة طلبك: قاعد يتعالج، قاعد يتجهّز، ولا تكمّل وتسلّم.',
    en: 'Usually between 2 and 3 hours. It depends on the service, and if there’s any delay, we’ll let you know through the Order Chat. You can also check your order status at any time: Open → Processing → Delivered.',
    fr: 'Généralement entre 2 et 3 heures. Cela dépend du service, et en cas de retard, nous vous préviendrons via le chat de commande. Vous pouvez suivre le statut à tout moment : Ouvert → En traitement → Livré.',
  },
  faq_q2: { tn: 'كيفاش نشري بقشيش ؟', en: 'How do I add funds to my account?', fr: 'Comment ajouter du solde à mon compte ?' },
  faq_a2: {
    tn: 'باش تشري بقشيش، كلّم أدمين بالطريقة اللي تناسبك : على ديسكورد  حل تيكا في السيرفر ،  ولاعلى أنستقرام ، ولا من سيبورت متاع الموقع.',
    en: 'You can contact the Admin through whichever method is easiest for you: a Discord Ticket on our server, the website Support, or Instagram chat.',
    fr: "Vous pouvez contacter l'administrateur par le moyen qui vous convient le mieux : un ticket Discord sur notre serveur, le support du site, ou le chat Instagram.",
  },
  faq_q3: { tn: 'إذا صار Refund، شنوة نعمل؟', en: 'What should I do if I need a refund?', fr: "Que faire si j'ai besoin d'un remboursement ?" },
  faq_a3: {
    tn: 'أفتح تيكا مع سيبورت من صفحة كونتاكت، وفسّرنا شنوة صار. وبقدرة ربي، يا إمّا نرجّعولك المنتوج مرّة أخرى، يا إمّا نرجّعولك فلوسك حسب الحالة.',
    en: "Open a Support Ticket from the Contact page and explain the problem. Depending on the situation, we'll either send the product again or refund your money.",
    fr: "Ouvrez un ticket de support depuis la page Contact et expliquez le problème. Selon la situation, nous renverrons le produit ou vous rembourserons.",
  },
  faq_q4: { tn: 'إذا صار مشكل في الموقع وسبّبلي خسارة في البقشيش، شنوة نعمل؟', en: 'What if something goes wrong with the website and I lose funds because of it?', fr: "Que se passe-t-il si un problème sur le site me fait perdre de l'argent ?" },
  faq_a4: {
    tn: 'ما تقلقش، كل العمليات متسجّلة في داشبورد متاعنا. نجموا نشوفوا حساب كل حريف، والطلبات متاعو، و أي حاجة شراها ، وحتى عمليات إضافة البقشيش. إذا صار أي مشكل، كلّم سيبورت ونراجعوا العملية ونشوفوا شنوة صار.',
    en: 'We have a dedicated support team that is available 24/7 to assist you with any issues you may encounter. If you experience any problems with the website or lose funds due to technical issues, please contact our support team immediately. We will investigate the issue and work to resolve it as quickly as possible, ensuring that your funds are restored to your account.',
    fr: "Nous avons une équipe de support dédiée disponible 24h/24 et 7j/7 pour vous aider. Si vous rencontrez un problème sur le site ou perdez des fonds à cause d'un problème technique, contactez immédiatement notre équipe de support. Nous enquêterons et travaillerons à résoudre le problème au plus vite, en veillant à ce que vos fonds soient restitués sur votre compte.",
  },

  faq_support_title: { tn: 'ما لقيتش الإجابة لي تحبها؟', en: "Didn't find the answer you needed?", fr: "Vous n'avez pas trouvé la réponse ?" },
  faq_support_sub: { tn: 'تواصل مع فريق الدعم متاعنا الموجود 24/7 مباشرة.', en: 'Contact our 24/7 support team directly.', fr: 'Contactez directement notre équipe de support 24/7.' },
  contact_support_button: { tn: 'اتصل بالدعم', en: 'Contact Support', fr: 'Contacter le support' },

  // Login page
  welcome_back: { tn: 'مرحبا بيك', en: 'Welcome Back', fr: 'Content de vous revoir' },
  login_title_1: { tn: 'دخول لـ', en: 'Log In to ', fr: 'Connexion à ' },
  login_title_highlight: { tn: 'حسابك', en: 'Your Account', fr: 'votre compte' },
  login_subtitle: {
    tn: 'شوف رصيدك، طلباتك، و تذاكر الدعم متاعك.',
    en: 'Access your balance, orders, and support tickets.',
    fr: 'Accédez à votre solde, vos commandes et vos tickets de support.',
  },
  err_login_required: { tn: 'حط الإيميل و كلمة السر متاعك.', en: 'Please enter your email and password.', fr: 'Veuillez entrer votre email et mot de passe.' },
  err_login_invalid: { tn: 'الإيميل ولا كلمة السر غالطين.', en: 'Invalid email or password.', fr: 'Email ou mot de passe invalide.' },
  email_label: { tn: 'الإيميل', en: 'Email', fr: 'Email' },
  password_label: { tn: 'كلمة السر', en: 'Password', fr: 'Mot de passe' },
  show_password: { tn: 'وري', en: 'Show', fr: 'Afficher' },
  hide_password: { tn: 'خبي', en: 'Hide', fr: 'Masquer' },
  logging_in: { tn: 'قاعد يدخل...', en: 'Logging in…', fr: 'Connexion...' },
  no_account_yet: { tn: 'ماعندكش حساب؟', en: "Don't have an account?", fr: "Vous n'avez pas de compte ?" },
  sign_up_link: { tn: 'سجل', en: 'Sign up', fr: "S'inscrire" },

  // Register page
  create_account_title: { tn: 'اعمل حساب', en: 'Create Account', fr: 'Créer un compte' },
  create_account_subtitle: {
    tn: "سجل مرة وحدة باش تنجم تدخل لـ Mario's Shop وقتلي تحب.",
    en: "Register once to access Mario's Shop anytime.",
    fr: "Inscrivez-vous une fois pour accéder à Mario's Shop à tout moment.",
  },
  referral_join_msg: { tn: '🎉 داخل عبر دعوة إحالة.', en: "🎉 You're joining through a referral invitation.", fr: '🎉 Vous rejoignez via une invitation de parrainage.' },
  email_address_label: { tn: 'الإيميل', en: 'Email Address', fr: 'Adresse email' },
  username_label: { tn: 'اسم المستخدم', en: 'Username', fr: "Nom d'utilisateur" },
  username_placeholder: { tn: 'اسم المستخدم متاعك', en: 'Your username', fr: "Votre nom d'utilisateur" },
  country_label: { tn: 'البلاد', en: 'Country', fr: 'Pays' },
  select_country_placeholder: { tn: 'اختار بلادك', en: 'Select your country', fr: 'Sélectionnez votre pays' },
  region_label: { tn: 'الجهة', en: 'Region', fr: 'Région' },
  select_region_placeholder: { tn: 'اختار جهتك', en: 'Select your region', fr: 'Sélectionnez votre région' },
  register_button: { tn: 'سجل و كمل', en: 'Register & Continue', fr: 'Créer le compte' },
  err_register_fields: { tn: 'عمر كل الخانات.', en: 'Please fill in all fields.', fr: 'Veuillez remplir tous les champs.' },
  err_register_region: { tn: 'اختار جهتك.', en: 'Please select your region.', fr: 'Veuillez sélectionner votre région.' },
  err_register_exists: { tn: 'كاين حساب بهذا الإيميل! دخل بيه.', en: 'An account with this email already exists! Please Log In.', fr: 'Un compte avec cet email existe déjà ! Veuillez vous connecter.' },
  forgot_password_link: { tn: 'نسيت كلمة السر؟', en: 'Forgot password?', fr: 'Mot de passe oublié ?' },

  // Account dashboard — AccountTabs (shared across all /account pages)
  acct_tab_profile: { tn: 'الملف', en: 'Profile', fr: 'Profil' },
  acct_tab_billing: { tn: 'الفوترة', en: 'Billing', fr: 'Facturation' },
  acct_tab_orders: { tn: 'طلباتي', en: 'Orders', fr: 'Commandes' },
  acct_tab_security: { tn: 'الأمان', en: 'Security', fr: 'Sécurité' },
  acct_tab_notifications: { tn: 'الإشعارات', en: 'Notifications', fr: 'Notifications' },
  acct_tab_logout: { tn: 'خروج', en: 'Logout', fr: 'Déconnexion' },

  // Account dashboard — Profile page
  acct_status_title: { tn: 'حالة الحساب', en: 'Account Status', fr: 'État du compte' },
  acct_status_all_good: { tn: 'كلشي باهي', en: 'All Good', fr: 'Tout va bien' },
  acct_total_orders: { tn: 'مجموع الطلبات', en: 'Total Orders', fr: 'Total des commandes' },
  acct_view_orders: { tn: 'شوف سجل الطلبات ←', en: 'View Order History →', fr: "Voir l'historique →" },
  acct_balance_label: { tn: 'الرصيد', en: 'Balance', fr: 'Solde' },
  acct_add: { tn: 'زيد', en: 'Add', fr: 'Ajouter' },
  acct_picture_title: { tn: 'صورة الملف الشخصي', en: 'Profile Picture', fr: 'Photo de profil' },
  acct_picture_desc: { tn: 'حط صورة باش يبان بروفايلك أحسن.', en: 'Upload a photo for a better result.', fr: 'Ajoutez une photo pour un meilleur résultat.' },
  acct_choose_file: { tn: 'اختار صورة', en: 'Choose File', fr: 'Choisir un fichier' },
  acct_change_image: { tn: 'بدل الصورة', en: 'Change Image', fr: "Changer l'image" },
  acct_details_title: { tn: 'تفاصيل الحساب', en: 'Account Details', fr: 'Détails du compte' },
  acct_login_method: { tn: 'طريقة الدخول', en: 'Login Method', fr: 'Méthode de connexion' },
  acct_full_name: { tn: 'الاسم الكامل', en: 'Full Name', fr: 'Nom complet' },
  acct_phone: { tn: 'رقم الهاتف', en: 'Phone Number', fr: 'Numéro de téléphone' },
  acct_save_changes: { tn: 'احفظ التغييرات', en: 'Save Changes', fr: 'Enregistrer' },
  acct_saving: { tn: 'قاعد يحفظ...', en: 'Saving…', fr: 'Enregistrement...' },
  acct_profile_updated: { tn: 'تحدث الملف الشخصي.', en: 'Profile updated.', fr: 'Profil mis à jour.' },

  // Account dashboard — Billing page
  acct_current_balance: { tn: 'الرصيد الحالي', en: 'Current Balance', fr: 'Solde actuel' },
  acct_add_balance_title: { tn: 'زيد رصيد', en: 'Add Balance', fr: 'Ajouter du solde' },
  acct_add_balance_desc: {
    tn: 'اختار قيمة، بعدها ابعث طلب — فريق الدعم يهضرلك باش يرتبو الخلاص.',
    en: 'Choose an amount, then send a request — support will chat with you to arrange payment.',
    fr: 'Choisissez un montant, puis envoyez une demande — le support vous contactera pour organiser le paiement.',
  },
  acct_custom_amount: { tn: 'قيمة أخرى', en: 'Custom Amount', fr: 'Montant personnalisé' },
  acct_request: { tn: 'اطلب', en: 'Request', fr: 'Demander' },
  acct_open_request_note: {
    tn: 'طلب الشحن متاعك مفتوح. هضر مع الدعم تحت باش ترتبو الخلاص — الرصيد يتحدث أوتوماتيكيا كي يتوافق عليه.',
    en: "Your top-up request is open. Chat with support below to arrange payment — your balance updates automatically once it's approved.",
    fr: 'Votre demande de recharge est ouverte. Discutez avec le support ci-dessous pour organiser le paiement — votre solde se met à jour automatiquement une fois approuvé.',
  },
  acct_past_requests: { tn: 'الطلبات القديمة', en: 'Past Requests', fr: 'Demandes précédentes' },
  acct_back_to_requests: { tn: '← رجوع للطلبات القديمة', en: '← Back to past requests', fr: '← Retour aux demandes précédentes' },

  // Account dashboard — Notifications page
  acct_browser_notif_title: { tn: 'إشعارات المتصفح', en: 'Browser Notifications', fr: 'Notifications du navigateur' },
  acct_browser_notif_desc: {
    tn: 'خذ تنبيه على المكتب أول ما تتبدل حالة طلبك.',
    en: 'Get a desktop alert the moment your order status changes.',
    fr: 'Recevez une alerte dès que le statut de votre commande change.',
  },
  acct_notif_enabled: { tn: 'الإشعارات مفعّلة', en: 'Notifications enabled', fr: 'Notifications activées' },
  acct_enable_browser_notif: { tn: 'فعّل إشعارات المتصفح', en: 'Enable Browser Notifications', fr: 'Activer les notifications' },
  acct_notif_blocked: {
    tn: 'الإشعارات محظورة. فعّلهم من إعدادات المتصفح متاعك.',
    en: "Notifications are blocked. Enable them in your browser's site settings.",
    fr: "Les notifications sont bloquées. Activez-les dans les paramètres de votre navigateur.",
  },
  acct_notif_unsupported: { tn: 'المتصفح متاعك ما يدعمش الإشعارات.', en: "Your browser doesn't support notifications.", fr: 'Votre navigateur ne prend pas en charge les notifications.' },
  acct_recent_notif_title: { tn: 'آخر الإشعارات', en: 'Recent Notifications', fr: 'Notifications récentes' },
  acct_recent_notif_desc: { tn: 'تحديثات مبعوثة ليك من الشوب.', en: 'Updates sent to you from the shop.', fr: 'Mises à jour envoyées par la boutique.' },
  acct_notif_prefs_title: { tn: 'شنوة تحب تتنبه بيه', en: "What you'll be notified about", fr: 'Ce qui vous sera notifié' },
  acct_pref_orders: { tn: 'تحديثات الطلبات', en: 'Order Updates', fr: 'Mises à jour des commandes' },
  acct_pref_orders_desc: { tn: 'تبديلات حالة طلباتك و تذاكرك.', en: 'Status changes on your orders and tickets.', fr: 'Changements de statut sur vos commandes et tickets.' },
  acct_pref_promos: { tn: 'العروض', en: 'Promotions', fr: 'Promotions' },
  acct_pref_promos_desc: { tn: 'تخفيضات و منتجات جديدة.', en: 'Deals, discounts, and new product drops.', fr: 'Offres, réductions et nouveaux produits.' },
  acct_pref_new_products: { tn: 'منتجات جداد', en: 'New Products', fr: 'Nouveaux produits' },
  acct_pref_new_products_desc: { tn: 'كي نزيدو حاجة جديدة للموقع.', en: 'When we add new products to the shop.', fr: 'Quand nous ajoutons de nouveaux produits.' },
  acct_pref_security: { tn: 'تنبيهات الأمان', en: 'Security Alerts', fr: 'Alertes de sécurité' },
  acct_pref_security_desc: { tn: 'تبديل كلمة السر و دخول جديد.', en: 'Password changes and new sign-ins.', fr: 'Changements de mot de passe et nouvelles connexions.' },
  done_label: { tn: 'تم', en: 'Done', fr: 'Terminé' },

  // Account dashboard — Security page
  acct_security_title: { tn: 'أمان الحساب', en: 'Account Security', fr: 'Sécurité du compte' },
  acct_recovery_title: { tn: 'معلومات الاسترجاع', en: 'Recovery Info', fr: 'Informations de récupération' },
  acct_recovery_desc: {
    tn: 'زيد إيميل جيميل ولا رقم هاتف كي تحتاج تسترجع حسابك.',
    en: 'Add a Gmail address or phone number in case you ever need to recover your account.',
    fr: 'Ajoutez une adresse Gmail ou un numéro de téléphone au cas où vous auriez besoin de récupérer votre compte.',
  },
  acct_recovery_gmail: { tn: 'جيميل الاسترجاع', en: 'Recovery Gmail', fr: 'Gmail de récupération' },
  acct_save_info: { tn: 'احفظ المعلومات', en: 'Save Info', fr: 'Enregistrer' },
  acct_change_password_title: { tn: 'بدل كلمة السر', en: 'Change Password', fr: 'Changer le mot de passe' },
  acct_change_password_desc: {
    tn: 'تحتاج كلمة السر الحالية باش تحط وحدة جديدة.',
    en: "You'll need your current password to set a new one.",
    fr: 'Vous aurez besoin de votre mot de passe actuel pour en définir un nouveau.',
  },
  acct_current_password: { tn: 'كلمة السر الحالية', en: 'Current Password', fr: 'Mot de passe actuel' },
  acct_new_password: { tn: 'كلمة السر الجديدة', en: 'New Password', fr: 'Nouveau mot de passe' },
  acct_confirm_password: { tn: 'أكد كلمة السر الجديدة', en: 'Confirm New Password', fr: 'Confirmer le nouveau mot de passe' },
  acct_update_password: { tn: 'حدث كلمة السر', en: 'Update Password', fr: 'Mettre à jour' },
  acct_forgot_current: { tn: 'نسيت كلمة السر الحالية؟', en: 'Forgot your current password?', fr: 'Mot de passe actuel oublié ?' },
  acct_reset_via_email: { tn: 'بدلها بالإيميل', en: 'Reset it via email', fr: "Réinitialiser par email" },

  // Notification permission popup
  notif_popup_title: {
    tn: 'تحب نعلموك كي تجيك حاجة جديدة؟',
    en: "Want us to let you know when there's news?",
    fr: 'Voulez-vous être informé des nouveautés ?',
  },
  notif_popup_desc: {
    tn: 'فعّل الإشعارات باش نلحقوك أول ما يصرا حاجة جديدة في حسابك.',
    en: 'Turn on notifications so we can reach you the moment something new happens with your account.',
    fr: 'Activez les notifications pour être averti dès que quelque chose de nouveau se passe sur votre compte.',
  },
  notif_popup_later: { tn: 'يمكن بعد', en: 'Maybe Later', fr: 'Plus tard' },
  notif_popup_enable: { tn: 'فعّل', en: 'Enable', fr: 'Activer' },
};