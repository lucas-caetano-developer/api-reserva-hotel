import { Router } from "express";
import { HospedeController } from "./controllers/HospedeController";

const router = Router();
const hospedeController = new HospedeController();

router.post("/hospedes", hospedeController.salvar);

router.get("/hospedes", hospedeController.consultar);

router.get("/hospedes/:id", hospedeController.consultar);

router.put("/hospedes/:id", hospedeController.alterar);

router.delete("/hospedes/:id", hospedeController.excluir);

export { router };
