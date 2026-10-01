import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  AppState,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_DADOS = "@meu_controle_dados";
const CHAVE_CONFIG = "@meu_controle_config";

function obterDataAtual() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

function dataDoHistoricoParaDate(data) {
  const [ano, mes, dia] = data.split("-").map(Number);

  return new Date(ano, mes - 1, dia);
}

function converterHorasParaNumero(horas) {
  if (!horas) {
    return 0;
  }

  const texto = String(horas).toLowerCase().trim();

  const horasEncontradas = texto.match(
    /(\d+(?:[.,]\d+)?)\s*h/
  );

  const minutosEncontrados = texto.match(
    /(\d+(?:[.,]\d+)?)\s*min/
  );

  let totalHoras = 0;

  if (horasEncontradas) {
    totalHoras += Number(
      horasEncontradas[1].replace(",", ".")
    );
  }

  if (minutosEncontrados) {
    totalHoras +=
      Number(
        minutosEncontrados[1].replace(",", ".")
      ) / 60;
  }

  if (!horasEncontradas && !minutosEncontrados) {
    const numero = Number(
      texto.replace(",", ".")
    );

    if (!isNaN(numero)) {
      totalHoras = numero;
    }
  }

  return totalHoras;
}

export default function App() {
  // ==========================================
  // CONTROLE DE TELAS
  // ==========================================

  const [telaAtual, setTelaAtual] =
    useState("inicio");

  const [periodoSelecionado, setPeriodoSelecionado] =
    useState("diario");

  // ==========================================
  // DATA ATUAL
  // ==========================================

  const [dataAtual, setDataAtual] =
    useState(obterDataAtual());

  // ==========================================
  // APLICATIVOS
  // ==========================================

  const [aplicativos, setAplicativos] =
    useState([]);

  const [novoApp, setNovoApp] =
    useState("");

  const [valorNovoApp, setValorNovoApp] =
    useState("");

  // ==========================================
  // DESPESAS
  // ==========================================

  const [despesas, setDespesas] =
    useState([]);

  const [novaDespesa, setNovaDespesa] =
    useState("");

  const [valorNovaDespesa, setValorNovaDespesa] =
    useState("");

  // ==========================================
  // COMBUSTÍVEL
  // ==========================================

  const [combustivel, setCombustivel] =
    useState({
      litros: 0,
      precoLitro: 0,
      total: 0,
    });

  const [litrosInput, setLitrosInput] =
    useState("");

  const [precoLitroInput, setPrecoLitroInput] =
    useState("");

  // ==========================================
  // QUILOMETRAGEM
  // ==========================================

  const [quilometragem, setQuilometragem] =
    useState(0);

  const [quilometragemInput, setQuilometragemInput] =
    useState("");

  // ==========================================
  // HORAS TRABALHADAS
  // ==========================================

  const [horasTrabalhadas, setHorasTrabalhadas] =
    useState("");

  const [horasTrabalhadasInput, setHorasTrabalhadasInput] =
    useState("");

  // ==========================================
  // MODAIS
  // ==========================================

  const [modalAdicionarApp, setModalAdicionarApp] =
    useState(false);

  const [modalAdicionarDespesa, setModalAdicionarDespesa] =
    useState(false);

  const [modalFaturamento, setModalFaturamento] =
    useState(false);

  const [modalCombustivel, setModalCombustivel] =
    useState(false);

  const [modalQuilometragem, setModalQuilometragem] =
    useState(false);

  const [modalHorasTrabalhadas, setModalHorasTrabalhadas] =
    useState(false);

  const [modalHistorico, setModalHistorico] =
    useState(false);

  const [modalDetalhesHistorico, setModalDetalhesHistorico] =
    useState(false);

  // ==========================================
  // SELEÇÕES
  // ==========================================

  const [appSelecionado, setAppSelecionado] =
    useState(null);

  const [diaHistoricoSelecionado, setDiaHistoricoSelecionado] =
    useState(null);

  const [valorFaturamentoInput, setValorFaturamentoInput] =
    useState("");

  // ==========================================
  // HISTÓRICO
  // ==========================================

  const [historico, setHistorico] =
    useState([]);

  const [filtroHistorico, setFiltroHistorico] =
    useState("todos");

    function iniciarNovoDia() {
  setAplicativos([]);
  setNovoApp("");
  setValorNovoApp("");

  setDespesas([]);
  setNovaDespesa("");
  setValorNovaDespesa("");

  setCombustivel({
    litros: 0,
    precoLitro: 0,
    total: 0,
  });

  setLitrosInput("");
  setPrecoLitroInput("");

  setQuilometragem(0);
  setQuilometragemInput("");

  setHorasTrabalhadas("");
  setHorasTrabalhadasInput("");

  setValorFaturamentoInput("");

  setTelaAtual("cadastro");
}

  // ==========================================
  // CARREGAR DADOS INICIAIS
  // ==========================================

  async function carregarDados() {
    try {
      const dadosSalvos =
        await AsyncStorage.getItem(CHAVE_DADOS);

      const configSalva =
        await AsyncStorage.getItem(CHAVE_CONFIG);

      const dados = dadosSalvos
        ? JSON.parse(dadosSalvos)
        : {};

      const config = configSalva
        ? JSON.parse(configSalva)
        : {
            aplicativos: [],
            despesas: [],
          };

      const historicoCarregado =
        Object.values(dados).sort((a, b) =>
          b.data.localeCompare(a.data)
        );

      setHistorico(historicoCarregado);

      // IMPORTANTE:
      // O cadastro atual começa sempre zerado.
      // Não carregamos o dia salvo anteriormente.

      setAplicativos(
        (config.aplicativos || []).map(
          (app) => ({
            ...app,
            valor: 0,
          })
        )
      );

      setDespesas(
        (config.despesas || []).map(
          (despesa) => ({
            ...despesa,
            valor: 0,
          })
        )
      );

      setCombustivel({
        litros: 0,
        precoLitro: 0,
        total: 0,
      });

      setQuilometragem(0);

      setHorasTrabalhadas("");

      setDataAtual(obterDataAtual());
    } catch (erro) {
      console.log(
        "Erro ao carregar dados:",
        erro
      );
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // ==========================================
  // SALVAR CONFIGURAÇÃO DOS APLICATIVOS
  // E DESPESAS
  // ==========================================

  async function salvarConfiguracao(
    listaAplicativos = aplicativos,
    listaDespesas = despesas
  ) {
    try {
      const config = {
        aplicativos: listaAplicativos.map(
          (app) => ({
            id: app.id,
            nome: app.nome,
            icone: app.icone,
          })
        ),

        despesas: listaDespesas.map(
          (despesa) => ({
            id: despesa.id,
            nome: despesa.nome,
            icone: despesa.icone,
          })
        ),
      };

      await AsyncStorage.setItem(
        CHAVE_CONFIG,
        JSON.stringify(config)
      );
    } catch (erro) {
      console.log(
        "Erro ao salvar configuração:",
        erro
      );
    }
  }

  // ==========================================
  // NOVO DIA
  // ==========================================

  function iniciarNovoDia() {
    const hoje = obterDataAtual();

    setDataAtual(hoje);

    setAplicativos((lista) =>
      lista.map((app) => ({
        ...app,
        valor: 0,
      }))
    );

    setDespesas((lista) =>
      lista.map((despesa) => ({
        ...despesa,
        valor: 0,
      }))
    );

    setCombustivel({
      litros: 0,
      precoLitro: 0,
      total: 0,
    });

    setQuilometragem(0);

    setHorasTrabalhadas("");

    setLitrosInput("");
    setPrecoLitroInput("");
    setQuilometragemInput("");
    setHorasTrabalhadasInput("");

    setNovoApp("");
    setValorNovoApp("");

    setNovaDespesa("");
    setValorNovaDespesa("");

    setTelaAtual("cadastro");
  }

  // ==========================================
  // LANÇAR DIA
  // ==========================================

  async function lancarDia() {
    try {
      const hoje = obterDataAtual();

      const dadosSalvos =
        await AsyncStorage.getItem(CHAVE_DADOS);

      const dados = dadosSalvos
        ? JSON.parse(dadosSalvos)
        : {};

      const novoRegistro = {
        data: hoje,
        aplicativos,
        despesas,
        combustivel,
        quilometragem,
        horasTrabalhadas,
      };

      // Salva o dia somente agora.
      dados[hoje] = novoRegistro;

      await AsyncStorage.setItem(
        CHAVE_DADOS,
        JSON.stringify(dados)
      );

      const novoHistorico =
        Object.values(dados).sort((a, b) =>
          b.data.localeCompare(a.data)
        );

      setHistorico(novoHistorico);

      // ======================================
      // ZERAR CADASTRO PARA O PRÓXIMO DIA
      // ======================================

      setAplicativos((lista) =>
        lista.map((app) => ({
          ...app,
          valor: 0,
        }))
      );

      setDespesas((lista) =>
        lista.map((despesa) => ({
          ...despesa,
          valor: 0,
        }))
      );

      setCombustivel({
        litros: 0,
        precoLitro: 0,
        total: 0,
      });

      setQuilometragem(0);

      setHorasTrabalhadas("");

      setLitrosInput("");
      setPrecoLitroInput("");
      setQuilometragemInput("");
      setHorasTrabalhadasInput("");

      setTelaAtual("inicio");
    } catch (erro) {
      console.log(
        "Erro ao lançar dia:",
        erro
      );
    }
  }

  // ==========================================
  // VERIFICAR MUDANÇA DE DIA
  // ==========================================

  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        "change",
        (estado) => {
          if (estado === "active") {
            const hoje =
              obterDataAtual();

            if (hoje !== dataAtual) {
              setDataAtual(hoje);

              iniciarNovoDia();
            }
          }
        }
      );

    return () =>
      subscription.remove();
  }, [dataAtual]);

  // ==========================================
  // APLICATIVOS
  // ==========================================

  function adicionarAplicativo() {
    const nome = novoApp.trim();

    const valor = Number(
      valorNovoApp.replace(",", ".")
    );

    if (!nome) {
      return;
    }

    const novo = {
      id: Date.now(),
      nome,
      icone: "🚗",
      valor: isNaN(valor)
        ? 0
        : valor,
    };

    const novaLista = [
      ...aplicativos,
      novo,
    ];

    setAplicativos(novaLista);

    salvarConfiguracao(
      novaLista,
      despesas
    );

    setNovoApp("");
    setValorNovoApp("");
    setModalAdicionarApp(false);
  }

  function abrirFaturamento(app) {
    setAppSelecionado(app);

    setValorFaturamentoInput(
      String(
        app.valor || ""
      ).replace(".", ",")
    );

    setModalFaturamento(true);
  }

  function salvarFaturamento() {
    const valor = Number(
      valorFaturamentoInput.replace(
        ",",
        "."
      )
    );

    setAplicativos((lista) =>
      lista.map((app) =>
        app.id ===
        appSelecionado.id
          ? {
              ...app,
              valor: isNaN(valor)
                ? 0
                : valor,
            }
          : app
      )
    );

    setModalFaturamento(false);
    setAppSelecionado(null);
    setValorFaturamentoInput("");
  }

  function apagarAplicativo(id) {
    const novaLista =
      aplicativos.filter(
        (app) => app.id !== id
      );

    setAplicativos(novaLista);

    salvarConfiguracao(
      novaLista,
      despesas
    );
  }

  // ==========================================
  // DESPESAS
  // ==========================================

  function adicionarDespesa() {
    const nome =
      novaDespesa.trim();

    const valor = Number(
      valorNovaDespesa.replace(
        ",",
        "."
      )
    );

    if (!nome) {
      return;
    }

    const nova = {
      id: Date.now(),
      nome,
      icone: "💸",
      valor: isNaN(valor)
        ? 0
        : valor,
    };

    const novaLista = [
      ...despesas,
      nova,
    ];

    setDespesas(novaLista);

    salvarConfiguracao(
      aplicativos,
      novaLista
    );

    setNovaDespesa("");
    setValorNovaDespesa("");
    setModalAdicionarDespesa(false);
  }

  function abrirDespesa(despesa) {
    setNovaDespesa(
      despesa.nome
    );

    setValorNovaDespesa(
      String(
        despesa.valor || ""
      ).replace(".", ",")
    );

    setModalAdicionarDespesa(true);
  }

  function apagarDespesa(id) {
    const novaLista =
      despesas.filter(
        (despesa) =>
          despesa.id !== id
      );

    setDespesas(novaLista);

    salvarConfiguracao(
      aplicativos,
      novaLista
    );
  }

  // ==========================================
  // COMBUSTÍVEL
  // ==========================================

  function abrirCombustivel() {
    setLitrosInput(
      combustivel.litros
        ? String(
            combustivel.litros
          ).replace(".", ",")
        : ""
    );

    setPrecoLitroInput(
      combustivel.precoLitro
        ? String(
            combustivel.precoLitro
          ).replace(".", ",")
        : ""
    );

    setModalCombustivel(true);
  }

  function salvarCombustivel() {
    const litros = Number(
      litrosInput.replace(",", ".")
    );

    const precoLitro = Number(
      precoLitroInput.replace(
        ",",
        "."
      )
    );

    const total =
      litros * precoLitro;

    setCombustivel({
      litros: isNaN(litros)
        ? 0
        : litros,

      precoLitro:
        isNaN(precoLitro)
          ? 0
          : precoLitro,

      total: isNaN(total)
        ? 0
        : total,
    });

    setModalCombustivel(false);
  }

  // ==========================================
  // QUILOMETRAGEM
  // ==========================================

  function abrirQuilometragem() {
    setQuilometragemInput(
      quilometragem
        ? String(
            quilometragem
          ).replace(".", ",")
        : ""
    );

    setModalQuilometragem(true);
  }

  function salvarQuilometragem() {
    const valor = Number(
      quilometragemInput.replace(
        ",",
        "."
      )
    );

    setQuilometragem(
      isNaN(valor)
        ? 0
        : valor
    );

    setModalQuilometragem(false);
  }

  // ==========================================
  // HORAS
  // ==========================================

  function abrirHorasTrabalhadas() {
    setHorasTrabalhadasInput(
      horasTrabalhadas || ""
    );

    setModalHorasTrabalhadas(true);
  }

  function salvarHorasTrabalhadas() {
    setHorasTrabalhadas(
      horasTrabalhadasInput.trim()
    );

    setModalHorasTrabalhadas(false);
  }

  // ==========================================
  // CÁLCULOS DO DIA
  // ==========================================

  const faturamento =
    aplicativos.reduce(
      (total, app) =>
        total +
        Number(
          app.valor || 0
        ),
      0
    );

  const totalOutrasDespesas =
    despesas.reduce(
      (total, despesa) =>
        total +
        Number(
          despesa.valor || 0
        ),
      0
    );

  const totalDespesas =
    Number(
      combustivel.total || 0
    ) +
    totalOutrasDespesas;

  const liquido =
    faturamento -
    totalDespesas;

    const maiorValorGrafico =
  Math.max(
    liquido,
    totalDespesas,
    1
  );


