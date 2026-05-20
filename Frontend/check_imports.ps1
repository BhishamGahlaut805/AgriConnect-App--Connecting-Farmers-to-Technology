$srcRoot = "src"
$extensions = ".js", ".jsx", ".ts", ".tsx"
$files = Get-ChildItem -Path $srcRoot -Recurse -Include *.js, *.jsx, *.ts, *.tsx

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw
        if ($null -eq $content) { continue }
        
        $matches = [regex]::Matches($content, 'from\s+[''"]([^''"]+)[''"]')
        
        foreach ($match in $matches) {
            $importPath = $match.Groups[1].Value
            if ($importPath.StartsWith(".")) {
                $dir = Split-Path $file.FullName
                $targetPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($dir, $importPath))
                $actualPath = $null
                $found = $false
                
                if (Test-Path $targetPath) {
                    $actualPath = (Get-Item $targetPath).FullName
                    $found = $true
                } else {
                    foreach ($ext in $extensions) {
                        if (Test-Path "$targetPath$ext") {
                            $actualPath = (Get-Item "$targetPath$ext").FullName
                            $found = $true
                            break
                        }
                        $indexPath = Join-Path $targetPath "index$ext"
                        if (Test-Path $indexPath) {
                            $actualPath = (Get-Item $indexPath).FullName
                            $found = $true
                            break
                        }
                    }
                }
                
                if ($found) {
                    $importingDir = Split-Path $file.FullName
                    $parts = $importPath.Split("/")
                    $currentTestPath = $importingDir
                    $mismatchFound = $false
                    $mismatchType = ""
                    
                    foreach ($part in $parts) {
                        if ($part -eq ".") { continue }
                        if ($part -eq "..") {
                            $currentTestPath = Split-Path $currentTestPath
                            continue
                        }
                        
                        $foundPart = $false
                        $testSubPath = Join-Path $currentTestPath $part
                        if (Test-Path $testSubPath) {
                            $item = Get-Item $testSubPath
                            if ($item.Name -ne $part) {
                                $mismatchFound = $true
                                if ($item.PSIsContainer) { $mismatchType = "folder-case" }
                                else {
                                    $partName = [System.IO.Path]::GetFileNameWithoutExtension($part)
                                    $itemName = [System.IO.Path]::GetFileNameWithoutExtension($item.Name)
                                    $partExt = [System.IO.Path]::GetExtension($part)
                                    $itemExt = [System.IO.Path]::GetExtension($item.Name)
                                    if ($partName -ne $itemName) { $mismatchType = "file-name-case" }
                                    elseif ($partExt -ne $itemExt) { $mismatchType = "extension-case" }
                                    else { $mismatchType = "case-mismatch" }
                                }
                            }
                            $currentTestPath = Join-Path $currentTestPath $item.Name
                            $foundPart = $true
                        } else {
                            $items = Get-ChildItem -Path $currentTestPath
                            foreach ($item in $items) {
                                $itemNameWithoutExt = [System.IO.Path]::GetFileNameWithoutExtension($item.Name)
                                if ($itemNameWithoutExt -ieq $part) {
                                    if ($itemNameWithoutExt -ne $part) {
                                        $mismatchFound = $true
                                        $mismatchType = "file-name-case"
                                    }
                                    $currentTestPath = Join-Path $currentTestPath $item.Name
                                    $foundPart = $true
                                    break
                                }
                            }
                        }
                        if (-not $foundPart) { break }
                    }
                    
                    if ($mismatchFound) {
                        [PSCustomObject]@{
                            ImportingFile = $file.FullName.Replace((Get-Item .).FullName, "")
                            ImportText = $importPath
                            ActualPath = $currentTestPath.Replace((Get-Item .).FullName, "")
                            MismatchType = $mismatchType
                        }
                    }
                }
            }
        }
    } catch {}
}
