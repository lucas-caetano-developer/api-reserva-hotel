import { EntidadeDominio } from "../models/EntidadeDominio";

export interface IFachada {
  salvar(entidade: EntidadeDominio): Promise<EntidadeDominio | void>;
  alterar(entidade: EntidadeDominio): Promise<void>;
  excluir(entidade: EntidadeDominio): Promise<void>;
  consultar(entidade: EntidadeDominio): Promise<EntidadeDominio[]>;
}
