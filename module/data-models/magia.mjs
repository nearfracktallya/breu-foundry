const {
  BooleanField,
  NumberField,
  StringField
} = foundry.data.fields;


export class BreuMagiaData extends foundry.abstract.TypeDataModel {

  static defineSchema() {

    return {

      tipo: new StringField({
        required: true,
        nullable: false,
        blank: false,
        initial: "feitico",

        choices: {
          feitico: "Feitiço",
          milagre: "Milagre"
        }
      }),

      circulo: new NumberField({
        required: true,
        nullable: false,
        integer: true,
        min: 1,
        max: 5,
        initial: 1
      }),

      tempo: new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: ""
      }),

      alcance: new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: ""
      }),

      area: new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: ""
      }),

      duracao: new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: ""
      }),

      custo: new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: ""
      }),

      descricao: new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: ""
      }),

      preparada: new BooleanField({
        required: true,
        nullable: false,
        initial: false
      })

    };

  }

}
