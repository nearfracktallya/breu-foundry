// BREU — MENSAGENS DE CHAT
// Implementação independente baseada apenas nas APIs públicas
// do Foundry VTT v14: ChatMessage, Roll.render e hooks.


const BREU_LOGO_PATH =
  "systems/breu/assets/logo-breu.png";


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function formatClock(timestamp = Date.now()) {

  try {

    return new Intl.DateTimeFormat(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(
      new Date(timestamp)
    );

  }

  catch {

    return "";

  }

}


function resolveMessageActor(message) {

  if (message?.speakerActor) {
    return message.speakerActor;
  }


  const actorId =
    message?.speaker?.actor;


  if (!actorId) {
    return null;
  }


  return game.actors.get(actorId) ?? null;

}


function identityData({
  actor = null,
  author = game.user
} = {}) {

  const userName =
    author?.name
    || "Jogador";


  const actorName =
    actor?.name
    || userName
    || "BREU";


  const portrait =
    actor?.img
    || author?.avatar
    || "icons/svg/mystery-man.svg";


  const role =
    author?.isGM
      ? "Mestre"
      : "Jogador";


  return {
    userName,
    actorName,
    portrait,
    role
  };

}


function renderMessageFrame({
  actor = null,
  author = game.user,
  timestamp = Date.now(),
  body = "",
  narrative = false
} = {}) {

  const identity =
    identityData({
      actor,
      author
    });


  return `
    <section
      class="breu-message-frame ${narrative ? "is-narrative" : ""}"
    >

      <header class="breu-message-meta">

        <span class="breu-message-user">
          ${escapeHTML(identity.userName)}
        </span>

        <div class="breu-message-meta-actions">

          <time class="breu-message-time">
            ${escapeHTML(formatClock(timestamp))}
          </time>

          <button
            type="button"
            class="breu-message-delete"
            data-breu-message-delete
            title="Excluir mensagem"
            aria-label="Excluir mensagem"
          >
            <i
              class="fa-solid fa-trash"
              aria-hidden="true"
            ></i>
          </button>

        </div>

      </header>


      <div class="breu-message-identity">

        <img
          class="breu-message-avatar"
          src="${escapeHTML(identity.portrait)}"
          alt="${escapeHTML(identity.actorName)}"
        >

        <div class="breu-message-person">

          <strong class="breu-message-person-name">
            ${escapeHTML(identity.actorName)}
          </strong>

          <span class="breu-message-person-user">
            ${escapeHTML(identity.role)}
            ·
            ${escapeHTML(identity.userName)}
          </span>

        </div>

        <img
          class="breu-message-brand"
          src="${BREU_LOGO_PATH}"
          alt=""
          aria-hidden="true"
        >

      </div>


      <div class="breu-message-body">
        ${body}
      </div>

    </section>
  `;

}


function buildChatData({
  actor = null,
  speaker = null,
  content = ""
} = {}) {

  const chatData = {

    speaker:
      speaker
      ?? ChatMessage.getSpeaker({
        actor
      }),

    content

  };


  return ChatMessage.applyMode(
    chatData
  );

}


export async function publicarMensagemBreu({
  actor = null,
  content = "",
  speaker = null
} = {}) {

  const framedContent =
    renderMessageFrame({
      actor,
      author: game.user,
      timestamp: Date.now(),
      body: content
    });


  return ChatMessage.create(
    buildChatData({
      actor,
      speaker,
      content: framedContent
    })
  );

}


export async function publicarRolagemBreu({
  actor = null,
  roll = null,
  content = "",
  speaker = null
} = {}) {

  if (!roll) {

    return publicarMensagemBreu({
      actor,
      content,
      speaker
    });

  }


  const rollHTML =
    await roll.render();


  const framedContent =
    renderMessageFrame({
      actor,
      author: game.user,
      timestamp: Date.now(),
      body: `
        ${content}

        <div class="breu-message-roll">
          ${rollHTML}
        </div>
      `
    });


  return ChatMessage.create(
    buildChatData({
      actor,
      speaker,
      content: framedContent
    })
  );

}


function prepareRenderedMessage(
  message,
  html
) {

  if (
    !html
    || typeof html.querySelector !== "function"
  ) {
    return;
  }


  let frame =
    html.querySelector(
      ".breu-message-frame"
    );


  if (!frame) {

    const content =
      html.querySelector(
        ".message-content"
      );


    if (content) {

      const originalHTML =
        content.innerHTML;


      content.innerHTML =
        renderMessageFrame({
          actor:
            resolveMessageActor(message),
          author:
            message.author ?? game.user,
          timestamp:
            message.timestamp ?? Date.now(),
          body:
            originalHTML,
          narrative:
            true
        });


      frame =
        content.querySelector(
          ".breu-message-frame"
        );

    }

  }


  if (!frame) {
    return;
  }


  html.classList.add(
    "breu-message-host"
  );


  const deleteButton =
    frame.querySelector(
      "[data-breu-message-delete]"
    );


  if (!deleteButton) {
    return;
  }


  const canDelete =
    Boolean(
      game.user
      && message.canUserModify(
        game.user,
        "delete"
      )
    );


  deleteButton.hidden =
    !canDelete;


  if (!canDelete) {
    return;
  }


  deleteButton.addEventListener(
    "click",
    async event => {

      event.preventDefault();
      event.stopPropagation();

      await message.delete();

    },
    {
      once: true
    }
  );

}


export function registrarChatBreu() {

  Hooks.on(
    "renderChatMessageHTML",
    (
      message,
      html
    ) => {

      prepareRenderedMessage(
        message,
        html
      );

    }
  );

}
