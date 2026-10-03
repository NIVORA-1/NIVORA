import pymupdf as fitz
import json
import re

pdf_path = r'C:\Users\rv347\Downloads\Engineering.pdf'

def clean_text(val):
    if val is None:
        return ''
    s = str(val).replace('\n', ' ').replace('\r', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def clean_url(url):
    url = clean_text(url)
    if url in ['-', 'None', '']:
        return ''
    # Some URLs have trailing commas or fragments
    url = url.split(',')[0].strip()
    if url and not url.startswith('http://') and not url.startswith('https://'):
        url = 'https://' + url
    return url

def normalize_branch_name(branch):
    # Normalized short code / slug
    b = clean_text(branch).lower()
    b = re.sub(r'[^a-z0-9]+', '_', b).strip('_')
    return b

def extract_all():
    doc = fitz.open(pdf_path)
    print(f"Opened PDF with {len(doc)} pages.")

    universities_map = {} # uni_name -> count
    colleges_map = {}     # external_id -> dict
    branches_map = {}     # clean_name -> normalized_name
    college_branches = set() # (external_id, branch_name)

    row_count = 0

    for page_idx in range(len(doc)):
        page = doc[page_idx]
        tabs = page.find_tables()
        for tab in tabs:
            rows = tab.extract()
            for row in rows:
                if not row or len(row) < 16:
                    continue
                ext_id = clean_text(row[0])
                if not ext_id or not ext_id[0].isdigit():
                    continue

                c_name = clean_text(row[1])
                state = clean_text(row[3])
                district = clean_text(row[4])
                website = clean_url(row[9])
                uni_name = clean_text(row[10])

                if not uni_name or uni_name == '-' or uni_name.lower() == 'none':
                    uni_name = c_name  # Autonomous / Deemed institute behaves as university

                # Clean university name artifacts
                uni_name = uni_name.replace('Â', '').replace('&nbsp;', ' ')
                uni_name = re.sub(r'\s+', ' ', uni_name).strip()

                course = clean_text(row[15])
                if not course or course == '-':
                    continue

                # Clean course name formatting
                course = course.replace('Â', '').replace('&nbsp;', ' ')
                course = re.sub(r'\s+', ' ', course).strip()
                # Title casing while keeping known acronyms uppercase
                title_course = course.title()
                for acr in ['CSE', 'IT', 'ECE', 'EEE', 'AI', 'ML', 'R&D', 'GIS', 'GPS', 'CAD', 'CAM', 'VLSI']:
                    title_course = re.sub(rf'\b{acr}\b', acr, title_course, flags=re.IGNORECASE)
                # Specific corrections
                title_course = title_course.replace('Computer Sceince', 'Computer Science')
                title_course = title_course.replace('&Amp;', '&')
                title_course = title_course.replace('Engg', 'Engineering')
                title_course = title_course.replace('Communcation', 'Communication')

                norm_branch = normalize_branch_name(title_course)
                branches_map[title_course] = norm_branch

                universities_map[uni_name] = universities_map.get(uni_name, 0) + 1

                if ext_id not in colleges_map:
                    colleges_map[ext_id] = {
                        "external_college_id": ext_id,
                        "name": c_name,
                        "university_name": uni_name,
                        "state": state,
                        "district": district,
                        "website": website
                    }

                college_branches.add((ext_id, title_course))
                row_count += 1

    print(f"Total rows extracted: {row_count}")
    print(f"Unique Universities: {len(universities_map)}")
    print(f"Unique Colleges: {len(colleges_map)}")
    print(f"Unique Branches: {len(branches_map)}")
    print(f"Unique College Branches: {len(college_branches)}")

    # Check JNTUH Specifically
    jntuh_matches = [u for u in universities_map.keys() if 'Hyderabad' in u and 'Jawaharlal' in u]
    print(f"JNTUH Universities: {jntuh_matches}")
    jntuh_colleges = [c for c in colleges_map.values() if any(u in c['university_name'] for u in jntuh_matches)]
    print(f"JNTUH Colleges count: {len(jntuh_colleges)}")
    for jc in jntuh_colleges[:5]:
        print(f"  {jc['external_college_id']}: {jc['name']} ({jc['district']}, {jc['state']})")

    # Save to JSON
    extracted_json = {
        "universities": sorted(list(universities_map.keys())),
        "branches": [{"name": k, "normalized_name": v} for k, v in sorted(branches_map.items())],
        "colleges": list(colleges_map.values()),
        "college_branches": [{"external_college_id": cb[0], "branch_name": cb[1]} for cb in sorted(list(college_branches))]
    }

    with open("scripts/extracted_colleges_data.json", "w", encoding="utf-8") as f:
        json.dump(extracted_json, f, indent=2, ensure_ascii=False)

    print("Wrote scripts/extracted_colleges_data.json successfully.")

if __name__ == '__main__':
    extract_all()
