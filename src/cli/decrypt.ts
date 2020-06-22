#!/usr/bin/env node
import { Command, flags as Flags } from '@oclif/command'
import ora from 'ora'
import { getSopsOptions, runSopsWithOptions } from '../utils/sops'
import { loadSchema } from '../utils/read-files'
import { defaultOptions } from '../options'
import { validateCliWrapper } from './validate'

export class Decrypt extends Command {
  static description = 'decrypt config files'

  static strict = true

  static args = [
    {
      name: 'config_file',
      description:
        'path to a decrypted config file, for example: `strong-config decrypt config/production.yml`',
      required: true,
    },
    {
      name: 'output_path',
      description:
        'output file of the decrypted config. If not specified, the file found at CONFIG_FILE is overwritten in-place.',
      required: false,
    },
  ]

  static flags = {
    help: Flags.help({
      char: 'h',
      description: 'show help',
    }),
    'config-root': Flags.string({
      char: 'c',
      description:
        'your config folder containing your config files and optional schema.json',
      default: defaultOptions.configRoot,
    }),
  }

  static usage = 'decrypt CONFIG_FILE OUTPUT_PATH [--help]'

  static examples = [
    '$ decrypt config/development.yaml',
    '$ decrypt config/production.yaml config/production.decrypted.yaml',
    '$ decrypt --help',
  ]

  decrypt = (): void => {
    const { args, flags } = this.parse(Decrypt)

    const spinner = ora('Decrypting...').start()

    const sopsOptions = ['--decrypt', ...getSopsOptions(args, flags)]

    try {
      runSopsWithOptions(sopsOptions)
    } catch (error) {
      spinner.fail('Failed to decrypt config file')

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- i don't know how to make this any safer for typescript
      if (error.exitCode && error.exitCode === 1) {
        console.error(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- can safely ignore this because the config_file arg is always required
          `🤔 It looks like ${args.config_file} is already decrypted`
        )
      }

      console.error(error)
      process.exit(1)
    }

    spinner.succeed(`Successfully decrypted ${args.config_file as string}!`)
  }

  run(): Promise<void> {
    const { args, flags } = this.parse(Decrypt)

    this.decrypt()

    if (loadSchema(flags['config-root'])) {
      validateCliWrapper(args['config_file'], flags['config-root'])
    }

    process.exit(0)
  }
}
