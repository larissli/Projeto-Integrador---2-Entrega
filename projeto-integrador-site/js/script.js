document.addEventListener('DOMContentLoaded', function () {
    iniciarControleFonte();
    aplicarMascaraTelefone('telefone');
    aplicarMascaraTelefone('cliente-telefone');
    aplicarMascaraCep('cep');
    iniciarFormularioAgendamento();
    iniciarLoja();
    carregarConfirmacaoCompra();
});

// tamanho da fonte
function iniciarControleFonte() {
    const btnAumentar = document.getElementById('btn-aumentar');
    const btnDiminuir = document.getElementById('btn-diminuir');
    const chaveFonte = 'eloSeniorTamanhoFonte';
    let tamanhoAtual = Number(localStorage.getItem(chaveFonte)) || 100;

    aplicarTamanhoFonte(tamanhoAtual);

    if (btnAumentar) {
        btnAumentar.addEventListener('click', function () {
            if (tamanhoAtual < 150) {
                tamanhoAtual += 10;
                aplicarTamanhoFonte(tamanhoAtual);
                localStorage.setItem(chaveFonte, String(tamanhoAtual));
            }
        });
    }

    if (btnDiminuir) {
        btnDiminuir.addEventListener('click', function () {
            if (tamanhoAtual > 80) {
                tamanhoAtual -= 10;
                aplicarTamanhoFonte(tamanhoAtual);
                localStorage.setItem(chaveFonte, String(tamanhoAtual));
            }
        });
    }
}

function aplicarTamanhoFonte(percentual) {
    document.documentElement.style.fontSize = percentual + '%';
}

// máscaras dos campos
function aplicarMascaraTelefone(idCampo) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;

    campo.addEventListener('input', function () {
        let valor = campo.value.replace(/\D/g, '').slice(0, 11);

        if (valor.length > 10) {
            valor = valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        } else if (valor.length > 6) {
            valor = valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (valor.length > 2) {
            valor = valor.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else if (valor.length > 0) {
            valor = valor.replace(/(\d{0,2})/, '($1');
        }

        campo.value = valor.trim();
    });
}

function aplicarMascaraCep(idCampo) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;

    campo.addEventListener('input', function () {
        let valor = campo.value.replace(/\D/g, '').slice(0, 8);

        if (valor.length > 5) {
            valor = valor.replace(/(\d{5})(\d{0,3})/, '$1-$2');
        }

        campo.value = valor;
    });
}

// formulário de agendamento
function iniciarFormularioAgendamento() {
    const formAgendamento = document.getElementById('form-agendamento');
    if (!formAgendamento) return;

    formAgendamento.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!formAgendamento.checkValidity()) {
            formAgendamento.reportValidity();
            return;
        }

        window.location.href = 'confirmacao.html';
    });
}

