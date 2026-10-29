import { create } from 'zustand';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export interface DraftExercise {
  id: string; 
  exercise_id?: string | null;             
  global_exercise_id?: string | null; 
  exercise_name: string; 
  thumbnail_url?: string;
  gif_url?: string;
  video_url?: string;
  group_code: string;
  sets: number | string; 
  reps_target: string;
  weight_target: string;
  rest_seconds: number | string; 
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

export interface DraftWeek {
  id: string;
  name: string;
  generalObservation: string;
  days: DraftDay[];
}

interface WorkoutCreatorState {
  programId: string | null; 
  programName: string;
  objective: string;
  weeks: DraftWeek[];
  activeWeekId: string | null;
  activeDayId: string | null;
  
  setProgramName: (name: string) => void;
  setObjective: (objective: string) => void;
  setProgramInfo: (name: string, objective: string) => void;
  setActiveWeek: (weekId: string) => void;
  addWeek: (nameArg?: string) => void;
  removeWeek: (weekId: string) => void;
  setGeneralObservation: (weekId: string, obs: string) => void; 
  setActiveDay: (dayId: string) => void;
  addDay: (weekId: string, nameArg?: string) => void; 
  removeDay: (weekId: string, dayId: string) => void;
  addExerciseToActiveDay: (exerciseFromLibrary: any) => void;
  addExercise: (weekId: string, dayId: string, exercise: DraftExercise) => void;
  updateExercise: (weekId: string, dayId: string, draftExerciseId: string, field: string, value: string | number) => void;
  removeExercise: (weekId: string, dayId: string, draftExerciseId: string) => void;
  reorderExercises: (weekId: string, dayId: string, newExercises: DraftExercise[]) => void;
  hydrateWorkout: (name: string, objective: string, weeks: DraftWeek[], programId?: string | null) => void; 
  reset: () => void; 
}

const createInitialDay = () => ({ id: uuidv4(), name: 'Treino A', exercises: [] });
const createInitialWeek = () => ({ id: uuidv4(), name: 'Semana 1', generalObservation: '', days: [createInitialDay()] });

export const useWorkoutCreatorStore = create<WorkoutCreatorState>((set, get) => ({
  programId: null,
  programName: '',
  objective: '',
  weeks: [createInitialWeek()],
  activeWeekId: null, 
  activeDayId: null,

  setProgramName: (name) => set({ programName: name }),
  setObjective: (objective) => set({ objective }),
  setProgramInfo: (name, objective) => set({ programName: name, objective }),
  
  setActiveWeek: (weekId) => set((state) => {
    const week = state.weeks.find(w => w.id === weekId);
    return { activeWeekId: weekId, activeDayId: week && week.days.length > 0 ? week.days[0].id : null };
  }),

  addWeek: (nameArg) => set((state) => {
    const nextNumber = state.weeks.length + 1; 
    const finalName = nameArg || `Semana ${nextNumber}`;
    const newWeek = { id: uuidv4(), name: finalName, generalObservation: '', days: [createInitialDay()] };
    return { weeks: [...state.weeks, newWeek], activeWeekId: newWeek.id, activeDayId: newWeek.days[0].id };
  }),

  removeWeek: (weekId) => set((state) => {
    const newWeeks = state.weeks.filter((week) => week.id !== weekId);
    if (newWeeks.length === 0) newWeeks.push(createInitialWeek());
    return { weeks: newWeeks, activeWeekId: state.activeWeekId === weekId ? newWeeks[0].id : state.activeWeekId, activeDayId: state.activeWeekId === weekId ? newWeeks[0].days[0].id : state.activeDayId };
  }),

  setGeneralObservation: (weekId, obs) => set((state) => ({
    weeks: state.weeks.map(w => w.id === weekId ? { ...w, generalObservation: obs } : w)
  })),

  setActiveDay: (dayId) => set({ activeDayId: dayId }),
  
  addDay: (weekId, nameArg) => set((state) => {
    const week = state.weeks.find(w => w.id === weekId);
    if (!week) return state;
    const nextLetter = String.fromCharCode(65 + week.days.length); 
    const finalName = nameArg || `Treino ${nextLetter}`;
    const newDay = { id: uuidv4(), name: finalName, exercises: [] };
    return { weeks: state.weeks.map(w => w.id === weekId ? { ...w, days: [...w.days, newDay] } : w), activeDayId: newDay.id };
  }),

  removeDay: (weekId, dayId) => set((state) => {
      const week = state.weeks.find(w => w.id === weekId);
      if (!week) return state;
      const newDays = week.days.filter((day) => day.id !== dayId);
      return { weeks: state.weeks.map(w => w.id === weekId ? { ...w, days: newDays } : w), activeDayId: state.activeDayId === dayId ? (newDays[0]?.id || null) : state.activeDayId };
  }),

  addExerciseToActiveDay: (exerciseFromLibrary) => set((state) => {
    const { activeWeekId, activeDayId, weeks } = state;
    if (!activeWeekId || !activeDayId) return state;

    const isGlobal = !exerciseFromLibrary.personal_id;
    const realId = exerciseFromLibrary.id;

    const newDraftExercise: DraftExercise = {
      id: uuidv4(),
      exercise_id: isGlobal ? null : exerciseFromLibrary.id,
      global_exercise_id: isGlobal ? exerciseFromLibrary.id : null,
      
      exercise_name: exerciseFromLibrary.name || exerciseFromLibrary.exercise_name,
      thumbnail_url: exerciseFromLibrary.thumbnail_url || exerciseFromLibrary.gif_url || exerciseFromLibrary.video_url || '', 
      gif_url: exerciseFromLibrary.gif_url || '',
      video_url: exerciseFromLibrary.video_url || '',
      group_code: exerciseFromLibrary.primaryMuscle || exerciseFromLibrary.muscle_group || exerciseFromLibrary.group_code || 'Geral',
      sets: '3',
      reps_target: '10-12',
      weight_target: '',
      rest_seconds: '60',
      technique: 'Normal',
      public_note: '',
      private_note: '',
      target_rpe: '',
      custom_media_url: ''
    };

    return {
      weeks: weeks.map(week => week.id === activeWeekId ? { ...week, days: week.days.map(day => day.id === activeDayId ? { ...day, exercises: [...day.exercises, newDraftExercise] } : day) } : week)
    };
  }),

  addExercise: (weekId, dayId, exercise) => set((state) => ({ weeks: state.weeks.map(week => week.id === weekId ? { ...week, days: week.days.map(day => day.id === dayId ? { ...day, exercises: [...day.exercises, exercise] } : day) } : week) })),
  updateExercise: (weekId, dayId, draftExerciseId, field, value) => set((state) => ({ weeks: state.weeks.map(week => week.id === weekId ? { ...week, days: week.days.map(day => day.id === dayId ? { ...day, exercises: day.exercises.map(ex => ex.id === draftExerciseId ? { ...ex, [field]: value } : ex) } : day) } : week) })),
  removeExercise: (weekId, dayId, draftExerciseId) => set((state) => ({ weeks: state.weeks.map(week => week.id === weekId ? { ...week, days: week.days.map(day => day.id === dayId ? { ...day, exercises: day.exercises.filter(ex => ex.id !== draftExerciseId) } : day) } : week) })),
  reorderExercises: (weekId, dayId, newExercises) => set((state) => ({ weeks: state.weeks.map(week => week.id === weekId ? { ...week, days: week.days.map(day => day.id === dayId ? { ...day, exercises: newExercises } : day) } : week) })),

  hydrateWorkout: (name, objective, weeks, programId) => {
    const finalWeeks = weeks.length > 0 ? weeks : [createInitialWeek()];
    const firstWeek = finalWeeks[0];
    const firstDay = firstWeek.days.length > 0 ? firstWeek.days[0] : null;
    set({ programId: programId || null, programName: name, objective, weeks: finalWeeks, activeWeekId: firstWeek.id, activeDayId: firstDay?.id || null });
  },

  reset: () => {
    const initWeek = createInitialWeek();
    set({ programId: null, programName: '', objective: '', weeks: [initWeek], activeWeekId: initWeek.id, activeDayId: initWeek.days[0].id });
  }
}));