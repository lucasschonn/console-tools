// constantes globais -------------------------------------------------------------------------

const LINE_BREAK = '\n';

const COMANDOS = {
    REGEX_BATCH: '&>.',
    REGEX_AND: '&+.',
    REGEX_EXTRAIR_LINHA: '?extlinha?',
    REGEX_EXTRAIR_ENTRE: '?extentre?',
    REGEX_EXTRAIR_APOS: '?extapos?',
    REGEX_SE_CONTEM_DEVE_CONTER: '?scdc?',
    REGEX_DIFERENCA_LINHAS: '?diff?',
    REGEX_REMOVER_LINHA: '?remlinha?',
    REGEX_REMOVER_DUPLICADO: '?remduplicado?',
    REGEX_REMOVER_ARGUMENTO: '?remarg?',
    REGEX_TRIM: '?trim?',
}

const DESCRICAO = {
    REGEX_BATCH: 'executar comandos em lote',
    REGEX_AND: 'separar múltiplos argumentos',
    REGEX_EXTRAIR_LINHA: 'extrair uma linha contendo o argumento',
    REGEX_EXTRAIR_ENTRE: 'extrair o texto entre dois argumentos',
    REGEX_EXTRAIR_APOS: 'extrair o texto após um argumento',
    REGEX_SE_CONTEM_DEVE_CONTER: 'extrair as linhas que contenham os dois argumentos',
    REGEX_DIFERENCA_LINHAS: 'calcular a diferença de tempo entre duas linhas',
    REGEX_REMOVER_LINHA: 'remover a linha contendo algum argumento',
    REGEX_REMOVER_DUPLICADO: 'remover as linhas duplicadas',
    REGEX_REMOVER_ARGUMENTO: 'remover os argumentos das linhas',
    REGEX_TRIM: 'realizar o trim sobre as linhas',
}

const AUTOCOMPLETE = {
    'Extrair linhas contendo': '',
    'Executar trim': '?trim?',
    'Remover argumentos das linhas': '?remarg?',
    'Remover linhas duplicadas': '?remduplicado?',
    'Remover linhas contendo argumentos': '?remlinha?',
    'Apenas pacotes da Consisa': '?scdc?at &+.com.consisa',
    'Execução JOB#1': '?remlinha?Enviando backup&+.Backup enviado&>.?extlinha?JOB#1&>.?diff?',
    'Execução JOB#2': '?remlinha?Enviando backup&+.Backup enviado&>.?extlinha?JOB#2&>.?diff?',
    'Execução JOB#3': '?remlinha?Enviando backup&+.Backup enviado&>.?extlinha?JOB#3&>.?diff?',
    'Execução JOB#4': '?remlinha?Enviando backup&+.Backup enviado&>.?extlinha?JOB#4&>.?diff?',
    'Execução JOB#5': '?remlinha?Enviando backup&+.Backup enviado&>.?extlinha?JOB#5&>.?diff?',
}

// loader de sessão ---------------------------------------------------------------------------

var sessao;
load();

function load() {
    let session = localStorage.getItem('sessao_extrator');
    if (session && session != 'undefined') {
        sessao = JSON.parse(session);
    } else {
        create();
    }

    renderizarConfiguracoes();
    renderizarVersoes();
    renderizarAutoComplete();
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
    let dica = '';

    for (const [key, regex] of Object.entries(COMANDOS)) {
        let descricao = DESCRICAO[key];
        if (descricao) {
            dica += `Use ${regex} para ${descricao};\n`;
        }
    }

    let include = document.getElementById('include');

    include.setAttribute('title', dica);
    include.focus();
}

function renderizarVersoes() {
    let remover = document.getElementById('limparVersoes');

    for (const versao of sessao.historico) {
        let button = document.createElement('button');
        button.setAttribute('onclick', `obterVersao('${versao.hora}')`);
        button.setAttribute('class', 'versao');
        button.innerText = obterTexto(versao);

        remover.after(button);
        remover.after(document.createElement('br'));
    }
}

function carregarVersoes() {
    limparVersoesHTML();
    setTimeout(renderizarVersoes, 50);
}

function obterTexto(versao) {
    let texto = versao.texto;

    texto = texto.replaceAll('\n', '');
    texto = texto.replaceAll('\r', '');

    if (texto.length > 50) {
        texto = texto.substring(0, 50) + '...';
    }

    if (texto == '') {
        texto = 'vazio';
    }

    return versao.hora + ' - ' + texto;
}

function obterVersao(hora) {
    for (const versao of sessao.historico) {
        if (versao.hora == hora) {
            textarea.value = versao.texto;
        }
    }
}

