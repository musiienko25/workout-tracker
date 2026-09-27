import { supabase } from "@/lib/supabase";

export async function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithGoogle() {
  const redirectTo =
    typeof window === "undefined" ? undefined : `${window.location.origin}/`;
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        prompt: "select_account",
      },
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
