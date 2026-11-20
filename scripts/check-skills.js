#!/usr/bin/env node
'use strict'
// Checks that every contributor skill in skills/ is listed in AGENTS.md and
// symlinked from .claude/skills/, and that skills/team/ skills are not.
//
// Usage: node scripts/check-skills.js

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SKILLS = path.join(ROOT, 'skills')
const TEAM = path.join(SKILLS, 'team')
const CLAUDE_SKILLS = path.join(ROOT, '.claude/skills')

const dirs = (dir) => fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  : []
const hasSkill = (dir) => fs.existsSync(path.join(dir, 'SKILL.md'))

const agents = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8')
const errors = []

const contributor = dirs(SKILLS).filter((n) => n !== 'team' && hasSkill(path.join(SKILLS, n)))
const team = dirs(TEAM).filter((n) => hasSkill(path.join(TEAM, n)))

for (const name of dirs(SKILLS)) {
  if (name !== 'team' && !hasSkill(path.join(SKILLS, name))) errors.push(`skills/${name} has no SKILL.md`)
}

for (const name of contributor) {
  if (!agents.includes(`skills/${name}/SKILL.md`)) errors.push(`AGENTS.md does not list skills/${name}/SKILL.md`)
  const link = path.join(CLAUDE_SKILLS, name)
  let target = null
  try { target = fs.realpathSync(link) } catch (e) { /* missing */ }
  if (target !== path.join(SKILLS, name)) errors.push(`.claude/skills/${name} must be a symlink to ../../skills/${name}`)
}

for (const name of dirs(CLAUDE_SKILLS)) {
  if (!contributor.includes(name)) errors.push(`.claude/skills/${name} does not match a contributor skill in skills/`)
}

for (const name of team) {
  if (agents.includes(`skills/team/${name}/SKILL.md`)) errors.push(`AGENTS.md lists team skill ${name}`)
  if (fs.existsSync(path.join(CLAUDE_SKILLS, name))) errors.push(`.claude/skills/${name} exposes a team skill to contributors`)
}

if (errors.length) {
  console.error(errors.map((e) => `[ERROR] ${e}`).join('\n'))
  process.exit(1)
}
console.log(`OK: ${contributor.length} contributor skills, ${team.length} team skills`)
