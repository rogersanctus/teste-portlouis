import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

type JObject = Record<string, unknown>

function prependBOM(buffer: Uint8Array) {
  const BOM = [0xef, 0xbb, 0xbf]
  return new Uint8Array([...BOM, ...buffer])
}

export async function writeToDB(
  dbPath: string,
  modelPath: string,
  filename: string,
  jsonData: JObject | JObject[]
) {
  let jsonStr = ''

  try {
    if (Array.isArray(jsonData)) {
      jsonData.forEach((jsonItem) => {
        jsonStr += JSON.stringify(jsonItem) + '\n'
      })
    } else {
      jsonStr = JSON.stringify(jsonData)
    }
  } catch (error) {
    console.error(
      "The jsonData could not be parsed into a string version of it. May be it's invalid.",
      error
    )
    return
  }

  const encoder = new TextEncoder()
  const buffer = prependBOM(encoder.encode(jsonStr))

  try {
    const path = resolve(dbPath, modelPath)

    if (!existsSync(path)) {
      await mkdir(path)
    }

    const filePath = resolve(path, filename)

    await writeFile(filePath, buffer)
  } catch (error) {
    console.error(
      `Could not write file: ${filename} with the assigned json content.`,
      error
    )
  }
}
