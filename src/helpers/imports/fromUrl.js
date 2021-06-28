import { cthHttpGetFile } from "./httpGetFile"
import { cthLoadFromContent } from "./loadFromContent"

export const cthImportFromUrl = async (options) => {
  return cthLoadFromContent(
      await cthHttpGetFile(options), 
      options.filename
    );
}
