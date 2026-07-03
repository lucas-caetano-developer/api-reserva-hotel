import { Request, Response } from "express";
import { FachadaHospede } from "../facade/FachadaHospede";
import { Hospede } from "../models/Hospede";
import { Endereco } from "../models/Endereco";
import { Cidade } from "../models/Cidade";
import { Estado } from "../models/Estado";

export class HospedeController {
  private fachada: FachadaHospede;

  constructor() {
    this.fachada = new FachadaHospede();
  }

  private montarHospede(body: any): Hospede {
    const end = body.endereco || { cidade: { estado: {} } };

    const estado = new Estado(
      end.cidade.estado.descricao,
      end.cidade.estado.uf,
    );
    const cidade = new Cidade(end.cidade.descricao, estado);

    const endereco = new Endereco(
      end.logradouro,
      end.numero,
      end.cep,
      end.bairro,
      cidade,
      end.complemento,
    );

    let dataParseada: any = undefined;
    if (body.dataNascimento) {
      let dataString = body.dataNascimento;

      if (dataString.includes("/")) {
        const [dia, mes, ano] = dataString.split("/");
        dataString = `${ano}-${mes}-${dia}`;
      }

      const dataTemp = new Date(dataString);

      if (!isNaN(dataTemp.getTime())) {
        dataParseada = dataTemp;
      }
    }

    return new Hospede(
      body.nome,
      body.cpf,
      dataParseada,
      body.telefone,
      body.email,
      body.status || "ATIVO",
      endereco,
    );
  }

  salvar = async (req: Request, res: Response): Promise<void> => {
    try {
      const hospede = this.montarHospede(req.body);

      const hospedeSalvo = await this.fachada.salvar(hospede);

      res.status(201).json({
        mensagem: "Hóspede cadastrado com sucesso!",
        dados: hospedeSalvo,
      });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  };

  alterar = async (req: Request, res: Response): Promise<void> => {
    try {
      const hospede = this.montarHospede(req.body);

      hospede.id = req.params.id as string;

      await this.fachada.alterar(hospede);

      res.status(200).json({ mensagem: "Hóspede alterado com sucesso!" });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  };

  excluir = async (req: Request, res: Response): Promise<void> => {
    try {
      const hospedeFiltro = this.montarHospede({});
      hospedeFiltro.id = req.params.id as string;

      await this.fachada.excluir(hospedeFiltro);

      res.status(200).json({ mensagem: "Hóspede inativado com sucesso!" });
    } catch (error: any) {
      res.status(400).json({ erro: error.message });
    }
  };

  consultar = async (req: Request, res: Response): Promise<void> => {
    try {
      const hospedeFiltro = this.montarHospede(req.query as any);

      if (req.params.id) {
        hospedeFiltro.id = req.params.id as string;
      }

      const resultados = await this.fachada.consultar(hospedeFiltro);

      res.status(200).json(resultados);
    } catch (error: any) {
      res.status(500).json({ erro: "Erro interno ao consultar hóspedes." });
    }
  };
}
