import { EntidadeDominio } from "./EntidadeDominio";

export class Operacao extends EntidadeDominio {
  public descricao: string;

  constructor(descricao: string) {
    super();
    this.descricao = descricao;
  }
}
