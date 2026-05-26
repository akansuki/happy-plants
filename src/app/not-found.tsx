import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-5xl" aria-hidden>🥀</div>
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="text-stone-500">That plant doesn&apos;t live here.</p>
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-xl bg-leaf-600 px-4 text-white hover:bg-leaf-700"
      >
        Back to plants
      </Link>
    </main>
  );
}
