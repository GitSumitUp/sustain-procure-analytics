# Sustain-Procure-Analytics

A prototype ESG data ingestion and review platform built with Django REST Framework and React.

The system ingests emissions-related activity data from multiple enterprise sources, normalizes the records into a unified structure, flags suspicious rows, and allows analysts to review and approve records before audit lock.

---

# Features

* Upload emissions activity data from multiple enterprise sources
* Normalize inconsistent units and date formats
* Support Scope 1, Scope 2, and Scope 3 categorization
* Flag suspicious or incomplete records
* Analyst review dashboard
* Approval workflow with audit locking
* Audit trail for record changes
* Multi-tenant-ready data model

---

# Supported Data Sources

## 1. SAP Fuel & Procurement Data

Handled as flat CSV exports representing a simplified SAP export workflow.

Examples:

* Diesel purchases
* Petrol usage
* Procurement quantities

---

## 2. Utility Electricity Data

Handled as CSV exports downloaded from utility portals.

Examples:

* Meter readings
* Billing periods
* Electricity consumption (kWh)

---

## 3. Corporate Travel Data

Handled as CSV exports inspired by travel platforms like Concur/Navan.

Examples:

* Flight records
* Hotel stays
* Ground transport

---

# Tech Stack

## Backend

* Python
* Django
* Django REST Framework

## Frontend

* React
* Axios
* Material UI

## Database

* SQLite (prototype)

---

# Project Structure

```text
backend/        Django backend
frontend/       React frontend
sample_data/    Example CSV files for testing
```

---

# Sample CSV Files

Located inside:

```text
sample_data/
```

Files:

* sap_fuel_data.csv
* utility_electricity.csv
* travel_data.csv

These files are intentionally designed to resemble realistic enterprise exports.

---

# Setup Instructions

## Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

Backend runs on:

```text
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

# Main Workflow

```text
Upload CSV
    ↓
Parse Records
    ↓
Normalize Data
    ↓
Flag Suspicious Rows
    ↓
Analyst Review
    ↓
Approve & Lock
```

---

# Normalization Logic

Examples:

* TON → KG
* German date formats → ISO dates
* Fuel → Scope 1
* Electricity → Scope 2
* Travel → Scope 3

---

# Suspicious Record Detection

Examples:

* Missing dates
* Negative quantities
* Extremely high electricity consumption
* Missing travel distances

Suspicious rows are flagged for analyst review.

---

# Important Prototype Limitations

This is intentionally a lightweight prototype.

Not included:

* PDF OCR ingestion
* Live SAP integrations
* OAuth integrations with Concur/Navan
* Role-based access control
* Real emissions factor calculations

These tradeoffs are documented in TRADEOFFS.md.

---

# Deployment

Frontend:

* Vercel

Backend:

* Railway

---

# Documentation Files

* MODEL.md
* DECISIONS.md
* TRADEOFFS.md
* SOURCES.md

These documents explain architectural choices and tradeoffs made during development.

---
