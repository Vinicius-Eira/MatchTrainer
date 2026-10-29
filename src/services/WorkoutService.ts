import { supabase } from './supabase'; 
import { DraftWeek } from '../store/useWorkoutCreatorStore';

export class WorkoutService {

  static async publishWorkout(
    studentId: string | null, programName: string, objective: string, 
    weeks: DraftWeek[], existingProgramId: string | null = null, isTemplate: boolean = false
  ) {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) throw new Error("Usuário não autenticado.");
      
      const personalId = session.user.id;
      let programId = existingProgramId;

      const allExerciseIds = weeks
        .flatMap(w => w.days.flatMap(d => d.exercises.map(ex => ex.exercise_id || ex.global_exercise_id)))
        .filter(id => id && typeof id === 'string' && id.includes('-'));

      const validExerciseIds = new Set<string>();
      
      if (allExerciseIds.length > 0) {
        const { data: exData } = await supabase.from('exercises').select('id').in('id', allExerciseIds);
        if (exData) exData.forEach(ex => validExerciseIds.add(ex.id));
        
        const { data: globalData } = await supabase.from('global_exercises').select('id').in('id', allExerciseIds);
        if (globalData) globalData.forEach(ex => validExerciseIds.add(ex.id));
      }

      if (programId) {
        const { error: updateError } = await supabase.from('training_programs').update({ name: programName, objective: objective, is_template: isTemplate }).eq('id', programId);
        if (updateError) throw updateError;
        await supabase.from('training_weeks').delete().eq('program_id', programId);
      } else {
        const { data: programData, error: programError } = await supabase.from('training_programs').insert({ personal_id: personalId, student_id: studentId, name: programName || 'Novo Treino', objective: objective || '', is_active: true, is_template: isTemplate }).select('id').single();
        if (programError) throw new Error(programError.message);
        programId = programData.id;
      }

      for (let w = 0; w < weeks.length; w++) {
        const week = weeks[w];
        const { data: weekData, error: weekError } = await supabase.from('training_weeks').insert({ program_id: programId, name: week.name, general_notes: week.generalObservation || null }).select('id').single();
        if (weekError) throw new Error(weekError.message);

        for (let d = 0; d < week.days.length; d++) {
          const day = week.days[d];
          if (day.exercises.length === 0) continue; 

          const { data: dayData, error: dayError } = await supabase.from('workout_days').insert({ program_id: programId, week_id: weekData.id, name: day.name, order_index: d }).select('id').single();
          if (dayError) throw new Error(dayError.message);
          
          const exercisesToInsert = day.exercises.map((ex) => {
            const hasPersonalId = ex.exercise_id ? validExerciseIds.has(ex.exercise_id) : false;
            const hasGlobalId = ex.global_exercise_id ? validExerciseIds.has(ex.global_exercise_id) : false;
            const isValid = hasPersonalId || hasGlobalId;

            return {
              workout_day_id: dayData.id,
              exercise_id: hasPersonalId ? ex.exercise_id : null,
              global_exercise_id: hasGlobalId ? ex.global_exercise_id : null,
              group_code: ex.group_code || null,
              sets: ex.sets, reps_target: ex.reps_target, weight_target: ex.weight_target || null, rest_seconds: ex.rest_seconds, technique: ex.technique || null,
              public_note: !isValid ? `[${ex.exercise_name || 'Exercício Customizado'}] ${ex.public_note || ''}`.trim() : (ex.public_note || null),
              private_note: ex.private_note || null, target_rpe: ex.target_rpe || null, custom_media_url: ex.custom_media_url || null
            };
          });

          const { error: exercisesError } = await supabase.from('planned_exercises').insert(exercisesToInsert);
          if (exercisesError) throw new Error(exercisesError.message);
        }
      }
      return { success: true, programId };
    } catch (error: any) { return { success: false, error: error.message }; }
  }

  static async getStudentWorkouts(studentId: string) {
    try {
      const { data, error } = await supabase.from('training_programs').select(`*, training_weeks (id, name, workout_days (id, planned_exercises ( id )))`).eq('student_id', studentId).eq('is_active', true).order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (error: any) { return { success: false, error: error.message, data: null }; }
  }

  static async getWorkoutById(programId: string) {
    try {
      const { data, error } = await supabase
        .from('training_programs')
        .select(`
          *,
          training_weeks (
            *,
            workout_days (
              *,
              planned_exercises (
                *,
                exercises ( id, name, thumbnail_url, gif_url, video_url, muscle_group ),
                global_exercises ( id, name, gif_url, muscle_group ) 
              )
            )
          ),
          workout_days (
            *,
            planned_exercises (
              *,
              exercises ( id, name, thumbnail_url, gif_url, video_url, muscle_group ),
              global_exercises ( id, name, gif_url, muscle_group )
            )
          )
        `)
        .eq('id', programId)
        .single();

      if (error) throw new Error(error.message);
      return { success: true, data };
    } catch (error: any) {
      console.error("ERRO AO BUSCAR FICHA:", error.message);
      return { success: false, error: error.message, data: null };
    }
  }

  static async getGlobalPresets() {
    try {
      const { data, error } = await supabase.from('training_programs').select('id, name, objective').eq('is_template', true).order('created_at', { ascending: false });
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) { return { success: false, error: error.message }; }
  }
}