document.addEventListener('DOMContentLoaded', function () {
    // Configurações
    const USE_API = true;
    const API_URL = 'http://127.0.0.1:3000/empresa/3';
    const FORM_SUBMIT_URL = 'http://127.0.0.1:3000/cadastrar_participante_mobile';

    const form = document.getElementById('cadastroForm');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    // Envio do formulário
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = obterDadosFormulario();
        console.log('Dados coletados do formulário:', formData);

        if (!validarFormulario(formData)) {
            mostrarErroValidacao();
            return;
        }

        try {
            await enviarDadosParaBackend(formData);
            redirecionarAposSucesso();
        } catch (error) {
            handleError(error.message);
        }
    });

    // Obter dados do formulário
    function obterDadosFormulario() {
        return {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            senha: document.getElementById('senha').value.trim()
        };
    }

    // Validação simples
    function validarFormulario(data) {
        return data.nome !== '' && data.email !== '' && data.senha !== '';
    }

    // Mostrar erro de validação
    function mostrarErroValidacao() {
        const modalBody = document.querySelector('#successModal .modal-body');
        modalBody.innerHTML = 'Por favor, preencha todos os campos obrigatórios!';
        modalBody.classList.add('text-danger');
        successModal.show();
    }

    // Enviar dados para o backend
    async function enviarDadosParaBackend(formData) {
        console.log('Enviando para o backend:', formData);

        if (!USE_API) {
            console.log('Simulação de envio:', formData);
            const modalBody = document.querySelector('#successModal .modal-body');
            modalBody.textContent = 'Simulação de envio concluída!';
            modalBody.classList.remove('text-danger');
            successModal.show();
            form.reset();
            return;
        }

        try {
            const response = await fetch(FORM_SUBMIT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const responseText = await response.text();
            console.log("Resposta bruta do backend:", responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch {
                result = { message: responseText };
            }

            if (!response.ok) {
                console.error("Erro HTTP:", response.status);
                console.error("Resposta do backend (erro):", result);
                throw new Error(result.message || result.erro || result.detalhes || 'Erro ao enviar formulário');
            }

            const modalBody = document.querySelector('#successModal .modal-body');
            modalBody.textContent = result.message || 'Cadastro realizado com sucesso!';
            modalBody.classList.remove('text-danger');

            successModal.show();
            form.reset();

        } catch (error) {
            console.error("Erro capturado na requisição:", error);
            if (error.message === 'NOME_DUPLICADO') {
                window.location.href = `error.html?msg=${encodeURIComponent('Este nome já está cadastrado na lista!')}&tipo=NOME_DUPLICADO`;
            } else {
                alert("Erro ao enviar formulário: " + error.message);
            }
        }
    }

    // Redirecionamento após sucesso
    function redirecionarAposSucesso() {
        setTimeout(() => {
            window.location.href = 'espera.html';
        }, 3000);
    }

    // -----------------------------
    // CABEÇALHO
    async function carregarCabecalho() {
        try {
            const dados = await obterDadosCabecalho();
            renderizarCabecalho(dados);
        } catch (error) {
            console.error("Falha ao carregar cabeçalho:", error);
            mostrarErroCabecalho();
        }
    }

    async function obterDadosCabecalho() {
        if (!USE_API) {
            return {
                nome: "Empresa Exemplo",
                empreendimento: "Loja Centro",
                data_sorteio: new Date().toISOString().split('T')[0],
                periodo: "Manhã"
            };
        }

        try {
            const response = await fetch(API_URL);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const text = await response.text();
            console.log('Resposta crua da API:', text);

            let dados;
            try {
                dados = JSON.parse(text);
            } catch {
                throw new Error('Resposta da API não é JSON válido');
            }

            if (!dados.nome || !dados.data_sorteio) {
                throw new Error('Faltam campos obrigatórios no JSON');
            }

            return dados;

        } catch (error) {
            console.error('Erro na API:', error);
            throw new Error('Erro ao carregar dados da empresa');
        }
    }

    function renderizarCabecalho(dados) {
        const dataFormatada = new Date(dados.data_sorteio).toLocaleDateString('pt-BR');
        document.getElementById('cabecalho-dados').innerHTML = `
            <h2>${dados.nome}</h2>
            <p><strong>Empreendimento:</strong> ${dados.empreendimento || '---'}</p>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Período:</strong> ${dados.periodo || '---'}</p>
        `;
    }

    function mostrarErroCabecalho() {
        document.getElementById('cabecalho-dados').innerHTML = `
            <div class="alert alert-warning">
                Não foi possível carregar os dados da empresa.
            </div>
        `;
    }

    // -----------------------------
    // Alternador de tema (opcional)
    document.querySelector('#themeToggle')?.addEventListener('click', alternarTema);

    function alternarTema() {
        const html = document.documentElement;
        const novoTema = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', novoTema);
    }

    // -----------------------------
    // Manipulação de erros
    function handleError(errorMessage) {
        const encodedMsg = encodeURIComponent(errorMessage);
        window.location.href = `../html/error.html?msg=${encodedMsg}`;
    }

    // Inicialização
    carregarCabecalho();
});
