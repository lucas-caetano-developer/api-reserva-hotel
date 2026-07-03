// src/strategy/hospede/ValidarCpfUnico.ts
import { IStrategy } from "../IStrategy";
import { EntidadeDominio } from "../../models/EntidadeDominio";
import { Hospede } from "../../models/Hospede";
import { HospedeDAO } from "../../dao/HospedeDAO";

export class ValidarCpfUnico implements IStrategy {
  private dao: HospedeDAO;

  constructor() {
    this.dao = new HospedeDAO();
  }

  async processar(entidade: EntidadeDominio): Promise<string | null> {
    const hospede = entidade as Hospede;

    if (!hospede.cpf) return "CPF não informado para validação.";

    const filtroCpf = { cpf: hospede.cpf } as Hospede;

    const resultados = await this.dao.consultar(filtroCpf);

    if (resultados.length > 0) {
      const hospedeExistente = resultados[0];
      if (hospede.id && hospedeExistente.id === hospede.id) {
        return null;
      }

      return "Este CPF já está cadastrado no sistema.";
    }

    return null;
  }
}
