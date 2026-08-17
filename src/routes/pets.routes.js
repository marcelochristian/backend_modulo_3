import { Router } from "express";
import {
  BAD_REQUEST_STATUS,
  CREATED_STATUS,
  NO_CONTENT_STATUS,
  OK_STATUS,
  PORTES,
  SEXO,
} from "../constants/server.js";
import { AppDataSource } from "../config/database_postgres.js";
import { TipoEntity } from "../entidades/Tipo.js";
import { CorEntity } from "../entidades/Cor.js";
import { RacaEntity } from "../entidades/Raca.js";
import { PetEntity } from "../entidades/Pet.js";
import { asyncHandler } from "../middlewares/global/asyncHandler.js";
import { autorizarHandler } from "../middlewares/auth/autorizarHandler.js";
import { ROLES } from "../constants/roles.js";
import { verifyIdExistsHandler } from "../middlewares/global/verifyIdExistsHandler.js";
import { AdocaoEntity } from "../entidades/Adocao.js";
import { LarAdotivoEntity } from "../entidades/LarAdotivo.js";

const petsRoutes = new Router();
const petRepository = AppDataSource.getRepository(PetEntity);
const tipoRepository = AppDataSource.getRepository(TipoEntity);
const racaRepository = AppDataSource.getRepository(RacaEntity);
const corRepository = AppDataSource.getRepository(CorEntity);
const adocaoRepository = AppDataSource.getRepository(AdocaoEntity);
const larAdotivoRepository = AppDataSource.getRepository(LarAdotivoEntity);
petsRoutes.post(
  "/pets",
  autorizarHandler(ROLES.ADMIN, ROLES.COLABORADOR),
  asyncHandler(async (request, response) => {
    const dados = request.body;

    // nome - obrigatório e string
    if (!dados.nome || typeof dados.nome !== "string") {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Nome é obrigatório e deve ser uma string");
      return;
    }

    // tipo_id - obrigatório e deve existir no banco
    if (!dados.tipo_id) {
      response.status(BAD_REQUEST_STATUS).send("Tipo é obrigatório");
      return;
    }

    const tipoEncontrado = await tipoRepository.existsBy({
      id: dados.tipo_id,
    });

    if (!tipoEncontrado) {
      response.status(BAD_REQUEST_STATUS).send("Tipo inválido");
      return;
    }

    // raca_id - obrigatório e deve existir no banco
    if (!dados.raca_id) {
      response.status(BAD_REQUEST_STATUS).send("Raça é obrigatória");
      return;
    }

    const racaEncontrada = await racaRepository.existsBy({
      id: dados.raca_id,
    });

    if (!racaEncontrada) {
      response.status(BAD_REQUEST_STATUS).send("Raça inválida");
      return;
    }

    // cor_id - obrigatório e deve existir no banco
    if (!dados.cor_id) {
      response.status(BAD_REQUEST_STATUS).send("Cor é obrigatória");
      return;
    }

    const corEncontrada = await corRepository.existsBy({
      id: dados.cor_id,
    });

    if (!corEncontrada) {
      response.status(BAD_REQUEST_STATUS).send("Cor inválida");
      return;
    }

    // porte - obrigatório e deve ser P, M ou G
    if (!dados.porte || !PORTES.includes(dados.porte)) {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Porte é obrigatório e deve ser P, M ou G");
      return;
    }

    // sexo - opcional, mas se informado deve ser M ou F
    if (dados.sexo !== undefined && !SEXO.includes(dados.sexo)) {
      response.status(BAD_REQUEST_STATUS).send("Sexo deve ser M ou F");
      return;
    }

    // foto_url - opcional e string
    if (dados.foto_url !== undefined && typeof dados.foto_url !== "string") {
      response.status(BAD_REQUEST_STATUS).send("Foto URL deve ser uma string");
      return;
    }

    // historia - opcional e string
    if (dados.historia !== undefined && typeof dados.historia !== "string") {
      response.status(BAD_REQUEST_STATUS).send("História deve ser uma string");
      return;
    }

    // comportamento - opcional e string
    if (
      dados.comportamento !== undefined &&
      typeof dados.comportamento !== "string"
    ) {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Comportamento deve ser uma string");
      return;
    }

    // observacoes_extras - opcional e string
    if (
      dados.observacoes_extras !== undefined &&
      typeof dados.observacoes_extras !== "string"
    ) {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Observações extras devem ser uma string");
      return;
    }

    // idade_meses - opcional e número inteiro
    if (
      dados.idade_meses !== undefined &&
      !Number.isInteger(dados.idade_meses)
    ) {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Idade em meses deve ser um número inteiro");
      return;
    }

    const petSalvo = await petRepository.save(dados);

    response.status(CREATED_STATUS).send(petSalvo);
  }),
);

