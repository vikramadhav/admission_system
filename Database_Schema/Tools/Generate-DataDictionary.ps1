<#
  Generates "Database Schema\Data Dictionary\DATA-DICTIONARY.md" (one file) from a deployed database's
  catalog, merged with the business descriptions in descriptions.json (same folder as this script).
  Usage: .\Generate-DataDictionary.ps1 -Server ".\SQLEXPRESS" -Database MbruAdmission_Doc
  Windows PowerShell 5.1 or later (System.Data.SqlClient, integrated security).
  Lists any table, column or constraint that has no description, so gaps are visible.
#>
param(
    [Parameter(Mandatory)] [string] $Server,
    [Parameter(Mandatory)] [string] $Database,
    [string] $OutDir
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $OutDir) { $OutDir = Join-Path $here '..\Data Dictionary' }
$cs = "Server=$Server;Database=$Database;Integrated Security=True;TrustServerCertificate=True"
$desc = Get-Content -Raw -Encoding UTF8 (Join-Path $here 'descriptions.json') | ConvertFrom-Json

function Invoke-Query([string] $sql) {
    $cn = New-Object System.Data.SqlClient.SqlConnection $cs
    $cn.Open()
    try {
        $cmd = $cn.CreateCommand(); $cmd.CommandText = $sql; $cmd.CommandTimeout = 600
        $dt = New-Object System.Data.DataTable
        (New-Object System.Data.SqlClient.SqlDataAdapter $cmd).Fill($dt) | Out-Null
        return ,$dt
    } finally { $cn.Close() }
}
function Esc($v) { if ($v -is [DBNull] -or $null -eq $v) { return '' } return ([string]$v).Replace('|', '\|').Replace("`r", ' ').Replace("`n", ' ') }
function Prop($obj, [string] $name) { $p = $obj.PSObject.Properties[$name]; if ($p) { return [string]$p.Value } return $null }
function IsNull($v) { return ($v -is [DBNull]) -or ($null -eq $v) }

$schemaOrder = [ordered]@{
    cfg = 'Reference and configuration'; idn = 'Identity'; app = 'Application'; doc = 'Documents'
    pay = 'Payments'; ver = 'Verification'; pfo = 'Portfolio scoring'; scr = 'Screening and announcement'
    ops = 'Operations (audit, outbox, jobs)'
}
$viewDesc = @{
    'pay.vw_FinancePayment'        = 'Finance-safe view: payment facts only, with no candidate identity or application content. Grant finance roles on this view, not on the base tables.'
    'pfo.vw_RefereePortfolio'      = 'Anonymised portfolio view for referees: answers and evidence, with no candidate identity or contact data.'
    'scr.vw_CandidateAnnouncedScore' = 'Candidate-facing view: only scores that have been announced. Unannounced scores are never exposed.'
}

$columns = Invoke-Query @"
SELECT s.name AS SchemaName, t.name AS TableName, c.column_id AS Ord, c.name AS ColumnName,
       CASE WHEN ty.name IN ('varchar','nvarchar','char','nchar','varbinary')
                 THEN ty.name + '(' + CASE WHEN c.max_length = -1 THEN 'max'
                      WHEN ty.name IN ('nvarchar','nchar') THEN CAST(c.max_length/2 AS varchar(10))
                      ELSE CAST(c.max_length AS varchar(10)) END + ')'
            WHEN ty.name IN ('decimal','numeric') THEN ty.name + '(' + CAST(c.precision AS varchar(5)) + ',' + CAST(c.scale AS varchar(5)) + ')'
            WHEN ty.name IN ('datetime2','time','datetimeoffset') THEN ty.name + '(' + CAST(c.scale AS varchar(5)) + ')'
            ELSE ty.name END AS DataType,
       c.is_nullable AS IsNullable, c.is_identity AS IsIdentity, c.is_computed AS IsComputed,
       dc.definition AS DefaultDef,
       CASE WHEN EXISTS (SELECT 1 FROM sys.index_columns ic JOIN sys.indexes i ON i.object_id = ic.object_id AND i.index_id = ic.index_id
                         WHERE i.is_primary_key = 1 AND ic.object_id = c.object_id AND ic.column_id = c.column_id) THEN 1 ELSE 0 END AS IsPk,
       (SELECT TOP 1 rs.name + '.' + rt.name + '.' + rc.name
          FROM sys.foreign_key_columns fkc
          JOIN sys.tables rt ON rt.object_id = fkc.referenced_object_id
          JOIN sys.schemas rs ON rs.schema_id = rt.schema_id
          JOIN sys.columns rc ON rc.object_id = fkc.referenced_object_id AND rc.column_id = fkc.referenced_column_id
         WHERE fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id) AS FkTarget
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.columns c ON c.object_id = t.object_id
JOIN sys.types ty ON ty.user_type_id = c.user_type_id
LEFT JOIN sys.default_constraints dc ON dc.object_id = c.default_object_id
ORDER BY s.name, t.name, c.column_id
"@

