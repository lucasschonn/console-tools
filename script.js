/**
 * Console Tools é uma suíte de automação para extração de informações de logs.
 * 
 * @author José Almeida
 * @since 2023
 */

// CONSTANTES GLOBAIS

const C = [];
const LINE_BREAK = '\n';
const COMM_PREFIX = '&?';

const COMANDOS = {
    REGEX_BATCH: '&>.',
    REGEX_AND: '&+.',
    REGEX_EXTRAIR_LINHA: '&?extlinha?',
    REGEX_EXTRAIR_ENTRE: '&?extentre?',
    REGEX_EXTRAIR_APOS: '&?extapos?',
    REGEX_EXTRAIR_ANTES: '&?extantes?',
    REGEX_SE_CONTEM_DEVE_CONTER: '&?scdc?',
    REGEX_DIFERENCA_LINHAS: '&?diff?',
    REGEX_REMOVER_LINHA: '&?remlinha?',
    REGEX_REMOVER_DUPLICADO: '&?remduplicado?',
    REGEX_REMOVER_ARGUMENTO: '&?remarg?',
    REGEX_TRIM: '&?trim?',
    REGEX_REPLACE: '&?replace?',
    REGEX_EVAL: '&?eval?',
    REGEX_MEDIA: '&?avarage?',
    REGEX_PREFIXO: '&?prefix?',
    REGEX_SUFIXO: '&?sufix?',
    REGEX_SOMA: '&?sum?',
    REGEX_CONTAR_LINHAS: '&?count?',

}

const DESCRICAO = {
    REGEX_BATCH: 'executar comandos em lote',
    REGEX_AND: 'separar múltiplos argumentos',
    REGEX_EXTRAIR_LINHA: 'extrair uma linha contendo o argumento',
    REGEX_EXTRAIR_ENTRE: 'extrair o texto entre dois argumentos',
    REGEX_EXTRAIR_APOS: 'extrair o texto após um argumento',
    REGEX_EXTRAIR_ANTES: 'extrair o texto antes um argumento',
    REGEX_SE_CONTEM_DEVE_CONTER: 'extrair as linhas que contenham os dois argumentos',
    REGEX_DIFERENCA_LINHAS: 'calcular a diferença de tempo entre duas linhas',
    REGEX_REMOVER_LINHA: 'remover a linha contendo algum argumento',
    REGEX_REMOVER_DUPLICADO: 'remover as linhas duplicadas',
    REGEX_REMOVER_ARGUMENTO: 'remover os argumentos das linhas',
    REGEX_TRIM: 'realizar o trim sobre as linhas',
    REGEX_REPLACE: 'substituir um argumento pelo segundo',
    REGEX_EVAL: 'executar o comando eval sobre a linha (use com cautela)',
    REGEX_MEDIA: 'calcular a média dos valores das linhas',
    REGEX_PREFIXO: 'adicionar um prefixo na linha',
    REGEX_SUFIXO: 'adicionar um sufixo na linha',
    REGEX_SOMA: 'somar todas as linhas',
    REGEX_CONTAR_LINHAS: 'contar quantas linhas existem',
}

const AUTOCOMPLETE = {
    'Extrair linhas contendo': '',
    'Extrair texto entre argumentos': '&?extentre?',
    'Extrair texto após argumentos': '&?extapos?',
    'Extrair texto antes do argumento': '&?extantes?',
    'Extrair linha se ela contem os dois argumentos': '&?scdc?',
    'Calcular diferença de tempo entre as linhas': '&?diff?',
    'Remover linha contendo': '&?remlinha?',
    'Remover linhas duplicadas': '&?remduplicado?',
    'Remover argumentos das linhas': '&?remarg?',
    'Executar comando trim': '&?trim?',
    'Executar comando replace': '&?replace?',
    'Executar comando eval': '&?eval?',
    'Calcular média': '&?avarage?',
    'Calcular soma': '&?sum?',
    'Contar quantidade de linhas': '&?count?',
    'Adicionar prefixo na linha': '&?prefix?',
    'Adicionar sufixo na linha': '&?sufix?',
}

