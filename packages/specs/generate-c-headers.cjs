#!/usr/bin/env node
/*                                                 *\
** ----------------------------------------------- **
**          Calliope - Pixos Game Engine           **
** ----------------------------------------------- **
**  Copyright (c) 2020-2025 - Kyle Derby MacInnis  **
**                                                 **
**    Any unauthorized distribution or transfer    **
**       of this work is strictly prohibited.      **
**                                                 **
**               All Rights Reserved.              **
** ----------------------------------------------- **
\*                                                 */

/**
 * Generate C headers from specs JSON files.
 * 
 * This script reads JSON spec files from the specs package and generates
 * corresponding C header files for the core-c package, ensuring cross-platform
 * consistency between JavaScript and C implementations.
 * 
 * Usage: node generate-c-headers.js [--output-dir <dir>]
 */

const fs = require('fs');
const path = require('path');

// Default output directory
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '..', 'core-c', 'src', 'generated');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    let outputDir = DEFAULT_OUTPUT_DIR;
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--output-dir' && args[i + 1]) {
            outputDir = path.resolve(args[i + 1]);
            i++;
        } else if (args[i] === '--help') {
            console.log('Usage: node generate-c-headers.js [--output-dir <dir>]');
            console.log('\nOptions:');
            console.log('  --output-dir <dir>  Output directory for generated headers');
            console.log('  --help              Show this help message');
            process.exit(0);
        }
    }
    
    return { outputDir };
}

// Generate C header preamble
function headerPreamble(filename, description) {
    const guard = `PIXOS_GENERATED_${filename.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_H`;
    return `/*
 * ---------------------------------------------------------------
 *        Calliope - Pixos Engine - GENERATED FILE
 * ---------------------------------------------------------------
 * THIS FILE IS AUTO-GENERATED FROM specs/*.json
 * DO NOT EDIT MANUALLY - Changes will be overwritten!
 * 
 * ${description}
 * 
 * Generated: ${new Date().toISOString()}
 * ---------------------------------------------------------------
 */

#ifndef ${guard}
#define ${guard}

`;
}

function headerPostamble(filename) {
    const guard = `PIXOS_GENERATED_${filename.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_H`;
    return `
#endif /* ${guard} */
`;
}

