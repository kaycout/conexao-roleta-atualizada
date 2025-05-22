# API Roleta de Equipes

API backend desenvolvida em **Node.js**, **Express** e **MySQL** para gerenciar participantes, empresas e sorteios de forma automatizada e organizada. O sistema facilita o processo de sorteio de equipes de vendas.

---

## Tecnologias Utilizadas

- **Node.js** — Ambiente de execução JavaScript.
- **Express** — Framework para criação de APIs RESTful.
- **MySQL** — Banco de dados relacional.
- **Multer** — Middleware para manipulação de upload de arquivos.
- **Bcrypt** — Biblioteca para criptografia de senhas.
- **PDFKit** — Geração de arquivos PDF.
- **csv-parser** — Leitura de arquivos CSV.
- **xlsx** — Manipulação de arquivos Excel.

---

## Funcionalidades

### Participantes

- **Listar** — `GET /participantes`  
  Lista todos os participantes cadastrados no sistema.

- **Cadastrar** — `POST /participantes`  
  Permite cadastrar um novo participante no sorteio.

- **Atualizar** — `PUT /participantes/:id`  
  Atualiza os dados de um participante específico.

- **Deletar** — `DELETE /participantes/:id`  
  Remove um participante do sistema.

---

### Empresas

- **Cadastrar** — `POST /empresas`  
  Permite o cadastro de novas empresas.

- **Atualizar** — `PUT /empresas/:id`  
  Atualiza informações de uma empresa existente.

- **Deletar** — `DELETE /empresas/:id`  
  Remove uma empresa do sistema.

---

### Sorteios

- **Cadastrar** — `POST /sorteios`  
  Cadastra um novo sorteio.

- **Atualizar** — `PUT /sorteios/:id`  
  Atualiza dados do sorteio.

- **Deletar** — `DELETE /sorteios/:id`  
  Remove um sorteio.

- **Gerar PDF** — `GET /sorteios/:id/pdf`  
  Gera um arquivo PDF com os resultados do sorteio.

---

### Uploads de Arquivos

- **Upload CSV/XLSX** — `POST /upload`  
  Permite o upload de arquivos CSV e Excel contendo dados de participantes para importação automática.

---

## Estrutura do Banco de Dados (Resumo)

| Tabela        | Principais Campos                                         | Descrição                             |
|---------------|----------------------------------------------------------|-------------------------------------|
| `participante` | `id`, `nome`, `equipe`, `supervisao`, `id_sorteio`, `via_qr` | Dados dos participantes e associação ao sorteio. |
| `empresa`     | `id_empresa`, `empresa`, `data_sorteio`, `periodo`       | Informações das empresas participantes.           |
| `sorteio`     | `id`, `nome_responsavel`, `email_responsavel`, `senha_responsavel`, `data_criacao`, `status` | Dados e status dos sorteios.          |

---

