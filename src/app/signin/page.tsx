import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Sign in · Happy Plants" };

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div>
          <div className="mx-auto mb-4 text-5xl">🪴</div>
          <h1 className="text-3xl font-semibold tracking-tight">Happy Plants</h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            Keep track of watering and fertilizing your houseplants.
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <Button type="submit" size="lg" className="w-full">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#fff"
                d="M21.35 11.1H12v2.9h5.35c-.23 1.5-1.7 4.4-5.35 4.4-3.22 0-5.85-2.67-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.46C16.7 3.94 14.55 3 12 3 6.98 3 3 6.97 3 12s3.98 9 9 9c5.2 0 8.64-3.65 8.64-8.79 0-.59-.06-1.04-.14-1.49z"
              />
            </svg>
            Continue with Google
          </Button>
        </form>
      </div>
    </main>
  );
}
