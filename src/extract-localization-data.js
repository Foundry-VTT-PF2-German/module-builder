import { copyFileSync, existsSync } from "fs";
import { deletePropertyByPath, replaceProperties, sluggify } from "./helper/src/util/utilities.js";
import { buildItemDatabase, extractPack } from "./helper/src/pack-extractor/pack-extractor.js";
import { PF2_DEFAULT_MAPPING } from "./helper/src/pack-extractor/constants.js";
import { ADVENTURE_CONFIG } from "../adventure-config.js";
import { spawn } from "child_process";
import { getZipContentFromURL, deleteFolderRecursive, saveFileWithDirectories } from "./helper/src/util/fileHandler.js";
import { resolvePath } from "path-value";
import { getJSONfromPack } from "./helper/src/util/level-db.js";

// Fetch assets from current pf2 release and get zip contents
const packs = await getZipContentFromURL(ADVENTURE_CONFIG.zipURL);

// Get the path to the xliff tool
const xliffTool = ADVENTURE_CONFIG.xliffScript;

// Build item database in order to compare actor items with their comdendium entries
const itemDatabase = buildItemDatabase(packs, ADVENTURE_CONFIG.itemDatabase);

// Build actor database in order to connect actor id to actor name
const actorDatabase = buildItemDatabase(packs, ADVENTURE_CONFIG.actorDatabase);

// Replace linked mappings and savePaths with actual data
replaceProperties(PF2_DEFAULT_MAPPING, ["subMapping"], PF2_DEFAULT_MAPPING);

// Initialize adventure actor dictionary
const adventureActorDictionary = {};

// Loop through configured adventure modules
for (const adventureModule of ADVENTURE_CONFIG.adventureModules) {
    // Skip the current module if mandatory fields are missing
    if (
        !adventureModule.moduleId ||
        !adventureModule.modulePath ||
        !adventureModule.adventurePacks ||
        !adventureModule.savePaths
    ) {
        console.warn(
            `\nMissing mandatory fields moduleId, modulePath, adventurePacks, savePaths in config entry:\n${JSON.stringify(
                adventureModule,
                null,
                2
            )}`
        );
        continue;
    }

    console.warn(
        `\n-----------------------------------\nExtracting ${adventureModule.moduleId}\n-----------------------------------`
    );

    const modulePath = `${adventureModule.modulePath}/${adventureModule.moduleId}`;

    // Skip the current module if module path does not exist
    if (!existsSync(modulePath)) {
        console.warn(`Path to module does not exist, check config file`);
        continue;
    }

    // Loop through configured adventure packs within the current module
    for (const adventurePack of adventureModule.adventurePacks) {
        const packPath = `${modulePath}/${adventurePack.path}`;

        // Skip the current adventure pack if path does not exist
        if (!existsSync(packPath)) {
            console.warn(`Path to adventure pack ${adventurePack.name} does not exist, check config file`);
            continue;
        }

        // Initialize directory and file paths
        const bestiarySourcePath = adventureModule.savePaths.bestiarySources;
        const journalPath = adventureModule.savePaths.extractedJournals
            ? `${adventureModule.savePaths.extractedJournals}/${adventureModule.moduleId}`
            : undefined;
        const jsonFile = adventureModule.savePaths.xliffTranslation
            ? `${adventureModule.savePaths.xliffTranslation}/${adventureModule.moduleId}-en.json`
            : undefined;
        const xliffFile = adventureModule.savePaths.xliffTranslation
            ? `${adventureModule.savePaths.xliffTranslation}/${adventureModule.moduleId}.xliff`
            : undefined;

        // Get compendium data from levelDB and extract required data
        const { packData: sourcePack } = await getJSONfromPack(packPath);
        const extractedPackData = extractPack(
            adventureModule.moduleId,
            sourcePack,
            PF2_DEFAULT_MAPPING.adventure,
            itemDatabase
        );

        // Cleanup html save location and extract journal pages
        if (journalPath) {
            deleteFolderRecursive(journalPath);
            const noTextPages = extractJournalPages(sourcePack, journalPath);

            // Delete Ids for journal pages without text from extracted pack data
            for (const noTextPage of noTextPages) {
                deletePropertyByPath(extractedPackData.extractedPack.entries, noTextPage);
            }
        }

        // Save extracted JSON and create/update xliff file
        if (xliffFile) {
            saveFileWithDirectories(jsonFile, JSON.stringify(extractedPackData.extractedPack, null, 2));
            runXliffTool(jsonFile, xliffFile);
        }

        // Build dictionary for adventure actor sources if save location is specified
        if (bestiarySourcePath) {
            adventureActorDictionary[bestiarySourcePath] = adventureActorDictionary[bestiarySourcePath] || {};
            sourcePack.forEach((adventure) => {
                adventure.actors.forEach((actor) => {
                    if (
                        resolvePath(actor, "flags.core.sourceId").exists &&
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

function runXliffTool(jsonFile, xliffFile) {
    let script = "";

    // If the xliff file already exists, make a backup and update the xliff
    if (existsSync(xliffFile)) {
        console.warn("Creating backup and updating xliff file");
        script = [xliffTool, xliffFile, "update-from", "--tree", jsonFile];

        // Make backup of the current xliff
        copyFileSync(xliffFile, xliffFile.replace(".xliff", "-sicherung.xliff"));

        // Create xliff file if not existing
    } else {
        console.warn("Creating xliff file");
        script = [xliffTool, xliffFile, "create", "-s", "EN", "-t", "DE", "--source-json", jsonFile, "--tree"];
    }
    const pyProg = spawn("python", script);
    pyProg.stderr.on("data", (stderr) => {
        console.log(stderr);
    });
}

function extractJournalPages(adventures, savePath) {
    const noTextPages = [];
    for (const adventure of adventures) {
        for (const entry of adventure.journal) {
            for (const page of entry.pages) {
                if (!page.text.content?.trim()) {
                    noTextPages.push(`${adventure.name}.journal.${entry.name}.pages.${page.name}.id`);
                    continue;
                }
                saveFileWithDirectories(
                    `${savePath}/${sluggify(adventure.name)}/${page._id}-${sluggify(page.name)}.html`,
                    page.text.content
                );
            }
        }
    }
    return noTextPages;
}
