import { existsSync, readFileSync } from "fs";
import { deletePropertyByPath, flattenObject, replaceProperties, sluggify } from "./helper/src/util/utilities.js";
import { buildItemDatabase, extractPack } from "./helper/src/pack-extractor/pack-extractor.js";
import { PF2_DEFAULT_MAPPING, ACTOR_REDIRECTS } from "./helper/src/pack-extractor/constants.js";
import { CONFIG } from "../config.js";
import {
    getZipContentFromURL,
    deleteFolderRecursive,
    saveFileWithDirectories,
    parsePath,
} from "./helper/src/util/file-handler.js";
import { resolvePath } from "path-value";
import { getJSONfromPack } from "./helper/src/util/level-db.js";
import { jsonToXliff, updateXliff } from "./helper/src/util/xliff-tool.js";
import { readJSONFile } from "./helper/src/build/config-helper.js";

// Fetch assets from current pf2 release and get zip contents
const packs = await getZipContentFromURL(CONFIG.zipURL);

// Initialize database
const database = {};

// Build item database in order to compare actor items with their comdendium entries
database.items = buildItemDatabase(packs, CONFIG.itemDatabase);

// Build actor database in order to connect actor id to actor name
database.actors = buildItemDatabase(packs, CONFIG.actorDatabase);

// Get list of used actor compendiums
database.actorCompendiums = Object.keys(CONFIG.actorCompendiums);

// Get list of used actor redirects
database.actorRedirects = ACTOR_REDIRECTS;

// Replace linked mappings and savePaths with actual data and build mapping database
replaceProperties(PF2_DEFAULT_MAPPING, ["subMapping"], PF2_DEFAULT_MAPPING);
database.mappings = PF2_DEFAULT_MAPPING;

// Initialize adventure actor dictionary
const adventureActorDictionary = {};

// Loop through configured modules
for (const currentModule of CONFIG.modules) {
    // Check for required parameters
    if (!checkRequiredParams(["moduleId", "modulePath", "dataOperations"], currentModule)) {
        continue;
    }

    // Process data operations for current module
    console.warn(
        `\n---------------------------------------------\nProcessing ${currentModule.moduleId}\n---------------------------------------------`
    );

    // Check if dataOperations is an array
    if (!Array.isArray(currentModule.dataOperations)) {
        console.warn(" - dataOperations parameter is not an array");
        continue;
    }

    const module = { id: currentModule.moduleId, path: currentModule.modulePath };

    await dataOperations(module, currentModule.dataOperations, database);
}

/**
 * Checks if the specified data fields within params exist in the data object
 * Creates warning messages and returns false if params are missing
 * Otherwise returns true
 *
 * @param {Array<String>} params    Array of strings containing the parameter names
 * @param {Object} data             The data object that should get checked
 * @returns                         true if all params exist, otherwise false
 */
function checkRequiredParams(params, data) {
    let check = true;
    for (const currentParam of params) {
        if (!data[currentParam]) {
            check = false;
            console.warn(` - Required parameter ${currentParam} missing in CONFIG\n`);
        }
    }
    return check;
}