// LOADER DE SESSÃO

var sessao;
load();

function load() {
    let session = localStorage.getItem('sessao_extrator');
    if (session && session != 'undefined') {
        sessao = JSON.parse(session);
    } else {
        create();
    }

    renderizarVersoes();
    renderizarAutoComplete();
}

function create() {
    sessao = {
        exibirLinha: false,
        historico: [],
        autocomplete: {}
    }

    save();
}

function save() {
    localStorage.setItem('sessao_extrator', JSON.stringify(sessao));
}

// RENDERIZAÇÃO DE COMPONENTES

propriedadesAdicionais();
function propriedadesAdicionais() {
    let dica = '';

    for (const [key, regex] of Object.entries(COMANDOS)) {
        let descricao = DESCRICAO[key];
        if (descricao) {
            dica += `${regex}\t\t para ${descricao};\n`;
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
            fecharUltimoModal();
            break;
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
}

function definirVerdadeiro(nomeElemento) {
    let elemento = document.getElementById(nomeElemento);
    elemento.setAttribute('class', 'true');
    elemento.innerHTML = elemento.innerHTML.replace('false', 'true');
}

function renderizarAutoComplete() {
    let select = document.getElementById('select');
    select.removeEventListener('change', this);
    select.innerHTML = '';

    let comandosAutocomplete = { ...AUTOCOMPLETE };

    if (sessao.autocomplete) {
        comandosAutocomplete = { ...AUTOCOMPLETE, ...sessao.autocomplete }
    }

    for (const [nome, comando] of Object.entries(comandosAutocomplete)) {
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

// AÇÕES DE BOTÕES

var textarea = document.getElementById('textarea');
var include = document.getElementById('include');
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

    save();
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

    if (!pesquisa.includes(COMM_PREFIX)) {
        return [COMANDOS.REGEX_EXTRAIR_LINHA, pesquisa];
    }
}

function extrairLinha(linha) {
    if (sessao.exibirLinha) {
        textoExtraido += numeroLinha + ': ' + linha;
    } else {
        textoExtraido += linha;
    }
}

// FERRAMENTAS

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
            if (!contemArgumento(linha, args)) {
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
            if (linha) {
                extrairLinha(linha.trim() + LINE_BREAK);
            }

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
         * Extrai o texto antes de um argumento.
         */
        if (comando === COMANDOS.REGEX_EXTRAIR_ANTES) {
            let inicio = linha.indexOf(args[0]);

            if (inicio !== -1) {
                let textoApos = linha.substring(0 + inicio);
                extrairLinha(textoApos + LINE_BREAK);
            }

            continue;
        }

        /**
         * Extrai a linha se algum dos argumentos existe nela.
         */
        if (comando === COMANDOS.REGEX_EXTRAIR_LINHA) {
            if (contemArgumento(linha, args)) {
                extrairLinha(linha + LINE_BREAK);
            }

            continue;
        }

        if (comando === COMANDOS.REGEX_REPLACE) {
            let linhaModificada = linha.replaceAll(args[0], args[1]);
            extrairLinha(linhaModificada + LINE_BREAK);
        }

        /**
         * Executa o comando eval() sobre a linha.
         */
        if (comando === COMANDOS.REGEX_EVAL) {
            if (linha) {
                try {
                    let resultado = eval(linha);
                    extrairLinha(resultado + LINE_BREAK);
                } catch (e) {
                    extrairLinha(`${linha} (falha, consulte o log). ${LINE_BREAK}`);
                    console.warn(`Não foi possível executar o comando [${line}].`, e);
                }
            }

            continue;
        }

        /**
         * Calcula a média de todas as linhas. (finaliza nos totalizadores)
         */
        if (comando === COMANDOS.REGEX_MEDIA) {
            if (linha) {
                let valor = parseFloat(linha);

                if (isNaN(valor)) {
                    continue;
                }

                bufferArray.push(valor);
                bufferObject = bufferObject ? bufferObject + valor : valor;
            }

            continue;
        }

        if (comando === COMANDOS.REGEX_MEDIA) {
            if (linha) {
                let valor = parseFloat(linha);

                if (isNaN(valor)) {
                    continue;
                }

                bufferArray.push(valor);
                bufferObject = bufferObject ? bufferObject + valor : valor;
            }

            continue;
        }

        /**
         * Adiciona um prefixo na linha.
         */
        if (comando === COMANDOS.REGEX_PREFIXO) {
            if (linha) {
                extrairLinha(args[0] + linha + LINE_BREAK);
            }

            continue;
        }

        /**
         * Adiciona um sufixo na linha.
         */
        if (comando === COMANDOS.REGEX_SUFIXO) {
            if (linha) {
                extrairLinha(linha + args[0] + LINE_BREAK);
            }

            continue;
        }

        /**
         * Calcula a soma de todos os valores das linhas.
         */
        if (comando === COMANDOS.REGEX_SOMA) {
            if (linha) {
                let valor = parseFloat(linha);

                if (isNaN(valor)) {
                    continue;
                }

                bufferObject = bufferObject ? bufferObject + valor : valor;
            }

            continue;
        }
    }

    totalizadores(comando, linhas, bufferArray, bufferObject);
    textarea.value = textoExtraido;
    textoExtraido = '';
}

function limpar() {
    textarea.value = '';
}

function totalizadores(comando, linhas, bufferArray, bufferObject) {

    /**
     * Finaliza o cálculo da média.
     */
    if (comando === COMANDOS.REGEX_MEDIA) {
        if (bufferObject && bufferArray.length > 0) {
            let media = bufferObject / bufferArray.length;
            extrairLinha(media);
        }
    }

    /**
     * Finaliza o cálculo de soma.
     */
    if (comando === COMANDOS.REGEX_SOMA) {
        if (bufferObject) {
            extrairLinha(bufferObject)
        }
    }

    /**
     * Finaliza a contagem de linhas.
     */
    if (comando === COMANDOS.REGEX_CONTAR_LINHAS) {
        extrairLinha(linhas.length);
    }
}

// EXTRAS

function formatarData(data) {
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const hora = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    const segundos = data.getSeconds().toString().padStart(2, '0');

    return `${dia}/${mes} ${hora}:${minutos}:${segundos}`;
}

function contemArgumento(linha, args) {
    for (const arg of args) {
        if (linha.includes(arg)) {
            return true;
        }
    }
}

function keyPress(e) {
    if (e.code == 'Enter' && e.ctrlKey) {
        extrair();
    }
}

function keyDown(e) {
    if (e.code == 'Tab') {
        if (e.target == textarea) {
            document.getElementById('include').focus();
            e.preventDefault();
        }
    }

    if (e.code == 'Delete' && e.altKey) {
        if (e.target == include) {
            include.value = '';
        } else {
            textarea.value = '';
        }

        e.preventDefault();
    }

    if (e.code == 'Escape') {
        fecharUltimoModal();
        e.preventDefault();
    }
}

addEventListener('keypress', e => { keyPress(e) });
addEventListener('keydown', e => { keyDown(e) });

// MODAIS

function novoModal(tituloModal, innerHTML) {
    innerHTML = innerHTML.replaceAll('data-id=', 'id=');

    let body = document.body;
    let externo = document.createElement('div');
    let interno = document.createElement('div');
    let fechar = document.createElement('span');
    let titulo = document.createElement('span');

    externo.classList.add('console_modal');
    externo.classList.add('modal');
    interno.classList.add('container');
    fechar.classList.add('fechar');
    titulo.classList.add('titulo');

    interno.innerHTML = innerHTML;
    fechar.innerHTML = '&#x2715;';
    titulo.innerText = tituloModal;

    fechar.addEventListener('click', (e) => {
        fecharUltimoModal();
    });

    externo.addEventListener('dblclick', (e) => {
        if (e.target === externo) {
            fecharUltimoModal();
        }
    });

    interno.append(fechar);
    interno.append(titulo);
    externo.append(interno);
    body.append(externo);
}

function fecharUltimoModal() {
    let elements = document.getElementsByClassName('console_modal');
    elements[elements.length - 1].remove();
}

function getTemplate(nome) {
    let templates = document.getElementById('templates');
    let modal = templates.getElementsByClassName(nome)[0];
    return modal.innerHTML;
}

function editorAcessoRapido() {
    let acessoRapido = getTemplate('acesso_rapido');
    novoModal('Editor do acesso rápido', acessoRapido);

    let editor = document.getElementById('editor');
    editor.value = JSON.stringify(sessao.autocomplete, null, 3);
}

function salvarAcessoRapido() {
    let editor = document.getElementById('editor');

    try {
        JSON.parse(editor.value);
    } catch (e) {
        alert('Json inválido');
        return;
    }

    sessao.autocomplete = JSON.parse(editor.value);
    renderizarAutoComplete();
    fecharUltimoModal();
    save();
}

function historicoSalvo() {
    let historico = getTemplate('historico');

    novoModal('Histórico', historico);
}

function configuracoes() {
    let configuracoes = getTemplate('configuracoes');

    novoModal('Configurações', configuracoes);
    renderizarConfiguracoes();
}

function construtor() {
    let construtor = getTemplate('construtor');
    novoModal('Construtor (alpha)', construtor);

    let comandos = document.getElementById('comandos');

    for (const [nome, regex] of Object.entries(COMANDOS)) {
        let comando = document.createElement('button');
        let input = document.getElementById('construtor-input');

        input.addEventListener('dblclick', (e) => {
            var range = document.createRange();
            range.selectNodeContents(e.target);

            var selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        });

        comando.innerText = nome;

        comando.addEventListener('click', (e) => {
            let input = document.getElementById('construtor-input');
            let comm = document.createElement('span');
            comm.innerText = regex;
            
            let argumento = document.createElement('span');
            argumento.setAttribute('contenteditable', 'true');
            argumento.setAttribute('spellcheck', 'false');
            
            // TODO carregar um comando existente
            // TODO colocar na posição do seletor
            // TODO se tem comando tem que ter o & no final, se já tem o ai nao faz nada
            
            comm.classList.add('texto', 'regex');
            argumento.classList.add('texto', 'argumento');

            input.append(comm);
            input.append(argumento);

            argumento.addEventListener('keydown', (e) => {
                let innerText = e.target.innerText;

                if (e.code == 'Backspace') {
                    if (innerText.length === 0) {
                        let construtor = e.target.parentNode;
                        let els = construtor.childNodes;
                        els[indexOf(els, e.target) - 1].remove();
                        els[indexOf(els, e.target)].remove();

                        if (els[els.length - 1]) {
                            els[els.length - 1].focus();
                        }
                    }
                }

                if (e.code == 'Delete') {
                    let s =  document.getSelection();
                    if (s.isCollapsed && s.baseOffset >= innerText.length) {
                        let els = e.target.parentNode.childNodes;
                        if (els[indexOf(els, e.target) + 1]) {
                            els[indexOf(els, e.target) + 1].remove();
                        }

                        if (els[indexOf(els, e.target) + 1]) {
                            els[indexOf(els, e.target) + 1].remove();
                        }

                        e.target.focus();
                    }
                }
            });

            argumento.focus();
        });

        comandos.append(comando);
    }
}

// FUNÇÕES DO CONSTRUTOR

function indexOf(array, object) {
    let index = 0;
    for (const item of array) {
        if (item === object) {
            return index;
        }

        index++;
    }

    return -1;
}