import axios from 'axios'
import { Octokit } from 'octokit'
import moment from 'moment'
import fs from 'fs'
import path from 'path'

interface ContentResponse {
  name: string
  path: string
  type: 'file' | 'dir'
  content: string
}

interface TemplateEntry {
  id: string
  author: string
  category: string
  description: string
  updatedAt: Date
}

const base = { owner: 'botpress', repo: 'openbook-templates' }
const branch = 'ya-test'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

const getTemplateIds = async () => {
  const res = await octokit.rest.repos.getContent({ ...base, path: 'templates', ref: branch })

  return (res.data as ContentResponse[])
    .filter((x) => x.type === 'dir')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((x) => x.name)
}

const getTemplateMetadata = async (templateId: string) => {
  try {
    const res = await axios.get<ContentResponse>(
      `https://api.github.com/repos/botpress/openbook-templates/contents/templates/${templateId}/metadata.json?ref=${branch}`
    )

    const updatedAt = moment(res.headers['last-modified']).toDate()
    const details = Buffer.from(res.data.content, 'base64').toString()

    return { id: templateId, ...JSON.parse(details), updatedAt }
  } catch (err) {
    console.error('Error getting metadata for', templateId, err)
  }
}

const updateFile = async () => {
  const templates: TemplateEntry[] = []

  for (const id of await getTemplateIds()) {
    const metadata = await getTemplateMetadata(id)
    if (metadata) {
      templates.push(metadata)
    }
  }

  fs.writeFileSync(path.resolve(__dirname, '../templates.json'), JSON.stringify(templates, undefined, 2))
}

updateFile()
