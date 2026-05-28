Source,Real-world Context,Sample Data Notes,Breakpoint in Production

SAP Procurement,ERP (MM module) extraction. Uses specific plant codes (WERKS).,"Shows negative values (reversals), which are standard in SAP.","Schema drift if the SAP environment changes (e.g., new column added to T-Code export)."

Utility Electricity,Commercial utility billing (CSV export from portal).,High volume of usage in Total_kWh. Account_Number is the key.,If the utility provider changes their billing format or adds/removes meter ID levels.

Corporate Travel,"Expense Management System (e.g., Concur/SAP Travel).",Mixed data (flights vs hotels) in one file.,Inconsistent airport codes (IATA) or null values for non-flight expenses.