const alturaBarraLiquido =
  Math.max(
    (Math.abs(liquido) /
      maiorValorGrafico) *
      180,
    8
  );

const alturaBarraDespesas =
  Math.max(
    (totalDespesas /
      maiorValorGrafico) *
      180,
    8
  );

  // ==========================================
  // HISTÓRICO
  // ==========================================

  function abrirHistorico() {
    carregarDados();
    setModalHistorico(true);
  }

  function obterHistoricoFiltrado() {
    const hoje =
      dataDoHistoricoParaDate(
        obterDataAtual()
      );

    if (
      filtroHistorico ===
      "todos"
    ) {
      return historico;
    }

    return historico.filter(
      (dia) => {
        const data =
          dataDoHistoricoParaDate(
            dia.data
          );

        if (
          filtroHistorico ===
          "semana"
        ) {
          const diaSemana =
            hoje.getDay();

          const diferencaParaSegunda =
            diaSemana === 0
              ? 6
              : diaSemana - 1;

          const inicioSemana =
            new Date(hoje);

          inicioSemana.setDate(
            hoje.getDate() -
              diferencaParaSegunda
          );

          inicioSemana.setHours(
            0,
            0,
            0,
            0
          );

          const fimSemana =
            new Date(
              inicioSemana
            );

          fimSemana.setDate(
            inicioSemana.getDate() +
              6
          );

          fimSemana.setHours(
            23,
            59,
            59,
            999
          );

          return (
            data >= inicioSemana &&
            data <= fimSemana
          );
        }

        if (
          filtroHistorico ===
          "mes"
        ) {
          return (
            data.getFullYear() ===
              hoje.getFullYear() &&
            data.getMonth() ===
              hoje.getMonth()
          );
        }

        if (
          filtroHistorico ===
          "ano"
        ) {
          return (
            data.getFullYear() ===
            hoje.getFullYear()
          );
        }

        return true;
      }
    );
  }

  function calcularDadosDoDia(
    dia
  ) {
    const faturamentoDia =
      (
        dia.aplicativos || []
      ).reduce(
        (total, app) =>
          total +
          Number(
            app.valor || 0
          ),
        0
      );

    const despesasDia =
      (
        dia.despesas || []
      ).reduce(
        (total, despesa) =>
          total +
          Number(
            despesa.valor || 0
          ),
        0
      );

    const combustivelDia =
      Number(
        dia.combustivel
          ?.total || 0
      );

    const totalDespesasDia =
      despesasDia +
      combustivelDia;

    const liquidoDia =
      faturamentoDia -
      totalDespesasDia;

    const horasNumericas =
      converterHorasParaNumero(
        dia.horasTrabalhadas
      );

    const ganhoPorHora =
      horasNumericas > 0
        ? liquidoDia /
          horasNumericas
        : 0;

    return {
      faturamentoDia,
      despesasDia,
      combustivelDia,
      totalDespesasDia,
      liquidoDia,
      horasNumericas,
      ganhoPorHora,
    };
  }

  function abrirDetalhesHistorico(
    dia
  ) {
    setDiaHistoricoSelecionado(
      dia
    );

    setModalDetalhesHistorico(
      true
    );
  }

  function fecharDetalhesHistorico() {
    setModalDetalhesHistorico(
      false
    );

    setDiaHistoricoSelecionado(
      null
    );
  }

  // ==========================================
  // HISTÓRICO - GRID
  // ==========================================

  function renderizarHistorico() {
    const historicoFiltrado =
      obterHistoricoFiltrado();

    if (
      historicoFiltrado.length ===
      0
    ) {
      return (
        <View
          style={
            styles.historicoVazio
          }
        >
          <Text
            style={
              styles.historicoVazioIcone
            }
          >
            📊
          </Text>

          <Text
            style={
              styles.historicoVazioTitulo
            }
          >
            Nenhum histórico encontrado
          </Text>

          <Text
            style={
              styles.historicoVazioTexto
            }
          >
            Não existem registros para o período
            selecionado.
          </Text>
        </View>
      );
    }

    return (
      <View
        style={
          styles.historicoGrid
        }
      >
        {historicoFiltrado.map(
          (dia) => {
            const dados =
              calcularDadosDoDia(
                dia
              );

            return (
              <Pressable
                key={dia.data}
                style={
                  styles.historicoCard
                }
                onPress={() =>
                  abrirDetalhesHistorico(
                    dia
                  )
                }
              >
                <Text
                  style={
                    styles.historicoCardData
                  }
                >
                  {formatarData(
                    dia.data
                  )}
                </Text>

                <Text
                  style={
                    styles.historicoCardLabel
                  }
                >
                  Líquido
                </Text>

                <Text
                  style={
                    styles.historicoCardLiquido
                  }
                >
                  {formatarMoeda(
                    dados.liquidoDia
                  )}
                </Text>

                <Text
                  style={
                    styles.historicoCardToque
                  }
                >
                  Ver detalhes
                </Text>
              </Pressable>
            );
          }
        )}
      </View>
    );
  }

  // ==========================================
  // DETALHES DO HISTÓRICO
  // ==========================================

  function renderizarDetalhesHistorico() {
    if (
      !diaHistoricoSelecionado
    ) {
      return null;
    }

    const dia =
      diaHistoricoSelecionado;

    const dados =
      calcularDadosDoDia(dia);

    return (
      <Modal
        visible={
          modalDetalhesHistorico
        }
        animationType="slide"
        onRequestClose={
          fecharDetalhesHistorico
        }
      >
        <View
          style={
            styles.detalhesTela
          }
        >
          <View
            style={
              styles.detalhesHeader
            }
          >
            <View>
              <Text
                style={
                  styles.detalhesTitulo
                }
              >
                {formatarData(
                  dia.data
                )}
              </Text>

              <Text
                style={
                  styles.detalhesSubtitulo
                }
              >
                Resumo do dia
              </Text>
            </View>

            <Pressable
              style={
                styles.botaoFecharHistorico
              }
              onPress={
                fecharDetalhesHistorico
              }
            >
              <Text
                style={
                  styles.botaoFecharHistoricoTexto
                }
              >
                ✕
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={
              styles.detalhesScroll
            }
          >
            <View
              style={
                styles.detalhesGrid
              }
            >
              <View
                style={
                  styles.detalhesCard
                }
              >
                <Text
                  style={
                    styles.detalhesIcone
                  }
                >
                  💰
                </Text>

                <Text
                  style={
                    styles.detalhesLabel
                  }
                >
                  Líquido
                </Text>

                <Text
                  style={
                    styles.detalhesValorLiquido
                  }
                >
                  {formatarMoeda(
                    dados.liquidoDia
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.detalhesCard
                }
              >
                <Text
                  style={
                    styles.detalhesIcone
                  }
                >
                  ⏱️
                </Text>

                <Text
                  style={
                    styles.detalhesLabel
                  }
                >
                  Horas trabalhadas
                </Text>

                <Text
                  style={
                    styles.detalhesValor
                  }
                >
                  {dia.horasTrabalhadas ||
                    "0h"}
                </Text>
              </View>

              <View
                style={
                  styles.detalhesCard
                }
              >
                <Text
                  style={
                    styles.detalhesIcone
                  }
                >
                  💵
                </Text>

                <Text
                  style={
                    styles.detalhesLabel
                  }
                >
                  Faturamento
                </Text>

                <Text
                  style={
                    styles.detalhesValorVerde
                  }
                >
                  {formatarMoeda(
                    dados.faturamentoDia
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.detalhesCard
                }
              >
                <Text
                  style={
                    styles.detalhesIcone
                  }
                >
                  📈
                </Text>

                <Text
                  style={
                    styles.detalhesLabel
                  }
                >
                  Ganho por hora
                </Text>

                <Text
                  style={
                    styles.detalhesValorVerde
                  }
                >
                  {dados.horasNumericas >
                  0
                    ? formatarMoeda(
                        dados.ganhoPorHora
                      )
                    : "—"}
                </Text>
              </View>

              <View
                style={
                  styles.detalhesCard
                }
              >
                <Text
                  style={
                    styles.detalhesIcone
                  }
                >
                  🧾
                </Text>

                <Text
                  style={
                    styles.detalhesLabel
                  }
                >
                  Despesas
                </Text>

                <Text
                  style={
                    styles.detalhesValorVermelho
                  }
                >
                  {formatarMoeda(
                    dados.totalDespesasDia
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.detalhesCard
                }
              >
                <Text
                  style={
                    styles.detalhesIcone
                  }
                >
                  🚗
                </Text>

                <Text
                  style={
                    styles.detalhesLabel
                  }
                >
                  Quilometragem
                </Text>

                <Text
                  style={
                    styles.detalhesValor
                  }
                >
                  {dia.quilometragem ||
                    0}{" "}
                  km
                </Text>
              </View>
            </View>

            {(dia.aplicativos || [])
              .length > 0 && (
              <View
                style={
                  styles.detalhesSecao
                }
              >
                <Text
                  style={
                    styles.detalhesSecaoTitulo
                  }
                >
                  📱 Aplicativos
                </Text>

                {dia.aplicativos.map(
                  (app) => (
                    <View
                      key={app.id}
                      style={
                        styles.detalheLinha
                      }
                    >
                      <Text
                        style={
                          styles.detalheLinhaNome
                        }
                      >
                        {app.icone}{" "}
                        {app.nome}
                      </Text>

                      <Text
                        style={
                          styles.detalheLinhaValor
                        }
                      >
                        {formatarMoeda(
                          app.valor
                        )}
                      </Text>
                    </View>
                  )
                )}
              </View>
            )}

            {(dia.despesas || [])
              .length > 0 && (
              <View
                style={
                  styles.detalhesSecao
                }
              >
                <Text
                  style={
                    styles.detalhesSecaoTitulo
                  }
                >
                  🧾 Outras despesas
                </Text>

                {dia.despesas.map(
                  (despesa) => (
                    <View
                      key={despesa.id}
                      style={
                        styles.detalheLinha
                      }
                    >
                      <Text
                        style={
                          styles.detalheLinhaNome
                        }
                      >
                        {despesa.icone}{" "}
                        {despesa.nome}
                      </Text>

                      <Text
                        style={
                          styles.detalheLinhaValorVermelho
                        }
                      >
                        {formatarMoeda(
                          despesa.valor
                        )}
                      </Text>
                    </View>
                  )
                )}
              </View>
            )}

            {Number(
              dia.combustivel
                ?.total || 0
            ) > 0 && (
              <View
                style={
                  styles.detalhesSecao
                }
              >
                <Text
                  style={
                    styles.detalhesSecaoTitulo
                  }
                >
                  ⛽ Combustível
                </Text>

                <View
                  style={
                    styles.detalheLinha
                  }
                >
                  <Text
                    style={
                      styles.detalheLinhaNome
                    }
                  >
                    {dia.combustivel
                      ?.litros || 0}{" "}
                    litros
                  </Text>

                  <Text
                    style={
                      styles.detalheLinhaValorVermelho
                    }
                  >
                    {formatarMoeda(
                      dia.combustivel
                        ?.total
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.detalheLinha
                  }
                >
                  <Text
                    style={
                      styles.detalheLinhaNome
                    }
                  >
                    Preço por litro
                  </Text>

                  <Text
                    style={
                      styles.detalheLinhaValor
                    }
                  >
                    {formatarMoeda(
                      dia.combustivel
                        ?.precoLitro
                    )}
                    /L
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  }

  // ==========================================
  // TELA
  // ==========================================

  return (
    <View style={styles.container}>

      {/* ====================================== */}
      {/* DASHBOARD INICIAL */}
      {/* ====================================== */}

      {telaAtual === "inicio" ? (
        <>
          <View
            style={
              styles.dashboardHeader
            }
          >
            <Text style={styles.titulo}>
              Meu Controle
            </Text>
          </View>

          <View
            style={styles.periodos}
          >
            {[
              {
                id: "diario",
                texto: "Diário",
              },
              {
                id: "semanal",
                texto: "Semanal",
              },
              {
                id: "mensal",
                texto: "Mensal",
              },
              {
                id: "anual",
                texto: "Anual",
              },
            ].map((periodo) => (
              <Pressable
                key={periodo.id}
                style={[
                  styles.periodoBotao,
                  periodoSelecionado ===
                    periodo.id &&
                    styles.periodoBotaoAtivo,
                ]}
                onPress={() =>
                  setPeriodoSelecionado(
                    periodo.id
                  )
                }
              >
                <Text
                  style={[
                    styles.periodoTexto,
                    periodoSelecionado ===
                      periodo.id &&
                      styles.periodoTextoAtivo,
                  ]}
                >
                  {periodo.texto}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView
            contentContainerStyle={
              styles.dashboardScroll
            }
          >
            <View
              style={
                styles.graficoCard
              }
            >
              <Text
                style={
                  styles.graficoTitulo
                }
              >
                {periodoSelecionado ===
                "diario"
                  ? "Hoje"
                  : periodoSelecionado ===
                    "semanal"
                  ? "Esta semana"
                  : periodoSelecionado ===
                    "mensal"
                  ? "Este mês"
                  : "Este ano"}
              </Text>

<View style={styles.graficoArea}>
  <View style={styles.graficoBarras}>
    <View style={styles.graficoColuna}>
      <View
  style={[
    styles.graficoBarra,
    {
      height: alturaBarraLiquido,
      backgroundColor: "#087A36",
    },
  ]}
/>
<Text style={styles.graficoValor}>
  {formatarMoeda(liquido)}
</Text>
    </View>

    <View style={styles.graficoColuna}>
<View
  style={[
    styles.graficoBarra,
    {
      height: alturaBarraDespesas,
      backgroundColor: "#F59E0B",
    },
  ]}
/>
<Text style={styles.graficoValor}>
  {formatarMoeda(totalDespesas)}
</Text>
    </View>
  </View>
</View>
            </View>

            <Pressable
              style={
                styles.botaoCadastrarDia
              }
              onPress={
                iniciarNovoDia
              }
            >
              <Text
                style={
                  styles.botaoCadastrarDiaIcone
                }
              >
                +
              </Text>

              <Text
                style={
                  styles.botaoCadastrarDiaTexto
                }
              >
                Cadastrar Dia
              </Text>
            </Pressable>
            <Pressable
  style={styles.botaoHistorico}
  onPress={abrirHistorico}
>
  <Text style={styles.botaoHistoricoTexto}>
    Histórico
  </Text>
</Pressable>
          </ScrollView>
        </>
      ) : (

        /* ====================================== */
        /* TELA DE CADASTRO */
        /* ====================================== */

        <>
          <View
            style={
              styles.cadastroHeader
            }
          >
            <Pressable
              style={
                styles.botaoVoltar
              }
              onPress={() =>
                setTelaAtual(
                  "inicio"
                )
              }
            >
              <Text
                style={
                  styles.botaoVoltarTexto
                }
              >
                ←
              </Text>
            </Pressable>

            <View
              style={
                styles.cadastroHeaderTexto
              }
            >
              <Text
                style={styles.titulo}
              >
                Cadastrar Dia
              </Text>

              <Text
                style={
                  styles.subtitulo
                }
              >
                {formatarData(dataAtual)}
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={
              styles.scrollContainer
            }
          >

            {/* RESUMO */}

            <View
              style={styles.resumo}
            >
              <View
                style={
                  styles.resumoItem
                }
              >
                <Text
                  style={
                    styles.resumoLabel
                  }
                >
                  Faturamento
                </Text>

                <Text
                  style={
                    styles.resumoValorVerde
                  }
                >
                  {formatarMoeda(
                    faturamento
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.resumoItem
                }
              >
                <Text
                  style={
                    styles.resumoLabel
                  }
                >
                  Despesas
                </Text>

                <Text
                  style={
                    styles.resumoValorVermelho
                  }
                >
                  {formatarMoeda(
                    totalDespesas
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.resumoItem
                }
              >
                <Text
                  style={
                    styles.resumoLabel
                  }
                >
                  Líquido
                </Text>

                <Text
                  style={
                    styles.resumoValorLiquido
                  }
                >
                  {formatarMoeda(
                    liquido
                  )}
                </Text>
              </View>
            </View>

            {/* APLICATIVOS */}

            <Text
              style={
                styles.secaoTitulo
              }
            >
              Aplicativos
            </Text>

            {aplicativos.length ===
            0 ? (
              <Text
                style={
                  styles.textoVazio
                }
              >
                Nenhum aplicativo
                adicionado.
              </Text>
            ) : (
              <View
                style={styles.grid}
              >
                {aplicativos.map(
                  (app) => (
                    <View
                      key={app.id}
                      style={
                        styles.gridCard
                      }
                    >
                      <Pressable
                        style={
                          styles.cardConteudo
                        }
                        onPress={() =>
                          abrirFaturamento(
                            app
                          )
                        }
                      >
                        <Text
                          style={
                            styles.cardIcone
                          }
                        >
                          {app.icone}
                        </Text>

                        <Text
                          style={
                            styles.cardTitulo
                          }
                        >
                          {app.nome}
                        </Text>

                        <Text
                          style={
                            styles.cardValorVerde
                          }
                        >
                          {formatarMoeda(
                            app.valor
                          )}
                        </Text>

                        <Text
                          style={
                            styles.cardDescricao
                          }
                        >
                          Toque para alterar
                        </Text>
                      </Pressable>

                      <Pressable
                        style={
                          styles.botaoApagar
                        }
                        onPress={() =>
                          apagarAplicativo(
                            app.id
                          )
                        }
                      >
                        <Text
                          style={
                            styles.botaoApagarTexto
                          }
                        >
                          Apagar
                        </Text>
                      </Pressable>
                    </View>
                  )
                )}
              </View>
            )}

            <Pressable
              style={
                styles.botaoAdicionar
              }
              onPress={() =>
                setModalAdicionarApp(
                  true
                )
              }
            >
              <Text
                style={
                  styles.botaoAdicionarTexto
                }
              >
                + Adicionar aplicativo
              </Text>
            </Pressable>

            {/* DESPESAS */}

            <Text
              style={
                styles.secaoTitulo
              }
            >
              Despesas
            </Text>

            {despesas.length ===
            0 ? (
              <Text
                style={
                  styles.textoVazio
                }
              >
                Nenhuma despesa
                adicionada.
              </Text>
            ) : (
              <View
                style={styles.grid}
              >
                {despesas.map(
                  (despesa) => (
                    <View
                      key={despesa.id}
                      style={
                        styles.gridCard
                      }
                    >
                      <Pressable
                        style={
                          styles.cardConteudo
                        }
                        onPress={() =>
                          abrirDespesa(
                            despesa
                          )
                        }
                      >
                        <Text
                          style={
                            styles.cardIcone
                          }
                        >
                          {despesa.icone}
                        </Text>

                        <Text
                          style={
                            styles.cardTitulo
                          }
                        >
                          {despesa.nome}
                        </Text>

                        <Text
                          style={
                            styles.cardValorVermelho
                          }
                        >
                          {formatarMoeda(
                            despesa.valor
                          )}
                        </Text>

                        <Text
                          style={
                            styles.cardDescricao
                          }
                        >
                          Toque para alterar
                        </Text>
                      </Pressable>

                      <Pressable
                        style={
                          styles.botaoApagar
                        }
                        onPress={() =>
                          apagarDespesa(
                            despesa.id
                          )
                        }
                      >
                        <Text
                          style={
                            styles.botaoApagarTexto
                          }
                        >
                          Apagar
                        </Text>
                      </Pressable>
                    </View>
                  )
                )}
              </View>
            )}

            <Pressable
              style={
                styles.botaoAdicionar
              }
              onPress={() =>
                setModalAdicionarDespesa(
                  true
                )
              }
            >
              <Text
                style={
                  styles.botaoAdicionarTexto
                }
              >
                + Adicionar despesa
              </Text>
            </Pressable>

            {/* COMBUSTÍVEL */}

            <Text
              style={
                styles.secaoTitulo
              }
            >
              Combustível
            </Text>

            <Pressable
              style={
                styles.cardNormal
              }
              onPress={
                abrirCombustivel
              }
            >
              <View>
                <Text
                  style={
                    styles.cardIcone
                  }
                >
                  ⛽
                </Text>

                <Text
                  style={
                    styles.cardTitulo
                  }
                >
                  Combustível
                </Text>

                <Text
                  style={
                    styles.cardValorVermelho
                  }
                >
                  {formatarMoeda(
                    combustivel.total
                  )}
                </Text>

                <Text
                  style={
                    styles.cardDescricao
                  }
                >
                  {combustivel.litros ||
                    0}{" "}
                  litros
                  {" • "}
                  {formatarMoeda(
                    combustivel.precoLitro
                  )}
                  /L
                </Text>
              </View>
            </Pressable>

            {/* KM E HORAS */}

            <View
              style={
                styles.infoGrid
              }
            >
              <Pressable
                style={
                  styles.infoCard
                }
                onPress={
                  abrirQuilometragem
                }
              >
                <Text
                  style={
                    styles.infoIcone
                  }
                >
                  🚗
                </Text>

                <Text
                  style={
                    styles.infoTitulo
                  }
                >
                  Quilometragem
                </Text>

                <Text
                  style={
                    styles.infoValorVerde
                  }
                >
                  {quilometragem} km
                </Text>

                <Text
                  style={
                    styles.infoDescricao
                  }
                >
                  Toque para alterar
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.infoCard
                }
                onPress={
                  abrirHorasTrabalhadas
                }
              >
                <Text
                  style={
                    styles.infoIcone
                  }
                >
                  ⏱️
                </Text>

                <Text
                  style={
                    styles.infoTitulo
                  }
                >
                  Horas trabalhadas
                </Text>

                <Text
                  style={
                    styles.infoValorVerde
                  }
                >
                  {horasTrabalhadas ||
                    "0h"}
                </Text>

                <Text
                  style={
                    styles.infoDescricao
                  }
                >
                  Toque para alterar
                </Text>
              </Pressable>
            </View>

            {/* ================================== */}
            {/* LANÇAR DIA */}
            {/* ================================== */}

            <View
              style={
                styles.lancarArea
              }
            >
              <Text
                style={
                  styles.lancarTitulo
                }
              >
                Conferiu tudo?
              </Text>

              <Text
                style={
                  styles.lancarDescricao
                }
              >
                Ao lançar, este dia será salvo no
                histórico e o cadastro será zerado.
              </Text>

              <Pressable
                style={
                  styles.botaoLancarDia
                }
                onPress={
                  lancarDia
                }
              >
                <Text
                  style={
                    styles.botaoLancarDiaTexto
                  }
                >
                  ✓ LANÇAR DIA
                </Text>
              </Pressable>
            </View>

          </ScrollView>
        </>
      )}

      {/* ====================================== */}
      {/* MODAL - ADICIONAR APLICATIVO */}
      {/* ====================================== */}

      <Modal
        visible={
          modalAdicionarApp
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalAdicionarApp(
            false
          )
        }
      >
        <View
          style={
            styles.modalFundo
          }
        >
          <View style={styles.modal}>
            <Text
              style={
                styles.modalTitulo
              }
            >
              Adicionar aplicativo
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do aplicativo"
              value={novoApp}
              onChangeText={
                setNovoApp
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Faturamento do dia"
              value={
                valorNovoApp
              }
              onChangeText={
                setValorNovoApp
              }
              keyboardType="decimal-pad"
            />

            <View
              style={
                styles.modalBotoes
              }
            >
              <Pressable
                style={
                  styles.botaoCancelar
                }
                onPress={() =>
                  setModalAdicionarApp(
                    false
                  )
                }
              >
                <Text>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.botaoConfirmar
                }
                onPress={
                  adicionarAplicativo
                }
              >
                <Text
                  style={
                    styles.botaoConfirmarTexto
                  }
                >
                  Adicionar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================== */}
      {/* MODAL - FATURAMENTO */}
      {/* ====================================== */}

      <Modal
        visible={
          modalFaturamento
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalFaturamento(
            false
          )
        }
      >
        <View
          style={
            styles.modalFundo
          }
        >
          <View style={styles.modal}>
            <Text
              style={
                styles.modalTitulo
              }
            >
              Informar faturamento
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Valor do dia"
              value={
                valorFaturamentoInput
              }
              onChangeText={
                setValorFaturamentoInput
              }
              keyboardType="decimal-pad"
              autoFocus
            />

            <View
              style={
                styles.modalBotoes
              }
            >
              <Pressable
                style={
                  styles.botaoCancelar
                }
                onPress={() =>
                  setModalFaturamento(
                    false
                  )
                }
              >
                <Text>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.botaoConfirmar
                }
                onPress={
                  salvarFaturamento
                }
              >
                <Text
                  style={
                    styles.botaoConfirmarTexto
                  }
                >
                  Salvar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================== */}
      {/* MODAL - DESPESA */}
      {/* ====================================== */}

      <Modal
        visible={
          modalAdicionarDespesa
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalAdicionarDespesa(
            false
          )
        }
      >
        <View
          style={
            styles.modalFundo
          }
        >
          <View style={styles.modal}>
            <Text
              style={
                styles.modalTitulo
              }
            >
              Adicionar despesa
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome da despesa"
              value={
                novaDespesa
              }
              onChangeText={
                setNovaDespesa
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Valor"
              value={
                valorNovaDespesa
              }
              onChangeText={
                setValorNovaDespesa
              }
              keyboardType="decimal-pad"
            />

            <View
              style={
                styles.modalBotoes
              }
            >
              <Pressable
                style={
                  styles.botaoCancelar
                }
                onPress={() =>
                  setModalAdicionarDespesa(
                    false
                  )
                }
              >
                <Text>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.botaoConfirmar
                }
                onPress={
                  adicionarDespesa
                }
              >
                <Text
                  style={
                    styles.botaoConfirmarTexto
                  }
                >
                  Adicionar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================== */}
      {/* MODAL - COMBUSTÍVEL */}
      {/* ====================================== */}

      <Modal
        visible={
          modalCombustivel
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalCombustivel(
            false
          )
        }
      >
        <View
          style={
            styles.modalFundo
          }
        >
          <View style={styles.modal}>
            <Text
              style={
                styles.modalTitulo
              }
            >
              Combustível
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Quantidade de litros"
              value={
                litrosInput
              }
              onChangeText={
                setLitrosInput
              }
              keyboardType="decimal-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Preço por litro"
              value={
                precoLitroInput
              }
              onChangeText={
                setPrecoLitroInput
              }
              keyboardType="decimal-pad"
            />

            <View
              style={
                styles.modalBotoes
              }
            >
              <Pressable
                style={
                  styles.botaoCancelar
                }
                onPress={() =>
                  setModalCombustivel(
                    false
                  )
                }
              >
                <Text>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.botaoConfirmar
                }
                onPress={
                  salvarCombustivel
                }
              >
                <Text
                  style={
                    styles.botaoConfirmarTexto
                  }
                >
                  Salvar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================== */}
      {/* MODAL - QUILOMETRAGEM */}
      {/* ====================================== */}

      <Modal
        visible={
          modalQuilometragem
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalQuilometragem(
            false
          )
        }
      >
        <View
          style={
            styles.modalFundo
          }
        >
          <View style={styles.modal}>
            <Text
              style={
                styles.modalTitulo
              }
            >
              Quilometragem
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Quilômetros rodados"
              value={
                quilometragemInput
              }
              onChangeText={
                setQuilometragemInput
              }
              keyboardType="decimal-pad"
              autoFocus
            />

            <View
              style={
                styles.modalBotoes
              }
            >
              <Pressable
                style={
                  styles.botaoCancelar
                }
                onPress={() =>
                  setModalQuilometragem(
                    false
                  )
                }
              >
                <Text>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.botaoConfirmar
                }
                onPress={
                  salvarQuilometragem
                }
              >
                <Text
                  style={
                    styles.botaoConfirmarTexto
                  }
                >
                  Salvar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================== */}
      {/* MODAL - HORAS */}
      {/* ====================================== */}

      <Modal
        visible={
          modalHorasTrabalhadas
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalHorasTrabalhadas(
            false
          )
        }
      >
        <View
          style={
            styles.modalFundo
          }
        >
          <View style={styles.modal}>
            <Text
              style={
                styles.modalTitulo
              }
            >
              Horas trabalhadas
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ex.: 8h 30min"
              value={
                horasTrabalhadasInput
              }
              onChangeText={
                setHorasTrabalhadasInput
              }
              autoFocus
            />

            <Text
              style={
                styles.dicaHoras
              }
            >
              Informe o total de horas
              trabalhadas no dia.
            </Text>

            <View
              style={
                styles.modalBotoes
              }
            >
              <Pressable
                style={
                  styles.botaoCancelar
                }
                onPress={() =>
                  setModalHorasTrabalhadas(
                    false
                  )
                }
              >
                <Text>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.botaoConfirmar
                }
                onPress={
                  salvarHorasTrabalhadas
                }
              >
                <Text
                  style={
                    styles.botaoConfirmarTexto
                  }
                >
                  Salvar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================== */}
      {/* MODAL - HISTÓRICO */}
      {/* ====================================== */}

      <Modal
        visible={
          modalHistorico
        }
        animationType="slide"
        onRequestClose={() =>
          setModalHistorico(false)
        }
      >
        <View
          style={
            styles.historicoTela
          }
        >
          <View
            style={
              styles.historicoHeader
            }
          >
            <View>
              <Text
                style={
                  styles.historicoTitulo
                }
              >
                Histórico
              </Text>

              <Text
                style={
                  styles.historicoSubtitulo
                }
              >
                Consulte seus registros
              </Text>
            </View>

            <Pressable
              style={
                styles.botaoFecharHistorico
              }
              onPress={() =>
                setModalHistorico(
                  false
                )
              }
            >
              <Text
                style={
                  styles.botaoFecharHistoricoTexto
                }
              >
                ✕
              </Text>
            </Pressable>
          </View>

          <View
            style={
              styles.filtrosHistorico
            }
          >
            {[
              {
                id: "semana",
                texto: "Semana",
              },
              {
                id: "mes",
                texto: "Mês",
              },
              {
                id: "ano",
                texto: "Ano",
              },
              {
                id: "todos",
                texto: "Todos",
              },
            ].map((filtro) => (
              <Pressable
                key={filtro.id}
                style={[
                  styles.filtroBotao,
                  filtroHistorico ===
                    filtro.id &&
                    styles.filtroBotaoAtivo,
                ]}
                onPress={() =>
                  setFiltroHistorico(
                    filtro.id
                  )
                }
              >
                <Text
                  style={[
                    styles.filtroTexto,
                    filtroHistorico ===
                      filtro.id &&
                      styles.filtroTextoAtivo,
                  ]}
                >
                  {filtro.texto}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView
            contentContainerStyle={
              styles.historicoScroll
            }
          >
            {renderizarHistorico()}
          </ScrollView>
        </View>
      </Modal>

      {/* DETALHES DO HISTÓRICO */}

      {renderizarDetalhesHistorico()}
    </View>
  );
}

// ==============================================
// ESTILOS
// ==============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  // ==========================================
  // DASHBOARD
  // ==========================================

  dashboardHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  periodos: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  periodoBotao: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },

  periodoBotaoAtivo: {
    backgroundColor: "#087A36",
    borderColor: "#087A36",
  },

  periodoTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },

  periodoTextoAtivo: {
    color: "#FFFFFF",
  },

  dashboardScroll: {
    padding: 16,
    paddingBottom: 40,
  },

  graficoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  graficoTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 15,
  },

  graficoPlaceholder: {
    height: 260,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  graficoArea: {
  height: 260,
  justifyContent: "flex-end",
  paddingHorizontal: 20,
},

graficoBarras: {
  flex: 1,
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "center",
  gap: 40,
},

graficoColuna: {
  width: 70,
  height: "100%",
  alignItems: "center",
  justifyContent: "flex-end",
},

graficoBarra: {
  width: 45,
  borderRadius: 8,
  marginBottom: 8,
},

graficoBarraLiquido: {
  height: 150,
  backgroundColor: "#087A36",
},

graficoBarraDespesas: {
  height: 100,
  backgroundColor: "#F59E0B",
},

graficoValor: {
  fontSize: 12,
  fontWeight: "700",
  color: "#4B5563",
},

  graficoPlaceholderTexto: {
    fontSize: 20,
    fontWeight: "800",
    color: "#087A36",
  },

  graficoPlaceholderSubtexto: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 5,
  },

  botaoCadastrarDia: {
    backgroundColor: "#087A36",
    borderRadius: 12,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  botaoCadastrarDiaIcone: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "500",
    marginRight: 8,
  },

  botaoCadastrarDiaTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