function limparVersoesHTML() {
    let versoes = document.getElementsByClassName('versao');

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
    elemento.setAttribute('class', 'true');
    elemento.innerHTML = elemento.innerHTML.replace('false', 'true');
}

function renderizarAutoComplete() {
    let select = document.getElementById('select');
    for (const [nome, comando] of Object.entries(AUTOCOMPLETE)) {
        let option = document.createElement('option');
        option.setAttribute('value', comando);
        option.innerText = nome;
        select.append(option);
    }

    select.addEventListener('change', (e) => {
        document.getElementById('include').value = e.target.value;
        document.getElementById('include').focus();
    })
}

// ações de botões ----------------------------------------------------------------------------

var textarea = document.getElementById('textarea');
var numeroLinha = 0;
var textoExtraido = '';

function limparVersoes() {
    sessao.historico = [];
    limparVersoesHTML();
    save();
}

function inverterBooleano(me, valorAntigo, nomeElemento) {
    if (valorAntigo === undefined) {
        valorAntigo = false;
    }

    me.setAttribute('class', !valorAntigo);
    me.innerHTML = me.innerHTML.replace(valorAntigo, !valorAntigo);

    return !valorAntigo;
}

function trocarVariavel(me) {

    if (me.id == 'exibirLinha') {
        sessao.exibirLinha = inverterBooleano(me, sessao.exibirLinha, 'exibirLinha');
    }

    if (me.id == 'armazenarHistorico') {
        sessao.armazenarHistorico = inverterBooleano(me, sessao.armazenarHistorico, 'armazenarHistorico');
    }

    if (me.id == 'visualizacaoCompleta') {
        sessao.visualizacaoCompleta = inverterBooleano(me, sessao.visualizacaoCompleta, 'visualizacaoCompleta');
    }

    carregarVisualizacao();
    save();
}

function carregarVisualizacao() {
    let container = document.getElementById('container');
    container.setAttribute('class', sessao.visualizacaoCompleta ? 'completo' : '');
}

function obterLinhas() {
    return textarea.value.split('\n');
}

function obterPesquisa() {
    return document.getElementById('include').value;
}

function armazenarHistorico() {
    if (sessao.armazenarHistorico) {
        try {
            sessao.historico.push({ hora: formatarData(new Date()), texto: textarea.value });
            save();
            carregarVersoes();
        } catch (e) {
            console.error(e);
        }
    }
}

function extrairPorPattern(linha, pattern) {
    pattern = pattern ? pattern : 'yyyy-MM-dd HH:mm:ss';

    while (linha.length >= pattern.length) {
        let dateString = linha.substring(0, pattern.length);
        let unixTimestamp = Date.parse(dateString);

        if (isNaN(unixTimestamp)) {
            linha = linha.substring(1);
            continue;
        }

        return dateString;
    }
}

function extrairAcao(pesquisa) {
    for (const [key, regex] of Object.entries(COMANDOS)) {
        if (pesquisa.startsWith(regex)) {
            return [regex, pesquisa.substring(regex.length)];
        }
    }

    return [COMANDOS.REGEX_EXTRAIR_LINHA, pesquisa];
}

function extrairLinha(linha) {
    if (sessao.exibirLinha) {
        textoExtraido += numeroLinha + ': ' + linha;
    } else {
        textoExtraido += linha;
    }
}

// ferramentas principais ---------------------------------------------------------------------

function extrair() {
    let pesquisa = obterPesquisa();
    let comandos = [pesquisa];
    if (pesquisa.includes(COMANDOS.REGEX_BATCH)) {
        comandos = pesquisa.split(COMANDOS.REGEX_BATCH);
    }

    armazenarHistorico();
    for (const comando of comandos) {
        let args = extrairAcao(comando);
        extrairTexto(args[0], args[1]);
    }
}

