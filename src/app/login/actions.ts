"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "~/utilities/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  console.log("🔐 Attempting login for:", data.email);

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error("❌ Login error:", error);
    redirect(`/error?message=${encodeURIComponent(error.message)}`);
  }

  console.log("✅ Login successful");
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  console.log("📝 Attempting signup for:", data.email);

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.error("❌ Signup error:", error);
    redirect(`/error?message=${encodeURIComponent(error.message)}`);
  }

  console.log("✅ Signup successful - check email for confirmation");
  revalidatePath("/", "layout");
  redirect("/");
}