// loja e carrinho
function iniciarLoja() {
    const formLoja = document.getElementById('form-loja');
    if (!formLoja) return;

    const produtos = {
        'medidor-pressao': { nome: 'Medidor de Pressão Digital', preco: 189.9 },
        'organizador-remedios': { nome: 'Organizador Semanal de Medicamentos', preco: 49.9 },
        'almofada-ortopedica': { nome: 'Almofada Ortopédica de Apoio', preco: 119.9 }
    };

    const botoesAdicionar = document.querySelectorAll('.adicionar-carrinho');
    const listaCarrinho = document.getElementById('lista-carrinho');
    const mensagemCarrinho = document.getElementById('mensagem-carrinho');
    const botaoLimpar = document.getElementById('limpar-carrinho');
    const resumoItens = document.getElementById('resumo-itens');
    const resumoSubtotal = document.getElementById('resumo-subtotal');
    const resumoTotal = document.getElementById('resumo-total');
    const codigoPix = document.getElementById('codigo-pix');
    const botaoCopiarPix = document.getElementById('copiar-pix');
    const statusCopia = document.getElementById('status-copia');
    const textoTotalPix = document.getElementById('texto-total-pix');

    let carrinho = carregarCarrinho();

    botoesAdicionar.forEach(function (botao) {
        botao.addEventListener('click', function () {
            const idProduto = botao.dataset.produto;
            const campoQuantidade = document.getElementById('qtd-' + idProduto);
            const quantidade = Math.max(1, Number(campoQuantidade.value) || 1);

            adicionarAoCarrinho(carrinho, idProduto, quantidade);
            salvarCarrinho(carrinho);
            atualizarCarrinho();

            if (mensagemCarrinho) {
                mensagemCarrinho.textContent = 'Produto adicionado ao carrinho.';
            }
        });
    });

    if (listaCarrinho) {
        listaCarrinho.addEventListener('click', function (event) {
            const botao = event.target.closest('button[data-acao]');
            if (!botao) return;

            const idProduto = botao.dataset.produto;
            const acao = botao.dataset.acao;

            if (acao === 'mais') {
                alterarQuantidade(carrinho, idProduto, 1);
            }

            if (acao === 'menos') {
                alterarQuantidade(carrinho, idProduto, -1);
            }

            if (acao === 'remover') {
                removerDoCarrinho(carrinho, idProduto);
            }

            salvarCarrinho(carrinho);
            atualizarCarrinho();
        });
    }

    if (botaoLimpar) {
        botaoLimpar.addEventListener('click', function () {
            carrinho = [];
            salvarCarrinho(carrinho);
            atualizarCarrinho();

            if (mensagemCarrinho) {
                mensagemCarrinho.textContent = 'Carrinho limpo.';
            }
        });
    }

    if (botaoCopiarPix && codigoPix) {
        botaoCopiarPix.addEventListener('click', async function () {
            try {
                await navigator.clipboard.writeText(codigoPix.value);
                if (statusCopia) {
                    statusCopia.textContent = 'Código Pix copiado com sucesso.';
                }
            } catch (erro) {
                codigoPix.select();
                if (statusCopia) {
                    statusCopia.textContent = 'O código foi selecionado para cópia manual.';
                }
            }
        });
    }

    formLoja.addEventListener('submit', function (event) {
        event.preventDefault();

        if (carrinho.length === 0) {
            if (mensagemCarrinho) {
                mensagemCarrinho.textContent = 'Adicione pelo menos um produto ao carrinho antes de finalizar.';
            }
            return;
        }

        if (!formLoja.checkValidity()) {
            formLoja.reportValidity();
            return;
        }

        const total = calcularTotal(carrinho, produtos);
        const pedido = {
            numero: gerarNumeroPedido(),
            produto: montarTextoProdutos(carrinho, produtos),
            total: formatarMoeda(total),
            cliente: document.getElementById('cliente-nome').value.trim(),
            telefone: document.getElementById('cliente-telefone').value.trim(),
            endereco: montarEnderecoCompleto(),
            pagamento: 'Pix',
            status: 'Aguardando confirmação de pagamento'
        };

        localStorage.setItem('eloSeniorPedido', JSON.stringify(pedido));
        localStorage.removeItem('eloSeniorCarrinho');
        window.location.href = 'compra-confirmada.html';
    });

    atualizarCarrinho();

    function atualizarCarrinho() {
        if (!listaCarrinho) return;

        if (carrinho.length === 0) {
            listaCarrinho.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
            if (resumoItens) resumoItens.textContent = '0';
            if (resumoSubtotal) resumoSubtotal.textContent = 'R$ 0,00';
            if (resumoTotal) resumoTotal.textContent = 'R$ 0,00';
            if (codigoPix) codigoPix.value = gerarCodigoPix(0);
            if (textoTotalPix) textoTotalPix.textContent = 'O valor do Pix acompanha o total do carrinho.';
            return;
        }

        let html = '';
        let quantidadeTotal = 0;

        carrinho.forEach(function (item) {
            const produto = produtos[item.id];
            const subtotal = produto.preco * item.quantidade;
            quantidadeTotal += item.quantidade;

            html += `
                <div class="item-carrinho">
                    <div class="item-carrinho-texto">
                        <strong>${produto.nome}</strong>
                        <span>${formatarMoeda(produto.preco)} cada</span>
                        <span>Subtotal: ${formatarMoeda(subtotal)}</span>
                    </div>
                    <div class="controle-carrinho" aria-label="Quantidade do produto ${produto.nome}">
                        <button type="button" class="botao-carrinho-acao" data-acao="menos" data-produto="${item.id}" aria-label="Diminuir quantidade de ${produto.nome}">-</button>
                        <span class="quantidade-carrinho">${item.quantidade}</span>
                        <button type="button" class="botao-carrinho-acao" data-acao="mais" data-produto="${item.id}" aria-label="Aumentar quantidade de ${produto.nome}">+</button>
                    </div>
                    <button type="button" class="botao-remover" data-acao="remover" data-produto="${item.id}">Remover</button>
                </div>
            `;
        });

        listaCarrinho.innerHTML = html;

        const total = calcularTotal(carrinho, produtos);

        if (resumoItens) resumoItens.textContent = String(quantidadeTotal);
        if (resumoSubtotal) resumoSubtotal.textContent = formatarMoeda(total);
        if (resumoTotal) resumoTotal.textContent = formatarMoeda(total);
        if (codigoPix) codigoPix.value = gerarCodigoPix(total);
        if (textoTotalPix) textoTotalPix.textContent = 'Valor atual do pedido: ' + formatarMoeda(total) + '.';
    }
}