export async function dataOperations(module, dataOperations, database) {
    const collectedData = {
        localizedModulePacks: [],
        convertedModulePacks: [],
        extractedJournalPages: [],
        jsonToXliff: [],
        actorSources: {},
    };

    for (const dataOperation of dataOperations) {
        // Check for required parameters
        if (!checkRequiredParams(["type"], dataOperation)) {
            continue;
        }

        // Extract data from module packs into JSON
        if (
            dataOperation.type === "ConvertModulePacks" ||
            dataOperation.type === "LocalizeModulePacks" ||
            dataOperation.type === "ExtractJournalPages"
        ) {
            // Check for required parameters
            if (!checkRequiredParams(["sourceModuleId", "sourceModulePath", "modulePacks"], dataOperation)) {
                continue;
            }

            console.warn(`Extracting data from module ${dataOperation.sourceModuleId}`);

            // Check if modulePacks is an array
            if (!Array.isArray(dataOperation.modulePacks)) {
                console.warn(" - modulePacks parameter is not an array");
                continue;
            }
        }

        if (dataOperation.type === "ConvertModulePacks") {
            const convertedModulePackData = await extractDataFromModule(dataOperation, database, false);
            if (convertedModulePackData.moduleData) {
                collectedData.convertedModulePacks.push(convertedModulePackData.moduleData);
            }
            if (convertedModulePackData.actorSources) {
                mergeActorSources(collectedData.actorSources, convertedModulePackData.actorSources);
            }
        }

        if (dataOperation.type === "LocalizeModulePacks") {
            const localizedModulePackData = await extractDataFromModule(dataOperation, database, true);
            if (localizedModulePackData.moduleData) {
                collectedData.localizedModulePacks.push(localizedModulePackData.moduleData);
            }
            if (localizedModulePackData.actorSources) {
                mergeActorSources(collectedData.actorSources, localizedModulePackData.actorSources);
            }
        }

        if (dataOperation.type === "ExtractJournalPages") {
            const extractedJournalPagesData = await extractDataFromModule(dataOperation, database, false);
            if (extractedJournalPagesData.moduleData) {
                collectedData.extractedJournalPages.push(extractedJournalPagesData.moduleData);
            }
            if (extractedJournalPagesData.actorSources) {
                mergeActorSources(collectedData.actorSources, extractedJournalPagesData.actorSources);
            }
        }

        // Get data from json files
        if (dataOperation.type === "ConvertJsonToXliff") {
            // Check for required parameters
            if (!checkRequiredParams(["sourceModuleId", "sourceModulePath", "jsonFiles"], dataOperation)) {
                continue;
            }

            console.warn(`Generating xliff files from ${dataOperation.sourceModuleId}`);

            // Check if jsonFiles is an array
            if (!Array.isArray(dataOperation.jsonFiles)) {
                console.warn(" - jsonFiles parameter is not an array");
                continue;
            }

            for (const jsonFile of dataOperation.jsonFiles) {
                const jsonPath = `${dataOperation.sourceModulePath}/${jsonFile.filePath}`;
                const fileName = jsonFile.changeName ? jsonFile.changeName : parsePath(jsonPath).fileName;

                if (!existsSync(jsonPath)) {
                    console.warn(` - ${jsonPath} does not exist`);
                    continue;
                }
                collectedData.jsonToXliff.push({
                    fileName: fileName,
                    data: readJSONFile(jsonPath),
                });
            }
        }
    }

    // Save generated data to destinations
    saveGeneratedData(module, collectedData);
}

async function extractDataFromModule(dataExtraction, database, localization) {
    const sourceModule = { id: dataExtraction.sourceModuleId, path: dataExtraction.sourceModulePath };
    const extractedData = { moduleData: { sourceModule: sourceModule, extractedPacks: [] }, actorSources: {} };
    for (const modulePack of dataExtraction.modulePacks) {
        // Check required parameters
        if (!checkRequiredParams(["name", "path"], modulePack)) {
            continue;
        }

        const extractedPackData = await extractDataFromPack(sourceModule, modulePack, database, localization);
        if (extractedPackData.extractedPack) {
            extractedData.moduleData.extractedPacks.push({
                packName: modulePack.name,
                packData: extractedPackData.extractedPack,
                journalPages: extractedPackData.journalPages,
            });
        }
        if (extractedPackData.actorSources) {
            mergeActorSources(extractedData.actorSources, extractedPackData.actorSources);
        }
    }
    return extractedData;
}

async function extractDataFromPack(sourceModule, modulePack, database, localization) {
    const packPath = `${sourceModule.path}/${modulePack.path}`;

    // Skip the current module pack if path does not exist
    if (!existsSync(packPath)) {
        console.warn(` - Path to module pack ${modulePack.name} does not exist, check config file`);
        return undefined;
    }

    // Get compendium data from levelDB and extract required data
    const extractedPack = await getJSONfromPack(packPath);
    const actorSources = getActorSources(
        extractedPack.packData,
        database.actors,
        database.actorCompendiums,
        database.actorRedirects
    );
    const journalPages =
        extractedPack.packType === "adventures"
            ? extractAdventuresJournalPages(extractedPack.packData, modulePack.htmlModifications)
            : extractJournalPages(extractedPack.packData);
    if (localization) {
        let localizationData = "";
        if (extractedPack.packType === "actors") {
            localizationData = extractPack(
                sourceModule.id,
                extractedPack.packData,
                database.mappings.actor,
                database.items
            );
        } else {
            localizationData = extractPack(
                sourceModule.id,
                extractedPack.packData,
                database.mappings.adventure,
                database.items,
                undefined,
                database.actorRedirects
            );
        }
        return {
            extractedPack: localizationData.extractedPack,
            actorSources: actorSources,
            journalPages: journalPages,
        };
    }
    if (extractedPack.packType === "adventures") {
        removeAdventuresJournalPagesContent(extractedPack.packData);
    } else {
        removeJournalsPagesContent(extractedPack.packData);
    }
    return { extractedPack: extractedPack, actorSources: actorSources, journalPages: journalPages };
}