function extrairTexto(comando, pesquisa) {
    textoExtraido = '';
    numeroLinha = 0;

    let args = pesquisa.split(COMANDOS.REGEX_AND);
    let linhas = obterLinhas();
    let bufferArray = [];
    let bufferObject;

    for (const linha of linhas) {
        numeroLinha++;

        /**
         * Filtra a linha, se tem um argumento tem que ter obrigatóriamente o próximo. 
         * Caso contrário a linha inteira é extraída. Útil para limpar logs do Java removendo 
         * os stacks que não correspondem os packages do projeto.
         * 
         * Exemplo: 'at?SCDC?com.google'
         * Irá remover todos os outros stacks como 'at com.jboss', 'at org.quartz', etc;
         * 
         */
        if (comando === COMANDOS.REGEX_SE_CONTEM_DEVE_CONTER) {
            let seContem = args[0];
            let deveConter = args[1];

            if (linha.includes(seContem)) {
                if (linha.includes(deveConter)) {
                    extrairLinha(linha + LINE_BREAK);
                }
            } else {
                extrairLinha(linha + LINE_BREAK);
            }

            continue;
        }

        /**
         * Extrai a diferença de tempo entre uma linha e outra desde que elas tenham um 
         * uma data/hora formatada em ambas.
         * 
         * Linhas sem data/hora serão ignoradas.
         */
        if (comando === COMANDOS.REGEX_DIFERENCA_LINHAS) {
            let prefixo = '';
            let pattern = args[0];
            let dateString = extrairPorPattern(linha, pattern);

            if (dateString) {
                const date = new Date(dateString);

                if (bufferObject) {
                    const diferenca = date.getTime() - bufferObject;
                    const minutos = Math.floor(diferenca / (1000 * 60));
                    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

                    prefixo += `${dateString} - Concluído em [${minutos} min ${segundos} seg]${LINE_BREAK + LINE_BREAK}`;
                }

                bufferObject = date.getTime();
                extrairLinha(prefixo);
                extrairLinha(linha + LINE_BREAK);
            }

            continue;
        }

        /**
         * Remove a linha se esta tiver algum dos parâmetros da pesquisa.
         */
        if (comando === COMANDOS.REGEX_REMOVER_LINHA) {
            let contemAlgum = false;
            for (const arg of args) {
                if (linha.includes(arg)) {
                    contemAlgum = true;
                    break;
                }
            }

            if (!contemAlgum) {
                extrairLinha(linha + LINE_BREAK);
            }

            continue;
        }

        /**
         * Remove as linhas duplicadas.
         */
        if (comando === COMANDOS.REGEX_REMOVER_DUPLICADO) {
            let linhaLimpa = linha.trim();

            if (bufferArray.indexOf(linhaLimpa) < 0 && linhaLimpa !== '') {
                extrairLinha(linha + LINE_BREAK);
                bufferArray.push(linhaLimpa);
            }

            continue;
        }

        /**
         * Executa o trim sobre todas as linhas.
         */
        if (comando === COMANDOS.REGEX_TRIM) {
            extrairLinha(linha.trim() + LINE_BREAK);
            continue;
        }

        /**
         * Remove todos os argumentos de pesquisa das linhas.
         */
        if (comando === COMANDOS.REGEX_REMOVER_ARGUMENTO) {
            let linhaLimpa = linha;
            for (const arg of args) {
                linhaLimpa = linhaLimpa.replaceAll(arg, '');
            }

            extrairLinha(linhaLimpa + LINE_BREAK);
            continue;
        }

        /**
         * Extrai o texto entre dois argumentos.
         */
        if (comando === COMANDOS.REGEX_EXTRAIR_ENTRE) {
            let inicio = linha.indexOf(args[0]);
            let fim = linha.lastIndexOf(args[1]);

            if (inicio !== -1 && fim !== -1 && inicio !== fim) {
                let textoEntre = linha.substring(inicio + args[0].length, fim);
                extrairLinha(textoEntre + LINE_BREAK);
            }

            continue;
        }

        /**
         * Extrai o texto depois de um argumento.
         */
        if (comando === COMANDOS.REGEX_EXTRAIR_APOS) {
            let inicio = linha.indexOf(args[0]);

            if (inicio !== -1) {
                let textoApos = linha.substring(inicio + args[0].length);
                extrairLinha(textoApos + LINE_BREAK);
            }

            continue;
        }

        /**
         * Extrai a linha se o argumento existe nela.
         */
        if (comando === COMANDOS.REGEX_EXTRAIR_LINHA) {
            if (linha.includes(args[0])) {
                extrairLinha(linha + LINE_BREAK);
            }

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
    let textarea = document.getElementById('textarea');
    let linhas = textarea.value.trim().split('\n');
    let soma = 0;

    for (var i = 0; i < linhas.length; i++) {
        let linha = linhas[i];

        let numero = parseInt(linha);
        if (!isNaN(numero)) {
            soma += numero;
        }
    }

    textarea.value = textarea.value + '\n\n= ' + soma + '\n\n';
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
    let textarea = document.getElementById('textarea');
    let linhas = textarea.value.trim().split('\n');

    textarea.value = textarea.value + '\n\n' + linhas.length + ' linhas contadas\n\n';
}

function keyPress(e) {
    if (e.code == 'Enter' && e.ctrlKey) {
        extrair();
    }
}

addEventListener('keypress', e => { keyPress(e) })