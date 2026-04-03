import {
  createServer
} from 'node:http'
import {
  existsSync
} from 'node:fs'
import {
  mkdir,
  readFile,
  writeFile
} from 'node:fs/promises'
import {
  createRequire
} from 'node:module'
import {
  dirname,
  join
} from 'node:path'
import {
  fileURLToPath
} from 'node:url'
import {
  createSchema,
  createYoga
} from 'graphql-yoga'
import {
  useDeferStream
} from '@graphql-yoga/plugin-defer-stream'
import { useSofa } from '@graphql-yoga/plugin-sofa'

const require = createRequire(import.meta.url)
const currentDir = dirname(fileURLToPath(import.meta.url))
const gatewayPackageJsonPath = join(currentDir, '..', 'package.json')
const fallbackDatabaseDir = join(currentDir, 'database')
const fallbackSqlitePath = join(fallbackDatabaseDir, 'gateway.sqlite')

function isAdapterPackageName(name) {
  return /(^|\/)adapter-[\w-]+$/.test(name)
}

function collectAdapterPackageNames(packageJson) {
  const dependencyNames = Object.keys(packageJson.dependencies || {})
  const devDependencyNames = Object.keys(packageJson.devDependencies || {})
  const allNames = [...dependencyNames, ...devDependencyNames]
  return [...new Set(allNames.filter(isAdapterPackageName))]
}

async function resolveAdapterSchemas(packageNames) {
  const loaded = []

  for (const packageName of packageNames) {
    try {
      const packageJsonFile = require.resolve(`${packageName}/package.json`)
      const packageRoot = dirname(packageJsonFile)
      const schemaPath = join(packageRoot, 'schema.graphql')
      const schemaSdl = await readFile(schemaPath, 'utf8')
      loaded.push({ packageName, schemaSdl })
    } catch {
      // Adapter package exists but does not expose a schema.graphql file.
    }
  }

  return loaded
}

async function ensureSqliteFallbackFile() {
  await mkdir(fallbackDatabaseDir, { recursive: true })
  if (!existsSync(fallbackSqlitePath)) {
    await writeFile(fallbackSqlitePath, '')
  }
  return fallbackSqlitePath
}

async function loadDynamicSchemaConfig() {
  const gatewayPackageJsonRaw = await readFile(gatewayPackageJsonPath, 'utf8')
  const gatewayPackageJson = JSON.parse(gatewayPackageJsonRaw)
  const adapterPackageNames = collectAdapterPackageNames(gatewayPackageJson)
  const adapterSchemas = await resolveAdapterSchemas(adapterPackageNames)

  if (adapterSchemas.length > 0) {
    const mergedSdl = adapterSchemas.map((entry) => entry.schemaSdl).join('\n')
    const hasQueryType = /\btype\s+Query\b/.test(mergedSdl)

    return {
      adapterPackageNames,
      schemaSource: `adapters:${adapterSchemas.map((entry) => entry.packageName).join(',')}`,
      typeDefs: /* GraphQL */ `
        ${mergedSdl}

        scalar File

        ${hasQueryType ? 'extend type Query' : 'type Query'} {
          greetings: String!
          schemaSource: String!
          availableAdapters: [String!]!
        }

        type Mutation {
          readTextFile(file: File!): String!
          saveFile(file: File!): Boolean!
        }
      `
    }
  }

  const sqlitePath = await ensureSqliteFallbackFile()
  return {
    adapterPackageNames,
    schemaSource: `sqlite:${sqlitePath}`,
    typeDefs: /* GraphQL */ `
      scalar File

      type Query {
        greetings: String!
        schemaSource: String!
        availableAdapters: [String!]!
      }

      type Mutation {
        readTextFile(file: File!): String!
        saveFile(file: File!): Boolean!
      }
    `
  }
}

(async () => {
  const schemaConfig = await loadDynamicSchemaConfig()

  // Provide your schema
  const yoga = createYoga({
    schema: createSchema({
      typeDefs: schemaConfig.typeDefs,
      resolvers: {
        Query: {
          greetings: () => 'Hello from gateway schema',
          schemaSource: () => schemaConfig.schemaSource,
          availableAdapters: () => schemaConfig.adapterPackageNames
        },
        Mutation: {
          readTextFile: async (_, { file }) => {
            const textContent = await file.text()
            return textContent
          },

          saveFile: async () => {
            return true
          }
        }
      }
    }),

    plugins: [
      useDeferStream(),
      useSofa({
        basePath: '/rest',
        swaggerUI: {
          endpoint: '/swagger'
        },
        title: 'M Framework API',
        version: '1.0.0'
      })
    ]
  })

  // Start the server and explore http://localhost:4000/graphql
  const server = createServer(yoga)
  server.listen(4000, () => {
    console.info(`Server is running on http://localhost:4000/graphql (${schemaConfig.schemaSource})`)
  })
})()
