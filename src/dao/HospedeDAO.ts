import { IDAO } from "./IDAO";
import { EntidadeDominio } from "../models/EntidadeDominio";
import { Hospede } from "../models/Hospede";
import { Estado } from "../models/Estado";
import { Cidade } from "../models/Cidade";
import { Endereco } from "../models/Endereco";
import { prisma } from "../config/prisma";
import { StatusGeral } from "@prisma/client";

export class HospedeDAO implements IDAO {
  async salvar(entidade: EntidadeDominio): Promise<EntidadeDominio> {
    const hospede = entidade as Hospede;

    const hospedeCriado = await prisma.hospede.create({
      data: {
        nome: hospede.nome,
        cpf: hospede.cpf,
        dataNascimento: hospede.dataNascimento,
        telefone: hospede.telefone,
        email: hospede.email,
        status: hospede.status as StatusGeral,
        endereco: {
          create: {
            logradouro: hospede.endereco.logradouro,
            numero: hospede.endereco.numero,
            cep: hospede.endereco.cep,
            bairro: hospede.endereco.bairro,
            complemento: hospede.endereco.complemento,
            cidade: {
              create: {
                descricao: hospede.endereco.cidade.descricao,
                estado: {
                  create: {
                    descricao: hospede.endereco.cidade.estado.descricao,
                    uf: hospede.endereco.cidade.estado.uf,
                  },
                },
              },
            },
          },
        },
      },
    });

    hospede.id = hospedeCriado.id;
    return hospede;
  }

  async alterar(entidade: EntidadeDominio): Promise<void> {
    const hospede = entidade as Hospede;

    if (!hospede.id) {
      throw new Error(
        "O ID do hóspede é obrigatório para realizar a alteração.",
      );
    }

    await prisma.hospede.update({
      where: { id: hospede.id },
      data: {
        nome: hospede.nome,
        telefone: hospede.telefone,
        email: hospede.email,
        status: hospede.status as StatusGeral,
        endereco: {
          update: {
            logradouro: hospede.endereco.logradouro,
            numero: hospede.endereco.numero,
            cep: hospede.endereco.cep,
            bairro: hospede.endereco.bairro,
            complemento: hospede.endereco.complemento,
          },
        },
      },
    });
  }

  async excluir(entidade: EntidadeDominio): Promise<void> {
    const hospede = entidade as Hospede;

    if (!hospede.id) {
      throw new Error("O ID do hóspede é obrigatório para inativação.");
    }

    await prisma.hospede.update({
      where: { id: hospede.id },
      data: {
        status: StatusGeral.INATIVO,
      },
    });

    console.log(`[DAO] Hóspede ID ${hospede.id} inativado com sucesso.`);
  }

  async consultar(entidade: EntidadeDominio): Promise<EntidadeDominio[]> {
    const filtro = entidade as Hospede;

    const whereClause: any = {};
    if (filtro.id) whereClause.id = filtro.id;
    if (filtro.cpf) whereClause.cpf = filtro.cpf;
    if (filtro.email) whereClause.email = filtro.email;
    if (filtro.telefone) whereClause.telefone = filtro.telefone;
    if (filtro.status) whereClause.status = filtro.status as StatusGeral;

    if (filtro.nome)
      whereClause.nome = { contains: filtro.nome, mode: "insensitive" };

    const resultadosDb = await prisma.hospede.findMany({
      where: whereClause,
      include: {
        endereco: {
          include: {
            cidade: {
              include: { estado: true },
            },
          },
        },
      },
    });

    return resultadosDb.map((db) => {
      const estado = new Estado(
        db.endereco.cidade.estado.descricao,
        db.endereco.cidade.estado.uf,
      );
      estado.id = db.endereco.cidade.estado.id;

      const cidade = new Cidade(db.endereco.cidade.descricao, estado);
      cidade.id = db.endereco.cidade.id;

      const endereco = new Endereco(
        db.endereco.logradouro,
        db.endereco.numero,
        db.endereco.cep,
        db.endereco.bairro,
        cidade,
        db.endereco.complemento,
      );
      endereco.id = db.endereco.id;

      const h = new Hospede(
        db.nome,
        db.cpf,
        db.dataNascimento,
        db.telefone,
        db.email,
        db.status,
        endereco,
      );
      h.id = db.id;

      return h;
    });
  }
}
