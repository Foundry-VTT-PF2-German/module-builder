import { existsSync, readFileSync } from "fs";
import { CONFIG } from "../config.js";
import { sluggify, unflattenObject } from "./helper/src/util/utilities.js";
import {
    copyDirectory,
    deleteFolderRecursive,
    parsePath,
    saveFileWithDirectories,
} from "./helper/src/util/file-handler.js";
import { xliffToJson } from "./helper/src/util/xliff-tool.js";
import { createPack } from "./helper/src/util/level-db.js";
import { readJSONFile } from "./helper/src/build/config-helper.js";

// Get the paths to the bestiary json files
const actorCompendiums = CONFIG.actorCompendiums;

// Loop through configured modules
for (const currentModule of CONFIG.modules) {
    const module = { id: currentModule.moduleId, path: currentModule.modulePath };

    buildModules(module, currentModule.dataOperations, {});
}

export function buildModules(module, dataOperations) {
    console.warn(`Building module ${module.id}`);
    deleteFolderRecursive(`${module.path}/build-data`);
    for (const dataOperation of dataOperations) {
        if (dataOperation.type === "LocalizeModulePacks") {
            buildCompendiumLocalization(module, dataOperation);
            buildActorCompendiums(module, actorCompendiums);
        }

        if (dataOperation.type === "ConvertModulePacks") {
            buildModulePacks(module, dataOperation);
            buildActorCompendiums(module, actorCompendiums);
        }

        if (dataOperation.type === "ConvertJsonToXliff") {
            buildJsonFromXliff(module, dataOperation);
        }

        if (dataOperation.type === "Build-TransferFolderContent") {
            transferFolderContent(module, dataOperation);
        }

        if (dataOperation.type === "Build-BuildActorCompendiums") {
            buildActorCompendiums(module, actorCompendiums);
        }
    }
}

function transferFolderContent(module, dataOperation) {
    for (const folder of dataOperation.folders) {
        const sourcePath = `${module.path}/${folder.source}`;
        const targetPath = `${module.path}/${folder.target}`;
        if (!existsSync(sourcePath)) {
            continue;
        }
        copyDirectory(sourcePath, targetPath);
    }
}

// Create localized data for the required actors from configured bestiaries
function buildActorCompendiums(module, actorCompendiums) {
    const actorSourcesFile = existsSync(`${module.path}/dev/actorSources.json`)
        ? `${module.path}/dev/actorSources.json`
        : `${module.path}/dev/actorSources.locked.json`;
    if (!existsSync(actorSourcesFile)) {
        return false;
    }

    const actorSources = readJSONFile(actorSourcesFile);
    for (const actorSourceKey in actorSources) {
        const actorSource = actorSources[actorSourceKey];
        if (actorCompendiums[actorSourceKey]) {
            const actorCompendiumData = readJSONFile(actorCompendiums[actorSourceKey]);
            const extractedActorData = {
                label: actorCompendiumData.label,
                entries: {},
                mapping: actorCompendiumData.mapping,
            };
            for (const actorName of actorSource) {
                extractedActorData.entries[actorName] = actorCompendiumData.entries[actorName];
            }

            // Get the json file name from the module
            const moduleFileName = parsePath(actorCompendiums[actorSourceKey]).fileName;

            // Save the required localized data to the configured destination
            saveFileWithDirectories(
                `${module.path}/build-data/compendium/actors/${actorSourceKey}/${moduleFileName}.json`,
                JSON.stringify(extractedActorData, null, 4)
            );
        }
    }
}

async function buildModulePacks(module, dataOperation) {
    for (const modulePack of dataOperation.modulePacks) {
        const fileName = `${dataOperation.sourceModuleId}.${modulePack.name}`;
        const jsonFile = `${module.path}/dev/packs/${fileName}.json`;
        const packPath = `${module.path}/build-data/${modulePack.path}`;
        if (!existsSync(jsonFile)) {
            console.warn(` - JSON file file ${jsonFile} missing`);
            continue;
        }
        const jsonData = readJSONFile(jsonFile);

        if (jsonData.packData) {
            const htmlPath = `${module.path}/dev/journals/source/${fileName}`;
            if (jsonData.packType === "adventures") {
                mergeAdventuresPackJournals(jsonData.packData, htmlPath);
            } else {
                mergePackJournals(jsonData.packData, htmlPath);
            }
        }

        deleteFolderRecursive(packPath);
        await createPack(packPath, jsonData.packType, jsonData.packData, jsonData.folders);
    }
}

function buildJsonFromXliff(module, dataOperation) {
    for (const jsonFile of dataOperation.jsonFiles) {
        const fileName = jsonFile.changeName ? jsonFile.changeName : parsePath(jsonFile.filePath).fileName;
        const xliffPath = `${module.path}/dev/${fileName}.xliff`;
        const jsonPath = `${module.path}/build-data/${jsonFile.buildPath}/${fileName}.json`;
        if (!existsSync(xliffPath)) {
            console.warn(` - JSON file file ${xliffPath} missing`);
            continue;
        }
        const jsonData = unflattenObject(xliffToJson(readFileSync(xliffPath, "utf-8")));
        saveFileWithDirectories(jsonPath, JSON.stringify(jsonData, null, 4));
    }
}

