const {
  BooleanField,
  NumberField,
  StringField,
  SchemaField
} = foundry.data.fields;


// Espaços de magia por nível da classe

const ESPACOS_MAGIA = {

  0: [0, 0, 0, 0, 0],

  1: [1, 0, 0, 0, 0],

  2: [2, 0, 0, 0, 0],

  3: [2, 1, 0, 0, 0],

  4: [3, 1, 0, 0, 0],

  5: [3, 1, 1, 0, 0],

  6: [3, 2, 1, 0, 0],

  7: [3, 2, 1, 1, 0],

  8: [4, 2, 2, 1, 0],

  9: [4, 3, 2, 1, 1],

  10: [4, 3, 3, 2, 1]

};


// Campo de texto

function criarCampoTexto() {

  return new StringField({
    required: true,
    nullable: false,
    blank: true,
    initial: ""
  });

}


// Debilidade

function criarDebilidade() {

  return new SchemaField({

    tipo: new StringField({
      required: true,
      nullable: false,
      blank: false,
      initial: "nenhuma",

      choices: {
        nenhuma: "—",
        leve: "Leve",
        pesada: "Pesada",
        permanente: "Permanente"
      }
    }),

    fonte: criarCampoTexto()

  });

}


// Espaços de uma classe conjuradora

function criarEspacosMagia() {

  return new SchemaField({

    c1: new NumberField({
      required: true,
      nullable: false,
      integer: true,
      min: 0,
      initial: 0
    }),

    c2: new NumberField({
      required: true,
      nullable: false,
      integer: true,
      min: 0,
      initial: 0
    }),

    c3: new NumberField({
      required: true,
      nullable: false,
      integer: true,
      min: 0,
      initial: 0
    }),

    c4: new NumberField({
      required: true,
      nullable: false,
      integer: true,
      min: 0,
      initial: 0
    }),

    c5: new NumberField({
      required: true,
      nullable: false,
      integer: true,
      min: 0,
      initial: 0
    })

  });

}


