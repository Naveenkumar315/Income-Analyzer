from typing import Dict, Any, List, Optional
import re

# --- We only import the extraction function now ---
from app.utils.json_borrower_cleanup import (
    extract_structured_document_data
)

def clean_borrower_documents_from_dict(
    data: Dict[str, Any],
    **kwargs  # Accept extra args like threshold but ignore them
) -> Dict[str, Any]:
    """
    Cleans and structures borrower documents from a dictionary.
    
    This version keeps each top-level BorrowerName separate and
    does NOT consolidate or group them.
    """
    
    cleaned_data = {}

    # --- Step 1: Find the main list of documents to process ---
    # This is the list under the "Summary" key in your root JSON
    items_to_process = []
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, list) and value and isinstance(value[0], dict):
                items_to_process = value
                break
                
    if not items_to_process:
        return {}

    # --- Step 2: Process each item in the list ---
    # Each 'item' corresponds to one top-level "BorrowerName"
    for item in items_to_process:
        if not isinstance(item, dict):
            continue
            
        # --- Use the exact BorrowerName as the key ---
        borrower_name_key = item.get("BorrowerName")
        if not borrower_name_key:
            borrower_name_key = "Unidentified Borrower"

        # Create the top-level key for this borrower
        if borrower_name_key not in cleaned_data:
            cleaned_data[borrower_name_key] = {}

        # --- Step 3: Loop through document types (e.g., "Bank Statement", "Paystub") ---
        for doc_type, value in item.items():
            if doc_type == "BorrowerName":
                continue

            documents = value if isinstance(value, list) else [value]
            
            for doc in documents:
                if not isinstance(doc, dict):
                    continue

                # --- Step 4: Use the new generic function to extract all data ---
                # This recursively extracts all simple and nested data
                clean_doc = extract_structured_document_data(doc)
                
                if not clean_doc:
                    continue

                # --- Step 5: Assign the cleaned document ---
                if doc_type not in cleaned_data[borrower_name_key]:
                    cleaned_data[borrower_name_key][doc_type] = []
                cleaned_data[borrower_name_key][doc_type].append(clean_doc)

    return cleaned_data