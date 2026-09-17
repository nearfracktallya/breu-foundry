import {
  publicarMensagemBreu,
  publicarRolagemBreu
} from "../chat/chat.mjs";


const { ActorSheetV2 } =
  foundry.applications.sheets;


const {
  HandlebarsApplicationMixin,
  DialogV2
} =
  foundry.applications.api;


const BREU_DIALOG_CANCEL =
  "__BREU_DIALOG_CANCEL__";


// Regras de proficiência de equipamento

function _breuNiveisClasse(actor) {

  return {
    arcanista:
      Number(
        actor.system.progressao.classes.arcanista
      ) || 0,

    combatente:
      Number(
        actor.system.progressao.classes.combatente
      ) || 0,

    especialista:
      Number(
        actor.system.progressao.classes.especialista
      ) || 0,

    profeta:
      Number(
        actor.system.progressao.classes.profeta
      ) || 0
  };

}


function _breuArmaProficiente(
  actor,
  item
) {

  if (
    item?.type !== "equipamento"
    || item.system.categoria !== "arma"
  ) {
    return false;
  }


  const arma =
    item.system.arma;


  const niveis =
    _breuNiveisClasse(
      actor
    );


  const nivelTotal =
    niveis.arcanista
    + niveis.combatente
    + niveis.especialista
    + niveis.profeta;


  const simples =
    arma.categoriaProficiencia
    === "simples";


  const marcial =
    arma.categoriaProficiencia
    === "marcial";


  const arco =
    Boolean(
      arma.arco
    );


  const especial =
    Boolean(
      arma.proficienciaEspecial
    );


  if (
    nivelTotal === 0
  ) {

    return simples
      || especial;

  }


  if (
    simples
  ) {
    return true;
  }


  if (
    niveis.combatente > 0
    && marcial
  ) {
    return true;
  }


  if (
    niveis.especialista > 0
    && arco
  ) {
    return true;
  }


  return especial;

}


// Arma favorita — progressão de dano

function _breuAumentarDanoUmPasso(
  formula
) {

  const original =
    String(
      formula ?? ""
    ).trim();


  const passos = {

    "1":
      "1d2",

    "1d2":
      "1d3",

    "1d3":
      "1d4",

    "1d4":
      "1d6",

    "1d6":
      "1d8",

    "1d8":
      "1d10",

    "1d10":
      "2d6",

    "1d12":
      "2d6",

    "2d6":
      "2d8",

    "2d8":
      "2d10",

    "2d10":
      "2d12",

    "2d12":
      "3d8",

    "3d8":
      "3d10",

    "3d10":
      "4d8",

    "4d8":
      "4d10",

    "4d10":
      "4d12",

    "4d12":
      "5d10"

  };


  const match =
    original.match(
      /^\s*(1|1d2|1d3|1d4|1d6|1d8|1d10|1d12|2d6|2d8|2d10|2d12|3d8|3d10|4d8|4d10|4d12)\s*([+-]\s*\d+)?\s*$/i
    );


  if (
    !match
  ) {

    return {
      formula:
        original,

      alterada:
        false,

      original
    };

  }


  const base =
    match[1].toLowerCase();


  const proximo =
    passos[base];


  if (
    !proximo
  ) {

    return {
      formula:
        original,

      alterada:
        false,

      original
    };

  }


  const modificador =
    match[2]
      ? ` ${match[2].replace(/\s+/g, " ")}`
      : "";


  return {
    formula:
      `${proximo}${modificador}`,

    alterada:
      true,

    original
  };

}


function _breuProtecaoProficiente(
  actor,
  item
) {

  if (
    item?.type !== "equipamento"
    || !["armadura", "escudo"]
      .includes(item.system.categoria)
  ) {
    return false;
  }


  if (
    item.system.protecao?.proficienciaEspecial
  ) {
    return true;
  }


  const niveis =
    _breuNiveisClasse(
      actor
    );


  const nivelTotal =
    niveis.arcanista
    + niveis.combatente
    + niveis.especialista
    + niveis.profeta;


  if (
    nivelTotal === 0
  ) {

    return (
      item.system.categoria === "armadura"
      && item.system.protecao?.tipoArmadura === "leve"
    );

  }


  if (
    niveis.combatente > 0
  ) {
    return true;
  }


  if (
    item.system.categoria === "escudo"
  ) {

    return niveis.profeta > 0;

  }


  const tipo =
    item.system.protecao?.tipoArmadura
    ?? "leve";


  if (
    tipo === "leve"
  ) {

    return (
      niveis.arcanista > 0
      || niveis.especialista > 0
      || niveis.profeta > 0
    );

  }


  if (
    tipo === "media"
  ) {

    return (
      niveis.especialista > 0
      || niveis.profeta > 0
    );

  }


  return false;

}


// (des)vantagem — fontes automáticas

function _breuResolverModo(
  modoBase,
  temVantagem = false,
  temDesvantagem = false
) {

  const vantagem =
    modoBase === "vantagem"
    || temVantagem;


  const desvantagem =
    modoBase === "desvantagem"
    || temDesvantagem;


  if (
    vantagem
    && desvantagem
  ) {
    return "normal";
  }


  if (vantagem) {
    return "vantagem";
  }


  if (desvantagem) {
    return "desvantagem";
  }


  return "normal";

}


function _breuDebilidadesEfetivas(actor) {

  const quantidade =
    Number(
      actor.system.estadoDebilidades?.quantidade
    ) || 0;


  const ignorando =
    Boolean(
      actor.system.beneficiosAutomaticos
        ?.combatente
        ?.ignorandoDebilidades
    );


  return ignorando
    ? 0
    : quantidade;

}


// Html seguro

