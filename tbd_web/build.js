const glob = require('glob');
const fs = require('fs').promises;
const { minify } = require('terser');
const mkdirp = require('mkdirp');
const JavaScriptObfuscator = require('javascript-obfuscator');
const srcFiles = 'view/assets/js/merged.js';
// get value from app constants file
const appConstants = require("./app/constants");
const version = appConstants.APPVERSION;
const options =
{
    compact: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    identifierNamesGenerator: 'hexadecimal'
    // compact: true,
    // controlFlowFlattening: true,
    // controlFlowFlatteningThreshold: .75,
    // numbersToExpressions: true,
    // shuffleStringArray: true,
    // splitStrings: true,
    // splitStringsChunkLength: 5,
    // stringArray: true,
    // stringArrayEncoding: ['base64', 'rc4'],
    // stringArrayThreshold: .75,
    // rotateStringArray: true,
    // transformObjectKeys: true,
    // identifierNamesGenerator: 'hexadecimal',
    // debugProtection: true,
    // debugProtectionInterval: 4000,
    // selfDefending: true,
    // disableConsoleOutput: true
};
async function processFile(srcFile, options, version) {
    try {
        const fileContent = await fs.readFile(srcFile, 'utf8');
        const obfuscatedCode = JavaScriptObfuscator.obfuscate(fileContent); //options
        const result = await minify(obfuscatedCode.getObfuscatedCode(), {
            compress: {
                drop_console: true // Un-commented and applied
            }
        });
        if (!result || !result.code) {
            throw new Error('Minification failed.');
        }
        const finalCode = `// Version: ${version}\n${result.code}`;
        const writeFileBack = await fs.writeFile(srcFile, finalCode, 'utf8');
    } catch (error) {
        console.error(`Error processing file ${srcFile}:`, error);
    }
}
processFile(srcFiles, options, version).then(() => {
    console.log('All files processed.');
});



/*const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Read the HTML file
const htmlFilePath = '/Users/guunszz/Tbd_web_Move_24_Dec/tbd_web/view/leadgen-intl-sri.html';
let htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

// Function to extract JavaScript code from the HTML file
function extractJavaScript(html) {
    const scriptStartTag = '<script>';
    const scriptEndTag = '</script>';
    let jsCodeArray = [];
    let startIndex = html.indexOf(scriptStartTag);
    while (startIndex !== -1) {
        const endIndex = html.indexOf(scriptEndTag, startIndex);
        if (endIndex === -1) break;
        jsCodeArray.push(html.substring(startIndex + scriptStartTag.length, endIndex).trim());
        startIndex = html.indexOf(scriptStartTag, endIndex);
    }
    return jsCodeArray;
}

// Extract JavaScript code from the HTML file
const jsCodeArray = extractJavaScript(htmlContent);

// Obfuscate each JavaScript code block
const obfuscatedJsArray = jsCodeArray.map(jsCode => {
    const obfuscationResult = JavaScriptObfuscator.obfuscate(jsCode, {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        numbersToExpressions: true,
        simplify: true,
        shuffleStringArray: true,
        splitStrings: true,
        stringArrayThreshold: 0.75
    });
    return obfuscationResult.getObfuscatedCode();
});

// Function to replace JavaScript code in the HTML file
function replaceJavaScript(html, obfuscatedJsArray) {
    const scriptStartTag = '<script>';
    const scriptEndTag = '</script>';
    let startIndex = html.indexOf(scriptStartTag);
    let newHtml = '';
    let lastIndex = 0;
    let jsIndex = 0;
    while (startIndex !== -1) {
        const endIndex = html.indexOf(scriptEndTag, startIndex);
        if (endIndex === -1) break;
        newHtml += html.substring(lastIndex, startIndex + scriptStartTag.length) + '\n' + obfuscatedJsArray[jsIndex] + '\n' + scriptEndTag;
        lastIndex = endIndex + scriptEndTag.length;
        startIndex = html.indexOf(scriptStartTag, lastIndex);
        jsIndex++;
    }
    newHtml += html.substring(lastIndex);
    return newHtml;
}

// Replace the original JavaScript code with the obfuscated code
htmlContent = replaceJavaScript(htmlContent, obfuscatedJsArray);

// Write the obfuscated HTML content to a new file
const obfuscatedHtmlFilePath = '/Users/guunszz/Tbd_web_Move_24_Dec/tbd_web/view/leadgen-intl-sri-obfuscated.html';
fs.writeFileSync(obfuscatedHtmlFilePath, htmlContent);

console.log('HTML file has been obfuscated and saved as leadgen-intl-sri-obfuscated.html');*/