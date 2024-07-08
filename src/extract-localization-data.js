import { existsSync, readFileSync } from "fs";
import { flattenObject, replaceProperties, sluggify } from "./helper/src/util/utilities.js";
import { buildItemDatabase, extractPack } from "./helper/src/pack-extractor/pack-extractor.js";
import { PF2_DEFAULT_MAPPING } from "./helper/src/pack-extractor/constants.js";
import { CONFIG } from "../config.js";
import {
    getZipContentFromURL,
    deleteFolderRecursive,
    saveFileWithDirectories,
} from "./helper/src/util/file-handler.js";
import { resolvePath } from "path-value";
import { getJSONfromPack } from "./helper/src/util/level-db.js";
import { jsonToXliff, updateXliff } from "./helper/src/util/xliff-tool.js";

// Fetch assets from current pf2 release and get zip contents
const packs = await getZipContentFromURL(CONFIG.zipURL);

// Initialize database
const database = {};

// Build item database in order to compare actor items with their comdendium entries
database.items = buildItemDatabase(packs, CONFIG.itemDatabase);

// Build actor database in order to connect actor id to actor name
database.actors = buildItemDatabase(packs, CONFIG.actorDatabase);

// Get paths to actor compendiums
database.actorCompendiums = CONFIG.actorCompendiums;

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

    await dataOperations(currentModule.dataOperations, database);

    // Part 2 - Data transformation - transorms data, e.g. leveldb to JSON or JSON to xliff
    if (currentModule.dataTransformation) {
    }
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

async function dataOperations(dataOperations, database) {
    for (const dataOperation of dataOperations) {
        // Check for required parameters
        if (!checkRequiredParams(["type"], dataOperation)) {
            continue;
        }

        // Extract required data from module packs into JSON
        if (dataOperation.type === "ConvertModulePacks" || dataOperation.type === "LocalizeModulePacks") {
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

            const localization = dataOperation.type === "LocalizeModulePacks" ? true : false;

            const extractedData = await extractDataFromModule(dataOperation, database, localization);
            saveFileWithDirectories(
                "C:/Users/marco/OneDrive/Dokumente/GitHub/module-builder/test/test.json",
                JSON.stringify(extractedData, null, 2)
            );
        }
    }
}

async function extractDataFromModule(dataExtraction, database, localization) {
    const sourceModule = { id: dataExtraction.sourceModuleId, path: dataExtraction.sourceModulePath };
    const extractedData = { sourceModule: sourceModule, extractedPacks: [], bestiarySources: {} };
    for (const modulePack of dataExtraction.modulePacks) {
        // Check required parameters
        if (!checkRequiredParams(["name", "path"], modulePack)) {
            continue;
        }

        const extractedPack = await extractDataFromPack(
            sourceModule,
            modulePack,
            database.items,
            database.mappings.adventure,
            localization
        );
        if (extractedPack) {
            extractedData.extractedPacks.push({ packName: modulePack.name, packData: extractedPack });
        }
    }
    return extractedData;
}

async function extractDataFromPack(sourceModule, modulePack, itemDatabase, mappings, localization) {
    const packPath = `${sourceModule.path}/${modulePack.path}`;

    // Skip the current module pack if path does not exist
    if (!existsSync(packPath)) {
        console.warn(` - Path to module pack ${modulePack.name} does not exist, check config file`);
        return undefined;
    }

    // Get compendium data from levelDB and extract required data
    const { packData: sourcePack } = await getJSONfromPack(packPath);

    if (localization) {
        const extractedPackData = extractPack(sourceModule.id, sourcePack, mappings, itemDatabase);
        return extractedPackData.extractedPack;
    }

    return sourcePack;
}

function getActorSources(adventurePacks, actorDatabase, actorCompendiums) {
    const actorSources = {};

    adventurePacks.forEach((adventure) => {
        adventure.actors.forEach((actor) => {
            if (
                resolvePath(actor, "flags.core.sourceId").exists &&
                actor.flags.core.sourceId !== null &&
                actor.flags.core.sourceId.startsWith("Compendium.pf2e")
            ) {
                let actorLink = actor.flags.core.sourceId;

                // Initialize structure for compendium if neccessary
                const sourceIdComponents = actor.flags.core.sourceId.split(".");
                const compendiumId = sourceIdComponents[2];
                actorSources[compendiumId] = actorSources[compendiumId] || [];

                // Handle old link notation
                if (sourceIdComponents.length === 4) {
                    actorLink = `Compendium.pf2e.${compendiumId}.Actor.${sourceIdComponents[3]}`;
                }

                const actorName = actorDatabase[actorLink]?.name;
                if (actorName) {
                    adventureActorDictionary[compendiumId].push(actorName);
                }
            }
        });
    });
}

