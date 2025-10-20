import json
import re
from difflib import SequenceMatcher
from typing import Dict, Any, List, Union, Optional

# -------------------------------
# Name cleaning & fuzzy matching
# -------------------------------
def clean_name(name: Optional[str]) -> str:
    """Clean and normalize name for comparison"""
    if not name:
        return ""
    name = str(name).upper()
    # Remove common suffixes
    name = re.sub(r'\b(POD|JR|SR|III|II|IV)\b', '', name)
    # Remove special characters but keep spaces
    name = re.sub(r'[^\w\s]', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def extract_name_components(name: str):
    cleaned = clean_name(name)
    parts = [part for part in cleaned.split() if part]
    if not parts:
        return {'first': '', 'middle': [], 'last': '', 'all_parts': set()}
    components = {
        'first': parts[0] if parts else '',
        'middle': parts[1:-1] if len(parts) > 2 else (parts[1:2] if len(parts) == 2 else []),
        'last': parts[-1] if len(parts) > 1 else '',
        'all_parts': set(parts)
    }
    return components

def names_match_fuzzy(name1: str, name2: str, threshold: float = 0.6) -> bool:
    if not name1 or not name2:
        return False
    clean1 = clean_name(name1)
    clean2 = clean_name(name2)
    if clean1 == clean2:
        return True

    parts1 = [p for p in clean1.split() if p]
    parts2 = [p for p in clean2.split() if p]
    if len(parts1) < 1 or len(parts2) < 1:
        return False

    first1, last1 = parts1[0], parts1[-1]
    first2, last2 = parts2[0], parts2[-1]
    middle1 = parts1[1:-1] if len(parts1) > 2 else []
    middle2 = parts2[1:-1] if len(parts2) > 2 else []

    # first name lenient match
    first_match = (first1 == first2 or
                   (len(first1) == 1 and first1 == first2[0]) or
                   (len(first2) == 1 and first2 == first1[0]) or
                   SequenceMatcher(None, first1, first2).ratio() > 0.8)
    if not first_match:
        return False

    # Levenshtein-like distance for last name (simple implementation)
    def levenshtein_distance(s1: str, s2: str) -> int:
        if len(s1) < len(s2):
            return levenshtein_distance(s2, s1)
        if len(s2) == 0:
            return len(s1)
        previous_row = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (0 if c1 == c2 else 1)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        return previous_row[-1]

    edit_dist = levenshtein_distance(last1, last2)
    similarity_ratio = SequenceMatcher(None, last1, last2).ratio()
    last_match = (last1 == last2) or (edit_dist <= 2) or (similarity_ratio > 0.75)
    if not last_match:
        return False

    # Middle name leniency
    middle_compatible = not middle1 or not middle2
    if middle1 and middle2:
        for m1 in middle1:
            compatible = False
            for m2 in middle2:
                if (m1 == m2 or
                    (len(m1) == 1 and m1 == m2[0]) or
                    (len(m2) == 1 and m2 == m1[0]) or
                    SequenceMatcher(None, m1, m2).ratio() > 0.75):
                    compatible = True
                    break
            if not compatible:
                middle_compatible = False
                break

    return first_match and last_match and middle_compatible

def similarity_score(name1: str, name2: str) -> float:
    if names_match_fuzzy(name1, name2):
        return 1.0
    clean1 = clean_name(name1)
    clean2 = clean_name(name2)
    direct_similarity = SequenceMatcher(None, clean1, clean2).ratio()
    comp1 = extract_name_components(name1)
    comp2 = extract_name_components(name2)
    parts1 = comp1['all_parts']
    parts2 = comp2['all_parts']
    if not parts1 or not parts2:
        return direct_similarity
    intersection = len(parts1.intersection(parts2))
    union = len(parts1.union(parts2))
    overlap_ratio = intersection / union if union > 0 else 0
    return max(direct_similarity, overlap_ratio)

def consolidate_similar_borrowers(master_borrowers: List[str]) -> List[Dict[str, Any]]:
    if not master_borrowers:
        return []
    consolidated = []
    used = set()
    for i, b1 in enumerate(master_borrowers):
        if i in used:
            continue
        group = [b1]
        used.add(i)
        for j, b2 in enumerate(master_borrowers):
            if j <= i or j in used:
                continue
            if names_match_fuzzy(b1, b2):
                group.append(b2)
                used.add(j)
        consolidated.append({'primary_name': b1, 'all_variations': group})
    return consolidated

def extract_individual_names_from_multi_borrower(multi_borrower_name: str) -> List[str]:
    if not multi_borrower_name:
        return []
    names = [n.strip() for n in multi_borrower_name.split(',') if n.strip()]
    return names

def find_single_borrower_match(document_borrower_name: str, consolidated_borrowers: List[Dict[str, Any]]) -> Optional[str]:
    best_match = None
    best_score = 0.0
    for borrower_group in consolidated_borrowers:
        for variation in borrower_group['all_variations']:
            if names_match_fuzzy(document_borrower_name, variation):
                score = similarity_score(document_borrower_name, variation)
                if score > best_score:
                    best_score = score
                    best_match = borrower_group['primary_name']
    return best_match

def find_best_borrower_match(document_borrower_name: str, consolidated_borrowers: List[Dict[str, Any]]) -> Optional[str]:
    if not document_borrower_name or not consolidated_borrowers:
        return None
    individuals = extract_individual_names_from_multi_borrower(document_borrower_name)
    if len(individuals) > 1:
        for ind in individuals:
            match = find_single_borrower_match(ind, consolidated_borrowers)
            if match:
                return match
        return None
    return find_single_borrower_match(document_borrower_name, consolidated_borrowers)

# -------------------------------
# Document borrower name extraction
# -------------------------------
def extract_borrower_name_from_document(doc_data: Dict[str, Any]) -> Optional[str]:
    """
    Look for common borrower-like fields in the 'Summary'->'Labels' structure.
    This is deliberately strict about excluding employer/company fields.
    """
    if not isinstance(doc_data, dict):
        return None

    borrower_name = None
    if 'Summary' in doc_data:
        summaries = doc_data['Summary'] if isinstance(doc_data['Summary'], list) else [doc_data['Summary']]
        borrower_indicators = [
            'borrower name', 'employee name', 'account holder name',
            'applicant name', 'employee full name', 'full name'
        ]
        employer_indicators = [
            'employer', 'company', 'organization', 'business',
            'corp', 'inc', 'llc', 'ltd', 'bank', 'association'
        ]
        for summary in summaries:
            labels = summary.get('Labels') if isinstance(summary, dict) else None
            if not labels:
                continue
            for label in labels:
                label_name = label.get('LabelName', '').lower()
                is_borrower_field = any(ind in label_name for ind in borrower_indicators)
                is_employer_field = any(ind in label_name for ind in employer_indicators)
                if is_borrower_field and not is_employer_field:
                    vals = label.get('Values') or []
                    for v in vals:
                        val = v.get('Value')
                        if val and isinstance(val, str):
                            value = val.strip()
                            company_patterns = [
                                r'\b(LLC|INC|CORP|LTD|CO|COMPANY|BANK|ASSOCIATION|CHASE|JPMORGAN)\b',
                                r'\b(LENDING|FINANCIAL|SERVICES|SOLUTIONS|GROUP)\b'
                            ]
                            is_company_name = any(re.search(pat, value.upper()) for pat in company_patterns)
                            if not is_company_name and not re.match(r'^\d+$', value) and len(value) > 2:
                                if not borrower_name or len(value) > len(borrower_name):
                                    borrower_name = value
    return borrower_name

# -------------------------------
# Recursive nested extraction
# -------------------------------
def _process_labels_recursive(labels_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Process a list of label objects (common to your OCR JSON).
    Supports:
      - Labels[].Values -> simple values
      - Labels[].Groups -> arrays of records with RecordLabels (recursive)
    Returns a dict where:
      - simple labels are mapped to single value or list
      - grouped labels (like 'Withdrawal') map to a list of records (each a dict)
    """
    out = {}
    if not isinstance(labels_list, list):
        return out

    for item in labels_list:
        if not isinstance(item, dict):
            continue
        label_name = item.get('LabelName')
        if not label_name:
            # skip nameless entries
            continue

        # 1) Values -> simple key(s)
        if "Values" in item and isinstance(item.get("Values"), list) and item["Values"]:
            # If Values contains dicts with 'Value' key, extract each Value
            extracted_vals = []
            for val_obj in item["Values"]:
                if isinstance(val_obj, dict) and "Value" in val_obj:
                    v = val_obj.get("Value")
                    if v is not None and v != "N/A":
                        extracted_vals.append(v)
                elif val_obj is not None and val_obj != "N/A":
                    extracted_vals.append(val_obj)
            if extracted_vals:
                # If only one meaningful value, store as scalar
                out[label_name] = extracted_vals[0] if len(extracted_vals) == 1 else extracted_vals

        # 2) Groups -> nested arrays of records (each with RecordLabels)
        if "Groups" in item and isinstance(item.get("Groups"), list) and item["Groups"]:
            records = []
            for group in item["Groups"]:
                if isinstance(group, dict):
                    # Some groups have 'RecordLabels' (list of labels)
                    if "RecordLabels" in group and isinstance(group.get("RecordLabels"), list):
                        rec = _process_labels_recursive(group["RecordLabels"])
                        if rec:
                            records.append(rec)
                    else:
                        # If group contains nested Labels directly
                        if "Labels" in group and isinstance(group.get("Labels"), list):
                            rec = _process_labels_recursive(group["Labels"])
                            if rec:
                                records.append(rec)
                        else:
                            # Fallback: flatten any dict keys inside group
                            flat = _extract_any_nested(group)
                            if flat:
                                records.append(flat)
            if records:
                out[label_name] = records

        # 3) Some structures may nest Labels inside other keys
        # handled by fallback in _extract_any_nested when needed

    return out

def _extract_any_nested(data: Union[Dict[str, Any], List[Any]], parent_key: str = "") -> Dict[str, Any]:
    """
    Generic recursive traversal for arbitrary nested structures (fallback).
    Produces a flattened mapping using dot-notation when necessary.
    Used as a defensive parser if the input deviates from the expected 'Labels/Groups' pattern.
    """
    out = {}
    sep = "."
    if isinstance(data, dict):
        for k, v in data.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                out.update(_extract_any_nested(v, new_key))
            elif isinstance(v, list):
                # for lists, iterate and index keys
                for idx, item in enumerate(v):
                    list_key = f"{new_key}[{idx}]"
                    if isinstance(item, (dict, list)):
                        out.update(_extract_any_nested(item, list_key))
                    else:
                        if item is not None and item != "N/A":
                            out[list_key] = item
            else:
                if v is not None and v != "N/A":
                    out[new_key] = v
    elif isinstance(data, list):
        for idx, item in enumerate(data):
            list_key = f"{parent_key}[{idx}]" if parent_key else f"[{idx}]"
            if isinstance(item, (dict, list)):
                out.update(_extract_any_nested(item, list_key))
            else:
                if item is not None and item != "N/A":
                    out[list_key] = item
    return out

def extract_clean_labels(doc_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Backwards-compatible extraction that focuses on Summary->Labels.
    Uses _process_labels_recursive to capture nested Groups and Values.
    If Summary missing, falls back to simple metadata extraction.
    """
    if not isinstance(doc_data, dict):
        return {}

    result = {}

    if 'Summary' in doc_data:
        summaries = doc_data['Summary'] if isinstance(doc_data['Summary'], list) else [doc_data['Summary']]
        for summary in summaries:
            labels = summary.get('Labels') or []
            processed = _process_labels_recursive(labels)
            # Merge processed; if multiple summaries, prefix by SkillName to avoid key collision
            skill = summary.get('SkillName')
            if skill:
                if skill in result:
                    # Merge carefully
                    # if existing is dict, add suffix
                    suffix = 1
                    new_skill = f"{skill}_{suffix}"
                    while new_skill in result:
                        suffix += 1
                        new_skill = f"{skill}_{suffix}"
                    result[new_skill] = processed
                else:
                    result[skill] = processed
            else:
                # Merge directly into result
                for k, v in processed.items():
                    # keep existing keys if any by appending suffix to avoid overwrite
                    if k in result:
                        suffix = 1
                        new_k = f"{k}_{suffix}"
                        while new_k in result:
                            suffix += 1
                            new_k = f"{k}_{suffix}"
                        result[new_k] = v
                    else:
                        result[k] = v

    else:
        # fallback: flatten top-level keys except large binary-like fields
        for k, v in doc_data.items():
            if k in ('Url', 'Title', 'GeneratedOn', 'StageName', 'ScreenshotUrl'):
                result[k] = v
            else:
                # attempt to extract nested values
                if isinstance(v, (dict, list)):
                    nested = _extract_any_nested(v, k)
                    for nk, nv in nested.items():
                        result[nk] = nv
                else:
                    result[k] = v

    # Add document-level metadata
    for meta_key in ['Title', 'Url', 'GeneratedOn', 'StageName']:
        if meta_key in doc_data:
            result[f"_meta.{meta_key}"] = doc_data[meta_key]

    return result

# -------------------------------
# New generic entry: extract_structured_document_data
# -------------------------------
def extract_structured_document_data(doc_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Robust wrapper that returns nested, structured extraction for an entire doc.
    Preferred method to call from borrower_cleanup_service.
    It returns a dict where the top-level keys correspond to SkillName sections (if present),
    otherwise returns a flattened representation of the doc.
    """
    if not isinstance(doc_data, dict):
        return {}

    try:
        out = {}

        # If Summary exists and has Labels, use the recursive label processor
        summary = doc_data.get('Summary')
        if isinstance(summary, list) and summary:
            for idx, section in enumerate(summary):
                # Each section: extract labels/groups
                skill = section.get('SkillName') or f"Section_{idx}"
                labels = section.get('Labels') or []
                section_data = _process_labels_recursive(labels)
                # Keep section-level metadata
                # if section.get('SkillName'):
                #     section_data['_SkillName'] = section.get('SkillName')
                out[skill] = section_data
        else:
            # No Summary -> conservative flatten of document with fallback extractor
            out = _extract_any_nested(doc_data)

        # preserve top-level metadata if present
        for meta in ('Title', 'GeneratedOn', 'Url', 'StageName'):
            if doc_data.get(meta) is not None:
                out.setdefault('_meta', {})[meta] = doc_data.get(meta)

        return out

    except Exception as e:
        # Fail gracefully with parse diagnostics
        return {"_ParseError": str(e), "_DocTitle": doc_data.get("Title", "Unknown")}
