import { IStrategy } from "../IStrategy";
import { EntidadeDominio } from "../../models/EntidadeDominio";
import { Hospede } from "../../models/Hospede";

export class ValidarDadosHospede implements IStrategy {
  async processar(entidade: EntidadeDominio): Promise<string | null> {
    const hospede = entidade as Hospede;

    if (!hospede.nome || hospede.nome.trim() === "")
      return "O nome do hóspede é obrigatório.";
    if (!hospede.cpf || hospede.cpf.trim() === "")
      return "O CPF é obrigatório.";
    if (!hospede.dataNascimento) return "A data de nascimento é obrigatória.";
    if (!hospede.telefone || hospede.telefone.trim() === "")
      return "O telefone é obrigatório.";
    if (!hospede.email || hospede.email.trim() === "")
      return "O email é obrigatório.";

    if (!hospede.endereco) return "O endereço é obrigatório.";
    if (
      !hospede.endereco.logradouro ||
      hospede.endereco.logradouro.trim() === ""
    )
      return "O logradouro é obrigatório.";
    if (
      hospede.endereco.numero === undefined ||
      hospede.endereco.numero === null
    )
      return "O número do endereço é obrigatório.";
    if (!hospede.endereco.cep || hospede.endereco.cep.trim() === "")
      return "O CEP é obrigatório.";
    if (!hospede.endereco.bairro || hospede.endereco.bairro.trim() === "")
      return "O bairro é obrigatório.";
    if (
      !hospede.endereco.complemento ||
      hospede.endereco.complemento.trim() === ""
    )
      return "O complemento é obrigatório.";

    if (!hospede.endereco.cidade) return "A cidade é obrigatória.";
    if (
      !hospede.endereco.cidade.descricao ||
      hospede.endereco.cidade.descricao.trim() === ""
    )
      return "A descrição da cidade é obrigatória.";

    if (!hospede.endereco.cidade.estado) return "O estado é obrigatório.";
    if (
      !hospede.endereco.cidade.estado.descricao ||
      hospede.endereco.cidade.estado.descricao.trim() === ""
    )
      return "A descrição do estado é obrigatória.";
    if (
      !hospede.endereco.cidade.estado.uf ||
      hospede.endereco.cidade.estado.uf.trim() === ""
    )
      return "A UF do estado é obrigatória.";

    return null;
  }
}
