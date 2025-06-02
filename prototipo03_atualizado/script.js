/* As linhas abaixo estavam causando erro na data, retrocedendo em 01 dia a data escolhida.
    Depois de retiradas, a função funcionou normalmente. */
/*document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("data").addEventListener("change", function () {
        let dataInput = document.getElementById("data");
        let dataFormatada = new Date(dataInput.value).toLocaleDateString("pt-BR");
        dataInput.value = dataFormatada.split('/').reverse().join('-');
    });
});*/

let idSorteio=0

/* Iniciamos o js informando que não houve sorteio, ou seja, estamos zerando o sistema para começarmos o sorteio. */
let sorteioRealizado = false;
//let roletaCriada = false;

/* Fazendo o sistema entender que maiúsculas e minúsculas são iguais.
    Também é desconsiderado acentos e ç. A idéia aqui é evitar duplicidade de nomes. */
function normalizarTexto(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/g, "c");
}

function criarRoleta() {

        /* Alerta que impede que uma nova roleta seja criada acidentalmente. */
        if (document.getElementById("qr-code-container").innerHTML.trim() != "") {
        
            if(confirm("Uma roleta já foi criada. Deseja criar uma nova roleta? Todos os dados anteriores serão apagados.")==1){
                 
                    document.location.reload();
                    return;
                }
            }
   
    let empresa = document.getElementById("empresa").value.trim();
    let empreendimento = document.getElementById("empreendimento").value.trim();
    let data = document.getElementById("data").value.trim();
    let periodo = document.querySelector('input[name="periodo"]:checked');

    /* Não pode prosseguir sem identificar qual roleta se trata, senão não dá para gerar um ID da roleta. */
    if (!empresa || !empreendimento || !data || !periodo) {
        alert("Todos os campos devem ser preenchidos para continuar.");   
        return;
    }
    document.getElementById("qr-code-container").innerHTML = "";
    new QRCode(document.getElementById("qr-code-container"), {
    text: "http://192.168.17.153/mobile.03.atualizado/html", // link real da versão mobile
    width: 150,
    height: 150
});

}

/* Adicionando os participantes. */
function adicionar() {

    /* Impedindo que participantes sejam adicionados antes de criar a roleta */
    if (document.getElementById("qr-code-container").innerHTML.trim() == "") {
        alert("A roleta ainda não foi criada. Preencha todos os campos do cabeçalho e crie a sua roleta antes de prosseguir.");
        return;
    }

    let nomeOriginal = document.getElementById("nome").value.trim();
    let nomeNormalizado = normalizarTexto(nomeOriginal)
    let equipe = document.getElementById("equipe").value.trim();
    let supervisao = document.getElementById("supervisao").value.trim();
    let listaOriginal = document.getElementById("listaOriginal");

    /* Nome e Equipe são itens obrigatórios para o sorteio. */
    /* SE nome OU equipe = vazio, então surgirá o alert. */
    if (!nome || !equipe) {
        alert("Os campos Nome e Equipe são obrigatórios.");
        return;
    }

    let nomesExistentes = Array.from(listaOriginal.children).map(row => normalizarTexto(row.cells[1].textContent));

    /* Impedindo a duplicidade de nomes. */
    if (nomesExistentes.includes(nomeNormalizado)) {
        alert("Este nome já foi adicionado.");
        return;
    }

    let row = listaOriginal.insertRow();
    row.insertCell(0).textContent = listaOriginal.rows.length;
    row.insertCell(1).textContent = nomeOriginal;
    row.insertCell(2).textContent = equipe;
    row.insertCell(3).textContent = supervisao;

   // Criando o botão REMOVER na lista original
    let removeCell = row.insertCell(4);
    let removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.className = "btn-remover"; // <--- Adicionado aqui
    removeBtn.onclick = function () {
    if (confirm("Tem certeza que deseja remover esta linha?")) {
        listaOriginal.deleteRow(row.rowIndex - 1); 
    }
};
removeCell.appendChild(removeBtn);


    /* Essas 3 linhas abaixo apagam os conteúdos anteriores após clicar em adicionar,
    poupando tempo na digitação de novos participantes. */
    document.getElementById("nome").value = "";
    document.getElementById("equipe").value = "";
    document.getElementById("supervisao").value = "";
    /* Esta linha faz o cursor retornar ao primeiro campo após clicar em adicionar, 
    deixando o sistema pronto para receber novos dados dos próximos participantes. */
    document.getElementById("nome").focus();
   
}

