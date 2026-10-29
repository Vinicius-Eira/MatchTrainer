import { supabase } from './supabase';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export class ExerciseService {
  
  static async uploadExerciseMedia(fileUri: string, isVideo: boolean = true) {
    try {
      const extension = isVideo ? 'mp4' : 'gif';
      const fileName = `${uuidv4()}-${Date.now()}.${extension}`;
      const filePath = `midias/${fileName}`; 

      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      const arrayBuffer = decode(base64);

      const { error: uploadError } = await supabase.storage
        .from('exercise-media')
        .upload(filePath, arrayBuffer, {
          contentType: isVideo ? 'video/mp4' : 'image/gif',
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase
        .storage
        .from('exercise-media')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async updateExerciseMedia(exerciseId: string, mediaUrl: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuário não autenticado.");

      const { data, error } = await supabase
        .from('exercises')
        .update({ 
          video_url: mediaUrl, 
          gif_url: mediaUrl
        })
        .eq('id', exerciseId)
        .eq('personal_id', session.user.id)
        .select();

      if (error) throw new Error(error.message);
      
      if (!data || data.length === 0) {
        let original = null;
        
        const { data: globalEx } = await supabase.from('global_exercises').select('*').eq('id', exerciseId).single();
        if (globalEx) {
            original = globalEx;
        } else {
            const { data: otherEx } = await supabase.from('exercises').select('*').eq('id', exerciseId).single();
            if (otherEx) original = otherEx;
        }

        if (original) {
            const { error: cloneError } = await supabase.from('exercises').insert({
                name: original.name,
                muscle_group: original.muscle_group || original.primaryMuscle,
                equipment: original.equipment,
                video_url: mediaUrl,
                gif_url: mediaUrl,
                personal_id: session.user.id
            });
            if (cloneError) throw cloneError;
            return { success: true };
        }
        throw new Error("Erro de permissão ou exercício não encontrado.");
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async createCustomExercise(
    name: string, 
    muscleGroup: string, 
    equipment: string, 
    mediaUrl: string = ''
  ) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuário não autenticado.");
      
      const personalId = session.user.id;
      const newExercise = {
        name: name,
        muscle_group: muscleGroup,
        equipment: equipment,
        video_url: mediaUrl || null,
        gif_url: mediaUrl || null,
        personal_id: personalId 
      };

      const { error } = await supabase.from('exercises').insert(newExercise);
      if (error) throw new Error(error.message);

      return { success: true, data: newExercise };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}