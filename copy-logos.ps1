# Script para copiar logos de images/login para assets/logos
$source = "src\assets\images\login\bloxify"
$dest = "src\assets\logos\bloxify"

# Criar diretório de destino se não existir
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Copiar arquivos
Copy-Item "$source\tokengrid-transp.png" -Destination "$dest\tokengrid-transp.png" -Force
Copy-Item "$source\tokengrid-black-trasnp.png" -Destination "$dest\tokengrid-black-trasnp.png" -Force
Copy-Item "$source\bloxify-logo.png" -Destination "$dest\bloxify-logo.png" -Force

Write-Host "Logos copiados com sucesso!"
Get-ChildItem $dest | Select-Object Name

