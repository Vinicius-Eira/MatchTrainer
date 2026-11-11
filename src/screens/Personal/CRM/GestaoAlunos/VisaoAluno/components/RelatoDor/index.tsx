import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../../../../../services/supabase'; 
import { localStyles } from './styles';

export interface AlertaDorAlunoProps {
  alunoId: string;
  onResolvido?: () => void;
}

const STORAGE_KEY_DORES_LIDAS = '@dores_resolvidas_ids';

export function AlertaDorAluno({ alunoId, onResolvido }: AlertaDorAlunoProps) {
  const [relatos, setRelatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisivel, setModalVisivel] = useState(false);
  const [relatoSelecionado, setRelatoSelecionado] = useState<any>(null);

  useEffect(() => {
    const buscarDores = async () => {
      try {
        const quinzeDiasAtras = new Date();
        quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);

        const salvosJson = await AsyncStorage.getItem(STORAGE_KEY_DORES_LIDAS);
        const idsJaResolvidos: string[] = salvosJson ? JSON.parse(salvosJson) : [];

        const { data: dores, error } = await supabase
          .from('treinos_execucoes_dores')
          .select('*')
          .eq('aluno_id', alunoId)
          .gte('created_at', quinzeDiasAtras.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (!dores || dores.length === 0) return setRelatos([]);

        const doresNaoLidas = dores.filter((dor) => !idsJaResolvidos.includes(String(dor.id)));

        if (doresNaoLidas.length === 0) return setRelatos([]);

        const relatosComNomes = await Promise.all(doresNaoLidas.map(async (dor) => {
           let treinoFormatado = "Treino Desconhecido";
           let exercicioNome = "Exercício Não Encontrado";

           if (dor.treino_id) {
              const { data: dia } = await supabase
                .from('workout_days')
                .select('name, week_id, planned_exercises(*)')
                .eq('id', dor.treino_id)
                .maybeSingle();

              if (dia) {
                  let nomeSemana = "";
                  if (dia.week_id) {
                      const { data: week } = await supabase
                        .from('training_weeks')
                        .select('name')
                        .eq('id', dia.week_id)
                        .maybeSingle();
                      if (week) nomeSemana = `${week.name} - `;
                  }
                  treinoFormatado = `${nomeSemana}${dia.name}`;

                  let idRealDoExercicio = dor.exercicio_id; 
                  if (dia.planned_exercises && dia.planned_exercises.length > 0) {
                      const planejado = dia.planned_exercises.find((pe: any) => pe.id === dor.exercicio_id);
                      if (planejado) idRealDoExercicio = planejado.exercise_id || planejado.global_exercise_id || dor.exercicio_id;
                  }

                  const { data: exPersonal } = await supabase
                    .from('exercises')
                    .select('*')
                    .eq('id', idRealDoExercicio)
                    .maybeSingle();

                  if (exPersonal && (exPersonal.name || exPersonal.nome || exPersonal.title)) {
                      exercicioNome = exPersonal.name || exPersonal.nome || exPersonal.title;
                  } else {
                      const { data: exGlobal } = await supabase
                        .from('global_exercises')
                        .select('*')
                        .eq('id', idRealDoExercicio)
                        .maybeSingle();
                      if (exGlobal && (exGlobal.name || exGlobal.nome || exGlobal.title)) {
                          exercicioNome = exGlobal.name || exGlobal.nome || exGlobal.title;
                      }
                  }
              }
           }

           return { ...dor, treino_formatado: treinoFormatado, exercicio_formatado: exercicioNome };
        }));

        setRelatos(relatosComNomes);
      } catch (err) {
        console.log("Erro na busca:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (alunoId) buscarDores();
  }, [alunoId]);

  const abrirDetalhes = (relato: any) => {
    setRelatoSelecionado(relato);
    setModalVisivel(true);
  };

  const resolverDor = async () => {
    const idsParaResolver = relatos.map((r) => String(r.id));

    setModalVisivel(false);
    setRelatos([]);
    if (onResolvido) onResolvido();

    try {
      const salvosJson = await AsyncStorage.getItem(STORAGE_KEY_DORES_LIDAS);
      const idsJaResolvidos: string[] = salvosJson ? JSON.parse(salvosJson) : [];
      const novaLista = Array.from(new Set([...idsJaResolvidos, ...idsParaResolver]));
      await AsyncStorage.setItem(STORAGE_KEY_DORES_LIDAS, JSON.stringify(novaLista));

      await supabase
        .from('treinos_execucoes_dores')
        .delete()
        .eq('aluno_id', alunoId);
    } catch (err) {
      console.log("Erro ao arquivar alerta:", err);
    }
  };

  if (loading || relatos.length === 0) return null;
  const dorAtual = relatos[0];

  return (
    <>
      <TouchableOpacity style={localStyles.redFlagCard} activeOpacity={0.8} onPress={() => abrirDetalhes(dorAtual)}>
        <View style={localStyles.iconContainer}>
          <Ionicons name="warning" size={24} color="#EF4444" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={localStyles.redFlagTitle}>ALERTA DE DOR E DESCONFORTO</Text>
          <Text style={localStyles.redFlagSub}>
            Desconforto relatado em <Text style={{ color: '#FFF', fontWeight: '700' }}>{dorAtual.exercicio_formatado}</Text>. Toque para analisar.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#EF4444" />
      </TouchableOpacity>

      <Modal visible={modalVisivel} transparent animationType="slide">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            
            <View style={localStyles.dragHandle} />

            <View style={localStyles.header}>
               <View style={localStyles.iconContainer}>
                  <Ionicons name="medical" size={24} color="#EF4444" />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={localStyles.modalTitle}>Análise do Relato</Text>
                  <Text style={localStyles.modalDate}>
                    Data do registro: {relatoSelecionado?.created_at ? new Date(relatoSelecionado.created_at).toLocaleDateString('pt-BR') : '--/--/----'}
                  </Text>
               </View>
               <TouchableOpacity onPress={() => setModalVisivel(false)} style={localStyles.closeBtn}>
                  <Ionicons name="close" size={22} color="#A1A1AA" />
               </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
               
               <View style={localStyles.exerciseCard}>
                  <View style={localStyles.cardHeaderRow}>
                    <Ionicons name="barbell-outline" size={16} color="#EF4444" />
                    <Text style={[localStyles.panelLabel, { color: '#EF4444', marginBottom: 0, marginLeft: 6 }]}>EXERCÍCIO AFETADO</Text>
                  </View>
                  <Text style={localStyles.exerciseValue} numberOfLines={2}>
                    {relatoSelecionado?.exercicio_formatado}
                  </Text>
               </View>

               <View style={localStyles.topPanelRow}>
                 <View style={localStyles.panelBox}>
                    <View style={localStyles.cardHeaderRow}>
                      <Ionicons name="calendar-outline" size={15} color="#A1A1AA" />
                      <Text style={[localStyles.panelLabel, { marginBottom: 0, marginLeft: 6 }]}>TREINO / SESSÃO</Text>
                    </View>
                    <Text style={localStyles.panelValueTexto} numberOfLines={2}>
                      {relatoSelecionado?.treino_formatado}
                    </Text>
                 </View>
               </View>

               <View style={localStyles.descBox}>
                 <View style={localStyles.cardHeaderRow}>
                   <Ionicons name="chatbox-ellipses-outline" size={16} color="#FF5500" />
                   <Text style={[localStyles.panelLabel, { color: '#FF5500', marginBottom: 0, marginLeft: 6 }]}>O QUE O ALUNO SENTIU</Text>
                 </View>
                 <Text style={localStyles.descText}>
                   {relatoSelecionado?.descricao || "O aluno não forneceu detalhes adicionais."}
                 </Text>
               </View>

               <Text style={localStyles.resolveInfo}>
                 Ao marcar como resolvido, este alerta sairá da tela. Caso necessário, acesse a Gestão de Fichas para ajustar o treino.
               </Text>

            </ScrollView>

            <TouchableOpacity style={localStyles.resolveBtn} onPress={resolverDor} activeOpacity={0.75}>
               <Ionicons name="checkmark-circle-outline" size={20} color="#FF5500" style={{ marginRight: 8 }} />
               <Text style={localStyles.resolveBtnText}>CIENTE / MARCAR COMO RESOLVIDO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}