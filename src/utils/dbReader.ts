import { readFile, opendir } from 'node:fs/promises'
import { resolve } from 'node:path'

export type DB = Record<string, unknown[] | Record<string, unknown>>

export async function initDB(path: string) {
  const db: DB = {}

  async function readUTF8(filename: string) {
    const buffer = await readFile(filename)

    const rawData = new Uint8Array(buffer)
    const data = removeBOM(rawData)
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(data)
  }

  function removeBOM(data: Uint8Array) {
    if (data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
      return data.subarray(3)
    }

    return data
  }

  async function readDB(path: string) {
    const dir = await opendir(path)

    for await (const dirent of dir) {
      if (dirent.isDirectory()) {
        const entry = []

        const dbDirPath = resolve(path, dirent.name)

        for await (const fileDirent of await opendir(dbDirPath)) {
          if (fileDirent.isFile()) {
            const dbFilePath = resolve(dbDirPath, fileDirent.name)
            const content = await readUTF8(dbFilePath)

            try {
              const contentLines = content
                .split(/\r\n|\n/)
                .filter((line) => line || line.trim().length !== 0)

              for (const line of contentLines) {
                const jobject = JSON.parse(line)
                entry.push({
                  id: Number(fileDirent.name.split(/^[a-z]+|\..+$/i)[1]),
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
