import { callbackify } from 'util'
import { readFileSync, writeFileSync } from 'fs'
import { compileFromFile } from 'json-schema-to-typescript'
import { prop } from 'ramda'
import Debug from 'debug'
import type { TypeOptions } from './options'
import { pascalCase } from './utils/pascal-case'

const debug = Debug('strong-config:generate-types')

export const generateTypesFromSchema = async (
  configRoot: string,
  typeOptions: TypeOptions
): Promise<void> => {
  const schemaPath = `${configRoot}/schema.json`

  const baseTypes = await compileFromFile(schemaPath, {
    style: { semi: false },
  })
  debug(`Compiled base types from ${schemaPath} : %s`, '\n'.concat(baseTypes))

  const schemaString = readFileSync(schemaPath).toString()
  debug('Read schema file: %s', '\n'.concat(schemaString))

  let parsedSchemaString

  try {
    parsedSchemaString = JSON.parse(schemaString) as Record<string, unknown>
    debug('Parsed schema string to JSON:\n%O\n', parsedSchemaString)
  } catch (error) {
    if (error instanceof Error) {
      const prettyError = new Error(
        `Failed to JSON.parse(schemaString):\n${schemaString}`
      )
      prettyError.stack = error.stack
      throw prettyError
    } else {
      throw error
    }
  }

  const title = prop('title', parsedSchemaString)

  if (title === undefined) {
    throw new Error(
      "Expected top-level attribute 'title' in schema definition."
    )
  }

  if (typeof title !== 'string') {
    throw new TypeError(
      `'Title' attribute in schema definition must be a string, but is of type '${typeof title}'`
    )
  }

  if (title.toLowerCase() === 'config') {
    throw new Error(
      'Title attribute of top-level schema definition must not be named Config or config'
    )
  }

  const configInterfaceAsString = `
export interface ${typeOptions.rootTypeName} extends ${pascalCase(title)} {
  runtimeEnv: string
}`
  const exportedTypes = baseTypes.concat(configInterfaceAsString)

  writeFileSync(`${configRoot}/${typeOptions.fileName}`, exportedTypes)
  debug(
    `Wrote generated types to file '${configRoot}/${typeOptions.fileName}': %s`,
    '\n'.concat(exportedTypes)
  )
}

export const generateTypesFromSchemaCallback = callbackify(
  generateTypesFromSchema
)
