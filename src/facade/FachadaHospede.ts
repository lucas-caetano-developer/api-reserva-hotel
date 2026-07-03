import { IFachada } from "./IFachada";
import { EntidadeDominio } from "../models/EntidadeDominio";
import { HospedeDAO } from "../dao/HospedeDAO";
import { IStrategy } from "../strategy/IStrategy";

import { ValidarDadosHospede } from "../strategy/hospede/ValidarDadosHospede";
import { ValidarEmail } from "../strategy/hospede/ValidarEmail";
import { ValidarCpfUnico } from "../strategy/hospede/ValidarCpfUnico";
import { GerarLog } from "../strategy/GerarLog";

export class FachadaHospede implements IFachada {
  private dao: HospedeDAO;
  private regras: Map<string, IStrategy[]>;

  private logStrategy: IStrategy;

  constructor() {
    this.dao = new HospedeDAO();
    this.regras = new Map<string, IStrategy[]>();
    this.logStrategy = new GerarLog();

    const regrasSalvar: IStrategy[] = [
      new ValidarDadosHospede(),
      new ValidarEmail(),
      new ValidarCpfUnico(),
    ];

    const regrasAlterar: IStrategy[] = [new ValidarDadosHospede()];

    this.regras.set("SALVAR", regrasSalvar);
    this.regras.set("ALTERAR", regrasAlterar);
    this.regras.set("EXCLUIR", []);
  }

  private async executarRegras(
    entidade: EntidadeDominio,
    operacao: string,
  ): Promise<void> {
    const regrasDaOperacao = this.regras.get(operacao);

    if (regrasDaOperacao) {
      for (const regra of regrasDaOperacao) {
        const mensagemErro = await regra.processar(entidade);

        if (mensagemErro) {
          throw new Error(mensagemErro);
        }
      }
    }
  }

  async salvar(entidade: EntidadeDominio): Promise<EntidadeDominio> {
    await this.executarRegras(entidade, "SALVAR");

    const entidadeSalva = await this.dao.salvar(entidade);

    await this.logStrategy.processar(entidadeSalva);

    return entidadeSalva;
  }

  async alterar(entidade: EntidadeDominio): Promise<void> {
    await this.executarRegras(entidade, "ALTERAR");
    await this.dao.alterar(entidade);
    await this.logStrategy.processar(entidade);
  }

  async excluir(entidade: EntidadeDominio): Promise<void> {
    await this.executarRegras(entidade, "EXCLUIR");
    await this.dao.excluir(entidade);
    await this.logStrategy.processar(entidade);
  }

  async consultar(entidade: EntidadeDominio): Promise<EntidadeDominio[]> {
    return await this.dao.consultar(entidade);
  }
}
