import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createUserStore } from "./services/userStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 3001;
const DATA_FILE =
  process.env.DATA_FILE || path.join(__dirname, "../data/user.json");

const app = createApp({ userStore: createUserStore(DATA_FILE) });

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT} (data: ${DATA_FILE})`);
});
