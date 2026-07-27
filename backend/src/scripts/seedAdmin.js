require("dotenv").config();
const readline = require("readline");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

async function main() {
  await connectDB();

  const name = await ask("Admin full name: ");
  const email = await ask("Admin email: ");
  const password = await ask("Admin password (min 8 characters): ");

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.error("An admin with this email already exists.");
    process.exit(1);
  }

  const passwordHash = await Admin.hashPassword(password);
  const admin = await Admin.create({ name, email, passwordHash, role: "admin" });

  console.log("Admin account created:", admin.email);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed script failed:", err.message);
  process.exit(1);
});
