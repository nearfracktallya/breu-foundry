import {
  BreuPersonagemData
} from "./module/data-models/personagem.mjs";

import {
  BreuNpcData
} from "./module/data-models/npc.mjs";

import {
  BreuEquipamentoData
} from "./module/data-models/equipamento.mjs";

import {
  BreuMagiaData
} from "./module/data-models/magia.mjs";

import {
  BreuPersonagemSheet
} from "./module/sheets/personagem-sheet.mjs";

import {
  BreuNpcSheet
} from "./module/sheets/npc-sheet.mjs";

import {
  BreuEquipamentoSheet
} from "./module/sheets/equipamento-sheet.mjs";

import {
  BreuMagiaSheet
} from "./module/sheets/magia-sheet.mjs";


import {
  registrarIniciativaBreu
} from "./module/combat/iniciativa.mjs";

import {
  registrarChatBreu
} from "./module/chat/chat.mjs";


// Inicialização

Hooks.once(
  "init",
  () => {
    console.log("BREU | v0.9.0-beta.1");
// Fontes breu


    CONFIG.fontDefinitions["Grenze"] = {

      editor:
        true,

      fonts: [

        {
          urls: [
            "https://raw.githubusercontent.com/Omnibus-Type/Grenze/master/fonts/ttf/Grenze-Regular.ttf"
          ],
          weight: 400,
          style: "normal"
        },

        {
          urls: [
            "https://raw.githubusercontent.com/Omnibus-Type/Grenze/master/fonts/ttf/Grenze-Medium.ttf"
          ],
          weight: 500,
          style: "normal"
        },

        {
          urls: [
            "https://raw.githubusercontent.com/Omnibus-Type/Grenze/master/fonts/ttf/Grenze-SemiBold.ttf"
          ],
          weight: 600,
          style: "normal"
        },

        {
          urls: [
            "https://raw.githubusercontent.com/Omnibus-Type/Grenze/master/fonts/ttf/Grenze-Bold.ttf"
          ],
          weight: 700,
          style: "normal"
        },

        {
          urls: [
            "https://raw.githubusercontent.com/Omnibus-Type/Grenze/master/fonts/ttf/Grenze-ExtraBold.ttf"
          ],
          weight: 800,
          style: "normal"
        },

        {
          urls: [
            "https://raw.githubusercontent.com/Omnibus-Type/Grenze/master/fonts/ttf/Grenze-Black.ttf"
          ],
          weight: 900,
          style: "normal"
        }

      ]

    };


    CONFIG.fontDefinitions["Grenze Gotisch"] = {

      editor:
        true,

      fonts: [

        {
          urls: [
            "https://raw.githubusercontent.com/Omnibus-Type/Grenze-Gotisch/master/fonts/ttf/GrenzeGotisch-Medium.ttf"
          ],
          weight: 500,
          style: "normal"
        },

        {
          urls: [
            "https://raw.githubusercontent.com/Omnibus-Type/Grenze-Gotisch/master/fonts/ttf/GrenzeGotisch-SemiBold.ttf"
          ],
          weight: 600,
          style: "normal"
        },

        {
          urls: [
            "https://raw.githubusercontent.com/Omnibus-Type/Grenze-Gotisch/master/fonts/ttf/GrenzeGotisch-Bold.ttf"
          ],
          weight: 700,
          style: "normal"
        },

        {
          urls: [
            "https://raw.githubusercontent.com/Omnibus-Type/Grenze-Gotisch/master/fonts/ttf/GrenzeGotisch-ExtraBold.ttf"
          ],
          weight: 800,
          style: "normal"
        },

        {
          urls: [
            "https://raw.githubusercontent.com/Omnibus-Type/Grenze-Gotisch/master/fonts/ttf/GrenzeGotisch-Black.ttf"
          ],
          weight: 900,
          style: "normal"
        }

      ]

    };


    CONFIG.Actor.dataModels = {

      personagem:
        BreuPersonagemData,

      npc:
        BreuNpcData

    };


    CONFIG.Item.dataModels = {

      equipamento:
        BreuEquipamentoData,

      magia:
        BreuMagiaData

    };


    const DocumentSheetConfig =
      foundry.applications.apps
        .DocumentSheetConfig;


    DocumentSheetConfig.registerSheet(

      foundry.documents.Actor,

      game.system.id,

      BreuPersonagemSheet,

      {
        types: [
          "personagem"
        ],

        makeDefault:
          true,

        label:
          "Ficha de Personagem BREU"
      }

    );


    DocumentSheetConfig.registerSheet(

      foundry.documents.Actor,

      game.system.id,

      BreuNpcSheet,

      {
        types: [
          "npc"
        ],

        makeDefault:
          true,

        label:
          "Ficha de Criatura BREU"
      }

    );


    DocumentSheetConfig.registerSheet(

      foundry.documents.Item,

      game.system.id,

      BreuEquipamentoSheet,

      {
        types: [
          "equipamento"
        ],

        makeDefault:
          true,

        label:
          "Ficha de Equipamento BREU"
      }

    );


    DocumentSheetConfig.registerSheet(

      foundry.documents.Item,

      game.system.id,

      BreuMagiaSheet,

      {
        types: [
          "magia"
        ],

        makeDefault:
          true,

        label:
          "Ficha de Magia BREU"
      }

    );


    registrarIniciativaBreu();


    registrarChatBreu();
}
);


// Ready
