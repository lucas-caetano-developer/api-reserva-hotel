// src/strategy/hospede/ValidarEmail.ts
import { IStrategy } from "../IStrategy";
import { EntidadeDominio } from "../../models/EntidadeDominio";
import { Hospede } from "../../models/Hospede";

export class ValidarEmail implements IStrategy {
  async processar(entidade: EntidadeDominio): Promise<string | null> {
    const hospede = entidade as Hospede;

    if (!hospede.email) return "O e-mail é obrigatório.";

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexEmail.test(hospede.email)) {
      return "O formato do e-mail é inválido. (Ex: nome@dominio.com)";
    }

    return null;
  }
}
