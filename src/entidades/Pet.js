import { EntitySchema } from "typeorm";

export const PetEntity = new EntitySchema({
  name: "Pet",
  tableName: "pets",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    nome: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    tipo_id: {
      type: "int",
      nullable: false,
    },
    raca_id: {
      type: "int",
      nullable: false,
    },
    cor_id: {
      type: "int",
      nullable: false,
    },
    porte: {
      type: "enum",
      enum: ["P", "M", "G"],
      nullable: false,
    },
    sexo: {
      type: "enum",
      enum: ["M", "F"],
      nullable: false,
    },
    foto_url: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    historia: {
      type: "text",
      nullable: true,
    },
    comportamento: {
      type: "text",
      nullable: true,
    },
    observacoes_extras: {
      type: "text",
      nullable: true,
    },
    idade_meses: {
      type: "int",
      nullable: true,
    },
    criado_em: {
      type: "timestamp with time zone",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
    atualizado_em: {
      type: "timestamp with time zone",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    tipo: {
      target: "Tipo",
      type: "many-to-one",
      joinColumn: {
        name: "tipo_id",
      },
    },
    raca: {
      target: "Raca",
      type: "many-to-one",
      joinColumn: {
        name: "raca_id",
      },
    },
    cor: {
      target: "Cor",
      type: "many-to-one",
      joinColumn: {
        name: "cor_id",
      },
    },
  },
});
