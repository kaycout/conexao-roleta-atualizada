document.addEventListener('DOMContentLoaded', function() {
    const quadrado = document.getElementById('quadrado-status');
    const progressBar = document.querySelector('.progress-bar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const mensagem = document.querySelector('#mensagem-download h3');
    const spinner = document.querySelector('.spinner-border');
    
    // Simulação de download 
    let progresso = 0;
    const intervalo = setInterval(() => {
        progresso += 5;
        progressBar.style.height = `${progresso}%`;
        
        if (progresso >= 100) {
            clearInterval(intervalo);
            spinner.style.display = 'none';
            quadrado.innerHTML = '<i class="bi bi-check-circle-fill text-success" style="font-size: 2rem;"></i>';
            mensagem.textContent = "Download concluído com sucesso!";
            btnCancelar.style.display = 'none';
            
            // Redirecionamento automático 
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }, 250);
    
    // Cancelar download
    btnCancelar.addEventListener('click', function() {
        clearInterval(intervalo);
        quadrado.innerHTML = '<i class="bi bi-x-circle-fill text-danger" style="font-size: 2rem;"></i>';
        mensagem.textContent = "Download cancelado";
        spinner.style.display = 'none';
        this.style.display = 'none';
    });
});