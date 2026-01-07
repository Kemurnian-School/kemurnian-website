import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // --------------------------------------------------------
  // STEP 1: Paste your User UID here
  // Get this from: http://localhost:54323/project/default/auth/users
  // --------------------------------------------------------
  const MY_USER_ID = "b385efa4-4e98-4060-b1e9-1e7c9a6848ee"

  if (MY_USER_ID === "b385efa4-4e98-4060-b1e9-1e7c9a6848ee") {
    console.log("⚠️  Skipping Admin Seed: No User ID provided in seed.ts")
    return
  }

  console.log(`🌱 Seeding Admin Role for: ${MY_USER_ID}`)

  // --------------------------------------------------------
  // STEP 2: Upsert (Safe Insert)
  // This says: "If this user is already Admin, do nothing. If not, make them Admin."
  // --------------------------------------------------------
  await prisma.user_roles.upsert({
    where: {
      // CHECK YOUR SCHEMA:
      // If you have @@unique([user_id, roles]), use this syntax:
      user_id_roles: {
        user_id: MY_USER_ID,
        roles: 'Admin' 
      }
      // If your table just uses a simple ID, you might need to find by that instead.
    },
    update: {}, // Do nothing if exists
    create: {
      user_id: MY_USER_ID,
      roles: 'Admin'
    }
  })

  console.log('✅ User is now an Admin.')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
