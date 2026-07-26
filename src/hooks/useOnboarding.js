import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase'; 

export function useOnboarding() {
  const [jornada, setJornada] = useState(null);
  const [loadingJornada, setLoadingJornada] = useState(true);
  const [progressoPct, setProgressoPct] = useState(0);

  const missoesChaves = [
    'perfil_completo',
    'meta_definida',
    'primeiro_aluno',
    'primeiro_contrato',
    'primeiro_recebimento'
  ];

  const carregarJornada = useCallback(async () => {
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
        let atualizacoes = {};

        // 1. Perfil Completo (Basta ter um nome salvo)
        if (!dadosJornada.perfil_completo) {
          const { data: pData } = await supabase.from('personals').select('nome').eq('id', session.user.id).single();
          if (pData?.nome) atualizacoes.perfil_completo = true;
        }

        // 2. Meta Definida (Verifica se já existe alguma meta no banco)
        if (!dadosJornada.meta_definida) {
          const { count } = await supabase.from('metas_negocio').select('*', { count: 'exact', head: true }).eq('personal_id', session.user.id);
          if (count > 0) atualizacoes.meta_definida = true;
        }

        // 3. Aluno e Contrato (Verifica se já existe algum aluno nas conexões)
        if (!dadosJornada.primeiro_aluno || !dadosJornada.primeiro_contrato) {
          const { count } = await supabase.from('conexoes').select('*', { count: 'exact', head: true }).eq('personal_id', session.user.id);
          if (count > 0) {
            atualizacoes.primeiro_aluno = true;
            atualizacoes.primeiro_contrato = true;
          }
        }

        // 4. Recebimento (Verifica se já tem algo no histórico financeiro)
        if (!dadosJornada.primeiro_recebimento) {
          const { count } = await supabase.from('historico_financeiro_logs').select('*', { count: 'exact', head: true }).eq('personal_id', session.user.id);
          if (count > 0) atualizacoes.primeiro_recebimento = true;
        }

        // Se o sistema encontrou dados que o usuário já tinha feito, salva no banco e atualiza a tela na hora!
        if (Object.keys(atualizacoes).length > 0) {
          await supabase.from('jornada_onboarding').update(atualizacoes).eq('personal_id', session.user.id);
          dadosJornada = { ...dadosJornada, ...atualizacoes };
        }
      }

      setJornada(dadosJornada);

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

  useEffect(() => { carregarJornada(); }, [carregarJornada]);

  const completarMissao = async (nomeDaMissao) => {
    try {
      if (jornada && jornada[nomeDaMissao] === true) return; 
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { error } = await supabase
        .from('jornada_onboarding')
        .update({ [nomeDaMissao]: true, atualizado_em: new Date() })
        .eq('personal_id', session.user.id);

      if (error) throw error;
      carregarJornada(); 
      return true; 
    } catch (error) {
      console.error(`Erro ao completar missão ${nomeDaMissao}:`, error);
      return false;
    }
  };

  return {
    jornada, loadingJornada, progressoPct, completarMissao, recarregarJornada: carregarJornada
  };
}