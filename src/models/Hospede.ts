// src/models/Hospede.ts
import { EntidadeDominio } from "./EntidadeDominio";
import { Endereco } from "./Endereco";

export class Hospede extends EntidadeDominio {
  public nome: string;
  public cpf: string;
  public dataNascimento: Date;
  public telefone: string;
  public email: string;
  public status: string;
  public endereco: Endereco;

  constructor(
    nome: string,
    cpf: string,
    dataNascimento: Date,
    telefone: string,
    email: string,
    status: string,
    endereco: Endereco,
  ) {
    super();
    this.nome = nome;
    this.cpf = cpf;
    this.dataNascimento = dataNascimento;
    this.telefone = telefone;
    this.email = email;
    this.status = status;
    this.endereco = endereco;
  }
}