function buildCompendiumLocalization(module, dataOperation) {
    for (const modulePack of dataOperation.modulePacks) {
        const fileName = `${dataOperation.sourceModuleId}.${modulePack.name}`;
        const xliffFile = `${module.path}/dev/${fileName}.xliff`;
        const jsonFile = `${module.path}/build-data/compendium/${fileName}.json`;
        if (!existsSync(xliffFile)) {
            console.warn(` - Xliff file ${xliffFile} missing`);
            continue;
        }

        const jsonData = unflattenObject(xliffToJson(readFileSync(xliffFile, "utf-8")));
        if (jsonData.entries) {
            const htmlPath = `${module.path}/dev/journals/target/${fileName}`;
            mergeLocalizedCompendiumJournals(jsonData, htmlPath);
        }
        saveFileWithDirectories(jsonFile, JSON.stringify(jsonData, null, 4));
    }

    if (dataOperation.packsFolders) {
        const packsFoldersData = { entries: dataOperation.packsFolders };
        const packsFoldersFile = `${module.path}/build-data/compendium/${dataOperation.sourceModuleId}._packs-folders.json`;
        saveFileWithDirectories(packsFoldersFile, JSON.stringify(packsFoldersData, null, 4));
    }
}

function mergeLocalizedCompendiumJournals(jsonData, htmlPath) {
    for (const entryKey in jsonData.entries) {
        const entry = jsonData.entries[entryKey];
        const htmlFiles = `${htmlPath}/${sluggify(entryKey)}`;
        if (entry.journal) {
            if (!existsSync(htmlFiles)) {
                console.warn(` - Path to html files ${htmlFiles} missing`);
                continue;
            }

            for (const journalKey in entry.journal) {
                const journal = entry.journal[journalKey];
                if (!journal.pages) {
                    continue;
                }
                mergeLocalizedJournal(journal, htmlFiles);
            }
        }
    }
}

function mergeAdventuresPackJournals(jsonData, htmlPath) {
    for (const packEntry of jsonData) {
        const htmlFiles = `${htmlPath}/${sluggify(packEntry.name)}`;
        if (!existsSync(htmlFiles)) {
            console.warn(` - Path to html files ${htmlFiles} missing`);
            continue;
        }
        if (packEntry.journal) {
            for (const journal of packEntry.journal) {
                if (!journal.pages) {
                    continue;
                }
                mergePackJournal(journal, htmlFiles);
            }
        }
    }
}

function mergePackJournals(journals, htmlPath) {
    for (const journal of journals) {
        if (!journal.pages) {
            continue;
        }
        const htmlFiles = `${htmlPath}/${sluggify(journal.name)}`;
        if (!existsSync(htmlFiles)) {
            console.warn(` - Path to html files ${htmlFiles} missing`);
            continue;
        }
        mergePackJournal(journal, htmlFiles);
    }
}

function mergePackJournal(journal, htmlFiles) {
    for (const page of journal.pages) {
        if (page._id.startsWith("no-text-")) {
            page._id = page._id.replace("no-text-", "");
            continue;
        }

        const htmlFile = `${htmlFiles}/${page._id}-${sluggify(page.name)}.html`;
        if (!existsSync(htmlFile)) {
            console.warn(` - Localized journal file ${htmlFile} missing`);
            continue;
        }
        page.text.content = unifyHTML(readFileSync(htmlFile, "utf8"));
    }
}

function mergeLocalizedJournal(journal, htmlFiles) {
    for (const pageKey in journal.pages) {
        let pageEntries = journal.pages[pageKey];
        let deleteId = false;
        if (!Array.isArray(pageEntries)) {
            pageEntries = Array(pageEntries);
            deleteId = true;
        }
        for (const page of pageEntries) {
            if (page.id) {
                if (page.id.startsWith("no-text-")) {
                    page.id = page.id.replace("no-text-", "");
                } else {
                    const htmlFile = `${htmlFiles}/${page.id}-${sluggify(pageKey)}.html`;
                    if (existsSync(htmlFile)) {
                        page.text = unifyHTML(readFileSync(htmlFile, "utf8"));
                    } else {
                        console.warn(` - Localized journal file ${htmlFile} missing`);
                    }
                }
                if (deleteId) {
                    delete page.id;
                }
            }
            if (pageEntries.length === 1) {
                pageEntries = pageEntries[0];
            }
        }
    }
}

function unifyHTML(str) {
    return str
        .replace(/(\r\n|\n|\r)/g, "\n")
        .replace(/\n\n/g, "\n")
        .replace(/(^\n|\n$)/g, "");
}
