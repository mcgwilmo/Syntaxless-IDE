# Syntaxless IDE

Frontend for Syntaxless IDE, a natural-language programming interface built with Next.js.

## Getting Started

Install dependencies and create a local environment file:

```bash
npm install
copy .env.example .env.local
```

Set these public frontend values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_BACKEND_URL`

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The backend lives in the private `Syntaxless-IDE-Backend` repository.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deployment

Deploy the frontend to Vercel from this repository. Configure the same `NEXT_PUBLIC_*` variables in Vercel project settings.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