export class BreuPersonagemData
  extends foundry.abstract.TypeDataModel {


  static defineSchema() {

    return {


      // Atributos

      atributos: new SchemaField({

        for: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: -5,
          max: 5,
          initial: 0
        }),

        des: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: -5,
          max: 5,
          initial: 0
        }),

        con: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: -5,
          max: 5,
          initial: 0
        }),

        int: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: -5,
          max: 5,
          initial: 0
        }),

        sab: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: -5,
          max: 5,
          initial: 0
        }),

        car: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: -5,
          max: 5,
          initial: 0
        })

      }),


      // Progressão / classes

      progressao: new SchemaField({

        xp: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 0,
          initial: 0
        }),

        classes: new SchemaField({

          arcanista: new NumberField({
            required: true,
            nullable: false,
            integer: true,
            min: 0,
            max: 10,
            initial: 0
          }),

          combatente: new NumberField({
            required: true,
            nullable: false,
            integer: true,
            min: 0,
            max: 10,
            initial: 0
          }),

          especialista: new NumberField({
            required: true,
            nullable: false,
            integer: true,
            min: 0,
            max: 10,
            initial: 0
          }),

          profeta: new NumberField({
            required: true,
            nullable: false,
            integer: true,
            min: 0,
            max: 10,
            initial: 0
          })

        })

      }),


      // Vida

      vida: new SchemaField({

        value: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 0,
          initial: 1
        }),

        max: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 0,
          initial: 1
        })

      }),


      // Riqueza

      riqueza: new SchemaField({

        prata: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 0,
          initial: 0
        })

      }),


      // Dados de vida

      dadosVida: new SchemaField({

        usadosD4: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 0,
          initial: 0
        }),

        usadosD8: new NumberField({
          required: true,
          nullable: false,
          integer: true,
          min: 0,
          initial: 0
        })

      }),


      // Deslocamento

      deslocamento: new StringField({
        required: true,
        nullable: false,
        blank: true,
        initial: "Normal"
      }),


      // Resistências

      resistencias: new SchemaField({

        for: new BooleanField({
          required: true,
          nullable: false,
          initial: false
        }),

        des: new BooleanField({
          required: true,
          nullable: false,
          initial: false
        }),

        con: new BooleanField({
          required: true,
          nullable: false,
          initial: false
        }),

        int: new BooleanField({
          required: true,
          nullable: false,
          initial: false
        }),

        sab: new BooleanField({
          required: true,
          nullable: false,
          initial: false
        }),

        car: new BooleanField({
          required: true,
          nullable: false,
          initial: false
        })

      }),


      // Herança

      heranca: new SchemaField({

        nome: criarCampoTexto(),

        descricao: criarCampoTexto(),

        beneficio1: criarCampoTexto(),

        beneficio2: criarCampoTexto(),

        complicacao: criarCampoTexto()

      }),


      // Antecedente

      antecedente: new SchemaField({

        sou: criarCampoTexto(),

        bomEm: criarCampoTexto(),

        emBuscaDe: criarCampoTexto()

      }),


      // Idiomas

      idiomas: new SchemaField({

        natal: criarCampoTexto(),

        outros: criarCampoTexto()

      }),


      // Anotações

      anotacoes: new SchemaField({

        pessoasLugaresPistas:
          criarCampoTexto(),

        gerais:
          criarCampoTexto()

      }),


      // Benefícios de classe

      beneficiosClasse: new SchemaField({

        b1: criarCampoTexto(),
        b2: criarCampoTexto(),
        b3: criarCampoTexto(),
        b4: criarCampoTexto(),
        b5: criarCampoTexto(),
        b6: criarCampoTexto(),
        b7: criarCampoTexto(),
        b8: criarCampoTexto(),
        b9: criarCampoTexto(),
        b10: criarCampoTexto()

      }),


      // Debilidades

      debilidades: new SchemaField({

        d1: criarDebilidade(),
        d2: criarDebilidade(),
        d3: criarDebilidade(),
        d4: criarDebilidade(),
        d5: criarDebilidade()

      }),


      // Automação seletiva de benefícios

      automacao: new SchemaField({

        combatente: new SchemaField({

          estilo1: new StringField({
            required: true,
            nullable: false,
            blank: false,
            initial: "nenhum",
            choices: {
              nenhum: "—",
              ataque: "+1 Ataque",
              dano: "+1 Dano",
              reducao: "+1 Redução de Dano"
            }
          }),

          estilo5: new StringField({
            required: true,
            nullable: false,
            blank: false,
            initial: "nenhum",
            choices: {
              nenhum: "—",
              ataque: "+1 Ataque",
              dano: "+1 Dano",
              reducao: "+1 Redução de Dano"
            }
          }),

          estilo10: new StringField({
            required: true,
            nullable: false,
            blank: false,
            initial: "nenhum",
            choices: {
              nenhum: "—",
              ataque: "+1 Ataque",
              dano: "+1 Dano",
              reducao: "+1 Redução de Dano"
            }
          }),

          tomarFolegoUsado: new BooleanField({
            required: true,
            nullable: false,
            initial: false
          }),

          ignorandoDebilidades: new BooleanField({
            required: true,
            nullable: false,
            initial: false
          })

        }),

        especialista: new SchemaField({

          tecnica3: new StringField({
            required: true,
            nullable: false,
            blank: false,
            initial: "nenhum",
            choices: {
              nenhum: "—",
              trairagem: "Trairagem",
              tr: "+2 em todos os TRs"
            }
          }),

          tecnica6: new StringField({
            required: true,
            nullable: false,
            blank: false,
            initial: "nenhum",
            choices: {
              nenhum: "—",
              trairagem: "Trairagem",
              tr: "+2 em todos os TRs"
            }
          }),

          tecnica10: new StringField({
            required: true,
            nullable: false,
            blank: false,
            initial: "nenhum",
            choices: {
              nenhum: "—",
              trairagem: "Trairagem",
              tr: "+2 em todos os TRs"
            }
          })

        })

      }),


      // Magia

      magia: new SchemaField({


        // Identidade arcana

        arcanista: new SchemaField({

          paradigma:
            criarCampoTexto(),

          registro:
            criarCampoTexto(),

          forma1:
            criarCampoTexto(),

          forma2:
            criarCampoTexto()

        }),


        // Identidade profética

        profeta: new SchemaField({

          crenca:
            criarCampoTexto(),

          dever:
            criarCampoTexto(),

          proibicao:
            criarCampoTexto(),

          forma1:
            criarCampoTexto(),

          forma2:
            criarCampoTexto()

        }),


        // Espaços de magia

        espacos: new SchemaField({

          arcanista:
            criarEspacosMagia(),

          profeta:
            criarEspacosMagia()

        })

      })

    };

  }


  // Dados derivados

  prepareDerivedData() {

    super.prepareDerivedData();


    // Nível

    this.nivel =
      this.progressao.classes.arcanista
      + this.progressao.classes.combatente
      + this.progressao.classes.especialista
      + this.progressao.classes.profeta;


    // Dados de vida

    const totalD4 =
      this.progressao.classes.arcanista
      + this.progressao.classes.especialista
      + this.progressao.classes.profeta;


    const totalD8 =
      this.progressao.classes.combatente;


    const usadosD4 =
      Math.min(
        Math.max(
          Number(this.dadosVida.usadosD4) || 0,
          0
        ),
        totalD4
      );


    const usadosD8 =
      Math.min(
        Math.max(
          Number(this.dadosVida.usadosD8) || 0,
          0
        ),
        totalD8
      );


    const partesDV =
      [];


    if (
      totalD4 > 0
    ) {

      partesDV.push(
        `${totalD4}d4`
      );

    }


    if (
      totalD8 > 0
    ) {

      partesDV.push(
        `${totalD8}d8`
      );

    }


    this.dv = {

      d4: {

        total:
          totalD4,

        usados:
          usadosD4,

        disponiveis:
          totalD4 - usadosD4

      },

      d8: {

        total:
          totalD8,

        usados:
          usadosD8,

        disponiveis:
          totalD8 - usadosD8

      },

      resumo:
        partesDV.length > 0
          ? partesDV.join(" + ")
          : "—"

    };


    // Quantidade de classes

    this.quantidadeClasses = [

      this.progressao.classes.arcanista,
      this.progressao.classes.combatente,
      this.progressao.classes.especialista,
      this.progressao.classes.profeta

    ].filter(
      nivel =>
        nivel > 0
    ).length;


    // Bp

    if (
      this.nivel === 0
    ) {

      this.bp =
        0;

    }

    else if (
      this.nivel <= 3
    ) {

      this.bp =
        2;

    }

    else if (
      this.nivel <= 6
    ) {

      this.bp =
        3;

    }

    else if (
      this.nivel <= 9
    ) {

      this.bp =
        4;

    }

    else {

      this.bp =
        5;

    }


    // Testes de resistência

    const nivelEspecialistaTR =
      Number(
        this.progressao.classes.especialista
      ) || 0;


    const tecnicasTR =
      [];


    if (
      nivelEspecialistaTR >= 3
    ) {
      tecnicasTR.push(
        this.automacao.especialista.tecnica3
      );
    }


    if (
      nivelEspecialistaTR >= 6
    ) {
      tecnicasTR.push(
        this.automacao.especialista.tecnica6
      );
    }


    if (
      nivelEspecialistaTR >= 10
    ) {
      tecnicasTR.push(
        this.automacao.especialista.tecnica10
      );
    }


    const bonusTecnicaTR =
      2
      * tecnicasTR.filter(
        valor =>
          valor === "tr"
      ).length;


    this.tr =
      {};


    for (
      const atributo
      of ["for", "des", "con", "int", "sab", "car"]
    ) {

      const valorAtributo =
        this.atributos[atributo];


      const proficiente =
        this.resistencias[atributo];


      this.tr[atributo] =
        valorAtributo
        + (
          proficiente
            ? this.bp
            : 0
        )
        + bonusTecnicaTR;

    }


    // Conjuração

    const montarConjurador = (
      classe,
      atributo
    ) => {

      const nivel =
        Number(
          this.progressao.classes[classe]
        ) || 0;


      const tabela =
        ESPACOS_MAGIA[
          Math.min(
            Math.max(
              nivel,
              0
            ),
            10
          )
        ];


      const max = {

        c1:
          tabela[0],

        c2:
          tabela[1],

        c3:
          tabela[2],

        c4:
          tabela[3],

        c5:
          tabela[4]

      };


      let circuloMaximo =
        0;


      for (
        let circulo = 1;
        circulo <= 5;
        circulo++
      ) {

        if (
          max[`c${circulo}`] > 0
        ) {

          circuloMaximo =
            circulo;

        }

      }


      const atributoValor =
        Number(
          this.atributos[atributo]
        ) || 0;


      return {

        nivel,

        ativo:
          nivel > 0,

        atributo,

        atributoValor,

        teste:
          atributoValor + this.bp,

        potencia:
          nivel > 0
            ? 12 + nivel
            : 0,

        max,

        circuloMaximo

      };

    };


    this.conjuracao = {

      arcanista:
        montarConjurador(
          "arcanista",
          "int"
        ),

      profeta:
        montarConjurador(
          "profeta",
          "sab"
        )

    };


    // Automações derivadas de benefícios

    const nivelCombatente =
      Number(this.progressao.classes.combatente) || 0;

    const nivelEspecialista =
      Number(this.progressao.classes.especialista) || 0;

    const nivelArcanista =
      Number(this.progressao.classes.arcanista) || 0;

    const nivelProfeta =
      Number(this.progressao.classes.profeta) || 0;


    const estilosAtivos = [];

    if (nivelCombatente >= 1) {
      estilosAtivos.push(this.automacao.combatente.estilo1);
    }

    if (nivelCombatente >= 5) {
      estilosAtivos.push(this.automacao.combatente.estilo5);
    }

    if (nivelCombatente >= 10) {
      estilosAtivos.push(this.automacao.combatente.estilo10);
    }


    const tecnicasAtivas = [];

    if (nivelEspecialista >= 3) {
      tecnicasAtivas.push(this.automacao.especialista.tecnica3);
    }

    if (nivelEspecialista >= 6) {
      tecnicasAtivas.push(this.automacao.especialista.tecnica6);
    }

    if (nivelEspecialista >= 10) {
      tecnicasAtivas.push(this.automacao.especialista.tecnica10);
    }


    this.beneficiosAutomaticos = {

      combatente: {
        nivel: nivelCombatente,
        estiloAtaque: estilosAtivos.filter(v => v === "ataque").length,
        estiloDano: estilosAtivos.filter(v => v === "dano").length,
        reducaoDano: estilosAtivos.filter(v => v === "reducao").length,
        tomarFolego: nivelCombatente >= 3,
        tomarFolegoUsado: Boolean(this.automacao.combatente.tomarFolegoUsado),
        ignorarDebilidades: nivelCombatente >= 6,
        ignorandoDebilidades: nivelCombatente >= 6
          && Boolean(this.automacao.combatente.ignorandoDebilidades),
        brutal: nivelCombatente >= 7
      },

      especialista: {
        nivel: nivelEspecialista,
        bonusTR: 2 * tecnicasAtivas.filter(v => v === "tr").length,
        trairagemAprimoramentos:
          tecnicasAtivas.filter(v => v === "trairagem").length
      },

      arcanista: {
        nivel: nivelArcanista,
        protecaoArcana: nivelArcanista >= 6
      },

      profeta: {
        nivel: nivelProfeta
      }

    };


    // Debilidades

    const debilidades = [

      this.debilidades.d1,
      this.debilidades.d2,
      this.debilidades.d3,
      this.debilidades.d4,
      this.debilidades.d5

    ];


    const quantidadeDebilidades =
      debilidades.filter(
        debilidade =>
          debilidade.tipo !== "nenhuma"
      ).length;


    let efeitoDebilidade =
      "Nenhuma Debilidade ativa.";


    switch (
      quantidadeDebilidades
    ) {

      case 1:

        efeitoDebilidade =
          "1ª Debilidade — afeta o Descanso Diário.";

        break;


      case 2:

        efeitoDebilidade =
          "2ª Debilidade — Testes de Ataque em Desvantagem.";

        break;


      case 3:

        efeitoDebilidade =
          "3ª Debilidade — Deslocamento Lento e todos os Testes em Desvantagem.";

        break;


      case 4:

        efeitoDebilidade =
          "4ª Debilidade — Incapacitado.";

        break;


      case 5:

        efeitoDebilidade =
          "5ª Debilidade — Morte.";

        break;

    }


    this.estadoDebilidades = {

      quantidade:
        quantidadeDebilidades,

      efeito:
        efeitoDebilidade,

      possui:
        quantidadeDebilidades > 0,

      grave:
        quantidadeDebilidades >= 3,

      fatal:
        quantidadeDebilidades >= 5

    };

  }

}
