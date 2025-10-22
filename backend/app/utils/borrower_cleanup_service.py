from typing import Dict, Any, List
from app.utils.json_borrower_cleanup import extract_structured_document_data

def clean_borrower_documents_from_dict(
    data: Dict[str, Any],
    **kwargs
) -> Dict[str, Any]:
    cleaned_data = {}

    if not isinstance(data, dict):
        return {}

    items_to_process = []
    for key, value in data.items():
        if isinstance(value, list) and value and isinstance(value[0], dict):
            items_to_process = value
            break

    if not items_to_process:
        print(" No borrower summary section found.")
        return {}

    for item in items_to_process:
        if not isinstance(item, dict):
            continue

        borrower_name_key = item.get("BorrowerName", "Unidentified Borrower")
        cleaned_data.setdefault(borrower_name_key, {})

        for doc_type, documents in item.items():
            if doc_type == "BorrowerName":
                continue

            documents = documents if isinstance(documents, list) else [documents]
            cleaned_data[borrower_name_key].setdefault(doc_type, [])

            for doc in documents:
                if not isinstance(doc, dict):
                    continue

                extracted = extract_structured_document_data(doc)
                if not extracted:
                    continue

                def remove_meta_keys(d):
                    if isinstance(d, dict):
                        return {k: remove_meta_keys(v) for k, v in d.items()
                                if not (str(k).startswith("_meta") and k != "_SkillName")}
                    elif isinstance(d, list):
                        return [remove_meta_keys(v) for v in d]
                    return d

                cleaned_doc = remove_meta_keys(extracted)

                # Split sections into separate docs
                for section_name, section_data in cleaned_doc.items():
                    if section_name == doc_type:
                        cleaned_data[borrower_name_key][doc_type].append(section_data)
                    else:
                        cleaned_data[borrower_name_key].setdefault(section_name, [])
                        cleaned_data[borrower_name_key][section_name].append(section_data)

    return cleaned_data
