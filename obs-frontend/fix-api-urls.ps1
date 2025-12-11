# Script PowerShell para substituir URLs hardcoded

$files = Get-ChildItem -Path "src" -Include "*.vue","*.js" -Recurse | Where-Object { $_.FullName -notmatch "node_modules|dist|config\\api\.js" }

$totalReplacements = 0
$filesModified = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $localReplacements = 0

    # Substituir URLs hardcoded
    $content = $content -replace "'http://localhost:3000([^']*)'", '`${API_BASE_URL}$1`'
    $content = $content -replace '"http://localhost:3000([^"]*)"', '`${API_BASE_URL}$1`'

    # Contar substituicoes
    $localReplacements = ([regex]::Matches($originalContent, "http://localhost:3000")).Count

    if ($content -ne $originalContent) {
        $filesModified++
        $totalReplacements += $localReplacements

        # Adicionar import se necessario
        if ($content -notmatch "API_BASE_URL.*from.*@/config/api") {
            if ($file.Extension -eq ".vue") {
                # Arquivo Vue
                if ($content -match "<script setup>") {
                    $content = $content -replace "(<script setup>[\r\n]+)", "`$1import { API_BASE_URL } from '@/config/api';`r`n"
                } elseif ($content -match "<script>") {
                    $content = $content -replace "(<script>[\r\n]+)", "`$1import { API_BASE_URL } from '@/config/api';`r`n"
                }
            } else {
                # Arquivo JS
                $lines = $content -split "`r?`n"
                $firstImportIndex = 0
                for ($i = 0; $i -lt $lines.Length; $i++) {
                    if ($lines[$i] -match "^import ") {
                        $firstImportIndex = $i
                        break
                    }
                }
                $lines = @("import { API_BASE_URL } from '@/config/api';") + $lines
                $content = $lines -join "`r`n"
            }
        }

        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "OK $($file.Name): $localReplacements substituicoes" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Concluido!" -ForegroundColor Cyan
Write-Host "Arquivos modificados: $filesModified" -ForegroundColor Yellow
Write-Host "Total de substituicoes: $totalReplacements" -ForegroundColor Yellow
