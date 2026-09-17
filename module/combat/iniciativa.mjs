import {
  publicarMensagemBreu
} from "../chat/chat.mjs";


const {
  DialogV2
} = foundry.applications.api;


const BREU_DIALOG_CANCEL =
  "__BREU_DIALOG_CANCEL__";


// Configuração

const SOCKET_CHANNEL =
  "system.breu";

const FLAG_KEY =
  "iniciativa";


// Registro

export function registrarIniciativaBreu() {


  Hooks.once(
    "ready",
    () => {

      registrarSocket();

    }
  );


  Hooks.on(
    "renderCombatTracker",
    (
      application,
      element
    ) => {

      adicionarPainelIniciativa(
        application,
        element
      );

    }
  );


  Hooks.on(
    "updateCombat",
    async (
      combat,
      changes
    ) => {

      if (
        !ehGMPrincipal()
      ) {

        return;

      }


      if (
        !Object.prototype.hasOwnProperty.call(
          changes,
          "round"
        )
      ) {

        return;

      }


      const rodada =
        Number(combat.round) || 0;


      if (
        rodada <= 0
      ) {

        return;

      }


      const estado =
        obterEstado(
          combat
        );


      if (
        estado.round === rodada
      ) {

        return;

      }


      await resetarEstado(
        combat,
        rodada
      );

    }
  );

}


// Socket

function registrarSocket() {

  game.socket.on(
    SOCKET_CHANNEL,
    async payload => {

      if (
        !payload
        || payload.tipo !== "iniciativaBreu"
      ) {

        return;

      }


      if (
        !ehGMPrincipal()
      ) {

        return;

      }


      await receberRolagemJogador(
        payload
      );

    }
  );

}


// Painel do combat tracker

