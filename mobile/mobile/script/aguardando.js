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