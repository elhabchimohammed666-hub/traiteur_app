const mongoose = require('mongoose');
const dotenv = require('dotenv');
const env = require('../config/env');
const User = require('../models/User');
const Dish = require('../models/Dish');
const Package = require('../models/Package');
const Service = require('../models/Service');
const Equipment = require('../models/Equipment');
const StockMovement = require('../models/StockMovement');
const Booking = require('../models/Booking');
const Setting = require('../models/Setting');
const Gallery = require('../models/Gallery');
const Testimonial = require('../models/Testimonial');
const Counter = require('../models/Counter');

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connexion à MongoDB...');
    await mongoose.connect(env.MONGO_URI);
    console.log('[Seed] Connecté. Nettoyage des anciennes données...');

    await Promise.all([
      User.deleteMany({}),
      Dish.deleteMany({}),
      Package.deleteMany({}),
      Service.deleteMany({}),
      Equipment.deleteMany({}),
      StockMovement.deleteMany({}),
      Booking.deleteMany({}),
      Setting.deleteMany({}),
      Gallery.deleteMany({}),
      Testimonial.deleteMany({}),
      Counter.deleteMany({})
    ]);

    // 1. Settings
    console.log('[Seed] Création des paramètres globaux...');
    const setting = await Setting.create({
      businessName: 'Elhabchi Traiteur',
      phone: '+212 705 782 737',
      email: 'contact@elhabchitraiteur.ma',
      address: 'Angle Bd d’Anfa et Rue Moulay Youssef, Casablanca, Maroc',
      whatsappNumber: '212705782737',
      currency: 'MAD',
      minNoticeDays: 7,
      depositPercent: 30,
      taxRate: 0,
      setupDaysBefore: 1,
      returnDaysAfter: 1,
      maxEventsPerDay: 3,
      quoteValidityDays: 15,
      deliveryZones: [
        { city: 'Casablanca', fee: 0 },
        { city: 'Mohammedia', fee: 500 },
        { city: 'Rabat', fee: 1500 },
        { city: 'Marrakech', fee: 3500 },
        { city: 'Fès', fee: 4000 },
        { city: 'Tanger', fee: 4500 }
      ],
      cancellationPolicy: {
        fr: "Annulation sans frais jusqu'à 30 jours avant la date de la prestation. Entre 30 et 15 jours, 50% de l'acompte est retenu. Moins de 15 jours, l'acompte de 30% est intégralement conservé pour couvrir les réservations de matériel et commandes d'ingrédients nobles.",
        ar: "إلغاء مجاني حتى 30 يوماً قبل موعد الحفل. بين 30 و15 يوماً، يتم خصم 50% من مبلغ العربون. في حالة الإلغاء لأقل من 15 يوماً، يتم الاحتفاظ بالعربون كاملاً لتغطية حجز المعدات واقتناء المواد الأولية الفاخرة."
      },
      social: {
        instagram: 'https://instagram.com/elhabchitraiteur',
        facebook: 'https://facebook.com/elhabchitraiteur',
        tiktok: 'https://tiktok.com/@elhabchitraiteur'
      }
    });

    // 2. Users (Admin + Staff)
    console.log('[Seed] Création des utilisateurs admin et staff...');
    const adminUser = await User.create({
      fullName: 'Hajj Mohamed Elhabchi',
      email: 'admin@elhabchitraiteur.ma',
      password: 'Admin1234!',
      role: 'admin',
      phone: '+212 705 782 737',
      avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&fit=crop'
    });

    const staffUser = await User.create({
      fullName: 'Karim Mansouri',
      email: 'staff@elhabchitraiteur.ma',
      password: 'Staff1234!',
      role: 'staff',
      phone: '+212 612 345 678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop'
    });

    // 3. Dishes
    console.log('[Seed] Création des plats gastronomiques marocains...');
    const dishesData = [
      {
        name: { fr: 'Pastilla Royale aux Fruits de Mer', ar: 'بسطيلة ملكية بفواكه البحر', en: 'Royal Seafood Pastilla' },
        slug: 'pastilla-royale-fruits-de-mer',
        description: {
          fr: 'Feuilleté croustillant garni de gambas royales, calamars tendres, lotte fraîche, vermicelle chinois et chermoula secrète aux épices nobles.',
          ar: 'ورقة مقرمشة محشوة بالجمبري الملكي، الكالمار الطري، سمك الصول، الشعرية الصينية وشرمولة أصيلة بالزعفران الحر.',
          en: 'Crispy delicate pastry stuffed with jumbo shrimp, tender calamari, monkfish, vermicelli and secret saffron chermoula.'
        },
        category: 'entree',
        cuisineStyle: 'traditionnel',
        pricingMode: 'per_person',
        price: 95,
        images: [{ url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=800&fit=crop', publicId: 'pastilla_mer' }],
        isVegetarian: false,
        allergens: ['Crustacés', 'Poisson', 'Gluten'],
        isFeatured: true,
        displayOrder: 1
      },
      {
        name: { fr: 'Pastilla Fassie Poulet Fermier & Amandes', ar: 'بسطيلة فاس بالدجاج البلدي واللوز', en: 'Fassi Chicken & Almond Pastilla' },
        slug: 'pastilla-fassie-poulet-amandes',
        description: {
          fr: 'L’incontournable recette impériale de Fès : poulet fermier mijoté à la cannelle et safran, oignons confits, amandes dorées concassées parfumées à l’eau de fleur d’oranger.',
          ar: 'الوصفة الفاسية الأصيلة: دجاج بلدي بالزعفران والقرفة، بصل معسل، ولوز مقلي ومطحون بماء الزهر الحر.',
          en: 'Authentic imperial recipe from Fes: free-range chicken simmered with saffron, caramelized onions, toasted almonds and orange blossom water.'
        },
        category: 'entree',
        cuisineStyle: 'traditionnel',
        pricingMode: 'per_person',
        price: 85,
        images: [{ url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&fit=crop', publicId: 'pastilla_poulet' }],
        isVegetarian: false,
        allergens: ['Fruits à coque', 'Œufs', 'Gluten'],
        isFeatured: true,
        displayOrder: 2
      },
      {
        name: { fr: 'Assortiment de Kémia & Salades d’Apparat', ar: 'تشكيلة سلطات مغربية فاخرة', en: 'Royal Moroccan Cold Salads Assortment' },
        slug: 'salades-marocaines-apparat',
        description: {
          fr: 'Trio de prestige : Zaalouk d’aubergines grillées au feu de bois, Taktouka de poivrons rouges doux confits, et carottes mchermla à la cannelle et fleur d’oranger.',
          ar: 'ثلاثي مغربي راقٍ: زعلوك الباذنجان المدخن، تكتوكة الفلفل المشوي، وجزر مشرمل بالقرفة ومسقى بماء الزهر.',
          en: 'Prestigious trio: roasted eggplant zaalouk, sweet red pepper taktouka, and glazed cinnamon-spiced carrots.'
        },
        category: 'entree',
        cuisineStyle: 'traditionnel',
        pricingMode: 'per_person',
        price: 45,
        images: [{ url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&fit=crop', publicId: 'salades_marocaines' }],
        isVegetarian: true,
        allergens: [],
        isFeatured: false,
        displayOrder: 3
      },
      {
        name: { fr: 'Méchoui d’Agneau Entier Façon Marrakchia', ar: 'مشوي خروف كامل على الطريقة المراكشية', en: 'Whole Roasted Lamb Mechoui Marrakchia' },
        slug: 'mechoui-agneau-marrakchia',
        description: {
          fr: 'Agneau de lait sélectionné du Moyen-Atlas, rôti lentement au four traditionnel à l’étouffée pendant 7 heures avec beurre clarifié (Smen) et cumin sauvage.',
          ar: 'خروف بلدي من الأطلس المتوسط، مشوي ببطء على الحطب لمدة 7 ساعات بالسمن الحار والكمون البلدي.',
          en: 'Prime lamb slow-roasted for 7 hours with clarified butter and wild Atlas cumin until falling off the bone.'
        },
        category: 'mechoui',
        cuisineStyle: 'traditionnel',
        pricingMode: 'per_person',
        price: 180,
        images: [{ url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&fit=crop', publicId: 'mechoui_agneau' }],
        isVegetarian: false,
        allergens: ['Lactose'],
        isFeatured: true,
        displayOrder: 4
      },
      {
        name: { fr: 'Tajine d’Agneau Mrouzia & Pruneaux Caramélisés', ar: 'طاجين مروزية بالبرقوق المعسل واللوز', en: 'Lamb Mrouzia Tajine with Prunes' },
        slug: 'tajine-agneau-mrouzia-pruneaux',
        description: {
          fr: 'Épaule d’agneau fondante aux épices ras-el-hanout impériales, miel pur de thym, pruneaux glacés aux graines de sésame et amandes effilées croustillantes.',
          ar: 'كتف الخروف المعسل برأس الحانوت الفاسي، عسل السدر الطبيعي، برقوق معسل بالزنجلان ولوز محمص.',
          en: 'Tender lamb shoulder braised in 27 royal spices, mountain honey, caramelized prunes and toasted almonds.'
        },
        category: 'plat',
        cuisineStyle: 'traditionnel',
        pricingMode: 'per_person',
        price: 140,
        images: [{ url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&fit=crop', publicId: 'tajine_mrouzia' }],
        isVegetarian: false,
        allergens: ['Graines de sésame', 'Fruits à coque'],
        isFeatured: true,
        displayOrder: 5
      },
      {
        name: { fr: 'Tanjia Marrakchia Ancestrale', ar: 'طنجية مراكشية أصيلة بالفرناتشي', en: 'Authentic Marrakchia Tanjia' },
        slug: 'tanjia-marrakchia-ancestrale',
        description: {
          fr: 'Préparée en jarre de terre cuite scellée, confite dans les cendres chaudes du hammam traditionnel pendant 12 heures avec citrons beldi confits et safran.',
          ar: 'مطبوخة في قلة الفخار تحت رماد الفرناتشي لمدة 12 ساعة مع الحامض البلدي، الثوم والكمون والزعفران الحر.',
          en: 'Ancestral clay jar braised beef shin cooked overnight in traditional wood ashes with preserved lemons and saffron.'
        },
        category: 'plat',
        cuisineStyle: 'traditionnel',
        pricingMode: 'per_person',
        price: 130,
        images: [{ url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&fit=crop', publicId: 'tanjia_marrakchia' }],
        isVegetarian: false,
        allergens: [],
        isFeatured: false,
        displayOrder: 6
      },
      {
        name: { fr: 'Couscous Royal aux Sept Légumes & Tfaya d’Apparat', ar: 'كسكس ملكي بسبع خضار وتفاية معسلة', en: 'Royal Couscous 7 Vegetables & Tfaya' },
        slug: 'couscous-royal-sept-legumes-tfaya',
        description: {
          fr: 'Semoule fine beurrée travaillée à la main à la vapeur 3 fois, jarret de veau et poulet fermier, légumes du terroir et compotée d’oignons au raisin blond caramélisé.',
          ar: 'كسكس مفتول باليد ومفور 3 مرات بالسمن البلدي، لحم العجل الفتي، خضار طازجة وتفاية البصل والزبيب المعسل.',
          en: 'Hand-rolled steamed semolina served with tender veal shank, garden vegetables and caramelized sweet onion tfaya.'
        },
        category: 'plat',
        cuisineStyle: 'traditionnel',
        pricingMode: 'per_person',
        price: 110,
        images: [{ url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&fit=crop', publicId: 'couscous_royal' }],
        isVegetarian: false,
        allergens: ['Gluten', 'Lactose'],
        isFeatured: false,
        displayOrder: 7
      },
      {
        name: { fr: 'Plateau Pâtisseries Royales (Cornes de Gazelle & M’hancha)', ar: 'بلاطو حلويات ملكية مغربية', en: 'Royal Moroccan Pastry Platter' },
        slug: 'plateau-patisseries-royales',
        description: {
          fr: 'Cornes de gazelle à la pâte d’amande fine et fleur d’oranger de Fès, M’hancha dorée au miel d’oranger, Ghriba aux noix et macarons marocains.',
          ar: 'كعب غزال باللوز البلدي وماء الزهر المقطر، محنشة معسلة، غريبة الجوز واللوز الفاخر.',
          en: 'Exquisite platter of pure almond gazelle horns, coiled honey m\'hancha and walnut ghriba.'
        },
        category: 'patisserie',
        cuisineStyle: 'traditionnel',
        pricingMode: 'per_person',
        price: 60,
        images: [{ url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&fit=crop', publicId: 'patisseries_marocaines' }],
        isVegetarian: true,
        allergens: ['Fruits à coque', 'Gluten', 'Lactose'],
        isFeatured: true,
        displayOrder: 8
      },
      {
        name: { fr: 'Cérémonie du Thé à la Menthe & Cascades de Fleur d’Oranger', ar: 'مراسم الشاي بالنعناع ونوافير ماء الزهر', en: 'Traditional Moroccan Mint Tea Ceremony' },
        slug: 'ceremonie-the-menthe-traditionnel',
        description: {
          fr: 'Thé vert Gunpowder sélectionné, menthe fraîche de Meknès et absinthe parfumée, versé traditionnellement en cascade depuis des théières en argent ciselé.',
          ar: 'شاي مغربي أصيل مشحر بالنعناع المكناسي، يُسكب من أباريق الفضة المزخرفة مع رشاشات ماء الزهر.',
          en: 'Green gunpowder tea brewed with fresh mountain mint and served from high chased silver teapots.'
        },
        category: 'boisson',
        cuisineStyle: 'traditionnel',
        pricingMode: 'per_person',
        price: 25,
        images: [{ url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&fit=crop', publicId: 'the_menthe' }],
        isVegetarian: true,
        allergens: [],
        isFeatured: false,
        displayOrder: 9
      }
    ];

    const dishes = await Dish.insertMany(dishesData);
    const dishMap = {};
    dishes.forEach((d) => { dishMap[d.slug] = d; });

    // 4. Services
    console.log('[Seed] Création des prestations de service...');
    const servicesData = [
      {
        name: { fr: 'Équipe de Maîtres d’Hôtel & Serveurs en Jabador', ar: 'طاقم مضيفين ونوادل بالجبادور التقليدي', en: 'Waitstaff in Traditional Attire' },
        description: {
          fr: 'Personnel d’accueil et de service en salle expérimenté, vêtu du jabador traditionnel marocain brodé. Un serveur pour 15 à 20 convives.',
          ar: 'فريق ضيافة وخدمة محترف باللباس المغربي التقليدي الأنيق والمطرز لضمان خدمة راقية.',
          en: 'Experienced waitstaff dressed in traditional embroidered Moroccan attire.'
        },
        category: 'personnel',
        pricingMode: 'per_unit',
        price: 600,
        unitLabel: 'par serveur'
      },
      {
        name: { fr: 'Mise en Place & Décoration Florale Majestueuse', ar: 'تنسيق الطاولات والديكور الزهري الفخم', en: 'Table Setup & Luxury Floral Decor' },
        description: {
          fr: 'Arrangements floraux frais, chemins de table velours, bougeoirs dorés orientaux et sous-assiettes en cuivre martelé.',
          ar: 'تنسيق باقات الورود الطبيعية، الشمعدانات النحاسية الذهبية وإعداد طاولات الاستقبال الفاخرة.',
          en: 'Fresh floral centerpieces, velvet runners, golden candleholders and Moroccan tableware.'
        },
        category: 'decoration',
        pricingMode: 'fixed',
        price: 4500,
        unitLabel: 'forfait'
      },
      {
        name: { fr: 'Troupe Musicale Andalouse & Dakka Marrakchia', ar: 'فرقة الموسيقى الأندلسية والدقة المراكشية', en: 'Andalusian Ensemble & Dakka Marrakchia' },
        description: {
          fr: 'Accueil festif des convives avec troupe de Dakka Marrakchia et animation musicale andalouse raffinée tout au long du dîner.',
          ar: 'استقبال تقليدي حماسي بالدقة المراكشية مع عزف طربي أندلسي أصيل خلال العشاء.',
          en: 'Festive greeting with traditional Dakka Marrakchia percussion and live classical Andalusian music.'
        },
        category: 'animation',
        pricingMode: 'fixed',
        price: 6500,
        unitLabel: 'prestation'
      },
      {
        name: { fr: 'Espace Néguefa & Amariya Royale avec Trônes des Mariés', ar: 'خدمة نكافة وأمارية ملكية مع كوشة العروسين', en: 'Negefa Service & Royal Wedding Palanquin' },
        description: {
          fr: 'Trône de mariés sculpté doré, amariya royale, midah d’apparat et tenues traditionnelles pour le cortège des mariés.',
          ar: 'كوشة العروسين المذهبة، العمارية الملكية، الميدة الفاسية والإشراف على طقوس العرس المغربي.',
          en: 'Handcrafted golden wedding thrones, royal Amariya and full bridal chaperone support.'
        },
        category: 'animation',
        pricingMode: 'fixed',
        price: 8500,
        unitLabel: 'prestation'
      }
    ];

    const services = await Service.insertMany(servicesData);

    // 5. Equipment
    console.log('[Seed] Création du stock de matériel...');
    const equipmentData = [
      {
        name: 'Table Ronde Banquet 10 Personnes (Diamètre 180cm)',
        sku: 'TAB-RD-180',
        category: 'tables',
        description: 'Table pliante robuste de banquet en bois contreplaqué traité, capacité 10 à 12 convives.',
        rentalPricePerDay: 80,
        replacementCost: 850,
        totalQuantity: 80,
        outOfServiceQuantity: 2,
        unit: 'table',
        condition: 'excellent',
        lowStockThreshold: 10,
        storageLocation: 'Entrepôt A - Allée 1',
        isRentable: true
      },
      {
        name: 'Chaise Banquet Dorée Napoléon III Assise Velours',
        sku: 'CH-NAP-OR',
        category: 'chaises',
        description: 'Chaise d’apparat finition dorée royale avec coussin d’assise épais en velours écru dehbi.',
        rentalPricePerDay: 25,
        replacementCost: 350,
        totalQuantity: 650,
        outOfServiceQuantity: 15,
        unit: 'chaise',
        condition: 'excellent',
        lowStockThreshold: 50,
        storageLocation: 'Entrepôt A - Allée 2',
        isRentable: true
      },
      {
        name: 'Service de Vaisselle Fine Royale Porcelaine Liséré Or (par pers.)',
        sku: 'VAIS-LIS-OR',
        category: 'vaisselle',
        description: 'Assiette de présentation, assiette plate, assiette creuse, couverts en inox doré et verres en cristal gravé.',
        rentalPricePerDay: 35,
        replacementCost: 200,
        totalQuantity: 600,
        outOfServiceQuantity: 10,
        unit: 'couvert',
        condition: 'excellent',
        lowStockThreshold: 60,
        storageLocation: 'Entrepôt B - Zone Propre',
        isRentable: true
      },
      {
        name: 'Tente Caïdale Brodée Traditionnelle 100m² avec Lustres',
        sku: 'TNT-CAID-100',
        category: 'tentes',
        description: 'Tente marocaine authentique avec intérieur doublé velours brodé vert et or, mâts sculptés et lustres cuivrés.',
        rentalPricePerDay: 4500,
        replacementCost: 45000,
        totalQuantity: 6,
        outOfServiceQuantity: 0,
        unit: 'tente',
        condition: 'excellent',
        lowStockThreshold: 2,
        storageLocation: 'Entrepôt C - Extérieur',
        isRentable: true
      },
      {
        name: 'Salon Marocain Traditionnel Velours & Bois de Cèdre Sculpteur',
        sku: 'SAL-MAROC-01',
        category: 'decoration',
        description: 'Banquette d’apparat pour 6 personnes avec tables basses hexagonales en marqueterie et plateaux argentés.',
        rentalPricePerDay: 900,
        replacementCost: 12000,
        totalQuantity: 18,
        outOfServiceQuantity: 1,
        unit: 'salon',
        condition: 'excellent',
        lowStockThreshold: 3,
        storageLocation: 'Entrepôt A - Allée 3',
        isRentable: true
      },
      {
        name: 'Chafing Dish Inox / Chauffe-Plats de Buffet Professionnel',
        sku: 'CUIS-CHAF-01',
        category: 'cuisine',
        description: 'Chauffe-plats professionnel avec bac gastro 1/1 et brûleurs éthanol pour maintien au chaud des buffets.',
        rentalPricePerDay: 120,
        replacementCost: 950,
        totalQuantity: 40,
        outOfServiceQuantity: 3,
        unit: 'pièce',
        condition: 'bon',
        lowStockThreshold: 5,
        storageLocation: 'Entrepôt B - Cuisine',
        isRentable: true
      },
      {
        name: 'Fontaine à Jus & Samovar Géant à Thé en Cuivre Martelé',
        sku: 'EQ-SAMOVAR-01',
        category: 'autre',
        description: 'Samovar traditionnel marocain de 20 litres en cuivre argenté ciselé à la main avec réchaud intégré.',
        rentalPricePerDay: 350,
        replacementCost: 4000,
        totalQuantity: 12,
        outOfServiceQuantity: 0,
        unit: 'samovar',
        condition: 'excellent',
        lowStockThreshold: 2,
        storageLocation: 'Entrepôt B - Thé',
        isRentable: true
      }
    ];

    const equipments = await Equipment.insertMany(equipmentData);
    const equipMap = {};
    equipments.forEach((eq) => { equipMap[eq.sku] = eq; });

    // 6. Packages
    console.log('[Seed] Création des formules composées...');
    const packagesData = [
      {
        name: { fr: 'Formule Tradition & Convivialité', ar: 'باقة الأصالة والمودة', en: 'Tradition & Conviviality Package' },
        slug: 'formule-tradition-convivialite',
        description: {
          fr: 'L’accord parfait pour vos réunions de famille et baptêmes : assortiment de salades, Pastilla au poulet et amandes, Tajine d’agneau mrouzia, plateau de pâtisseries et thé.',
          ar: 'التوازن المثالي للاحتفالات العائلية والعقيقة: تشكيلة سلطات، بسطيلة الدجاج البلدي، طاجين المروزية بالبرقوق، حلويات مغربية والشاي بالنعناع.',
          en: 'A warm Moroccan feast featuring chicken pastilla, lamb tajine with prunes, royal pastries and mint tea.'
        },
        eventTypes: ['famille', 'religieux', 'anniversaire'],
        pricePerPerson: 350,
        minGuests: 20,
        maxGuests: 400,
        courses: [
          {
            label: 'Entrées d’Apparat',
            choose: 2,
            dishes: [dishMap['pastilla-fassie-poulet-amandes']._id, dishMap['salades-marocaines-apparat']._id]
          },
          {
            label: 'Grand Plat Principal',
            choose: 1,
            dishes: [dishMap['tajine-agneau-mrouzia-pruneaux']._id, dishMap['couscous-royal-sept-legumes-tfaya']._id]
          },
          {
            label: 'Desserts & Pâtisserie',
            choose: 2,
            dishes: [dishMap['plateau-patisseries-royales']._id, dishMap['ceremonie-the-menthe-traditionnel']._id]
          }
        ],
        includedEquipment: [
          { equipment: equipMap['TAB-RD-180']._id, perGuest: 0.1, fixed: 0 },
          { equipment: equipMap['CH-NAP-OR']._id, perGuest: 1, fixed: 0 },
          { equipment: equipMap['VAIS-LIS-OR']._id, perGuest: 1, fixed: 0 }
        ],
        includedServices: ['Service en salle complet', 'Mise en place des tables de fête'],
        badge: 'Populaire',
        isActive: true,
        displayOrder: 1
      },
      {
        name: { fr: 'Formule Prestige Impériale', ar: 'باقة الفخامة الإمبراطورية', en: 'Imperial Prestige Package' },
        slug: 'formule-prestige-imperiale',
        description: {
          fr: 'Le grand faste des mariages marocains de prestige : Pastilla royale aux fruits de mer, Méchoui d’agneau entier à la Marrakchia, Tajine mrouzia d’agneau, fontaine de thé et cornes de gazelle.',
          ar: 'باقة الأعراس الملكية الفاخرة: بسطيلة ملكية بفواكه البحر، خروف مشوي كامل، طاجين المروزية، ونوافير الشاي مع كعب الغزال والحلويات الفاخرة.',
          en: 'Our flagship wedding package: royal seafood pastilla, whole lamb mechoui, mrouzia tajine, sweets platter and mint tea ceremony.'
        },
        eventTypes: ['mariage', 'fiancailles'],
        pricePerPerson: 450,
        minGuests: 30,
        maxGuests: 600,
        courses: [
          {
            label: 'Entrée Royale',
            choose: 1,
            dishes: [dishMap['pastilla-royale-fruits-de-mer']._id, dishMap['pastilla-fassie-poulet-amandes']._id]
          },
          {
            label: 'Grands Plats de Festin',
            choose: 2,
            dishes: [dishMap['mechoui-agneau-marrakchia']._id, dishMap['tajine-agneau-mrouzia-pruneaux']._id, dishMap['tanjia-marrakchia-ancestrale']._id]
          },
          {
            label: 'Douceurs & Boissons',
            choose: 2,
            dishes: [dishMap['plateau-patisseries-royales']._id, dishMap['ceremonie-the-menthe-traditionnel']._id]
          }
        ],
        includedEquipment: [
          { equipment: equipMap['TAB-RD-180']._id, perGuest: 0.1, fixed: 0 },
          { equipment: equipMap['CH-NAP-OR']._id, perGuest: 1, fixed: 0 },
          { equipment: equipMap['VAIS-LIS-OR']._id, perGuest: 1, fixed: 0 }
        ],
        includedServices: ['Service en salle par maîtres d’hôtel', 'Accueil au thé et dattes majhoul farcies', 'Mise en place féerique'],
        badge: 'Recommandé',
        isActive: true,
        displayOrder: 2
      },
      {
        name: { fr: 'Formule Palais Royal & Noces d’Or', ar: 'باقة القصر الملكي والزفاف الأسطوري', en: 'Royal Palace & Golden Wedding' },
        slug: 'formule-palais-royal-noces-or',
        description: {
          fr: 'L’excellence absolue sans aucun compromis : buffet d’accueil gargantuesque, double pastilla (mer & terre), méchoui d’agneau, décoration florale incluse et service VIP haut de gamme.',
          ar: 'قمة الإبداع والرقي لأعراس الأساطير: بوفيه استقبال شامل، بسطيلتان (فواكه البحر والدجاج)، خروف مشوي، ديكور زهري ملكي وطاقم ضيافة مخصص.',
          en: 'The pinnacle of Moroccan luxury: multi-course feast, both seafood and chicken pastillas, roasted lamb, full floral staging and VIP service.'
        },
        eventTypes: ['mariage', 'fiancailles'],
        pricePerPerson: 650,
        minGuests: 50,
        maxGuests: 800,
        courses: [
          {
            label: 'Double Entrée Impériale',
            choose: 2,
            dishes: [dishMap['pastilla-royale-fruits-de-mer']._id, dishMap['pastilla-fassie-poulet-amandes']._id, dishMap['salades-marocaines-apparat']._id]
          },
          {
            label: 'Plats Principaux du Palais',
            choose: 2,
            dishes: [dishMap['mechoui-agneau-marrakchia']._id, dishMap['tajine-agneau-mrouzia-pruneaux']._id, dishMap['tanjia-marrakchia-ancestrale']._id]
          },
          {
            label: 'Desserts & Bar à Thé',
            choose: 2,
            dishes: [dishMap['plateau-patisseries-royales']._id, dishMap['ceremonie-the-menthe-traditionnel']._id]
          }
        ],
        includedEquipment: [
          { equipment: equipMap['TAB-RD-180']._id, perGuest: 0.1, fixed: 0 },
          { equipment: equipMap['CH-NAP-OR']._id, perGuest: 1, fixed: 0 },
          { equipment: equipMap['VAIS-LIS-OR']._id, perGuest: 1, fixed: 0 }
        ],
        includedServices: ['Maîtres d’hôtel et serveurs dedicacés', 'Décoration florale et centres de table', 'Table d’honneur décorée'],
        badge: 'Excellence',
        isActive: true,
        displayOrder: 3
      },
      {
        name: { fr: 'Formule Séminaire & Cocktail Gala Corporate', ar: 'باقة مؤتمرات وحفلات الشركات', en: 'Corporate Gala & Cocktail Package' },
        slug: 'formule-corporate-cocktail',
        description: {
          fr: 'Conçue pour les entreprises exigeantes : bouchées cocktail marocaines modernes, mini-pastillas, brochettes délicates, buffet chaud et animation thé.',
          ar: 'مصممة للشركات والمؤتمرات الكبرى: مقبلات مغربية عصرية، ميني بسطيلة، بوفيه ساخن ومراسم الشاي.',
          en: 'Modern cocktail reception for corporate events, seminars and brand launches.'
        },
        eventTypes: ['entreprise'],
        pricePerPerson: 280,
        minGuests: 25,
        maxGuests: 1000,
        courses: [
          {
            label: 'Cocktail & Mignardises',
            choose: 2,
            dishes: [dishMap['pastilla-fassie-poulet-amandes']._id, dishMap['salades-marocaines-apparat']._id]
          },
          {
            label: 'Buffet Chaud',
            choose: 1,
            dishes: [dishMap['couscous-royal-sept-legumes-tfaya']._id, dishMap['tajine-agneau-mrouzia-pruneaux']._id]
          },
          {
            label: 'Douceurs',
            choose: 2,
            dishes: [dishMap['plateau-patisseries-royales']._id, dishMap['ceremonie-the-menthe-traditionnel']._id]
          }
        ],
        includedEquipment: [
          { equipment: equipMap['TAB-RD-180']._id, perGuest: 0.1, fixed: 0 },
          { equipment: equipMap['CH-NAP-OR']._id, perGuest: 1, fixed: 0 }
        ],
        includedServices: ['Service au plateau et buffet', 'Facturation pro avec ICE'],
        badge: 'Entreprise',
        isActive: true,
        displayOrder: 4
      }
    ];

    const packages = await Package.insertMany(packagesData);

    // 7. Gallery
    console.log('[Seed] Création de la galerie photos...');
    const galleryData = [
      {
        title: 'Mariage Féerique au Domaine d’Anfa',
        eventType: 'mariage',
        eventDate: new Date('2026-06-20'),
        images: [
          { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&fit=crop', alt: 'Salle de réception illuminée' },
          { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&fit=crop', alt: 'Table d’honneur dorée' }
        ],
        isFeatured: true,
        displayOrder: 1
      },
      {
        title: 'Fiançailles Traditionnelles à Rabat Souissi',
        eventType: 'fiancailles',
        eventDate: new Date('2026-07-12'),
        images: [
          { url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&fit=crop', alt: 'Salon marocain et fleurs' }
        ],
        isFeatured: true,
        displayOrder: 2
      },
      {
        title: 'Gala Annuel de Prestige à Casablanca',
        eventType: 'entreprise',
        eventDate: new Date('2026-08-05'),
        images: [
          { url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&fit=crop', alt: 'Buffet corporate haut de gamme' }
        ],
        isFeatured: true,
        displayOrder: 3
      },
      {
        title: 'Réception Familiale & Baptême à Marrakech Palmeraie',
        eventType: 'famille',
        eventDate: new Date('2026-09-18'),
        images: [
          { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&fit=crop', alt: 'Tentes caïdales et lanternes' }
        ],
        isFeatured: false,
        displayOrder: 4
      }
    ];

    await Gallery.insertMany(galleryData);

    // 8. Testimonials
    console.log('[Seed] Création des témoignages clients vérifiés...');
    const testimonialsData = [
      {
        authorName: 'Sara Bennani & Mehdi Tazi',
        city: 'Casablanca',
        eventType: 'mariage',
        rating: 5,
        text: 'Un mariage au-delà de toutes nos espérances ! La pastilla aux fruits de mer était divine, le méchoui fondant à souhait et nos invités parlent encore du service irréprochable des maîtres d’hôtel.',
        isApproved: true
      },
      {
        authorName: 'Amine El Fassi (Directeur Général Atlas Horizon)',
        city: 'Rabat',
        eventType: 'entreprise',
        rating: 5,
        text: 'Elhabchi Traiteur a pris en charge notre cocktail dînatoire de 350 personnes à Rabat. Ponctualité exemplaire, logistique millimétrée et devis respecté au centime près.',
        isApproved: true
      },
      {
        authorName: 'Fatima-Zohra Alami',
        city: 'Fès',
        eventType: 'famille',
        rating: 5,
        text: 'Pour le baptême de mon fils, Elhabchi Traiteur a sublimé la tradition fassie. Les gâteaux marocains et le thé étaient tout simplement exceptionnels.',
        isApproved: true
      }
    ];

    await Testimonial.insertMany(testimonialsData);

    // 9. Bookings with realistic diverse statuses
    console.log('[Seed] Création de réservations de démonstration...');
    const bookingsData = [
      {
        trackingCode: 'ELH-2026-00042',
        kind: 'booking',
        status: 'new',
        source: 'website',
        customer: {
          fullName: 'Sara Benkirane',
          phone: '+212612345678',
          email: 'sara.b@gmail.com',
          isCompany: false,
          preferredContact: 'whatsapp'
        },
        event: {
          type: 'mariage',
          date: new Date('2026-11-20T19:00:00Z'),
          startTime: '19:00',
          endTime: '02:00',
          guestsCount: 250,
          city: 'Casablanca',
          address: 'Salle des Fêtes Palmier, Aïn Diab',
          venueType: 'salle'
        },
        rental: {
          from: new Date('2026-11-19T00:00:00Z'),
          to: new Date('2026-11-21T23:59:59Z')
        },
        package: packages[1]._id, // Prestige
        packageSnapshot: { name: 'Formule Prestige Impériale', pricePerPerson: 450 },
        dishes: [
          { dish: dishes[0]._id, name: 'Pastilla Royale aux Fruits de Mer', pricingMode: 'per_person', unitPrice: 95, quantity: 1 }
        ],
        equipmentItems: [
          { equipment: equipments[0]._id, name: 'Table Ronde Banquet 10 Personnes', quantity: 25, unitPrice: 80, days: 1 },
          { equipment: equipments[1]._id, name: 'Chaise Banquet Dorée Napoléon III', quantity: 250, unitPrice: 25, days: 1 }
        ],
        services: [
          { service: services[0]._id, name: 'Équipe de Maîtres d’Hôtel & Serveurs en Jabador', pricingMode: 'per_unit', unitPrice: 600, quantity: 12 }
        ],
        specialRequests: 'Table d’honneur décorée en vert émeraude et or safran.',
        pricing: {
          foodTotal: 112500,
          equipmentTotal: 8250,
          servicesTotal: 7200,
          deliveryFee: 0,
          discount: 0,
          taxAmount: 0,
          total: 127950,
          deposit: 38385
        },
        payments: [],
        internalNotes: [
          { text: 'Demande reçue via le simulateur web. Prévoir appel découverte sur WhatsApp.', by: adminUser._id }
        ],
        statusHistory: [
          { status: 'new', at: new Date(), reason: 'Demande client enregistrée' }
        ],
        whatsappClickedAt: new Date()
      },
      {
        trackingCode: 'ELH-2026-00043',
        kind: 'booking',
        status: 'quote_sent',
        source: 'website',
        customer: {
          fullName: 'Driss El Amrani',
          phone: '+212661234567',
          email: 'd.amrani@groupe-amrani.ma',
          isCompany: true,
          companyName: 'Groupe Amrani Holding',
          preferredContact: 'phone'
        },
        event: {
          type: 'entreprise',
          date: new Date('2026-11-28T18:00:00Z'),
          startTime: '18:00',
          endTime: '23:00',
          guestsCount: 120,
          city: 'Rabat',
          address: 'Domaine de Souissi, Avenue Mohammed VI',
          venueType: 'entreprise'
        },
        rental: {
          from: new Date('2026-11-27T00:00:00Z'),
          to: new Date('2026-11-29T23:59:59Z')
        },
        package: packages[3]._id, // Corporate
        packageSnapshot: { name: 'Formule Séminaire & Cocktail Gala Corporate', pricePerPerson: 280 },
        dishes: [],
        equipmentItems: [
          { equipment: equipments[0]._id, name: 'Table Ronde Banquet 10 Personnes', quantity: 12, unitPrice: 80, days: 1 }
        ],
        services: [
          { service: services[1]._id, name: 'Mise en Place & Décoration Florale Majestueuse', pricingMode: 'fixed', unitPrice: 4500, quantity: 1 }
        ],
        specialRequests: 'Cocktail de fin d’année du conseil d’administration.',
        pricing: {
          foodTotal: 33600,
          equipmentTotal: 960,
          servicesTotal: 4500,
          deliveryFee: 1500,
          discount: 1000,
          taxAmount: 0,
          total: 39560,
          deposit: 11868
        },
        payments: [],
        internalNotes: [
          { text: 'Devis envoyé avec remise commerciale de 1 000 MAD.', by: adminUser._id }
        ],
        statusHistory: [
          { status: 'new', at: new Date(Date.now() - 48 * 3600 * 1000), reason: 'Demande en ligne' },
          { status: 'quote_sent', at: new Date(Date.now() - 24 * 3600 * 1000), by: adminUser._id, reason: 'Devis validé et communiqué' }
        ],
        quoteSentAt: new Date(Date.now() - 24 * 3600 * 1000),
        quoteValidUntil: new Date(Date.now() + 14 * 24 * 3600 * 1000)
      },
      {
        trackingCode: 'ELH-2026-00044',
        kind: 'booking',
        status: 'confirmed',
        source: 'whatsapp',
        customer: {
          fullName: 'Lalla Kenza Chraïbi',
          phone: '+212678901234',
          email: 'kenza.chraibi@outlook.fr',
          isCompany: false,
          preferredContact: 'whatsapp'
        },
        event: {
          type: 'mariage',
          date: new Date('2026-12-05T19:30:00Z'),
          startTime: '19:30',
          endTime: '04:00',
          guestsCount: 300,
          city: 'Casablanca',
          address: 'Villa Privée Californie, Casablanca',
          venueType: 'jardin'
        },
        rental: {
          from: new Date('2026-12-04T00:00:00Z'),
          to: new Date('2026-12-06T23:59:59Z')
        },
        package: packages[2]._id, // Palais Royal
        packageSnapshot: { name: 'Formule Palais Royal & Noces d’Or', pricePerPerson: 650 },
        dishes: [],
        equipmentItems: [
          { equipment: equipments[3]._id, name: 'Tente Caïdale Brodée Traditionnelle 100m²', quantity: 2, unitPrice: 4500, days: 1 },
          { equipment: equipments[1]._id, name: 'Chaise Banquet Dorée Napoléon III', quantity: 300, unitPrice: 25, days: 1 }
        ],
        services: [
          { service: services[2]._id, name: 'Troupe Musicale Andalouse & Dakka Marrakchia', pricingMode: 'fixed', unitPrice: 6500, quantity: 1 }
        ],
        specialRequests: 'Tentes installées dans le jardin dès le vendredi matin.',
        pricing: {
          foodTotal: 195000,
          equipmentTotal: 16500,
          servicesTotal: 6500,
          deliveryFee: 0,
          discount: 0,
          taxAmount: 0,
          total: 218000,
          deposit: 65400
        },
        payments: [
          {
            amount: 65400,
            method: 'virement',
            paidAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
            note: 'Acompte de 30% reçu par virement bancaire CIH',
            recordedBy: adminUser._id
          }
        ],
        internalNotes: [
          { text: 'Acompte validé. Matériel et tentes bloqués sur la période.', by: adminUser._id }
        ],
        statusHistory: [
          { status: 'new', at: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
          { status: 'quote_sent', at: new Date(Date.now() - 6 * 24 * 3600 * 1000), by: adminUser._id },
          { status: 'confirmed', at: new Date(Date.now() - 5 * 24 * 3600 * 1000), by: adminUser._id, reason: 'Acompte 30% reçu' }
        ]
      }
    ];

    await Booking.insertMany(bookingsData);

    // Initialize atomic counter
    await Counter.create({
      name: 'booking_code',
      year: 2026,
      seq: 44
    });

    console.log('[Seed] Données insérées avec succès !');
    console.log(`[Seed] Admin : admin@elhabchitraiteur.ma / Admin1234!`);
    console.log(`[Seed] Staff : staff@elhabchitraiteur.ma / Staff1234!`);
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDatabase();