function sortear() {
    if (document.getElementById("listaOriginal").rows.length <= 1) {
        alert("Adicione pelo menos dois nomes antes de sortear.");
        return;
    }

    /* Criando uma função que faz a contagem regressiva. */
    document.getElementById("contador").style.display = "flex";
    let segundos = 5;
    let intervalo = setInterval(() => {
        document.getElementById("contador").textContent = segundos;
        if (segundos === 0) {
            clearInterval(intervalo);
            document.getElementById("contador").style.display = "none";
            executarSorteio();
        }
        segundos--;
    }, 1000);
}

function executarSorteio() {

    /* Alerta que impede que um novo sorteio seja realizado acidentalmente. */
    if (sorteioRealizado) {
        let confirmacao = confirm("Um sorteio já foi realizado. Deseja fazer um novo sorteio?");
        if (!confirmacao) {
            return;
        }
    }

    let listaOriginal = document.getElementById("listaOriginal");
    let listaSorteada = document.getElementById("listaSorteada");


    let nomes = Array.from(listaOriginal.rows).map(row => ({
        nome: row.cells[1].textContent,
        equipe: row.cells[2].textContent,
        supervisao: row.cells[3].textContent
    }));

       console.log(nomes)

    
    //     lá no back-end, receber todos os dados e distribuir cada informação em seu devido campo. Essa distribuição pode ser feito 
    //     com laço while, for, map (vide linha 134)

    // while False:
    //     document.getElementById("listaOriginal")
    
    listaSorteada.innerHTML = "";
    nomes.sort(() => Math.random() - 0.5).forEach((pessoa, index) => {
        let row = listaSorteada.insertRow();
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = pessoa.nome;
        row.insertCell(2).textContent = pessoa.equipe;
        row.insertCell(3).textContent = pessoa.supervisao;
    });

    /* Declarado para o sistema que o sorteio está feito. */
    sorteioRealizado = true;
     
}

function salvarPDF() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    function adicionarPagina(titulo, tabelaId) {
        let empresa = document.getElementById("empresa").value;
        let empreendimento = document.getElementById("empreendimento").value;
        let data = document.getElementById("data").value.split("-").reverse().join("/");
        let periodo = document.querySelector('input[name="periodo"]:checked')?.value || "Não informado";
    
        doc.setFontSize(16);
        doc.text("Resultado do Sorteio", 10, 10);
    
        doc.setFontSize(12);
        doc.text(`Empresa: ${empresa}`, 10, 20);
        doc.text(`Empreend/Loja/Dep: ${empreendimento}`, 110, 20);
        doc.text(`Data: ${data}`, 10, 30);
        doc.text(`Período: ${periodo}`, 110, 30);
    
        doc.setFontSize(14);
        doc.text(titulo, 10, 40);
    
        let tabela = document.getElementById(tabelaId);
        let linhas = [];
        let headers = [];
    
        // Captura os cabeçalhos, ignorando a coluna "REMOVER"
        tabela.querySelectorAll("thead tr th").forEach((th, index) => {
            let texto = th.textContent.trim();
            if (texto.toLowerCase() !== "remover") {
                headers.push({ text: texto, index });
            }
        });
    
        // Adiciona os cabeçalhos válidos
        linhas.push(headers.map(h => h.text));
    
        // Captura os dados das linhas, exceto a coluna "REMOVER"
        tabela.querySelectorAll("tbody tr").forEach(tr => {
            let linha = [];
            headers.forEach(h => {
                let td = tr.querySelectorAll("td")[h.index];
                linha.push(td.textContent.trim());
            });
            linhas.push(linha);
        });
    
        // Gera a tabela no PDF
        doc.autoTable({
            startY: 50,
            head: [linhas[0]],
            body: linhas.slice(1),
            styles: { fontSize: 10, cellWidth: 'auto' },
            theme: 'grid'
        });
    }

    // Adiciona a Lista Original na primeira página
    adicionarPagina("Lista Original", "tabelaOriginal");

    doc.addPage();

    // Adiciona a Lista Sorteada na segunda página
    adicionarPagina("Lista Sorteada", "tabelaSorteada");

    // Salva o PDF
    doc.save("listas_sorteio.pdf");
}

function sortearRoleta(participantes) {
    if (!Array.isArray(participantes) || participantes.length === 0) {
        return "Nenhum participante para sortear!";
    }

    const indiceSorteado = Math.floor(Math.random() * participantes.length);
    return `Participante sorteado: ${participantes[indiceSorteado]}`;
}

//como usar 
const lista = ["Maria", "João", "Ana", "Pedro"];
const resultado = sortearRoleta(lista);
console.log(resultado);