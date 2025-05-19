import { execSync } from "child_process";

const isVercel = process.env.VERCEL === "1" || process.env.CI === "true";

if (isVercel) {
  console.log("Running `prisma migrate deploy` (CI/Vercel detected)");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} else {
  console.log("Skipping `prisma migrate deploy` (local build)");
}