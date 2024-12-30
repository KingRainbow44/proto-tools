/**
 * This script combines a directory of individual messages & enums into a single `.proto` file.
 * This script will NOT add any other text, including `syntax` and `option` statements.
 *
 * Usage: `bun combine.ts <path-to-dir> <output-file>`
 */

import { Arguments, Files } from "@/utils.ts";

const EXCLUDE = /(\/\/|syntax|option|import)/;

// Get the input directory and output file path.
const inputPath = Arguments.throw<string>(0, "No input directory found.");
const outputPath = Arguments.throw<string>(1, "No output file found.");

// Validate the input directory.
await Files.dirThrow(inputPath, `The input directory "${inputPath}" does not exist.`);
// Delete the output file if it already exists.
await Files.rmExists(outputPath);

// Create writer for the output file.
const outputFile = Bun.file(outputPath);
const outputSink = outputFile.writer();

// Iterate through all `.proto` files in the input directory.
for (const file of await Files.readDir(inputPath, "proto")) {
    const text = (await file.text()).trim();
    const lines = text.split("\n");
    for (const line of lines) {
        // Check if the line should be included in the output file.
        if (EXCLUDE.test(line) || line.length == 0) {
            continue;
        }

        // If the line is a `message` or `enum`, then we should add a previous line break.
        if (line.startsWith("message") || line.startsWith("enum")) {
            outputSink.write("\n");
        }

        // Write the line to the output file.
        outputSink.write(line);
        outputSink.write("\n");
    }
}

console.log("Done writing!");