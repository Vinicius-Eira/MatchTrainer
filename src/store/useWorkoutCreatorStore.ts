import { create } from 'zustand';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Exercise } from '../domain/entities/Exercise';

export interface DraftExercise {
  id: string; 
  exercise_id: string; 
  exercise_name: string; 
  thumbnail_url?: string;
  gif_url?: string;
  video_url?: string;
  group_code: string;
  sets: number;
  reps_target: string;
  weight_target: string;
  rest_seconds: number;
  technique: string;
  public_note?: string;      
  private_note?: string;     
  target_rpe?: string;       
  custom_media_url?: string;
}

export interface DraftDay {
  id: string;
  name: string; 
  exercises: DraftExercise[];
}

interface WorkoutCreatorState {
  programId: string | null; 
  programName: string;
  objective: string;
  generalObservation: string;
  days: DraftDay[];
  activeDayId: string | null;
  
  setProgramName: (name: string) => void;
  setObjective: (objective: string) => void;
  setProgramInfo: (name: string, objective: string) => void;
  setGeneralObservation: (obs: string) => void; 
  setActiveDay: (dayId: string) => void;
  
  addDay: (nameArg?: any) => void; 
  removeDay: (dayId: string) => void;
  
  addExerciseToActiveDay: (exerciseFromLibrary: Exercise) => void;
  
  addExercise: (dayId: string, exercise: DraftExercise) => void;
  
  updateExercise: (dayId: string, draftExerciseId: string, updates: Partial<DraftExercise>) => void;
  removeExercise: (dayId: string, draftExerciseId: string) => void;
  
  moveExerciseUp: (dayId: string, draftExerciseId: string) => void;
  moveExerciseDown: (dayId: string, draftExerciseId: string) => void;
  
  reorderExercises: (dayId: string, newExercises: DraftExercise[]) => void;
  
  hydrateWorkout: (name: string, objective: string, days: DraftDay[], programId?: string | null, generalObservation?: string) => void; 
  reset: () => void; 
}

export const useWorkoutCreatorStore = create<WorkoutCreatorState>((set, get) => ({
  programId: null,
  programName: '',
  objective: '',
  generalObservation: '', 
  days: [
    { id: uuidv4(), name: 'Treino A', exercises: [] } 
  ],
  activeDayId: null,

  setProgramName: (name) => set({ programName: name }),
  setObjective: (objective) => set({ objective }),
  setProgramInfo: (name, objective) => set({ programName: name, objective }),
  setGeneralObservation: (obs) => set({ generalObservation: obs }), 
  setActiveDay: (dayId) => set({ activeDayId: dayId }),
  
  addDay: (nameArg) => set((state) => {
    const nextLetter = String.fromCharCode(65 + state.days.length); 
    const finalName = typeof nameArg === 'string' ? nameArg : `Treino ${nextLetter}`;
    
    return {
      days: [...state.days, { id: uuidv4(), name: finalName, exercises: [] }]
    };
  }),

  removeDay: (dayId) => set((state) => ({
    days: state.days.filter((day) => day.id !== dayId),
    activeDayId: state.activeDayId === dayId ? null : state.activeDayId
  })),

  addExerciseToActiveDay: (exerciseFromLibrary) => set((state) => {
    const { activeDayId, days } = state;
    const targetDayId = activeDayId || days[0]?.id;
    if (!targetDayId) return state;

    const newDraftExercise: DraftExercise = {
      id: uuidv4(),
      exercise_id: exerciseFromLibrary.id,
      exercise_name: exerciseFromLibrary.name,
      thumbnail_url: exerciseFromLibrary.gif_url || exerciseFromLibrary.thumbnail_url || (exerciseFromLibrary as any).thumbnailUrl, 
      gif_url: exerciseFromLibrary.gif_url || (exerciseFromLibrary as any).gifUrl,
      group_code: exerciseFromLibrary.muscle_group || '',
      sets: 3,
      reps_target: '10-12',
      weight_target: '',
      rest_seconds: 60,
      technique: 'Normal',
      public_note: '',
      private_note: '',
      target_rpe: '',
      custom_media_url: ''
    };

    return {
      days: days.map(day => 
        day.id === targetDayId 
          ? { ...day, exercises: [...day.exercises, newDraftExercise] }
          : day
      )
    };
  }),


  addExercise: (dayId, exercise) => set((state) => ({
    days: state.days.map((day) => 
      day.id === dayId 
        ? { ...day, exercises: [...day.exercises, exercise] } 
        : day
    )
  })),

  updateExercise: (dayId, draftExerciseId, updates) => set((state) => ({
    days: state.days.map(day => 
      day.id === dayId
        ? {
            ...day,
            exercises: day.exercises.map(ex => 
              ex.id === draftExerciseId ? { ...ex, ...updates } : ex
            )
          }
        : day
    )
  })),

  removeExercise: (dayId, draftExerciseId) => set((state) => ({
    days: state.days.map(day => 
      day.id === dayId
        ? { ...day, exercises: day.exercises.filter(ex => ex.id !== draftExerciseId) }
        : day
    )
  })),

  moveExerciseUp: (dayId, draftExerciseId) => set((state) => {
    const day = state.days.find(d => d.id === dayId);
    if (!day) return state;
    const index = day.exercises.findIndex(e => e.id === draftExerciseId);
    if (index <= 0) return state; 

    const newExercises = [...day.exercises];
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];

    return {
      days: state.days.map(d => d.id === dayId ? { ...d, exercises: newExercises } : d)
    };
  }),

  moveExerciseDown: (dayId, draftExerciseId) => set((state) => {
    const day = state.days.find(d => d.id === dayId);
    if (!day) return state;
    const index = day.exercises.findIndex(e => e.id === draftExerciseId);
    if (index === -1 || index >= day.exercises.length - 1) return state; 

    const newExercises = [...day.exercises];
    [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];

    return {
      days: state.days.map(d => d.id === dayId ? { ...d, exercises: newExercises } : d)
    };
  }),

  reorderExercises: (dayId, newExercises) => set((state) => ({
    days: state.days.map((day) => 
      day.id === dayId ? { ...day, exercises: newExercises } : day
    )
  })),

  hydrateWorkout: (name, objective, days, programId, generalObservation) => set({
    programId: programId || null,
    programName: name,
    objective,
    generalObservation: generalObservation || '', 
    days: days.length > 0 ? days : [{ id: uuidv4(), name: 'Treino A', exercises: [] }],
    activeDayId: days.length > 0 ? days[0].id : null
  }),

  reset: () => set({
    programId: null, 
    programName: '',
    objective: '',
    generalObservation: '', 
    days: [{ id: uuidv4(), name: 'Treino A', exercises: [] }],
    activeDayId: null
  })
}));