document.addEventListener('DOMContentLoaded', function () {
    const quadrado = document.getElementById('quadrado-status');
    const spinner = document.querySelector('.spinner');

    if (!quadrado) {
        console.warn('Elemento #quadrado-status não encontrado');
        return;
    }

    // Exibe o status "Pronto!" após 3 segundos
    setTimeout(() => {
        quadrado.innerHTML = `
            <i class="bi bi-check-circle-fill fs-1 text-white"></i>
            <p class="mt-2 text-white">Pronto!</p>
        `;
        quadrado.style.backgroundColor = "#28a745"; // Verde sucesso
        quadrado.style.display = 'flex';
        quadrado.style.flexDirection = 'column';
        quadrado.style.alignItems = 'center';
        quadrado.style.justifyContent = 'center';
        quadrado.style.padding = '20px';
        quadrado.style.borderRadius = '10px';

        if (spinner) spinner.style.display = 'none';
    }, 3000);
});

// Função que verifica se o sorteio foi concluído
async function verificarSorteioConcluido() {
    try {
        const id_sorteio = 3; // ou um ID dinâmico
        const response = await fetch(`http://127.0.0.1:3000/realizar_sorteio/${id_sorteio}`);

        if (!response.ok) throw new Error("Erro ao consultar o status do sorteio");

        const resultado = await response.json();
        console.log("Status do sorteio:", resultado);

        // Verifica se o array "resultado" veio com dados
        if (resultado.resultado && resultado.resultado.length > 0) {
            // Armazena no sessionStorage para usar em resultado.html
            sessionStorage.setItem("resultadoSorteio", JSON.stringify(resultado.resultado));

            const nome = sessionStorage.getItem("nomeParticipante") || "Participante";
            window.location.href = `resultado.html?id_sorteio=${id_sorteio}&nome=${encodeURIComponent(nome)}`;
        }
    } catch (error) {
        console.error("Erro ao verificar sorteio:", error);
    }
}

// Verifica a cada 3 segundos
setInterval(verificarSorteioConcluido, 5000);
