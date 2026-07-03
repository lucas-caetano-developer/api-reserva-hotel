export abstract class EntidadeDominio {
  public id?: string;
  public dataCriacao: Date;

  constructor() {
    this.dataCriacao = new Date();
  }
}
