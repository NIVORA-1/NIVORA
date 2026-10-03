import pdfplumber
import json
import re

pdf_path = r'C:\Users\rv347\Downloads\Engineering.pdf'

def clean_text(val):
    if not val:
        return ''
    # Replace newlines and multiple spaces
    val = re.sub(r'\s+', ' ', str(val)).strip()
    return val

def run_extraction():
    colleges = {} # key: external_college_id or (name, university)
    universities = set()
    branches = set()
    college_branches = set() # (college_external_id, branch_name)

    with pdfplumber.open(pdf_path) as pdf:
        print(f"Processing {len(pdf.pages)} pages...")
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if not row or len(row) < 16:
                        continue
                    c_id = clean_text(row[0])
                    # Header row detection
                    if c_id == 'College ID' or 'Admissions' in c_id or 'List of Colleges' in c_id or not c_id:
                        continue
                    
                    c_name = clean_text(row[1])
                    state = clean_text(row[3])
                    district = clean_text(row[4])
                    website = clean_text(row[9])
                    if website == '-':
                        website = ''
                    elif website and not website.startswith('http') and not website.startswith('www') and '.' in website:
                        website = 'https://' + website
                    
                    uni_name = clean_text(row[10])
                    if not uni_name or uni_name == '-' or uni_name.lower() == 'none':
                        # If university is None, use College Name or Deemed
                        uni_name = c_name

                    # Normalize university name typos if any
                    uni_name = uni_name.replace('VisvesvarayaÂ Technological University', 'Visvesvaraya Technological University')
                    uni_name = uni_name.replace('Visvesvaraya&nbsp;Technological University', 'Visvesvaraya Technological University')

                    course_name = clean_text(row[15])
                    if not course_name or course_name == '-':
                        continue

                    # Clean branch/course name
                    course_name = course_name.title()
                    # Keep abbreviations proper
                    course_name = re.sub(r'\bCse\b', 'CSE', course_name, flags=re.IGNORECASE)
                    course_name = re.sub(r'\bIt\b', 'IT', course_name, flags=re.IGNORECASE)
                    course_name = re.sub(r'\bEce\b', 'ECE', course_name, flags=re.IGNORECASE)
                    course_name = re.sub(r'\bEee\b', 'EEE', course_name, flags=re.IGNORECASE)

                    universities.add(uni_name)
                    branches.add(course_name)

                    if c_id not in colleges:
                        colleges[c_id] = {
                            "external_college_id": c_id,
                            "name": c_name,
                            "university_name": uni_name,
                            "state": state,
                            "district": district,
                            "website": website
                        }
                    
                    college_branches.add((c_id, course_name))

    print(f"Total Colleges extracted: {len(colleges)}")
    print(f"Total Universities extracted: {len(universities)}")
    print(f"Total Branches extracted: {len(branches)}")
    print(f"Total College-Branch mappings: {len(college_branches)}")

    # Check JNTUH colleges
    jntuh_colleges = [c for c in colleges.values() if 'Hyderabad' in c['university_name'] or 'JNTUH' in c['university_name'] or 'JNTU' in c['name']]
    print(f"JNTU / JNTUH Colleges found: {len(jntuh_colleges)}")
    for jc in jntuh_colleges[:5]:
        print(f"  {jc['external_college_id']}: {jc['name']} -> {jc['university_name']}")

    # Save to JSON for seeding
    output_data = {
        "universities": sorted(list(universities)),
        "branches": sorted(list(branches)),
        "colleges": list(colleges.values()),
        "college_branches": [{"external_college_id": cb[0], "branch_name": cb[1]} for cb in sorted(list(college_branches))]
    }

    with open("scripts/extracted_colleges_data.json", "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print("Saved to scripts/extracted_colleges_data.json successfully.")

if __name__ == "__main__":
    run_extraction()
