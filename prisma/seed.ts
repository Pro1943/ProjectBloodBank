import "dotenv/config";
import { db } from "../src/lib/db";

const prisma = db;

async function main() {
  await prisma.campRSVP.deleteMany();
  await prisma.donationCamp.deleteMany();
  await prisma.bloodRequest.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.hospital.deleteMany();

  const hospital = await prisma.hospital.create({
    data: {
      clerkUserId: "hospital_user_001",
      name: "City General Hospital",
      address: "123 Medical Avenue, Dhaka",
      latitude: 23.8103,
      longitude: 90.4125,
      phone: "+8801712345678",
      email: "admin@citygeneral.example",
    },
  });

  const donors = await prisma.$transaction([
    prisma.donor.create({
      data: {
        clerkUserId: "donor_user_001",
        firstName: "Asha",
        lastName: "Rahman",
        bloodType: "O_NEG",
        phone: "+8801710000001",
        email: "asha@example.com",
        address: "Banani, Dhaka",
        latitude: 23.7938,
        longitude: 90.4049,
        isAvailable: true,
        lastDonationDate: new Date("2025-04-21T00:00:00.000Z"),
      },
    }),
    prisma.donor.create({
      data: {
        clerkUserId: "donor_user_002",
        firstName: "Nabil",
        lastName: "Hossain",
        bloodType: "A_POS",
        phone: "+8801710000002",
        email: "nabil@example.com",
        address: "Gulshan, Dhaka",
        latitude: 23.7925,
        longitude: 90.4143,
        isAvailable: true,
        lastDonationDate: new Date("2025-05-01T00:00:00.000Z"),
      },
    }),
    prisma.donor.create({
      data: {
        clerkUserId: "donor_user_003",
        firstName: "Jahanara",
        lastName: "Begum",
        bloodType: "AB_POS",
        phone: "+8801710000003",
        email: "jahanara@example.com",
        address: "Uttara, Dhaka",
        latitude: 23.8759,
        longitude: 90.3795,
        isAvailable: false,
        lastDonationDate: new Date("2025-06-15T00:00:00.000Z"),
      },
    }),
    prisma.donor.create({
      data: {
        clerkUserId: "donor_user_004",
        firstName: "Rafiq",
        lastName: "Islam",
        bloodType: "B_NEG",
        phone: "+8801710000004",
        email: "rafiq@example.com",
        address: "Mohammadpur, Dhaka",
        latitude: 23.7604,
        longitude: 90.3651,
        isAvailable: true,
        lastDonationDate: new Date("2025-02-10T00:00:00.000Z"),
      },
    }),
  ]);

  const [donorOne, donorTwo, donorThree, donorFour] = donors;

  await prisma.bloodRequest.create({
    data: {
      hospitalId: hospital.id,
      bloodType: "O_NEG",
      unitsNeeded: 6,
      unitsFulfilled: 1,
      urgency: "CRITICAL",
      status: "PARTIALLY_FILLED",
      notes: "Emergency request for trauma patients.",
    },
  });

  const camp = await prisma.donationCamp.create({
    data: {
      hospitalId: hospital.id,
      title: "Community Blood Drive",
      description: "A mobile donation drive for local residents.",
      address: "Shahbagh, Dhaka",
      latitude: 23.7393,
      longitude: 90.3899,
      startDate: new Date("2026-08-05T09:00:00.000Z"),
      endDate: new Date("2026-08-05T17:00:00.000Z"),
      maxCapacity: 2,
      status: "UPCOMING",
    },
  });

  await prisma.campRSVP.createMany({
    data: [
      {
        campId: camp.id,
        donorId: donorOne.id,
        status: "CONFIRMED",
      },
      {
        campId: camp.id,
        donorId: donorTwo.id,
        status: "WAITLISTED",
      },
      {
        campId: camp.id,
        donorId: donorThree.id,
        status: "CONFIRMED",
      },
    ],
  });

  await prisma.campRSVP.create({
    data: {
      campId: camp.id,
      donorId: donorFour.id,
      status: "WAITLISTED",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
