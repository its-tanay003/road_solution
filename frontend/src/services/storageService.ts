import { supabase } from '../lib/supabaseClient';

export const uploadCrashPhoto = async (file: File, incidentId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${incidentId}/${Date.now()}.${fileExt}`;
  const filePath = `crash-photos/${fileName}`;

  const { error } = await supabase.storage
    .from('incidents')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('incidents')
    .getPublicUrl(filePath);

  return publicUrl;
};
