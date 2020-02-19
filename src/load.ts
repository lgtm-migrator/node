import path from 'path'

import validate from './validate'
import { generateTypeFromSchema } from './utils/generate-type-from-schema'
import { hydrateConfig } from './utils/hydrate-config'
import { readConfigFile, readSchemaFile } from './utils/read-file'
import * as sops from './utils/sops'

import { HydratedConfig } from './types'
import { Options } from './options'

export const load = (runtimeEnv: string, options: Options): HydratedConfig => {
  const normalizedConfigRoot = path.normalize(options.configRoot)

  const configFile = readConfigFile(normalizedConfigRoot, runtimeEnv)

  const decrypted = sops.decryptToObject(
    configFile.filePath,
    configFile.contents
  )

  const config = hydrateConfig(runtimeEnv, options)(decrypted)
  const schemaFile = readSchemaFile(normalizedConfigRoot)

  if (schemaFile) {
    validate(runtimeEnv, normalizedConfigRoot)
    // TODO: replace with proper logger and only log if in debug-mode
    console.debug(`[💪 strong-config] ✅ ${runtimeEnv} config is valid`)

    if (options.types !== false) {
      generateTypeFromSchema(normalizedConfigRoot, options.types)
    }
  } else {
    // TODO: replace with proper logger and only log if in debug-mode
    console.debug(
      `[💪 strong-config] ⚠️ No schema file found under '${normalizedConfigRoot}/schema.json'. We recommend creating a schema so Strong Config can ensure your config is valid.`
    )
  }

  return config
}
