import bcrypt from "bcryptjs";
import crypto from "crypto";
import db from "./lib/db";

const ADMIN_USERNAME = "admin";
const ADMIN_EMAIL = "admin@voteblock.com";
const ADMIN_PASSWORD = "admin123!";

export async function seedAdmin() {
  const existing: any = db.prepare("SELECT id FROM users WHERE username = ?").get(ADMIN_USERNAME);

  if (existing) {
    db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(existing.id);
    console.log(`User "${ADMIN_USERNAME}" already exists — updated role to admin.`);
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    db.prepare(
      "INSERT INTO users (id, username, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(id, ADMIN_USERNAME, ADMIN_EMAIL, hashedPassword, "admin", createdAt);

    console.log(`Admin user created:`);
    console.log(`  Username: ${ADMIN_USERNAME}`);
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
  }

  console.log("Done.");
}

// Only run directly if called as a script
if (require.main === module) {
  seedAdmin().then(() => process.exit(0));
}