function removeAdventuresJournalPagesContent(packData) {
    for (const pack of packData) {
        if (!pack.journal) {
            continue;
        }
        removeJournalsPagesContent(pack.journal);
    }
}

function removeJournalsPagesContent(journals) {
    for (const journal of journals) {
        if (!journal.pages) {
            continue;
        }
        for (const page of journal.pages) {
            if (!page.text.content?.trim()) {
                page._id = `no-text-${page._id}`;
            }
            deletePropertyByPath(page, "text.content");
        }
    }
}

function getActorSources(adventurePack, actorDatabase, actorCompendiums, actorRedirects) {
    const actorSources = {};
    for (const adventure of adventurePack) {
        if (!adventure.actors) {
            continue;
        }
        for (const actor of adventure.actors) {
            if (
                !(
                    resolvePath(actor, "flags.core.sourceId").exists &&
                    actor.flags.core.sourceId !== null &&
                    actor.flags.core.sourceId.startsWith("Compendium.pf2e")
                )
            ) {
                continue;
            }
            let actorLink = actor.flags.core.sourceId;

            // Handle actor Redirects
            for (const actorRedirect of actorRedirects) {
                if (actorLink === actorRedirect.linkOld) {
                    console.warn(`  - Redirecting ${actorRedirect.name} to new source: ${actorRedirect.linkNew}`);
                    actorLink = actorRedirect.linkNew;
                }
            }

            // Initialize structure for compendium if neccessary
            const sourceIdComponents = actorLink.split(".");
            const compendiumId = sourceIdComponents[2];

            // Handle old link notation
            if (sourceIdComponents.length === 4) {
                actorLink = `Compendium.pf2e.${compendiumId}.Actor.${sourceIdComponents[3]}`;
            }

            const actorName = actorDatabase[actorLink]?.name;

            // Handle missing sources for actor compendiums
            if (actorCompendiums.includes(compendiumId) && !actorName) {
                console.warn(`  - Actor ${actor.name} (Id: ${actorLink}) does not exist.`);
                continue;
            }

            if (!actorName) {
                continue;
            }
            actorSources[compendiumId] = actorSources[compendiumId] || [];

            if (!actorSources[compendiumId].includes(actorName)) {
                actorSources[compendiumId].push(actorName);
            }
        }
    }
    return actorSources;
}

function mergeActorSources(actorSources, newActorSources) {
    // Find compendiums that don't already exist within actorSources
    const newCompendiums = Object.keys(newActorSources).filter((x) => !Object.keys(actorSources).includes(x));

    // Add actors to existing compendiums without duplicates
    Object.keys(actorSources).forEach((compendium) => {
        if (newActorSources[compendium]) {
            for (const newActor of newActorSources[compendium]) {
                if (!actorSources[compendium].includes(newActor)) {
                    actorSources[compendium].push(newActor);
                }
            }
        }
        actorSources[compendium].sort();
    });

    // Add new compendiums
    for (const newCompendium of newCompendiums) {
        actorSources[newCompendium] = newActorSources[newCompendium];
        actorSources[newCompendium].sort();
    }
}

function extractJournalPages(journals) {
    const extractedjournals = [];
    for (const journal of journals) {
        const journalPages = [];
        if (!journal.pages) {
            continue;
        }
        for (const page of journal.pages) {
            if (!page.text.content?.trim()) {
                continue;
            }
            let journalPage = page.text.content;
            journalPages.push({ pageName: `${page._id}-${sluggify(page.name)}.html`, content: journalPage });
        }
        extractedjournals.push({ journalName: sluggify(journal.name), pages: journalPages });
    }
    return extractedjournals;
}

function extractAdventuresJournalPages(adventures, htmlModifications) {
    const adventureJournalPages = [];
    for (const adventure of adventures) {
        const journalPages = [];
        if (!adventure.journal) {
            continue;
        }
        for (const entry of adventure.journal) {
            for (const page of entry.pages) {
                if (!page.text.content?.trim()) {
                    continue;
                }
                let journalPage = page.text.content;
                if (resolvePath(htmlModifications, [sluggify(adventure.name), `${page._id}-${page.name}`]).exists) {
                    htmlModifications[sluggify(adventure.name)][`${page._id}-${page.name}`].forEach((htmlMod) => {
                        if (!page.text.content.includes(htmlMod.base)) {
                            console.warn(
                                `  - HTML modification: The following text was not found in ${page._id}-${page.name}\n${htmlMod.base}`
                            );
                        } else {
                            journalPage = journalPage.replace(htmlMod.base, htmlMod.mod);
                            console.warn(`  - Modifying journal ${page._id}-${page.name} based on config data`);
                        }
                    });
                }
                journalPages.push({ pageName: `${page._id}-${sluggify(page.name)}.html`, content: journalPage });
            }
        }
        adventureJournalPages.push({ journalName: sluggify(adventure.name), pages: journalPages });
    }
    return adventureJournalPages;
}