$constraints = Invoke-Query @"
SELECT s.name AS SchemaName, t.name AS TableName, 'PRIMARY KEY' AS Kind, k.name AS Name,
       STUFF((SELECT ', ' + c.name FROM sys.index_columns ic JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
              WHERE ic.object_id = k.parent_object_id AND ic.index_id = k.unique_index_id ORDER BY ic.key_ordinal FOR XML PATH('')), 1, 2, '') AS Detail,
       CAST(NULL AS varchar(20)) AS DeleteAction
FROM sys.key_constraints k JOIN sys.tables t ON t.object_id = k.parent_object_id JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE k.type = 'PK'
UNION ALL
SELECT s.name, t.name, 'FOREIGN KEY', f.name,
       STUFF((SELECT ', ' + pc.name FROM sys.foreign_key_columns fkc JOIN sys.columns pc ON pc.object_id = fkc.parent_object_id AND pc.column_id = fkc.parent_column_id
              WHERE fkc.constraint_object_id = f.object_id ORDER BY fkc.constraint_column_id FOR XML PATH('')), 1, 2, '')
       + ' -> ' + rs.name + '.' + rt.name,
       f.delete_referential_action_desc
FROM sys.foreign_keys f JOIN sys.tables t ON t.object_id = f.parent_object_id JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.tables rt ON rt.object_id = f.referenced_object_id JOIN sys.schemas rs ON rs.schema_id = rt.schema_id
UNION ALL
SELECT s.name, t.name, 'UNIQUE', i.name,
       STUFF((SELECT ', ' + c.name FROM sys.index_columns ic JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
              WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id AND ic.is_included_column = 0 ORDER BY ic.key_ordinal FOR XML PATH('')), 1, 2, '')
       + ISNULL(' WHERE ' + i.filter_definition, ''), NULL
FROM sys.indexes i JOIN sys.tables t ON t.object_id = i.object_id JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE i.is_unique = 1 AND i.is_primary_key = 0 AND i.type > 0
UNION ALL
SELECT s.name, t.name, 'CHECK', cc.name, cc.definition, NULL
FROM sys.check_constraints cc JOIN sys.tables t ON t.object_id = cc.parent_object_id JOIN sys.schemas s ON s.schema_id = t.schema_id
UNION ALL
SELECT s.name, t.name, 'TRIGGER', tr.name, NULL, NULL
FROM sys.triggers tr JOIN sys.tables t ON t.object_id = tr.parent_id JOIN sys.schemas s ON s.schema_id = t.schema_id
"@

$views = Invoke-Query @"
SELECT s.name AS SchemaName, v.name AS ViewName, c.column_id AS Ord, c.name AS ColumnName,
       ty.name AS DataType, c.is_nullable AS IsNullable
FROM sys.views v JOIN sys.schemas s ON s.schema_id = v.schema_id
JOIN sys.columns c ON c.object_id = v.object_id JOIN sys.types ty ON ty.user_type_id = c.user_type_id
ORDER BY s.name, v.name, c.column_id
"@

# Single-column CHECKs of the form [Col]='A' OR [Col]='B' give the allowed values of that column.
$enum = @{}
foreach ($k in $constraints.Rows) {
    if ($k.Kind -ne 'CHECK') { continue }
    $m = [regex]::Match([string]$k.Detail, "^\(\[(\w+)\]='[^']*'(?: OR \[\1\]='[^']*')+\)$")
    if ($m.Success) {
        $vals = [regex]::Matches([string]$k.Detail, "'([^']*)'") | ForEach-Object { $_.Groups[1].Value } | Sort-Object
        $enum["$($k.SchemaName).$($k.TableName).$($m.Groups[1].Value)"] = ($vals -join ', ')
    }
}

$missing = New-Object System.Collections.Generic.List[string]

