import * as fs from 'fs';

// Function to read JSON file
export function readJsonFile(filePath: string): any {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}

// Function to write to a JSON file
export function writeJsonFile(filePath: string, jsonData: any): void {
    try {
        const data = JSON.stringify(jsonData, null, 4); // pretty-print with 4 space indentation
        fs.writeFileSync(filePath, data, 'utf-8');
        console.log('Data written successfully to', filePath);
    } catch (error) {
        console.error('Error writing JSON file:', error);
    }
}

export function increaseItemId(item: string): number {
    const idFilePath = `${process.cwd()}/ignition/modules/utils/id.json`;
    const idFile = readJsonFile(idFilePath);
    const itemId = idFile[item];
    writeJsonFile(idFilePath, { ...idFile, [item]: itemId + 1 });
    return itemId;
}