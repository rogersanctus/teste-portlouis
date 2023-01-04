import { readFile, opendir } from 'node:fs/promises'
import { resolve } from 'node:path'

export async function initDB(path: string) {
  const db: Record<string, unknown[]> = {}

  async function readDB(path: string) {
    const dir = await opendir(path)

    for await (const dirent of dir) {
      if (dirent.isDirectory()) {
        const entry = []

        const dbDirPath = resolve(path, dirent.name)

        for await (const fileDirent of await opendir(dbDirPath)) {
          if (fileDirent.isFile()) {
            const dbFilePath = resolve(dbDirPath, fileDirent.name)
            const content = await readFile(dbFilePath, { encoding: 'utf-8' })

            try {
              const contentLines = content
                .split(/\r\n|\n/)
                .filter((line) => line || line.trim().length !== 0)

              for (const line of contentLines) {
                const jobject = JSON.parse(line)
                entry.push({
                  id: Number(fileDirent.name.split(/^[a-z]+|\..+$/)[1]),
                  ...jobject,
                })
              }
            } catch (error) {
              console.error(error)
            }
          }
        }
        db[dirent.name] = entry
      }
    }
  }

  await readDB(path)

  return db
}
