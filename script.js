// constantes globais -------------------------------------------------------------------------

const TRIM = "TRIM";
const EXTRAIR = "EXTRAIR";
const REMOVEREGEX = "REMOVEREGEX";
const REMOVEDUPL = "REMOVEDUPL";
const REMOVERLINHA = "REMOVERLINHA";

const REGEX_EXTRAIR_ENTRE = "?entre?";
const REGEX_EXTRAIR_APOS = "?apos?";
const REGEX_SE_CONTEM_DEVE_CONTER = "?scdc?";

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
    let dica = 
        `
SE CONTÉM:    
Digite [arg0] para extrair todas as linhas contendo este argumento.

SE CONTÉM DEVE CONTER:
Digite [arg0]${REGEX_SE_CONTEM_DEVE_CONTER}[arg1] para extrair a linha inteira ou se ela contem os dois argumentos.

EXTRAIR TEXTO ENTRE:
Digite [arg0]${REGEX_EXTRAIR_ENTRE}[arg1] para extrair o texto entre dois argumentos.

EXTRAIR TEXTO APÓS:
Digite [arg0]${REGEX_EXTRAIR_APOS} para extrair o texto após este argumento.
`;

    let include = document.getElementById('include');
    
    include.setAttribute('title', dica);
    include.focus();
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

function carregarVisualizacao() {
    let container = document.getElementById("container");
    container.setAttribute("class", sessao.visualizacaoCompleta ? "completo" : "");
}

// ferramentas principais ---------------------------------------------------------------------

function extrairTexto(comando) {
    if (sessao.armazenarHistorico) {
        try {
            sessao.historico.push({ hora: formatarData(new Date()), texto: textarea.value });
            save();
            carregarVersoes();
        } catch (e) {
            debugger
            console.log(e);
        }
    }

    let textoExtraido = '';
    let linhas = textarea.value.split('\n');
    let search = document.getElementById('include');
    let numeroLinha = 0;

    let pilha = [];

    for (const linha of linhas) {
        numeroLinha++;

        // captura texto de linhas sobre os parametros da caixa de pesquisa
        if (comando == EXTRAIR) {

            /**
             * Filtra a linha se tem um argumento, tem que ter obrigatóriamente o próximo. 
             * Caso contrário a linha inteira é extraída.Útil para limpar logs do Java removendo 
             * os stacks que não correspondem os packages do projeto.
             * 
             * Exemplo: "at?SCDC?com.google"
             * Irá remover todos os outros stacks como "at com.jboss", "at org.quartz", etc;
             * 
             */
            if (search.value.includes(REGEX_SE_CONTEM_DEVE_CONTER)) {
                let args = search.value.split(REGEX_SE_CONTEM_DEVE_CONTER);
                let seContem = args[0];
                let deveConter = args[1];

                if (linha.includes(seContem)) {
                    if (linha.includes(deveConter)) {
                        textoExtraido += linha + '\n';
                    }
                } else {
                    textoExtraido += linha + '\n';
                }

            } else if (search.value.includes(REGEX_EXTRAIR_ENTRE)) {
                let partes = search.value.split(REGEX_EXTRAIR_ENTRE);
                let indice = linha.indexOf(partes[0]);
                let indiceFinal = linha.lastIndexOf(partes[1]);
                
                if (indice !== -1 && indiceFinal !== -1 && indice !== indiceFinal) {
                    let textoEntreIndices = linha.substring(indice + partes[0].length, indiceFinal);
                    textoExtraido += textoEntreIndices + '\n';
                }
                
            // se a pesquisa inclui o padrão 'REGEX_FORW' extraímos o texto entre os marcadores
            } else if (search.value.includes(REGEX_EXTRAIR_APOS)){
                let partes = search.value.split(REGEX_EXTRAIR_APOS);
                let indice = linha.indexOf(partes[0]);

                if (indice >= 0) {
                    let textoAposIndice = linha.substring(indice + partes[0].length);
                    textoExtraido += textoAposIndice + '\n';
                }

            } else {

                // se o termo existe na linha guarda a linha inteira
                if (linha.includes(search.value)) {

                    // se habilitado para informar a linha a grava (carece de melhorias)
                    if (sessao.exibirLinha) {
                        textoExtraido += numeroLinha + ": " + linha + "\n";
                    } else {
                        textoExtraido += linha + "\n";
                    }
                }
            }

            continue;
        }

        if (comando == REMOVERLINHA) {
            if (!linha.includes(search.value)) {
                textoExtraido += linha + '\n';
            }
        }

        if (comando == REMOVEDUPL) {
            if (pilha.indexOf(linha.trim()) < 0 && linha.trim() != '') {
                pilha.push(linha.trim());
                textoExtraido += linha + '\n';
            }

            continue;
        }

        // executa o trim sobre todas as linhas
        if (comando == TRIM) {
            textoExtraido += linha.trim() + '\n';
            continue
        }

        // remove o regex informado na captura de linhas
        if (comando == REMOVEREGEX) {
            textoExtraido += linha.replaceAll(search.value, '') + '\n';
            continue;
        }
    }

    textarea.value = textoExtraido;
}

function limpar() {
    textarea.value = '';
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

function keyPress(e) {
    
    if (e.code == 'Enter' && e.ctrlKey) {
        extrairTexto('EXTRAIR');
    }
}

addEventListener('keypress', e => { keyPress(e) })