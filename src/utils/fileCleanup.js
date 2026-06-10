import fs from "fs";

export const cleanupRequestFiles = (req) => {
  const files = req.file ? [req.file] : Object.values(req.files || {}).flat();
  return Promise.all(
    files.map((file) => fs.promises.unlink(file.path).catch(() => {})),
  );
};
