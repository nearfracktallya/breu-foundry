import {
  publicarMensagemBreu,
  publicarRolagemBreu
} from "../chat/chat.mjs";


const {
  ActorSheetV2
} = foundry.applications.sheets;


const {
  HandlebarsApplicationMixin,
  DialogV2
} = foundry.applications.api;

const BREU_DIALOG_CANCEL =
  "__BREU_DIALOG_CANCEL__";


function _breuNpcEscapeHTML(text) {

  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function _breuNpcChatCard({
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

  const chipsHTML =
    chips
      .filter(chip => chip?.label)
      .map(
        chip => `
          <span class="breu-chat-chip ${chip.className ?? ""}">
            ${_breuNpcEscapeHTML(chip.label)}
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
            <span>${_breuNpcEscapeHTML(stat.label)}</span>
            <strong>${_breuNpcEscapeHTML(stat.value ?? "—")}</strong>
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
            ${_breuNpcEscapeHTML(note.text)}
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
            <span>${_breuNpcEscapeHTML(detail.label)}</span>
            <strong>${_breuNpcEscapeHTML(detail.value)}</strong>
          </div>
        `
      )
      .join("");


  return `
    <div class="breu-chat-card">

      <header class="breu-chat-card__header">

        <span class="breu-chat-card__eyebrow">
          <i class="${icon}"></i>
          ${_breuNpcEscapeHTML(eyebrow)}
        </span>

        <strong class="breu-chat-card__title">
          ${_breuNpcEscapeHTML(title)}
        </strong>

      </header>

      ${
        chipsHTML
          ? `<div class="breu-chat-card__chips">${chipsHTML}</div>`
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
              ${_breuNpcEscapeHTML(result)}
            </div>
          `
          : ""
      }

    </div>
  `;

}


export class BreuNpcSheet
  extends HandlebarsApplicationMixin(ActorSheetV2) {


  static DEFAULT_OPTIONS = {

    classes: [
      "breu",
      "actor-sheet",
      "npc-sheet"
    ],

    position: {
      width: 780,
      height: 740
    },

    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },

    window: {
      icon: "fa-solid fa-dragon",
      resizable: true
    }

  };


  static PARTS = {

    principal: {
      template:
        "systems/breu/templates/actors/npc-sheet.hbs"
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


    this._activeTab ??=
      "criatura";


    context.tabs = {

      criatura:
        this._activeTab === "criatura",

      habilidades:
        this._activeTab === "habilidades",

      magias:
        this._activeTab === "magias",

      criacao:
        this._activeTab === "criacao"

    };


    // Ataques

    context.ataques =
      ["a1", "a2", "a3", "a4"]
        .map(
          (
            key,
            index
          ) => ({

            key,

            numero:
              index + 1,

            ...this.actor.system.ataques[key]

          })
        );


    // Magias

    const magias =
      this.actor.items

        .filter(
          item =>
            item.type === "magia"
        )

        .sort(
          (
            a,
            b
          ) => {

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
                circuloA
                - circuloB
              );

            }


            return a.name.localeCompare(
              b.name
            );

          }
        );


    context.circulosMagia =
      [1, 2, 3, 4, 5]
        .map(
          circulo => {

            const key =
              `c${circulo}`;


            const espaco =
              this.actor.system
                .magiaDados
                ?.espacos
                ?.[key]
              ?? {
                value: 0,
                max: 0,
                gasto: 0
              };


            return {

              circulo,

              key,

              value:
                espaco.value,

              max:
                espaco.max,

              magias:
                magias

                  .filter(
                    item =>
                      (
                        Number(
                          item.system.circulo
                        ) || 1
                      ) === circulo
                  )

                  .map(
                    item => ({

                      id:
                        item.id,

                      name:
                        item.name,

                      img:
                        item.img,

                      tipo:
                        item.system.tipo,

                      tipoLabel:
                        item.system.tipo === "milagre"
                          ? "Milagre"
                          : "Feitiço",

                      tempo:
                        item.system.tempo,

                      alcance:
                        item.system.alcance,

                      duracao:
                        item.system.duracao,

                      custo:
                        item.system.custo

                    })
                  )

            };

          }
        );


    context.totalMagias =
      magias.length;


    return context;

  }


  // Render

  async _onRender(
    context,
    options
  ) {

    await super._onRender(
      context,
      options
    );


    // Abas

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-npc-tab-button"
      )
    ) {

      button.addEventListener(
        "click",
        event => {

          event.preventDefault();


          const tab =
            event.currentTarget
              .dataset
              .tab;


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
              ".breu-npc-tab-button"
            )
          ) {

            const active =
              tabButton.dataset.tab
              === tab;


            tabButton.classList.toggle(
              "is-active",
              active
            );


            tabButton.setAttribute(
              "aria-selected",
              active
                ? "true"
                : "false"
            );

          }


          for (
            const panel
            of this.element.querySelectorAll(
              ".breu-npc-tab-panel"
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
        ".breu-npc-tr-roll"
      )
    ) {

      button.addEventListener(
        "click",
        event =>
          this._rollResistance(
            event.currentTarget
              .dataset
              .attribute
          )
      );

    }


    // Ataque

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-npc-attack-roll"
      )
    ) {

      button.addEventListener(
        "click",
        event =>
          this._rollAttack(
            event.currentTarget
              .dataset
              .attack
          )
      );

    }


    // Dano

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-npc-damage-roll"
      )
    ) {

      button.addEventListener(
        "click",
        event =>
          this._rollDamage(
            event.currentTarget
              .dataset
              .attack
          )
      );

    }


    // Moral

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-npc-moral-roll"
      )
    ) {

      button.addEventListener(
        "click",
        () =>
          this._rollMoral()
      );

    }


    // Nova magia

    this.element
      .querySelector(
        ".breu-npc-magic-create"
      )
      ?.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          const [item] =
            await this.actor
              .createEmbeddedDocuments(
                "Item",
                [{
                  name:
                    "Nova Magia",

                  type:
                    "magia"
                }]
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


    // Abrir magia

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-npc-magic-open"
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


    // Excluir magia

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-npc-magic-delete"
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
            !itemId
          ) {
            return;
          }


          await this.actor
            .deleteEmbeddedDocuments(
              "Item",
              [itemId]
            );

        }
      );

    }


    // Conjurar magia

    for (
      const button
      of this.element.querySelectorAll(
        ".breu-npc-magic-cast"
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


    // Restaurar espaços

    this.element
      .querySelector(
        ".breu-npc-magic-restore"
      )
      ?.addEventListener(
        "click",
        async event => {

          event.preventDefault();


          await this._restoreMagicSlots();

        }
      );

  }


  // Tr

  async _rollResistance(
    atributo
  ) {

    if (
      !["pod", "ref", "von"]
        .includes(atributo)
    ) {
      return;
    }


    const bonus =
      Number(
        this.actor.system
          .tr[atributo]
      ) || 0;


    await this._rollD20(
      `TR — ${atributo.toUpperCase()}`,
      bonus
    );

  }


  // Ataque

  async _rollAttack(
    key
  ) {

    if (
      !key
      || !["a1", "a2", "a3", "a4"]
        .includes(key)
    ) {

      ui.notifications.warn(
        "BREU | Não foi possível identificar esse ataque."
      );

      return;

    }


    const attack =
      this.actor.system
        .ataques[key];


    if (
      !attack
    ) {
      return;
    }


    const nome =
      String(
        attack.nome ?? ""
      ).trim()
      || `Ataque ${key.slice(1)}`;


    await this._rollD20(
      `Ataque — ${nome}`,
      Number(attack.bonus) || 0,
      attack.observacao
    );

  }


  // Dano

  async _rollDamage(
    key
  ) {

    const attack =
      this.actor.system
        .ataques[key];


    const formula =
      String(
        attack?.dano ?? ""
      ).trim();


    if (
      !formula
    ) {
      return;
    }


    const nome =
      String(
        attack?.nome ?? ""
      ).trim()
      || `Ataque ${String(key ?? "").slice(1)}`;


    try {

      const roll =
        new Roll(
          formula
        );


      await roll.evaluate();


      await publicarRolagemBreu({

        actor:
          this.actor,

        roll:
          roll,

        content:
          _breuNpcChatCard({

            icon:
              "fa-solid fa-burst",

            eyebrow:
              "Dano",

            title:
              nome,

            chips: [
              {
                label:
                  formula
              }
            ]

          })

      });

    }

    catch (
      error
    ) {

      console.error(
        "BREU | Fórmula de dano inválida.",
        {
          actor:
            this.actor.name,

          attack:
            nome,

          formula,

          error
        }
      );


      ui.notifications.error(
        `BREU | Fórmula de dano inválida em ${nome}: ${formula}`
      );

    }

  }


  // Moral

  async _rollMoral() {

    const moral =
      Number(
        this.actor.system.moral
      ) || 5;


    const modifier =
      await DialogV2.wait({

        window: {
          title:
            `Moral — ${this.actor.name}`
        },

        content:
          `
            <div class="breu-roll-dialog">

              <div class="breu-situational-modifier">

                <input
                  type="number"
                  name="situacional"
                  value="0"
                  step="1"
                >

                <span>
                  Modificador definido pela ficção.
                </span>

              </div>

            </div>
          `,

        buttons: [

          {
            action:
              "rolar",

            label:
              "Rolar Moral",

            icon:
              "fa-solid fa-dice",

            default:
              true,

            callback:
              (
                event,
                button
              ) =>
                Number(
                  button.form
                    .elements
                    .situacional
                    .value
                ) || 0
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
      modifier === null
      || modifier === undefined
      || modifier === BREU_DIALOG_CANCEL
    ) {
      return;
    }


    const formula =
      modifier > 0
        ? `2d6 + ${modifier}`
        : modifier < 0
          ? `2d6 - ${Math.abs(modifier)}`
          : "2d6";


    const roll =
      new Roll(
        formula
      );


    await roll.evaluate();


    const quebrou =
      roll.total >= moral;


    await publicarRolagemBreu({

      actor:
        this.actor,

      roll,

      content:
        _breuNpcChatCard({

          icon:
            "fa-solid fa-flag",

          eyebrow:
            "Teste de Moral",

          title:
            this.actor.name,

          chips: [
            {
              label:
                `Moral ${moral}`
            },
            {
              label:
                `Modificador ${modifier >= 0 ? "+" : ""}${modifier}`
            }
          ],

          result:
            quebrou
              ? "MORAL QUEBRADA"
              : "MANTÉM-SE FIRME",

          resultClass:
            quebrou
              ? "failure"
              : "success"

        })

    });

  }


  // Conjurar magia

  async _castMagic(
    item
  ) {

    if (
      item.type !== "magia"
    ) {
      return;
    }


    const nivelConjuracao =
      Number(
        this.actor.system.conjuracao
      ) || 0;


    if (
      nivelConjuracao <= 0
    ) {

      ui.notifications.warn(
        "BREU | Esta criatura não possui Nível de Conjuração."
      );

      return;

    }


    const circuloMagia =
      Math.min(
        Math.max(
          Number(
            item.system.circulo
          ) || 1,
          1
        ),
        5
      );


    const disponiveis =
      [];


    for (
      let circulo =
        circuloMagia;

      circulo <= 5;

      circulo++
    ) {

      const key =
        `c${circulo}`;


      const value =
        Number(
          this.actor.system
            .magia
            .espacos
            [key]
            .value
        ) || 0;


      const max =
        Number(
          this.actor.system
            .magia
            .espacos
            [key]
            .max
        ) || 0;


      if (
        value > 0
        && max > 0
      ) {

        disponiveis.push({
          circulo,
          key,
          value
        });

      }

    }


    if (
      disponiveis.length === 0
    ) {

      ui.notifications.warn(
        `BREU | Não há Espaço de Magia disponível para conjurar ${item.name}.`
      );

      return;

    }


    const options =
      disponiveis
        .map(
          espaco => `
            <option value="${espaco.circulo}">
              ${espaco.circulo}º Círculo — ${espaco.value} disponível
            </option>
          `
        )
        .join("");


    const selecionado =
      await DialogV2.wait({

        window: {
          title:
            `Conjurar — ${item.name}`
        },

        content:
          `
            <div class="breu-roll-dialog">

              <p>
                ${this._escapeHTML(item.name)}
                é uma Magia de
                <strong>
                  ${circuloMagia}º Círculo
                </strong>.
              </p>

              <label class="breu-npc-cast-slot-field">

                <span>
                  Espaço utilizado
                </span>

                <select name="circulo">
                  ${options}
                </select>

              </label>

              <div class="breu-npc-cast-summary">

                <span>
                  Conjuração
                </span>

                <strong>
                  ${nivelConjuracao}º Nível
                </strong>

                <span>
                  CD da criatura
                </span>

                <strong>
                  ${Number(this.actor.system.cd) || 0}
                </strong>

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

            callback:
              (
                event,
                button
              ) =>
                Number(
                  button.form
                    .elements
                    .circulo
                    .value
                ) || null
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
      !selecionado
      || selecionado === BREU_DIALOG_CANCEL
    ) {
      return;
    }


    const key =
      `c${selecionado}`;


    const atual =
      Number(
        this.actor.system
          .magia
          .espacos
          [key]
          .value
      ) || 0;


    if (
      atual <= 0
    ) {
      return;
    }


    await this.actor.update({

      [`system.magia.espacos.${key}.value`]:
        atual - 1

    });


    const descricao =
      this._escapeHTML(
        item.system.descricao ?? ""
      )
        .replace(
          /\n/g,
          "<br>"
        );


    await publicarMensagemBreu({

      actor:
        this.actor,

      content:
        _breuNpcChatCard({

          icon:
            "fa-solid fa-wand-magic-sparkles",

          eyebrow:
            item.system.tipo === "milagre"
              ? "Milagre"
              : "Feitiço",

          title:
            item.name,

          chips: [
            {
              label:
                `${circuloMagia}º Círculo`
            },
            {
              label:
                `Espaço gasto: ${selecionado}º`
            },
            {
              label:
                `Conjuração ${nivelConjuracao}`
            },
            {
              label:
                `CD ${Number(this.actor.system.cd) || 0}`
            }
          ],

          details: [
            {
              label:
                "Tempo",
              value:
                item.system.tempo
            },
            {
              label:
                "Alcance",
              value:
                item.system.alcance
            },
            {
              label:
                "Área",
              value:
                item.system.area
            },
            {
              label:
                "Duração",
              value:
                item.system.duracao
            },
            {
              label:
                "Custo",
              value:
                item.system.custo
            }
          ],

          description:
            descricao

        })

    });

  }


  // Restaurar espaços

  async _restoreMagicSlots() {

    const update =
      {};


    for (
      let circulo = 1;
      circulo <= 5;
      circulo++
    ) {

      const key =
        `c${circulo}`;


      const max =
        Math.max(
          Number(
            this.actor.system
              .magia
              .espacos
              [key]
              .max
          ) || 0,
          0
        );


      update[
        `system.magia.espacos.${key}.value`
      ] =
        max;

    }


    await this.actor.update(
      update
    );


    ui.notifications.info(
      `BREU | Espaços de Magia de ${this.actor.name} restaurados.`
    );

  }


  // D20

  async _rollD20(
    title,
    bonusBase,
    observation = ""
  ) {

    const config =
      await DialogV2.wait({

        window: {
          title
        },

        content:
          `
            <div class="breu-roll-dialog">

              <section class="breu-roll-section breu-roll-modes">

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
                  Bônus base:
                  ${bonusBase >= 0 ? "+" : ""}${bonusBase}
                </strong>

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

            callback:
              (
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
      !config
      || config === BREU_DIALOG_CANCEL
    ) {
      return;
    }


    const bonus =
      bonusBase
      + config.situacional;


    const die =
      config.modo === "vantagem"
        ? "2d20kh"
        : config.modo === "desvantagem"
          ? "2d20kl"
          : "1d20";


    const formula =
      bonus > 0
        ? `${die} + ${bonus}`
        : bonus < 0
          ? `${die} - ${Math.abs(bonus)}`
          : die;


    const roll =
      new Roll(
        formula
      );


    await roll.evaluate();


    const natural =
      roll.dice[0]?.total;


    const critical =
      natural === 20
        ? "SUCESSO CRÍTICO"
        : natural === 1
          ? "FALHA CRÍTICA"
          : "";


    const criticalClass =
      natural === 20
        ? "critical-success"
        : natural === 1
          ? "critical-failure"
          : "";


    const modeText =
      {
        normal: "Normal",
        vantagem: "Vantagem",
        desvantagem: "Desvantagem"
      }[config.modo]
      ?? "Normal";


    const partesTitulo =
      String(title)
        .split(" — ");


    const tipoTeste =
      partesTitulo.length > 1
        ? partesTitulo.shift()
        : "Teste";


    const nomeTeste =
      partesTitulo.length > 0
        ? partesTitulo.join(" — ")
        : title;


    await publicarRolagemBreu({

      actor:
        this.actor,

      roll,

      content:
        _breuNpcChatCard({

          icon:
            "fa-solid fa-dice-d20",

          eyebrow:
            tipoTeste,

          title:
            nomeTeste,

          chips: [
            {
              label:
                modeText,
              className:
                config.modo === "vantagem"
                  ? "is-advantage"
                  : config.modo === "desvantagem"
                    ? "is-disadvantage"
                    : "is-normal"
            }
          ],

          stats: [
            {
              label:
                "Bônus",
              value:
                `${bonus >= 0 ? "+" : ""}${bonus}`
            }
          ],

          notes:
            observation
              ? [{
                  text:
                    observation
                }]
              : [],

          result:
            critical,

          resultClass:
            criticalClass

        })

    });

  }


  // Html

  _escapeHTML(
    text
  ) {

    return String(
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
      );

  }

}
