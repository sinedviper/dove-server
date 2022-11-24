import path from "path";
import { createWriteStream, unlink } from "node:fs";
import { v4 as uuidv4 } from "uuid";

/**
 * Stores a GraphQL file upload in the filesystem.
 * @param {Promise<
 *   import("graphql-upload/processRequest.mjs").FileUpload
 * >} upload GraphQL file upload.
 * @returns {Promise<string>} Resolves the stored file name.
 */
export default async function storeUpload(upload) {
  const { createReadStream } = await upload;
  const stream = createReadStream();
  const storedFileName = `${uuidv4()}`;
  const storedFileUrl = new URL(storedFileName, path.dirname("src/images/"));

  // Store the file in the filesystem.
  await new Promise((resolve, reject) => {
    const writeStream = createWriteStream(storedFileUrl);
    writeStream.on("finish", resolve);
    writeStream.on("error", (error) => {
      unlink(storedFileUrl, () => {
        reject(error);
      });
    });

    stream.on("error", (error) => writeStream.destroy(error));
    stream.pipe(writeStream);
  });

  return storedFileName;
}
