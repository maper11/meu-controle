import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
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

  const [telaConfiguracoes, setTelaConfiguracoes] =
    useState(false);

  const [periodoSelecionado, setPeriodoSelecionado] =
    useState("semanal");

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
      tipo: "",
      litros: 0,
      precoLitro: 0,
      kwh: 0,
      precoKwh: 0,
      total: 0,
    });

  const [tipoCombustivelInput, setTipoCombustivelInput] =
    useState("");

  const [litrosInput, setLitrosInput] =
    useState("");

  const [precoLitroInput, setPrecoLitroInput] =
    useState("");

  const [kwhInput, setKwhInput] =
    useState("");

  const [precoKwhInput, setPrecoKwhInput] =
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

  const [modalResumoGeral, setModalResumoGeral] =
    useState(false);

  const [modalDetalhesHistorico, setModalDetalhesHistorico] =
    useState(false);

  const [modalGraficoDetalhes, setModalGraficoDetalhes] =
    useState(false);

  const [itemGraficoSelecionado, setItemGraficoSelecionado] =
    useState(null);

  const [mesGraficoSelecionado, setMesGraficoSelecionado] =
    useState(null);

  // ==========================================
  // SELEÇÕES
  // ==========================================

  const [appSelecionado, setAppSelecionado] =
    useState(null);

  const [diaHistoricoSelecionado, setDiaHistoricoSelecionado] =
    useState(null);

  const [dataEmEdicao, setDataEmEdicao] =
    useState(null);

  const [valorFaturamentoInput, setValorFaturamentoInput] =
    useState("");

  // ==========================================
  // HISTÓRICO
  // ==========================================

  const [historico, setHistorico] =
    useState([]);

    const [diaParaExcluir, setDiaParaExcluir] =
  useState(null);

