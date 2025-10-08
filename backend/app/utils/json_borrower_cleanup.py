import json
import re
from difflib import SequenceMatcher
from collections import defaultdict

def clean_name(name):
    """Clean and normalize name for comparison"""
    if not name:
        return ""
    # Remove extra spaces, convert to uppercase, remove special characters and suffixes
    name = str(name).upper()
    # Remove common suffixes and prefixes
    name = re.sub(r'\b(POD|JR|SR|III|II|IV)\b', '', name)
    # Remove special characters but keep spaces
    name = re.sub(r'[^\w\s]', ' ', name)
    # Clean up multiple spaces
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def extract_name_components(name):
    """Extract first, middle, and last name components with fuzzy matching support"""
    cleaned = clean_name(name)
    parts = [part for part in cleaned.split() if part]  # Keep all parts including initials
    
    if not parts:
        return {'first': '', 'middle': [], 'last': '', 'all_parts': set()}
    
    components = {
        'first': parts[0] if parts else '',
        'middle': parts[1:-1] if len(parts) > 2 else (parts[1:2] if len(parts) == 2 else []),
        'last': parts[-1] if len(parts) > 1 else '',
        'all_parts': set(parts)
    }
    
    return components

def is_initial_match(full_name, initial):
    """Check if initial matches the first letter of full name"""
    if not full_name or not initial:
        return False
    return full_name[0].upper() == initial.upper()

def names_match_fuzzy(name1, name2, threshold=0.6):
    """Advanced name matching considering various name format variations - FIXED VERSION"""
    if not name1 or not name2:
        return False
    
    # Quick exact match after cleaning
    clean1 = clean_name(name1)
    clean2 = clean_name(name2)
    
    if clean1 == clean2:
        return True
    
    # Extract components - SIMPLIFIED
    parts1 = [part for part in clean1.split() if part]
    parts2 = [part for part in clean2.split() if part]
    
    if len(parts1) < 2 or len(parts2) < 2:
        return False
    
    # Get first and last names
    first1, last1 = parts1[0], parts1[-1]
    first2, last2 = parts2[0], parts2[-1]
    
    # Get middle names
    middle1 = parts1[1:-1] if len(parts1) > 2 else []
    middle2 = parts2[1:-1] if len(parts2) > 2 else []
    
    #print(f"    DEBUG: Comparing '{name1}' vs '{name2}'")
    #print(f"    DEBUG: First: '{first1}' vs '{first2}' = {first1 == first2}")
    #print(f"    DEBUG: Last: '{last1}' vs '{last2}'")
    
    # Must have matching first names
    first_match = first1 == first2 or (
        len(first1) == 1 and first1 == first2[0]
    ) or (
        len(first2) == 1 and first2 == first1[0]
    ) or (
        SequenceMatcher(None, first1, first2).ratio() > 0.8
    )
    
    if not first_match:
        #print(f"    DEBUG: First names don't match")
        return False
    
    # Must have matching last names - FIXED LEVENSHTEIN
    def levenshtein_distance(s1, s2):
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
                substitutions = previous_row[j] + (0 if c1 == c2 else 1)  # Fixed this line
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        return previous_row[-1]
    
    edit_dist = levenshtein_distance(last1, last2)
    similarity_ratio = SequenceMatcher(None, last1, last2).ratio()
    
    #print(f"    DEBUG: Edit distance: {edit_dist}, Similarity: {similarity_ratio:.2f}")
    
    last_match = last1 == last2 or edit_dist <= 2 or similarity_ratio > 0.75
    
    if not last_match:
        #print(f"    DEBUG: Last names don't match")
        return False
    
    # Middle names - one or both can be empty (very lenient)
    middle_compatible = not middle1 or not middle2  # If either is empty, they're compatible
    
    if middle1 and middle2:  # Both have middle names
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
    
    result = first_match and last_match and middle_compatible
    #print(f"    DEBUG: Final result: {result} (first={first_match}, last={last_match}, middle={middle_compatible})")
    
    return result

