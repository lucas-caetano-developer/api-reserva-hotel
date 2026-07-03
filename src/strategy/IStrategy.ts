import { EntidadeDominio } from "../models/EntidadeDominio";

export interface IStrategy {
  processar(entidade: EntidadeDominio): Promise<string | null>;
}