petsRoutes.get(
  "/pets",
  autorizarHandler(ROLES.ADMIN, ROLES.COLABORADOR),
  asyncHandler(async (request, response) => {
    const buscarTodos = await petRepository.find({
      relations: {
        tipo: true,
        raca: true,
        cor: true,
      },
    });
    response.status(OK_STATUS).send(buscarTodos);
  }),
);

petsRoutes.get(
  "/pets/:id",
  autorizarHandler(ROLES.ADMIN, ROLES.COLABORADOR),
  verifyIdExistsHandler(PetEntity, "Pet"),
  asyncHandler(async (request, response) => {
    const buscarId = request.registro;
    response.status(OK_STATUS).send(buscarId);
  }),
);

petsRoutes.put(
  "/pets/:id",
  autorizarHandler(ROLES.ADMIN, ROLES.COLABORADOR),
  verifyIdExistsHandler(PetEntity, "Pet"),
  asyncHandler(async (request, response) => {
    const dados = request.body;
    const idRecebido = request.params.id;

    await petRepository.update(idRecebido, dados);
    response.send(dados);
  }),
);

petsRoutes.delete(
  "/pets/:id",
  autorizarHandler(ROLES.ADMIN, ROLES.COLABORADOR),
  verifyIdExistsHandler(PetEntity, "Pet"),
  asyncHandler(async (request, response) => {
    const dados = request.registro;
    const idRecebido = request.params.id;
    console.log(idRecebido);
    const possuiAdocao = await adocaoRepository.existsBy({
      pet_id: idRecebido,
    });

    if (possuiAdocao) {
      response.status(400).send({
        error: "Pet não pode ser excluído pois possui adoção cadastrada",
      });
      return;
    }

    await petRepository.delete(idRecebido);

    response.status(NO_CONTENT_STATUS).send();
  }),
);

petsRoutes.post(
  "/lar-adotivo",
  autorizarHandler(ROLES.ADMIN, ROLES.COLABORADOR),
  asyncHandler(async (request, response) => {
    const dados = request.body;

    // nome
    if (!dados.nome || typeof dados.nome !== "string") {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Nome é obrigatório e deve ser uma string");
      return;
    }

    // cep
    if (!dados.cep || !/^\d{5}-\d{3}$/.test(dados.cep)) {
      response
        .status(BAD_REQUEST_STATUS)
        .send("CEP é obrigatório e deve estar no formato xxxxx-xxx");
      return;
    }

    // estado
    if (!dados.estado || typeof dados.estado !== "string") {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Estado é obrigatório e deve ser uma string");
      return;
    }

    // cidade
    if (!dados.cidade || typeof dados.cidade !== "string") {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Cidade é obrigatória e deve ser uma string");
      return;
    }

    // bairro
    if (!dados.bairro || typeof dados.bairro !== "string") {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Bairro é obrigatório e deve ser uma string");
      return;
    }

    // rua
    if (!dados.rua || typeof dados.rua !== "string") {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Rua é obrigatória e deve ser uma string");
      return;
    }

    // possui_telas_protecao
    if (typeof dados.possui_telas_protecao !== "boolean") {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Possui telas de proteção é obrigatório e deve ser booleano");
      return;
    }

    // tipo
    if (!dados.tipo || !["TEMPORARIO", "DEFINITIVO"].includes(dados.tipo)) {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Tipo é obrigatório e deve ser TEMPORARIO ou DEFINITIVO");
      return;
    }

    // telefone
    if (!dados.telefone || !/^\(\d{2}\) \d{5}-\d{4}$/.test(dados.telefone)) {
      response
        .status(BAD_REQUEST_STATUS)
        .send("Telefone é obrigatório e deve estar no formato (85) 99999-9999");
      return;
    }

    const larAdotivoSalvo = await larAdotivoRepository.save(dados);

    response.status(CREATED_STATUS).send(larAdotivoSalvo);
  }),
);

petsRoutes.get(
  "/lares-adotivos",
  autorizarHandler(ROLES.ADMIN, ROLES.COLABORADOR),
  asyncHandler(async (request, response) => {
    const estado = request.query.estado;
    const tipo = request.query.tipo;

    const consulta = await larAdotivoRepository.find({
      where: { estado: estado, tipo: tipo },
      order: {
        criado_em: "ASC",
      },
    });

    response.send(consulta);
  }),
);
export default petsRoutes;
