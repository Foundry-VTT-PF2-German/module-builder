export const CONFIG = {
    zipURL: "https://github.com/foundryvtt/pf2e/releases/latest/download/json-assets.zip",
    bestiaryPaths: {
        "pathfinder-bestiary":
            "path/to/specified/bestiary/pf2e.pathfinder-bestiary.json",
        "pathfinder-bestiary-2":
            "path/to/specified/bestiary/pf2e.pathfinder-bestiary-2.json",
        "pathfinder-bestiary-3":
            "path/to/specified/bestiary/pf2e.pathfinder-bestiary-3.json",
    },
    modules: [
        {
            moduleId: "theModuleId",
            modulePath: "path/to/module",
            adventurePacks: [{ name: "packName", path: "path/to/pack" }],
            xliffBackup: false,
            savePaths: {
                bestiarySources:
                    "path/to/save/bestiary/overview/bestiarySources.json",
                extractedJournals:
                    "path/to/extract/journals/as/html",
                localizedJournals:
                    "path/to/get/localized/journals/as/html",
                xliffTranslation:
                    "path/to/xliff/localization/files",
                moduleCompendium:
                    "path/to/save/localized/compendium",
                bestiaryCompendiums:
                    "path/to/save/localized/bestiary/compendiums",
            },
        }
    ],
    actorDatabase: {
        fields: ["name"],
        packs: {
            "pathfinder-bestiary": "pf2e.pathfinder-bestiary",
            "pathfinder-bestiary-2": "pf2e.pathfinder-bestiary-2",
            "pathfinder-bestiary-3": "pf2e.pathfinder-bestiary-3",
        },
    },
    itemDatabase: {
        fields: ["name"],
        packs: {
            equipment: "pf2e.equipment-srd",
        },
    },
};
