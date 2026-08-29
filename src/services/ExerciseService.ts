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
      console.error("Erro no upload:", error);
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
        id: uuidv4(),
        name: name,
        muscle_group: muscleGroup,
        equipment: equipment,
        video_url: mediaUrl || null,
        created_by: personalId 
      };

      const { error } = await supabase.from('exercises').insert(newExercise);
      if (error) throw new Error(error.message);

      return { success: true, data: newExercise };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}