// Generate C code from directions.json
function generateDirections(spec) {
    let output = headerPreamble('directions', 'Direction constants for 8-directional movement');
    
    output += `#include <math.h>\n\n`;
    
    // Direction enum
    output += `/* Direction indices */\n`;
    output += `typedef enum {\n`;
    const directions = Object.entries(spec.directions);
    directions.forEach(([key, val], i) => {
        output += `    DIR_${key} = ${val.index}${i < directions.length - 1 ? ',' : ''}\n`;
    });
    output += `} Direction;\n\n`;
    
    output += `#define DIR_COUNT 8\n\n`;
    
    // Direction vectors (normalized)
    output += `/* Direction unit vectors (x, y) */\n`;
    output += `static const float DIR_VECTORS[DIR_COUNT][2] = {\n`;
    spec.byIndex.forEach((key, i) => {
        const vec = spec.directions[key].vector;
        // Normalize diagonal vectors
        const len = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
        const nx = (vec[0] / len).toFixed(6);
        const ny = (vec[1] / len).toFixed(6);
        output += `    { ${nx}f, ${ny}f }${i < 7 ? ',' : ''}  /* ${key} */\n`;
    });
    output += `};\n\n`;
    
    // Direction angles
    output += `/* Direction angles in radians */\n`;
    output += `static const float DIR_ANGLES[DIR_COUNT] = {\n`;
    spec.byIndex.forEach((key, i) => {
        const angle = spec.directions[key].angle.toFixed(4);
        output += `    ${angle}f${i < 7 ? ',' : ''}  /* ${key} */\n`;
    });
    output += `};\n\n`;
    
    // Opposite directions lookup
    output += `/* Opposite direction lookup */\n`;
    output += `static const Direction DIR_OPPOSITE[DIR_COUNT] = {\n`;
    spec.byIndex.forEach((key, i) => {
        const opposite = spec.opposite[key];
        output += `    DIR_${opposite}${i < 7 ? ',' : ''}  /* ${key} -> ${opposite} */\n`;
    });
    output += `};\n\n`;
    
    // Clockwise rotation lookup
    output += `/* Clockwise rotation lookup */\n`;
    output += `static const Direction DIR_CLOCKWISE[DIR_COUNT] = {\n`;
    spec.byIndex.forEach((key, i) => {
        const cw = spec.clockwise[key];
        output += `    DIR_${cw}${i < 7 ? ',' : ''}  /* ${key} -> ${cw} */\n`;
    });
    output += `};\n\n`;
    
    // Counter-clockwise rotation lookup
    output += `/* Counter-clockwise rotation lookup */\n`;
    output += `static const Direction DIR_COUNTER_CLOCKWISE[DIR_COUNT] = {\n`;
    spec.byIndex.forEach((key, i) => {
        const ccw = spec.counterClockwise[key];
        output += `    DIR_${ccw}${i < 7 ? ',' : ''}  /* ${key} -> ${ccw} */\n`;
    });
    output += `};\n\n`;
    
    // Helper functions
    output += `/* Convert facing index to direction */\n`;
    output += `static inline Direction direction_from_facing(int facing) {\n`;
    output += `    return (Direction)((facing % DIR_COUNT + DIR_COUNT) % DIR_COUNT);\n`;
    output += `}\n\n`;
    
    output += `/* Get opposite direction */\n`;
    output += `static inline Direction direction_opposite(Direction dir) {\n`;
    output += `    return DIR_OPPOSITE[dir];\n`;
    output += `}\n\n`;
    
    output += `/* Rotate direction clockwise */\n`;
    output += `static inline Direction direction_rotate_cw(Direction dir) {\n`;
    output += `    return DIR_CLOCKWISE[dir];\n`;
    output += `}\n\n`;
    
    output += `/* Rotate direction counter-clockwise */\n`;
    output += `static inline Direction direction_rotate_ccw(Direction dir) {\n`;
    output += `    return DIR_COUNTER_CLOCKWISE[dir];\n`;
    output += `}\n\n`;
    
    output += `/* Get direction vector */\n`;
    output += `static inline void direction_get_vector(Direction dir, float* x, float* y) {\n`;
    output += `    *x = DIR_VECTORS[dir][0];\n`;
    output += `    *y = DIR_VECTORS[dir][1];\n`;
    output += `}\n\n`;
    
    output += `/* Get direction angle in radians */\n`;
    output += `static inline float direction_get_angle(Direction dir) {\n`;
    output += `    return DIR_ANGLES[dir];\n`;
    output += `}\n\n`;
    
    output += `/* Convert angle (radians) to nearest direction */\n`;
    output += `static inline Direction direction_from_angle(float angle) {\n`;
    output += `    /* Normalize to [0, 2π) */\n`;
    output += `    const float TWO_PI = 6.28318530718f;\n`;
    output += `    while (angle < 0) angle += TWO_PI;\n`;
    output += `    while (angle >= TWO_PI) angle -= TWO_PI;\n`;
    output += `    /* Divide by sector size (2π/8) and round */\n`;
    output += `    int sector = (int)((angle + 0.39269908f) / 0.78539816f) % 8;\n`;
    output += `    return (Direction)sector;\n`;
    output += `}\n`;
    
    output += headerPostamble('directions');
    return output;
}

