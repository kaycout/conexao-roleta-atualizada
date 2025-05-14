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
                window.location.href = 'agradecimento.html';
            }, 2000);
        }
    }, 250);

    //Este seria o código para download real do PDF:

    // document.addEventListener('DOMContentLoaded', function() {
    //     const progressBar = document.querySelector('.progress-bar');
    //     const btnCancelar = document.getElementById('btn-cancelar');
    //     const mensagem = document.querySelector('#mensagem-download h3');
    //     const spinner = document.querySelector('.spinner-border');
    //     const quadrado = document.getElementById('quadrado-status');
    
    //     // URL do arquivo para download (exemplo)
    //     const fileUrl = 'https://exemplo.com/arquivo.zip';
    //     let xhr = new XMLHttpRequest();
    //     let cancelado = false;
    
    //     // Configuração do download
    //     xhr.open('GET', fileUrl, true);
    //     xhr.responseType = 'blob'; // Tipo de resposta: arquivo binário
    
    //     // Botão de cancelamento
    //     btnCancelar.addEventListener('click', function() {
    //         cancelado = true;
    //         xhr.abort(); // Interrompe o download
    //         mensagem.textContent = "Download cancelado!";
    //         spinner.style.display = 'none';
    //     });
    
    //     // Monitora o progresso
    //     xhr.onprogress = function(e) {
    //         if (e.lengthComputable) {
    //             const percentual = Math.round((e.loaded / e.total) * 100);
    //             progressBar.style.height = `${percentual}%`;
    //         }
    //     };
    
    //     // Quando o download concluir
    //     xhr.onload = function() {
    //         if (!cancelado && xhr.status === 200) {
    //             const blob = xhr.response;
    //             const link = document.createElement('a');
    //             link.href = window.URL.createObjectURL(blob);
    //             link.download = 'arquivo.zip'; // Nome do arquivo
    //             link.click(); // Dispara o download
    
    //             // Atualiza a UI
    //             spinner.style.display = 'none';
    //             quadrado.innerHTML = '<i class="bi bi-check-circle-fill text-success"></i>';
    //             mensagem.textContent = "Download concluído!";
    //             btnCancelar.style.display = 'none';
    //         }
    //     };
    
    //     // Em caso de erro
    //     xhr.onerror = function() {
    //         mensagem.textContent = "Erro no download!";
    //         progressBar.style.backgroundColor = 'red';
    //     };
    
    //     // Inicia o download
    //     xhr.send();
    // });

    
    // Cancelar download
    btnCancelar.addEventListener('click', function() {
        clearInterval(intervalo);
        quadrado.innerHTML = '<i class="bi bi-x-circle-fill text-danger" style="font-size: 2rem;"></i>';
        mensagem.textContent = "Download cancelado";
        spinner.style.display = 'none';
        this.style.display = 'none';
    });
});