// constantes globais -------------------------------------------------------------------------

const LIMPAR = "LIMPAR";
const TRIM = "TRIM";
const EXTRAIR = "EXTRAIR";
const REMOVEREGEX = "REMOVEREGEX";

// loader de sessão ---------------------------------------------------------------------------

var sessao;
load();

function load() {
    let session = localStorage.getItem('sessao_extrator');
    if (session && session != "undefined") {
        sessao = JSON.parse(session);
    } else {
        create();
    }

    renderizarConfiguracoes();
    renderizarVersoes();
}

function create() {
    sessao = {
        exibirLinha: false,
        historico: []
    }

    save();
}

function save() {
    localStorage.setItem('sessao_extrator', JSON.stringify(sessao));
}

// renderização de componentes ----------------------------------------------------------------

propriedadesAdicionais();
function propriedadesAdicionais() {
    let dica = "Digite a expressão que deseja procurar para uma busca do tipo LIKE. \n\n" +
        "Digite [exp1]?ext?[exp2] para extrair o texto entre duas expressões. \n\n";


    document.getElementById('include').setAttribute('title', dica);
}

function renderizarVersoes() {
    let remover = document.getElementById("limparVersoes");

    for (const versao of sessao.historico) {
        let button = document.createElement("button");
        button.setAttribute("onclick", `obterVersao('${versao.hora}')`);
        button.setAttribute("class", "versao");
        button.innerText = obterTexto(versao);

        remover.after(button);
        remover.after(document.createElement("br"));
    }
}

function carregarVersoes() {
    limparVersoesHTML();
    setTimeout(renderizarVersoes, 50);
}

function obterTexto(versao) {
    let texto = versao.texto;

    texto = texto.replaceAll("\n", "");
    texto = texto.replaceAll("\r", "");

    if (texto.length > 50) {
        texto = texto.substring(0, 50) + "...";
    }

    if (texto == "") {
        texto = "vazio";
    }

    return versao.hora + " - " + texto;
}

function obterVersao(hora) {
    for (const versao of sessao.historico) {
        if (versao.hora == hora) {
            textarea.value = versao.texto;
        }
    }
}

function limparVersoesHTML() {
    let versoes = document.getElementsByClassName("versao");

    while (versoes.length > 0) {
        versoes[0].remove();
    }
}

function renderizarConfiguracoes() {
    sessao.exibirLinha && definirVerdadeiro('exibirLinha');
    sessao.armazenarHistorico && definirVerdadeiro('armazenarHistorico');
    sessao.visualizacaoCompleta && definirVerdadeiro('visualizacaoCompleta');

    carregarVisualizacao();
}

function definirVerdadeiro(nomeElemento) {
    let elemento = document.getElementById(nomeElemento);
    elemento.setAttribute("class", "true");
    elemento.innerHTML = elemento.innerHTML.replace("false", "true");
}

// ações de botões ----------------------------------------------------------------------------

function limparVersoes() {
    sessao.historico = [];
    limparVersoesHTML();
    save();
}

function inverterBooleano(me, valorAntigo, nomeElemento) {
    if (valorAntigo === undefined) {
        valorAntigo = false;
    }

    me.setAttribute("class", !valorAntigo);
    me.innerHTML = me.innerHTML.replace(valorAntigo, !valorAntigo);

    return !valorAntigo;
}

function trocarVariavel(me) {

    if (me.id == "exibirLinha") {
        sessao.exibirLinha = inverterBooleano(me, sessao.exibirLinha, "exibirLinha");
    }

    if (me.id == "armazenarHistorico") {
        sessao.armazenarHistorico = inverterBooleano(me, sessao.armazenarHistorico, "armazenarHistorico");
    }

    if (me.id == "visualizacaoCompleta") {
        sessao.visualizacaoCompleta = inverterBooleano(me, sessao.visualizacaoCompleta, "visualizacaoCompleta");
    }

    carregarVisualizacao();
    save();
}

var textarea = document.getElementById('textarea');

function carregarVisualizacao(visualizacao) {
    var container = document.getElementById("container");
    container.setAttribute("class", sessao.visualizacaoCompleta ? "completo" : "");
}

// ferramentas principais ---------------------------------------------------------------------

function extrairTexto(comando) {
    if (sessao.armazenarHistorico) {
        sessao.historico.push({ hora: formatarData(new Date()), texto: textarea.value });
        save();
        carregarVersoes();
    }

    var textoExtraido = '';
    var linhas = textarea.value.split('\n');
    var include = document.getElementById('include');
    var numeroDaLinha = 0;

    for (var i = 0; i < linhas.length; i++) {
        var linha = linhas[i];
        numeroDaLinha++;

        if (comando == EXTRAIR) {
            if (include.value.includes('?ext?')) {
                let parts = include.value.split('?ext?');
                var startIndex = linha.indexOf(parts[0]);
                var endIndex = linha.lastIndexOf(parts[1]);

                if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
                    var textoEntreDelimitadores = linha.substring(startIndex + parts[0].length, endIndex);
                    textoExtraido += textoEntreDelimitadores + '\n';
                }

            } else {
                if (linha.includes(include.value)) {
                    if (sessao.exibirLinha) {
                        textoExtraido += numeroDaLinha + ": " + linha.trim() + "\n";
                    } else {
                        textoExtraido += linha.trim() + "\n";
                    }
                }
            }

            continue;
        }

        if (comando == LIMPAR) {
            var startIndex = linha.indexOf(")");

            if (linha == '') {
                continue;
            }

            if (startIndex > 0) {
                var textoEntreDelimitadores = linha.substring(startIndex + 2);
                textoExtraido += textoEntreDelimitadores + '\n';
            } else {
                textoExtraido += linha + '\n';
            }

            continue;
        }

        if (comando == TRIM) {
            textoExtraido += linha.trim() + '\n';
            continue
        }

        if (comando == REMOVEREGEX) {
            textoExtraido += linha.replaceAll(include.value, '') + '\n';
            continue;
        }
    }

    textarea.value = textoExtraido;
}

function limpar() {
    textarea.value = '';
}

function updateLineNumbers() {
    var lines = textarea.value.split('\n');
    var lineNumbersHtml = '';

    for (var i = 0; i < lines.length; i++) {
        lineNumbersHtml += (i + 1) + '<br>';
    }

    lineNumbers.innerHTML = lineNumbersHtml;
}

// ferramentas --------------------------------------------------------------------------------

function somarNumeros() {
    let textarea = document.getElementById("textarea");
    let linhas = textarea.value.trim().split("\n");
    let soma = 0;

    for (var i = 0; i < linhas.length; i++) {
        let linha = linhas[i];

        let numero = parseInt(linha);
        if (!isNaN(numero)) {
            soma += numero;
        }
    }

    textarea.value = textarea.value + "\n\n= " + soma + "\n\n";
}

// extras -------------------------------------------------------------------------------------

function formatarData(data) {
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const hora = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    const segundos = data.getSeconds().toString().padStart(2, '0');

    return `${dia}/${mes} ${hora}:${minutos}:${segundos}`;
}

function contarLinhas() {
    let textarea = document.getElementById("textarea");
    let linhas = textarea.value.trim().split("\n");

    textarea.value = textarea.value + "\n\n" + linhas.length + " linhas contadas\n\n";
}