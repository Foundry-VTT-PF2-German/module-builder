import { readdirSync, readFileSync, writeFileSync } from "fs";
import { replaceProperties } from "../helper/src/util/utilities.js";
import { extractPack } from "../helper/src/pack-extractor/pack-extractor.js";
import { PF2_DEFAULT_MAPPING } from "../helper/src/pack-extractor/constants.js";

const adventurePath = "./adventures";

const CONFIG = { adventurePath: adventurePath, mappings: PF2_DEFAULT_MAPPING };

// Replace linked mappings and savePaths with actual data
replaceProperties(CONFIG.mappings, ["subMapping"], CONFIG.mappings);

// Read available adventure directories
const adventureDirectories = readdirSync(CONFIG.adventurePath);
adventureDirectories.forEach((adventureDirectory) => {
    const adventurePack = JSON.parse(
        readFileSync(`${CONFIG.adventurePath}/${adventureDirectory}/${adventureDirectory}.json`)
    );
    const extractedPackData = extractPack(adventureDirectory, adventurePack, CONFIG.mappings.adventure);
    writeFileSync(
        `${CONFIG.adventurePath}/${adventureDirectory}/en.${adventureDirectory}.json`,
        JSON.stringify(extractedPackData.extractedPack, null, 2)
    );
});
