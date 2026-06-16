This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Backend `aeg-core`

The app consumes the `aeg-core` REST API through the shared fetch client in
`lib/api.ts`. Configure the backend URL with environment variables; the app no
longer falls back to a hardcoded upstream.

```bash
# Preferred for the new backend
AEG_CORE_API_URL=https://aeg-core.example.com
NEXT_PUBLIC_AEG_CORE_API_URL=https://aeg-core.example.com

# Backward-compatible aliases also supported
API_UPSTREAM_URL=https://aeg-core.example.com
NEXT_PUBLIC_API_URL=https://aeg-core.example.com

# Defaults to /api. Set to an empty string only if aeg-core has no path prefix.
NEXT_PUBLIC_API_PATH_PREFIX=/api

# Optional when the browser should call this app and Next.js should proxy to aeg-core.
NEXT_PUBLIC_USE_API_PROXY=true

# Optional when the public same-origin path differs from the upstream API path.
API_UPSTREAM_PATH_PREFIX=/api
```

In Vercel, `NEXT_PUBLIC_USE_API_PROXY` defaults to `true`, so browser requests
go to the same origin and `next.config.ts` rewrites them to `AEG_CORE_API_URL`.
For local development you can either enable the proxy or expose
`NEXT_PUBLIC_AEG_CORE_API_URL` directly if CORS is allowed by `aeg-core`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
