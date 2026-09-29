$(document).ready(function() {
    function formatarMoeda(valor) {
        const num = parseFloat(valor) || 0;
        return 'R$ ' + num.toFixed(2).replace('.', ',');
    }

    function calcularTotal() {
        const precoLanche = parseFloat($('#select-lanche').val()) || 0;
        
        let somaAdicionais = 0;
        $('.check-adicional:checked').each(function() {
            somaAdicionais += parseFloat($(this).val()) || 0;
        });
        
        let qtd = parseInt($('#input-qtd').val()) || 1;
        const taxaEntrega = parseFloat($('#select-entrega').val()) || 0;
        
        const subtotal = (precoLanche + somaAdicionais) * qtd;
        
        let desconto = 0;
        let campoCupom = $('#input-cupom').val() || '';
        if (campoCupom.toUpperCase().trim() === 'COXA10') {
            desconto = subtotal * 0.10;
        }
        
        const totalGeral = (subtotal + taxaEntrega) - desconto;
        
        $('#resumo-subtotal').text(formatarMoeda(subtotal));
        $('#resumo-entrega').text(formatarMoeda(taxaEntrega));
        $('#resumo-desconto').text('- ' + formatarMoeda(desconto));
        
        const $totalGeral = $('#total-geral');
        if ($totalGeral.length > 0) {
            $totalGeral.text(formatarMoeda(totalGeral));
            $totalGeral.removeClass('anima-valor');
            void $totalGeral[0].offsetWidth; 
            $totalGeral.addClass('anima-valor');
        }

        salvarRascunho();
    }

    function salvarRascunho() {
        let adicionaisMarcados = [];
        $('.check-adicional:checked').each(function() {
            adicionaisMarcados.push($(this).attr('id'));
        });

        const pedido = {
            lanche: $('#select-lanche').val(),
            qtd: $('#input-qtd').val(),
            adicionais: adicionaisMarcados,
            entrega: $('#select-entrega').val(),
            cupom: $('#input-cupom').val()
        };
        
        localStorage.setItem('rascunho_pedido', JSON.stringify(pedido));
    }

    function carregarRascunho() {
        const dadosSalvos = localStorage.getItem('rascunho_pedido');
        
        if (dadosSalvos) {
            try {
                const pedido = JSON.parse(dadosSalvos);
                
                if (pedido.lanche) $('#select-lanche').val(pedido.lanche);
                if (pedido.qtd) $('#input-qtd').val(pedido.qtd);
                if (pedido.entrega) $('#select-entrega').val(pedido.entrega);
                if (pedido.cupom) $('#input-cupom').val(pedido.cupom);
                
                if (Array.isArray(pedido.adicionais)) {
                    pedido.adicionais.forEach(function(id) {
                        $('#' + id).prop('checked', true);
                    });
                }
            } catch (e) {}
        }
        
        calcularTotal();
    }

    $('#btn-finalizar').on('click', function() {
        if ($('#select-lanche').val() === "0" || !$('#select-lanche').val()) {
            alert('Selecione um lanche antes de finalizar a partida!');
            return;
        }
        alert('Golaço! Pedido salvo no navegador com sucesso!');
        
        localStorage.removeItem('rascunho_pedido');
        
        if ($('#form-pedido').length) $('#form-pedido')[0].reset();
        $('#select-lanche').val("0");
        $('#input-qtd').val("1");
        $('#select-entrega').val("0.00");
        $('#input-cupom').val("");
        $('.check-adicional').prop('checked', false);
        
        calcularTotal();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    $('#select-lanche, #select-entrega, .check-adicional').on('change', calcularTotal);
    $('#input-qtd, #input-cupom').on('input change', calcularTotal);

    carregarRascunho();
});