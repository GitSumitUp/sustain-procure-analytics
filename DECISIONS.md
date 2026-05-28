Date Parsing: The SAP data uses DD.MM.YYYY and DD/MM/YYYY. We chose to force a unified ISO-8601 YYYY-MM-DD format during the extraction phase to prevent silent failures in time-series analysis.

Multi-Tenancy Logic: We ignored the Service_Address text field for grouping and strictly used Account_Number (Utility) and WERKS (SAP) as the primary join keys for tenancy, as text parsing addresses is error-prone.

Handling NaN in Travel Data: In corporate_travel.csv, fields like Origin_IATA are NaN for Hotel_Stay. We decided to keep these as NULL rather than imputing "UNKNOWN" to maintain the integrity of the original expense record.

Ambiguity Resolved: Decided that Menge (Quantity) in the SAP data can be negative (returns/reversals). We kept these values as-is (signed) rather than filtering them out, as they are essential for net consumption calculations.