// formulario.js 

document.addEventListener('DOMContentLoaded', function() {
    
    // Configurações (modo API ou mockado)
    const USE_API = false; // Quando não foi a API original
    const API_URL = 'https://sua-api-real.com/dados';

    // Função para carregar dados do cabeçalho
    async function carregarCabecalho() {
        let dados;
        
        if (!USE_API) {
            // Modo de desenvolvimento (dados para exemplo)
            dados = {
                empresa: "Nome da Empresa",
                empreendimento: "Loja Centro",
                data: "2023-12-15",
                periodo: "Manhã"
            };
        } else {
            // Modo orginal (carregando dados originais)
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Erro na rede');
                dados = await response.json();
            } catch (error) {
                console.error("Falha ao carregar cabeçalho:", error);
                document.getElementById('cabecalho-dados').innerHTML = `
                    <div class="alert alert-warning">
                        Não foi possível carregar os dados.
                    </div>
                `;
                return;
            }
        }

        // Renderiza os dados no HTML
        const dataFormatada = new Date(dados.data).toLocaleDateString('pt-BR');
        document.getElementById('cabecalho-dados').innerHTML = `
            <h2>${dados.empresa}</h2>
            <p><strong>Empreendimento:</strong> ${dados.empreendimento}</p>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Período:</strong> ${dados.periodo}</p>
        `;
    }

    // Validação do formulário
    const form = document.getElementById('cadastroForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            nome: document.getElementById('nome').value.trim(),
            equipe: document.getElementById('equipe').value.trim(),
            supervisao: document.getElementById('supervisao').value.trim()
        };
        
        
        if (validateForm(formData)) {
            const myModal = new bootstrap.Modal(document.getElementById('successModal'));
            myModal.show();
            form.reset();
        
            // Redirecionamento após exibir o modal por 3 segundos
            setTimeout(() => {
                window.location.href = 'espera.html'; 
            }, 3000);
        
        
        } else {
            const modalBody = document.querySelector('#successModal .modal-body');
            modalBody.innerHTML = 'Por favor, preencha todos os campos obrigatórios!';
            modalBody.classList.add('text-danger');
            const myModal = new bootstrap.Modal(document.getElementById('successModal'));
            myModal.show();
        }
    });
    
    // Função auxiliar de validação
    function validateForm(data) {
        return data.nome !== '' && 
               data.equipe !== '' && 
               data.supervisao !== '';
    }



    // Alternador de tema simplificado
    document.querySelector('#themeToggle').addEventListener('click', () => {
        const html = document.documentElement;
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
      });
    

    // Inicialização
    carregarCabecalho();
});