function adicionarPainelIniciativa(
  application,
  element
) {


  element
    .querySelector(
      ".breu-initiative-panel"
    )
    ?.remove();


  const combat =
    game.combat;


  const panel =
    document.createElement(
      "section"
    );


  panel.className =
    "breu-initiative-panel";


  // Sem encontro

  if (
    !combat
  ) {

    panel.innerHTML =
      `
        <div class="breu-initiative-panel-header">

          <div class="breu-initiative-panel-copy">

            <strong>
              Iniciativa BREU
            </strong>

            <span>
              Nenhum encontro ativo
            </span>

          </div>

        </div>

        <div class="breu-initiative-tracker-result">
          Crie um encontro para utilizar a iniciativa.
        </div>
      `;


    inserirPainel(
      element,
      panel
    );


    return;

  }


  // Estado atual

  const rodada =
    Number(combat.round) || 0;


  const estado =
    obterEstado(
      combat
    );


  const aventureiros =
    estado.round === rodada
      ? estado.aventureiros
      : null;


  const pnjs =
    estado.round === rodada
      ? estado.pnjs
      : null;


  const resultado =
    calcularResultado(
      aventureiros,
      pnjs
    );


  const iniciado =
    combat.started
    && rodada > 0;


  // Html

  panel.innerHTML =
    `
      <div class="breu-initiative-panel-header">

        <div class="breu-initiative-panel-copy">

          <strong>
            Iniciativa BREU
          </strong>

          <span>
            ${
              iniciado
                ? `Rodada ${rodada}`
                : "Encontro não iniciado"
            }
          </span>

        </div>


        ${
          game.user.isGM
            ? `
              <button
                type="button"
                class="breu-initiative-reset"
                title="Limpar iniciativa da rodada"
              >

                <i class="fa-solid fa-rotate-left"></i>

              </button>
            `
            : ""
        }

      </div>


      <div class="breu-initiative-tracker-sides">


        ${montarLadoTracker(
          "Aventureiros",
          aventureiros
        )}


        ${montarLadoTracker(
          "PNJs",
          pnjs
        )}


      </div>


      <div
        class="breu-initiative-tracker-result ${resultado.classe}"
      >

        ${
          iniciado
            ? resultado.texto
            : "Inicie o encontro para rolar."
        }

      </div>


      <div class="breu-initiative-panel-actions">


        ${
          game.user.isGM
            ? `

              <button
                type="button"
                class="
                  breu-initiative-roll
                  breu-initiative-roll-group
                "
                ${iniciado ? "" : "disabled"}
              >

                <i class="fa-solid fa-users"></i>

                <span>
                  Grupo
                </span>

              </button>


              <button
                type="button"
                class="
                  breu-initiative-roll
                  breu-initiative-roll-npcs
                "
                ${iniciado ? "" : "disabled"}
              >

                <i class="fa-solid fa-skull"></i>

                <span>
                  PNJs
                </span>

              </button>

            `

            : `

              <button
                type="button"
                class="
                  breu-initiative-roll
                  breu-initiative-roll-group
                "
                ${iniciado ? "" : "disabled"}
              >

                <i class="fa-solid fa-dice-d6"></i>

                <span>
                  ${
                    aventureiros
                      ? "Rerrolar Grupo"
                      : "Rolar Grupo"
                  }
                </span>

              </button>

            `
        }


      </div>
    `;


  // Insere abaixo da rodada e antes da lista de combatentes

  inserirPainel(
    element,
    panel
  );


  // Grupo

  panel
    .querySelector(
      ".breu-initiative-roll-group"
    )
    ?.addEventListener(
      "click",
      async () => {

        await iniciarRolagem(
          "aventureiros"
        );

      }
    );


  // PNJs

  panel
    .querySelector(
      ".breu-initiative-roll-npcs"
    )
    ?.addEventListener(
      "click",
      async () => {

        await iniciarRolagem(
          "pnjs"
        );

      }
    );


  // Reset

  panel
    .querySelector(
      ".breu-initiative-reset"
    )
    ?.addEventListener(
      "click",
      async () => {

        const combatAtual =
          game.combat;


        if (
          !combatAtual
        ) {

          return;

        }


        await resetarEstado(
          combatAtual,
          Number(combatAtual.round) || 0
        );

      }
    );

}


// Posição do painel

function inserirPainel(
  element,
  panel
) {

  /*
   * Primeiro tenta usar o cabeçalho nativo do Combat Tracker.
   * É nele que o Foundry exibe a rodada atual.
   */
  const header =
    element.querySelector(
      "[data-application-part='header'], .combat-tracker-header"
    );


  if (
    header
  ) {

    header.insertAdjacentElement(
      "afterend",
      panel
    );

    return;

  }


  /*
   * Fallback:
   * procura visualmente o texto "Round X" ou "Rodada X".
   */
  const round =
    Array
      .from(
        element.querySelectorAll(
          "h1, h2, h3, h4, span, div"
        )
      )
      .find(
        node => {

          const texto =
            node.textContent
              ?.trim()
              ?.toLowerCase();


          return (
            /^round\s+\d+$/.test(texto)
            || /^rodada\s+\d+$/.test(texto)
          );

        }
      );


  if (
    round
  ) {

    const roundHeader =
      round.closest(
        "[data-application-part='header'], .combat-tracker-header, header"
      );


    (
      roundHeader
      ?? round
    )
      .insertAdjacentElement(
        "afterend",
        panel
      );


    return;

  }


  /*
   * Se não encontrou o cabeçalho, coloca antes
   * da lista de combatentes.
   */
  const tracker =
    element.querySelector(
      "[data-application-part='tracker'], #combat-tracker, .combat-tracker"
    );


  if (
    tracker
  ) {

    tracker.insertAdjacentElement(
      "beforebegin",
      panel
    );

    return;

  }


  /*
   * Último fallback.
   */
  element.prepend(
    panel
  );

}


// Iniciar rolagem

