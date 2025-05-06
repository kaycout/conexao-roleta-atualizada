// //Configurações da API
// const API_URL = 'https://minhaapi.com/dados';

// //  Função que pode ser usada em outros arquivos export 
// async function carregarCabecalho() {
//    try {
//        const response = await fetch(API_URL);
//        if (!response.ok) throw new Error('Erro na rede');
//         return await response.json();
//     } catch (error) {
//         console.error("Falha no fetch:", error);
//         return null;
//     }
//  }

// // Carrega automaticamente quando o script é importado
//  document.addEventListener('DOMContentLoaded', async () => {
//      const dados = await carregarCabecalho();
//     if (dados) {
//         document.getElementById('cabecalho-dinamico').innerHTML = `
//             <h2>${dados.empresa}</h2>            
//         `;
//        <p>${new Date(dados.data).toLocaleDateString('pt-BR')}</p>
//     }
//  });
