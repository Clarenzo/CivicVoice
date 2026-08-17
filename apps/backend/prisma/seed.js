"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Seeding CivicVoice database...");
    const agency = await prisma.agency.upsert({
        where: { code: "GOK-2026" },
        update: {},
        create: {
            name: "Government of Kenya",
            code: "GOK-2026",
            description: "The Republic of Kenya Government Services",
        },
    });
    console.log(`Created agency: ${agency.name}`);
    const departments = await Promise.all([
        prisma.department.upsert({
            where: { code: "INFRA" },
            update: {},
            create: {
                name: "Infrastructure & Public Works",
                code: "INFRA",
                agencyId: agency.id,
            },
        }),
        prisma.department.upsert({
            where: { code: "HEALTH" },
            update: {},
            create: {
                name: "Health Service",
                code: "HEALTH",
                agencyId: agency.id,
            },
        }),
        prisma.department.upsert({
            where: { code: "EDU" },
            update: {},
            create: {
                name: "Education",
                code: "EDU",
                agencyId: agency.id,
            },
        }),
        prisma.department.upsert({
            where: { code: "WATER" },
            update: {},
            create: {
                name: "Water & Sanitation",
                code: "WATER",
                agencyId: agency.id,
            },
        }),
        prisma.department.upsert({
            where: { code: "SECURITY" },
            update: {},
            create: {
                name: "Public Safety & Security",
                code: "SECURITY",
                agencyId: agency.id,
            },
        }),
    ]);
    console.log(`Created ${departments.length} departments`);
    const infraDept = departments[0];
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { id: "00000000-0000-0000-0000-000000000001" },
            update: {},
            create: {
                id: "00000000-0000-0000-0000-000000000001",
                name: "Road Damage",
                nameSw: "Uharibifu wa Barabara",
                departmentId: infraDept.id,
                description: "Potholes, cracks and road deterioration",
            },
        }),
        prisma.category.upsert({
            where: { id: "00000000-0000-0000-0000-000000000002" },
            update: {},
            create: {
                id: "00000000-0000-0000-0000-000000000002",
                name: "Street Lighting",
                nameSw: "Mwangaza wa Barabarani",
                departmentId: infraDept.id,
                description: "Broken or missing streer lights",
            },
        }),
        prisma.category.upsert({
            where: { id: "00000000-0000-0000-0000-000000000003" },
            update: {},
            create: {
                id: "00000000-0000-0000-0000-000000000003",
                name: "Drainage Issues",
                nameSw: "Masuala ya Mtiririko",
                departmentId: infraDept.id,
                description: "Blocked drains and flooding",
            },
        }),
        prisma.category.upsert({
            where: { id: "00000000-0000-0000-0000-000000000004" },
            update: {},
            create: {
                id: "00000000-0000-0000-0000-000000000004",
                name: "Brdige Problems",
                nameSw: "Matatizo ya Daraja",
                departmentId: infraDept.id,
                description: "Damaged or unsafe bridges",
            },
        }),
    ]);
    console.log(`Created ${categories.length} categories`);
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@civicvoice.local" },
        update: {},
        create: {
            email: "admin@civicvoice.local",
            name: "System Administrator",
            password: hashedPassword,
            role: client_1.Role.SYSTEM_ADMIN,
            emailVerified: true,
        },
    });
    console.log(`Created admin user: ${admin.email}`);
    const citizenPassword = await bcrypt.hash("citizen123", 10);
    const citizen = await prisma.user.upsert({
        where: { email: "citizen@example.com" },
        update: {},
        create: {
            email: "citizen@example.com",
            name: "John Citizen",
            phone: "+254 712345678",
            password: citizenPassword,
            role: client_1.Role.CITIZEN,
            emailVerified: true,
        },
    });
    console.log(`Created test citizen: ${citizen.email}`);
    console.log("Database seeding complete!\n");
    console.log("Test Accounts:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin: admin@civicvoice.local / admin123");
    console.log("Citizen: citizen@example.com / citizen123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}
main()
    .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map