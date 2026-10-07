# Petit serveur local pour prévisualiser le site : powershell -File serve.ps1
param([int]$Port = 8080)
$root = Join-Path $PSScriptRoot "site"
$l = New-Object System.Net.HttpListener; $l.Prefixes.Add("http://localhost:$Port/"); $l.Start()
Write-Host "http://localhost:$Port"
$types = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css"; ".js"="text/javascript"; ".jpg"="image/jpeg"; ".svg"="image/svg+xml"; ".woff2"="font/woff2"; ".xml"="application/xml"; ".txt"="text/plain" }
while ($l.IsListening) {
  $c = $l.GetContext(); $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath)
  if ($p.EndsWith("/")) { $p += "index.html" }
  $f = Join-Path $root $p.TrimStart("/"); $code = 200
  if (-not (Test-Path $f -PathType Leaf)) { $f = Join-Path $root "404.html"; $code = 404 }
  $b = [IO.File]::ReadAllBytes($f); $c.Response.StatusCode = $code
  $c.Response.ContentType = $types[[IO.Path]::GetExtension($f)]
  $c.Response.OutputStream.Write($b, 0, $b.Length); $c.Response.Close()
}
