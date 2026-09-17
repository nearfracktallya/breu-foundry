const {
  BooleanField,
  NumberField,
  StringField,
  SchemaField
} = foundry.data.fields;


export class BreuEquipamentoData
  extends foundry.abstract.TypeDataModel {


  static defineSchema() {

    return {


      // Dados gerais

      categoria: new StringField({
        required: true,
        nullable: false,
        blank: false,
        initial: "outro",

        choices: {
          arma: "Arma",
          armadura: "Armadura",
          escudo: "Escudo",
          outro: "Outro"
        }
      }),


      // Localização no inventário

      localizacao: new StringField({
        required: true,
        nullable: false,
        blank: false,
        initial: "outro",

        choices: {
          mochila: "Mochila",
          vestimenta: "Vestimenta",
          mao: "À mão",
          consumivel: "Consumível",
          outro: "Outro"
        }
      }),


      quantidade: new NumberField({
        required: true,
        nullable: false,
        integer: true,
        min: 0,
        initial: 1
      }),


      carga: new NumberField({
        required: true,
        nullable: false,
        integer: true,
        min: 0,
        initial: 0
      }),


      preco: new NumberField({
        required: true,
        nullable: false,
        min: 0,
        initial: 0
      }),


      equipado: new BooleanField({
        required: true,
        nullable: false,
        initial: false
      }),


      descricao: new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: ""
      }),


      // Carga

      cargaAgrupada: new BooleanField({
        required: true,
        nullable: false,
        initial: false
      }),


      ignoraCargaEquipado: new BooleanField({
        required: true,
        nullable: false,
        initial: false
      }),


      mochila: new BooleanField({
        required: true,
        nullable: false,
        initial: false
      }),


      // Arma

      arma: new SchemaField({

        tipo: new StringField({
          required: true,
          nullable: false,
          initial: "corpo",

          choices: {
            corpo: "Corpo a Corpo",
            distancia: "À Distância",
            arremesso: "Arremesso"
          }
        }),


        categoriaProficiencia: new StringField({
          required: true,
          nullable: false,
          initial: "simples",

          choices: {
            simples: "Simples",
            marcial: "Marcial"
          }
        }),


        proficienciaEspecial: new BooleanField({
          required: true,
          nullable: false,
          initial: false
        }),


        arco: new BooleanField({
          required: true,
          nullable: false,
          initial: false
        }),


        favorita: new BooleanField({
          required: true,
          nullable: false,
          initial: false
        }),


        dano: new StringField({
          required: true,
          nullable: false,
          blank: true,
          initial: "1d4"
        }),


        alcance: new StringField({
          required: true,
          nullable: false,
          blank: true,
          initial: "Corpo a Corpo"
        }),


        propriedades: new StringField({
          required: true,
          nullable: false,
          blank: true,
          initial: ""
        })

      }),


      // Proteção

      protecao: new SchemaField({

        ca: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 0,
          initial: 0
        }),


        tipoArmadura: new StringField({
          required: true,
          nullable: false,
          blank: false,
          initial: "leve",

          choices: {
            leve: "Leve",
            media: "Média",
            pesada: "Pesada"
          }
        }),


        proficienciaEspecial: new BooleanField({
          required: true,
          nullable: false,
          initial: false
        })

      })

    };

  }

}
