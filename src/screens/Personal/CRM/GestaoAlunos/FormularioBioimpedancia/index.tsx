import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBioimpedancia } from './useBioimpedancia';

const InputBio = ({ label, valor, onChangeText, placeholder, unidade, flex = 1 }: any) => (
    <View style={{ flex, marginHorizontal: 6, marginBottom: 16 }}>
        <Text style={{ color: '#888', fontSize: 10, fontWeight: '800', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 }}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: 12, paddingHorizontal: 15, height: 55 }}>
            <TextInput
                style={{ flex: 1, color: '#FFF', fontSize: 18, fontWeight: 'bold' }}
                placeholder={placeholder}
                placeholderTextColor="#444"
                keyboardType="numeric"
                value={valor}
                onChangeText={onChangeText}
            />
            {unidade && <Text style={{ color: '#666', fontSize: 14, fontWeight: '800' }}>{unidade}</Text>}
        </View>
    </View>
);

const SessaoCard = ({ titulo, icone, children }: any) => (
    <View style={{ backgroundColor: '#0A0A0A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1C1C1F', marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#1A1A1A', paddingBottom: 12 }}>
            <Ionicons name={icone} size={20} color="#FF6B00" style={{ marginRight: 8 }} />
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>{titulo}</Text>
        </View>
        {children}
    </View>
);

export function Bioimpedancia({ route, navigation }: any) {
    const v = useBioimpedancia(route, navigation);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#050505' }}>
            
            {v.loadingIA && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5,5,5,0.95)', zIndex: 999, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#FF6B00" />
                    <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 25 }}>Analisando Exame...</Text>
                    <Text style={{ color: '#FF6B00', fontSize: 13, marginTop: 12, textAlign: 'center', marginHorizontal: 40 }}>
                        Nossa IA está lendo os dados da bioimpedância. Isso leva poucos segundos.
                    </Text>
                </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' }}>
                <TouchableOpacity onPress={v.cancelar} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                    <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>Avaliação Física</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    
                    <View style={{ backgroundColor: 'rgba(255, 107, 0, 0.1)', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255, 107, 0, 0.3)' }}>
                        <Ionicons name="information-circle" size={24} color="#FF6B00" />
                        <Text style={{ color: '#FF6B00', fontSize: 12, marginLeft: 12, flex: 1, lineHeight: 18, fontWeight: '500' }}>
                            Revise os dados antes de salvar. Campos deixados em branco serão ocultados automaticamente nos gráficos do aluno.
                        </Text>
                    </View>

                    <SessaoCard titulo="Composição Corporal" icone="pie-chart">
                        <View style={{ flexDirection: 'row', marginHorizontal: -6 }}>
                            <InputBio label="PESO TOTAL" placeholder="0.0" unidade="kg" valor={v.peso} onChangeText={v.setPeso} />
                            <InputBio label="GORDURA" placeholder="0.0" unidade="%" valor={v.gorduraPercentual} onChangeText={v.setGorduraPercentual} />
                        </View>
                        <View style={{ flexDirection: 'row', marginHorizontal: -6 }}>
                            <InputBio label="MASSA MUSCULAR" placeholder="0.0" unidade="kg" valor={v.massaMuscular} onChangeText={v.setMassaMuscular} />
                            <InputBio label="MASSA GORDURA" placeholder="0.0" unidade="kg" valor={v.massaGordura} onChangeText={v.setMassaGordura} />
                        </View>
                        <View style={{ flexDirection: 'row', marginHorizontal: -6, marginBottom: -16 }}>
                            <InputBio label="ÁGUA CORPORAL" placeholder="0.0" unidade="L" valor={v.aguaCorporal} onChangeText={v.setAguaCorporal} />
                            <InputBio label="GORDURA VISCERAL" placeholder="0" unidade="lvl" valor={v.visceral} onChangeText={v.setVisceral} />
                        </View>
                    </SessaoCard>

                    <SessaoCard titulo="Metabolismo" icone="flame">
                        <View style={{ flexDirection: 'row', marginHorizontal: -6, marginBottom: -16 }}>
                            <InputBio label="TAXA METABÓLICA BASAL (TMB)" placeholder="Ex: 1850" unidade="kcal" valor={v.tmb} onChangeText={v.setTmb} />
                        </View>
                    </SessaoCard>

                    <SessaoCard titulo="Análise Segmentar: Gordura" icone="body">
                        <View style={{ flexDirection: 'row', marginHorizontal: -6 }}>
                            <InputBio label="BRAÇO ESQ." placeholder="0.0" unidade="kg" valor={v.gordBracoEsq} onChangeText={v.setGordBracoEsq} />
                            <InputBio label="BRAÇO DIR." placeholder="0.0" unidade="kg" valor={v.gordBracoDir} onChangeText={v.setGordBracoDir} />
                        </View>
                        <View style={{ flexDirection: 'row', marginHorizontal: -6 }}>
                            <InputBio label="TRONCO" placeholder="0.0" unidade="kg" valor={v.gordTronco} onChangeText={v.setGordTronco} />
                        </View>
                        <View style={{ flexDirection: 'row', marginHorizontal: -6, marginBottom: -16 }}>
                            <InputBio label="PERNA ESQ." placeholder="0.0" unidade="kg" valor={v.gordPernaEsq} onChangeText={v.setGordPernaEsq} />
                            <InputBio label="PERNA DIR." placeholder="0.0" unidade="kg" valor={v.gordPernaDir} onChangeText={v.setGordPernaDir} />
                        </View>
                    </SessaoCard>

                    <SessaoCard titulo="Análise Segmentar: Massa Magra" icone="fitness">
                        <View style={{ flexDirection: 'row', marginHorizontal: -6 }}>
                            <InputBio label="BRAÇO ESQ." placeholder="0.0" unidade="kg" valor={v.massaBracoEsq} onChangeText={v.setMassaBracoEsq} />
                            <InputBio label="BRAÇO DIR." placeholder="0.0" unidade="kg" valor={v.massaBracoDir} onChangeText={v.setMassaBracoDir} />
                        </View>
                        <View style={{ flexDirection: 'row', marginHorizontal: -6 }}>
                            <InputBio label="TRONCO" placeholder="0.0" unidade="kg" valor={v.massaTronco} onChangeText={v.setMassaTronco} />
                        </View>
                        <View style={{ flexDirection: 'row', marginHorizontal: -6, marginBottom: -16 }}>
                            <InputBio label="PERNA ESQ." placeholder="0.0" unidade="kg" valor={v.massaPernaEsq} onChangeText={v.setMassaPernaEsq} />
                            <InputBio label="PERNA DIR." placeholder="0.0" unidade="kg" valor={v.massaPernaDir} onChangeText={v.setMassaPernaDir} />
                        </View>
                    </SessaoCard>

                    <TouchableOpacity 
                        style={{ 
                            backgroundColor: 'rgba(255, 107, 0, 0.05)', 
                            paddingVertical: 18, 
                            borderRadius: 16, 
                            alignItems: 'center', 
                            borderWidth: 1, 
                            borderColor: '#FF6B00',
                            marginTop: 10,
                            marginBottom: 20
                        }}
                        onPress={v.salvarAvaliacao}
                        disabled={v.loading || v.loadingIA}
                    >
                        {v.loading ? (
                            <ActivityIndicator size="small" color="#FF6B00" />
                        ) : (
                            <Text style={{ color: '#FF6B00', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }}>SALVAR BIOIMPEDÂNCIA</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}