function _breuEscapeHTML(
  text
) {

  return String(
    text ?? ""
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// Condição automática de rolagem

function _breuAutomaticDisadvantageHTML(
  sources
) {

  const validSources =
    Array.from(
      new Set(
        (sources ?? [])
          .filter(Boolean)
      )
    );


  if (
    validSources.length === 0
  ) {

    return "";

  }


  const sourceText =
    validSources
      .map(_breuEscapeHTML)
      .join(" · ");


  return `
    <div class="breu-auto-roll-state is-disadvantage">

      <i class="fa-solid fa-circle-exclamation"></i>

      <div>

        <strong>
          Desvantagem automática
        </strong>

        <span>
          ${sourceText}
        </span>

      </div>

    </div>

    <div class="breu-auto-roll-help">
      Escolha abaixo apenas a condição vinda da ficção.
      Se houver Vantagem e Desvantagem ao mesmo tempo,
      elas se anulam e a rolagem fica Normal.
    </div>

    <hr>
  `;

}


// Chat card — padrão visual do breu

function _breuChatCard({
  icon = "fa-solid fa-dice-d20",
  eyebrow = "",
  title = "",
  chips = [],
  stats = [],
  notes = [],
  result = "",
  resultClass = "",
  details = [],
  description = ""
} = {}) {

  const chipHTML =
    chips
      .filter(chip => chip?.label)
      .map(
        chip => `
          <span class="breu-chat-chip ${chip.className ?? ""}">
            ${_breuEscapeHTML(chip.label)}
          </span>
        `
      )
      .join("");


  const statsHTML =
    stats
      .filter(stat => stat?.label)
      .map(
        stat => `
          <div>
            <span>${_breuEscapeHTML(stat.label)}</span>
            <strong>${_breuEscapeHTML(stat.value ?? "—")}</strong>
          </div>
        `
      )
      .join("");


  const notesHTML =
    notes
      .filter(note => note?.text)
      .map(
        note => `
          <div class="breu-chat-card__note ${note.className ?? ""}">
            ${_breuEscapeHTML(note.text)}
          </div>
        `
      )
      .join("");


  const detailsHTML =
    details
      .filter(detail => detail?.label && detail?.value)
      .map(
        detail => `
          <div>
            <span>${_breuEscapeHTML(detail.label)}</span>
            <strong>${_breuEscapeHTML(detail.value)}</strong>
          </div>
        `
      )
      .join("");


  return `
    <div class="breu-chat-card">

      <header class="breu-chat-card__header">

        <span class="breu-chat-card__eyebrow">
          <i class="${icon}"></i>
          ${_breuEscapeHTML(eyebrow)}
        </span>

        <strong class="breu-chat-card__title">
          ${_breuEscapeHTML(title)}
        </strong>

      </header>

      ${
        chipHTML
          ? `<div class="breu-chat-card__chips">${chipHTML}</div>`
          : ""
      }

      ${
        statsHTML
          ? `<div class="breu-chat-card__stats">${statsHTML}</div>`
          : ""
      }

      ${
        detailsHTML
          ? `<div class="breu-chat-card__details">${detailsHTML}</div>`
          : ""
      }

      ${notesHTML}

      ${
        description
          ? `<div class="breu-chat-card__description">${description}</div>`
          : ""
      }

      ${
        result
          ? `
            <div class="breu-chat-card__result ${resultClass}">
              ${_breuEscapeHTML(result)}
            </div>
          `
          : ""
      }

    </div>
  `;

}


export class BreuPersonagemSheet
  extends HandlebarsApplicationMixin(ActorSheetV2) {


  static DEFAULT_OPTIONS = {

    classes: [
      "breu",
      "actor-sheet",
      "personagem-sheet"
    ],

    position: {
      width: 700,
      height: 600
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      icon: "fa-solid fa-user",
      resizable: true
    }

  };


  static PARTS = {

    principal: {
      template:
        "systems/breu/templates/actors/personagem-sheet.hbs"
    }

  };


  // Contexto

  async _prepareContext(options) {

    const context =
      await super._prepareContext(options);


    context.actor =
      this.actor;


    context.system =
      this.actor.system;


    // Abas

    this._activeTab ??=
      "geral";


    context.tabs = {

  geral:
    this._activeTab === "geral",

  inventario:
    this._activeTab === "inventario",

  magia:
    this._activeTab === "magia",

  anotacoes:
    this._activeTab === "anotacoes"

};


    // Inventário

    const categorias = {

      arma:
        "Arma",

      armadura:
        "Armadura",

      escudo:
        "Escudo",

      outro:
        "Outro"

    };


    const equipamentos =
  this.actor.items

    .filter(
      item =>
        item.type === "equipamento"
    )

    .sort(
      (a, b) =>
        a.sort - b.sort
    )

    .map(
      item => ({

        id:
          item.id,

        name:
          item.name,

        categoria:
          categorias[item.system.categoria]
          ?? item.system.categoria,

        categoriaKey:
          item.system.categoria,

        localizacao:
          item.system.localizacao
          ?? "outro",

        quantidade:
          Number(
            item.system.quantidade
          ) || 0,

        carga:
          Number(
            item.system.carga
          ) || 0,

        equipado:
          Boolean(
            item.system.equipado
          ),

        isArma:
          item.system.categoria === "arma",

        isMochila:
          Boolean(
            item.system.mochila
          ),

        proficiente:
          item.system.categoria === "arma"
            ? _breuArmaProficiente(
                this.actor,
                item
              )
            : (
                ["armadura", "escudo"]
                  .includes(item.system.categoria)
                  ? _breuProtecaoProficiente(
                      this.actor,
                      item
                    )
                  : true
              ),

        favorita:
          item.system.categoria === "arma"
          && Boolean(
            item.system.arma?.favorita
          )

      })
    );


context.equipamentos =
  equipamentos;


// Organização visual do inventário

const armaduras =
  equipamentos.filter(
    item =>
      item.categoriaKey === "armadura"
  );


const escudos =
  equipamentos.filter(
    item =>
      item.categoriaKey === "escudo"
  );


const equipamentosComuns =
  equipamentos.filter(
    item =>
      item.categoriaKey !== "armadura"
      && item.categoriaKey !== "escudo"
  );


const vestimentas =
  equipamentosComuns.filter(
    item =>
      item.localizacao === "vestimenta"
  );


const itensMao =
  equipamentosComuns.filter(
    item =>
      item.localizacao === "mao"
  );


const itensMochila =
  equipamentosComuns.filter(
    item =>
      item.localizacao === "mochila"
  );


const consumiveisCargaZero =
  equipamentosComuns.filter(
    item =>
      item.localizacao === "consumivel"
      && item.carga === 0
  );


const consumiveisCargaUm =
  equipamentosComuns.filter(
    item =>
      item.localizacao === "consumivel"
      && item.carga === 1
  );


const outros =
  equipamentosComuns.filter(
    item =>
      item.localizacao === "outro"
      || (
        item.localizacao === "consumivel"
        && item.carga > 1
      )
  );


context.inventario = {

  grupos: [

    {
      key:
        "armadura",

      titulo:
        "Armadura",

      itens:
        armaduras
    },

    {
      key:
        "escudo",

      titulo:
        "Escudo",

      itens:
        escudos
    },

    {
      key:
        "vestimentas",

      titulo:
        "Vestimentas",

      itens:
        vestimentas
    },

    {
      key:
        "mao",

      titulo:
        "Itens à Mão",

      itens:
        itensMao
    },

    {
      key:
        "mochila",

      titulo:
        "Mochila",

      itens:
        itensMochila
    },

    {
      key:
        "consumiveis-zero",

      titulo:
        "Consumíveis · Carga 0",

      itens:
        consumiveisCargaZero
    },

    {
      key:
        "consumiveis-um",

      titulo:
        "Consumíveis · Carga 1",

      itens:
        consumiveisCargaUm
    },

    {
      key:
        "outros",

      titulo:
        "Outros",

      itens:
        outros
    }

  ]

};


    // Carga

    let cargaAtual =
      0;


    let cargaMinimaAtual =
      0;


    let possuiMochila =
      false;


    for (
      const item
      of this.actor.items
    ) {

      if (
        item.type !== "equipamento"
      ) {
        continue;
      }


      const quantidade =
        Math.max(
          Number(
            item.system.quantidade
          ) || 0,
          0
        );


      const carga =
        Math.max(
          Number(
            item.system.carga
          ) || 0,
          0
        );


      if (
        item.system.mochila
        && item.system.equipado
      ) {

        possuiMochila =
          true;

      }


      if (
        item.system.ignoraCargaEquipado
        && item.system.equipado
      ) {

        continue;

      }


      if (
        carga === 0
      ) {

        if (
          quantidade <= 0
        ) {
          continue;
        }


        if (
          item.system.cargaAgrupada
        ) {

          cargaMinimaAtual +=
            1;

        }

        else {

          cargaMinimaAtual +=
            quantidade;

        }

      }

      else {

        cargaAtual +=
          carga * quantidade;

      }

    }


    const con =
      Number(
        this.actor.system.atributos.con
      ) || 0;


    let cargaMax =
      15 + con;


    let cargaMinimaMax =
      10;


    if (
      possuiMochila
    ) {

      cargaMax +=
        6;

      cargaMinimaMax +=
        20;

    }


    cargaMax =
      Math.max(
        cargaMax,
        0
      );


    context.carga = {

      atual:
        cargaAtual,

      max:
        cargaMax,

      minimaAtual:
        cargaMinimaAtual,

      minimaMax:
        cargaMinimaMax,

      mochila:
        possuiMochila,

      sobrecarregado:
        cargaAtual > cargaMax,

      excessoMinimo:
        cargaMinimaAtual > cargaMinimaMax

    };


    // Classe de armadura

    const des =
      Number(
        this.actor.system.atributos.des
      ) || 0;


    let bonusArmadura =
      0;


    let bonusEscudo =
      0;


    let armaduraForaProficiencia =
      false;


    const protecoesEquipadas =
      this.actor.items.filter(
        item =>
          item.type === "equipamento"
          && item.system.equipado
          && ["armadura", "escudo"]
            .includes(item.system.categoria)
      );


    for (
      const item
      of protecoesEquipadas
    ) {

      const bonusProtecao =
        Math.max(
          Number(
            item.system.protecao?.ca
          ) || 0,
          0
        );


      if (
        !_breuProtecaoProficiente(
          this.actor,
          item
        )
      ) {

        armaduraForaProficiencia =
          true;

      }


      if (
        item.system.categoria === "armadura"
      ) {

        bonusArmadura =
          Math.max(
            bonusArmadura,
            bonusProtecao
          );

      }


      if (
        item.system.categoria === "escudo"
      ) {

        bonusEscudo =
          Math.max(
            bonusEscudo,
            bonusProtecao
          );

      }

    }


    const desAplicada =
      armaduraForaProficiencia
        ? Math.min(
            des,
            0
          )
        : des;


    // Combatente 1 — lutador

    const nivelCombatente =
      Number(
        this.actor.system
          .progressao
          .classes
          .combatente
      ) || 0;


    const conLutador =
      Number(
        this.actor.system
          .atributos
          .con
      ) || 0;


    const usaArmadura =
      protecoesEquipadas.some(
        item =>
          item.system.categoria
          === "armadura"
      );


    const lutadorAtivo =
      nivelCombatente >= 1
      && !usaArmadura;


    const bonusLutador =
      lutadorAtivo
        ? conLutador
        : 0;


    context.ca = {

      total:
        10
        + desAplicada
        + bonusArmadura
        + bonusEscudo
        + bonusLutador,

      base:
        10,

      des,

      desAplicada,

      armadura:
        bonusArmadura,

      escudo:
        bonusEscudo,

      lutador:
        bonusLutador,

      lutadorAtivo,

      restricao:
        armaduraForaProficiencia

    };


    context.restricoesEquipamento = {

      armaduraForaProficiencia,

      lutadorAtivo,

      bonusLutador,

      deslocamentoEfetivo:
        (
          armaduraForaProficiencia
          || _breuDebilidadesEfetivas(this.actor) >= 3
        )
          ? "Lento"
          : this.actor.system.deslocamento

    };


    // Magias

    const magias =
      this.actor.items

        .filter(
          item =>
            item.type === "magia"
        )

        .sort(
          (a, b) => {

            const circuloA =
              Number(
                a.system.circulo
              ) || 1;


            const circuloB =
              Number(
                b.system.circulo
              ) || 1;


            if (
              circuloA !== circuloB
            ) {

              return (
                circuloA - circuloB
              );

            }


            return a.name.localeCompare(
              b.name
            );

          }
        );


    context.feiticos =
      magias

        .filter(
          item =>
            item.system.tipo === "feitico"
        )

        .map(
          item => ({

            id:
              item.id,

            name:
              item.name,

            circulo:
              item.system.circulo,

            tempo:
              item.system.tempo || "—",

            preparada:
              Boolean(
                item.system.preparada
              )

          })
        );


    context.milagres =
      magias

        .filter(
          item =>
            item.system.tipo === "milagre"
        )

        .map(
          item => ({

            id:
              item.id,

            name:
              item.name,

            circulo:
              item.system.circulo,

            tempo:
              item.system.tempo || "—"

          })
        );


    const conjuracao =
      this.actor.system.conjuracao;


    const criarListaEspacos =
      classe => {

        const resultado =
          [];


        for (
          let circulo = 1;
          circulo <= 5;
          circulo++
        ) {

          const chave =
            `c${circulo}`;


          const max =
            Number(
              conjuracao[classe].max[chave]
            ) || 0;


          if (
            max <= 0
          ) {
            continue;
          }


          const armazenado =
            Number(
              this.actor.system
                .magia
                .espacos
                [classe]
                [chave]
            ) || 0;


          resultado.push({

            circulo,

            atual:
              Math.min(
                Math.max(
                  armazenado,
                  0
                ),
                max
              ),

            max,

            path:
              `system.magia.espacos.${classe}.${chave}`

          });

        }


        return resultado;

      };


    const preparados =
      context.feiticos.filter(
        feitico =>
          feitico.preparada
      ).length;


    const limitePreparados =
      conjuracao.arcanista.ativo
        ? (
            conjuracao.arcanista.nivel
            + Number(
              this.actor.system.bp
            )
          )
        : 0;


    context.magiaUI = {

      temConjurador:
        conjuracao.arcanista.ativo
        || conjuracao.profeta.ativo,


      arcanista: {

        ativo:
          conjuracao.arcanista.ativo,

        nivel:
          conjuracao.arcanista.nivel,

        atributo:
          conjuracao.arcanista.atributoValor,

        teste:
          conjuracao.arcanista.teste,

        circuloMaximo:
          conjuracao.arcanista.circuloMaximo,

        preparados,

        limitePreparados,

        excedeuPreparados:
          preparados > limitePreparados,

        espacos:
          criarListaEspacos(
            "arcanista"
          )

      },


      profeta: {

        ativo:
          conjuracao.profeta.ativo,

        nivel:
          conjuracao.profeta.nivel,

        atributo:
          conjuracao.profeta.atributoValor,

        teste:
          conjuracao.profeta.teste,

        circuloMaximo:
          conjuracao.profeta.circuloMaximo,

        espacos:
          criarListaEspacos(
            "profeta"
          )

      }

    };


    // Automação seletiva

    context.automacaoUI = {
      beneficios: this.actor.system.beneficiosAutomaticos,
      debilidades: this.actor.system.estadoDebilidades,
      dadosVida: this.actor.system.dv
    };


    return context;

  }


  // Eventos

  async _onRender(
    context,
    options
  ) {

    await super._onRender(
      context,
      options
    );


    // Modo jogar / editar

    this._sheetMode ??=
      "play";


    for (
      const button
      of this.element.querySelectorAll(
        ".breu-sheet-mode-button"
      )
    ) {

      button.addEventListener(
        "click",
        event => {

          event.preventDefault();


          const mode =
            event.currentTarget.dataset.mode;


          if (
            !["play", "edit"].includes(mode)
          ) {
            return;
          }


          this._sheetMode =
            mode;


          this._applySheetMode();

        }
      );

    }


    this._applySheetMode();


    this._applyEquipmentRuleFeedback(
      context
    );


    this._applyAutomationPanel(
      context
    );


    // Abas

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-tab-button"
      )
    ) {

      button.addEventListener(
        "click",
        event => {

          event.preventDefault();


          const tab =
            event.currentTarget.dataset.tab;


          if (
            !tab
          ) {
            return;
          }


          this._activeTab =
            tab;


          for (
            const tabButton
            of this.element.querySelectorAll(
              ".breu-tab-button"
            )
          ) {

            const ativo =
              tabButton.dataset.tab === tab;


            tabButton.classList.toggle(
              "is-active",
              ativo
            );


            tabButton.setAttribute(
              "aria-selected",
              ativo
                ? "true"
                : "false"
            );

          }


          for (
            const panel
            of this.element.querySelectorAll(
              ".breu-tab-panel"
            )
          ) {

            panel.classList.toggle(
              "is-active",
              panel.dataset.tab === tab
            );

          }

        }
      );

    }


    // Tr

    for (
      const button
      of this.element.querySelectorAll(
        ".tr-roll"
      )
    ) {

      button.addEventListener(
        "click",
        event => {

          this._rollResistance(
            event.currentTarget
              .dataset
              .attribute
          );

        }
      );

    }


    // Equipamentos

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-item-open"
      )
    ) {

      button.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          const item =
            this.actor.items.get(
              event.currentTarget
                .dataset
                .itemId
            );


          if (
            !item
          ) {
            return;
          }


          await item.sheet.render({
            force: true
          });

        }
      );

    }


    // Ataques

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-weapon-attack"
      )
    ) {

      button.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          const item =
            this.actor.items.get(
              event.currentTarget
                .dataset
                .itemId
            );


          if (
            item
          ) {

            await this._rollWeaponAttack(
              item
            );

          }

        }
      );

    }


    // Dano

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-weapon-damage"
      )
    ) {

      button.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          const item =
            this.actor.items.get(
              event.currentTarget
                .dataset
                .itemId
            );


          if (
            item
          ) {

            await this._rollWeaponDamage(
              item
            );

          }

        }
      );

    }


    // Excluir equipamento

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-item-delete"
      )
    ) {

      button.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          const itemId =
            event.currentTarget
              .dataset
              .itemId;


          if (
            itemId
          ) {

            await this.actor
              .deleteEmbeddedDocuments(
                "Item",
                [itemId]
              );

          }

        }
      );

    }


    // Equipar / desequipar

    for (
      const checkbox
      of this.element.querySelectorAll(
        ".breu-item-equipped"
      )
    ) {

      checkbox.addEventListener(
        "change",
        async event => {

          const item =
            this.actor.items.get(
              event.currentTarget
                .dataset
                .itemId
            );


          if (
            item
          ) {

            await item.update({

              "system.equipado":
                event.currentTarget.checked

            });

          }

        }
      );

    }


    // Teste de magia

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-magic-test"
      )
    ) {

      button.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          await this._rollMagicTest(
            event.currentTarget
              .dataset
              .caster
          );

        }
      );

    }


    // Espaços + / -

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-slot-change"
      )
    ) {

      button.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          const caster =
            event.currentTarget
              .dataset
              .caster;


          const circle =
            Number(
              event.currentTarget
                .dataset
                .circle
            );


          const delta =
            Number(
              event.currentTarget
                .dataset
                .delta
            );


          await this._changeMagicSlot(
            caster,
            circle,
            delta
          );

        }
      );

    }


    // Restaurar todos os espaços

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-magic-restore"
      )
    ) {

      button.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          await this._restoreMagicSlots(
            event.currentTarget
              .dataset
              .caster
          );

        }
      );

    }


    // Criar magia

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-magic-create"
      )
    ) {

      button.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          await this._createMagicItem(
            event.currentTarget
              .dataset
              .magicType
          );

        }
      );

    }


    // Abrir magia

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-magic-open"
      )
    ) {

      button.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          const item =
            this.actor.items.get(
              event.currentTarget
                .dataset
                .itemId
            );


          if (
            item
          ) {

            await item.sheet.render({
              force: true
            });

          }

        }
      );

    }


    // Preparar feitiço

    for (
      const checkbox
      of this.element.querySelectorAll(
        ".breu-spell-prepared"
      )
    ) {

      checkbox.addEventListener(
        "change",
        async event => {

          const item =
            this.actor.items.get(
              event.currentTarget
                .dataset
                .itemId
            );


          if (
            !item
          ) {
            return;
          }


          await this._togglePreparedSpell(
            item,
            event.currentTarget.checked
          );

        }
      );

    }


    // Conjurar

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-magic-cast"
      )
    ) {

      button.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          const item =
            this.actor.items.get(
              event.currentTarget
                .dataset
                .itemId
            );


          if (
            item
          ) {

            await this._castMagic(
              item
            );

          }

        }
      );

    }


    // Excluir magia

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-magic-delete"
      )
    ) {

      button.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          const itemId =
            event.currentTarget
              .dataset
              .itemId;


          if (
            itemId
          ) {

            await this.actor
              .deleteEmbeddedDocuments(
                "Item",
                [itemId]
              );

          }

        }
      );

    }

  }


  // Painel de automação seletiva

  _applyAutomationPanel(
    context
  ) {

    this.element
      .querySelector(
        ".breu-automation-panel"
      )
      ?.remove();


    const panel =
      this.element.querySelector(
        '.breu-tab-panel[data-tab="geral"]'
      );


    if (!panel) {
      return;
    }


    const auto =
      context.automacaoUI?.beneficios;


    const combatente =
      auto?.combatente;


    const especialista =
      auto?.especialista;


    const blocos = [];


    // Descansos

    blocos.push(`
      <section class="breu-automation-card breu-rest-card">
        <header>
          <i class="fa-solid fa-campground"></i>
          <div>
            <strong>Recuperação</strong>
            <span>Descansos e recursos de uso limitado.</span>
          </div>
        </header>

        <div class="breu-automation-actions">
          <button type="button" class="breu-daily-rest">
            <i class="fa-solid fa-moon"></i>
            Descanso Diário
          </button>

          <button type="button" class="breu-long-rest">
            <i class="fa-solid fa-bed"></i>
            Descanso Longo
          </button>
        </div>
      </section>
    `);


    // Combatente

    if (
      combatente
      && combatente.nivel > 0
    ) {

      const selects = [];

      const criarEstilo = (
        nivel,
        path,
        valor
      ) => `
        <label>
          <span>Estilo · Nível ${nivel}</span>
          <select
            class="breu-automation-select"
            data-path="${path}"
          >
            <option value="nenhum" ${valor === "nenhum" ? "selected" : ""}>—</option>
            <option value="ataque" ${valor === "ataque" ? "selected" : ""}>+1 Ataque</option>
            <option value="dano" ${valor === "dano" ? "selected" : ""}>+1 Dano</option>
            <option value="reducao" ${valor === "reducao" ? "selected" : ""}>+1 Redução</option>
          </select>
        </label>
      `;


      if (combatente.nivel >= 1) {
        selects.push(
          criarEstilo(
            1,
            "system.automacao.combatente.estilo1",
            this.actor.system.automacao.combatente.estilo1
          )
        );
      }

      if (combatente.nivel >= 5) {
        selects.push(
          criarEstilo(
            5,
            "system.automacao.combatente.estilo5",
            this.actor.system.automacao.combatente.estilo5
          )
        );
      }

      if (combatente.nivel >= 10) {
        selects.push(
          criarEstilo(
            10,
            "system.automacao.combatente.estilo10",
            this.actor.system.automacao.combatente.estilo10
          )
        );
      }


      blocos.push(`
        <section class="breu-automation-card">
          <header>
            <i class="fa-solid fa-shield-halved"></i>
            <div>
              <strong>Combatente</strong>
              <span>
                Ataque +${combatente.estiloAtaque}
                · Dano +${combatente.estiloDano}
                · Redução ${combatente.reducaoDano}
              </span>
            </div>
          </header>

          ${selects.length ? `<div class="breu-automation-grid">${selects.join("")}</div>` : ""}

          <div class="breu-automation-actions">
            ${
              combatente.tomarFolego
                ? `
                  <button
                    type="button"
                    class="breu-tomar-folego"
                    ${combatente.tomarFolegoUsado ? "disabled" : ""}
                  >
                    <i class="fa-solid fa-heart-pulse"></i>
                    ${combatente.tomarFolegoUsado ? "Tomar Fôlego usado" : "Tomar Fôlego"}
                  </button>
                `
                : ""
            }

            ${
              combatente.ignorarDebilidades
                ? `
                  <button
                    type="button"
                    class="breu-ignore-debilities ${combatente.ignorandoDebilidades ? "is-active" : ""}"
                  >
                    <i class="fa-solid fa-fire-flame-curved"></i>
                    ${combatente.ignorandoDebilidades ? "Encerrar Ignorar Debilidades" : "Ignorar Debilidades"}
                  </button>
                `
                : ""
            }
          </div>

          ${
            combatente.brutal
              ? `<div class="breu-automation-note">Brutal: dois ataques por turno. A ficha apenas lembra; não limita ações.</div>`
              : ""
          }
        </section>
      `);

    }


    // Especialista

    if (
      especialista
      && especialista.nivel >= 3
    ) {

      const tecnicas = [];

      const criarTecnica = (
        nivel,
        path,
        valor
      ) => `
        <label>
          <span>Técnica · Nível ${nivel}</span>
          <select
            class="breu-automation-select"
            data-path="${path}"
          >
            <option value="nenhum" ${valor === "nenhum" ? "selected" : ""}>—</option>
            <option value="trairagem" ${valor === "trairagem" ? "selected" : ""}>Aprimorar Trairagem</option>
            <option value="tr" ${valor === "tr" ? "selected" : ""}>+2 em todos os TRs</option>
          </select>
        </label>
      `;


      if (especialista.nivel >= 3) {
        tecnicas.push(
          criarTecnica(
            3,
            "system.automacao.especialista.tecnica3",
            this.actor.system.automacao.especialista.tecnica3
          )
        );
      }

      if (especialista.nivel >= 6) {
        tecnicas.push(
          criarTecnica(
            6,
            "system.automacao.especialista.tecnica6",
            this.actor.system.automacao.especialista.tecnica6
          )
        );
      }

      if (especialista.nivel >= 10) {
        tecnicas.push(
          criarTecnica(
            10,
            "system.automacao.especialista.tecnica10",
            this.actor.system.automacao.especialista.tecnica10
          )
        );
      }


      blocos.push(`
        <section class="breu-automation-card">
          <header>
            <i class="fa-solid fa-mask"></i>
            <div>
              <strong>Especialista</strong>
              <span>
                Técnica: +${especialista.bonusTR} em todos os TRs
                · Trairagem +${especialista.trairagemAprimoramentos}
              </span>
            </div>
          </header>

          <div class="breu-automation-grid">
            ${tecnicas.join("")}
          </div>
        </section>
      `);

    }


    const wrapper =
      document.createElement(
        "div"
      );


    wrapper.className =
      "breu-automation-panel";


    wrapper.innerHTML =
      blocos.join("");


    panel.prepend(
      wrapper
    );


    for (
      const select
      of wrapper.querySelectorAll(
        ".breu-automation-select"
      )
    ) {

      select.addEventListener(
        "change",
        async event => {

          const path =
            event.currentTarget.dataset.path;


          if (!path) {
            return;
          }


          await this.actor.update({
            [path]:
              event.currentTarget.value
          });

        }
      );

    }


    wrapper
      .querySelector(
        ".breu-daily-rest"
      )
      ?.addEventListener(
        "click",
        () => this._dailyRest()
      );


    wrapper
      .querySelector(
        ".breu-long-rest"
      )
      ?.addEventListener(
        "click",
        () => this._longRest()
      );


    wrapper
      .querySelector(
        ".breu-tomar-folego"
      )
      ?.addEventListener(
        "click",
        () => this._useTomarFolego()
      );


    wrapper
      .querySelector(
        ".breu-ignore-debilities"
      )
      ?.addEventListener(
        "click",
        () => this._toggleIgnoreDebilities()
      );

  }


  // Feedback de restrições de equipamento

  _applyEquipmentRuleFeedback(
    context
  ) {

    for (
      const antigo
      of this.element.querySelectorAll(
        ".breu-equipment-rule-warning, .breu-combatant-rule-note"
      )
    ) {

      antigo.remove();

    }


    const panel =
      this.element.querySelector(
        '.breu-tab-panel[data-tab="geral"]'
      );


    if (
      !panel
    ) {
      return;
    }


    const blocos =
      [];


    if (
      context
        ?.restricoesEquipamento
        ?.armaduraForaProficiencia
    ) {

      blocos.push(
        `
          <div class="breu-equipment-rule-warning">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <div>

              <strong>
                Armadura fora da proficiência
              </strong>

              <span>
                DES positiva não está sendo somada à CA.
                O Deslocamento efetivo é Lento enquanto
                esta proteção estiver equipada.
              </span>

            </div>

          </div>
        `
      );

    }


    if (
      context
        ?.restricoesEquipamento
        ?.lutadorAtivo
    ) {

      const bonus =
        Number(
          context.restricoesEquipamento
            .bonusLutador
        ) || 0;


      blocos.push(
        `
          <div class="breu-combatant-rule-note">

            <i class="fa-solid fa-shield-halved"></i>

            <div>

              <strong>
                Lutador
              </strong>

              <span>
                Sem armadura:
                CON
                ${bonus >= 0 ? "+" : ""}${bonus}
                está sendo somada à CA.
              </span>

            </div>

          </div>
        `
      );

    }


    if (
      blocos.length === 0
    ) {
      return;
    }


    const container =
      document.createElement(
        "div"
      );


    container.className =
      "breu-equipment-rule-feedback";


    container.innerHTML =
      blocos.join("");


    panel.prepend(
      container
    );

  }


  // Modo da ficha

  _applySheetMode() {

    const root =
      this.element.querySelector(
        ".breu-personagem"
      );


    if (
      !root
    ) {
      return;
    }


    const editing =
      this._sheetMode === "edit";


    root.classList.toggle(
      "is-edit-mode",
      editing
    );


    root.classList.toggle(
      "is-play-mode",
      !editing
    );


    // Inputs e textareas

    for (
      const field
      of root.querySelectorAll(
        'input:not([type="checkbox"]):not([type="radio"]), textarea'
      )
    ) {

      field.readOnly =
        !editing;


      field.tabIndex =
        editing
          ? 0
          : -1;

    }


    // Selects / checkboxes / radios

    for (
      const field
      of root.querySelectorAll(
        'select, input[type="checkbox"], input[type="radio"]'
      )
    ) {

      field.disabled =
        !editing;


      field.tabIndex =
        editing
          ? 0
          : -1;

    }


    // Botões jogar / editar

    for (
      const button
      of root.querySelectorAll(
        ".breu-sheet-mode-button"
      )
    ) {

      const active =
        button.dataset.mode ===
        this._sheetMode;


      button.classList.toggle(
        "is-active",
        active
      );


      button.setAttribute(
        "aria-pressed",
        active
          ? "true"
          : "false"
      );

    }

  }


  // Recursos diários

  _dailyResourceResetUpdate() {

    return {
      "system.automacao.combatente.tomarFolegoUsado": false
    };

  }


  _availableHitDice() {

    const dv =
      this.actor.system.dv;


    const options = [];


    if (
      Number(dv?.d4?.disponiveis) > 0
    ) {
      options.push({
        type: "d4",
        die: "1d4",
        label: `d4 — ${dv.d4.disponiveis} disponível(is)`
      });
    }


    if (
      Number(dv?.d8?.disponiveis) > 0
    ) {
      options.push({
        type: "d8",
        die: "1d8",
        label: `d8 — ${dv.d8.disponiveis} disponível(is)`
      });
    }


    return options;

  }


  async _spendHitDie(
    type
  ) {

    if (
      type === "d4"
    ) {

      const usados =
        Number(
          this.actor.system.dadosVida.usadosD4
        ) || 0;


      await this.actor.update({
        "system.dadosVida.usadosD4":
          usados + 1
      });

      return true;

    }


    if (
      type === "d8"
    ) {

      const usados =
        Number(
          this.actor.system.dadosVida.usadosD8
        ) || 0;


      await this.actor.update({
        "system.dadosVida.usadosD8":
          usados + 1
      });

      return true;

    }


    return false;

  }


  _recoverMagicSlotsUpdate(
    caster,
    amount
  ) {

    const updates = {};


    let remaining =
      Math.max(
        Number(amount) || 0,
        0
      );


    const casterData =
      this.actor.system.conjuracao?.[caster];


    if (
      !casterData?.ativo
      || remaining <= 0
    ) {
      return updates;
    }


    for (
      let circle = 1;
      circle <= 5;
      circle++
    ) {

      if (
        remaining <= 0
      ) {
        break;
      }


      const key =
        `c${circle}`;


      const max =
        Number(
          casterData.max[key]
        ) || 0;


      const current =
        Math.min(
          Math.max(
            Number(
              this.actor.system.magia
                .espacos[caster][key]
            ) || 0,
            0
          ),
          max
        );


      const missing =
        Math.max(
          max - current,
          0
        );


      const recovered =
        Math.min(
          missing,
          remaining
        );


      if (
        recovered > 0
      ) {

        updates[
          `system.magia.espacos.${caster}.${key}`
        ] =
          current + recovered;


        remaining -=
          recovered;

      }

    }


    return updates;

  }


  _removeLightDebilitiesUpdate() {

    const updates = {};


    for (
      const key
      of ["d1", "d2", "d3", "d4", "d5"]
    ) {

      const debility =
        this.actor.system.debilidades[key];


      if (
        debility.tipo === "leve"
      ) {

        updates[`system.debilidades.${key}.tipo`] =
          "nenhuma";

        updates[`system.debilidades.${key}.fonte`] =
          "";

      }

    }


    return updates;

  }


  async _dailyRest() {

    const debilities =
      Number(
        this.actor.system.estadoDebilidades?.quantidade
      ) || 0;


    const forcedHalf =
      debilities >= 1;


    const hitDice =
      this._availableHitDice();


    const isArcanist =
      Boolean(
        this.actor.system.conjuracao?.arcanista?.ativo
      );


    const isProphet =
      Boolean(
        this.actor.system.conjuracao?.profeta?.ativo
      );


    const bothCasters =
      isArcanist
      && isProphet;


    const hitDieOptions = [
      `<option value="none">Não gastar DV</option>`,
      ...hitDice.map(
        option =>
          `<option value="${option.type}">${option.label}</option>`
      )
    ].join("");


    const casterChoice =
      bothCasters
        ? `
          <label class="breu-rest-field">
            <span>Recuperação de Espaços</span>
            <select name="casterRecovery">
              <option value="arcanista">Tabela de Arcanista</option>
              <option value="profeta">Tabela de Profeta</option>
              <option value="none">Não recuperar automaticamente</option>
            </select>
            <small>
              O livro manda manter as duas tabelas separadas, mas não especifica
              como dividir a recuperação de BP entre elas. Por isso a escolha fica manual.
            </small>
          </label>
        `
        : "";


    const config =
      await DialogV2.wait({

        window: {
          title:
            `Descanso Diário — ${this.actor.name}`
        },

        content: `
          <div class="breu-roll-dialog breu-rest-dialog">

            <p>
              ${
                forcedHalf
                  ? `<strong>Debilidade ativa:</strong> este Descanso Diário será tratado como <strong>Meio Descanso</strong>.`
                  : `Escolha se o descanso foi completado normalmente ou se foi um Meio Descanso.`
              }
            </p>

            <label class="breu-rest-field">
              <span>Qualidade do Descanso</span>
              <select name="restType" ${forcedHalf ? "disabled" : ""}>
                <option value="full" ${forcedHalf ? "" : "selected"}>Descanso Diário</option>
                <option value="half" ${forcedHalf ? "selected" : ""}>Meio Descanso</option>
              </select>
            </label>

            <label class="breu-rest-field">
              <span>Dado de Vida</span>
              <select name="hitDie">
                ${hitDieOptions}
              </select>
              <small>
                O consumo de insumo de tratamento não é rastreado automaticamente.
              </small>
            </label>

            ${casterChoice}

          </div>
        `,

        buttons: [
          {
            action: "confirm",
            label: "Concluir Descanso",
            icon: "fa-solid fa-moon",
            default: true,
            callback: (
              event,
              button
            ) => ({
              restType:
                forcedHalf
                  ? "half"
                  : button.form.elements.restType.value,
              hitDie:
                button.form.elements.hitDie.value,
              casterRecovery:
                bothCasters
                  ? button.form.elements.casterRecovery.value
                  : null
            })
          },
          {
            action: "cancel",
            label: "Cancelar",
            icon: "fa-solid fa-xmark",
            callback: () => BREU_DIALOG_CANCEL
          }
        ],

        modal: true,
        rejectClose: false

      });


    if (
      !config
      || config === BREU_DIALOG_CANCEL
    ) {
      return;
    }


    const half =
      config.restType === "half";


    const updates = {
      ...this._dailyResourceResetUpdate()
    };


    let healing = 0;
    let hitDieRoll = null;


    if (
      config.hitDie !== "none"
    ) {

      const option =
        hitDice.find(
          die => die.type === config.hitDie
        );


      if (option) {

        hitDieRoll =
          new Roll(
            option.die
          );


        await hitDieRoll.evaluate();


        const con =
          Number(
            this.actor.system.atributos.con
          ) || 0;


        const fullHealing =
          Math.max(
            Number(hitDieRoll.total) + con,
            1
          );


        healing =
          half
            ? Math.floor(fullHealing / 2)
            : fullHealing;


        const hp =
          Number(
            this.actor.system.vida.value
          ) || 0;


        const hpMax =
          Number(
            this.actor.system.vida.max
          ) || 0;


        updates["system.vida.value"] =
          Math.min(
            hp + healing,
            hpMax
          );


        if (
          config.hitDie === "d4"
        ) {
          updates["system.dadosVida.usadosD4"] =
            (Number(this.actor.system.dadosVida.usadosD4) || 0) + 1;
        }
        else if (
          config.hitDie === "d8"
        ) {
          updates["system.dadosVida.usadosD8"] =
            (Number(this.actor.system.dadosVida.usadosD8) || 0) + 1;
        }

      }

    }


    const bp =
      Number(
        this.actor.system.bp
      ) || 0;


    const slotRecovery =
      half
        ? Math.floor(bp / 2)
        : bp;


    if (
      bothCasters
    ) {

      if (
        ["arcanista", "profeta"]
          .includes(config.casterRecovery)
      ) {
        Object.assign(
          updates,
          this._recoverMagicSlotsUpdate(
            config.casterRecovery,
            slotRecovery
          )
        );
      }

    }
    else if (isArcanist) {
      Object.assign(
        updates,
        this._recoverMagicSlotsUpdate(
          "arcanista",
          slotRecovery
        )
      );
    }
    else if (isProphet) {
      Object.assign(
        updates,
        this._recoverMagicSlotsUpdate(
          "profeta",
          slotRecovery
        )
      );
    }


    if (!half) {
      Object.assign(
        updates,
        this._removeLightDebilitiesUpdate()
      );
    }


    await this.actor.update(
      updates
    );


    await publicarMensagemBreu({

      actor:
        this.actor,

      content:
        _breuChatCard({

          icon:
            "fa-solid fa-moon",

          eyebrow:
            "Recuperação",

          title:
            half
              ? "Meio Descanso"
              : "Descanso Diário",

          chips: [
            {
              label:
                `Espaços: até ${slotRecovery}`
            },
            {
              label:
                hitDieRoll
                  ? `${String(config.hitDie).toUpperCase()} gasto`
                  : "Sem gasto de DV",
              className:
                hitDieRoll
                  ? ""
                  : "is-muted"
            }
          ],

          stats: [
            {
              label:
                "PV recuperados",
              value:
                hitDieRoll
                  ? `+${healing}`
                  : "—"
            },
            {
              label:
                "Debilidades Leves",
              value:
                half
                  ? "Mantidas"
                  : "Recuperadas"
            }
          ],

          notes: [
            {
              text:
                "Espaços são recuperados dos menores para os maiores Círculos."
            }
          ],

          result:
            "DESCANSO CONCLUÍDO",

          resultClass:
            "is-neutral"

        })

    });

  }


  async _longRest() {

    try {

      const heavy =
        [];


      for (
        const key
        of ["d1", "d2", "d3", "d4", "d5"]
      ) {

        const debility =
          this.actor.system.debilidades[key];


        if (
          debility.tipo === "pesada"
        ) {

          heavy.push({
            key,
            source:
              debility.fonte
              || "Sem fonte anotada"
          });

        }

      }


      const heavyOptions =
        heavy
          .map(
            item =>
              `
                <option value="${item.key}">
                  ${item.key.toUpperCase()} — ${_breuEscapeHTML(item.source)}
                </option>
              `
          )
          .join("");


      const config =
        await DialogV2.wait({

          window: {
            title:
              `Descanso Longo — ${this.actor.name}`
          },

          content: `
            <div class="breu-roll-dialog breu-rest-dialog">

              <p>
                O Descanso Longo recupera todos os PVs,
                DVs, Espaços de Magia e Debilidades Leves.
              </p>

              <label class="breu-rest-field">

                <span>
                  Atendimento médico
                </span>

                <select name="care">
                  <option value="none">
                    Sem atendimento médico
                  </option>

                  <option value="medical">
                    Com atendimento médico
                  </option>
                </select>

              </label>

              ${
                heavy.length > 1
                  ? `
                    <label class="breu-rest-field">

                      <span>
                        Pesada removida sem atendimento
                      </span>

                      <select name="heavyChoice">
                        ${heavyOptions}
                      </select>

                    </label>
                  `
                  : ""
              }

              <small>
                Debilidades Permanentes não são removidas automaticamente.
              </small>

            </div>
          `,

          buttons: [

            {
              action:
                "confirm",

              label:
                "Concluir Descanso Longo",

              icon:
                "fa-solid fa-bed",

              default:
                true,

              callback: (
                event,
                button
              ) => ({

                care:
                  button.form
                    .elements
                    .care
                    .value,

                heavyChoice:
                  button.form
                    .elements
                    .heavyChoice
                    ?.value
                  ?? heavy[0]?.key
                  ?? null

              })
            },

            {
              action:
                "cancel",

              label:
                "Cancelar",

              icon:
                "fa-solid fa-xmark",

              callback: () => BREU_DIALOG_CANCEL
            }

          ],

          modal:
            true,

          rejectClose:
            false

        });


      if (
        !config
        || config === BREU_DIALOG_CANCEL
      ) {
        return;
      }


      const updates = {
        ...this._dailyResourceResetUpdate(),

        "system.vida.value":
          Number(
            this.actor.system.vida.max
          ) || 0,

        "system.dadosVida.usadosD4":
          0,

        "system.dadosVida.usadosD8":
          0,

        "system.automacao.combatente.ignorandoDebilidades":
          false
      };


      for (
        const caster
        of ["arcanista", "profeta"]
      ) {

        const casterData =
          this.actor.system.conjuracao?.[caster];


        if (
          !casterData?.ativo
        ) {
          continue;
        }


        for (
          let circle = 1;
          circle <= 5;
          circle++
        ) {

          const key =
            `c${circle}`;


          updates[
            `system.magia.espacos.${caster}.${key}`
          ] =
            Number(
              casterData.max[key]
            ) || 0;

        }

      }


      for (
        const key
        of ["d1", "d2", "d3", "d4", "d5"]
      ) {

        const debility =
          this.actor.system.debilidades[key];


        if (
          debility.tipo === "leve"
        ) {

          updates[
            `system.debilidades.${key}.tipo`
          ] =
            "nenhuma";

          updates[
            `system.debilidades.${key}.fonte`
          ] =
            "";

        }


        if (
          debility.tipo === "pesada"
          && (
            config.care === "medical"
            || key === config.heavyChoice
          )
        ) {

          updates[
            `system.debilidades.${key}.tipo`
          ] =
            "nenhuma";

          updates[
            `system.debilidades.${key}.fonte`
          ] =
            "";

        }

      }


      await this.actor.update(
        updates
      );


      await publicarMensagemBreu({

        actor:
          this.actor,

        content:
          _breuChatCard({

            icon:
              "fa-solid fa-bed",

            eyebrow:
              "Recuperação",

            title:
              "Descanso Longo",

            chips: [
              { label: "PV completos" },
              { label: "DVs completos" },
              { label: "Espaços completos" }
            ],

            stats: [
              {
                label:
                  "Debilidades Leves",
                value:
                  "Removidas"
              },
              {
                label:
                  "Debilidades Pesadas",
                value:
                  config.care === "medical"
                    ? "Todas"
                    : heavy.length > 0
                      ? "Uma"
                      : "Nenhuma"
              }
            ],

            notes: [
              {
                text:
                  config.care === "medical"
                    ? "Descanso com atendimento médico. Debilidades Permanentes não são removidas automaticamente."
                    : "Descanso sem atendimento médico. Debilidades Permanentes não são removidas automaticamente."
              }
            ],

            result:
              "DESCANSO CONCLUÍDO",

            resultClass:
              "is-neutral"

          })

      });

    }

    catch (
      error
    ) {

      console.error(
        "BREU | Erro ao concluir Descanso Longo.",
        error
      );


      ui.notifications.error(
        "BREU | O Descanso Longo encontrou um erro. Veja o console para detalhes."
      );

    }

  }


  async _useTomarFolego() {

    const benefit =
      this.actor.system.beneficiosAutomaticos?.combatente;


    if (
      !benefit?.tomarFolego
    ) {
      return;
    }


    if (
      benefit.tomarFolegoUsado
    ) {
      ui.notifications.warn(
        "BREU | Tomar Fôlego já foi usado desde o último Descanso Diário."
      );
      return;
    }


    const hitDice =
      this._availableHitDice();


    if (
      hitDice.length === 0
    ) {
      ui.notifications.warn(
        "BREU | Não há Dado de Vida disponível para gastar."
      );
      return;
    }


    let hitDie =
      hitDice[0].type;


    if (
      hitDice.length > 1
    ) {

      const options =
        hitDice.map(
          option =>
            `<option value="${option.type}">${option.label}</option>`
        ).join("");


      hitDie =
        await DialogV2.wait({
          window: {
            title: "Tomar Fôlego"
          },
          content: `
            <div class="breu-roll-dialog breu-rest-dialog">
              <label class="breu-rest-field">
                <span>Dado de Vida gasto</span>
                <select name="hitDie">${options}</select>
              </label>
            </div>
          `,
          buttons: [
            {
              action: "use",
              label: "Usar",
              icon: "fa-solid fa-heart-pulse",
              default: true,
              callback: (
                event,
                button
              ) => button.form.elements.hitDie.value
            },
            {
              action: "cancel",
              label: "Cancelar",
              icon: "fa-solid fa-xmark",
              callback: () => BREU_DIALOG_CANCEL
            }
          ],
          modal: true,
          rejectClose: false
        });

    }


    if (
      !hitDie
      || hitDie === BREU_DIALOG_CANCEL
    ) {
      return;
    }


    const roll =
      new Roll(
        `1d8 + ${Number(this.actor.system.nivel) || 0}`
      );


    await roll.evaluate();


    const healing =
      Math.max(
        Number(roll.total) || 0,
        0
      );


    const hp =
      Number(this.actor.system.vida.value) || 0;


    const hpMax =
      Number(this.actor.system.vida.max) || 0;


    const updates = {
      "system.vida.value":
        Math.min(
          hp + healing,
          hpMax
        ),
      "system.automacao.combatente.tomarFolegoUsado":
        true
    };


    if (
      hitDie === "d4"
    ) {
      updates["system.dadosVida.usadosD4"] =
        (Number(this.actor.system.dadosVida.usadosD4) || 0) + 1;
    }
    else {
      updates["system.dadosVida.usadosD8"] =
        (Number(this.actor.system.dadosVida.usadosD8) || 0) + 1;
    }


    await this.actor.update(
      updates
    );


    await publicarRolagemBreu({

      actor:
        this.actor,

      roll:
        roll,

      content:
        _breuChatCard({

          icon:
            "fa-solid fa-heart-pulse",

          eyebrow:
            "Combatente",

          title:
            "Tomar Fôlego",

          stats: [
            {
              label:
                "PV recuperados",
              value:
                `+${healing}`
            },
            {
              label:
                "DV gasto",
              value:
                String(hitDie).toUpperCase()
            }
          ],

          result:
            "RECUPERAÇÃO",

          resultClass:
            "is-neutral"

        })

    });

  }


  async _toggleIgnoreDebilities() {

    const combatente =
      this.actor.system.beneficiosAutomaticos?.combatente;


    if (
      !combatente?.ignorarDebilidades
    ) {
      return;
    }


    if (
      !combatente.ignorandoDebilidades
    ) {

      await this.actor.update({
        "system.automacao.combatente.ignorandoDebilidades":
          true
      });


      ui.notifications.info(
        "BREU | Debilidades ignoradas durante o combate."
      );

      return;

    }


    const emptyKey =
      ["d1", "d2", "d3", "d4", "d5"]
        .find(
          key =>
            this.actor.system.debilidades[key].tipo === "nenhuma"
        );


    if (!emptyKey) {
      ui.notifications.warn(
        "BREU | Não há espaço livre para registrar a Debilidade Leve recebida ao final do combate. Resolva manualmente antes de encerrar Ignorar Debilidades."
      );
      return;
    }


    await this.actor.update({
      "system.automacao.combatente.ignorandoDebilidades":
        false,
      [`system.debilidades.${emptyKey}.tipo`]:
        "leve",
      [`system.debilidades.${emptyKey}.fonte`]:
        "Ignorar Debilidades"
    });


    ui.notifications.info(
      "BREU | Ignorar Debilidades encerrado: 1 Debilidade Leve adicionada."
    );

  }


  // Espaços de magia

  async _changeMagicSlot(
    caster,
    circle,
    delta
  ) {

    if (
      !["arcanista", "profeta"]
        .includes(caster)
    ) {
      return;
    }


    if (
      circle < 1
      || circle > 5
    ) {
      return;
    }


    const key =
      `c${circle}`;


    const atual =
      Number(
        this.actor.system
          .magia
          .espacos
          [caster]
          [key]
      ) || 0;


    const max =
      Number(
        this.actor.system
          .conjuracao
          [caster]
          .max
          [key]
      ) || 0;


    const novo =
      Math.min(
        Math.max(
          atual + delta,
          0
        ),
        max
      );


    await this.actor.update({

      [`system.magia.espacos.${caster}.${key}`]:
        novo

    });

  }


  // Restaurar espaços

  async _restoreMagicSlots(
    caster
  ) {

    if (
      !["arcanista", "profeta"]
        .includes(caster)
    ) {
      return;
    }


    const updates =
      {};


    for (
      let circle = 1;
      circle <= 5;
      circle++
    ) {

      const key =
        `c${circle}`;


      updates[
        `system.magia.espacos.${caster}.${key}`
      ] =
        Number(
          this.actor.system
            .conjuracao
            [caster]
            .max
            [key]
        ) || 0;

    }


    await this.actor.update(
      updates
    );

  }


  // Criação de magia

  async _createMagicItem(
    type
  ) {

    if (
      !["feitico", "milagre"]
        .includes(type)
    ) {
      return;
    }


    const name =
      type === "feitico"
        ? "Novo Feitiço"
        : "Novo Milagre";


    const created =
      await this.actor
        .createEmbeddedDocuments(
          "Item",
          [{

            name,

            type:
              "magia",

            system: {

              tipo:
                type,

              circulo:
                1

            }

          }]
        );


    if (
      created?.[0]
    ) {

      await created[0]
        .sheet
        .render({
          force: true
        });

    }

  }


  // Preparação de feitiço

  async _togglePreparedSpell(
    item,
    prepared
  ) {

    if (
      item.system.tipo !== "feitico"
    ) {
      return;
    }


    if (
      !prepared
    ) {

      await item.update({
        "system.preparada":
          false
      });

      return;

    }


    const arcanista =
      this.actor.system
        .conjuracao
        .arcanista;


    if (
      !arcanista.ativo
    ) {

      ui.notifications.warn(
        "BREU | O personagem não possui níveis de Arcanista."
      );

      this.render();

      return;

    }


    const circle =
      Number(
        item.system.circulo
      ) || 1;


    if (
      circle > arcanista.circuloMaximo
    ) {

      ui.notifications.warn(
        `BREU | ${item.name} pertence a um Círculo que esta Arcanista ainda não pode conjurar.`
      );

      this.render();

      return;

    }


    const preparedCount =
      this.actor.items.filter(
        magic =>
          magic.type === "magia"
          && magic.system.tipo === "feitico"
          && magic.system.preparada
          && magic.id !== item.id
      ).length;


    const limit =
      arcanista.nivel
      + Number(
        this.actor.system.bp
      );


    if (
      preparedCount >= limit
    ) {

      ui.notifications.warn(
        `BREU | Limite de ${limit} Feitiços preparados alcançado.`
      );

      this.render();

      return;

    }


    await item.update({
      "system.preparada":
        true
    });

  }


  // Conjuração

  async _castMagic(
    item
  ) {

    if (
      item.type !== "magia"
    ) {
      return;
    }


    const isSpell =
      item.system.tipo === "feitico";


    const caster =
      isSpell
        ? "arcanista"
        : "profeta";


    const casterData =
      this.actor.system
        .conjuracao
        [caster];


    const casterName =
      isSpell
        ? "Arcanista"
        : "Profeta";


    if (
      !casterData.ativo
    ) {

      ui.notifications.warn(
        `BREU | O personagem não possui níveis de ${casterName}.`
      );

      return;

    }


    if (
      isSpell
      && !item.system.preparada
    ) {

      ui.notifications.warn(
        `BREU | ${item.name} não está preparado.`
      );

      return;

    }


    const magicCircle =
      Number(
        item.system.circulo
      ) || 1;


    if (
      magicCircle
      > casterData.circuloMaximo
    ) {

      ui.notifications.warn(
        `BREU | ${item.name} pertence a um Círculo que o personagem ainda não pode conjurar.`
      );

      return;

    }


    const availableSlots =
      [];


    for (
      let circle =
        magicCircle;

      circle <= 5;

      circle++
    ) {

      const key =
        `c${circle}`;


      const max =
        Number(
          casterData.max[key]
        ) || 0;


      const stored =
        Number(
          this.actor.system
            .magia
            .espacos
            [caster]
            [key]
        ) || 0;


      const current =
        Math.min(
          stored,
          max
        );


      if (
        current > 0
      ) {

        availableSlots.push({
          circle,
          current
        });

      }

    }


    if (
      availableSlots.length === 0
    ) {

      ui.notifications.warn(
        `BREU | Não há Espaço de Magia disponível para conjurar ${item.name}.`
      );

      return;

    }


    const options =
      availableSlots.map(
        slot => `
          <option value="${slot.circle}">
            ${slot.circle}º Círculo — ${slot.current} disponível
          </option>
        `
      ).join("");


    const selected =
      await DialogV2.wait({

        window: {
          title:
            `Conjurar — ${item.name}`
        },


        content: `

          <div class="breu-roll-dialog">

            <div class="breu-cast-dialog">

              <div>

                <strong>
                  ${item.name}
                </strong>

                <span>
                  ${magicCircle}º Círculo
                </span>

              </div>


              <label>

                <span>
                  Espaço utilizado
                </span>

                <select name="circuloEspaco">
                  ${options}
                </select>

              </label>

            </div>

          </div>

        `,


        buttons: [

          {

            action:
              "conjurar",

            label:
              "Conjurar",

            icon:
              "fa-solid fa-wand-magic-sparkles",

            default:
              true,


            callback: (
              event,
              button
            ) => {

              return Number(
                button.form.elements
                  .circuloEspaco
                  .value
              );

            }

          },


          {

            action:
              "cancelar",

            label:
              "Cancelar",

            icon:
              "fa-solid fa-xmark",

            callback: () => BREU_DIALOG_CANCEL

          }

        ],


        modal:
          true,

        rejectClose:
          false

      });


    if (
      !selected
      || selected === BREU_DIALOG_CANCEL
    ) {
      return;
    }


    const key =
      `c${selected}`;


    const current =
      Number(
        this.actor.system
          .magia
          .espacos
          [caster]
          [key]
      ) || 0;


    if (
      current <= 0
    ) {

      ui.notifications.warn(
        "BREU | O Espaço selecionado não está mais disponível."
      );

      return;

    }


    await this.actor.update({

      [`system.magia.espacos.${caster}.${key}`]:
        current - 1

    });


    const escapeHTML =
      text =>
        String(
          text ?? ""
        )

          .replace(
            /&/g,
            "&amp;"
          )

          .replace(
            /</g,
            "&lt;"
          )

          .replace(
            />/g,
            "&gt;"
          )

          .replace(
            /"/g,
            "&quot;"
          )

          .replace(
            /'/g,
            "&#039;"
          )

          .replace(
            /\n/g,
            "<br>"
          );


    const system =
      item.system;


    await publicarMensagemBreu({

      actor:
        this.actor,

      content:
        _breuChatCard({

          icon:
            "fa-solid fa-wand-magic-sparkles",

          eyebrow:
            isSpell
              ? "Feitiço"
              : "Milagre",

          title:
            item.name,

          chips: [
            {
              label:
                `${magicCircle}º Círculo`
            },
            {
              label:
                `Espaço gasto: ${selected}º`
            }
          ],

          details: [
            {
              label:
                "Tempo",
              value:
                system.tempo
            },
            {
              label:
                "Alcance",
              value:
                system.alcance
            },
            {
              label:
                "Área",
              value:
                system.area
            },
            {
              label:
                "Duração",
              value:
                system.duracao
            },
            {
              label:
                "Custo",
              value:
                system.custo
            }
          ],

          description:
            system.descricao
              ? escapeHTML(system.descricao)
              : ""

        })

    });

  }


  // Teste de magia

  async _rollMagicTest(
    caster
  ) {

    if (
      !["arcanista", "profeta"]
        .includes(caster)
    ) {
      return;
    }


    const isArcanist =
      caster === "arcanista";


    const name =
      isArcanist
        ? "Arcanista"
        : "Profeta";


    const attribute =
      isArcanist
        ? "INT"
        : "SAB";


    const attributeValue =
      Number(
        isArcanist
          ? this.actor.system.atributos.int
          : this.actor.system.atributos.sab
      ) || 0;


    const bp =
      Number(
        this.actor.system.bp
      ) || 0;


    const baseBonus =
      attributeValue + bp;


    const casterData =
      this.actor.system.conjuracao[caster];


    if (
      !casterData.ativo
    ) {

      ui.notifications.warn(
        `BREU | O personagem não possui níveis de ${name}.`
      );

      return;

    }


    const debilidadesEfetivas =
      _breuDebilidadesEfetivas(
        this.actor
      );


    const autoSources =
      [];


    if (
      debilidadesEfetivas >= 3
    ) {

      autoSources.push(
        "3 ou mais Debilidades"
      );

    }


    const autoDisadvantage =
      autoSources.length > 0;


    const configuration =
      await DialogV2.wait({

        window: {
          title:
            `Teste de Magia — ${name}`
        },

        content: `
          <div class="breu-roll-dialog">

            ${_breuAutomaticDisadvantageHTML(autoSources)}

            <section class="breu-roll-section">

              <div class="breu-roll-section-caption">
                Condição vinda da ficção
              </div>

            </section>

            <section class="breu-roll-section breu-roll-modes">

              <label class="breu-roll-option">
                <input
                  type="radio"
                  name="modo"
                  value="normal"
                  checked
                >
                <span>Normal</span>
              </label>

              <label class="breu-roll-option">
                <input
                  type="radio"
                  name="modo"
                  value="vantagem"
                >
                <span>Vantagem</span>
              </label>

              <label class="breu-roll-option">
                <input
                  type="radio"
                  name="modo"
                  value="desvantagem"
                >
                <span>Desvantagem</span>
              </label>

            </section>

            <hr>

            <section class="breu-roll-section">

              <label class="breu-roll-option">
                <input type="radio" name="dificuldade" value="12">
                <span>Fácil — CD 12</span>
              </label>

              <label class="breu-roll-option">
                <input type="radio" name="dificuldade" value="17" checked>
                <span>Média — CD 17</span>
              </label>

              <label class="breu-roll-option">
                <input type="radio" name="dificuldade" value="22">
                <span>Difícil — CD 22</span>
              </label>

              <label class="breu-roll-option breu-custom-cd">
                <input type="radio" name="dificuldade" value="personalizada">
                <span>Personalizada</span>
                <input type="number" name="cdPersonalizada" value="15">
              </label>

              <label class="breu-roll-option">
                <input type="radio" name="dificuldade" value="sem-cd">
                <span>Sem CD</span>
              </label>

            </section>

            <hr>

            <section class="breu-roll-section">

              <div class="breu-situational-modifier">
                <input
                  type="number"
                  name="situacional"
                  value="0"
                  step="1"
                >

                <span>
                  Bônus ou penalidade definida pela ficção.
                </span>
              </div>

            </section>

            <hr>

            <div class="breu-roll-summary">

              <strong>
                ${attribute}
                ${attributeValue >= 0 ? "+" : ""}${attributeValue}
              </strong>

              <span>
                BP +${bp}
              </span>

              <span>
                TM ${baseBonus >= 0 ? "+" : ""}${baseBonus}
              </span>

            </div>

          </div>
        `,

        buttons: [

          {
            action:
              "rolar",

            label:
              "Rolar",

            icon:
              "fa-solid fa-dice-d20",

            default:
              true,

            callback: (
              event,
              button
            ) => ({

              modo:
                button.form
                  .elements
                  .modo
                  .value,

              dificuldade:
                button.form
                  .elements
                  .dificuldade
                  .value,

              cdPersonalizada:
                Number(
                  button.form
                    .elements
                    .cdPersonalizada
                    .value
                ),

              situacional:
                Number(
                  button.form
                    .elements
                    .situacional
                    .value
                ) || 0

            })
          },

          {
            action:
              "cancelar",

            label:
              "Cancelar",

            icon:
              "fa-solid fa-xmark",

            callback: () => BREU_DIALOG_CANCEL
          }

        ],

        modal:
          true,

        rejectClose:
          false

      });


    if (
      !configuration
      || configuration === BREU_DIALOG_CANCEL
    ) {
      return;
    }


    const {
      dificuldade,
      cdPersonalizada,
      situacional
    } =
      configuration;


    let cd =
      null;


    let difficultyText =
      "Sem CD";


    switch (
      dificuldade
    ) {

      case "12":
        cd = 12;
        difficultyText = "Fácil — CD 12";
        break;

      case "17":
        cd = 17;
        difficultyText = "Média — CD 17";
        break;

      case "22":
        cd = 22;
        difficultyText = "Difícil — CD 22";
        break;

      case "personalizada":
        cd = cdPersonalizada;
        difficultyText = `Personalizada — CD ${cd}`;
        break;

    }


    const finalBonus =
      baseBonus
      + situacional;


    const modo =
      _breuResolverModo(
        configuration.modo,
        false,
        autoDisadvantage
      );


    const die =
      modo === "vantagem"
        ? "2d20kh"
        : modo === "desvantagem"
          ? "2d20kl"
          : "1d20";


    const formula =
      finalBonus > 0
        ? `${die} + ${finalBonus}`
        : finalBonus < 0
          ? `${die} - ${Math.abs(finalBonus)}`
          : die;


    const roll =
      new Roll(
        formula
      );


    await roll.evaluate();


    const natural =
      roll.dice[0]?.total;


    let result =
      "";


    let resultClass =
      "";


    if (
      natural === 20
    ) {
      result = "SUCESSO CRÍTICO";
      resultClass = "critical-success";
    }

    else if (
      natural === 1
    ) {
      result = "FALHA CRÍTICA";
      resultClass = "critical-failure";
    }

    else if (
      cd !== null
    ) {

      if (
        roll.total >= cd
      ) {
        result = "SUCESSO";
        resultClass = "success";
      }

      else {
        result = "FALHA";
        resultClass = "failure";
      }

    }


    const modeText = {
      normal: "Normal",
      vantagem: "Vantagem",
      desvantagem: "Desvantagem"
    }[modo] ?? "Normal";


    await publicarRolagemBreu({

      actor:
        this.actor,

      roll:
        roll,

      content:
        _breuChatCard({

          icon:
            "fa-solid fa-wand-magic-sparkles",

          eyebrow:
            "Teste de Magia",

          title:
            name,

          chips: [
            {
              label:
                modeText,
              className:
                modo === "vantagem"
                  ? "is-advantage"
                  : modo === "desvantagem"
                    ? "is-disadvantage"
                    : "is-normal"
            },
            {
              label:
                difficultyText
            }
          ],

          stats: [
            {
              label:
                "Atributo",
              value:
                attribute
            },
            {
              label:
                "Bônus",
              value:
                `${finalBonus >= 0 ? "+" : ""}${finalBonus}`
            }
          ],

          notes:
            autoDisadvantage
              ? [{
                  text:
                    `Desvantagem automática: ${autoSources.join(" · ")}`,
                  className:
                    "is-warning"
                }]
              : [],

          result,

          resultClass

        })

    });

  }


  // Ataque

  async _rollWeaponAttack(
    item
  ) {

    if (
      !item
      || item.system.categoria !== "arma"
    ) {
      return;
    }


    const arma =
      item.system.arma;


    const propriedades =
      String(
        arma.propriedades ?? ""
      );


    const fluida =
      /\bfluida\b/i.test(
        propriedades
      );


    const usaDes =
      arma.tipo === "distancia"
      || arma.tipo === "arremesso"
      || fluida;


    const atributo =
      usaDes
        ? "des"
        : "for";


    const atributoNome =
      usaDes
        ? "DES"
        : "FOR";


    const bonusAtributo =
      Number(
        this.actor.system
          .atributos
          [atributo]
      ) || 0;


    const proficiente =
      _breuArmaProficiente(
        this.actor,
        item
      );


    const nivelCombatente =
      Number(
        this.actor.system
          .progressao
          .classes
          .combatente
      ) || 0;


    const armaFavorita =
      nivelCombatente >= 2
      && Boolean(
        arma.favorita
      );


    const armaFavoritaAprimorada =
      nivelCombatente >= 9
      && armaFavorita;


    const faixaCritico =
      armaFavoritaAprimorada
        ? "18–20"
        : "20";


    const bp =
      Number(
        this.actor.system.bp
      ) || 0;


    const bonusEstilo =
      Number(
        this.actor.system.beneficiosAutomaticos
          ?.combatente
          ?.estiloAtaque
      ) || 0;


    const bonusBase =
      bonusAtributo
      + (
        proficiente
          ? bp
          : 0
      )
      + bonusEstilo;


    const debilidadesEfetivas =
      _breuDebilidadesEfetivas(
        this.actor
      );


    const autoSources =
      [];


    if (
      !proficiente
    ) {

      autoSources.push(
        "Arma fora da proficiência"
      );

    }


    if (
      debilidadesEfetivas >= 2
    ) {

      autoSources.push(
        "2 ou mais Debilidades"
      );

    }


    const autoDisadvantage =
      autoSources.length > 0;


    const configuracao =
      await DialogV2.wait({

        window: {
          title:
            `Ataque — ${item.name}`
        },

        content: `

          <div class="breu-roll-dialog">

            ${_breuAutomaticDisadvantageHTML(autoSources)}

            <section class="breu-roll-section">

              <div class="breu-roll-section-caption">
                Condição vinda da ficção
              </div>

            </section>

            <section
              class="breu-roll-section breu-roll-modes"
            >

              <label class="breu-roll-option">

                <input
                  type="radio"
                  name="modo"
                  value="normal"
                  checked
                >

                <span>
                  Normal
                </span>

              </label>


              <label class="breu-roll-option">

                <input
                  type="radio"
                  name="modo"
                  value="vantagem"
                >

                <span>
                  Vantagem
                </span>

              </label>


              <label class="breu-roll-option">

                <input
                  type="radio"
                  name="modo"
                  value="desvantagem"
                >

                <span>
                  Desvantagem
                </span>

              </label>

            </section>


            <hr>


            <section class="breu-roll-section">

              <div class="breu-situational-modifier">

                <input
                  type="number"
                  name="situacional"
                  value="0"
                  step="1"
                >

                <span>
                  Bônus ou penalidade definida pela ficção.
                </span>

              </div>

            </section>


            <hr>


            <div class="breu-roll-summary">

              <strong>
                ${item.name}
              </strong>

              <span>
                ${atributoNome}
                ${bonusAtributo >= 0 ? "+" : ""}${bonusAtributo}
              </span>

              <span>
                BP:
                ${proficiente ? `+${bp}` : "não aplicado"}
              </span>

              <span>
                ${
                  proficiente
                    ? "Proficiente"
                    : "Não proficiente"
                }
              </span>

              ${
                armaFavorita
                  ? `
                    <span>
                      Arma Favorita
                    </span>
                  `
                  : ""
              }

              <span>
                Crítico natural: ${faixaCritico}
              </span>

            </div>

          </div>

        `,

        buttons: [

          {
            action:
              "rolar",

            label:
              "Atacar",

            icon:
              "fa-solid fa-dice-d20",

            default:
              true,

            callback: (
              event,
              button
            ) => ({

              modo:
                button.form
                  .elements
                  .modo
                  .value,

              situacional:
                Number(
                  button.form
                    .elements
                    .situacional
                    .value
                ) || 0

            })
          },

          {
            action:
              "cancelar",

            label:
              "Cancelar",

            icon:
              "fa-solid fa-xmark",

            callback: () => BREU_DIALOG_CANCEL
          }

        ],

        modal:
          true,

        rejectClose:
          false

      });


    if (
      !configuracao
      || configuracao === BREU_DIALOG_CANCEL
    ) {
      return;
    }


    const modo =
      _breuResolverModo(
        configuracao.modo,
        false,
        autoDisadvantage
      );


    const situacional =
      configuracao.situacional;


    const bonusFinal =
      bonusBase
      + situacional;


    const die =
      modo === "vantagem"
        ? "2d20kh"
        : modo === "desvantagem"
          ? "2d20kl"
          : "1d20";


    const formula =
      bonusFinal > 0
        ? `${die} + ${bonusFinal}`
        : bonusFinal < 0
          ? `${die} - ${Math.abs(bonusFinal)}`
          : die;


    const ataque =
      new Roll(
        formula
      );


    await ataque.evaluate();


    const natural =
      ataque.dice[0]?.total;


    let resultadoCritico =
      "";


    let classeResultado =
      "";


    if (
      natural === 20
      || (
        armaFavoritaAprimorada
        && natural >= 18
      )
    ) {

      resultadoCritico =
        "SUCESSO CRÍTICO";

      classeResultado =
        "critical-success";

    }

    else if (
      natural === 1
    ) {

      resultadoCritico =
        "FALHA CRÍTICA";

      classeResultado =
        "critical-failure";

    }


    const modoTexto = {
      normal: "Normal",
      vantagem: "Vantagem",
      desvantagem: "Desvantagem"
    }[modo];


    await publicarRolagemBreu({

      actor:
        this.actor,

      roll:
        ataque,

      content:
        _breuChatCard({

          icon:
            "fa-solid fa-crosshairs",

          eyebrow:
            "Ataque",

          title:
            item.name,

          chips: [
            {
              label:
                modoTexto,
              className:
                modo === "vantagem"
                  ? "is-advantage"
                  : modo === "desvantagem"
                    ? "is-disadvantage"
                    : "is-normal"
            },
            {
              label:
                atributoNome
            },
            ...(armaFavorita
              ? [{
                  label:
                    "Arma Favorita",
                  className:
                    "is-accent"
                }]
              : [])
          ],

          stats: [
            {
              label:
                "Bônus",
              value:
                `${bonusFinal >= 0 ? "+" : ""}${bonusFinal}`
            },
            {
              label:
                "Crítico natural",
              value:
                faixaCritico
            }
          ],

          notes: [
            ...(autoDisadvantage
              ? [{
                  text:
                    `Desvantagem automática: ${autoSources.join(" · ")}`,
                  className:
                    "is-warning"
                }]
              : [])
          ],

          result:
            resultadoCritico,

          resultClass:
            classeResultado

        })

    });

  }


  // Dano

  async _rollWeaponDamage(
    item
  ) {

    if (
      !item
      || item.system.categoria !== "arma"
    ) {
      return;
    }


    const arma =
      item.system.arma;


    const danoArma =
      String(
        arma.dano ?? ""
      ).trim();


    if (
      !danoArma
    ) {

      ui.notifications.warn(
        `BREU | ${item.name} não possui dano configurado.`
      );

      return;

    }


    const nivelCombatente =
      Number(
        this.actor.system
          .progressao
          .classes
          .combatente
      ) || 0;


    const armaFavorita =
      nivelCombatente >= 2
      && Boolean(
        arma.favorita
      );


    const aumentoFavorita =
      armaFavorita
        ? _breuAumentarDanoUmPasso(
            danoArma
          )
        : {
            formula:
              danoArma,

            alterada:
              false,

            original:
              danoArma
          };


    if (
      armaFavorita
      && !aumentoFavorita.alterada
    ) {

      ui.notifications.warn(
        `BREU | ${item.name} é uma Arma Favorita, mas a fórmula "${danoArma}" não corresponde a uma progressão de dano reconhecida pelo livro. O dano será rolado sem alteração automática.`
      );

    }


    const danoEfetivo =
      aumentoFavorita.formula;


    const somaFor =
      arma.tipo === "corpo"
      || arma.tipo === "arremesso";


    const forca =
      Number(
        this.actor.system.atributos.for
      ) || 0;


    const bonusEstilo =
      Number(
        this.actor.system.beneficiosAutomaticos
          ?.combatente
          ?.estiloDano
      ) || 0;


    let formula =
      danoEfetivo;


    const modificadores = [];


    if (somaFor) {
      modificadores.push(forca);
    }


    if (bonusEstilo) {
      modificadores.push(bonusEstilo);
    }


    const bonusTotal =
      modificadores.reduce(
        (total, valor) => total + valor,
        0
      );


    if (bonusTotal > 0) {
      formula = `${danoEfetivo} + ${bonusTotal}`;
    }
    else if (bonusTotal < 0) {
      formula = `${danoEfetivo} - ${Math.abs(bonusTotal)}`;
    }


    let dano;


    try {

      dano =
        new Roll(
          formula
        );


      await dano.evaluate();

    }

    catch (
      error
    ) {

      console.error(
        "BREU | Fórmula de dano inválida.",
        {
          item:
            item.name,

          formula,

          error
        }
      );


      ui.notifications.error(
        `BREU | Fórmula de dano inválida em ${item.name}: ${danoArma}`
      );


      return;

    }


    await publicarRolagemBreu({

      actor:
        this.actor,

      roll:
        dano,

      content:
        _breuChatCard({

          icon:
            "fa-solid fa-burst",

          eyebrow:
            "Dano",

          title:
            item.name,

          chips: [
            {
              label:
                danoEfetivo
            },
            ...(armaFavorita && aumentoFavorita.alterada
              ? [{
                  label:
                    "Arma Favorita",
                  className:
                    "is-accent"
                }]
              : [])
          ],

          stats: [
            {
              label:
                "Modificador",
              value:
                bonusTotal === 0
                  ? "—"
                  : `${bonusTotal > 0 ? "+" : ""}${bonusTotal}`
            },
            {
              label:
                "Fórmula final",
              value:
                formula
            }
          ],

          notes:
            armaFavorita && aumentoFavorita.alterada
              ? [{
                  text:
                    `Dano base: ${danoArma} → ${danoEfetivo}`
                }]
              : []

        })

    });

  }


  // Teste de resistência

  async _rollResistance(
    atributo
  ) {

    const nomes = {
      for: "FOR",
      des: "DES",
      con: "CON",
      int: "INT",
      sab: "SAB",
      car: "CAR"
    };


    const nome =
      nomes[atributo];


    if (
      !nome
    ) {
      return;
    }


    const bp =
      Number(
        this.actor.system.bp
      ) || 0;


    const especialista =
      this.actor.system
        .beneficiosAutomaticos
        ?.especialista;


    const arcanista =
      this.actor.system
        .beneficiosAutomaticos
        ?.arcanista;


    const bonusTecnica =
      Number(
        especialista?.bonusTR
      ) || 0;


    const bonusBase =
      Number(
        this.actor.system.tr[atributo]
      ) || 0;


    const protecaoArcana =
      Boolean(
        arcanista?.protecaoArcana
      );


    const debilidadesEfetivas =
      _breuDebilidadesEfetivas(
        this.actor
      );


    const autoSources =
      [];


    if (
      debilidadesEfetivas >= 3
    ) {

      autoSources.push(
        "3 ou mais Debilidades"
      );

    }


    const autoDisadvantage =
      autoSources.length > 0;


    const config =
      await DialogV2.wait({

        window: {
          title:
            `Teste de Resistência — ${nome}`
        },

        content: `
          <div class="breu-roll-dialog">

            ${_breuAutomaticDisadvantageHTML(autoSources)}

            <section class="breu-roll-section">

              <div class="breu-roll-section-caption">
                Condição vinda da ficção
              </div>

            </section>

            <section class="breu-roll-section breu-roll-modes">

              <label class="breu-roll-option">
                <input
                  type="radio"
                  name="modo"
                  value="normal"
                  checked
                >
                <span>Normal</span>
              </label>

              <label class="breu-roll-option">
                <input
                  type="radio"
                  name="modo"
                  value="vantagem"
                >
                <span>Vantagem</span>
              </label>

              <label class="breu-roll-option">
                <input
                  type="radio"
                  name="modo"
                  value="desvantagem"
                >
                <span>Desvantagem</span>
              </label>

            </section>

            <hr>

            <section class="breu-roll-section breu-roll-difficulties">

              <label class="breu-roll-option">
                <input type="radio" name="dificuldade" value="12">
                <span>Fácil — CD 12</span>
              </label>

              <label class="breu-roll-option">
                <input type="radio" name="dificuldade" value="17" checked>
                <span>Média — CD 17</span>
              </label>

              <label class="breu-roll-option">
                <input type="radio" name="dificuldade" value="22">
                <span>Difícil — CD 22</span>
              </label>

              <label class="breu-roll-option breu-custom-cd">
                <input type="radio" name="dificuldade" value="personalizada">
                <span>Personalizada</span>
                <input
                  type="number"
                  name="cdPersonalizada"
                  value="15"
                  min="0"
                  step="1"
                >
              </label>

              <label class="breu-roll-option">
                <input type="radio" name="dificuldade" value="sem-cd">
                <span>Sem CD</span>
              </label>

            </section>

            ${
              protecaoArcana
                ? `
                  <hr>

                  <label class="breu-feature-check">

                    <input
                      type="checkbox"
                      name="efeitoMagico"
                    >

                    <span>

                      <strong>
                        Proteção Arcana
                      </strong>

                      Resistindo a efeito mágico:
                      adicionar outro BP (+${bp}) ao TR.

                    </span>

                  </label>
                `
                : ""
            }

            <hr>

            <section class="breu-roll-section">

              <div class="breu-situational-modifier">

                <input
                  type="number"
                  name="situacional"
                  value="0"
                  step="1"
                >

                <span>
                  Bônus ou penalidade definida pela ficção.
                </span>

              </div>

            </section>

            <hr>

            <div class="breu-roll-summary">

              <strong>
                TR de ${nome}
              </strong>

              <span>
                Bônus da ficha:
                ${bonusBase >= 0 ? "+" : ""}${bonusBase}
              </span>

              ${
                bonusTecnica
                  ? `
                    <span>
                      Inclui Técnica Especializada:
                      +${bonusTecnica}
                    </span>
                  `
                  : ""
              }

            </div>

          </div>
        `,

        buttons: [

          {
            action:
              "rolar",

            label:
              "Rolar",

            icon:
              "fa-solid fa-dice-d20",

            default:
              true,

            callback: (
              event,
              button
            ) => ({

              modo:
                button.form
                  .elements
                  .modo
                  .value,

              dificuldade:
                button.form
                  .elements
                  .dificuldade
                  .value,

              cdPersonalizada:
                Number(
                  button.form
                    .elements
                    .cdPersonalizada
                    .value
                ),

              situacional:
                Number(
                  button.form
                    .elements
                    .situacional
                    .value
                ) || 0,

              efeitoMagico:
                Boolean(
                  button.form
                    .elements
                    .efeitoMagico
                    ?.checked
                )

            })
          },

          {
            action:
              "cancelar",

            label:
              "Cancelar",

            icon:
              "fa-solid fa-xmark",

            callback: () => BREU_DIALOG_CANCEL
          }

        ],

        modal:
          true,

        rejectClose:
          false

      });


    if (
      !config
      || config === BREU_DIALOG_CANCEL
    ) {
      return;
    }


    let cd =
      null;


    let dificuldadeTexto =
      "Sem CD";


    switch (
      config.dificuldade
    ) {

      case "12":
        cd = 12;
        dificuldadeTexto = "Fácil — CD 12";
        break;

      case "17":
        cd = 17;
        dificuldadeTexto = "Média — CD 17";
        break;

      case "22":
        cd = 22;
        dificuldadeTexto = "Difícil — CD 22";
        break;

      case "personalizada":
        cd = config.cdPersonalizada;
        dificuldadeTexto = `Personalizada — CD ${cd}`;
        break;

    }


    const bonusProtecaoArcana =
      config.efeitoMagico
      && protecaoArcana
        ? bp
        : 0;


    const bonusFinal =
      bonusBase
      + bonusProtecaoArcana
      + config.situacional;


    const modo =
      _breuResolverModo(
        config.modo,
        false,
        autoDisadvantage
      );


    const die =
      modo === "vantagem"
        ? "2d20kh"
        : modo === "desvantagem"
          ? "2d20kl"
          : "1d20";


    const formula =
      bonusFinal > 0
        ? `${die} + ${bonusFinal}`
        : bonusFinal < 0
          ? `${die} - ${Math.abs(bonusFinal)}`
          : die;


    const roll =
      new Roll(
        formula
      );


    await roll.evaluate();


    const natural =
      roll.dice[0]?.total;


    let resultado =
      "";


    let classeResultado =
      "";


    if (
      natural === 20
    ) {
      resultado = "SUCESSO CRÍTICO";
      classeResultado = "critical-success";
    }

    else if (
      natural === 1
    ) {
      resultado = "FALHA CRÍTICA";
      classeResultado = "critical-failure";
    }

    else if (
      cd !== null
    ) {

      if (
        roll.total >= cd
      ) {
        resultado = "SUCESSO";
        classeResultado = "success";
      }

      else {
        resultado = "FALHA";
        classeResultado = "failure";
      }

    }


    const modoTexto = {
      normal: "Normal",
      vantagem: "Vantagem",
      desvantagem: "Desvantagem"
    }[modo] ?? "Normal";


    await publicarRolagemBreu({

      actor:
        this.actor,

      roll:
        roll,

      content:
        _breuChatCard({

          icon:
            "fa-solid fa-shield-halved",

          eyebrow:
            "Teste de Resistência",

          title:
            nome,

          chips: [
            {
              label:
                modoTexto,
              className:
                modo === "vantagem"
                  ? "is-advantage"
                  : modo === "desvantagem"
                    ? "is-disadvantage"
                    : "is-normal"
            },
            {
              label:
                dificuldadeTexto
            }
          ],

          stats: [
            {
              label:
                "Bônus",
              value:
                `${bonusFinal >= 0 ? "+" : ""}${bonusFinal}`
            },
            {
              label:
                "TR da ficha",
              value:
                `${bonusBase >= 0 ? "+" : ""}${bonusBase}`
            }
          ],

          notes: [
            ...(bonusTecnica
              ? [{
                  text:
                    `Técnica Especializada +${bonusTecnica}`
                }]
              : []),
            ...(bonusProtecaoArcana
              ? [{
                  text:
                    `Proteção Arcana +${bonusProtecaoArcana}`
                }]
              : []),
            ...(autoDisadvantage
              ? [{
                  text:
                    `Desvantagem automática: ${autoSources.join(" · ")}`,
                  className:
                    "is-warning"
                }]
              : [])
          ],

          result:
            resultado,

          resultClass:
            classeResultado

        })

    });

  }

}