async function iniciarRolagem(
  lado
) {

  const combat =
    game.combat;


  if (
    !combat
  ) {

    ui.notifications.warn(
      "BREU | Nenhum encontro ativo."
    );

    return;

  }


  if (
    !combat.started
    || Number(combat.round) <= 0
  ) {

    ui.notifications.warn(
      "BREU | Inicie o encontro primeiro."
    );

    return;

  }


  if (
    !game.user.isGM
    && lado !== "aventureiros"
  ) {

    return;

  }


  const modificador =
    await pedirModificador(
      lado
    );


  if (
    modificador === null
    || modificador === undefined
    || modificador === BREU_DIALOG_CANCEL
  ) {

    return;

  }


  const roll =
    new Roll(
      formulaIniciativa(
        modificador
      )
    );


  await roll.evaluate();


  const dado =
    obterResultadoDado(
      roll
    );


  const total =
    Number(
      roll.total
    ) || 0;


  const resultado = {

    lado,

    dado,

    modificador,

    total,

    usuarioId:
      game.user.id,

    usuarioNome:
      game.user.name,

    rollId:
      foundry.utils.randomID(12)

  };


  // GM

  if (
    game.user.isGM
  ) {

    await registrarRolagem(
      combat,
      resultado
    );


    return;

  }


  // Jogador

  if (
    !existeGMAtiva()
  ) {

    ui.notifications.error(
      "BREU | Nenhuma mestra ativa para registrar a iniciativa."
    );

    return;

  }


  game.socket.emit(
    SOCKET_CHANNEL,
    {

      tipo:
        "iniciativaBreu",

      acao:
        "registrarRolagem",

      combatId:
        combat.id,

      round:
        Number(combat.round) || 0,

      resultado

    }
  );


  ui.notifications.info(
    `BREU | Iniciativa dos Aventureiros: ${total}.`
  );

}


// Modificador

async function pedirModificador(
  lado
) {

  const nome =
    lado === "aventureiros"
      ? "Aventureiros"
      : "PNJs";


  return DialogV2.wait({

    window: {
      title:
        `Iniciativa — ${nome}`
    },

    content:
      `
        <div class="breu-initiative-dialog">

          <p>
            Role
            <strong>1d6</strong>
            para o lado.

            Adicione abaixo qualquer modificador
            determinado pela ficção.
          </p>


          <label class="breu-initiative-modifier">

            <span>
              Modificador
            </span>

            <input
              type="number"
              name="modificador"
              value="0"
              step="1"
            >

          </label>


          <div class="breu-initiative-hint">

            <i class="fa-solid fa-circle-info"></i>

            <span>
              Terreno, iluminação, prontidão,
              magia ou outras circunstâncias podem
              alterar a iniciativa.
            </span>

          </div>

        </div>
      `,

    buttons: [

      {

        action:
          "rolar",

        label:
          `Rolar ${nome}`,

        icon:
          "fa-solid fa-dice-d6",

        default:
          true,

        callback:
          (
            event,
            button
          ) =>
            normalizarModificador(
              button.form.elements.modificador.value
            )

      },

      {

        action:
          "cancelar",

        label:
          "Cancelar",

        icon:
          "fa-solid fa-xmark",

        callback:
          () => BREU_DIALOG_CANCEL

      }

    ],

    modal:
      true,

    rejectClose:
      false

  });

}


// Recebe rolagem do jogador