def similarity_score(name1, name2):
    """Calculate similarity between two names with enhanced logic"""
    if names_match_fuzzy(name1, name2):
        return 1.0
    
    # Fall back to basic similarity
    clean1 = clean_name(name1)
    clean2 = clean_name(name2)
    
    direct_similarity = SequenceMatcher(None, clean1, clean2).ratio()
    
    # Name parts overlap
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

def safe_string_compare(name1, name2, threshold=0.7):
    """Compare two names with enhanced matching"""
    if not name1 or not name2:
        return False
    
    return names_match_fuzzy(name1, name2, threshold)

def consolidate_similar_borrowers(master_borrowers):
    """Consolidate borrowers that are actually the same person with name variations"""
    if not master_borrowers:
        return []
    
    consolidated = []
    used_indices = set()
    
    # Add debug output
    #print(f"  DEBUG: Starting consolidation with {len(master_borrowers)} borrowers")
    
    for i, borrower1 in enumerate(master_borrowers):
        if i in used_indices:
            continue
        
        # This will be our consolidated borrower group
        matching_group = [borrower1]
        used_indices.add(i)
        
        # Find all other borrowers that match this one
        for j, borrower2 in enumerate(master_borrowers):
            if j <= i or j in used_indices:
                continue
            
            match_result = names_match_fuzzy(borrower1, borrower2)
            #print(f"  DEBUG: Testing '{borrower1}' vs '{borrower2}': {match_result}")
            
            if match_result:
                matching_group.append(borrower2)
                used_indices.add(j)
                #print(f"  Consolidating: '{borrower2}' -> '{borrower1}'")
        
        consolidated.append({
            'primary_name': borrower1,  # Use first one as primary
            'all_variations': matching_group
        })
    
    return consolidated

def extract_individual_names_from_multi_borrower(multi_borrower_name):
    """Extract individual names from multi-borrower strings like 'GRETCHEN A WNUKOWSKI POD, SARAH B WNUKOWSKI'"""
    if not multi_borrower_name:
        return []
    
    # Split by comma to get individual names
    names = [name.strip() for name in multi_borrower_name.split(',') if name.strip()]
    return names

def find_best_borrower_match(document_borrower_name, consolidated_borrowers):
    """Find the best matching consolidated borrower for a document borrower name"""
    if not document_borrower_name or not consolidated_borrowers:
        return None
    
    # Handle multi-borrower names (comma-separated)
    individual_names = extract_individual_names_from_multi_borrower(document_borrower_name)
    
    # For multi-borrower documents, try to match the first name that has a match
    if len(individual_names) > 1:
        #print(f"    Multi-borrower document with names: {individual_names}")
        for individual_name in individual_names:
            match = find_single_borrower_match(individual_name, consolidated_borrowers)
            if match:
                #print(f"    Matched individual name '{individual_name}' to '{match}'")
                return match
        return None
    else:
        # Single borrower case
        return find_single_borrower_match(document_borrower_name, consolidated_borrowers)

def find_single_borrower_match(document_borrower_name, consolidated_borrowers):
    """Find the best matching consolidated borrower for a single document borrower name"""
    if not document_borrower_name or not consolidated_borrowers:
        return None
    
    best_match = None
    best_score = 0
    
    for borrower_group in consolidated_borrowers:
        # Check against all variations of this borrower
        for variation in borrower_group['all_variations']:
            if names_match_fuzzy(document_borrower_name, variation):
                score = similarity_score(document_borrower_name, variation)
                if score > best_score:
                    best_score = score
                    best_match = borrower_group['primary_name']
    
    return best_match