function Get-ColumnText($schema, $table, $c) {
    $full = "$schema.$table"
    $text = Prop $desc.specific "$full.$($c.ColumnName)"
    if (-not $text) { $text = Prop $desc.columns $c.ColumnName }
    if (-not $text) {
        if ($c.IsPk -eq 1 -and $c.IsIdentity -and $c.ColumnName -eq "$($table)Id") { $text = 'Surrogate primary key, generated by the database.' }
        elseif (-not (IsNull $c.FkTarget)) {
            $parts = ([string]$c.FkTarget).Split('.')
            $text = "Links to $($parts[0]).$($parts[1])."
        }
        elseif ($c.IsPk -eq 1) { $text = 'Primary key.' }
    }
    if (-not $text) { $missing.Add("column $full.$($c.ColumnName)"); return '' }
    $ev = $enum["$full.$($c.ColumnName)"]
    if ($ev -and -not $text.Contains(($ev -split ', ')[0])) { $text += " Allowed values: $ev." }
    if (-not (IsNull $c.FkTarget) -and -not $text.Contains('Links to') -and $c.ColumnName -ne "$($table)Id") {
        $parts = ([string]$c.FkTarget).Split('.'); $text += " (Links to $($parts[0]).$($parts[1]).)"
    }
    return $text
}

function Get-ConstraintText($schema, $table, $k) {
    $name = [string]$k.Name
    $text = Prop $desc.constraints $name
    if ($text) { return $text }
    switch ($k.Kind) {
        'PRIMARY KEY' { return "Uniquely identifies each row ($($k.Detail))." }
        'FOREIGN KEY' {
            $tgt = ([string]$k.Detail).Split('>')[1].Trim()
            $t = "Every value must exist in $tgt, so no row can point to something that does not exist."
            if ($k.DeleteAction -eq 'CASCADE') { $t += ' Deleting the parent also deletes these rows.' }
            return $t
        }
        'UNIQUE' {
            if ($name -like '*_PublicId') { return 'API identifiers are unique.' }
            if (([string]$k.Detail).Contains(' WHERE ')) { return $null }
            return "The combination ($($k.Detail)) can appear only once."
        }
        'CHECK' {
            $m = [regex]::Match([string]$k.Detail, "^\(\[(\w+)\]='[^']*'(?: OR \[\1\]='[^']*')+\)$")
            if ($m.Success) { return "Restricts $($m.Groups[1].Value) to: $($enum["$schema.$table.$($m.Groups[1].Value)"])." }
        }
    }
    return $null
}

$out = New-Object System.Text.StringBuilder
$body = New-Object System.Text.StringBuilder
$toc = New-Object System.Text.StringBuilder
$totalTables = 0; $totalCols = 0; $totalCons = 0
$counts = @{}

foreach ($schema in $schemaOrder.Keys) {
    $rows = @($columns.Rows | Where-Object { $_.SchemaName -eq $schema })
    if (-not $rows) { continue }
    $tables = $rows | Group-Object TableName
    $colCount = ($tables | Measure-Object Count -Sum).Sum
    $counts[$schema] = @($tables).Count, $colCount

    [void]$body.AppendLine("## $($schema) - $($schemaOrder[$schema])")
    [void]$body.AppendLine()
    [void]$body.AppendLine((Prop $desc.schemas $schema))
    [void]$body.AppendLine()

    [void]$toc.AppendLine("- **``$schema``** - $($schemaOrder[$schema])")
    foreach ($t in $tables) {
        $full = "$schema.$($t.Name)"
        [void]$toc.AppendLine("  - [$full](#$($full.ToLower().Replace('.','')))")
        $totalTables++; $totalCols += $t.Count

        [void]$body.AppendLine("### $full")
        [void]$body.AppendLine()
        $td = Prop $desc.tables $full
        if (-not $td) { $missing.Add("table $full"); $td = '' }
        [void]$body.AppendLine($td)
        [void]$body.AppendLine()
        [void]$body.AppendLine('| # | Column | Type | Null | Key | Default | Description |')
        [void]$body.AppendLine('|--:|---|---|:-:|---|---|---|')
        foreach ($c in $t.Group) {
            $key = @()
            if ($c.IsPk -eq 1) { $key += 'PK' }
            if (-not (IsNull $c.FkTarget)) { $key += "FK -> $($c.FkTarget)" }
            $txt = Get-ColumnText $schema $t.Name $c
            [void]$body.AppendLine("| $($c.Ord) | ``$($c.ColumnName)`` | $($c.DataType) | $(if ($c.IsNullable) {'Y'} else {'N'}) | $(Esc ($key -join '; ')) | $(Esc $c.DefaultDef) | $(Esc $txt) |")
        }
        $order = @{ 'PRIMARY KEY' = 1; 'FOREIGN KEY' = 2; 'UNIQUE' = 3; 'CHECK' = 4; 'TRIGGER' = 5 }
        $cons = @($constraints.Rows | Where-Object { $_.SchemaName -eq $schema -and $_.TableName -eq $t.Name } | Sort-Object { $order[$_.Kind] }, Name)
        if ($cons) {
            [void]$body.AppendLine()
            [void]$body.AppendLine('**Constraints and rules**')
            [void]$body.AppendLine()
            [void]$body.AppendLine('| Type | Name | Definition | What it enforces |')
            [void]$body.AppendLine('|---|---|---|---|')
            foreach ($k in $cons) {
                $totalCons++
                $why = Get-ConstraintText $schema $t.Name $k
                if (-not $why) { $missing.Add("constraint $($k.Name)"); $why = '' }
                $def = if (IsNull $k.Detail) { '' } else { '`' + (Esc $k.Detail) + '`' }
                [void]$body.AppendLine("| $($k.Kind) | ``$($k.Name)`` | $def | $(Esc $why) |")
            }
        }
        [void]$body.AppendLine()
    }

    $schemaViews = @($views.Rows | Where-Object { $_.SchemaName -eq $schema }) | Group-Object ViewName
    foreach ($v in $schemaViews) {
        $full = "$schema.$($v.Name)"
        [void]$toc.AppendLine("  - [View $full](#view-$($full.ToLower().Replace('.','')))")
        [void]$body.AppendLine("### View $full")
        [void]$body.AppendLine()
        $vd = $viewDesc[$full]; if (-not $vd) { $missing.Add("view $full"); $vd = '' }
        [void]$body.AppendLine($vd)
        [void]$body.AppendLine()
        [void]$body.AppendLine('| # | Column | Type | Null |')
        [void]$body.AppendLine('|--:|---|---|:-:|')
        foreach ($c in $v.Group) { [void]$body.AppendLine("| $($c.Ord) | ``$($c.ColumnName)`` | $($c.DataType) | $(if ($c.IsNullable) {'Y'} else {'N'}) |") }
        [void]$body.AppendLine()
    }
}

