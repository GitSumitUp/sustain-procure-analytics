This data model uses a Medallion Architecture (Bronze/Silver/Gold) approach to handle multi-tenancy and provenance.

Multi-Tenancy: Each table contains a tenant_id column. For SAP WERKS (e.g., DE01), this is the plant ID. For utility bills, the Account_Number serves as the tenant identifier.

Scope Categorization: * Scope 1: Direct fuel combustion (e.g., sap_procurement.csv for fleet diesel).

Scope 2: Purchased electricity (utility_electricity.csv).

Scope 3: Business travel (corporate_travel.csv) and upstream fuel extraction/processing.

Provenance: Every record includes:

source_system: Identifying the origin (e.g., SAP_MM, UTILITY_PORTAL, EXPENSE_SYSTEM).

ingested_at: UTC timestamp of the ETL run.

is_edited: Boolean flag.

audit_log_id: FK to an audit_trail table capturing changes.

Unit Normalization: A conversion_factors table is implemented. Raw values (e.g., L, GAL, TON) are normalized into a base unit (e.g., Liters or Kg CO2e) during the Silver layer transformation.