import { EntidadeDominio } from "./EntidadeDominio";
import { Estado } from "./Estado";

export class Cidade extends EntidadeDominio {
  public descricao: string;
  public estado: Estado;

  constructor(descricao: string, estado: Estado) {
    super();
    this.descricao = descricao;
    this.estado = estado;
  }
}
