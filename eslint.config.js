import astro from "eslint-plugin-astro"
import { defineConfig, globalIgnores } from "eslint/config"

export default defineConfig([
  globalIgnores(["dist", ".astro"]),
  ...astro.configs.recommended,
])
