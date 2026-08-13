import { EntitySchema } from "typeorm";

export const AdocaoEntity = new EntitySchema({
  name: "Adocao",
  tableName: "adocoes",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    pet_id: {
      type: "int",
      nullable: false,
    },
    lar_adotivo_id: {
      type: "int",
      nullable: false,
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
    pet: {
      target: "Pet",
      type: "many-to-one",
      joinColumn: {
        name: "pet_id",
      },
    },
    larAdotivo: {
      target: "LarAdotivo",
      type: "many-to-one",
      joinColumn: {
        name: "lar_adotivo_id",
      },
    },
  },
});
