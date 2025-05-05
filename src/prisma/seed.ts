import prisma from "../config/db"
import { PERMISSIONS, PERMISSION_DESCRIPTIONS } from "../constants/permissions"
import { hashPassword } from "../utils/password.utils"

async function main() {
    // 1. Seed Permissions
    const permissionEntries = Object.entries(PERMISSIONS)
    const permissionRecords = await Promise.all(
        permissionEntries.map(([key, name]) =>
            prisma.permission.upsert({
                where: { name },
                update: {},
                create: {
                    name,
                    description: PERMISSION_DESCRIPTIONS[key as keyof typeof PERMISSIONS] || null,
                },
            })
        )
    )

    // 2. Seed Roles
    const superAdminRole = await prisma.role.upsert({
        where: { name: "SUPER_ADMIN" },
        update: {},
        create: {
            name: "SUPER_ADMIN",
            description: "Super admin with all permissions",
            permission: {
                create: permissionRecords.map((perm) => ({ permissionId: perm.id })),
            },
        },
        include: { permission: true },
    })

    const adminRole = await prisma.role.upsert({
        where: { name: "ADMIN" },
        update: {},
        create: {
            name: "ADMIN",
            description: "Admin with most permissions",
            permission: {
                create: permissionRecords
                    .filter((perm) => perm.name !== PERMISSIONS.deleteRole) // Example: restrict one
                    .map((perm) => ({ permissionId: perm.id })),
            },
        },
        include: { permission: true },
    })

    const guestRole = await prisma.role.upsert({
        where: { name: "GUEST" },
        update: {},
        create: {
            name: "GUEST",
            description: "Guest with minimal permissions",
            permission: {
                create: [PERMISSIONS.viewRoles, PERMISSIONS.viewPermissions, PERMISSIONS.viewApplications, PERMISSIONS.viewConvoyApplications].map(
                    (permName) => {
                        const perm = permissionRecords.find((p) => p.name === permName)
                        return perm ? { permissionId: perm.id } : undefined
                    }
                ).filter(Boolean) as any[],
            },
        },
        include: { permission: true },
    })

    // 3. Seed Users
    const password = await hashPassword("password")

    const superAdminUser = await prisma.user.upsert({
        where: { email: "superadmin@example.com" },
        update: {},
        create: {
            username: "superadmin",
            email: "superadmin@example.com",
            password,
            isActive: true,
            role: {
                create: [{ roleId: superAdminRole.id }],
            },
        },
    })

    const adminUser = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            username: "admin",
            email: "admin@example.com",
            password,
            isActive: true,
            role: {
                create: [{ roleId: adminRole.id }],
            },
        },
    })

    const guestUser = await prisma.user.upsert({
        where: { email: "guest@example.com" },
        update: {},
        create: {
            username: "guest",
            email: "guest@example.com",
            password,
            isActive: true,
            role: {
                create: [{ roleId: guestRole.id }],
            },
        },
    })

    // Add more users as needed

    // 4. Seed Committees
    const committee1 = await prisma.committee.upsert({
        where: { name: "Logistics" },
        update: {},
        create: {
            name: "Logistics",
            description: "Handles all logistics for convoys."
        }
    })
    const committee2 = await prisma.committee.upsert({
        where: { name: "Medical" },
        update: {},
        create: {
            name: "Medical",
            description: "Provides medical support."
        }
    })

    // 5. Seed Villages
    const village1 = await prisma.village.upsert({
        where: { id: "green-valley" },
        update: {},
        create: {
            id: "green-valley",
            name: "Green Valley",
            location: "North Region"
        }
    })
    const village2 = await prisma.village.upsert({
        where: { id: "river-town" },
        update: {},
        create: {
            id: "river-town",
            name: "River Town",
            location: "South Region"
        }
    })

    // 6. Seed Convoys
    const convoy1 = await prisma.convoy.upsert({
        where: { id: "spring-relief" },
        update: {},
        create: {
            id: "spring-relief",
            name: "Spring Relief",
            goals: "Deliver food and supplies to villages.",
            requirements: "Trucks, volunteers, medical supplies.",
            startDate: new Date('2025-05-10T08:00:00Z'),
            endDate: new Date('2025-05-15T18:00:00Z'),
            status: "SCHEDULED"
        }
    })
    const convoy2 = await prisma.convoy.upsert({
        where: { id: "medical-outreach" },
        update: {},
        create: {
            id: "medical-outreach",
            name: "Medical Outreach",
            goals: "Provide medical checkups.",
            requirements: "Doctors, nurses, medicine.",
            startDate: new Date('2025-06-01T08:00:00Z'),
            endDate: new Date('2025-06-05T18:00:00Z'),
            status: "PLANNING"
        }
    })

    // 7. Seed Committee Members
    await prisma.committeeMember.upsert({
        where: { userId_committeeId: { userId: adminUser.id, committeeId: committee1.id } },
        update: {},
        create: {
            userId: adminUser.id,
            committeeId: committee1.id
        }
    })
    await prisma.committeeMember.upsert({
        where: { userId_committeeId: { userId: guestUser.id, committeeId: committee2.id } },
        update: {},
        create: {
            userId: guestUser.id,
            committeeId: committee2.id
        }
    })

    // 8. Seed Volunteer Applications
    await prisma.volunteerApplication.upsert({
        where: { userId_convoyId_committeeId: { userId: adminUser.id, convoyId: convoy1.id, committeeId: committee1.id } },
        update: {},
        create: {
            userId: adminUser.id,
            convoyId: convoy1.id,
            committeeId: committee1.id,
            status: "APPROVED"
        }
    })
    await prisma.volunteerApplication.upsert({
        where: { userId_convoyId_committeeId: { userId: guestUser.id, convoyId: convoy2.id, committeeId: committee2.id } },
        update: {},
        create: {
            userId: guestUser.id,
            convoyId: convoy2.id,
            committeeId: committee2.id,
            status: "PENDING"
        }
    })

    // 9. Seed Convoy Participants
    await prisma.convoyParticipant.upsert({
        where: { userId_convoyId_committeeId: { userId: adminUser.id, convoyId: convoy1.id, committeeId: committee1.id } },
        update: {},
        create: {
            userId: adminUser.id,
            convoyId: convoy1.id,
            committeeId: committee1.id,
            role: "Driver",
            status: "ACTIVE"
        }
    })
    await prisma.convoyParticipant.upsert({
        where: { userId_convoyId_committeeId: { userId: guestUser.id, convoyId: convoy2.id, committeeId: committee2.id } },
        update: {},
        create: {
            userId: guestUser.id,
            convoyId: convoy2.id,
            committeeId: committee2.id,
            role: "Medic",
            status: "INACTIVE"
        }
    })

    // 10. Seed Village Data
    await prisma.villageData.upsert({
        where: { id: "seed-village-data-1" },
        update: {},
        create: {
            id: "seed-village-data-1",
            data: { population: 1200, needs: ["water", "food"] },
            villageId: village1.id,
            userId: adminUser.id
        }
    })
    await prisma.villageData.upsert({
        where: { id: "seed-village-data-2" },
        update: {},
        create: {
            id: "seed-village-data-2",
            data: { population: 800, needs: ["medicine"] },
            villageId: village2.id,
            userId: guestUser.id
        }
    })

    console.log("Seed complete!")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
