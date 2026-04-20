import i18n from "i18n";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)))

i18n.configure({
  locales: ["en"],
  defaultLocale: "en",
  cookie: "locale",
  directory: __dirname + "/locales",
  directoryPermissions: "755",
  autoReload: true,
  updateFiles: true,
  objectNotation: true,
  api: {
    _: "_", //now req.__ becomes req.__
    __n: "__n", //and req.__n can be called as req.__n
  },
});

export default i18n;
