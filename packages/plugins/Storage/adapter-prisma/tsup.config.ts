import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  dts: {
    compilerOptions: {
      // This silences the TS6.0+ deprecation errors in the DTS build
      ignoreDeprecations: "6.0" 
    }
  },
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".mjs",
    };
  },
  sourcemap: true,
  clean: true,
});
