document.addEventListener('DOMContentLoaded', function() {
    // Elementos da página
    const posicaoSorteada = document.getElementById('posicao-sorteada');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnSair = document.getElementById('btn-sair');
    
    // Simulação: obter posição sorteada 
    const posicao = obterPosicaoSorteada();
    posicaoSorteada.textContent = posicao;
    
    // Configurar confettis
    criarConfettis();
    
    // Eventos listeners
    btnSalvar.addEventListener('click', salvarLista);
    btnSair.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    // Funções
    function obterPosicaoSorteada() {
        // Simulação - substitua pela lógica real de obtenção da posição
        return Math.floor(Math.random() * 100) + 1;
    }
    
    function salvarLista() {
        // Lógica para salvar a lista 
        alert('Lista salva com sucesso!');
    }
    
    function criarConfettis() {
        const cannon = document.querySelector('.cannon');
        const colors = ['#0d6efd', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];
        const types = ['ribbon', 'flake'];
        
        for (let i = 0; i < 50; i++) {
            const path = document.createElement('div');
            path.className = `cannon__path cannon__path--${['sm', 'md', 'lg'][Math.floor(Math.random() * 3)]} cannon__path--angle${Math.floor(Math.random() * 5) - 2}`;
            
            const confetti = document.createElement('div');
            confetti.className = `cannon__confetti cannon__confetti--${types[Math.floor(Math.random() * types.length)]} cannon__confetti--color-${Math.floor(Math.random() * colors.length) + 1}`;
            
            // Posição e animação aleatória (CRASES CORRIGIDAS)
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.animationDuration = `${3 + Math.random() * 4}s`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            
            path.appendChild(confetti);
            cannon.appendChild(path);
        }
    }


    document.addEventListener("DOMContentLoaded", () => {
        // Lógica do botão "Salvar"
        document.getElementById("btn-salvar").addEventListener("click", async () => {
          try {
            await gerarPDF(); // Tenta gerar o PDF
      
            // Se não der erro, redireciona
            setTimeout(() => {
              window.location.href = "agradecimento.html"; // Altere para o destino real
            }, 1000);
          } catch (error) {
            console.error("Erro ao salvar o PDF:", error);
            // Aqui não redireciona!
          }
        });
      
        // Lógica do botão "Sair"
        document.getElementById("btn-sair").addEventListener("click", () => {
          window.location.href = "agradecimento.html"; // Altere para o destino real
        });
      });
      
      // Exemplo básico de função gerarPDF
      async function gerarPDF() {
        const { jsPDF } = window.jspdf;
      
        const doc = new jsPDF();
        doc.text("Lista de Sorteio", 10, 10);
        doc.save("lista-sorteio.pdf"); // Essa linha pode lançar erro se algo der errado
      }
      


});