// Generate C code from events.json
function generateEvents(spec) {
    let output = headerPreamble('events', 'Event type constants for engine events');
    
    output += `/* Event type identifiers */\n`;
    output += `typedef enum {\n`;
    
    let eventIndex = 0;
    const categories = Object.entries(spec.events);
    
    categories.forEach(([category, events], catIndex) => {
        output += `    /* ${spec.categories[category] || category} */\n`;
        const eventEntries = Object.entries(events);
        eventEntries.forEach(([eventName, eventDef], i) => {
            const isLast = catIndex === categories.length - 1 && i === eventEntries.length - 1;
            output += `    EVENT_${eventName} = ${eventIndex}${isLast ? '' : ','}\n`;
            eventIndex++;
        });
        output += `\n`;
    });
    
    output += `} EventType;\n\n`;
    
    output += `#define EVENT_COUNT ${eventIndex}\n\n`;
    
    // Event name strings for debugging
    output += `#ifdef PIXOS_DEBUG\n`;
    output += `/* Event names for debugging */\n`;
    output += `static const char* EVENT_NAMES[EVENT_COUNT] = {\n`;
    
    categories.forEach(([category, events]) => {
        const eventEntries = Object.entries(events);
        eventEntries.forEach(([eventName]) => {
            output += `    "${eventName}",\n`;
        });
    });
    
    output += `};\n`;
    output += `#endif /* PIXOS_DEBUG */\n`;
    
    output += headerPostamble('events');
    return output;
}

// Generate C code from shader-types.json
function generateShaderTypes(spec) {
    let output = headerPreamble('shader_types', 'Shader type constants');
    
    if (spec.shaderTypes) {
        output += `/* Shader types */\n`;
        output += `typedef enum {\n`;
        const types = Object.entries(spec.shaderTypes);
        types.forEach(([key, val], i) => {
            output += `    SHADER_${key.toUpperCase()} = ${val.index || i}${i < types.length - 1 ? ',' : ''}\n`;
        });
        output += `} ShaderType;\n\n`;
    }
    
    if (spec.uniformTypes) {
        output += `/* Uniform types */\n`;
        output += `typedef enum {\n`;
        const uniforms = Object.entries(spec.uniformTypes);
        uniforms.forEach(([key, val], i) => {
            output += `    UNIFORM_${key.toUpperCase()} = ${i}${i < uniforms.length - 1 ? ',' : ''}\n`;
        });
        output += `} UniformType;\n\n`;
    }
    
    output += headerPostamble('shader_types');
    return output;
}

// Read and parse JSON file
function readSpec(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error(`Failed to read ${filePath}: ${err.message}`);
        return null;
    }
}

// Write generated header file
function writeHeader(outputDir, filename, content) {
    const filePath = path.join(outputDir, filename);
    try {
        fs.writeFileSync(filePath, content);
        console.log(`  ✓ Generated ${filename}`);
        return true;
    } catch (err) {
        console.error(`  ✗ Failed to write ${filename}: ${err.message}`);
        return false;
    }
}

// Main generation function
function main() {
    const { outputDir } = parseArgs();
    
    console.log('Pixos Spec-to-C Header Generator');
    console.log('=================================\n');
    console.log(`Output directory: ${outputDir}\n`);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created output directory: ${outputDir}\n`);
    }
    
    const specsDir = __dirname;
    let generated = 0;
    let failed = 0;
    
    // Generate directions.h
    console.log('Processing constants/directions.json...');
    const directionsSpec = readSpec(path.join(specsDir, 'constants', 'directions.json'));
    if (directionsSpec) {
        const content = generateDirections(directionsSpec);
        if (writeHeader(outputDir, 'directions.h', content)) generated++;
        else failed++;
    } else {
        failed++;
    }
    
    // Generate events.h
    console.log('Processing constants/events.json...');
    const eventsSpec = readSpec(path.join(specsDir, 'constants', 'events.json'));
    if (eventsSpec) {
        const content = generateEvents(eventsSpec);
        if (writeHeader(outputDir, 'events.h', content)) generated++;
        else failed++;
    } else {
        failed++;
    }
    
    // Generate shader_types.h
    console.log('Processing constants/shader-types.json...');
    const shaderSpec = readSpec(path.join(specsDir, 'constants', 'shader-types.json'));
    if (shaderSpec) {
        const content = generateShaderTypes(shaderSpec);
        if (writeHeader(outputDir, 'shader_types.h', content)) generated++;
        else failed++;
    } else {
        failed++;
    }
    
    // Summary
    console.log('\n=================================');
    console.log(`Generated: ${generated} files`);
    if (failed > 0) {
        console.log(`Failed: ${failed} files`);
    }
    console.log('=================================\n');
    
    // Exit with error code if any failed
    process.exit(failed > 0 ? 1 : 0);
}

main();