def extract_borrower_name_from_document(doc_data):
    """Extract borrower name from document data - FIXED VERSION"""
    if not isinstance(doc_data, dict):
        return None
    
    borrower_name = None
    
    # Check Summary structure for borrower name fields ONLY
    if 'Summary' in doc_data:
        summaries = doc_data['Summary'] if isinstance(doc_data['Summary'], list) else [doc_data['Summary']]
        for summary in summaries:
            if 'Labels' in summary:
                for label in summary['Labels']:
                    label_name = label.get('LabelName', '').lower()
                    
                    # STRICT borrower name fields only - exclude employer fields
                    borrower_indicators = [
                        'borrower name', 'employee name', 'account holder name', 
                        'applicant name', 'employee full name', 'full name'
                    ]
                    
                    # Exclude employer/company fields explicitly
                    employer_indicators = [
                        'employer', 'company', 'organization', 'business', 
                        'corp', 'inc', 'llc', 'ltd', 'bank', 'association'
                    ]
                    
                    # Must match borrower indicators and NOT match employer indicators
                    is_borrower_field = any(indicator in label_name for indicator in borrower_indicators)
                    is_employer_field = any(indicator in label_name for indicator in employer_indicators)
                    
                    if is_borrower_field and not is_employer_field:
                        if 'Values' in label and label['Values']:
                            for val_obj in label['Values']:
                                if 'Value' in val_obj and val_obj['Value']:
                                    value = val_obj['Value'].strip()
                                    
                                    # Additional validation - exclude obvious company names
                                    company_patterns = [
                                        r'\b(LLC|INC|CORP|LTD|CO|COMPANY|BANK|ASSOCIATION|CHASE|JPMORGAN)\b',
                                        r'\b(LENDING|FINANCIAL|SERVICES|SOLUTIONS|GROUP)\b'
                                    ]
                                    
                                    is_company_name = any(re.search(pattern, value.upper()) for pattern in company_patterns)
                                    
                                    if not is_company_name and not re.match(r'^\d+$', value) and len(value) > 2:
                                        if not borrower_name or len(value) > len(borrower_name):
                                            borrower_name = value
                                            #print(f"    Found borrower name: '{value}' from field: '{label.get('LabelName')}'")
    
    return borrower_name

def extract_clean_labels(doc_data):
    """Extract clean label-value pairs from document, removing unnecessary fields"""
    if not isinstance(doc_data, dict):
        return {}
    
    clean_data = {}
    
    # Extract from Summary structure
    if 'Summary' in doc_data:
        summaries = doc_data['Summary'] if isinstance(doc_data['Summary'], list) else [doc_data['Summary']]
        for summary in summaries:
            if 'Labels' in summary:
                for label in summary['Labels']:
                    label_name = label.get('LabelName')
                    if not label_name:
                        continue
                    
                    # Extract values
                    values = []
                    if 'Values' in label and label['Values']:
                        for val_obj in label['Values']:
                            if 'Value' in val_obj:
                                values.append(val_obj['Value'])
                    
                    # Store the label with its values
                    if values:
                        if len(values) == 1:
                            clean_data[label_name] = values[0]
                        else:
                            clean_data[label_name] = values
    
    # Add document metadata (clean)
    metadata_fields = ['Title', 'Url', 'StageName', 'GeneratedOn']
    for field in metadata_fields:
        if field in doc_data:
            clean_data[field] = doc_data[field]
    
    return clean_data

def show_json_structure(input_file, limit=2):
    """Helper function to show the structure of your JSON file"""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    #print("JSON Structure Analysis:")
    #print(f"Data type: {type(data)}")
    
    if isinstance(data, list):
        ##print(f"Total items: {len(data)}")
        items_to_check = data[:limit]
    elif isinstance(data, dict):
        ##print("Single object structure")
        items_to_check = [data]
        limit = 1
    else:
        ##print(f"Unexpected data type: {type(data)}")
        return
    
    for i, item in enumerate(items_to_check):
        ##print(f"\nItem {i+1}:")
        if isinstance(item, dict):
            ##print(f"  BorrowerName: {item.get('BorrowerName', 'N/A')}")
            
            for key, value in item.items():
                if key != 'BorrowerName':
                    if isinstance(value, list):
                        ##print(f"  {key}: {len(value)} documents")
                        if value and isinstance(value[0], dict):
                            # Show document structure
                            doc = value[0]
                            if 'Summary' in doc:
                                pass
                                ##print(f"    Has Summary structure")
                            ##print(f"    Keys: {list(doc.keys())}")
                    else:
                        pass
                        #print(f"  {key}: {type(value)}")
        else:
            pass
            #print(f"  Item is {type(item)}: {str(item)[:100]}...")
            
    # Show top-level keys if it's a dictionary
    if isinstance(data, dict):
        #print(f"\nTop-level keys: {list(data.keys())}")
        # Check if any top-level values are lists that might contain borrower data
        for key, value in data.items():
            if isinstance(value, list) and value:
                #print(f"  {key} contains {len(value)} items")
                if isinstance(value[0], dict):
                    #print(f"    First item keys: {list(value[0].keys())}")
                    if 'BorrowerName' in value[0]:
                        #print(f"    Found BorrowerName in {key}")
                        break