async function receberRolagemJogador(
  payload
) {

  if (
    payload.acao
    !== "registrarRolagem"
  ) {

    return;

  }


  const combat =
    game.combats.get(
      payload.combatId
    );


  if (
    !combat
    || !combat.started
  ) {

    return;

  }


  const rodada =
    Number(combat.round) || 0;


  if (
    Number(payload.round)
    !== rodada
  ) {

    return;

  }


  const resultado =
    payload.resultado;


  if (
    !resultado
    || resultado.lado !== "aventureiros"
  ) {

    return;

  }


  const dado =
    Number(
      resultado.dado
    );


  const modificador =
    normalizarModificador(
      resultado.modificador
    );


  const total =
    Number(
      resultado.total
    );


  if (
    !Number.isInteger(dado)
    || dado < 1
    || dado > 6
  ) {

    return;

  }


  if (
    total !== dado + modificador
  ) {

    return;

  }


  const usuario =
    game.users.get(
      resultado.usuarioId
    );


  await registrarRolagem(
    combat,
    {

      lado:
        "aventureiros",

      dado,

      modificador,

      total,

      usuarioId:
        resultado.usuarioId,

      usuarioNome:
        usuario?.name
        ?? resultado.usuarioNome
        ?? "Jogador",

      rollId:
        resultado.rollId
        ?? foundry.utils.randomID(12)

    }
  );

}


// Registra no combate

async function registrarRolagem(
  combat,
  resultado
) {

  const rodada =
    Number(combat.round) || 0;


  const anterior =
    obterEstado(
      combat
    );


  const estado = {

    round:
      rodada,

    aventureiros:
      anterior.round === rodada
        ? anterior.aventureiros
        : null,

    pnjs:
      anterior.round === rodada
        ? anterior.pnjs
        : null,

    anunciado:
      anterior.round === rodada
        ? anterior.anunciado
        : null

  };


  estado[
    resultado.lado
  ] = resultado;


  estado.anunciado =
    null;


  await combat.setFlag(
    game.system.id,
    FLAG_KEY,
    estado
  );


  await anunciarSeCompleto(
    combat
  );

}


// Anúncio

async function anunciarSeCompleto(
  combat
) {

  if (
    !ehGMPrincipal()
  ) {

    return;

  }


  const estado =
    obterEstado(
      combat
    );


  if (
    !estado.aventureiros
    || !estado.pnjs
  ) {

    return;

  }


  const assinatura =
    [
      estado.round,
      estado.aventureiros.rollId,
      estado.pnjs.rollId
    ].join(
      ":"
    );


  if (
    estado.anunciado
    === assinatura
  ) {

    return;

  }


  const resultado =
    calcularResultado(
      estado.aventureiros,
      estado.pnjs
    );


  await publicarMensagemBreu({

    actor:
      null,

    speaker:
      ChatMessage.getSpeaker(),

    content:
      montarCardResultado(
        estado,
        resultado
      )

  });


  await combat.setFlag(
    game.system.id,
    FLAG_KEY,
    {

      ...estado,

      anunciado:
        assinatura

    }
  );

}


// Card

function montarCardResultado(
  estado,
  resultado
) {

  return `
    <div class="breu-chat-card breu-chat-card--initiative">

      <header class="breu-chat-card__header">

        <span class="breu-chat-card__eyebrow">
          <i class="fa-solid fa-bolt"></i>
          Rodada ${estado.round}
        </span>

        <strong class="breu-chat-card__title">
          Iniciativa BREU
        </strong>

      </header>

      <div class="breu-chat-initiative-sides">

        ${montarCardLado(
          "Aventureiros",
          estado.aventureiros
        )}

        ${montarCardLado(
          "PNJs",
          estado.pnjs
        )}

      </div>

      <div class="breu-chat-card__result initiative-${resultado.classe}">
        ${resultado.texto}
      </div>

    </div>
  `;

}


function montarCardLado(
  nome,
  resultado
) {

  return `
    <div class="breu-chat-initiative-side">

      <span>
        ${nome}
      </span>

      <strong>
        ${resultado.total}
      </strong>

      <small>
        d6 ${resultado.dado}
        ·
        ${textoModificador(resultado.modificador)}
      </small>

    </div>
  `;

}


// Lado no tracker

