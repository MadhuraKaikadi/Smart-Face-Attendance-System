import { supabase } from './supabase';

export async function getOrCreateTeacher(user) {
  if (!user) return null;

  const email = user.primaryEmailAddress?.emailAddress;

  // ✅ ONLY use email
  const { data, error } = await supabase
    .from('teachers')
    .upsert(
      [
        {
          email: email,
          name: user.fullName || 'Teacher'
        }
      ],
      {
        onConflict: 'email'
      }
    )
    .select()
    .single();

  if (error) {
    console.error("Teacher error:", error);
    return null;
  }

  return data;
}