def clean_borrower_documents(input_file, output_file):
    """Main function to clean and organize borrower documents"""
    
    # Load the JSON file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    #print(f"Loaded JSON - type: {type(data)}")
    
    # Handle different JSON structures
    if isinstance(data, dict):
        # Check if there's a key that contains the array of borrower data
        items_to_process = []
        for key, value in data.items():
            if isinstance(value, list) and value:
                # Check if this list contains borrower data
                if isinstance(value[0], dict) and 'BorrowerName' in value[0]:
                    #print(f"Found borrower data in key: {key}")
                    items_to_process = value
                    break
        
        if not items_to_process:
            # Maybe the entire dict is one borrower record
            if 'BorrowerName' in data:
                items_to_process = [data]
            else:
                #print("Could not find borrower data structure in the JSON")
                return
    elif isinstance(data, list):
        items_to_process = data
    else:
        #print(f"Unexpected JSON structure: {type(data)}")
        return
    
    #print(f"Processing {len(items_to_process)} items")
    
    # Step 1: Collect all unique borrower names from the top-level BorrowerName fields
    master_borrowers = set()
    
    for item in items_to_process:
        if 'BorrowerName' in item and item['BorrowerName']:
            borrower_name = item['BorrowerName'].strip()
            if borrower_name and borrower_name != "Unidentified Borrower":
                # Handle comma-separated multiple borrowers
                if ',' in borrower_name:
                    borrowers = [b.strip() for b in borrower_name.split(',') if b.strip()]
                    master_borrowers.update(borrowers)
                else:
                    master_borrowers.add(borrower_name)
    
    master_borrowers = list(master_borrowers)
    #print(f"Found master borrowers: {master_borrowers}")
    
    if not master_borrowers:
        #print("No master borrowers found! Check your JSON structure.")
        return
    
    # Consolidate similar borrower names
    #print(f"\nConsolidating similar borrower names...")
    consolidated_borrowers = consolidate_similar_borrowers(master_borrowers)
    
    #print(f"Consolidated into {len(consolidated_borrowers)} unique borrowers:")
    for group in consolidated_borrowers:
        #print(f"  Primary: {group['primary_name']}")
        if len(group['all_variations']) > 1:
            pass
            #print(f"    Variations: {group['all_variations'][1:]}")
    
    # Initialize cleaned structure using primary names
    cleaned_data = {}
    for borrower_group in consolidated_borrowers:
        cleaned_data[borrower_group['primary_name']] = {}
    
    # Step 2: Process each item in the data
    for item in items_to_process:
        if not isinstance(item, dict) or 'BorrowerName' not in item:
            continue
        
        top_level_borrower = item['BorrowerName']
        
        # Process each document type in this item
        for key, value in item.items():
            if key == 'BorrowerName':
                continue
            
            # This should be a document type (W2, VOE, Paystubs, etc.)
            document_type = key
            
            # Handle document array
            documents = value if isinstance(value, list) else [value]
            
            #print(f"\nProcessing {document_type} with {len(documents)} documents")
            
            for doc in documents:
                if not isinstance(doc, dict):
                    continue
                
                # Extract borrower name from this specific document
                doc_borrower_name = extract_borrower_name_from_document(doc)
                
                if not doc_borrower_name:
                    #print(f"  No borrower name found in document, using top-level: {top_level_borrower}")
                    # Fall back to top-level borrower name
                    if top_level_borrower and top_level_borrower != "Unidentified Borrower":
                        # Find which consolidated borrower this top-level name belongs to
                        matched_borrower = find_best_borrower_match(top_level_borrower, consolidated_borrowers)
                        if not matched_borrower:
                            #print(f"  Skipping document - could not match top-level borrower: {top_level_borrower}")
                            continue
                    else:
                        #print(f"  Skipping document - no valid borrower name")
                        continue
                else:
                    # Find the best matching master borrower
                    matched_borrower = find_best_borrower_match(doc_borrower_name, consolidated_borrowers)
                    
                    if not matched_borrower:
                        #print(f"  Could not match '{doc_borrower_name}' to any master borrower")
                        continue
                    
                    #print(f"  Matched '{doc_borrower_name}' to '{matched_borrower}'")
                
                # Extract clean data from document
                clean_doc = extract_clean_labels(doc)
                
                if not clean_doc:
                    #print(f"  No clean data extracted from document")
                    continue
                
                # Add to the appropriate borrower's documents
                if document_type not in cleaned_data[matched_borrower]:
                    cleaned_data[matched_borrower][document_type] = []
                
                cleaned_data[matched_borrower][document_type].append(clean_doc)
    
    # Remove borrowers with no documents
    cleaned_data = {k: v for k, v in cleaned_data.items() if v}
    
    # Save the cleaned data
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
    
    #print(f"\nCleaned data saved to {output_file}")
    
    # #print summary
    #print("\n=== SUMMARY ===")
    for borrower, docs in cleaned_data.items():
        #print(f"\nBorrower: {borrower}")
        for doc_type, doc_list in docs.items():
            #print(f"  - {doc_type}: {len(doc_list)} document(s)")
            # Show a sample of the fields in the first document
            if doc_list and isinstance(doc_list[0], dict):
                sample_fields = list(doc_list[0].keys())[:5]  # First 5 fields
                #print(f"    Sample fields: {sample_fields}")

