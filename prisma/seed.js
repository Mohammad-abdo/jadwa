// Seed data for Jadwa Consulting Platform
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Hash password helper
  const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10)
  }

  // 1. Create System Settings
  console.log('📝 Creating system settings...')
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'platform_name',
        value: 'Jadwa Consulting Platform',
        description: 'Platform name',
        category: 'general',
      },
      {
        key: 'platform_name_ar',
        value: 'منصة جدوى للاستشارات',
        description: 'Platform name in Arabic',
        category: 'general',
      },
      {
        key: 'platform_email',
        value: 'info@jadwa.com',
        description: 'Platform contact email',
        category: 'contact',
      },
      {
        key: 'platform_phone',
        value: '+966 12 345 6789',
        description: 'Platform contact phone',
        category: 'contact',
      },
      {
        key: 'platform_commission_rate',
        value: '15',
        description: 'Platform commission percentage',
        category: 'payment',
      },
      {
        key: 'payment_gateway',
        value: 'tap',
        description: 'Default payment gateway',
        category: 'payment',
      },
    ],
    skipDuplicates: true,
  })

  // 2. Create Services
  console.log('🛠️ Creating services...')
  const services = [
    {
      title: 'Economic Consultations',
      titleAr: 'الاستشارات الاقتصادية',
      description: 'Professional economic consulting services for businesses and individuals',
      descriptionAr: 'خدمات استشارية اقتصادية متخصصة للشركات والأفراد',
      category: 'ECONOMIC',
      targetAudience: 'Businesses, Investors, Entrepreneurs',
      type: 'Consultation',
      price: 500.00,
      status: 'ACTIVE',
      order: 1,
    },
    {
      title: 'Feasibility Studies',
      titleAr: 'دراسات الجدوى',
      description: 'Comprehensive feasibility studies for new projects and investments',
      descriptionAr: 'دراسات جدوى شاملة للمشاريع والاستثمارات الجديدة',
      category: 'ANALYSIS_REPORTS',
      targetAudience: 'Entrepreneurs, Investors, Companies',
      type: 'Study',
      price: 5000.00,
      status: 'ACTIVE',
      order: 2,
    },
    {
      title: 'Financial Analysis',
      titleAr: 'التحليل المالي',
      description: 'In-depth financial analysis and reporting services',
      descriptionAr: 'خدمات التحليل المالي والتقارير المتعمقة',
      category: 'FINANCIAL_ACCOUNTING',
      targetAudience: 'Companies, Financial Institutions',
      type: 'Analysis',
      price: 3000.00,
      status: 'ACTIVE',
      order: 3,
    },
    {
      title: 'Administrative Consulting',
      titleAr: 'الاستشارات الإدارية',
      description: 'Administrative and organizational consulting services',
      descriptionAr: 'خدمات الاستشارات الإدارية والتنظيمية',
      category: 'ADMINISTRATIVE',
      targetAudience: 'Companies, Organizations',
      type: 'Consultation',
      price: 400.00,
      status: 'ACTIVE',
      order: 4,
    },
    {
      title: 'Video Consultation',
      titleAr: 'استشارة فيديو',
      description: 'One-on-one video consultation with expert consultants',
      descriptionAr: 'استشارة فيديو مباشرة مع مستشارين متخصصين',
      category: 'DIGITAL_CUSTOMER',
      targetAudience: 'All',
      type: 'Video Call',
      price: 300.00,
      status: 'ACTIVE',
      order: 5,
    },
    {
      title: 'Chat Consultation',
      titleAr: 'استشارة محادثة',
      description: 'Real-time chat consultation with consultants',
      descriptionAr: 'استشارة محادثة مباشرة مع المستشارين',
      category: 'DIGITAL_CUSTOMER',
      targetAudience: 'All',
      type: 'Chat',
      price: 200.00,
      status: 'ACTIVE',
      order: 6,
    },
  ]

  await prisma.service.createMany({
    data: services,
    skipDuplicates: true,
  })

  // 3. Create Super Admin
  console.log('👤 Creating super admin...')
  const adminPassword = await hashPassword('Admin@123')
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@jadwa.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
      admin: {
        create: {
          firstName: 'Super',
          lastName: 'Admin',
          adminRole: 'SUPER_ADMIN',
          permissions: JSON.stringify(['*']), // All permissions
        },
      },
    },
  })

  // 4. Create Sample Consultant
  console.log('👨‍💼 Creating sample consultant...')
  const consultantPassword = await hashPassword('Consultant@123')
  const consultantUser = await prisma.user.create({
    data: {
      email: 'consultant@jadwa.com',
      password: consultantPassword,
      role: 'CONSULTANT',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
      consultant: {
        create: {
          firstName: 'أحمد',
          lastName: 'محمد',
          academicDegree: 'دكتوراه في الاقتصاد',
          specialization: 'الاستشارات الاقتصادية',
          bio: 'خبير اقتصادي مع أكثر من 15 عاماً من الخبرة في الاستشارات الاقتصادية والمالية',
          expertiseFields: JSON.stringify(['الاقتصاد', 'الاستثمار', 'التحليل المالي']),
          pricePerSession: 500.00,
          isVerified: true,
          isAvailable: true,
        },
      },
    },
  })

  // 5. Create Sample Client
  console.log('👥 Creating sample client...')
  const clientPassword = await hashPassword('Client@123')
  const clientUser = await prisma.user.create({
    data: {
      email: 'client@jadwa.com',
      password: clientPassword,
      role: 'CLIENT',
      emailVerified: true,
      emailVerifiedAt: new Date(),
      isActive: true,
      client: {
        create: {
          firstName: 'خالد',
          lastName: 'السعيد',
          city: 'الرياض',
          sector: 'التجارة',
          notificationEmail: true,
          notificationApp: true,
          notificationWhatsApp: false,
        },
      },
    },
  })

  // 6. Create CMS Pages
  console.log('📄 Creating CMS pages...')
  const cmsPages = [
    {
      title: 'About Us',
      titleAr: 'من نحن',
      slug: 'about',
      content: '<p>Jadwa Consulting Platform is a leading provider of economic and administrative consulting services.</p>',
      contentAr: '<p>منصة جدوى للاستشارات هي مزود رائد لخدمات الاستشارات الاقتصادية والإدارية.</p>',
      metaTitle: 'About Us - Jadwa Consulting',
      metaDescription: 'Learn about Jadwa Consulting Platform and our mission',
      isPublished: true,
      order: 1,
    },
    {
      title: 'Terms & Conditions',
      titleAr: 'الشروط والأحكام',
      slug: 'terms',
      content: '<p>Terms and conditions content...</p>',
      contentAr: '<p>محتوى الشروط والأحكام...</p>',
      metaTitle: 'Terms & Conditions - Jadwa Consulting',
      metaDescription: 'Terms and conditions for using Jadwa Consulting Platform',
      isPublished: true,
      order: 2,
    },
    {
      title: 'Privacy Policy',
      titleAr: 'سياسة الخصوصية',
      slug: 'privacy',
      content: '<p>Privacy policy content...</p>',
      contentAr: '<p>محتوى سياسة الخصوصية...</p>',
      metaTitle: 'Privacy Policy - Jadwa Consulting',
      metaDescription: 'Privacy policy for Jadwa Consulting Platform',
      isPublished: true,
      order: 3,
    },
  ]

  await prisma.cMSPage.createMany({
    data: cmsPages,
    skipDuplicates: true,
  })

  // 7. Create Sample Economic Indicators
  console.log('📊 Creating economic indicators...')
  await prisma.economicIndicator.createMany({
    data: [
      {
        name: 'GDP Growth Rate',
        nameAr: 'معدل نمو الناتج المحلي',
        value: 3.5,
        unit: '%',
        category: 'Macroeconomic',
        period: '2025-Q1',
        source: 'SAMA',
      },
      {
        name: 'Inflation Rate',
        nameAr: 'معدل التضخم',
        value: 2.1,
        unit: '%',
        category: 'Macroeconomic',
        period: '2025-Q1',
        source: 'SAMA',
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📋 Default Credentials:')
  console.log('Admin: admin@jadwa.com / Admin@123')
  console.log('Consultant: consultant@jadwa.com / Consultant@123')
  console.log('Client: client@jadwa.com / Client@123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

