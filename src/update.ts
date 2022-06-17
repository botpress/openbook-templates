import axios from 'axios'
import { Octokit } from 'octokit'
import moment from 'moment'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import 'bluebird-global'
import _ from 'lodash'

interface ContentResponse {
  name: string
  path: string
  type: 'file' | 'dir'
  content: string
}

interface TemplateEntry {
  id: string
  title: string
  author: string
  category: string
  description: string
  updatedAt: Date
}

const updateFile = async () => {
  const templatesRoot = path.resolve(__dirname, '../templates')

  const templates: TemplateEntry[] = []
  const templates_staging: TemplateEntry[] = []
  const templates_prod: TemplateEntry[] = []

  for (const id of fs.readdirSync(templatesRoot)) {
    const json = path.join(templatesRoot, id, 'metadata.json')

    try {
      if (fs.existsSync(json)) {
        const metadata = JSON.parse(fs.readFileSync(json).toString())

        if (!metadata.updatedAt) {
          const commitDate = await Promise.fromCallback<string>((cb) =>
            exec(`git log -n 1 --pretty=format:%cd ${json}`, cb)
          )

          metadata.updatedAt = new Date(commitDate)
        }

        const entry = { id, ..._.omit(metadata, ['production', 'staging']) }

        if (metadata.production) {
          templates_prod.push(entry)
        }

        if (metadata.staging) {
          templates_staging.push(entry)
        }

        templates.push(entry)
      }
    } catch (err) {
      console.error('Error processing', id)
    }
  }

  fs.writeFileSync(path.resolve(__dirname, '../templates.json'), JSON.stringify(templates, undefined, 2))

  fs.writeFileSync(
    path.resolve(__dirname, '../templates.production.json'),
    JSON.stringify(templates_prod, undefined, 2)
  )

  fs.writeFileSync(
    path.resolve(__dirname, '../templates.staging.json'),
    JSON.stringify(templates_staging, undefined, 2)
  )
}

updateFile()