# Usage example
if __name__ == "__main__":
    # Test the name matching with your examples
    test_names = [
        ("Gretchen Adriaana Wnukowski", "GRETCHEN ADRIANA WNUKOWSKI"),
        ("Gretchen Adriaana Wnukowski", "Gretchen Wunkowski"),  # Missing middle name + last name variation
        ("GRETCHEN ADRIANA WNUKOWSKI", "Gretchen Wunkowski"),   # Your actual failed case
        ("Gretchen Adriaana Wnukowski", "GRETCHEN A WNUKOWSKI POD"),
        ("SAMUEL C SOTELLO", "Samuel Sotello"),
        ("SAMUEL C SOTELLO", "SAMUEL SOTELLO"),
        ("John Michael Smith", "John Smith"),  # Another missing middle name test
        ("Mary A Johnson", "Mary Johnson"),    # Missing middle initial test
        ("WNUKOWSKI", "WUNKOWSKI"),           # Last name variation test
    ]
    
    #print("Testing name matching:")
    for name1, name2 in test_names:
        match = names_match_fuzzy(name1, name2)
        score = similarity_score(name1, name2)
        #print(f"'{name1}' vs '{name2}': {match} (score: {score:.2f})")
    
    # Test the specific failing case
    #print(f"\n🔍 SPECIFIC TEST:")
    gretchen1 = "Gretchen Adriaana Wnukowski"
    gretchen2 = "Gretchen Wunkowski"
    match_result = names_match_fuzzy(gretchen1, gretchen2)
    #print(f"'{gretchen1}' vs '{gretchen2}': {match_result}")
    
    if not match_result:
        pass
        #print("❌ CRITICAL: This should match but doesn't!")
    else:
        pass
        #print("✅ SUCCESS: Names match correctly")
    
    #print("\n" + "="*50)
    
    # Replace with your actual file paths
    input_file = "IC_LOAN_50490_24Aug2025_103311.json"  # Update this path
    output_file = "cleaned_borrower_data_v2_2.json"
    
    try:
        # First, let's analyze the structure
        #print("Analyzing JSON structure...")
        show_json_structure(input_file)
        
        #print("\n" + "="*50)
        #print("Starting cleanup process...")
        
        clean_borrower_documents(input_file, output_file)
        #print("\nProcessing completed successfully!")
        
    except FileNotFoundError:
        #print(f"Error: Could not find input file '{input_file}'")
        print("Please update the input_file variable with the correct path to your JSON file.")
    except json.JSONDecodeError:
        print("Error: Invalid JSON format in input file")
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()