function saveHTMLfiles(journals, savePath) {
    for (const journal of journals) {
        for (const journalPage of journal.pages) {
            saveFileWithDirectories(`${savePath}/${journal.journalName}/${journalPage.pageName}`, journalPage.content);
        }
    }
}

function saveGeneratedData(module, collectedData) {
    const modulePath = module.path;

    // Delete html save location
    deleteFolderRecursive(`${modulePath}/dev/journals/source`);

    if (collectedData.localizedModulePacks) {
        for (const localizedPacks of collectedData.localizedModulePacks) {
            for (const extractedPack of localizedPacks.extractedPacks) {
                const jsonFile = `${modulePath}/dev/${localizedPacks.sourceModule.id}.${extractedPack.packName}-en.json`;
                const xliffFile = `${modulePath}/dev/${localizedPacks.sourceModule.id}.${extractedPack.packName}.xliff`;
                const htmlFiles = `${modulePath}/dev/journals/source/${localizedPacks.sourceModule.id}.${extractedPack.packName}`;
                // Save extracted JSON and create/update xliff file
                if (extractedPack.packData) {
                    saveFileWithDirectories(jsonFile, JSON.stringify(extractedPack.packData, null, 4));
                    let target = "";
                    if (existsSync(xliffFile)) {
                        const xliff = readFileSync(xliffFile, "utf-8");
                        target = updateXliff(xliff, flattenObject(extractedPack.packData));
                    } else {
                        target = jsonToXliff(flattenObject(extractedPack.packData));
                    }
                    saveFileWithDirectories(xliffFile, target);
                }

                // Save html files
                saveHTMLfiles(extractedPack.journalPages, htmlFiles);
            }
        }
    }

    if (collectedData.convertedModulePacks) {
        for (const convertedPacks of collectedData.convertedModulePacks) {
            for (const extractedPack of convertedPacks.extractedPacks) {
                const jsonFile = `${modulePath}/dev/packs/${convertedPacks.sourceModule.id}.${extractedPack.packName}.json`;
                const htmlFiles = `${modulePath}/dev/journals/source/${convertedPacks.sourceModule.id}.${extractedPack.packName}`;
                if (extractedPack.packData) {
                    // Save extracted JSON
                    saveFileWithDirectories(jsonFile, JSON.stringify(extractedPack.packData, null, 4));
                }
                // Save html files
                saveHTMLfiles(extractedPack.journalPages, htmlFiles);
            }
        }
    }

    if (collectedData.extractedJournalPages) {
        for (const extractedJournalPages of collectedData.extractedJournalPages) {
            for (const extractedPack of extractedJournalPages.extractedPacks) {
                const htmlFiles = `${modulePath}/dev/journals/source/${extractedJournalPages.sourceModule.id}.${extractedPack.packName}`;

                // Save html files
                saveHTMLfiles(extractedPack.journalPages, htmlFiles);
            }
        }
    }

    if (collectedData.jsonToXliff) {
        for (const jsonToXliffData of collectedData.jsonToXliff) {
            const jsonFile = `${modulePath}/dev/${jsonToXliffData.fileName}-en.json`;
            const xliffFile = `${modulePath}/dev/${jsonToXliffData.fileName}.xliff`;
            saveFileWithDirectories(jsonFile, JSON.stringify(jsonToXliffData.data, null, 4));
            let target = "";
            if (existsSync(xliffFile)) {
                const xliff = readFileSync(xliffFile, "utf-8");
                target = updateXliff(xliff, flattenObject(jsonToXliffData.data));
            } else {
                target = jsonToXliff(flattenObject(jsonToXliffData.data));
            }
            saveFileWithDirectories(xliffFile, target);
        }
    }

    if (Object.keys(collectedData.actorSources).length > 0) {
        // Write actorSources file if no .locked. actorSource exists in destination path
        if (!existsSync(`${modulePath}/dev/actorSources.locked.json`)) {
            const actorSourceFile = `${modulePath}/dev/actorSources.json`;
            saveFileWithDirectories(actorSourceFile, JSON.stringify(collectedData.actorSources, null, 4));
        }
    }
}