function adicionarAoCarrinho(carrinho, idProduto, quantidade) {
    const itemExistente = carrinho.find(function (item) {
        return item.id === idProduto;
    });

    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({ id: idProduto, quantidade: quantidade });
    }
}

function alterarQuantidade(carrinho, idProduto, valor) {
    const item = carrinho.find(function (produto) {
        return produto.id === idProduto;
    });

    if (!item) return;

    item.quantidade += valor;

    if (item.quantidade <= 0) {
        removerDoCarrinho(carrinho, idProduto);
    }
}

function removerDoCarrinho(carrinho, idProduto) {
    const indice = carrinho.findIndex(function (item) {
        return item.id === idProduto;
    });

    if (indice >= 0) {
        carrinho.splice(indice, 1);
    }
}

function calcularTotal(carrinho, produtos) {
    return carrinho.reduce(function (total, item) {
        return total + (produtos[item.id].preco * item.quantidade);
    }, 0);
}

function montarTextoProdutos(carrinho, produtos) {
    return carrinho.map(function (item) {
        return produtos[item.id].nome + ' (x' + item.quantidade + ')';
    }).join(', ');
}

function carregarCarrinho() {
    const carrinhoSalvo = localStorage.getItem('eloSeniorCarrinho');

    if (!carrinhoSalvo) {
        return [];
    }

    try {
        const dados = JSON.parse(carrinhoSalvo);
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        return [];
    }
}

function salvarCarrinho(carrinho) {
    localStorage.setItem('eloSeniorCarrinho', JSON.stringify(carrinho));
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function gerarCodigoPix(total) {
    return 'ELO SENIOR | CHAVE PIX: pix@elosenior.com.br | VALOR: ' + formatarMoeda(total) + ' | CIDADE: FORTALEZA';
}

function montarEnderecoCompleto() {
    const endereco = document.getElementById('endereco')?.value.trim() || '';
    const numero = document.getElementById('numero')?.value.trim() || '';
    const complemento = document.getElementById('complemento')?.value.trim() || '';
    const bairro = document.getElementById('bairro')?.value.trim() || '';
    const cidade = document.getElementById('cidade')?.value.trim() || '';
    const estado = document.getElementById('estado')?.value.trim() || '';
    const cep = document.getElementById('cep')?.value.trim() || '';

    let texto = `${endereco}, ${numero}`;

    if (complemento !== '') {
        texto += `, ${complemento}`;
    }

    texto += ` - ${bairro}, ${cidade} - ${estado}, CEP ${cep}`;
    return texto;
}

function gerarNumeroPedido() {
    const agora = new Date();
    const ano = agora.getFullYear().toString().slice(-2);
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const aleatorio = Math.floor(1000 + Math.random() * 9000);
    return `ES${ano}${mes}${dia}-${aleatorio}`;
}

// página final do pedido
function carregarConfirmacaoCompra() {
    const campoPedido = document.getElementById('confirmacao-pedido');
    const campoProduto = document.getElementById('confirmacao-produto');
    const campoTotal = document.getElementById('confirmacao-total');
    const campoCliente = document.getElementById('confirmacao-cliente');
    const campoEndereco = document.getElementById('confirmacao-endereco');
    const campoStatus = document.getElementById('confirmacao-status');

    if (!campoPedido || !campoProduto || !campoTotal || !campoCliente || !campoEndereco) return;

    const pedidoSalvo = localStorage.getItem('eloSeniorPedido');

    if (!pedidoSalvo) {
        campoPedido.textContent = '-';
        campoProduto.textContent = 'Nenhum pedido foi encontrado.';
        campoTotal.textContent = '-';
        campoCliente.textContent = '-';
        campoEndereco.textContent = '-';
        if (campoStatus) campoStatus.textContent = '-';
        return;
    }

    try {
        const pedido = JSON.parse(pedidoSalvo);
        campoPedido.textContent = pedido.numero || '-';
        campoProduto.textContent = pedido.produto || '-';
        campoTotal.textContent = pedido.total || '-';
        campoCliente.textContent = `${pedido.cliente || '-'} | ${pedido.telefone || '-'}`;
        campoEndereco.textContent = pedido.endereco || '-';
        if (campoStatus) campoStatus.textContent = pedido.status || '-';
    } catch (erro) {
        campoPedido.textContent = '-';
        campoProduto.textContent = 'Não foi possível carregar os dados do pedido.';
        campoTotal.textContent = '-';
        campoCliente.textContent = '-';
        campoEndereco.textContent = '-';
        if (campoStatus) campoStatus.textContent = '-';
    }
}
