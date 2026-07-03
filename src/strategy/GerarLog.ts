import { IStrategy } from "./IStrategy";
import { EntidadeDominio } from "../models/EntidadeDominio";
import { Hospede } from "../models/Hospede";
import { prisma } from "../config/prisma";

export class GerarLog implements IStrategy {
  async processar(entidade: EntidadeDominio): Promise<string | null> {
    try {
      const hospede = entidade as Hospede;

      const descricaoOperacao = hospede.id ? "ALTERACAO" : "CRIACAO";
      const entidadeAfetada = "Hospede";

      const registroId = hospede.id || "ID_PENDENTE_CRIACAO";

      let operacaoDb = await prisma.operacao.findUnique({
        where: { descricao: descricaoOperacao },
      });

      if (!operacaoDb) {
        operacaoDb = await prisma.operacao.create({
          data: { descricao: descricaoOperacao },
        });
      }

      await prisma.logAuditoria.create({
        data: {
          usuarioResponsavel: "Usuario_Sistema",
          entidadeAfetada: entidadeAfetada,
          registroId: registroId,
          operacaoId: operacaoDb.id,
        },
      });

      return null;
    } catch (error) {
      return "Falha ao gerar o log de auditoria da operação.";
    }
  }
}
