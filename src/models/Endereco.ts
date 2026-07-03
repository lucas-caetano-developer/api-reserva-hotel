import { EntidadeDominio } from "./EntidadeDominio";
import { Cidade } from "./Cidade";

export class Endereco extends EntidadeDominio {
  public logradouro: string;
  public numero: number;
  public cep: string;
  public bairro: string;
  public cidade: Cidade;
  public complemento: string;

  constructor(
    logradouro: string,
    numero: number,
    cep: string,
    bairro: string,
    cidade: Cidade,
    complemento: string,
  ) {
    super();
    this.logradouro = logradouro;
    this.numero = numero;
    this.cep = cep;
    this.bairro = bairro;
    this.cidade = cidade;
    this.complemento = complemento;
  }
}
