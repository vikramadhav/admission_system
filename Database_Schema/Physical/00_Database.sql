/*==============================================================================
  MBRU Unified Admission Platform - GME Release 5
  00_Database.sql : create the database and apply SQL Server 2025 settings
  Target          : SQL Server 2025 (17.x), compatibility level 170
  Run mode        : SQLCMD mode (variable $(DatabaseName) is set in Deploy.sql)
==============================================================================*/
:on error exit

IF DB_ID(N'$(DatabaseName)') IS NULL
BEGIN
    CREATE DATABASE [$(DatabaseName)]
        COLLATE Latin1_General_100_CI_AS_SC;   -- accent-sensitive off, supplementary chars on; text columns are nvarchar
END
GO

-- Compatibility level 170 enables the native json data type used by this schema.
ALTER DATABASE [$(DatabaseName)] SET COMPATIBILITY_LEVEL = 170;
ALTER DATABASE [$(DatabaseName)] SET RECOVERY FULL;
ALTER DATABASE [$(DatabaseName)] SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;
ALTER DATABASE [$(DatabaseName)] SET ALLOW_SNAPSHOT_ISOLATION ON;
-- ADR and optimized locking are not available in Express edition (EngineEdition 4).
IF CAST(SERVERPROPERTY('EngineEdition') AS int) <> 4
BEGIN
    ALTER DATABASE [$(DatabaseName)] SET ACCELERATED_DATABASE_RECOVERY = ON;   -- prerequisite for optimized locking
    ALTER DATABASE [$(DatabaseName)] SET OPTIMIZED_LOCKING = ON;               -- lower lock memory/blocking on hot workflow tables
END
ALTER DATABASE [$(DatabaseName)] SET QUERY_STORE = ON;
ALTER DATABASE [$(DatabaseName)] SET PAGE_VERIFY CHECKSUM;
ALTER DATABASE [$(DatabaseName)] SET AUTO_UPDATE_STATISTICS_ASYNC ON;
GO
