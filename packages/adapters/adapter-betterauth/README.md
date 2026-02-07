Starter Adapter Template
=========================

This package is a template to scaffold new adapter packages that integrate with Meeovi layers.

Usage
-----

- From this package directory, run:

```
npm run create -- <short-name>
```

- Example:

```
npm run create -- shop
```

This creates a new adapter package at `../adapter-shop` (relative to this template) with the package name `@mframework/adapter-shop`.

What you get
------------

- A ready-to-edit adapter package with `index.ts` and `src/` files for `transport`, `auth`, `commerce`, `search`, and `utils`.
- Placeholders in files are marked as `__PACKAGE_NAME__` and `__SHORT_NAME__` to help you customize.

How to edit
-----------

1. Open the new package folder.
2. Replace placeholder endpoints and logic in `src/*` with your adapter's API.
3. Update `package.json` fields as needed.
4. Run `npm run build` inside the new adapter package to compile TypeScript.

Notes
-----

- The scaffold script performs simple text replacements; review generated files before publishing.
- This template is intentionally minimal — implement only the methods your backend supports.

CLI Flags
---------

The starter CLI supports interactive and non-interactive modes. Flags:

- `--name` / `-n`: Adapter short name (e.g. `shop`).
- `--desc` / `-d`: Description for the generated package.
- `--layers` / `-l`: Comma-separated list of layers to scaffold (e.g. `commerce,auth`).
- `--dest`: Destination path for the generated package.
- `--no-install`: Skip running `npm install` after scaffolding.

Examples
--------

- Interactive:

```
npm run create:interactive
```

- Non-interactive (with install):

```
npm run create:interactive -- --name shop --desc "Shop adapter" --layers commerce,auth
```

- Non-interactive (skip install):

```
npm run create:interactive -- --name shop --layers commerce --no-install
```

Repo-level wrapper
------------------

From the repo root you can use the provided script:

```
scripts/create-adapter --name shop --layers commerce --no-install
```


Note: adapter credentials and endpoints can be centrally configured in your main app's `.env` file. See the repository `.env.example` for recommended variable names.
