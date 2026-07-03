import { EntidadeDominio } from "./EntidadeDominio";

export class Estado extends EntidadeDominio {
  public descricao: string;
  public uf: string;

  constructor(descricao: string, uf: string) {
    super();
    this.descricao = descricao;
    this.uf = uf;
  }
}
