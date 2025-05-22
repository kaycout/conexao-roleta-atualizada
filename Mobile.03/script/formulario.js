document.addEventListener('DOMContentLoaded', function () {
    // Configurações
    const USE_API = true;
    const API_URL = 'http://127.0.0.1:3000/empresa/3';
    const FORM_SUBMIT_URL = 'http://127.0.0.1:3000/participante_mobile';

    const form = document.getElementById('cadastroForm'); // <- MANTENHA esse ID no HTML
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    // Escuta do envio do formulário
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = obterDadosFormulario();

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

    // Função para obter dados do formulário
    function obterDadosFormulario() {
        return {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            senha: document.getElementById('senha').value.trim(),
        };
    }

    function validarFormulario(data) {
        return data.nome !== '' && data.email !== '' && data.senha !== '';
    }

    function mostrarErroValidacao() {
        const modalBody = document.querySelector('#successModal .modal-body');
        modalBody.innerHTML = 'Por favor, preencha todos os campos obrigatórios!';
        modalBody.classList.add('text-danger');
        successModal.show();
    }

    async function enviarDadosParaBackend(formData) {
        if (!USE_API) {
            console.log('Simulação de envio:', formData);
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
            console.log("Resposta bruta:", responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch {
                result = { message: responseText };
            }

            if (!response.ok) {
                console.error("Erro HTTP:", response.status);
                console.error("Resposta do backend:", result);
                throw new Error(result.message || result.erro || result.detalhes || 'Erro ao enviar formulário');
            }

            const modalBody = document.querySelector('#successModal .modal-body');
            modalBody.textContent = result.message || 'Cadastro realizado com sucesso!';
            modalBody.classList.remove('text-danger');

            successModal.show();
            form.reset();

        } catch (error) {
            console.error("Erro capturado:", error);
            if (error.message === 'NOME_DUPLICADO') {
                window.location.href = `error.html?msg=${encodeURIComponent('Este nome já está cadastrado na lista!')}&tipo=NOME_DUPLICADO`;
            } else {
                alert("Erro ao enviar formulário: " + error.message);
            }
        }
    }

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
            if (!response.ok) throw new Error('Erro ao carregar dados da empresa');

            const dadosArray = await response.json();
            if (!Array.isArray(dadosArray) || dadosArray.length === 0) {
                throw new Error('Dados da empresa incompletos');
            }

            const dados = dadosArray[0];
            if (!dados.nome || !dados.data_sorteio) {
                throw new Error('Faltam campos obrigatórios');
            }

            return dados;

        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
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
    // Alternador de tema
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
        window.location.href = `error.html?msg=${encodedMsg}`;
    }

    // Inicialização
    carregarCabecalho();
});