/*

    const sourceModulePath = `${currentModule.dataExtraction.sourceModulePath}/${currentModule.dataExtraction.sourceModuleId}`;

    // Loop through configured adventure packs within the current module
    for (const modulePack of currentModule.modulePacks) {
        const packPath = `${sourceModulePath}/${modulePack.path}`;

        // Skip the current adventure pack if path does not exist
        if (!existsSync(packPath)) {
            console.warn(`Path to adventure pack ${modulePack.name} does not exist, check config file`);
            continue;
        }

        // Initialize directory and file paths
        const bestiarySourcePath = currentModule.savePaths.bestiarySources;
        const journalPath = currentModule.savePaths.extractedJournals
            ? `${currentModule.savePaths.extractedJournals}/${currentModule.moduleId}.${modulePack.name}`
            : undefined;
        const jsonFile = currentModule.savePaths.xliffTranslation
            ? `${currentModule.savePaths.xliffTranslation}/${currentModule.moduleId}.${modulePack.name}-en.json`
            : undefined;
        const xliffFile = currentModule.savePaths.xliffTranslation
            ? `${currentModule.savePaths.xliffTranslation}/${currentModule.moduleId}.${modulePack.name}.xliff`
            : undefined;

*        // Get compendium data from levelDB and extract required data
*        const { packData: sourcePack } = await getJSONfromPack(packPath);
*        const extractedPackData = extractPack(
*            currentModule.moduleId,
*            sourcePack,
*            PF2_DEFAULT_MAPPING.adventure,
*            itemDatabase
*        );

        // Cleanup html save location and extract journal pages
        if (journalPath) {
            deleteFolderRecursive(journalPath);
            extractJournalPages(sourcePack, currentModule.htmlModifications, journalPath);
        }

        // Save extracted JSON and create/update xliff file
        if (xliffFile) {
            saveFileWithDirectories(jsonFile, JSON.stringify(extractedPackData.extractedPack, null, 4));
            let target = "";
            if (existsSync(xliffFile)) {
                const xliff = readFileSync(xliffFile, "utf-8");
                target = updateXliff(xliff, flattenObject(extractedPackData.extractedPack));
            } else {
                target = jsonToXliff(flattenObject(extractedPackData.extractedPack));
            }
            saveFileWithDirectories(xliffFile, target);
        }

        // Build dictionary for adventure actor sources if save location is specified
        // Ignore locked sourceFiles in config - those files are built manually and are only used during module build
        if (bestiarySourcePath && !bestiarySourcePath.includes(".locked.")) {
            adventureActorDictionary[bestiarySourcePath] = adventureActorDictionary[bestiarySourcePath] || {};
            sourcePack.forEach((adventure) => {
                adventure.actors.forEach((actor) => {
                    if (
                        resolvePath(actor, "flags.core.sourceId").exists &&
                        actor.flags.core.sourceId !== null &&
                        actor.flags.core.sourceId.startsWith("Compendium.pf2e")
                    ) {
                        // Initialize compendium entry if neccessary
                        const sourceIdComponents = actor.flags.core.sourceId.split(".");
                        // Add Actor to sourceId link for old link notation
                        if (sourceIdComponents.length === 4) {
                            actor.flags.core.sourceId = `Compendium.pf2e.${sourceIdComponents[2]}.Actor.${sourceIdComponents[3]}`;
                        }
                        adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]] =
                            adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]] || [];
                        adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]] =
                            adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]] || [];
                        const actorName = actorDatabase[actor.flags.core.sourceId]?.name;
                        if (actorName) {
                            adventureActorDictionary[bestiarySourcePath][sourceIdComponents[2]].push(actorName);
                        }
                    }
                });
            });
        }
    }
}

// Remove duplicates and empty compendium entries from adventure actor sources and save the dictionary to the specified locations
Object.keys(adventureActorDictionary).forEach((savePath) => {
    const dictionary = {};
    Object.keys(adventureActorDictionary[savePath]).forEach((compendium) => {
        const sortedEntries = [...new Set(adventureActorDictionary[savePath][compendium].sort())];
        if (sortedEntries.length > 0) {
            dictionary[compendium] = sortedEntries;
        }
    });
    saveFileWithDirectories(savePath, JSON.stringify(dictionary, null, 2));
});

function extractJournalPages(adventures, htmlModifications, savePath) {
    for (const adventure of adventures) {
        for (const entry of adventure.journal) {
            for (const page of entry.pages) {
                if (!page.text.content?.trim()) {
                    continue;
                }
                if (resolvePath(htmlModifications, [sluggify(adventure.name), page.name]).exists) {
                    htmlModifications[sluggify(adventure.name)][page.name].forEach((htmlMod) => {
                        page.text.content = page.text.content.replace(htmlMod.base, htmlMod.mod);
                        console.warn(`  - Modifying journal ${page.name} based on config data`);
                    });
                }

                saveFileWithDirectories(
                    `${savePath}/${sluggify(adventure.name)}/${page._id}-${sluggify(page.name)}.html`,
                    page.text.content
                );
            }
        }
    }
}*/
