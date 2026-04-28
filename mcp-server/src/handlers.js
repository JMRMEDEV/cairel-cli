import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const PLANNING = resolve(ROOT, 'planning');

function text(data) {
  return { content: [{ type: 'text', text: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }] };
}

function readFile(relPath) {
  try {
    return readFileSync(resolve(PLANNING, relPath), 'utf-8');
  } catch {
    return null;
  }
}

function extractSection(filePath, heading) {
  const content = readFile(filePath);
  if (!content) return null;
  const lines = content.split('\n');
  const headingLower = heading.toLowerCase();
  let start = -1, startLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,4})\s+(.+)/);
    if (m && m[2].toLowerCase().includes(headingLower)) { start = i; startLevel = m[1].length; break; }
  }
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,4})\s+/);
    if (m && m[1].length <= startLevel) { end = i; break; }
  }
  return lines.slice(start, end).join('\n').trim();
}

function getTaskInfo(id) {
  const normalized = id.toUpperCase().replace(/^TASK-?/, 'TASK-');
  const content = readFile(`tasks/${normalized}.md`);
  return content ?? null;
}

function listTaskIds(filters) {
  const readme = readFile('tasks/README.md');
  if (!readme) return [];
  const results = [];
  for (const line of readme.split('\n')) {
    const m = line.match(/^\| \[?(TASK-\d+|BUG-\d+)\]?.*?\| (.+?) \| (P\d) \|/);
    if (!m) continue;
    const entry = { id: m[1], title: m[2].trim(), priority: m[3] };
    if (filters.priority && entry.priority !== filters.priority.toUpperCase()) continue;
    results.push(entry);
  }
  return results;
}

let storyIndex = null;

function loadStoryIndex() {
  if (storyIndex) return storyIndex;
  const raw = readFile('user-stories/INDEX.md');
  if (!raw) {
    storyIndex = [];
    try {
      const files = readdirSync(resolve(PLANNING, 'user-stories')).filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'INDEX.md');
      for (const file of files) {
        const content = readFile(`user-stories/${file}`);
        if (!content) continue;
        const idMatch = content.match(/^#\s+(\S+):/m);
        const titleMatch = content.match(/^#\s+\S+:\s+(.+)/m);
        const priorityMatch = content.match(/\|\s*Priority\s*\|\s*(\S+)\s*\|/i);
        const scopeMatch = content.match(/\|\s*Scope\s*\|\s*(\S+)\s*\|/i);
        if (idMatch) {
          storyIndex.push({
            id: idMatch[1], title: titleMatch?.[1]?.trim() ?? file, file,
            priority: priorityMatch?.[1] ?? '', scope: scopeMatch?.[1] ?? '',
          });
        }
      }
    } catch { /* empty dir */ }
    return storyIndex;
  }
  storyIndex = [];
  for (const line of raw.split('\n')) {
    const m = line.match(/^(\S+)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*\|\s*(.+?)\s*\|\s*(\S+)\s*\|\s*(\S+)\s*$/);
    if (!m || m[1] === 'ID') continue;
    storyIndex.push({ id: m[1], priority: m[2], scope: m[3], title: m[4].trim(), domain: m[5], subprojects: m[6] });
  }
  return storyIndex;
}

function getUserStory(id) {
  const upper = id.toUpperCase();
  const direct = readFile(`user-stories/${upper}.md`);
  if (direct) return direct;
  const index = loadStoryIndex();
  const entry = index.find(s => s.id === upper);
  if (!entry) return null;
  return readFile(`user-stories/${entry.file}`) ?? null;
}

export function handleToolCall(name, args) {
  switch (name) {
    case 'get_doc': {
      const content = readFile(args.path);
      return content ? text(content) : text({ error: `File not found: ${args.path}` });
    }
    case 'get_doc_section': {
      const section = extractSection(args.path, args.heading);
      return section ? text(section) : text({ error: `Section "${args.heading}" not found in ${args.path}` });
    }
    case 'get_task_info': {
      const content = getTaskInfo(args.id);
      return content ? text(content) : text({ error: `Task not found: ${args.id}` });
    }
    case 'list_task_ids': {
      const tasks = listTaskIds({ priority: args.priority });
      if (tasks.length === 0) return text('No tasks found matching filters.');
      return text(tasks.map(t => `${t.id} | ${t.priority} | ${t.title}`).join('\n'));
    }
    case 'get_user_story': {
      const story = getUserStory(args.id);
      return story ? text(story) : text({ error: `User story not found: ${args.id}` });
    }
    case 'list_user_stories': {
      let results = loadStoryIndex();
      if (args.priority) results = results.filter(s => s.priority === args.priority.toUpperCase());
      if (args.scope) results = results.filter(s => s.scope.toUpperCase() === args.scope.toUpperCase());
      if (results.length === 0) return text('No user stories found matching filters.');
      return text(results.map(s => `${s.id} | ${s.priority} | ${s.scope} | ${s.title}`).join('\n'));
    }
    case 'get_architecture_decision': {
      const content = readFile(`docs/architecture/${args.name}`);
      return content ? text(content) : text({ error: `Architecture decision not found: ${args.name}` });
    }
    default:
      return text({ error: `Unknown tool: ${name}` });
  }
}
