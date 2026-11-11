/*==============================================================================
  01_Schemas.sql : functional schemas (one per bounded context)
==============================================================================*/
:on error exit
USE [$(DatabaseName)];
GO

CREATE SCHEMA cfg AUTHORIZATION dbo;   -- reference data, catalog, configuration, lookups
GO
CREATE SCHEMA idn AUTHORIZATION dbo;   -- candidates, staff, roles, identity links
GO
CREATE SCHEMA ops AUTHORIZATION dbo;   -- audit, idempotency, outbox, notifications, job runs
GO
CREATE SCHEMA app AUTHORIZATION dbo;   -- applications, form schema, candidate lifecycle
GO
CREATE SCHEMA doc AUTHORIZATION dbo;   -- attachment metadata and versions (binary content lives in FileNet)
GO
CREATE SCHEMA pay AUTHORIZATION dbo;   -- fees, payment sessions, gateway events
GO
CREATE SCHEMA ver AUTHORIZATION dbo;   -- admission verification workstream
GO
CREATE SCHEMA pfo AUTHORIZATION dbo;   -- portfolio, rubric, referee scoring, appeal
GO
CREATE SCHEMA scr AUTHORIZATION dbo;   -- scores, CASPER, announcements, bulk screen-out
GO
