# borrower_cleanup_service.py
from typing import Dict, Any, List, Optional
import re
from difflib import SequenceMatcher

# --- import your existing functions here ---
from app.utils.json_borrower_cleanup import (
    clean_name,
    consolidate_similar_borrowers,
    extract_borrower_name_from_document,
    extract_clean_labels,
    find_best_borrower_match,
)

def clean_borrower_documents_from_dict(
    data: Dict[str, Any],
    threshold: float = 0.7,
    borrower_indicators: Optional[List[str]] = None,
    employer_indicators: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Clean borrower documents directly from in-memory dict instead of file.
    Returns cleaned JSON object.
    """

    borrower_indicators = borrower_indicators or [
        "borrower name", "employee name", "account holder name",
        "applicant name", "employee full name", "full name"
    ]
    employer_indicators = employer_indicators or [
        "employer", "company", "organization", "business",
        "corp", "inc", "llc", "ltd", "bank", "association"
    ]

    # --- Step 1: Find borrower data list ---
    items_to_process = []
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, list) and value:
                if isinstance(value[0], dict) and "BorrowerName" in value[0]:
                    items_to_process = value
                    break
        if not items_to_process and "BorrowerName" in data:
            items_to_process = [data]
    elif isinstance(data, list):
        items_to_process = data
    else:
        raise ValueError("Unexpected JSON structure")

    # --- Step 2: Collect master borrower names ---
    master_borrowers = set()
    for item in items_to_process:
        if "BorrowerName" in item and item["BorrowerName"]:
            borrower_name = item["BorrowerName"].strip()
            if borrower_name and borrower_name != "Unidentified Borrower":
                if "," in borrower_name:
                    borrowers = [b.strip() for b in borrower_name.split(",") if b.strip()]
                    master_borrowers.update(borrowers)
                else:
                    master_borrowers.add(borrower_name)

    master_borrowers = list(master_borrowers)
    consolidated_borrowers = consolidate_similar_borrowers(master_borrowers)

    # --- Step 3: Initialize cleaned structure ---
    cleaned_data = {group["primary_name"]: {} for group in consolidated_borrowers}

    # --- Step 4: Process documents ---
    for item in items_to_process:
        if not isinstance(item, dict) or "BorrowerName" not in item:
            continue
        top_level_borrower = item["BorrowerName"]

        for doc_type, value in item.items():
            if doc_type == "BorrowerName":
                continue

            documents = value if isinstance(value, list) else [value]
            for doc in documents:
                if not isinstance(doc, dict):
                    continue

                # Extract borrower name
                doc_borrower_name = extract_borrower_name_from_document(doc)
                matched_borrower = None

                if doc_borrower_name:
                    matched_borrower = find_best_borrower_match(doc_borrower_name, consolidated_borrowers)
                elif top_level_borrower and top_level_borrower != "Unidentified Borrower":
                    matched_borrower = find_best_borrower_match(top_level_borrower, consolidated_borrowers)

                if not matched_borrower:
                    continue

                # Extract clean doc
                clean_doc = extract_clean_labels(doc)
                if not clean_doc:
                    continue

                if doc_type not in cleaned_data[matched_borrower]:
                    cleaned_data[matched_borrower][doc_type] = []
                cleaned_data[matched_borrower][doc_type].append(clean_doc)

    # Remove empty borrowers
    cleaned_data = {k: v for k, v in cleaned_data.items() if v}
    return cleaned_data
