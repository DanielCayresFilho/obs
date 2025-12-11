import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';

const API_BASE_URL = 'import { API_BASE_URL } from \'@/config/api\';';

// Encontrar todos os arquivos .vue e .js (exceto node_modules e dist)
const files = globSync('src/**/*.{vue,js}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/config/api.js']
});

let totalReplacements = 0;
let filesModified = 0;

files.forEach(file => {
  let content = readFileSync(file, 'utf-8');
  let modified = false;
  let localReplacements = 0;

  // Substituir todas as ocorrências de 'http://localhost:3000' por ${API_BASE_URL}
  const regex = /'http:\/\/localhost:3000([^']*)'|"http:\/\/localhost:3000([^"]*)"/g;
  const newContent = content.replace(regex, (match, path1, path2) => {
    const path = path1 || path2;
    localReplacements++;
    return '`${API_BASE_URL}' + path + '`';
  });

  if (newContent !== content) {
    modified = true;
    content = newContent;
  }

  // Adicionar import se necessário e se houver substituições
  if (modified && !content.includes('API_BASE_URL')) {
    // Detectar se é Vue ou JS
    if (file.endsWith('.vue')) {
      // Adicionar import no script setup ou script
      if (content.includes('<script setup>')) {
        content = content.replace(
          /<script setup>\n/,
          `<script setup>\nimport { API_BASE_URL } from '@/config/api';\n`
        );
      } else if (content.includes('<script>')) {
        content = content.replace(
          /<script>\n/,
          `<script>\nimport { API_BASE_URL } from '@/config/api';\n`
        );
      }
    } else {
      // Arquivo JS - adicionar import no topo
      const lines = content.split('\n');
      const firstImportIndex = lines.findIndex(line => line.startsWith('import'));
      if (firstImportIndex !== -1) {
        lines.splice(firstImportIndex, 0, API_BASE_URL);
      } else {
        lines.unshift(API_BASE_URL);
      }
      content = lines.join('\n');
    }
  }

  if (modified) {
    writeFileSync(file, content, 'utf-8');
    filesModified++;
    totalReplacements += localReplacements;
    console.log(`✅ ${file}: ${localReplacements} substituições`);
  }
});

console.log(`\n🎉 Concluído!`);
console.log(`📁 Arquivos modificados: ${filesModified}`);
console.log(`🔄 Total de substituições: ${totalReplacements}`);
