import json
from typing import Dict, Any, List, Optional

# ----------------------------------------------------------------------------->
# CORE RECURSIVE EXTRACTION LOGIC
# ----------------------------------------------------------------------------->

def _process_labels_recursive(labels_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generic recursive helper function to process a list of label objects.
    It identifies and processes simple values ('Values' key) and nested
    data ('Groups' key) without needing to know the specific label names.
    """
    output_dict = {}
    if not isinstance(labels_list, list):
        return output_dict

    for item in labels_list:
        if not isinstance(item, dict):
            continue
        label_name = item.get("LabelName")
        if not label_name:
            continue

        # --- Base Case: Handle simple key-value pairs ---
        if "Values" in item and isinstance(item.get("Values"), list) and item["Values"]:
            if isinstance(item["Values"][0], dict):
                value = item["Values"][0].get("Value")
                if value is not None and value != "N/A":
                    output_dict[label_name] = value

        # --- Recursive Case: Handle nested groups of data (e.g., Earnings, Withdrawals) ---
        elif "Groups" in item and isinstance(item.get("Groups"), list) and item["Groups"]:
            records_list = []
            for group in item["Groups"]:
                if isinstance(group, dict) and "RecordLabels" in group and isinstance(group.get("RecordLabels"), list):
                    # --- RECURSION ---
                    # Call this same function on the inner list of labels.
                    record_data = _process_labels_recursive(group["RecordLabels"])
                    if record_data:
                        records_list.append(record_data)
            if records_list:
                output_dict[label_name] = records_list
    return output_dict

def extract_structured_document_data(doc_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Robust, generic, and recursive data extraction function to parse any
    nested financial document from the input JSON structure.
    """
    if not isinstance(doc_data, dict):
        return {}
    try:
        # Find the primary 'Labels' list to start processing
        summary_obj = doc_data.get("Summary", [{}])[0]
        if "Labels" in summary_obj and isinstance(summary_obj.get("Labels"), list):
            main_labels_list = summary_obj["Labels"]
            
            # --- Start the recursive processing ---
            clean_doc = _process_labels_recursive(main_labels_list)

            # --- Preserve Original Metadata ---
            if doc_data.get("Title"):
                clean_doc["_DocTitle"] = doc_data.get("Title")
            if doc_data.get("GeneratedOn"):
                clean_doc["_GeneratedOn"] = doc_data.get("GeneratedOn")
            if summary_obj.get("SkillName"):
                clean_doc["_SkillName"] = summary_obj.get("SkillName")
                
            return clean_doc
            
    except (IndexError, KeyError, TypeError) as e:
        # Gracefully handle any unexpected document structures
        print(f"Error parsing document structure: {e}")
        return {"_ParseError": str(e), "_DocTitle": doc_data.get("Title", "Unknown")}
    return {}