"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServerClient } from "~/utilities/supabase/server";

export async function logout() {
  const supabase = await supabaseServerClient();

  // Sign out the user
  await supabase.auth.signOut();

  // Revalidate all paths to clear cached auth state
  revalidatePath("/", "layout");

  // Redirect to home page
  redirect("/");
}
