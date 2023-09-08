import { readdirSync, readFileSync, writeFileSync } from "fs";
import { replaceProperties } from "../helper/src/util/utilities.js";
import { extractPack } from "../helper/src/pack-extractor/pack-extractor.js";
import { PF2_DEFAULT_MAPPING } from "../helper/src/pack-extractor/constants.js";

// Read config file
const configFile = JSON.parse(
    readFileSync("./src/extract-localization-data/extract-localization-config.json", "utf-8")
);

const CONFIG = { ...configFile };

// Replace linked mappings and savePaths with actual data
replaceProperties(CONFIG.mappings, ["subMapping"], CONFIG.mappings);
// replaceProperties(CONFIG.packs, ["mapping"], CONFIG.mappings);
// replaceProperties(CONFIG.packs, ["savePath"], CONFIG.filePaths.packs);

// Read available adventure directories
const adventureDirectories = readdirSync(CONFIG.filePaths.adventures);
adventureDirectories.forEach((adventureDirectory) => {
    const adventurePack = JSON.parse(
        readFileSync(`${CONFIG.filePaths.adventures}/${adventureDirectory}/${adventureDirectory}.json`)
    );
    const extractedPackData = extractPack(adventureDirectory, adventurePack, CONFIG.mappings.adventure);
    writeFileSync(
        `${CONFIG.filePaths.adventures}/${adventureDirectory}/de.${adventureDirectory}.json`,
        JSON.stringify(extractedPackData.extractedPack, null, 2)
    );
});