botaoHistorico: {
  marginTop: 12,
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  minHeight: 52,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#087A36",
},

botaoHistoricoTexto: {
  color: "#087A36",
  fontSize: 15,
  fontWeight: "800",
},

  // ==========================================
  // CABEÇALHO DO CADASTRO
  // ==========================================

  cadastroHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  botaoVoltar: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  botaoVoltarTexto: {
    fontSize: 26,
    color: "#1F2937",
  },

  cadastroHeaderTexto: {
    flex: 1,
  },

  // ==========================================
  // TELA DE CADASTRO
  // ==========================================

  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: "#087A36",
  },

  subtitulo: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 3,
  },

  resumo: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  resumoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  resumoLabel: {
    fontSize: 15,
    color: "#4B5563",
  },

  resumoValorVerde: {
    fontSize: 17,
    fontWeight: "800",
    color: "#087A36",
  },

  resumoValorVermelho: {
    fontSize: 17,
    fontWeight: "800",
    color: "#C62828",
  },

  resumoValorLiquido: {
    fontSize: 19,
    fontWeight: "900",
    color: "#1F2937",
  },

  secaoTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 10,
    marginTop: 8,
  },

  textoVazio: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardNormal: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardConteudo: {
    padding: 14,
  },

  cardIcone: {
    fontSize: 28,
    marginBottom: 6,
  },

  cardTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
  },

  cardValorVerde: {
    fontSize: 17,
    fontWeight: "800",
    color: "#087A36",
    marginTop: 5,
  },

  cardValorVermelho: {
    fontSize: 17,
    fontWeight: "800",
    color: "#C62828",
    marginTop: 5,
  },

  cardDescricao: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 5,
  },

  botaoApagar: {
    backgroundColor: "#C62828",
    paddingVertical: 8,
  },

  botaoApagarTexto: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  botaoAdicionar: {
    width: "100%",
    backgroundColor: "#087A36",
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 18,
    borderRadius: 10,
  },

  botaoAdicionarTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },

  infoCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  infoIcone: {
    fontSize: 25,
    marginBottom: 5,
  },

  infoTitulo: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },

  infoValorVerde: {
    fontSize: 18,
    fontWeight: "900",
    color: "#087A36",
    marginTop: 5,
  },

  infoDescricao: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
  },

  // ==========================================
  // LANÇAR DIA
  // ==========================================

  lancarArea: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  lancarTitulo: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F2937",
    textAlign: "center",
  },

  lancarDescricao: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 14,
  },

  botaoLancarDia: {
    backgroundColor: "#087A36",
    borderRadius: 12,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoLancarDiaTexto: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  // ==========================================
  // MODAIS
  // ==========================================

  modalFundo: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 14,
  },

  modalTitulo: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },

  dicaHoras: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 10,
  },

  modalBotoes: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },

  botaoCancelar: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },

  botaoConfirmar: {
    backgroundColor: "#087A36",
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  botaoConfirmarTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  // ==========================================
  // HISTÓRICO
  // ==========================================

  historicoTela: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  historicoHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  historicoTitulo: {
    fontSize: 25,
    fontWeight: "900",
    color: "#087A36",
  },

  historicoSubtitulo: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  botaoFecharHistorico: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
  },

  botaoFecharHistoricoTexto: {
    fontSize: 22,
    color: "#1F2937",
  },

  filtrosHistorico: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  filtroBotao: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginHorizontal: 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },

  filtroBotaoAtivo: {
    backgroundColor: "#087A36",
    borderColor: "#087A36",
  },

  filtroTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },

  filtroTextoAtivo: {
    color: "#FFFFFF",
  },

  historicoScroll: {
    padding: 16,
    paddingBottom: 40,
  },

  historicoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  historicoCard: {
    width: "31.5%",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  historicoCardData: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },

  historicoCardLabel: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },

  historicoCardLiquido: {
    fontSize: 14,
    fontWeight: "900",
    color: "#087A36",
    marginTop: 3,
    textAlign: "center",
  },

  historicoCardToque: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 7,
    textAlign: "center",
  },

  historicoVazio: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 30,
    alignItems: "center",
    marginTop: 10,
    borderRadius: 12,
  },

  historicoVazioIcone: {
    fontSize: 40,
    marginBottom: 10,
  },

  historicoVazioTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
  },

  historicoVazioTexto: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
  },

  // ==========================================
  // DETALHES DO HISTÓRICO
  // ==========================================

  detalhesTela: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  detalhesHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  detalhesTitulo: {
    fontSize: 25,
    fontWeight: "900",
    color: "#087A36",
  },

  detalhesSubtitulo: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  detalhesScroll: {
    padding: 16,
    paddingBottom: 40,
  },

  detalhesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  detalhesCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  detalhesIcone: {
    fontSize: 24,
    marginBottom: 5,
  },

  detalhesLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  detalhesValor: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1F2937",
    marginTop: 4,
  },

  detalhesValorVerde: {
    fontSize: 17,
    fontWeight: "900",
    color: "#087A36",
    marginTop: 4,
  },

  detalhesValorVermelho: {
    fontSize: 17,
    fontWeight: "900",
    color: "#C62828",
    marginTop: 4,
  },

  detalhesValorLiquido: {
    fontSize: 18,
    fontWeight: "900",
    color: "#087A36",
    marginTop: 4,
  },

  detalhesSecao: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  detalhesSecaoTitulo: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 12,
  },

  detalheLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  detalheLinhaNome: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },

  detalheLinhaValor: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },

  detalheLinhaValorVermelho: {
    fontSize: 14,
    fontWeight: "800",
    color: "#C62828",
  },
});
