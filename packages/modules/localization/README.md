This package runs a `postinstall` script that generates translation status files.

The `postinstall` is now guarded: it will skip automatically if required runtime
dependencies (for example `flat` or `tsx`) are not present. This prevents root
`npm install` from failing in environments where workspace dependency resolution
has not yet populated nested package deps.

To run the script manually after installing dependencies, from this folder run:

npm run prepare-translation-status

If you maintain workspace-level installs and prefer the script to always run,
ensure the package's dependencies are installed before running `npm install` at
the repo root, or remove the guard in `package.json`.
