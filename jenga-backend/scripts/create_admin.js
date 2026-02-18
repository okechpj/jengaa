const { createUser, getUserByEmail } = require("../data/user.data");
require("dotenv").config();

const createFirstAdmin = async () => {
    try {
        console.log("Creating Admin User...");

        const email = "admin@jenga.com";
        const password = "securePassword123";
        const name = "Super Admin";
        const role = "ADMIN";

        // Check if admin already exists
        const existing = await getUserByEmail(email);
        if (existing) {
            console.log(`User with email ${email} already exists.`);
            if (existing.role === "ADMIN") {
                console.log("User is already an ADMIN.");
                process.exit(0);
            } else {
                console.log("User exists but is not an ADMIN. Please update role manually or use a different email.");
                process.exit(1);
            }
        }

        const adminUser = await createUser({
            name,
            email,
            password,
            role
        });

        console.log("Success! Admin created:");
        console.log(`Email: ${adminUser.email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: ${adminUser.role}`);
        console.log(`ID: ${adminUser.id}`);

        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
};

createFirstAdmin();
