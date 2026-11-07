export async function replaceAvatar(
  oldPath: string | null,
  io: {
    upload: () => Promise<string>;
    save: (path: string) => Promise<void>;
    remove: (path: string) => Promise<void>;
  },
) {
  const path = await io.upload();
  try {
    await io.save(path);
  } catch (error) {
    await io.remove(path).catch(() => {});
    throw error;
  }
  if (oldPath && oldPath !== path) await io.remove(oldPath).catch(() => {});
  return path;
}
