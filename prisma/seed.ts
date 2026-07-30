import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const DEV_PASSWORD = 'password123'

async function main() {
  const hashedPassword = await bcrypt.hash(DEV_PASSWORD, 10)

  const vendor = await prisma.vendor.upsert({
    where: { email: 'vendor@eventgrounds.com' },
    update: { password: hashedPassword },
    create: {
      name: 'EventGrounds Vendor',
      email: 'vendor@eventgrounds.com',
      phone: '+233501234567',
      commissionRate: 0.02,
      password: hashedPassword,
    },
  })

  const vendorTwo = await prisma.vendor.upsert({
    where: { email: 'vendor2@eventgrounds.com' },
    update: { password: hashedPassword },
    create: {
      name: 'Kumasi Venues Ltd',
      email: 'vendor2@eventgrounds.com',
      phone: '+233507654321',
      commissionRate: 0.02,
      password: hashedPassword,
    },
  })

  const grounds = [
    {
      name: 'Golden Gardens',
      description: 'A beautiful outdoor garden venue perfect for weddings and garden parties. Features lush greenery, a gazebo, and ample parking.',
      location: 'Accra, Ghana',
      category: 'garden',
      capacity: 300,
      price: 2500,
      images: [
        'https://res.cloudinary.com/demo/image/upload/samples/landscapes/nature-mountains.jpg',
        'https://res.cloudinary.com/demo/image/upload/samples/landscapes/girl-urban-view.jpg',
      ],
      amenities: ['Parking', 'Stage', 'Sound System', 'Catering Kitchen', 'Restrooms', 'Generator'],
      status: 'active',
    },
    {
      name: 'Oceanview Pavilion',
      description: 'Stunning beachfront venue with panoramic ocean views. Ideal for corporate events and cocktail parties.',
      location: 'Takoradi, Ghana',
      category: 'beach',
      capacity: 150,
      price: 1800,
      images: [
        'https://res.cloudinary.com/demo/image/upload/samples/landscapes/beach-boat.jpg',
        'https://res.cloudinary.com/demo/image/upload/samples/outdoor-woman.jpg',
      ],
      amenities: ['Beach Access', 'Pool', 'VIP Lounge', 'Sound System', 'Security', 'Air Conditioning'],
      status: 'active',
    },
    {
      name: 'Royal Palace Hall',
      description: 'Grand indoor event hall with elegant decor. Suitable for banquets, conferences, and traditional ceremonies.',
      location: 'Kumasi, Ghana',
      category: 'hall',
      capacity: 500,
      price: 4000,
      images: [
        'https://res.cloudinary.com/demo/image/upload/samples/landscapes/architecture-signs.jpg',
        'https://res.cloudinary.com/demo/image/upload/samples/chair-and-coffee-table.jpg',
      ],
      amenities: ['Air Conditioning', 'Stage', 'Sound System', 'Catering', 'VIP Room', 'Parking'],
      status: 'active',
    },
    {
      name: 'Green Acre Field',
      description: 'Spacious sports field and event ground. Perfect for outdoor concerts, festivals, and sports events.',
      location: 'Tema, Ghana',
      category: 'sports',
      capacity: 1000,
      price: 6000,
      images: [
        'https://res.cloudinary.com/demo/image/upload/samples/bike.jpg',
        'https://res.cloudinary.com/demo/image/upload/samples/landscapes/nature-mountains.jpg',
      ],
      amenities: ['Floodlights', 'Stage', 'Sound System', 'Changing Rooms', 'Catering', 'Security'],
      status: 'active',
    },
  ]

  for (const ground of grounds) {
    await prisma.ground.create({
      data: {
        ...ground,
        vendorId: vendor.id,
      },
    })
  }

  await prisma.ground.create({
    data: {
      name: 'Ashanti Convention Center',
      description: 'Modern convention center with breakout rooms, ideal for conferences and large corporate gatherings.',
      location: 'Kumasi, Ghana',
      category: 'conference',
      capacity: 400,
      price: 3200,
      images: [
        'https://res.cloudinary.com/demo/image/upload/samples/landscapes/architecture-signs.jpg',
      ],
      amenities: ['Air Conditioning', 'Projector', 'Wi-Fi', 'Parking', 'Catering'],
      status: 'active',
      vendorId: vendorTwo.id,
      cancellationPolicy: 'strict',
      cancellationNoticeHours: 168,
    },
  })

  // Sub-spaces + hourly pricing + opening hours demo venue
  const weekdayHours = (open: string, close: string) => ({ open, close, closed: false })
  await prisma.ground.create({
    data: {
      name: 'Spintex Creative Studio',
      description: 'A multi-room creative studio complex with individually bookable rooms for podcasts, photoshoots, and content creation.',
      location: 'Spintex, Accra',
      category: 'studio',
      capacity: 60,
      price: 0,
      pricingType: 'hourly',
      hourlyRate: 300,
      images: [
        'https://res.cloudinary.com/demo/image/upload/samples/chair-and-coffee-table.jpg',
      ],
      amenities: ['Wi-Fi', 'Air Conditioning', 'Parking', 'Sound Proofing'],
      status: 'active',
      vendorId: vendor.id,
      openingHours: [
        { day: 0, open: '12:30', close: '18:00', closed: false },
        { day: 1, open: '00:00', close: '00:00', closed: true },
        { day: 2, ...weekdayHours('08:00', '20:00') },
        { day: 3, ...weekdayHours('08:00', '20:00') },
        { day: 4, ...weekdayHours('08:00', '20:00') },
        { day: 5, ...weekdayHours('08:00', '20:00') },
        { day: 6, ...weekdayHours('08:00', '20:00') },
      ],
      spaces: {
        create: [
          {
            name: 'Podcast Room',
            capacity: 4,
            pricingType: 'hourly',
            hourlyRate: 250,
            images: [],
            status: 'active',
          },
          {
            name: 'Photo Studio',
            capacity: 10,
            pricingType: 'both',
            hourlyRate: 400,
            dailyRate: 2800,
            images: [],
            status: 'active',
          },
        ],
      },
    },
  })

  console.log('Seed completed successfully')
  console.log('---')
  console.log('Vendor login credentials (dev only):')
  console.log(`  ${vendor.email} / ${DEV_PASSWORD}`)
  console.log(`  ${vendorTwo.email} / ${DEV_PASSWORD}`)
  console.log('---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
