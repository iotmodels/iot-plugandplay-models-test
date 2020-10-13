const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const { dtmiToPath } = require('../repo-convention.js')
const repo = 'repo.azureiotrepository.com'

const createInterfaceFromJson = async jsonDtdl => {
  const dtmi = jsonDtdl['@id']
  const fileName = path.join(process.cwd(), dtmiToPath(dtmi))
  if (fs.existsSync(fileName)) {
    console.log(`ERROR: ID ${dtmi} already exists at ${fileName} . Aborting `)
    return false
  }
  await mkdirp(path.dirname(fileName))
  fs.writeFileSync(fileName, JSON.stringify(jsonDtdl, null, 2))
  console.log(`Model ${dtmi} added successfully to ${fileName}`)
}

const migrate = async () => {
  const file = path.resolve(process.argv[2])
  console.log('exporting', file)
  const ids = JSON.parse(fs.readFileSync(file, 'utf-8'))
  for await (const id of ids) {
    const dtdlJson = await (await fetch(`https://${repo}/models/${id}?api-version=2020-05-01-preview`)).json()
    await createInterfaceFromJson(dtdlJson)
  }
}

migrate().then(() => console.log('done')).catch(e => console.error(e))
