 document.addEventListener('DOMContentLoaded', function() {
   const form = document.getElementById('cadastroForm');
    
 form.addEventListener('submit', function(e) {
       e.preventDefault();
        
      // Coletar todos os dados do formulário
      const formData = {
             nome: document.getElementById('nome').value.trim(),
            equipe: document.getElementById('equipe').value.trim(),
            supervisao: document.getElementById('supervisao').value.trim(),
           empresa: document.getElementById('empresa').value.trim(),
             empreendimento: document.getElementById('empreendimento').value.trim(),
            data: document.getElementById('data').value,
            periodo: document.getElementById('periodo').value.trim()
       };
        
        // Validar campos obrigatórios
        if (validateForm(formData)) {
             // Simula envio ( essa parte substitui pela lógica real)
            const success = simulateSubmission(formData);
            
             if (success) {
                showAlert('Enviado com sucesso!', 'success');
                form.reset();
            } else {
                showAlert('Erro ao enviar!', 'error');
            }
        } else {
            showAlert('Por favor, preencha todos os campos obrigatórios!', 'error');
        }
    });
    
     // Função para validar o formulário
     function validateForm(data) {
         return data.nome !== '' && 
               data.equipe !== '' && 
               data.supervisao !== '';
    }
    
     // Função para simular envio 
    function simulateSubmission(data) {
            return Math.random() > 0.2;
    }
    
     // Função para mostrar alertas personalizados
     function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
         alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
         // Adiciona o alerta antes do formulário
        const formContainer = document.querySelector('.form-container');
        formContainer.prepend(alertDiv);
        
         // Remove o alerta após 5 segundos
         setTimeout(() => {
             alertDiv.classList.remove('show');
             setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
     }
 });



 // Configurações da API
 const API_CABECALHO = 'http://127.0.0.1:3000';

 async function carregarCabecalho() {
     try {
        const response = await fetch(API_CABECALHO);
        const dados = await response.json();
        
         document.getElementById('cabecalho-dinamico').innerHTML = `
             <h2>${dados.empresa}</h2>
            <p>Data: ${new Date(dados.data).toLocaleDateString('pt-BR')}</p>
         `;
     } catch (error) {
        console.error("Erro ao carregar cabeçalho:", error);
        document.getElementById('cabecalho-dinamico').innerHTML = `
            <div class="alert alert-danger">Erro ao carregar dados</div>
        `;
    } }

 // Carrega quando a página inicia
 document.addEventListener('DOMContentLoaded', () => {
     
     carregarCabecalho();
 });