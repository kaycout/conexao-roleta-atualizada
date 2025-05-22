document.addEventListener('DOMContentLoaded', function() {
    const quadrado = document.getElementById('quadrado-status');
    const spinner = document.querySelector('.spinner-border');

    if (!quadrado) {
        console.warn('Elemento #quadrado-status não encontrado');
        return;
    }

    setTimeout(() => {
        quadrado.innerHTML = '<i class="bi bi-check-circle-fill"></i><p class="mt-2">Pronto!</p>';
        quadrado.style.backgroundColor = "#28a745";
        if (spinner) spinner.style.display = 'none';
    }, 3000);
});

async function verificarSorteioConcluido() {
    try {
        const id_sorteio = 3; // ID fixo do sorteio
        const response = await fetch(`http://127.0.0.1:3000/realizar-sorteio/${id_sorteio}`);

        if (!response.ok) throw new Error("Erro ao consultar o status do sorteio");

        const resultado = await response.json();

        if (resultado.finalizado) {
            // Dados para o redirecionamento
            const idSorteio = 3; // Substituir pelo ID gerado dinamicamente, se possível
            const nome = "Kay"; // Substituir pelo nome do participante, se possível
            
            // Redireciona com parâmetros na URL
            window.location.href = `resultado.html?id_sorteio=${idSorteio}&nome=${encodeURIComponent(nome)}`;
        }
    } catch (error) {
        console.error("Erro ao verificar sorteio:", error);
    }
}

// Verifica o status do sorteio a cada 3 segundos
setInterval(verificarSorteioConcluido, 3000);
