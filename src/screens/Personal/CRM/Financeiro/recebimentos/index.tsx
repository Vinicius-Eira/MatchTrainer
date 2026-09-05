import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, RefreshControl, StyleSheet, Platform } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../../../../theme/theme";

import { MODALIDADES, STATUS_FILTROS, CATEGORIAS_EXTRA, FORMAS_PAGAMENTO, MOTIVOS_CONGELAMENTO, MESES_NOME, DIAS_SEMANA, StatusFiltro } from './RecebimentosConstants';
import { styles } from './RecebimentosStyles';
import { useRecebimentos } from './useRecebimentos';

export default function Recebimentos({ navigation }: any) {
  const {
    loading, refreshing, nomePersonal, modalDataVisivel, tempAno, tempMes, tempInicio, tempFim,
    modalidadeAtiva, statusAtivo, buscaAlunoExtra, buscaAlunoCongelar, modalBaixaVisivel, faturaSelecionada, valorInput,
    formaPgto, observacao, processando, etapaBaixa, modalExtraVisivel, modalCongelarVisivel, alunoSelecionadoId,
    categoriaExtra, motivoPausa, textoOutroMotivo, diasPausa, dataRetornoCalculada, fabAberto, reciboRef,
    alunosFiltrados, alunosExtraFiltrados, alunosCongelarFiltrados, totalGeral, percRecebido, percAReceber, percAtraso, hoje,
    
    setModalidadeAtiva, setStatusAtivo, abrirCalendarioTopo, selecionarMesCalendario, selecionarDiaCalendario, 
    aplicarFiltroCalendario, setaMudarMesRapido, gerarPdfDaTela, confirmarBaixaManual, salvarReceitaExtra, 
    confirmarCongelamento, compartilharReciboImage, abrirWhatsApp, abrirModalBaixa, setTempAno, setModalDataVisivel, 
    setFabAberto, setModalBaixaVisivel, setValorInput, setFormaPgto, setObservacao, setModalExtraVisivel, setBuscaAlunoExtra, 
    setAlunoSelecionadoId, setCategoriaExtra, setModalCongelarVisivel, setBuscaAlunoCongelar, setMotivoPausa, 
    setTextoOutroMotivo, setDiasPausa, onRefresh, textoHeaderData
  } = useRecebimentos(navigation);

  const renderizarDiasDoMes = () => {
    const daysInMonth = new Date(tempAno, tempMes + 1, 0).getDate();
    const firstDay = new Date(tempAno, tempMes, 1).getDay();
    let days = [];
    for (let i = 0; i < firstDay; i++) { days.push(<View key={`empty-${i}`} style={styles.calDayBox} />); }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(tempAno, tempMes, i);
      let isSelected = false;
      let isBetween = false;
      
      const isToday = currentDate.getDate() === hoje.getDate() && currentDate.getMonth() === hoje.getMonth() && currentDate.getFullYear() === hoje.getFullYear();

      if (tempInicio && tempFim) {
        if (currentDate.getTime() >= tempInicio.getTime() && currentDate.getTime() <= tempFim.getTime()) {
          isSelected = true;
          if (currentDate.getTime() > tempInicio.getTime() && currentDate.getTime() < tempFim.getTime()) isBetween = true;
        }
      } else if (tempInicio) {
        if (currentDate.getDate() === tempInicio.getDate() && currentDate.getMonth() === tempInicio.getMonth() && currentDate.getFullYear() === tempInicio.getFullYear()) isSelected = true;
      }

      days.push(
        <TouchableOpacity key={i} style={[styles.calDayBox, isSelected && styles.calDayBoxSelected, isBetween && styles.calDayBoxBetween, isToday && !isSelected && styles.calDayBoxToday]} onPress={() => selecionarDiaCalendario(i)}>
          <Text style={[styles.calDayText, isSelected && styles.calDayTextSelected, isToday && !isSelected && {color: theme.colors.primary}]}>{i}</Text>
          {isToday && !isSelected && <View style={styles.todayDot} />}
        </TouchableOpacity>
      );
    }
    return days;
  };

  if (loading && !refreshing) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color="#FF6B00" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      <View style={styles.glowTopLeft} /><View style={styles.glowTopRight} />

      <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint="dark" style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="#FFF" style={{marginLeft: -2}} />
          </TouchableOpacity>
          <View><Text style={styles.headerSubtitle}>Financeiro</Text><Text style={styles.headerTitle}>Recebimentos</Text></View>
        </View>

        <View style={styles.monthSelectorCompact}>
          <TouchableOpacity style={styles.monthArrowSm} onPress={() => setaMudarMesRapido(-1)}><Ionicons name="chevron-back" size={16} color="#888" /></TouchableOpacity>
          <TouchableOpacity style={styles.monthCenterSm} onPress={abrirCalendarioTopo}>
            <Ionicons name="calendar-outline" size={14} color="#FF6B00" style={{marginRight: 6}} />
            <Text style={styles.monthTextSm}>{textoHeaderData()}</Text>
            <Ionicons name="chevron-down" size={14} color="#888" style={{marginLeft: 4}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.monthArrowSm} onPress={() => setaMudarMesRapido(1)}><Ionicons name="chevron-forward" size={16} color="#888" /></TouchableOpacity>
        </View>
      </BlurView>

      <View style={styles.stickyFilterContainer}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalidadeWrapper}>
          {MODALIDADES.map((mod) => (
            <TouchableOpacity key={mod} style={[styles.modalidadeBtn, modalidadeAtiva === mod && styles.modalidadeBtnAtiva]} onPress={() => setModalidadeAtiva(mod)}>
              <Text style={[styles.modalidadeText, modalidadeAtiva === mod && styles.modalidadeTextAtiva]}>{mod}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusFilterScroll}>
          {STATUS_FILTROS.map((status) => {
            const isAtivo = statusAtivo === status.id;
            return (
              <TouchableOpacity key={status.id} style={[styles.statusChip, isAtivo && { backgroundColor: status.activeBg, borderColor: status.activeColor }]} onPress={() => setStatusAtivo(status.id as StatusFiltro)}>
                <Text style={[styles.statusText, isAtivo && { color: status.activeColor, fontWeight: "900" }]}>{status.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}>
        <View style={styles.sectionPadding}>
          <View style={styles.heroCard}>
            <LinearGradient colors={["rgba(255, 107, 0, 0.15)", "transparent"]} style={styles.heroGradient} />
            <View style={styles.heroHeader}><Text style={styles.heroTitle}>Receita Filtrada</Text><Ionicons name="wallet" size={22} color="#FF6B00" /></View>
            <Text style={styles.heroValue}>R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
            <View style={styles.stackedBarContainer}>
              <View style={[styles.barSegment, { flex: percRecebido || 1, backgroundColor: percRecebido > 0 ? "#00E676" : "#222" }]} />
              <View style={[styles.barSegment, { flex: percAReceber, backgroundColor: "#333" }]} />
              <View style={[styles.barSegment, { flex: percAtraso, backgroundColor: "#FF3B30" }]} />
            </View>
            <View style={styles.barLegends}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: "#00E676" }]} /><Text style={styles.legendText}>Recebido ({percRecebido.toFixed(0)}%)</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: "#333" }]} /><Text style={styles.legendText}>A Receber ({percAReceber.toFixed(0)}%)</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: "#FF3B30" }]} /><Text style={styles.legendText}>Atraso ({percAtraso.toFixed(0)}%)</Text></View>
            </View>
          </View>
        </View>

        <View style={styles.listContainer}>
          {alunosFiltrados.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIconBg}><Ionicons name="calendar-outline" size={48} color="#FF6B00" /></View>
              <Text style={styles.emptyStateTitle}>Sem Registros</Text>
              <Text style={styles.emptyStateDesc}>Nenhum faturamento encontrado para a combinação de filtros e datas.</Text>
            </View>
          ) : (
            alunosFiltrados.map((item) => {
              const isAtrasado = item.status === "atrasado";
              const isPendente = item.status === "proximo" || item.status === "pendente";
              const isPago = item.status === "pago";

              let badgeBg = "rgba(255, 255, 255, 0.05)";
              let badgeColor = "#AAA";
              let badgeIcon = "information-circle" as any;
              let borderStyle = { borderColor: "#333" as any, backgroundColor: "#121212" as any };

              if (isAtrasado) { badgeBg = "rgba(255, 59, 48, 0.15)"; badgeColor = "#FF3B30"; badgeIcon = "alert-circle"; borderStyle = { borderColor: "rgba(255, 59, 48, 0.4)", backgroundColor: "rgba(255, 59, 48, 0.03)" }; }
              else if (isPendente) { badgeBg = "rgba(255, 215, 0, 0.15)"; badgeColor = "#FFD700"; badgeIcon = "time"; borderStyle = { borderColor: "rgba(255, 215, 0, 0.4)", backgroundColor: "rgba(255, 215, 0, 0.03)" }; }
              else if (isPago) { badgeBg = "rgba(0, 230, 118, 0.1)"; badgeColor = "#00E676"; badgeIcon = "checkmark-circle"; borderStyle = { borderColor: "rgba(0, 230, 118, 0.4)", backgroundColor: "rgba(0, 230, 118, 0.03)" }; }
              else if (item.status === "cancelada") { badgeColor = "#FF3B30"; badgeIcon = "close-circle"; }
              else if (item.status === "isenta" || item.status === "congelada") { badgeColor = "#0A84FF"; badgeIcon = "snow"; badgeBg = "rgba(10, 132, 255, 0.1)"; }

              return (
                <TouchableOpacity key={item.id} style={[styles.studentCard, borderStyle]} activeOpacity={0.8} onPress={() => navigation.navigate("VisaoAluno", { conexaoId: item.plano_id, aluno: item.aluno_dados, statusAtual: "aluno_ativo", personalInfo: { nome: nomePersonal } })}>
                  <View style={styles.cardMain}>
                    <View style={styles.avatarWrapper}><Image source={{ uri: item.foto }} style={styles.avatar} /><View style={[styles.avatarStatusDot, { backgroundColor: badgeColor }]} /></View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.studentName}>{item.nome}</Text>
                      <Text style={styles.studentTenure}>{item.modalidadeUi}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}><Ionicons name={badgeIcon} size={12} color={badgeColor} style={{marginRight: 4}} /><Text style={[styles.statusBadgeText, { color: badgeColor }]}>{item.detalheStatus}</Text></View>
                    </View>
                    <View style={styles.cardFinancial}>
                      <Text style={styles.studentValue}>R$ {item.valor.toFixed(2).replace('.', ',')}</Text>
                      <Text style={styles.studentDate}>{item.isExtra ? 'Venda' : 'Venc'}: <Text style={{color: "#FFF"}}>{item.dataExibicao}</Text></Text>
                    </View>
                  </View>
                  {!['cancelada', 'congelada', 'isenta'].includes(item.status) && (
                    <><View style={styles.cardDivider} />
                      <View style={styles.cardActions}>
                        {isPago ? (
                          <View style={[styles.btnAction, styles.btnActionGhost]}><Ionicons name="checkmark-circle" size={16} color="#00E676" style={{ marginRight: 6 }} /><Text style={[styles.btnActionText, { color: "#00E676" }]}>Pago</Text></View>
                        ) : (
                          <>
                            <TouchableOpacity style={[styles.btnAction, isAtrasado ? styles.btnActionWhatsApp : styles.btnActionWarning]} onPress={() => abrirWhatsApp(item.telefone, item.nome, item.valor, item.status)}><MaterialCommunityIcons name={isAtrasado ? "whatsapp" : "bell"} size={18} color={isAtrasado ? "#FFF" : "#000"} style={{ marginRight: 6 }} /><Text style={[styles.btnActionText, { color: isAtrasado ? "#FFF" : "#000" }]}>{isAtrasado ? "Cobrar" : "Lembrar"}</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.btnAction, styles.btnActionOutline, {flex: 0.4}]} onPress={() => abrirModalBaixa(item)}><Ionicons name="checkmark-circle-outline" size={20} color="#00E676" /></TouchableOpacity>
                          </>
                        )}
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              );
            })
          )}

          <TouchableOpacity style={styles.btnCentralPdf} onPress={gerarPdfDaTela}>
            <LinearGradient colors={["#1A1A1A", "#111"]} style={styles.btnPdfGradient}><Ionicons name="document-text" size={24} color="#FF6B00" style={{marginRight: 16}} /><View><Text style={{color: "#FFF", fontWeight: "900", fontSize: 16, letterSpacing: -0.5}}>Baixar Relatório (PDF)</Text><Text style={{color: "rgba(255,255,255,0.6)", fontSize: 12}}>Exportar as informações exibidas na tela</Text></View></LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalDataVisivel} animationType="fade" transparent>
        <View style={styles.modalDataOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalDataCard}>
            <View style={styles.modalDataHeader}>
              <TouchableOpacity onPress={() => setTempAno(tempAno - 1)} style={styles.modalDataArrow}><Ionicons name="chevron-back" size={24} color="#FFF" /></TouchableOpacity>
              <Text style={styles.modalDataAno}>{tempAno}</Text>
              <TouchableOpacity onPress={() => setTempAno(tempAno + 1)} style={styles.modalDataArrow}><Ionicons name="chevron-forward" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
              {MESES_NOME.map((mes, index) => {
                const isActive = tempMes === index;
                return (
                  <TouchableOpacity key={mes} style={[styles.modalDataMesBtn, isActive && styles.modalDataMesBtnAtivo]} onPress={() => selecionarMesCalendario(index)}>
                    <Text style={[styles.modalDataMesText, isActive && styles.modalDataMesTextAtivo]}>{mes}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.calWeekRow}>{DIAS_SEMANA.map((d, i) => <Text key={i} style={styles.calWeekText}>{d}</Text>)}</View>
            <View style={styles.calDaysGrid}>{renderizarDiasDoMes()}</View>
            <Text style={{color: "#666", fontSize: 11, textAlign: 'center', marginTop: 15}}>Selecione o Dia Inicial e Final, ou 2x no mesmo dia.</Text>
            <View style={{flexDirection: 'row', marginTop: 24, gap: 10}}>
              <TouchableOpacity style={[styles.modalDataCloseBtn, {flex:1}]} onPress={() => setModalDataVisivel(false)}><Text style={styles.modalDataCloseText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalDataCloseBtn, {flex: 1, backgroundColor: "#FF6B00", borderColor: "#FF6B00"}]} onPress={aplicarFiltroCalendario}><Text style={[styles.modalDataCloseText, {color: "#000"}]}>Aplicar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {fabAberto && <TouchableOpacity style={styles.fabOverlay} activeOpacity={1} onPress={() => setFabAberto(false)}><BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} /></TouchableOpacity>}
      {fabAberto && (
        <View style={styles.fabMenu}>
          <TouchableOpacity style={styles.fabMenuItem} onPress={() => { setFabAberto(false); navigation.navigate('AdicionarAluno'); }}><Text style={styles.fabMenuText}>Novo Contrato</Text><View style={[styles.fabMenuIcon, {backgroundColor: "#0A84FF"}]}><Ionicons name="person-add" size={18} color="#FFF"/></View></TouchableOpacity>
          <TouchableOpacity style={styles.fabMenuItem} onPress={() => { setFabAberto(false); setValorInput(""); setObservacao(""); setAlunoSelecionadoId(null); setBuscaAlunoExtra(""); setModalExtraVisivel(true); }}><Text style={styles.fabMenuText}>Receita Extra</Text><View style={[styles.fabMenuIcon, {backgroundColor: "#00E676"}]}><Ionicons name="cash" size={18} color="#FFF"/></View></TouchableOpacity>
          <TouchableOpacity style={styles.fabMenuItem} onPress={() => { setFabAberto(false); setAlunoSelecionadoId(null); setBuscaAlunoCongelar(""); setTextoOutroMotivo(""); setModalCongelarVisivel(true); }}><Text style={styles.fabMenuText}>Congelar Plano</Text><View style={[styles.fabMenuIcon, {backgroundColor: "#FFD60A"}]}><Ionicons name="snow" size={18} color="#000"/></View></TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => setFabAberto(!fabAberto)}><LinearGradient colors={["#FF8C00", "#FF6B00"]} style={styles.fabGradient}><MaterialCommunityIcons name={fabAberto ? "close" : "plus"} size={30} color="#FFF" /></LinearGradient></TouchableOpacity>

      <Modal visible={modalBaixaVisivel} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            {etapaBaixa === 1 && (
              <>
                <View style={styles.modalHeader}><Text style={styles.modalTitle}>Registrar Pagamento</Text><TouchableOpacity onPress={() => setModalBaixaVisivel(false)} style={styles.modalCloseBtn}><Ionicons name="close" size={24} color="#888" /></TouchableOpacity></View>
                {faturaSelecionada && (<View style={styles.modalAlunoInfo}><Image source={{ uri: faturaSelecionada.foto }} style={styles.modalAvatar} /><View><Text style={styles.modalAlunoNome}>{faturaSelecionada.nome}</Text><Text style={styles.modalAlunoDetalhe}>Venc: {faturaSelecionada.dataExibicao}</Text></View></View>)}
                <Text style={styles.inputLabel}>Valor Recebido (R$)</Text><View style={styles.inputBox}><Text style={styles.inputPrefix}>R$</Text><TextInput style={styles.input} keyboardType="numeric" value={valorInput} onChangeText={setValorInput} cursorColor="#FF6B00" /></View>
                <Text style={styles.inputLabel}>Forma de Pagamento</Text><View style={styles.chipContainer}>{FORMAS_PAGAMENTO.map(f => (<TouchableOpacity key={f} style={[styles.chipBtn, formaPgto === f && styles.chipBtnAtiva]} onPress={() => setFormaPgto(f)}><Text style={[styles.chipText, formaPgto === f && styles.chipTextAtiva]}>{f}</Text></TouchableOpacity>))}</View>
                <Text style={styles.inputLabel}>Observações (Opcional)</Text><View style={[styles.inputBox, { height: 80, paddingTop: 12 }]}><TextInput style={[styles.input, { textAlignVertical: 'top' }]} multiline value={observacao} onChangeText={setObservacao} cursorColor="#FF6B00" /></View>
                <TouchableOpacity style={[styles.btnConfirmar, processando && { opacity: 0.7 }]} onPress={confirmarBaixaManual} disabled={processando}>{processando ? <ActivityIndicator color="#000" /> : <><Ionicons name="checkmark-circle" size={20} color="#000" style={{ marginRight: 8 }} /><Text style={styles.btnConfirmarText}>Confirmar</Text></>}</TouchableOpacity>
              </>
            )}
            {etapaBaixa === 2 && (
              <View style={{alignItems: 'center', width: '100%'}}>
                <Text style={{color: "#FFF", fontSize: 24, fontFamily: theme.fonts.title, marginBottom: 20}}>Sucesso! 🎉</Text>
                <View ref={reciboRef} collapsable={false} style={styles.reciboPremiumContainer}>
                  <LinearGradient colors={["#1A1A1A", "#0D0D0D"]} style={[StyleSheet.absoluteFill, { borderRadius: 24 }]} />
                  <Ionicons name="shield-checkmark" size={150} color="rgba(255, 255, 255, 0.03)" style={styles.watermarkIcon} />
                  <View style={styles.reciboPremiumHeader}><View style={styles.iconSuccessBg}><Ionicons name="checkmark-sharp" size={28} color="#00E676" /></View><Text style={styles.reciboPremiumTitle}>RECIBO DIGITAL</Text><Text style={styles.reciboPremiumSubtitle}>{new Date().toLocaleString('pt-BR')}</Text></View>
                  <View style={styles.dashedLine} />
                  <View style={styles.reciboPremiumBody}>
                    <View style={styles.reciboPremiumRow}><Text style={styles.reciboPremiumLabel}>De (Aluno)</Text><Text style={styles.reciboPremiumValue}>{faturaSelecionada?.nome}</Text></View>
                    <View style={styles.reciboPremiumRow}><Text style={styles.reciboPremiumLabel}>Para</Text><Text style={styles.reciboPremiumValue}>{nomePersonal}</Text></View>
                    <View style={styles.reciboPremiumRow}><Text style={styles.reciboPremiumLabel}>Método</Text><Text style={styles.reciboPremiumValue}>{formaPgto}</Text></View>
                    <View style={styles.reciboPremiumRow}><Text style={styles.reciboPremiumLabel}>Vencimento</Text><Text style={styles.reciboPremiumValue}>{faturaSelecionada?.dataExibicao}</Text></View>
                  </View>
                  <View style={styles.dashedLine} />
                  <View style={styles.reciboPremiumFooter}><Text style={styles.reciboPremiumTotalLabel}>TOTAL PAGO</Text><Text style={styles.reciboPremiumTotalValue}>R$ {valorInput}</Text></View>
                  <View style={styles.reciboPremiumBottomBrand}><Ionicons name="flash" size={12} color={theme.colors.primary} style={{marginRight: 4}} /><Text style={styles.reciboPremiumBrandText}>Gerado por MatchTrainer</Text></View>
                </View>
                <TouchableOpacity style={styles.btnSharePremium} onPress={compartilharReciboImage} activeOpacity={0.8}><LinearGradient colors={["#0A84FF", "#0066CC"]} style={styles.btnShareGradient}><Ionicons name="share-social" size={20} color="#FFF" style={{ marginRight: 8 }} /><Text style={styles.btnShareText}>Compartilhar Recibo</Text></LinearGradient></TouchableOpacity>
                <TouchableOpacity style={styles.btnVoltarRecibo} onPress={() => setModalBaixaVisivel(false)}><Text style={styles.btnVoltarReciboText}>Voltar ao Painel</Text></TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalExtraVisivel} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Nova Receita Extra</Text><TouchableOpacity onPress={() => setModalExtraVisivel(false)} style={styles.modalCloseBtn}><Ionicons name="close" size={24} color="#888" /></TouchableOpacity></View>
            
            <Text style={styles.inputLabel}>Buscar Aluno</Text>
            <View style={styles.searchBarBox}><Ionicons name="search" size={18} color="#666" style={{marginRight: 8}} /><TextInput style={styles.input} placeholder="Digite o nome do aluno..." placeholderTextColor="#666" value={buscaAlunoExtra} onChangeText={setBuscaAlunoExtra} /></View>
            <View style={styles.listAlunosScroll}>
              {alunosExtraFiltrados.length === 0 ? (<Text style={{color: '#666', textAlign: 'center', marginTop: 20}}>Nenhum aluno encontrado.</Text>) : (
                alunosExtraFiltrados.map(a => (<TouchableOpacity key={a.id} style={[styles.alunoListItem, alunoSelecionadoId === a.id && styles.alunoListItemAtivo]} onPress={() => setAlunoSelecionadoId(a.id)}><Image source={{uri: a.foto}} style={styles.alunoListAvatar}/><Text style={[styles.alunoListNome, alunoSelecionadoId === a.id && {color: "#FF6B00", fontWeight: 'bold'}]} numberOfLines={1}>{a.nome}</Text>{alunoSelecionadoId === a.id && <Ionicons name="checkmark-circle" size={20} color="#FF6B00" />}</TouchableOpacity>))
              )}
            </View>

            <Text style={styles.inputLabel}>Categoria da Venda</Text><View style={styles.chipContainer}>{CATEGORIAS_EXTRA.map(cat => (<TouchableOpacity key={cat} style={[styles.chipBtn, categoriaExtra === cat && styles.chipBtnAtiva]} onPress={() => setCategoriaExtra(cat)}><Text style={[styles.chipText, categoriaExtra === cat && styles.chipTextAtiva]}>{cat}</Text></TouchableOpacity>))}</View>
            <Text style={styles.inputLabel}>Valor (R$)</Text><View style={styles.inputBox}><Text style={styles.inputPrefix}>R$</Text><TextInput style={styles.input} keyboardType="numeric" value={valorInput} onChangeText={setValorInput} cursorColor="#FF6B00" /></View>
            <TouchableOpacity style={[styles.btnConfirmar, processando && { opacity: 0.7 }]} onPress={salvarReceitaExtra} disabled={processando}>{processando ? <ActivityIndicator color="#000" /> : <><Ionicons name="cash" size={20} color="#000" style={{ marginRight: 8 }} /><Text style={styles.btnConfirmarText}>Adicionar ao Caixa</Text></>}</TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalCongelarVisivel} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Congelar Contrato</Text><TouchableOpacity onPress={() => setModalCongelarVisivel(false)} style={styles.modalCloseBtn}><Ionicons name="close" size={24} color="#888" /></TouchableOpacity></View>
            
            <Text style={styles.inputLabel}>Buscar Aluno</Text>
            <View style={styles.searchBarBox}><Ionicons name="search" size={18} color="#666" style={{marginRight: 8}} /><TextInput style={styles.input} placeholder="Digite o nome do aluno..." placeholderTextColor="#666" value={buscaAlunoCongelar} onChangeText={setBuscaAlunoCongelar} /></View>
            <View style={styles.listAlunosScroll}>
              {alunosCongelarFiltrados.length === 0 ? (<Text style={{color: '#666', textAlign: 'center', marginTop: 20}}>Nenhum aluno encontrado.</Text>) : (
                alunosCongelarFiltrados.map(aluno => (<TouchableOpacity key={aluno.id} style={[styles.alunoListItem, alunoSelecionadoId === aluno.id && {borderColor: "#0A84FF", backgroundColor: "rgba(10,132,255,0.1)"}]} onPress={() => setAlunoSelecionadoId(aluno.id)}><Image source={{uri: aluno.foto}} style={styles.alunoListAvatar}/><Text style={[styles.alunoListNome, alunoSelecionadoId === aluno.id && {color: "#0A84FF", fontWeight: 'bold'}]} numberOfLines={1}>{aluno.nome}</Text>{alunoSelecionadoId === aluno.id && <Ionicons name="checkmark-circle" size={20} color="#0A84FF" />}</TouchableOpacity>))
              )}
            </View>

            <Text style={styles.inputLabel}>Motivo da Pausa</Text>
            <View style={styles.chipContainer}>{MOTIVOS_CONGELAMENTO.map(mot => (<TouchableOpacity key={mot} style={[styles.chipBtn, motivoPausa === mot && {borderColor: "#0A84FF", backgroundColor: "rgba(10,132,255,0.15)"}]} onPress={() => setMotivoPausa(mot)}><Text style={[styles.chipText, motivoPausa === mot && {color: "#0A84FF"}]}>{mot}</Text></TouchableOpacity>))}</View>
            
            {motivoPausa === "Outro" && (
              <View style={[styles.inputBox, { height: 60, marginBottom: 20 }]}><TextInput style={styles.input} placeholder="Descreva o motivo (Ex: Cirurgia)..." placeholderTextColor="#666" value={textoOutroMotivo} onChangeText={setTextoOutroMotivo} cursorColor="#0A84FF" /></View>
            )}

            <View style={{flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 24}}><View style={{flex: 1}}><Text style={styles.inputLabel}>Dias Pausados</Text><View style={[styles.inputBox, {marginBottom: 0}]}><TextInput style={styles.input} keyboardType="numeric" value={diasPausa} onChangeText={setDiasPausa} cursorColor="#0A84FF" /><Text style={styles.inputPrefix}>Dias</Text></View></View><View style={{flex: 1, backgroundColor: "#1A1A1A", padding: 12, borderRadius: 16, borderWidth: 1, borderColor: "#333", height: 56, marginTop: 22, justifyContent: 'center'}}><Text style={{color: "#888", fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold'}}>Retorno em</Text><Text style={{color: "#0A84FF", fontSize: 16, fontWeight: 'bold'}}>{dataRetornoCalculada}</Text></View></View>
            <TouchableOpacity style={[styles.btnConfirmar, {backgroundColor: "#0A84FF", shadowColor: "#0A84FF"}, processando && { opacity: 0.7 }]} onPress={confirmarCongelamento} disabled={processando}>{processando ? <ActivityIndicator color="#FFF" /> : <><Ionicons name="snow" size={20} color="#FFF" style={{ marginRight: 8 }} /><Text style={[styles.btnConfirmarText, {color: "#FFF"}]}>Congelar Plano</Text></>}</TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}