function montarLadoTracker(
  nome,
  resultado
) {

  if (
    !resultado
  ) {

    return `
      <div class="breu-initiative-tracker-side">

        <span>
          ${nome}
        </span>

        <strong>
          —
        </strong>

        <small>
          aguardando
        </small>

      </div>
    `;

  }


  return `
    <div class="breu-initiative-tracker-side">

      <span>
        ${nome}
      </span>

      <strong>
        ${resultado.total}
      </strong>

      <small>
        ${escapeHTML(
          resultado.usuarioNome ?? ""
        )}
      </small>

    </div>
  `;

}


// Resultado

function calcularResultado(
  aventureiros,
  pnjs
) {

  if (
    !aventureiros
    || !pnjs
  ) {

    return {

      texto:
        "Aguardando os dois lados.",

      classe:
        "waiting"

    };

  }


  if (
    aventureiros.total
    > pnjs.total
  ) {

    return {

      texto:
        "AVENTUREIROS AGEM PRIMEIRO",

      classe:
        "players"

    };

  }


  if (
    pnjs.total
    > aventureiros.total
  ) {

    return {

      texto:
        "PNJs AGEM PRIMEIRO",

      classe:
        "npcs"

    };

  }


  return {

    texto:
      "AS PARTES AGEM SIMULTANEAMENTE",

    classe:
      "tie"

  };

}


// Estado

function obterEstado(
  combat
) {

  const salvo =
    combat?.getFlag(
      game.system.id,
      FLAG_KEY
    );


  if (
    !salvo
    || typeof salvo !== "object"
  ) {

    return {

      round:
        Number(combat?.round) || 0,

      aventureiros:
        null,

      pnjs:
        null,

      anunciado:
        null

    };

  }


  return {

    round:
      Number(salvo.round) || 0,

    aventureiros:
      salvo.aventureiros ?? null,

    pnjs:
      salvo.pnjs ?? null,

    anunciado:
      salvo.anunciado ?? null

  };

}


async function resetarEstado(
  combat,
  rodada
) {

  if (
    !game.user.isGM
  ) {

    return;

  }


  await combat.setFlag(
    game.system.id,
    FLAG_KEY,
    {

      round:
        Number(rodada) || 0,

      aventureiros:
        null,

      pnjs:
        null,

      anunciado:
        null

    }
  );

}


// GM principal

function existeGMAtiva() {

  return game.users.some(
    usuario =>
      usuario.isGM
      && usuario.active
  );

}


function ehGMPrincipal() {

  if (
    !game.user.isGM
  ) {

    return false;

  }


  const gms =
    game.users
      .filter(
        usuario =>
          usuario.isGM
          && usuario.active
      )
      .sort(
        (
          a,
          b
        ) =>
          String(a.id)
            .localeCompare(
              String(b.id)
            )
      );


  return (
    gms[0]?.id
    === game.user.id
  );

}


// Rolagem

function normalizarModificador(
  valor
) {

  const numero =
    Number(valor);


  if (
    !Number.isFinite(numero)
  ) {

    return 0;

  }


  return Math.trunc(
    numero
  );

}


function formulaIniciativa(
  modificador
) {

  if (
    modificador > 0
  ) {

    return `1d6 + ${modificador}`;

  }


  if (
    modificador < 0
  ) {

    return `1d6 - ${Math.abs(modificador)}`;

  }


  return "1d6";

}


function obterResultadoDado(
  roll
) {

  const resultado =
    roll.dice?.[0]
      ?.results?.[0]
      ?.result;


  if (
    Number.isFinite(
      Number(resultado)
    )
  ) {

    return Number(
      resultado
    );

  }


  return Number(
    roll.dice?.[0]?.total
  ) || 0;

}


function textoModificador(
  modificador
) {

  if (
    modificador === 0
  ) {

    return "sem modificador";

  }


  return modificador > 0
    ? `+${modificador}`
    : `${modificador}`;

}


// HTML

function escapeHTML(
  texto
) {

  return String(
    texto ?? ""
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