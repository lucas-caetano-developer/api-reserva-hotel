# API de Reserva de Hotel - Módulo de Hóspedes

API desenvolvida em **Node.js**, **TypeScript** e **Express** para gerenciamento do cadastro de hóspedes de um sistema de reservas de hotel.

A persistência dos dados é realizada no **PostgreSQL** utilizando o **Prisma ORM**.

O principal diferencial deste projeto é sua arquitetura baseada em **Programação Orientada a Objetos (POO)** e na aplicação de **Design Patterns**, garantindo um código escalável, testável e de fácil manutenção.

---

# Índice

- [Arquitetura, POO e Padrões de Projeto](#arquitetura-poo-e-padrões-de-projeto-aplicados)
- [Diagrama de Classes](#diagrama-de-classes)
- [Fluxo da Aplicação](#o-fluxo-da-aplicação-na-prática)
- [Diagrama de Sequência](#diagrama-de-sequência)
- [Como executar](#como-executar-o-projeto-localmente)

---

# Arquitetura, POO e Padrões de Projeto Aplicados

O sistema foi inteiramente modelado utilizando os pilares da **Programação Orientada a Objetos (POO)**.

Todas as entidades do sistema (como `Hospede`, `Endereco` e `Cidade`) herdam de uma classe abstrata base chamada `EntidadeDominio`, reaproveitando atributos comuns como ID e data de criação.

Além da POO, a arquitetura foi desenhada para separar responsabilidades utilizando os seguintes padrões:

---

## 1. MVC (Model-View-Controller)

O padrão MVC é a espinha dorsal da separação de responsabilidades na entrada de dados.

### O que faz

O `HospedeController` atua como o Controlador, recebendo as requisições HTTP da camada de rotas. Ele extrai os dados e os transforma em instâncias puras das Models (Entidades de Domínio).

### Por que foi usado

Mantém a regra de negócio totalmente isolada da infraestrutura web.

O Controller não salva nada no banco e não valida regras complexas; ele apenas traduz a requisição e delega o trabalho para a camada inferior.

---

## 2. Facade (Fachada)

A Fachada atua como uma interface unificada para um conjunto de subsistemas complexos.

### O que faz

A classe `FachadaHospede` centraliza toda a orquestração do sistema.

O Controller conhece apenas a Fachada.

Internamente, a Fachada:

- inicializa o DAO;
- mapeia quais regras (`Strategies`) devem rodar para cada operação;
- gerencia a criação de logs de auditoria.

### Por que foi usado

Reduz o acoplamento entre as camadas.

Caso o Controller conhecesse todas as classes de validação e acesso ao banco, qualquer alteração na regra de negócio quebraria essa camada.

A Fachada esconde toda essa complexidade.

---

## 3. Strategy

O padrão Strategy permite definir uma família de algoritmos, encapsulá-los e torná-los intercambiáveis.

### O que faz

Todas as regras de negócio implementam a interface `IStrategy`.

Classes como:

- `ValidarDadosHospede`
- `ValidarEmail`
- `ValidarCpfUnico`

contêm regras específicas e independentes.

A Fachada mantém uma lista dessas estratégias e as executa sequencialmente.

### Por que foi usado

Aplica o princípio **Open/Closed Principle**.

Para adicionar uma nova validação basta criar uma nova classe implementando `IStrategy` e adicioná-la na lista da Fachada, sem modificar o restante do sistema.

---

## 4. DAO (Data Access Object)

O DAO abstrai e encapsula todo acesso à fonte de dados.

### O que faz

A classe `HospedeDAO` implementa a interface `IDAO` e é o único lugar da aplicação que utiliza o cliente Prisma.

Ela recebe a entidade de domínio e a traduz para o formato persistido no banco.

### Por que foi usado

Isola completamente a tecnologia de persistência da regra de negócio.

As validações e a orquestração não conhecem Prisma nem PostgreSQL.

Caso seja necessário trocar o ORM futuramente, apenas o DAO precisará ser alterado.

---

# Diagrama de Implementação

<p align="center">
  <img src="docs/diagrama-implementacao.png" alt="Diagrama de Implementação" width="900">
</p>

---

# O Fluxo da Aplicação na Prática

Para entender como os padrões trabalham juntos, acompanhe o ciclo de vida de uma requisição de cadastro de hóspede (`POST /api/hospedes`).

O objetivo desta arquitetura é garantir que nenhuma camada saiba mais do que deveria.

---

## 1. Controller — A Porta de Entrada (MVC)

O `HospedeController` é o primeiro a receber a requisição.

Sua única responsabilidade é:

- extrair os dados da requisição;
- montar o objeto de domínio (`Hospede`);
- delegar o restante do fluxo.

```ts
// src/controllers/HospedeController.ts

salvar = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. O Controller apenas traduz o JSON para a Entidade de Domínio

    const hospede = this.montarHospede(req.body);

    // 2. Entrega o objeto para a Fachada resolver o resto

    const hospedeSalvo = await this.fachada.salvar(hospede);

    res.status(201).json({
      mensagem: "Sucesso!",
      dados: hospedeSalvo,
    });
  } catch (error: any) {
    // 3. Qualquer erro lançado pelas validações cai aqui automaticamente

    res.status(400).json({
      erro: error.message,
    });
  }
};
```

---

## 2. Fachada — O Maestro do Sistema (Facade)

O Controller chama o método `salvar()` da `FachadaHospede`.

Antes de enviar os dados para o banco, a Fachada obriga a entidade a passar por uma esteira de validações através do método privado `executarRegras()`.

```ts
// src/facade/FachadaHospede.ts

async salvar(entidade: EntidadeDominio): Promise<EntidadeDominio> {

  // 1. Aciona o motor de validações

  await this.executarRegras(entidade, "SALVAR");

  // 2. Se chegou até aqui, os dados são válidos

  const entidadeSalva = await this.dao.salvar(entidade);

  // 3. Auditoria automática

  await this.logStrategy.processar(entidadeSalva);

  return entidadeSalva;
}

private async executarRegras(
    entidade: EntidadeDominio,
    operacao: string
): Promise<void> {

    const regrasDaOperacao = this.regras.get(operacao);

    if (regrasDaOperacao) {

        for (const regra of regrasDaOperacao) {

            const mensagemErro = await regra.processar(entidade);

            if (mensagemErro) {
                throw new Error(mensagemErro);
            }

        }

    }

}
```

---

## 3. Strategies — As Regras Isoladas (Strategy)

O método `executarRegras()` percorre todas as implementações da interface `IStrategy`, chamando apenas o método `processar()`.

Exemplo da validação de e-mail:

```ts
// src/strategy/hospede/ValidarEmail.ts

export class ValidarEmail implements IStrategy {
  async processar(entidade: EntidadeDominio): Promise<string | null> {
    const hospede = entidade as Hospede;

    if (!hospede.email) return "O e-mail é obrigatório.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(hospede.email)) {
      return "O formato do e-mail é inválido.";
    }

    return null;
  }
}
```

---

## 4. DAO — Persistência dos Dados (Data Access Object)

Se o objeto passou por todas as validações, a Fachada entrega a entidade ao `HospedeDAO`.

Esta é a única classe da aplicação que conhece Prisma e PostgreSQL.

```ts
// src/dao/HospedeDAO.ts

export class HospedeDAO implements IDAO {
  async salvar(entidade: EntidadeDominio): Promise<EntidadeDominio> {
    const hospede = entidade as Hospede;

    const hospedeCriado = await prisma.hospede.create({
      data: {
        nome: hospede.nome,
        cpf: hospede.cpf,
        email: hospede.email,

        // ... mapeamento dos demais campos
      },
    });

    hospede.id = hospedeCriado.id;

    return hospede;
  }
}
```

---

# Diagrama de Sequência

<p align="center">
  <img src="docs/diagrama-sequencia.png" alt="Diagrama de Sequência" width="900">
</p>

---

# Como executar o projeto localmente

## Pré-requisitos

- Node.js instalado
- PostgreSQL rodando localmente ou via Docker

---

## 1. Clone este repositório

```bash
git clone <URL_DO_REPOSITORIO>
```

---

## 2. Instale as dependências

```bash
npm install
```

---

## 3. Configure o arquivo `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/hotel_db?schema=public"
```

---

## 4. Execute as migrations

```bash
npx prisma migrate dev
```

---

## 5. Inicie a aplicação

```bash
npm run dev
```

---

A API estará rodando na porta configurada (padrão **3000**) e pronta para receber requisições.
