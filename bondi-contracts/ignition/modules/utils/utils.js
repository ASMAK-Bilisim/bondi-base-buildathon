"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJsonFile = readJsonFile;
exports.writeJsonFile = writeJsonFile;
exports.increaseItemId = increaseItemId;
const fs = __importStar(require("fs"));
// Function to read JSON file
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}
// Function to write to a JSON file
function writeJsonFile(filePath, jsonData) {
    try {
        const data = JSON.stringify(jsonData, null, 4); // pretty-print with 4 space indentation
        fs.writeFileSync(filePath, data, 'utf-8');
        console.log('Data written successfully to', filePath);
    }
    catch (error) {
        console.error('Error writing JSON file:', error);
    }
}
function increaseItemId(item) {
    const idFilePath = `${process.cwd()}/ignition/modules/utils/id.json`;
    const idFile = readJsonFile(idFilePath);
    const itemId = idFile[item];
    writeJsonFile(idFilePath, { ...idFile, [item]: itemId + 1 });
    return itemId;
}
