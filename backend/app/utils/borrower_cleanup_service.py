from typing import Dict, Any, List
import re
import json

from app.utils.json_borrower_cleanup import extract_structured_document_data


def clean_borrower_documents_from_dict(
    data: Dict[str, Any],
    **kwargs
) -> Dict[str, Any]:
    """
    Cleans and structures borrower documents from nested dictionary structures.

    Updated:
       Simplifies final JSON hierarchy:
         borrower_name -> category -> [document_data]
       Removes "_meta" keys
       Flattens redundant nested category keys
    """

    cleaned_data = {}

    if not isinstance(data, dict):
        return {}

    # --- Step 1: Locate borrower list under 'Summary' ---
    items_to_process = []
    for key, value in data.items():
        if isinstance(value, list) and value and isinstance(value[0], dict):
            items_to_process = value
            break

    if not items_to_process:
        print(" No borrower summary section found.")
        return {}

    # --- Step 2: Iterate through each borrower item ---
    for item in items_to_process:
        if not isinstance(item, dict):
            continue

        borrower_name_key = item.get("BorrowerName", "Unidentified Borrower")
        cleaned_data.setdefault(borrower_name_key, {})

        # --- Step 3: Process each document type for this borrower ---
        for doc_type, documents in item.items():
            if doc_type == "BorrowerName":
                continue

            documents = documents if isinstance(documents, list) else [documents]
            cleaned_data[borrower_name_key].setdefault(doc_type, [])

            for doc in documents:
                if not isinstance(doc, dict):
                    continue

                # --- Step 4: Extract nested data ---
                extracted = extract_structured_document_data(doc)
                if not extracted:
                    continue

                # --- Step 5: Remove "_meta" keys ---
                def remove_meta_keys(d):
                    if isinstance(d, dict):
                        return {
                            k: remove_meta_keys(v)
                            for k, v in d.items()
                            if not (str(k).startswith("_meta") and k != "_SkillName")
                        }
                    elif isinstance(d, list):
                        return [remove_meta_keys(v) for v in d]
                    return d

                cleaned_doc = remove_meta_keys(extracted)

                # --- Step 6: Flatten redundant doc_type layer ---
                # Example: {"Paystub": {Summary, Earnings}} → {Summary, Earnings}
                if (
                    len(cleaned_doc) == 1
                    and doc_type in cleaned_doc
                    and isinstance(cleaned_doc[doc_type], dict)
                ):
                    cleaned_doc = cleaned_doc[doc_type]

                cleaned_data[borrower_name_key][doc_type].append(cleaned_doc)

    return cleaned_data
