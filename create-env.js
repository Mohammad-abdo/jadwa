import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# API Configuration
VITE_API_URL=http://jadwa.teamqeematech.site/api

# Frontend Port (optional, defaults to 5173)
VITE_PORT=5173
`;

const envPath = path.join(__dirname, ".env");

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log("✅ Created marketpro/.env file");
} else {
  console.log("ℹ️  marketpro/.env already exists");
}