$summary = ($counts.Keys | Sort-Object { @($schemaOrder.Keys).IndexOf($_) } | ForEach-Object { "| ``$_`` | $($schemaOrder[$_]) | $($counts[$_][0]) | $($counts[$_][1]) |" }) -join "`n"

$head = @"
# Data Dictionary - MBRU Unified Admission Platform (GME Release 5)

Complete dictionary of the SQL Server 2025 physical database: every table, column and constraint with a plain-language explanation. It covers $totalTables tables, $totalCols columns and $totalCons constraints and rules. Table and column facts are read from the deployed database; the explanations come from ``Tools/descriptions.json``. For entity relationships and business context see the [logical model](../Logical/README.md); for deployment see the [physical README](../Physical/README.md).

| Schema | Domain | Tables | Columns |
|---|---|--:|--:|
$summary

## How to read this document

| Item | Meaning |
|---|---|
| **Null** | Y if the column may be empty, N if a value is required. |
| **Key** | PK is the primary key; FK shows the table the value must exist in. |
| **Default** | Value used when none is supplied. ``sysutcdatetime()`` is the current UTC time. |
| ``PublicId`` | Opaque identifier used by the API. Internal numeric keys are never exposed. |
| ``...Code`` columns | Natural codes that equal the API enum values (see ``Contracts/openapi/components/schemas.yaml``). |
| ``...Json`` columns | Native ``json`` type. Structure is defined by the versioned form schema or rubric, not by the database. |
| **UNIQUE ... WHERE** | A filtered unique index: uniqueness applies only to rows matching the condition, which is how rules such as one live application per candidate and cycle are enforced. |
| **TRIGGER** | Code that runs on data change, used here for immutability and referee rules. |
| Times | All times are UTC (``datetime2(3)``). Money is ``decimal(12,2)`` in AED. |

## Contents

$($toc.ToString())

"@

$footer = "`n---`n`nGenerated from the deployed catalog on $(Get-Date -Format 'yyyy-MM-dd'). Do not edit by hand: change ``Tools/descriptions.json`` or the SQL scripts and regenerate with ``Tools/Generate-DataDictionary.ps1``.`n"

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }
$file = Join-Path $OutDir 'DATA-DICTIONARY.md'
[System.IO.File]::WriteAllText($file, $head + $body.ToString() + $footer, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Generated $totalTables tables / $totalCols columns / $totalCons constraints -> $file"
if ($missing.Count) { Write-Warning "$($missing.Count) items have no description:"; $missing | ForEach-Object { Write-Host "  $_" } } else { Write-Host 'All items described.' }
