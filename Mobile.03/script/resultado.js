document.addEventListener('DOMContentLoaded', function () {
  const mensagemCompleta = document.getElementById('mensagem-completa');
  const btnSalvar = document.getElementById('btn-salvar');

  // Pega os parâmetros da URL: nome e id_sorteio
  const urlParams = new URLSearchParams(window.location.search);
  const nomeUsuario = urlParams.get('nome') || '';
  const id_sorteio = urlParams.get('id_sorteio');

  // Se não houver ID ou nome, mostra erro e interrompe o script
  if (!id_sorteio || !nomeUsuario) {
    console.error("ID do sorteio ou nome do participante não encontrado na URL");
    if (mensagemCompleta) { 
      mensagemCompleta.textContent = "Erro: ID do sorteio ou nome do participante não encontrado.";
    }
    return;
  }

  // URL da API para sortear
  const API_URL = `http://localhost:3000/realizar-sorteio/${id_sorteio}?nome=${encodeURIComponent(nomeUsuario)}`;

  // Função para buscar a posição do usuário
  async function carregarPosicaoDoBackend(nome) {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) throw new Error('Erro ao obter posição sorteada');
      
      const data = await response.json();

      if (!Array.isArray(data.resultado)) {
        throw new Error('Formato inesperado da resposta do backend.');
      }

      const participanteEncontrado = data.resultado.find(
        p => p.nome.toLowerCase() === nome.toLowerCase()
      );

      if (mensagemCompleta) {
        mensagemCompleta.textContent = participanteEncontrado 
          ? `🎉 Você está na posição ${participanteEncontrado.ordem}. Boa sorte!` 
          : "Participante não encontrado.";
      }
    } catch (error) {
      console.error('Erro ao buscar posição:', error);
      if (mensagemCompleta) {
        mensagemCompleta.textContent = 'Erro ao buscar sua posição.';
      }
    }
  }

  // Inicia a função
  carregarPosicaoDoBackend(nomeUsuario);

  // Dispara os confetes
  if (typeof criarConfettis === 'function') {
    criarConfettis();
  }

  // Botão SALVAR: gera PDF e redireciona
  btnSalvar?.addEventListener('click', async () => {
    try {
      await gerarPDF();
      setTimeout(() => {
        window.location.href = "agradecimento.html";
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar o PDF:", error);
    }
  });

  // Gera um PDF simples (pode ser personalizado depois)
  async function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Lista de Sorteio", 10, 10);
    doc.save("lista-sorteio.pdf");
  }
});