const [modalConfirmarExclusao, setModalConfirmarExclusao] =
  useState(false);

  const [filtroHistorico, setFiltroHistorico] =
    useState("todos");

  // ==========================================
  // META MENSAL
  // ==========================================

  const [metaMensal, setMetaMensal] =
    useState(5000);

  const [metaMensalInput, setMetaMensalInput] =
    useState("");

  const [modalMetaMensal, setModalMetaMensal] =
    useState(false);

    function iniciarNovoDia() {
  setAplicativos([]);
  setNovoApp("");
  setValorNovoApp("");

  setDespesas([]);
  setNovaDespesa("");
  setValorNovaDespesa("");

  setCombustivel({
      tipo: "",
      litros: 0,
      precoLitro: 0,
      kwh: 0,
      precoKwh: 0,
      total: 0,
    });

  setLitrosInput("");
  setPrecoLitroInput("");
  setKwhInput("");
  setPrecoKwhInput("");
  setTipoCombustivelInput("");

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
            metaMensal: 5000,
          };

      setMetaMensal(
        Number(config.metaMensal || 5000)
      );

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
      tipo: "",
      litros: 0,
      precoLitro: 0,
      kwh: 0,
      precoKwh: 0,
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
    listaDespesas = despesas,
    metaMensalSalva = metaMensal
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

        metaMensal: Number(metaMensalSalva || 5000),
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
  // CONFIGURAÇÕES
  // ==========================================

  function abrirConfiguracoes() {
    setTelaConfiguracoes(true);
  }

  function fecharConfiguracoes() {
    setTelaConfiguracoes(false);
  }

  function abrirOpcaoEmBreve(nome) {
    Alert.alert(
      nome,
      "Essa opção será implementada nas próximas versões do Meu Controle."
    );
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
      tipo: "",
      litros: 0,
      precoLitro: 0,
      kwh: 0,
      precoKwh: 0,
      total: 0,
    });

    setQuilometragem(0);

    setHorasTrabalhadas("");

    setLitrosInput("");
    setPrecoLitroInput("");
    setKwhInput("");
    setPrecoKwhInput("");
    setTipoCombustivelInput("");
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
      const dataDoLancamento = dataEmEdicao || hoje;

      const dadosSalvos =
        await AsyncStorage.getItem(CHAVE_DADOS);

      const dados = dadosSalvos
        ? JSON.parse(dadosSalvos)
        : {};

      const novoRegistro = {
        data: dataDoLancamento,
        aplicativos,
        despesas,
        combustivel,
        quilometragem,
        horasTrabalhadas,
      };

      // Salva o dia somente agora.
      dados[dataDoLancamento] = novoRegistro;

      await AsyncStorage.setItem(
        CHAVE_DADOS,
        JSON.stringify(dados)
      );

      const novoHistorico =
        Object.values(dados).sort((a, b) =>
          b.data.localeCompare(a.data)
        );

      setHistorico(novoHistorico);
      setDataEmEdicao(null);

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
      tipo: "",
      litros: 0,
      precoLitro: 0,
      kwh: 0,
      precoKwh: 0,
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
    setTipoCombustivelInput(
      combustivel.tipo || ""
    );

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

    setKwhInput(
      combustivel.kwh
        ? String(
            combustivel.kwh
          ).replace(".", ",")
        : ""
    );

    setPrecoKwhInput(
      combustivel.precoKwh
        ? String(
            combustivel.precoKwh
          ).replace(".", ",")
        : ""
    );

    setModalCombustivel(true);
  }

  function salvarCombustivel() {
    const tipo = tipoCombustivelInput;

    if (!tipo) {
      setCombustivel({
        tipo: "",
        litros: 0,
        precoLitro: 0,
        kwh: 0,
        precoKwh: 0,
        total: 0,
      });

      setModalCombustivel(false);
      return;
    }

    if (tipo === "Elétrico") {
      const kwh = Number(
        kwhInput.replace(",", ".")
      );

      const precoKwh = Number(
        precoKwhInput.replace(",", ".")
      );

      const total = kwh * precoKwh;

      setCombustivel({
        tipo,
        litros: 0,
        precoLitro: 0,
        kwh: isNaN(kwh) ? 0 : kwh,
        precoKwh: isNaN(precoKwh) ? 0 : precoKwh,
        total: isNaN(total) ? 0 : total,
      });
    } else {
      const litros = Number(
        litrosInput.replace(",", ".")
      );

      const precoLitro = Number(
        precoLitroInput.replace(",", ".")
      );

      const total = litros * precoLitro;

      setCombustivel({
        tipo,
        litros: isNaN(litros) ? 0 : litros,
        precoLitro: isNaN(precoLitro) ? 0 : precoLitro,
        kwh: 0,
        precoKwh: 0,
        total: isNaN(total) ? 0 : total,
      });
    }

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
    const texto = horasTrabalhadasInput.trim();

    if (!texto) {
      setHorasTrabalhadas("");
      setModalHorasTrabalhadas(false);
      return;
    }

    const textoComDoisPontos = texto.match(
      /^(\d+)\s*:\s*(\d{1,2})$/
    );

    if (textoComDoisPontos) {
      const horas = Number(textoComDoisPontos[1]);
      const minutos = Number(textoComDoisPontos[2]);

      if (minutos < 60) {
        setHorasTrabalhadas(
          horas + "h" + (minutos > 0 ? minutos + "min" : "")
        );
        setModalHorasTrabalhadas(false);
        return;
      }
    }

    const textoNormalizado = texto
      .replace(/\s*horas?$/i, "h")
      .replace(/\s*minutos?$/i, "min");

    const possuiUnidade =
      /h/i.test(textoNormalizado) ||
      /min/i.test(textoNormalizado);

    const valorNumerico = Number(
      textoNormalizado.replace(",", ".")
    );

    setHorasTrabalhadas(
      possuiUnidade
        ? textoNormalizado
        : !isNaN(valorNumerico)
          ? textoNormalizado + "h"
          : textoNormalizado
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

  function obterResumoMetaMensal() {
    const hoje = dataDoHistoricoParaDate(obterDataAtual());

    const registrosDoMes = historico.filter((dia) => {
      const data = dataDoHistoricoParaDate(dia.data);
      return (
        data.getFullYear() === hoje.getFullYear() &&
        data.getMonth() === hoje.getMonth()
      );
    });

    const totalMes = registrosDoMes.reduce(
      (total, dia) => total + calcularDadosDoDia(dia).liquidoDia,
      0
    );

    const meta = Number(metaMensal || 0);
    const percentual = meta > 0 ? (totalMes / meta) * 100 : 0;
    const percentualBarra = Math.min(Math.max(percentual, 0), 100);
    const falta = Math.max(meta - totalMes, 0);

    return { totalMes, meta, percentual, percentualBarra, falta };
  }

  function obterResumoDosRegistros(registros) {
    return registros.reduce(
      (total, dia) => {
        const dados = calcularDadosDoDia(dia);

        total.faturamento += dados.faturamentoDia;
        total.despesas += dados.totalDespesasDia;
        total.liquido += dados.liquidoDia;
        total.horas += dados.horasNumericas;
        total.km += Number(dia.quilometragem || 0);

        return total;
      },
      {
        faturamento: 0,
        despesas: 0,
        liquido: 0,
        horas: 0,
        km: 0,
      }
    );
  }

  function obterResumoHoje() {
    const hoje = obterDataAtual();
    const registro = historico.find((dia) => dia.data === hoje);

    if (!registro) {
      return {
        faturamento: 0,
        despesas: 0,
        liquido: 0,
        horas: 0,
        km: 0,
      };
    }

    return obterResumoDosRegistros([registro]);
  }

  function obterResumoMesAtual() {
    const hoje = dataDoHistoricoParaDate(obterDataAtual());

    const registros = historico.filter((dia) => {
      const data = dataDoHistoricoParaDate(dia.data);

      return (
        data.getFullYear() === hoje.getFullYear() &&
        data.getMonth() === hoje.getMonth()
      );
    });

    return {
      ...obterResumoDosRegistros(registros),
      dias: registros.length,
    };
  }

  function abrirSobreAplicativo() {
    Alert.alert(
      "Meu Controle",
      "Aplicativo para acompanhar faturamento, despesas, horas e quilometragem do trabalho.",
      [{ text: "OK" }]
    );
  }

  function abrirMetaMensal() {
    setMetaMensalInput(
      String(metaMensal || "").replace(".", ",")
    );
    setModalMetaMensal(true);
  }

  function salvarMetaMensal() {
    const valor = Number(metaMensalInput.replace(",", "."));

    if (isNaN(valor) || valor <= 0) {
      return;
    }

    setMetaMensal(valor);
    setModalMetaMensal(false);
    salvarConfiguracao(aplicativos, despesas, valor);
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

  function obterDadosGrafico() {
  const hoje = dataDoHistoricoParaDate(
    obterDataAtual()
  );

  if (periodoSelecionado === "semanal") {
    const diaSemana = hoje.getDay();
    const diferencaParaSegunda =
      diaSemana === 0 ? 6 : diaSemana - 1;

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(
      hoje.getDate() - diferencaParaSegunda
    );
    inicioSemana.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, indice) => {
      const data = new Date(inicioSemana);
      data.setDate(
        inicioSemana.getDate() + indice
      );

      const chave = [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, "0"),
        String(data.getDate()).padStart(2, "0"),
      ].join("-");

      const registro = historico.find(
        (dia) => dia.data === chave
      );

      const dados = registro
        ? calcularDadosDoDia(registro)
        : { liquidoDia: 0 };

      const nomesDias = [
        "Seg",
        "Ter",
        "Qua",
        "Qui",
        "Sex",
        "Sáb",
        "Dom",
      ];

      return {
        chave,
        rotulo: nomesDias[indice],
        data: data.getDate(),
        valor: dados.liquidoDia,
        temRegistro: !!registro,
      };
    });
  }

  if (periodoSelecionado === "mensal") {
    const nomesMeses = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    return nomesMeses.map((rotulo, mes) => {
      const registros = historico.filter((dia) => {
        const data = dataDoHistoricoParaDate(
          dia.data
        );

        return (
          data.getFullYear() === hoje.getFullYear() &&
          data.getMonth() === mes
        );
      });

      const valor = registros.reduce(
        (total, dia) =>
          total + calcularDadosDoDia(dia).liquidoDia,
        0
      );

      return {
        chave: `${hoje.getFullYear()}-${String(
          mes + 1
        ).padStart(2, "0")}`,
        rotulo,
        valor,
        temRegistro: registros.length > 0,
      };
    });
  }

  const anosRegistrados = historico.map((dia) =>
    dataDoHistoricoParaDate(dia.data).getFullYear()
  );

  const primeiroAno =
    anosRegistrados.length > 0
      ? Math.min(...anosRegistrados)
      : hoje.getFullYear();

  const quantidadeAnos =
    hoje.getFullYear() - primeiroAno + 1;

  return Array.from(
    { length: quantidadeAnos },
    (_, indice) => {
      const ano = primeiroAno + indice;

      const registros = historico.filter((dia) => {
        const data = dataDoHistoricoParaDate(
          dia.data
        );

        return data.getFullYear() === ano;
      });

      const valor = registros.reduce(
        (total, dia) =>
          total + calcularDadosDoDia(dia).liquidoDia,
        0
      );

      return {
        chave: String(ano),
        rotulo: String(ano),
        valor,
        temRegistro: registros.length > 0,
      };
    }
  );
}

  async function excluirDiaDoHistorico(
    dataParaExcluir
  ) {
    try {
      const dadosSalvos =
        await AsyncStorage.getItem(CHAVE_DADOS);

      const dados = dadosSalvos
        ? JSON.parse(dadosSalvos)
        : {};

      delete dados[dataParaExcluir];

      await AsyncStorage.setItem(
        CHAVE_DADOS,
        JSON.stringify(dados)
      );

      const historicoAtualizado =
        Object.values(dados).sort((a, b) =>
          b.data.localeCompare(a.data)
        );

      setHistorico(historicoAtualizado);

      if (
        diaHistoricoSelecionado?.data ===
        dataParaExcluir
      ) {
        setDiaHistoricoSelecionado(null);
        setModalDetalhesHistorico(false);
      }
    } catch (erro) {
      console.log(
        "Erro ao excluir dia:",
        erro
      );
    }
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

  function editarDiaHistorico(diaParaEditar = diaHistoricoSelecionado) {
    if (!diaParaEditar) {
      return;
    }

    setDataEmEdicao(diaParaEditar.data);

    setAplicativos(
      (diaParaEditar.aplicativos || []).map((app) => ({
        ...app,
        valor: Number(app.valor || 0),
      }))
    );

    setDespesas(
      (diaParaEditar.despesas || []).map((despesa) => ({
        ...despesa,
        valor: Number(despesa.valor || 0),
      }))
    );

    const combustivelDoDia = diaParaEditar.combustivel || {};

    setCombustivel({
      tipo: combustivelDoDia.tipo || "",
      litros: Number(combustivelDoDia.litros || 0),
      precoLitro: Number(combustivelDoDia.precoLitro || 0),
      kwh: Number(combustivelDoDia.kwh || 0),
      precoKwh: Number(combustivelDoDia.precoKwh || 0),
      total: Number(combustivelDoDia.total || 0),
    });

    setQuilometragem(Number(diaParaEditar.quilometragem || 0));
    setHorasTrabalhadas(diaParaEditar.horasTrabalhadas || "");

    setModalDetalhesHistorico(false);
    setDiaHistoricoSelecionado(null);
    setTelaAtual("cadastro");
  }

  function fecharDetalhesHistorico() {
    setModalDetalhesHistorico(
      false
    );

    setDiaHistoricoSelecionado(
      null
    );
  }

  const dadosGrafico = obterDadosGrafico();

const maiorValorGrafico = Math.max(
  ...dadosGrafico.map((item) =>
    Math.abs(item.valor)
  ),
  1
);

  // ==========================================
  // HISTÓRICO
  // ==========================================

  function abrirHistorico() {
    carregarDados();
    setModalHistorico(true);
  }

  function obterResumoHistoricoGeral() {
    const anoAtual = dataDoHistoricoParaDate(obterDataAtual()).getFullYear();

    const registrosDoAno = historico.filter((dia) => {
      const data = dataDoHistoricoParaDate(dia.data);
      return data.getFullYear() === anoAtual;
    });

    return registrosDoAno.reduce(
      (total, dia) => {
        const dados = calcularDadosDoDia(dia);

        total.faturamento += dados.faturamentoDia;
        total.despesas += dados.totalDespesasDia;
        total.liquido += dados.liquidoDia;
        total.horas += dados.horasNumericas;
        total.km += Number(dia.quilometragem || 0);

        return total;
      },
      {
        faturamento: 0,
        despesas: 0,
        liquido: 0,
        horas: 0,
        km: 0,
        diasTrabalhados: registrosDoAno.length,
      }
    );
  }

  function formatarHorasTotais(horas) {
    if (!horas || horas <= 0) {
      return "0h";
    }

    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);

    if (minutos === 60) {
      return (horasInteiras + 1) + "h";
    }

    if (minutos === 0) {
      return horasInteiras + "h";
    }

    return horasInteiras + "h" + minutos + "min";
  }

  function renderizarHistoricoGeral() {
    const resumo = obterResumoHistoricoGeral();

    return (
      <ScrollView contentContainerStyle={styles.detalhesScroll}>
        <View style={styles.detalhesGrid}>
          <View style={styles.detalhesCard}>
            <Text style={styles.detalhesIcone}>💰</Text>
            <Text style={styles.detalhesLabel}>Líquido total</Text>
            <Text style={styles.detalhesValorLiquido} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {formatarMoeda(resumo.liquido)}
            </Text>
          </View>

          <View style={styles.detalhesCard}>
            <Text style={styles.detalhesIcone}>📈</Text>
            <Text style={styles.detalhesLabel}>Faturamento total</Text>
            <Text style={styles.detalhesValor} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {formatarMoeda(resumo.faturamento)}
            </Text>
          </View>

          <View style={styles.detalhesCard}>
            <Text style={styles.detalhesIcone}>💸</Text>
            <Text style={styles.detalhesLabel}>Despesas totais</Text>
            <Text style={styles.detalhesValorVermelho} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {formatarMoeda(resumo.despesas)}
            </Text>
          </View>

          <View style={styles.detalhesCard}>
            <Text style={styles.detalhesIcone}>📅</Text>
            <Text style={styles.detalhesLabel}>Dias trabalhados</Text>
            <Text style={styles.detalhesValor}>
              {resumo.diasTrabalhados}
            </Text>
          </View>

          <View style={styles.detalhesCard}>
            <Text style={styles.detalhesIcone}>⏱️</Text>
            <Text style={styles.detalhesLabel}>Horas trabalhadas</Text>
            <Text style={styles.detalhesValor} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {formatarHorasTotais(resumo.horas)}
            </Text>
          </View>

          <View style={styles.detalhesCard}>
            <Text style={styles.detalhesIcone}>🚗</Text>
            <Text style={styles.detalhesLabel}>Km rodados</Text>
            <Text style={styles.detalhesValor} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
              {resumo.km} km
            </Text>
          </View>
        </View>

        {(() => {
          const resumoMes = obterResumoMesAtual();

          return (
            <View style={styles.historicoResumoMes}>
              <Text style={styles.historicoResumoMesTitulo}>
                📅 Resumo deste mês
              </Text>

              <View style={styles.historicoResumoMesGrid}>
                <View style={styles.historicoResumoMesItem}>
                  <Text style={styles.historicoResumoMesLabel}>
                    Líquido
                  </Text>
                  <Text
                    style={styles.detalhesValorLiquido}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatarMoeda(resumoMes.liquido)}
                  </Text>
                </View>

                <View style={styles.historicoResumoMesItem}>
                  <Text style={styles.historicoResumoMesLabel}>
                    Faturamento
                  </Text>
                  <Text
                    style={styles.detalhesValor}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatarMoeda(resumoMes.faturamento)}
                  </Text>
                </View>

                <View style={styles.historicoResumoMesItem}>
                  <Text style={styles.historicoResumoMesLabel}>
                    Despesas
                  </Text>
                  <Text
                    style={styles.detalhesValorVermelho}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatarMoeda(resumoMes.despesas)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })()}

        {resumo.diasTrabalhados === 0 && (
          <View style={styles.historicoVazio}>
            <Text style={styles.historicoVazioIcone}>📊</Text>
            <Text style={styles.historicoVazioTitulo}>
              Nenhum registro neste ano
            </Text>
            <Text style={styles.historicoVazioTexto}>
              Cadastre seus dias para acompanhar o resultado do ano.
            </Text>
          </View>
        )}
      </ScrollView>
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
              <View
                key={dia.data}
                style={
                  styles.historicoCard
                }
              >
                <Pressable
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

                <Pressable
                  style={styles.botaoExcluirHistorico}
                  onPress={() => {
                    setDiaParaExcluir(dia.data);
                    setModalConfirmarExclusao(true);
                  }}
                >
                  <Text style={styles.botaoExcluirHistoricoTexto}>
                    🗑️ Excluir
                  </Text>
                </Pressable>
              </View>
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
    if (!diaHistoricoSelecionado) {
      return null;
    }

    const dia = diaHistoricoSelecionado;
    const dados = calcularDadosDoDia(dia);
    const km = Number(dia.quilometragem || 0);
    const ganhoPorKm = km > 0 ? dados.liquidoDia / km : 0;
    const custoPorKm = km > 0 ? dados.totalDespesasDia / km : 0;

    return (
      <Modal
        visible={modalDetalhesHistorico}
        animationType="slide"
        onRequestClose={fecharDetalhesHistorico}
      >
        <View style={styles.detalhesTela}>
          <View style={styles.detalhesHeader}>
            <View>
              <Text style={styles.detalhesTitulo}>
                {formatarData(dia.data)}
              </Text>

              <Text style={styles.detalhesSubtitulo}>
                {dataEmEdicao ? "Editando este dia" : "Resumo do dia"}
              </Text>
            </View>

            <View style={styles.detalhesHeaderBotoes}>
              <Pressable
                style={styles.botaoEditarDia}
                onPress={() => editarDiaHistorico(dia)}
              >
                <Text style={styles.botaoEditarDiaTexto}>
                  ✏️ Editar
                </Text>
              </Pressable>

              <Pressable
                style={styles.botaoFecharHistorico}
                onPress={fecharDetalhesHistorico}
              >
                <Text style={styles.botaoFecharHistoricoTexto}>
                  ✕
                </Text>
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.detalhesScroll}>
            {/* RESUMO PRINCIPAL */}
            <View style={styles.detalhesGrid}>
              <View style={styles.detalhesCard}>
                <Text style={styles.detalhesIcone}>💰</Text>
                <Text style={styles.detalhesLabel}>Líquido</Text>
                <Text
                  style={styles.detalhesValorLiquido}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {formatarMoeda(dados.liquidoDia)}
                </Text>
              </View>

              <View style={styles.detalhesCard}>
                <Text style={styles.detalhesIcone}>📈</Text>
                <Text style={styles.detalhesLabel}>Faturamento</Text>
                <Text
                  style={styles.detalhesValor}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {formatarMoeda(dados.faturamentoDia)}
                </Text>
              </View>

              <View style={styles.detalhesCard}>
                <Text style={styles.detalhesIcone}>💸</Text>
                <Text style={styles.detalhesLabel}>Despesas</Text>
                <Text
                  style={styles.detalhesValorVermelho}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {formatarMoeda(dados.totalDespesasDia)}
                </Text>
              </View>

              <View style={styles.detalhesCard}>
                <Text style={styles.detalhesIcone}>⏱️</Text>
                <Text style={styles.detalhesLabel}>Horas</Text>
                <Text
                  style={styles.detalhesValor}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {dia.horasTrabalhadas || "0h"}
                </Text>
              </View>

              <View style={styles.detalhesCard}>
                <Text style={styles.detalhesIcone}>💵</Text>
                <Text style={styles.detalhesLabel}>Ganho/h</Text>
                <Text
                  style={styles.detalhesValor}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {dados.horasNumericas > 0
                    ? formatarMoeda(dados.ganhoPorHora)
                    : "—"}
                </Text>
              </View>

              <View style={styles.detalhesCard}>
                <Text style={styles.detalhesIcone}>🚗</Text>
                <Text style={styles.detalhesLabel}>Km</Text>
                <Text
                  style={styles.detalhesValor}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {km} km
                </Text>
              </View>

              <View style={styles.detalhesCard}>
                <Text style={styles.detalhesIcone}>💰</Text>
                <Text style={styles.detalhesLabel}>Ganho/km</Text>
                <Text
                  style={styles.detalhesValor}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {km > 0 ? formatarMoeda(ganhoPorKm) : "—"}
                </Text>
              </View>

              <View style={styles.detalhesCard}>
                <Text style={styles.detalhesIcone}>⛽</Text>
                <Text style={styles.detalhesLabel}>Custo/km</Text>
                <Text
                  style={styles.detalhesValor}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {km > 0 ? formatarMoeda(custoPorKm) : "—"}
                </Text>
              </View>

              <View style={styles.detalhesCard}>
                <Text style={styles.detalhesIcone}>🎯</Text>
                <Text style={styles.detalhesLabel}>% da meta</Text>
                <Text
                  style={styles.detalhesValorVerde}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {metaMensal > 0
                    ? `${((dados.liquidoDia / metaMensal) * 100).toFixed(1).replace(".", ",")}%`
                    : "—"}
                </Text>
              </View>
            </View>

            {/* GANHOS POR APLICATIVO */}
            {(dia.aplicativos || []).length > 0 && (
              <View style={styles.detalhesSecao}>
                <Text style={styles.detalhesSecaoTitulo}>
                  📱 Ganhos por aplicativo
                </Text>

                {dia.aplicativos.map((app) => (
                  <View key={app.id} style={styles.detalheLinha}>
                    <Text style={styles.detalheLinhaNome}>
                      {app.nome}
                    </Text>

                    <Text style={styles.detalheLinhaValor}>
                      {formatarMoeda(app.valor)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* DESPESAS */}
            {((dia.despesas || []).length > 0 ||
              Number(dia.combustivel?.total || 0) > 0) && (
              <View style={styles.detalhesSecao}>
                <Text style={styles.detalhesSecaoTitulo}>
                  💸 Despesas
                </Text>

                {(dia.despesas || []).map((despesa) => (
                  <View key={despesa.id} style={styles.detalheLinha}>
                    <Text style={styles.detalheLinhaNome}>
                      {despesa.icone} {despesa.nome}
                    </Text>

                    <Text style={styles.detalheLinhaValorVermelho}>
                      {formatarMoeda(despesa.valor)}
                    </Text>
                  </View>
                ))}

                {Number(dia.combustivel?.total || 0) > 0 && (
                  <View style={styles.detalheLinha}>
                    <Text style={styles.detalheLinhaNome}>
                      {dia.combustivel?.tipo === "Elétrico"
                        ? "⚡ Energia"
                        : "⛽ Combustível"}
                    </Text>

                    <Text style={styles.detalheLinhaValorVermelho}>
                      {formatarMoeda(dia.combustivel?.total)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  }

  function abrirDetalhesDoGrafico(item) {
    if (periodoSelecionado === "semanal") {
      const registro = historico.find(
        (dia) => dia.data === item.chave
      );

      if (registro) {
        setDiaHistoricoSelecionado(registro);
        setModalDetalhesHistorico(true);
      }
      return;
    }

    setItemGraficoSelecionado(item);
    setModalGraficoDetalhes(true);
  }

  function fecharDetalhesDoGrafico() {
    setModalGraficoDetalhes(false);
    setItemGraficoSelecionado(null);
    setMesGraficoSelecionado(null);
  }

  function obterRegistrosDoMes(ano, mes) {
    return historico
      .filter((dia) => {
        const data = dataDoHistoricoParaDate(dia.data);
        return data.getFullYear() === ano && data.getMonth() === mes;
      })
      .sort((a, b) => a.data.localeCompare(b.data));
  }

  function obterRegistrosDoAno(ano) {
    return historico
      .filter((dia) =>
        dataDoHistoricoParaDate(dia.data).getFullYear() === ano
      )
      .sort((a, b) => a.data.localeCompare(b.data));
  }

  // ==========================================
  // TELA
  // ==========================================

  return (
    <View style={styles.container}>

      {/* ====================================== */}
      {/* DASHBOARD INICIAL */}
      {/* ====================================== */}

      {telaConfiguracoes ? (
        <View style={styles.configuracoesTela}>
          <View style={styles.configuracoesHeader}>
            <View>
              <Text style={styles.configuracoesTitulo}>Configurações</Text>
              <Text style={styles.configuracoesSubtitulo}>Opções do Meu Controle</Text>
            </View>

            <Pressable
              style={styles.botaoFecharConfiguracoes}
              onPress={fecharConfiguracoes}
            >
              <Text style={styles.botaoFecharConfiguracoesTexto}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.configuracoesScroll}>
            <Pressable style={styles.configuracaoCard} onPress={() => abrirOpcaoEmBreve("Minha conta")}>
              <Text style={styles.configuracaoIcone}>👤</Text>
              <View style={styles.configuracaoTextoArea}>
                <Text style={styles.configuracaoTitulo}>Minha conta</Text>
                <Text style={styles.configuracaoDescricao}>Dados e informações da sua conta</Text>
              </View>
              <Text style={styles.configuracaoSeta}>›</Text>
            </Pressable>

            <Pressable style={styles.configuracaoCard} onPress={() => abrirOpcaoEmBreve("Backup")}>
              <Text style={styles.configuracaoIcone}>💾</Text>
              <View style={styles.configuracaoTextoArea}>
                <Text style={styles.configuracaoTitulo}>Backup</Text>
                <Text style={styles.configuracaoDescricao}>Salvar uma cópia dos seus dados</Text>
              </View>
              <Text style={styles.configuracaoSeta}>›</Text>
            </Pressable>

            <Pressable style={styles.configuracaoCard} onPress={() => abrirOpcaoEmBreve("Restaurar backup")}>
              <Text style={styles.configuracaoIcone}>📥</Text>
              <View style={styles.configuracaoTextoArea}>
                <Text style={styles.configuracaoTitulo}>Restaurar backup</Text>
                <Text style={styles.configuracaoDescricao}>Recuperar dados de uma cópia salva</Text>
              </View>
              <Text style={styles.configuracaoSeta}>›</Text>
            </Pressable>

            <Pressable style={styles.configuracaoCard} onPress={() => setModalMetaMensal(true)}>
              <Text style={styles.configuracaoIcone}>🎯</Text>
              <View style={styles.configuracaoTextoArea}>
                <Text style={styles.configuracaoTitulo}>Meta mensal</Text>
                <Text style={styles.configuracaoDescricao}>Definir seu objetivo de faturamento</Text>
              </View>
              <Text style={styles.configuracaoSeta}>›</Text>
            </Pressable>

            <Pressable style={styles.configuracaoCard} onPress={abrirSobreAplicativo}>
              <Text style={styles.configuracaoIcone}>ℹ️</Text>
              <View style={styles.configuracaoTextoArea}>
                <Text style={styles.configuracaoTitulo}>Sobre o aplicativo</Text>
                <Text style={styles.configuracaoDescricao}>Informações sobre o Meu Controle</Text>
              </View>
              <Text style={styles.configuracaoSeta}>›</Text>
            </Pressable>
          </ScrollView>
        </View>
      ) : telaAtual === "inicio" ? (
        <>
          <View
            style={
              styles.dashboardHeader
            }
          >
            <Text style={styles.titulo}>
              Meu Controle
            </Text>

            <Pressable
              style={styles.botaoConfiguracoes}
              onPress={abrirConfiguracoes}
            >
              <Text style={styles.botaoConfiguracoesTexto}>⚙️</Text>
            </Pressable>
          </View>
          <View
            style={
              styles.periodos
            }
          >
            {[
              {
                id: "semanal",
                texto: "Semana",
              },
              {
                id: "mensal",
                texto: "Mês",
              },
              {
                id: "anual",
                texto: "Ano",
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

          {(() => {
            const meta = obterResumoMetaMensal();

            return (
              <Pressable
                style={styles.metaMensalCard}
                onPress={abrirMetaMensal}
              >
                <View style={styles.metaMensalCabecalho}>
                  <View>
                    <Text style={styles.metaMensalTitulo}>
                      🎯 Meta mensal
                    </Text>
                    <Text style={styles.metaMensalValor}>
                      {formatarMoeda(meta.meta)}
                    </Text>
                  </View>

                  <Text style={styles.metaMensalEditar}>
                    ✏️ Editar
                  </Text>
                </View>

                <Text style={styles.metaMensalProgressoTexto}>
                  {formatarMoeda(meta.totalMes)} de {formatarMoeda(meta.meta)}
                </Text>

                <View style={styles.metaMensalBarraFundo}>
                  <View
                    style={[
                      styles.metaMensalBarraValor,
                      { width: `${meta.percentualBarra}%` },
                    ]}
                  />
                </View>

                <Text style={styles.metaMensalFalta}>
                  {meta.falta > 0
                    ? `Faltam ${formatarMoeda(meta.falta)} para atingir a meta`
                    : "Meta mensal atingida! 🎉"}
                </Text>
              </Pressable>
            );
          })()}

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
                {periodoSelecionado === "semanal"
                  ? "Esta semana"
                  : periodoSelecionado === "mensal"
                  ? `Este ano • ${obterDataAtual().slice(0, 4)}`
                  : "Histórico por ano"}
              </Text>

              <Text
                style={
                  styles.graficoSubtitulo
                }
              >
                Líquido
              </Text>

              <ScrollView
                horizontal={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={
                  styles.graficoScrollHorizontal
                }
              >
                {periodoSelecionado === "semanal" ? (
                  <View style={styles.graficoSemanaVertical}>
                    {dadosGrafico.map((item) => {
                      const largura =
                        item.valor === 0
                          ? 8
                          : Math.max(
                              (Math.abs(item.valor) /
                                maiorValorGrafico) *
                                100,
                              4
                            );

                      return (
                        <Pressable
                          key={item.chave}
                          style={styles.graficoDiaVertical}
                          onPress={() => abrirDetalhesDoGrafico(item)}
                          disabled={!item.temRegistro}
                        >
                          <View style={styles.graficoDiaCabecalho}>
                            <View style={styles.graficoDiaNome}>
                              <Text style={styles.graficoRotulo}>{item.rotulo}</Text>
                            </View>
                            <Text style={styles.graficoValorVertical}>
                              {item.valor === 0 ? "R$ 0" : formatarMoeda(item.valor)}
                            </Text>
                          </View>
                          <View style={styles.graficoLinhaFundo}>
                            <View
                              style={[
                                styles.graficoLinhaValor,
                                {
                                  width: `${largura}%`,
                                  backgroundColor:
                                    item.valor < 0 ? "#DC2626" : "#087A36",
                                },
                              ]}
                            />
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.graficoBarras,
                      periodoSelecionado === "mensal" && styles.graficoBarrasMensal,
                      { minWidth: "100%" },
                    ]}
                  >
                    {dadosGrafico.map((item) => {
                      const altura =
                        item.valor === 0
                          ? 8
                          : Math.max(
                              (Math.abs(item.valor) / maiorValorGrafico) * 90,
                              4
                            );

                      return (
                        <Pressable
                          key={item.chave}
                          style={[
                            styles.graficoColuna,
                            periodoSelecionado === "mensal" &&
                              styles.graficoColunaMensal,
                          ]}
                          onPress={() => abrirDetalhesDoGrafico(item)}
                          disabled={!item.temRegistro}
                        >
                          <Text style={styles.graficoValor}>
                            {item.valor === 0 ? "R$ 0" : formatarMoeda(item.valor)}
                          </Text>
                          <View
                            style={[
                              styles.graficoBarra,
                              {
                                height: altura,
                                backgroundColor:
                                  item.valor < 0 ? "#DC2626" : "#087A36",
                              },
                            ]}
                          />
                          <Text style={styles.graficoRotulo}>{item.rotulo}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}              </ScrollView>

              {periodoSelecionado ===
                "semanal" && (
                <Text
                  style={
                    styles.graficoLegenda
                  }
                >
                  A semana reinicia automaticamente toda segunda-feira.
                </Text>
              )}
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
                {dataEmEdicao
                  ? "Editar Dia"
                  : "Cadastrar Dia"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.botaoResumoGeral}
              onPress={() => setModalResumoGeral(true)}
            >
              <Text style={styles.botaoResumoGeralTexto}>
                📊 Resumo geral
              </Text>
            </Pressable>

            <Pressable
              style={styles.botaoHistorico}
              onPress={abrirHistorico}
            >
              <Text style={styles.botaoHistoricoTexto}>
                Histórico geral
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
              onPress={() => {
                setDataEmEdicao(null);
                setTelaAtual("inicio");
              }}
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

            {/* COMBUSTÍVEL / ENERGIA - OPCIONAL */}

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
                  {combustivel.tipo === "Elétrico"
                    ? "⚡"
                    : "    ⛽        ⚡"}
                </Text>

                <Text
                  style={
                    styles.cardTitulo
                  }
                >
                  {combustivel.tipo
                    ? combustivel.tipo
                    : "Combustível / Energia"}
                </Text>

                {combustivel.tipo ? (
                  <>
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
                      {combustivel.tipo === "Elétrico"
                        ? (combustivel.kwh || 0) + " kWh • " + formatarMoeda(combustivel.precoKwh || 0) + "/kWh"
                        : (combustivel.litros || 0) + " L • " + formatarMoeda(combustivel.precoLitro || 0) + "/L"}
                    </Text>
                  </>
                ) : (
                  <Text
                    style={
                      styles.cardDescricao
                    }
                  >
                    Opcional • toque para adicionar
                  </Text>
                )}
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
                  Km Total
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

            {/* DESPESAS */}

            <Text
              style={
                styles.secaoTitulo
              }
            >
              Despesas extras
            </Text>

            {despesas.length ===
            0 ? (
              <Text
                style={
                  styles.textoVazio
                }
              >
                Nenhuma despesa extra
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
                histórico.
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
              Combustível / Energia
            </Text>

            <Text
              style={styles.dicaHoras}
            >
              Opcional: preencha somente se abasteceu ou carregou o veículo hoje.
            </Text>

            <View style={styles.tipoCombustivelBotoes}>
              {[
                "Gasolina",
                "Etanol",
                "Diesel",
                "GNV",
                "Elétrico",
              ].map((tipo) => (
                <Pressable
                  key={tipo}
                  style={[
                    styles.tipoCombustivelBotao,
                    tipoCombustivelInput === tipo &&
                      styles.tipoCombustivelBotaoAtivo,
                  ]}
                  onPress={() =>
                    setTipoCombustivelInput(tipo)
                  }
                >
                  <Text
                    style={[
                      styles.tipoCombustivelTexto,
                      tipoCombustivelInput === tipo &&
                        styles.tipoCombustivelTextoAtivo,
                    ]}
                  >
                    {tipo}
                  </Text>
                </Pressable>
              ))}
            </View>

            {tipoCombustivelInput === "Elétrico" ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Quantidade de kWh"
                  value={kwhInput}
                  onChangeText={setKwhInput}
                  keyboardType="decimal-pad"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Preço por kWh"
                  value={precoKwhInput}
                  onChangeText={setPrecoKwhInput}
                  keyboardType="decimal-pad"
                />
              </>
            ) : tipoCombustivelInput ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Quantidade de litros"
                  value={litrosInput}
                  onChangeText={setLitrosInput}
                  keyboardType="decimal-pad"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Preço por litro"
                  value={precoLitroInput}
                  onChangeText={setPrecoLitroInput}
                  keyboardType="decimal-pad"
                />
              </>
            ) : null}

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
      {/* MODAL - META MENSAL */}
      {/* ====================================== */}

      <Modal
        visible={modalMetaMensal}
        transparent
        animationType="fade"
        onRequestClose={() => setModalMetaMensal(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>
              Meta mensal
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ex.: 5000"
              value={metaMensalInput}
              onChangeText={setMetaMensalInput}
              keyboardType="decimal-pad"
              autoFocus
            />

            <Text style={styles.dicaHoras}>
              Defina quanto você deseja ganhar de líquido por mês.
            </Text>

            <View style={styles.modalBotoes}>
              <Pressable
                style={styles.botaoCancelar}
                onPress={() => setModalMetaMensal(false)}
              >
                <Text>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.botaoConfirmar}
                onPress={salvarMetaMensal}
              >
                <Text style={styles.botaoConfirmarTexto}>
                  Salvar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ====================================== */}
      {/* MODAL - RESUMO GERAL */}
      {/* ====================================== */}

      <Modal
        visible={modalResumoGeral}
        animationType="slide"
        onRequestClose={() => setModalResumoGeral(false)}
      >
        <View style={styles.resumoGeralTela}>
          <View style={styles.resumoGeralHeader}>
            <View>
              <Text style={styles.resumoGeralTitulo}>Resumo geral</Text>
              <Text style={styles.resumoGeralSubtitulo}>
                Visão dos seus resultados
              </Text>
            </View>

            <Pressable
              style={styles.botaoFecharHistorico}
              onPress={() => setModalResumoGeral(false)}
            >
              <Text style={styles.botaoFecharHistoricoTexto}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.resumoGeralScroll}>
            {(() => {
              const mes = obterResumoMesAtual();
              const ano = obterResumoHistoricoGeral();

              return (
                <>
                  <Text style={styles.resumoGeralSecaoTitulo}>📅 Este mês</Text>
                  <View style={styles.resumoGeralGrid}>
                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>💰</Text>
                      <Text style={styles.detalhesLabel}>Líquido</Text>
                      <Text style={styles.detalhesValorLiquido} numberOfLines={1} adjustsFontSizeToFit>
                        {formatarMoeda(mes.liquido)}
                      </Text>
                    </View>

                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>📈</Text>
                      <Text style={styles.detalhesLabel}>Faturamento</Text>
                      <Text style={styles.detalhesValor} numberOfLines={1} adjustsFontSizeToFit>
                        {formatarMoeda(mes.faturamento)}
                      </Text>
                    </View>

                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>💸</Text>
                      <Text style={styles.detalhesLabel}>Despesas</Text>
                      <Text style={styles.detalhesValorVermelho} numberOfLines={1} adjustsFontSizeToFit>
                        {formatarMoeda(mes.despesas)}
                      </Text>
                    </View>

                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>⏱️</Text>
                      <Text style={styles.detalhesLabel}>Horas</Text>
                      <Text style={styles.detalhesValor}>{formatarHorasTotais(mes.horas)}</Text>
                    </View>

                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>🚗</Text>
                      <Text style={styles.detalhesLabel}>Km rodados</Text>
                      <Text style={styles.detalhesValor}>{mes.km} km</Text>
                    </View>

                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>📅</Text>
                      <Text style={styles.detalhesLabel}>Dias trabalhados</Text>
                      <Text style={styles.detalhesValor}>{mes.dias}</Text>
                    </View>
                  </View>

                  <Text style={styles.resumoGeralSecaoTitulo}>📊 Acumulado do ano</Text>
                  <View style={styles.resumoGeralGrid}>
                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>💰</Text>
                      <Text style={styles.detalhesLabel}>Líquido total</Text>
                      <Text style={styles.detalhesValorLiquido} numberOfLines={1} adjustsFontSizeToFit>
                        {formatarMoeda(ano.liquido)}
                      </Text>
                    </View>

                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>📈</Text>
                      <Text style={styles.detalhesLabel}>Faturamento total</Text>
                      <Text style={styles.detalhesValor} numberOfLines={1} adjustsFontSizeToFit>
                        {formatarMoeda(ano.faturamento)}
                      </Text>
                    </View>

                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>💸</Text>
                      <Text style={styles.detalhesLabel}>Despesas totais</Text>
                      <Text style={styles.detalhesValorVermelho} numberOfLines={1} adjustsFontSizeToFit>
                        {formatarMoeda(ano.despesas)}
                      </Text>
                    </View>

                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>📅</Text>
                      <Text style={styles.detalhesLabel}>Dias trabalhados</Text>
                      <Text style={styles.detalhesValor}>{ano.diasTrabalhados}</Text>
                    </View>

                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>⏱️</Text>
                      <Text style={styles.detalhesLabel}>Horas trabalhadas</Text>
                      <Text style={styles.detalhesValor}>{formatarHorasTotais(ano.horas)}</Text>
                    </View>

                    <View style={styles.detalhesCard}>
                      <Text style={styles.detalhesIcone}>🚗</Text>
                      <Text style={styles.detalhesLabel}>Km rodados</Text>
                      <Text style={styles.detalhesValor}>{ano.km} km</Text>
                    </View>
                  </View>
                </>
              );
            })()}
          </ScrollView>
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
                Histórico geral
              </Text>

              <Text
                style={
                  styles.historicoSubtitulo
                }
              >
                Resumo do ano {new Date().getFullYear()}
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

          {renderizarHistoricoGeral()}
        </View>
      </Modal>

      {/* DETALHES DO HISTÓRICO */}

      {renderizarDetalhesHistorico()}

      <Modal
        visible={modalGraficoDetalhes}
        transparent={true}
        animationType="slide"
        onRequestClose={fecharDetalhesDoGrafico}
      >
        <View style={styles.modalGraficoFundo}>
          <View style={styles.modalGraficoDetalhes}>
            <View style={styles.modalGraficoCabecalho}>
              <Text style={styles.modalGraficoTitulo}>
                {periodoSelecionado === "mensal"
                  ? itemGraficoSelecionado?.rotulo
                  : itemGraficoSelecionado?.rotulo}
              </Text>
              <Pressable
                onPress={fecharDetalhesDoGrafico}
                style={styles.modalGraficoFechar}
              >
                <Text style={styles.modalGraficoFecharTexto}>×</Text>
              </Pressable>
            </View>

            {periodoSelecionado === "mensal" &&
              itemGraficoSelecionado && (() => {
                const ano = Number(itemGraficoSelecionado.chave.slice(0, 4));
                const mes = Number(itemGraficoSelecionado.chave.slice(5, 7)) - 1;
                const registros = obterRegistrosDoMes(ano, mes);

                return (
                  <ScrollView
                    contentContainerStyle={styles.modalGraficoLista}
                  >
                    <Text style={styles.modalGraficoResumo}>
                      Total líquido: {formatarMoeda(itemGraficoSelecionado.valor)}
                    </Text>
                    {registros.length === 0 ? (
                      <Text style={styles.modalGraficoVazio}>
                        Nenhum dia cadastrado neste mês.
                      </Text>
                    ) : (
                      registros.map((dia) => {
                        const dados = calcularDadosDoDia(dia);
                        return (
                          <Pressable
                            key={dia.data}
                            style={styles.cardDiaGrafico}
                            onPress={() => {
                              setDiaHistoricoSelecionado(dia);
                              setModalGraficoDetalhes(false);
                              setModalDetalhesHistorico(true);
                            }}
                          >
                            <View>
                              <Text style={styles.cardDiaGraficoTitulo}>
                                Dia {Number(dia.data.slice(8, 10))}
                              </Text>
                              <Text style={styles.cardDiaGraficoSubtitulo}>
                                Toque para ver os detalhes
                              </Text>
                            </View>
                            <Text style={styles.cardDiaGraficoValor}>
                              {formatarMoeda(dados.liquidoDia)}
                            </Text>
                          </Pressable>
                        );
                      })
                    )}
                  </ScrollView>
                );
              })()}

            {periodoSelecionado === "anual" &&
              itemGraficoSelecionado && (() => {
                const ano = Number(itemGraficoSelecionado.chave);
                const meses = [
                  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                ];

                if (mesGraficoSelecionado) {
                  const mes = mesGraficoSelecionado.mes;
                  const registros = obterRegistrosDoMes(ano, mes);

                  return (
                    <ScrollView contentContainerStyle={styles.modalGraficoLista}>
                      <Text style={styles.modalGraficoResumo}>
                        {meses[mes]} • Total líquido: {formatarMoeda(mesGraficoSelecionado.valor)}
                      </Text>

                      {registros.length === 0 ? (
                        <Text style={styles.modalGraficoVazio}>
                          Nenhum dia cadastrado neste mês.
                        </Text>
                      ) : (
                        registros.map((dia) => {
                          const dados = calcularDadosDoDia(dia);
                          return (
                            <Pressable
                              key={dia.data}
                              style={styles.cardDiaGrafico}
                              onPress={() => {
                                setDiaHistoricoSelecionado(dia);
                                setModalGraficoDetalhes(false);
                                setModalDetalhesHistorico(true);
                              }}
                            >
                              <View>
                                <Text style={styles.cardDiaGraficoTitulo}>
                                  Dia {Number(dia.data.slice(8, 10))}
                                </Text>
                                <Text style={styles.cardDiaGraficoSubtitulo}>
                                  Toque para ver os detalhes
                                </Text>
                              </View>
                              <Text style={styles.cardDiaGraficoValor}>
                                {formatarMoeda(dados.liquidoDia)}
                              </Text>
                            </Pressable>
                          );
                        })
                      )}
                    </ScrollView>
                  );
                }

                return (
                  <ScrollView contentContainerStyle={styles.modalGraficoLista}>
                    <Text style={styles.modalGraficoResumo}>
                      Total do ano: {formatarMoeda(itemGraficoSelecionado.valor)}
                    </Text>

                    {meses.map((nomeMes, mes) => {
                      const registros = obterRegistrosDoMes(ano, mes);

                      if (registros.length === 0) {
                        return null;
                      }

                      const valorMes = registros.reduce(
                        (total, dia) =>
                          total + calcularDadosDoDia(dia).liquidoDia,
                        0
                      );

                      return (
                        <Pressable
                          key={mes}
                          style={styles.cardMesGrafico}
                          onPress={() => {
                            setMesGraficoSelecionado({
                              mes,
                              valor: valorMes,
                            });
                          }}
                        >
                          <View style={styles.cardMesGraficoCabecalho}>
                            <Text style={styles.cardMesGraficoTitulo}>
                              {nomeMes}
                            </Text>
                            <Text style={styles.cardMesGraficoValor}>
                              {formatarMoeda(valorMes)}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                );
              })()}
          </View>
          </View>
      </Modal>

      <Modal
  visible={modalConfirmarExclusao}
  transparent={true}
  animationType="fade"
  onRequestClose={() =>
    setModalConfirmarExclusao(false)
  }
>
  <View style={styles.modalConfirmacaoFundo}>
    <View style={styles.modalConfirmacao}>
      <Text style={styles.modalConfirmacaoTitulo}>
        Excluir registro?
      </Text>

      <Text style={styles.modalConfirmacaoTexto}>
        Tem certeza que deseja excluir o dia{" "}
        {diaParaExcluir
          ? formatarData(diaParaExcluir)
          : ""}?
      </Text>

      <View style={styles.modalConfirmacaoBotoes}>
        <Pressable
          style={styles.botaoCancelarExclusao}
          onPress={() =>
            setModalConfirmarExclusao(false)
          }
        >
          <Text style={styles.botaoCancelarExclusaoTexto}>
            Cancelar
          </Text>
        </Pressable>

        <Pressable
          style={styles.botaoConfirmarExclusao}
          onPress={() => {
            excluirDiaDoHistorico(diaParaExcluir);
            setModalConfirmarExclusao(false);
            setDiaParaExcluir(null);
          }}
        >
          <Text style={styles.botaoConfirmarExclusaoTexto}>
            Excluir
          </Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>
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

  configuracoesTela: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  configuracoesHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  configuracoesTitulo: {
    fontSize: 25,
    fontWeight: "900",
    color: "#087A36",
  },

  configuracoesSubtitulo: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  botaoFecharConfiguracoes: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoFecharConfiguracoesTexto: {
    fontSize: 22,
    color: "#1F2937",
  },

  configuracoesScroll: {
    padding: 16,
    paddingBottom: 40,
  },

  configuracaoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  configuracaoIcone: {
    fontSize: 27,
    width: 42,
  },

  configuracaoTextoArea: {
    flex: 1,
    marginLeft: 8,
  },

  configuracaoTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2937",
  },

  configuracaoDescricao: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  configuracaoSeta: {
    fontSize: 28,
    color: "#9CA3AF",
    marginLeft: 8,
  },

  botaoConfiguracoes: {
    position: "absolute",
    left: 16,
    top: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoConfiguracoesTexto: {
    fontSize: 23,
  },

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

  metaMensalCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  metaMensalCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  metaMensalTitulo: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1F2937",
  },

  metaMensalValor: {
    fontSize: 20,
    fontWeight: "900",
    color: "#087A36",
    marginTop: 3,
  },

  metaMensalEditar: {
    fontSize: 12,
    fontWeight: "800",
    color: "#087A36",
  },

  metaMensalProgressoTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginTop: 14,
    marginBottom: 7,
  },

  metaMensalBarraFundo: {
    width: "100%",
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
  },

  metaMensalBarraValor: {
    height: "100%",
    backgroundColor: "#087A36",
    borderRadius: 10,
  },

  metaMensalFalta: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 9,
  },

  resumoDashboardTitulo: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 10,
  },

  resumoDashboardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  resumoDashboardCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  resumoDashboardIcone: {
    fontSize: 22,
    marginBottom: 4,
  },

  resumoDashboardLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
  },

  resumoDashboardValor: {
    fontSize: 17,
    color: "#1F2937",
    fontWeight: "900",
    marginTop: 5,
  },

  resumoDashboardValorVerde: {
    fontSize: 17,
    color: "#087A36",
    fontWeight: "900",
    marginTop: 5,
  },

  resumoDashboardValorVermelho: {
    fontSize: 17,
    color: "#C62828",
    fontWeight: "900",
    marginTop: 5,
  },

  resumoMesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  resumoMesCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  resumoMesTitulo: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F2937",
  },

  resumoMesSubtitulo: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
    textTransform: "capitalize",
  },

  resumoMesDias: {
    fontSize: 12,
    fontWeight: "800",
    color: "#087A36",
    backgroundColor: "#E8F5EE",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },

  resumoMesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  resumoMesItem: {
    width: "48%",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  resumoMesLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  resumoMesValor: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1F2937",
    marginTop: 4,
  },

  resumoMesValorVerde: {
    fontSize: 16,
    fontWeight: "900",
    color: "#087A36",
    marginTop: 4,
  },

  resumoMesValorVermelho: {
    fontSize: 16,
    fontWeight: "900",
    color: "#C62828",
    marginTop: 4,
  },

  resumoGeralTela: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  resumoGeralHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  resumoGeralTitulo: {
    fontSize: 25,
    fontWeight: "900",
    color: "#087A36",
  },

  resumoGeralSubtitulo: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  resumoGeralScroll: {
    padding: 16,
    paddingBottom: 40,
  },

  resumoGeralSecaoTitulo: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 10,
    marginTop: 4,
  },

  resumoGeralGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  botaoResumoGeral: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#087A36",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 8,
  },

  botaoResumoGeralTexto: {
    color: "#087A36",
    fontSize: 15,
    fontWeight: "900",
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
    marginBottom: 4,
  },

  graficoSubtitulo: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
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
    minHeight: 260,
    justifyContent: "flex-end",
  },

  graficoScrollHorizontal: {
    minWidth: "100%",
  },

  graficoBarras: {
    minHeight: 180,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingHorizontal: 2,
    gap: 0,
  },

  graficoBarrasMensal: {
    minHeight: 300,
    alignContent: "flex-start",
  },

  graficoColuna: {
    width: "15%",
    height: 165,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  graficoBarra: {
    width: 14,
    borderRadius: 7,
    marginBottom: 7,
  },

  graficoSemanaVertical: {
    width: "100%",
    paddingVertical: 4,
  },

  graficoDiaVertical: {
    width: "100%",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  graficoDiaCabecalho: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  graficoDiaNome: {
    flexDirection: "row",
    alignItems: "center",
    width: 70,
  },

  graficoValorVertical: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4B5563",
  },

  graficoLinhaFundo: {
    width: "100%",
    height: 10,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },

  graficoLinhaValor: {
    height: "100%",
    borderRadius: 6,
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
    fontSize: 9,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 5,
  },

  graficoRotulo: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1F2937",
  },

  graficoData: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 2,
  },

  graficoLegenda: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
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

  tipoCombustivelBotoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    marginHorizontal: -4,
  },

  tipoCombustivelBotao: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 12,
    margin: 4,
  },

  tipoCombustivelBotaoAtivo: {
    backgroundColor: "#087A36",
    borderColor: "#087A36",
  },

  tipoCombustivelTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },

  tipoCombustivelTextoAtivo: {
    color: "#FFFFFF",
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

  historicoResumoMes: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginTop: 4,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  historicoResumoMesTitulo: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 10,
  },

  historicoResumoMesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  historicoResumoMesItem: {
    width: "31.5%",
    alignItems: "center",
  },

  historicoResumoMesLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
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
    fontSize: 12,
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

  detalhesHeaderBotoes: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  botaoEditarDia: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#E8F5EE",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoEditarDiaTexto: {
    color: "#087A36",
    fontSize: 13,
    fontWeight: "800",
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
    width: "23.5%",
    minHeight: 92,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 14,
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

modalConfirmacaoFundo: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
},

modalConfirmacao: {
  width: "100%",
  maxWidth: 380,
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: 24,
},

modalConfirmacaoTitulo: {
  fontSize: 22,
  fontWeight: "700",
  color: "#111827",
  marginBottom: 12,
},

modalConfirmacaoTexto: {
  fontSize: 16,
  color: "#4B5563",
  lineHeight: 24,
  marginBottom: 24,
},

modalConfirmacaoBotoes: {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: 10,
},

botaoCancelarExclusao: {
  paddingVertical: 12,
  paddingHorizontal: 18,
  borderRadius: 12,
  backgroundColor: "#E5E7EB",
},

botaoCancelarExclusaoTexto: {
  fontSize: 15,
  fontWeight: "600",
  color: "#374151",
},

botaoConfirmarExclusao: {
  paddingVertical: 12,
  paddingHorizontal: 18,
  borderRadius: 12,
  backgroundColor: "#DC2626",
},

botaoConfirmarExclusaoTexto: {
  fontSize: 15,
  fontWeight: "600",
  color: "#FFFFFF",
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
    fontSize: 12,
    fontWeight: "900",
    color: "#1F2937",
    marginTop: 4,
    textAlign: "center",
  },

  detalhesValorVerde: {
    fontSize: 12,
    fontWeight: "900",
    color: "#087A36",
    marginTop: 4,
    textAlign: "center",
  },

  detalhesValorVermelho: {
    fontSize: 12,
    fontWeight: "900",
    color: "#C62828",
    marginTop: 4,
    textAlign: "center",
  },

  detalhesValorLiquido: {
    fontSize: 12,
    fontWeight: "900",
    color: "#087A36",
    marginTop: 4,
    textAlign: "center",
    flexShrink: 1,
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

  // ==========================================
  // DETALHES DO GRÁFICO
  // ==========================================

  modalGraficoFundo: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },

  modalGraficoDetalhes: {
    width: "100%",
    maxHeight: "85%",
    backgroundColor: "#F5F7FA",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 20,
    overflow: "hidden",
  },

  modalGraficoCabecalho: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  modalGraficoTitulo: {
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    color: "#087A36",
  },

  modalGraficoFechar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  modalGraficoFecharTexto: {
    fontSize: 25,
    color: "#1F2937",
    lineHeight: 28,
  },

  modalGraficoLista: {
    padding: 16,
    paddingBottom: 30,
  },

  modalGraficoResumo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2937",
    elevation: 2,
  },

  modalGraficoVazio: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 22,
    textAlign: "center",
    color: "#6B7280",
  },

  cardDiaGrafico: {
    width: "100%",
    minHeight: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },

  cardDiaGraficoTitulo: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1F2937",
  },

  cardDiaGraficoSubtitulo: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 3,
  },

  cardDiaGraficoValor: {
    fontSize: 16,
    fontWeight: "900",
    color: "#087A36",
  },

  cardMesGrafico: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },

  cardMesGraficoCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  cardMesGraficoTitulo: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1F2937",
  },

  cardMesGraficoValor: {
    fontSize: 15,
    fontWeight: "900",
    color: "#087A36",
  },

  cardMesGraficoVazio: {
    fontSize: 12,
    color: "#9CA3AF",
    paddingVertical: 4,
  },

  cardDiaAnoGrafico: {
    width: "100%",
    minHeight: 42,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 7,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardDiaAnoTexto: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4B5563",
  },

  cardDiaAnoValor: {
    fontSize: 12,
    fontWeight: "900",
    color: "#087A36",
  },

});
