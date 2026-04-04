import { writeFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export const saveBase64Image = (
    base64Data,
    targetDirectory,
    targetDatabase
) => {
    try {
        const uniqueId = uuidv4();
        const metadata = base64Data.split(";")[0];
        const imageFormat = metadata.split("/")[1];

        const base64Image = base64Data.split(";base64,").pop();
        // eslint-disable-next-line no-undef
        const imageBuffer = Buffer.from(base64Image, "base64");

        const filename = `${Date.now()}${uniqueId}.${imageFormat}`;
        const filePath = join(
            `images/${targetDatabase}/${targetDirectory}`,
            filename
        );

        if (!existsSync(`images/${targetDatabase}/${targetDirectory}`)) {
            mkdirSync(`images/${targetDatabase}/${targetDirectory}`, {
                recursive: true,
            });
        }
        writeFileSync(filePath, imageBuffer);

        return filePath;
    } catch (error) {
        console.error("Failed to save base64 image:", error);
        throw new Error("Failed to save base64 image");
    }
};

export const saveBase64ImageWithAsync = async (
    base64Data,
    targetDirectory,
    targetDatabase,
    oldFilename = null
) => {
    try {
        const uniqueId = uuidv4();
        const metadata = base64Data.split(";")[0];
        const imageFormat = metadata.split("/")[1];

        const base64Image = base64Data.split(";base64,").pop();
        // eslint-disable-next-line no-undef
        const imageBuffer = Buffer.from(base64Image, "base64");

        const filename = `${Date.now()}${uniqueId}.${imageFormat}`;
        const filePath = join(
            `images/${targetDatabase}/${targetDirectory}`,
            filename
        );

        const directoryPath = `images/${targetDatabase}/${targetDirectory}`;
        if (!existsSync(directoryPath)) {
            mkdirSync(directoryPath, {
                recursive: true,
            });
        }

        // Delete the old image if the filename is provided
        if (oldFilename) {
            const oldFilePath = join(directoryPath, oldFilename);
            if (existsSync(oldFilePath)) {
                unlinkSync(oldFilePath);
            }
        }

        writeFileSync(filePath, imageBuffer);

        return filePath;
    } catch (error) {
        console.error("Failed to save base64 image:", error);
        throw new Error("Failed to save base64 image");
    }
};