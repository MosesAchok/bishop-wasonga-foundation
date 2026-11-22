
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import connectDB from "../config/db.js";
import Administrator from "../models/Administrator.js";

dotenv.config();

const rl = readline.createInterface({ input, output });

const createSuperAdmin = async () => {
  try {
    // Connect before accessing the database
    await connectDB();

    const existingAdmin = await Administrator.exists({});

    if (existingAdmin) {
      console.log(
        "An administrator already exists. Initial setup is not allowed."
      );
      return;
    }

    const name = (await rl.question("Super Admin full name: ")).trim();

    const email = (
      await rl.question("Super Admin email address: ")
    ).trim().toLowerCase();

    const phone = (
      await rl.question("Super Admin phone number: ")
    ).trim();

    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "Name, email, and password are required."
      );
    }

    if (
      name.length > 100 ||
      email.length > 150 ||
      phone.length > 20
    ) {
      throw new Error("One or more fields exceed the allowed length.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }

    if (password.length < 12) {
      throw new Error("Password must contain at least 12 characters.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const superAdmin = await Administrator.create({
      id: "ADM001",
      name,
      email,
      phone,
      passwordHash,
      role: "Super Admin",
      status: "Active",
    });

    console.log("\nSuper Admin account created successfully.");
    console.log(`Name: ${superAdmin.name}`);
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Role: ${superAdmin.role}`);
    console.log("Password securely hashed.");
  } catch (error) {
    console.error("\nSuper Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    delete process.env.SUPER_ADMIN_PASSWORD;
    rl.close();
    await mongoose.disconnect();
  }
};

createSuperAdmin();
