import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export type MissaoChave =
  | 'perfil_completo'
  | 'meta_definida'
  | 'primeiro_aluno'
  | 'primeiro_contrato'
  | 'primeiro_recebimento';

export interface JornadaOnboarding {
  id?: string;
  personal_id: string;
  perfil_completo: boolean;
  meta_definida: boolean;
  primeiro_aluno: boolean;
  primeiro_contrato: boolean;
  primeiro_recebimento: boolean;
  atualizado_em?: string | Date;
}

export interface UseOnboardingReturn {
  jornada: JornadaOnboarding | null;
  loadingJornada: boolean;
  progressoPct: number;
  completarMissao: (nomeDaMissao: MissaoChave) => Promise<boolean>;
  recarregarJornada: () => Promise<void>;
}

export function useOnboarding(): UseOnboardingReturn {
  const [jornada, setJornada] = useState<JornadaOnboarding | null>(null);
  const [loadingJornada, setLoadingJornada] = useState<boolean>(true);
  const [progressoPct, setProgressoPct] = useState<number>(0);

  const missoesChaves: MissaoChave[] = [
    'perfil_completo',
    'meta_definida',
    'primeiro_aluno',
    'primeiro_contrato',
    'primeiro_recebimento'
  ];

  const carregarJornada = useCallback(async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      let { data: dadosJornada, error: erroJornada } = await supabase
        .from('jornada_onboarding')
        .select('*')
        .eq('personal_id', session.user.id)
        .maybeSingle();

      if (erroJornada) throw erroJornada;

      if (!dadosJornada) {
        const { data: novaJornada, error: insertError } = await supabase
          .from('jornada_onboarding')
          .insert([{ personal_id: session.user.id }])
          .select()
          .single();
          
        if (insertError) {
          if (insertError.code === '23505') {
             const { data: jornadaExistente } = await supabase
              .from('jornada_onboarding')
              .select('*')
              .eq('personal_id', session.user.id)
              .single();
             dadosJornada = jornadaExistente;
          } else {
             throw insertError;
          }
        } else {
          dadosJornada = novaJornada;
        }
      }

      if (dadosJornada) {
        let atualizacoes: Partial<Record<MissaoChave, boolean>> = {};

        if (!dadosJornada.perfil_completo) {
          const { data: pData } = await supabase
            .from('personals')
            .select('nome')
            .eq('id', session.user.id)
            .single();
          if (pData?.nome) atualizacoes.perfil_completo = true;
        }

        if (!dadosJornada.meta_definida) {
          const { count } = await supabase
            .from('metas_negocio')
            .select('*', { count: 'exact', head: true })
            .eq('personal_id', session.user.id);
          if (count && count > 0) atualizacoes.meta_definida = true;
        }

        if (!dadosJornada.primeiro_aluno || !dadosJornada.primeiro_contrato) {
          const { count } = await supabase
            .from('conexoes')
            .select('*', { count: 'exact', head: true })
            .eq('personal_id', session.user.id);
          if (count && count > 0) {
            atualizacoes.primeiro_aluno = true;
            atualizacoes.primeiro_contrato = true;
          }
        }

        if (!dadosJornada.primeiro_recebimento) {
          const { count } = await supabase
            .from('historico_financeiro_logs')
            .select('*', { count: 'exact', head: true })
            .eq('personal_id', session.user.id);
          if (count && count > 0) atualizacoes.primeiro_recebimento = true;
        }

        if (Object.keys(atualizacoes).length > 0) {
          await supabase
            .from('jornada_onboarding')
            .update(atualizacoes)
            .eq('personal_id', session.user.id);
          
          dadosJornada = { ...dadosJornada, ...atualizacoes };
        }
      }

      setJornada(dadosJornada as JornadaOnboarding);

      if (dadosJornada) {
          let concluidas = 0;
          missoesChaves.forEach(missao => {
            if (dadosJornada[missao]) concluidas++;
          });
          setProgressoPct(Math.round((concluidas / missoesChaves.length) * 100));
      }

    } catch (error) {
      console.error("Erro ao carregar jornada de onboarding:", error);
    } finally {
      setLoadingJornada(false);
    }
  }, []);

  useEffect(() => { 
    carregarJornada(); 
  }, [carregarJornada]);

  const completarMissao = async (nomeDaMissao: MissaoChave): Promise<boolean> => {
    try {
      if (jornada && jornada[nomeDaMissao] === true) return true; 
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;

      const { error } = await supabase
        .from('jornada_onboarding')
        .update({ [nomeDaMissao]: true, atualizado_em: new Date().toISOString() })
        .eq('personal_id', session.user.id);

      if (error) throw error;
      
      await carregarJornada(); 
      return true; 
    } catch (error) {
      console.error(`Erro ao completar missão ${nomeDaMissao}:`, error);
      return false;
    }
  };

  return {
    jornada, 
    loadingJornada, 
    progressoPct, 
    completarMissao, 
    recarregarJornada: carregarJornada
  };
}