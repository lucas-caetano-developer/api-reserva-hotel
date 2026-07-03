import { EntidadeDominio } from "./EntidadeDominio";
import { Operacao } from "./Operacao";

export class LogAuditoria extends EntidadeDominio {
  public dataHora: Date;
  public usuarioResponsavel: string;
  public operacao: Operacao;
  public entidadeAfetada: string;
  public registroId: string;

  constructor(
    usuarioResponsavel: string,
    operacao: Operacao,
    entidadeAfetada: string,
    registroId: string,
  ) {
    super();
    this.dataHora = new Date();
    this.usuarioResponsavel = usuarioResponsavel;
    this.operacao = operacao;
    this.entidadeAfetada = entidadeAfetada;
    this.registroId = registroId;
  }
}
