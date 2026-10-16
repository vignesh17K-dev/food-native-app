import { supabase } from "../../supabase.config";
import { supabaseVerify } from "../../supabase.verify.config";

export async function changePassword(
  oldPassword: string,
  newPassword: string,
  user: any,
) {

  if (!user?.email) {
    throw new Error("Unable to get the logged-in user.");
  }

  const { error: signInError } = await supabaseVerify.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  });

  debugger;

  if (signInError) {
    throw new Error("Your current password is incorrect.");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  debugger;

  if (updateError) {
    throw updateError;
  }

  return { success: true };
}
