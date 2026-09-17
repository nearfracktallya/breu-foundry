const {
  BooleanField,
  NumberField,
  StringField,
  SchemaField
} = foundry.data.fields;


// Ataque

function criarAtaque() {

  return new SchemaField({

    nome:
      new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: ""
      }),

    bonus:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        min: -20,
        max: 30,
        initial: 0
      }),

    dano:
      new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: ""
      }),

    observacao:
      new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: ""
      })

  });

}


// Custos do gerador

function criarCustos() {

  return new SchemaField({

    tamanho:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0
      }),

    pod:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0
      }),

    ref:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0
      }),

    von:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0
      }),

    pv:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0
      }),

    ca:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0
      }),

    deslocamento:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0
      }),

    trs:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0
      }),

    moral:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0
      }),

    especiais:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        initial: 0
      })

  });

}


// ESPAÇO DE MAGIA DE CRIATURA
//
// Em criaturas, os Espaços não são derivados automaticamente
// do Nível de Conjuração. O Gerador permite comprar Círculos
// e Espaços separadamente. Por isso cada Círculo guarda:
//
// value = espaços restantes
// max   = espaços máximos

function criarEspacoMagia() {

  return new SchemaField({

    value:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        min: 0,
        initial: 0
      }),

    max:
      new NumberField({
        required: true,
        nullable: false,
        integer: true,
        min: 0,
        initial: 0
      })

  });

}


function criarMagiaCriatura() {

  return new SchemaField({

    espacos:
      new SchemaField({

        c1: criarEspacoMagia(),
        c2: criarEspacoMagia(),
        c3: criarEspacoMagia(),
        c4: criarEspacoMagia(),
        c5: criarEspacoMagia()

      })

  });

}


// Modelo

export class BreuNpcData
  extends foundry.abstract.TypeDataModel {


  static defineSchema() {

    return {

      categoria:
        new StringField({
          required: true,
          nullable: false,
          blank: false,
          initial: "Monstros"
        }),

      dv:
        new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 1,
          initial: 1
        }),

      pontos:
        new SchemaField({

          total:
            new NumberField({
              required: true,
              nullable: false,
              integer: true,
              min: 0,
              initial: 0
            }),

          gastos:
            new NumberField({
              required: true,
              nullable: false,
              integer: true,
              min: 0,
              initial: 0
            })

        }),

      tamanho:
        new StringField({
          required: true,
          nullable: false,
          blank: true,
          initial: "Médio"
        }),

      inteligencia:
        new StringField({
          required: true,
          nullable: false,
          blank: true,
          initial: ""
        }),

      comunicacao:
        new StringField({
          required: true,
          nullable: false,
          blank: true,
          initial: ""
        }),

      vida:
        new SchemaField({

          value:
            new NumberField({
              required: true,
              nullable: false,
              integer: true,
              min: 0,
              initial: 1
            }),

          max:
            new NumberField({
              required: true,
              nullable: false,
              integer: true,
              min: 0,
              initial: 1
            })

        }),

      atributos:
        new SchemaField({

          pod:
            new NumberField({
              required: true,
              nullable: false,
              integer: true,
              min: -10,
              max: 20,
              initial: 0
            }),

          ref:
            new NumberField({
              required: true,
              nullable: false,
              integer: true,
              min: -10,
              max: 20,
              initial: 0
            }),

          von:
            new NumberField({
              required: true,
              nullable: false,
              integer: true,
              min: -10,
              max: 20,
              initial: 0
            })

        }),

      trs:
        new SchemaField({

          pod:
            new BooleanField({
              required: true,
              nullable: false,
              initial: false
            }),

          ref:
            new BooleanField({
              required: true,
              nullable: false,
              initial: false
            }),

          von:
            new BooleanField({
              required: true,
              nullable: false,
              initial: false
            })

        }),

      bp:
        new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 0,
          max: 20,
          initial: 2
        }),

      ca:
        new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 0,
          initial: 10
        }),

      deslocamento:
        new StringField({
          required: true,
          nullable: false,
          blank: true,
          initial: "Lento"
        }),

      moral:
        new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 1,
          max: 12,
          initial: 5
        }),

      conjuracao:
        new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 0,
          max: 10,
          initial: 0
        }),

      cd:
        new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 0,
          initial: 12
        }),

      caracteristicasBasicas:
        new StringField({
          required: true,
          nullable: false,
          blank: true,
          initial: ""
        }),

      caracteristicasEspeciais:
        new StringField({
          required: true,
          nullable: false,
          blank: true,
          initial: ""
        }),

      vulnerabilidades:
        new StringField({
          required: true,
          nullable: false,
          blank: true,
          initial: ""
        }),

      magia:
        criarMagiaCriatura(),

      custos:
        criarCustos(),

      ataques:
        new SchemaField({

          a1: criarAtaque(),
          a2: criarAtaque(),
          a3: criarAtaque(),
          a4: criarAtaque()

        })

    };

  }


  // Dados derivados

  prepareDerivedData() {

    super.prepareDerivedData();


    const bp =
      Number(this.bp) || 0;


    this.tr =
      {};


    for (
      const atributo
      of ["pod", "ref", "von"]
    ) {

      const valor =
        Number(
          this.atributos[atributo]
        ) || 0;


      this.tr[atributo] =
        valor
        + (
          this.trs[atributo]
            ? bp
            : 0
        );

    }


    this.pontosRestantes =
      Math.max(
        (Number(this.pontos.total) || 0)
        - (Number(this.pontos.gastos) || 0),
        0
      );


    // Conjuração

    const nivelConjuracao =
      Math.min(
        Math.max(
          Number(this.conjuracao) || 0,
          0
        ),
        10
      );


    this.conjuracaoDados = {

      nivel:
        nivelConjuracao,

      ativo:
        nivelConjuracao > 0,

      cd:
        Number(this.cd) || 0

    };


    // Espaços

    this.magiaDados = {

      espacos:
        {}

    };


    for (
      let circulo = 1;
      circulo <= 5;
      circulo++
    ) {

      const key =
        `c${circulo}`;


      const source =
        this.magia.espacos[key];


      const max =
        Math.max(
          Number(source.max) || 0,
          0
        );


      const value =
        Math.min(
          Math.max(
            Number(source.value) || 0,
            0
          ),
          max
        );


      this.magiaDados.espacos[key] = {
        value,
        max,
        gasto:
          Math.max(
            max - value,
            0
          )
      };

    }

  }

}
