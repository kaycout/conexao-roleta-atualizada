document.addEventListener('DOMContentLoaded', function() {
    const quadrado = document.getElementById('quadrado-status');
    const spinner = document.querySelector('.spinner-border');
    
    // Simulação de carregamento (3 segundos)
    setTimeout(() => {
        quadrado.innerHTML = '<i class="bi bi-check-circle-fill"></i><p class="mt-2">Pronto!</p>';
        quadrado.style.backgroundColor = "#28a745";
        spinner.style.display = 'none';
    }, 3000);
});
async function verificarSorteioConcluido() {
    try {
      const response = await fetch("http://127.0.0.1:3000/sorteio/status"); // precisa substituir pela rota
      if (!response.ok) throw new Error("Erro ao consultar o status do sorteio");
  
      const resultado = await response.json();
  
      // resultado finalizado
      if (resultado.finalizado) {
        // Redireciona para a página de resultado
        window.location.href = "resultado.html"; // precisa substituir pela rota
      }
    } catch (error) {
      console.error("Erro ao verificar sorteio:", error);
    }
  }
  
  // Verifica o status a cada 3 segundos
  setInterval(verificarSorteioConcluido, 3000);
  
