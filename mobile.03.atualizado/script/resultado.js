document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const nomeUsuario = urlParams.get('nome') || 'Participante';
  const id_sorteio = urlParams.get('id_sorteio') || 3;

  const API_URL = `http://localhost:3000/realizar_sorteio/${id_sorteio}?nome=${encodeURIComponent(nomeUsuario)}`;

  const posicaoSpan = document.getElementById('posicao-sorteada'); // Ajuste o seletor conforme seu HTML
  const btnSalvar = document.getElementById('btnSalvar'); // Ajuste o seletor conforme seu HTML
  const btnSair = document.getElementById('btnSair'); // Ajuste o seletor conforme seu HTML

  let posicaoSorteada = null; // Guardar posição para PDF

  async function carregarPosicaoDoBackend(nome) {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Erro ao obter posição sorteada');

      const data = await response.json();

      // Logs para debugs
      console.log("Resposta da API:", JSON.stringify(data, null, 2));
      console.log("Resultado:", data.resultado);
      data.resultado.forEach((p, i) => {
        console.log(`Participante ${i + 1}:`, JSON.stringify(p));
      });

      if (!Array.isArray(data.resultado)) {
        console.error("Resultado malformado:", data.resultado);
        throw new Error('Formato inesperado da resposta do backend.');
      }

      data.resultado.forEach((p, i) => {
        console.log(`Participante ${i + 1}: Nome=${p.nome}, Ordem=${p.ordem}`);
      });

      const participanteEncontrado = data.resultado.find(p => {
        console.log(`Comparando: ${p.nome.toLowerCase()} === ${nome.toLowerCase()}`);
        return p.nome.toLowerCase() === nome.toLowerCase();
      });

      if (participanteEncontrado) {
        posicaoSorteada = participanteEncontrado.ordem; // salva posição
      }

     if (posicaoSpan) {
      if (participanteEncontrado) {
      posicaoSpan.textContent = participanteEncontrado.ordem;
    } else {
      posicaoSpan.textContent = "__";
    }
  }

    } catch (error) {
      console.error('Erro ao buscar posição:', error);
      if (mensagemCompleta) {
        mensagemCompleta.textContent = 'Erro ao buscar sua posição.';
      }
    }
  }

  carregarPosicaoDoBackend(nomeUsuario);

  if (typeof criarConfettis === 'function') {
    criarConfettis();
  }

  btnSalvar?.addEventListener('click', async () => {
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Gerando PDF...";
    try {
      await gerarPDF();
      btnSalvar.textContent = "PDF salvo!";
      setTimeout(() => {
        window.location.href = "agradecimento.html";
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar o PDF:", error);
      btnSalvar.textContent = "Erro ao salvar";
      btnSalvar.disabled = false;
    }
  });

  btnSair?.addEventListener('click', () => {
    // Redireciona para página inicial (ou outra que desejar)
    window.location.href = 'index.html';
  });

  async function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Resultado do Sorteio", 20, 30);

    doc.setFontSize(16);
    doc.text(`Nome: ${nomeUsuario}`, 20, 50);
    doc.text(`ID do Sorteio: ${id_sorteio}`, 20, 60);

    doc.setFontSize(14);
    if (posicaoSorteada !== null) {
      doc.text(`Posição sorteada: ${posicaoSorteada}`, 20, 80);
    } else {
      doc.text("Posição sorteada: Não disponível", 20, 80);
    }

    doc.save(`resultado-${nomeUsuario}.pdf`);
  }
});