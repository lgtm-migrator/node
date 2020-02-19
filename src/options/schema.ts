export const optionsSchema = {
  type: 'object',
  title: 'Schema for strong-config options',
  required: ['configRoot', 'runtimeEnvName', 'types', 'substitutionPattern'],
  additionalProperties: false,
  properties: {
    configRoot: {
      title: 'Config root path',
      description: 'A path to a directory that contains all config files',
      examples: ['config', '../config', 'app/config/'],
      type: 'string',
    },
    runtimeEnvName: {
      title: 'Runtime environment variable name',
      description:
        'The value of this variable determines which config is loaded',
      examples: ['NODE_ENV', 'RUNTIME_ENVIRONMENT'],
      type: 'string',
      pattern: '^[a-zA-Z]\\w*$',
    },
    types: {
      title: 'Type-related options',
      description:
        'Type-related options controlling the generation of Typescript types for the config',
      type: ['object'],
      additionalProperties: false,
      properties: {
        rootTypeName: {
          title: 'Root type name',
          description: 'The name of the generated root type',
          examples: ['Config', 'AppConfig'],
          type: 'string',
          pattern: '^[A-Z]\\w*$',
        },
        fileName: {
          title: 'File name for auto-generated TypeScript types',
          description:
            'Name for the types file containing auto-generated TypeScript types for your config',
          examples: ['types.d.ts', 'config.d.ts'],
          type: 'string',
        },
      },
    },
    substitutionPattern: {
      title: 'Substitution pattern',
      description:
        'The escaped regexp that is used to match against template strings to be replaced with their corresponding environment variable values',
      examples: ['\\$\\{(\\w+)\\}', '\\$(\\w+)'],
      type: 'string',
      format: 'regex',
    },
  },
}
