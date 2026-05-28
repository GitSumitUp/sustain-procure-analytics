Batch vs. Real-time Ingestion: We chose Batch ingestion (via CSV upload) over real-time API integrations.

Why: Real-time integration requires complex OAuth/API handling for every source system, which is outside the scope of this project. Batch processing allows for easier data quality checks before load.

Hardcoded vs. Automated Currency Conversion: We did not implement an automated real-time exchange rate API.

Why: External API dependency adds a "brittle" point to the pipeline. We instead normalized expenses to a base currency at the time of ingestion based on historical rates.

Simple vs. Advanced Anomaly Detection: We avoided implementing machine learning-based anomaly detection on consumption data.

Why: Simple threshold-based alerting (e.g., value > 3x mean) is sufficient for this stage and avoids the overhead of maintaining a model serving infrastructure.