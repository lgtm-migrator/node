import { JSONSchema4 } from 'json-schema'

type JSON = string | number | boolean | null | JSON[] | JSONObject

export type JSONObject = { [key: string]: JSON }

export type Schema = JSONSchema4

type SopsMetadata = {
  kms: unknown | null
  gcp_kms: unknown | null
  azure_kv: unknown | null
  pgp: unknown | null
  lastmodified: string
  mac: string
  version: string
  encrypted_suffix?: string | null
}

export type BaseConfig = JSONObject

export type EncryptedConfig = { sops?: SopsMetadata } & BaseConfig

export type DecryptedConfig = Omit<BaseConfig, 'sops'>

export type HydratedConfig = { runtimeEnv: string } & DecryptedConfig

export type MemoizedConfig = HydratedConfig | undefined

export const ConfigFileExtensions = ['json', 'yaml', 'yml']

export type EncryptedConfigFile = {
  contents: EncryptedConfig
  filePath: string
}
