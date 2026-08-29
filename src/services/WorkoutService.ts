import { supabase } from './supabase'; 
import { DraftDay } from '../store/useWorkoutCreatorStore';

export class WorkoutService {

  static async publishWorkout(
    studentId: string | null, 
    programName: string, 
    objective: string, 
    days: DraftDay[],
    existingProgramId: string | null = null,
    isTemplate: boolean = false,
    generalObservation: string = ''
  ) {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) throw new Error("Usuário não autenticado.");
      
      const personalId = session.user.id;
      let programId = existingProgramId;

      if (programId) {
        const { error: updateError } = await supabase.from('training_programs').update({
          name: programName, 
          objective: objective, 
          is_template: isTemplate,
          general_observation: generalObservation 
        }).eq('id', programId);
        
        if (updateError) throw updateError;

        await supabase.from('workout_days').delete().eq('program_id', programId);
      } else {
        const { data: programData, error: programError } = await supabase
          .from('training_programs')
          .insert({ 
            personal_id: personalId, 
            student_id: studentId, 
            name: programName || 'Novo Treino', 
            objective: objective || '', 
            is_active: true,
            is_template: isTemplate,
            general_observation: generalObservation 
          })
          .select('id').single();

        if (programError) throw new Error(`Erro ao criar programa: ${programError.message}`);
        programId = programData.id;
      }

      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        
        if (day.exercises.length === 0) continue; 

        const { data: dayData, error: dayError } = await supabase
          .from('workout_days')
          .insert({
            program_id: programId,
            name: day.name,
            order_index: i
          })
          .select('id')
          .single();

        if (dayError) throw new Error(`Erro ao criar dia ${day.name}: ${dayError.message}`);
        
        const exercisesToInsert = day.exercises.map((ex, exIndex) => ({
          workout_day_id: dayData.id,
          exercise_id: ex.exercise_id,
          group_code: ex.group_code || null,
          sets: ex.sets,
          reps_target: ex.reps_target,
          weight_target: ex.weight_target || null,
          rest_seconds: ex.rest_seconds,
          technique: ex.technique || null,
          
          public_note: ex.public_note || null,
          private_note: ex.private_note || null,
          target_rpe: ex.target_rpe || null,
          custom_media_url: ex.custom_media_url || null
        }));

        const { error: exercisesError } = await supabase
          .from('planned_exercises')
          .insert(exercisesToInsert);

        if (exercisesError) throw new Error(`Erro ao vincular exercícios: ${exercisesError.message}`);
      }

      return { success: true, programId };

    } catch (error: any) {
      console.error("Falha na persistência do treino:", error);
      return { success: false, error: error.message };
    }
  }

  static async getStudentWorkouts(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('training_programs')
        .select(`
          *,
          workout_days (
            id,
            planned_exercises ( id )
          )
        `)
        .eq('student_id', studentId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Erro no Supabase: ${error.message}`);

      return { success: true, data };
    } catch (error: any) {
      console.error("Falha ao buscar treinos:", error);
      return { success: false, error: error.message, data: null };
    }
  }

  static async getWorkoutById(programId: string) {
    try {
      const { data, error } = await supabase
        .from('training_programs')
        .select(`
          *,
          workout_days (
            *,
            planned_exercises (
              *,
              exercises ( name, thumbnail_url, gif_url, muscle_group ) 
            )
          )
        `)
        .eq('id', programId)
        .single();

      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message, data: null };
    }
  }
  static async getGlobalPresets() {
    try {
      const { data, error } = await supabase
        .from('training_programs')
        .select('id, name, objective')
        .eq('is_template', true)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error("Erro ao buscar presets:", error);
      return { success: false, error: error.message };
    }
  }
}