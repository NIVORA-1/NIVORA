import pymupdf as fitz
import re
import json
import time
from concurrent.futures import ProcessPoolExecutor, as_completed

PDF_PATH = r'C:\Users\rv347\Downloads\Engineering.pdf'

def clean_text(val):
    if val is None:
        return ''
    s = str(val).replace('\n', ' ').replace('\r', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def clean_url(url):
    url = clean_text(url)
    if url in ['-', 'None', '', 'No', 'Yes']:
        return ''
    url = url.split(',')[0].strip()
    if url and not url.startswith('http://') and not url.startswith('https://') and '.' in url:
        url = 'https://' + url
    return url

def clean_branch(raw_course):
    raw_course = clean_text(raw_course).replace('Â', '').replace('&nbsp;', ' ')
    raw_course = re.sub(r'\s+', ' ', raw_course).strip()
    
    # Capitalize cleanly
    title = raw_course.title()
    # Acronyms
    acronyms = ['CSE', 'IT', 'ECE', 'EEE', 'AI', 'ML', 'R&D', 'GIS', 'GPS', 'CAD', 'CAM', 'VLSI']
    for acr in acronyms:
        title = re.sub(rf'\b{acr}\b', acr, title, flags=re.IGNORECASE)
    
    title = title.replace('&Amp;', '&')
    title = title.replace('Computer Sceince', 'Computer Science')
    title = title.replace('Engg', 'Engineering')
    title = title.replace('Communcation', 'Communication')
    title = title.replace('And', '&')
    title = re.sub(r'\s*&\s*', ' & ', title)
    title = re.sub(r'\s+', ' ', title).strip()

    # Standard branch normalization
    if 'Computer Science' in title and 'Engineering' in title:
        title = 'Computer Science & Engineering'
    elif 'Information Technology' in title:
        title = 'Information Technology'
    elif 'Electronics' in title and 'Communication' in title:
        title = 'Electronics & Communication Engineering'
    elif 'Electrical' in title and 'Electronics' in title:
        title = 'Electrical & Electronics Engineering'
    elif 'Mechanical' in title:
        title = 'Mechanical Engineering'
    elif 'Civil' in title:
        title = 'Civil Engineering'
    elif 'Chemical' in title:
        title = 'Chemical Engineering'
    elif 'Biotechnology' in title or 'Biotech' in title:
        title = 'Biotechnology'
    elif 'Aeronautical' in title:
        title = 'Aeronautical Engineering'
    elif 'Aerospace' in title:
        title = 'Aerospace Engineering'
    elif 'Automobile' in title:
        title = 'Automobile Engineering'

    return title

def clean_university(uni_name, college_name):
    uni = clean_text(uni_name).replace('Â', '').replace('&nbsp;', ' ')
    uni = re.sub(r'\s+', ' ', uni).strip()
    
    if not uni or uni == '-' or uni.lower() == 'none':
        uni = college_name

    # Standardize JNTUH
    if 'Jawaharlal Nehru Technological University' in uni and 'Hyderabad' in uni:
        uni = 'Jawaharlal Nehru Technological University, Hyderabad'
    elif 'Jawaharlal Nehru Technological University' in uni and 'Kakinada' in uni:
        uni = 'Jawaharlal Nehru Technological University, Kakinada'
    elif 'Jawaharlal Nehru Technological University' in uni and 'Anantapur' in uni:
        uni = 'Jawaharlal Nehru Technological University, Anantapur'
    elif 'Anna University' in uni:
        uni = 'Anna University, Chennai'
    elif 'Visvesvaraya' in uni:
        uni = 'Visvesvaraya Technological University, Belgaum'
    elif 'University of Pune' in uni or 'Savitribai Phule Pune' in uni:
        uni = 'Savitribai Phule Pune University'
    elif 'Mumbai University' in uni:
        uni = 'University of Mumbai'
    elif 'Dr. A.P.J. Abdul Kalam Technical University' in uni or 'Uttar Pradesh Technical University' in uni:
        uni = 'Dr. A.P.J. Abdul Kalam Technical University, Lucknow'
    elif 'Rajasthan Technical University' in uni:
        uni = 'Rajasthan Technical University, Kota'
    elif 'APJ Abdul Kalam Technological University' in uni or 'Kerala Technological University' in uni:
        uni = 'APJ Abdul Kalam Technological University, Kerala'
    elif 'Punjab Technical University' in uni:
        uni = 'I.K. Gujral Punjab Technical University, Jalandhar'
    elif 'Rajiv Gandhi Proudyogiki' in uni:
        uni = 'Rajiv Gandhi Proudyogiki Vishwavidyalaya, Bhopal'
    elif 'Maulana Abul Kalam Azad University' in uni:
        uni = 'Maulana Abul Kalam Azad University of Technology, West Bengal'
    elif 'Gujarat Technological University' in uni:
        uni = 'Gujarat Technological University, Ahmedabad'

    return uni

def process_page_range(pages):
    doc = fitz.open(PDF_PATH)
    rows_out = []
    for page_idx in pages:
        page = doc[page_idx]
        tabs = page.find_tables(strategy="lines")
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
                uni_raw = clean_text(row[10])
                course_raw = clean_text(row[15])
                
                if not course_raw or course_raw == '-':
                    continue

                uni = clean_university(uni_raw, c_name)
                branch = clean_branch(course_raw)

                rows_out.append({
                    "external_college_id": ext_id,
                    "college_name": c_name,
                    "state": state,
                    "district": district,
                    "website": website,
                    "university_name": uni,
                    "branch_name": branch
                })
    doc.close()
    return rows_out

def main():
    t0 = time.time()
    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    doc.close()
    print(f"Starting extraction of {total_pages} pages...")

    num_workers = 6
    chunk_size = (total_pages + num_workers - 1) // num_workers
    page_chunks = []
    for i in range(0, total_pages, chunk_size):
        page_chunks.append(list(range(i, min(i + chunk_size, total_pages))))

    all_rows = []
    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        futures = [executor.submit(process_page_range, chunk) for chunk in page_chunks]
        for f in as_completed(futures):
            res = f.result()
            all_rows.extend(res)
            print(f"Batch completed: {len(res)} rows so far...")

    print(f"All pages processed in {time.time() - t0:.2f}s! Total valid rows: {len(all_rows)}")

    # Deduplicate and aggregate
    universities = set()
    branches = set()
    colleges = {} # ext_id -> dict
    college_branches = set() # (ext_id, branch_name)

    for r in all_rows:
        u_name = r["university_name"]
        b_name = r["branch_name"]
        c_id = r["external_college_id"]
        c_name = r["college_name"]

        universities.add(u_name)
        branches.add(b_name)

        if c_id not in colleges:
            colleges[c_id] = {
                "external_college_id": c_id,
                "name": c_name,
                "university_name": u_name,
                "state": r["state"],
                "district": r["district"],
                "website": r["website"]
            }
        
        college_branches.add((c_id, b_name))

    print(f"Summary:")
    print(f"  Colleges: {len(colleges)}")
    print(f"  Universities: {len(universities)}")
    print(f"  Branches: {len(branches)}")
    print(f"  College Branches: {len(college_branches)}")

    # Prepare structured JSON
    branches_list = []
    for b in sorted(list(branches)):
        norm = re.sub(r'[^a-z0-9]+', '_', b.lower()).strip('_')
        branches_list.append({"name": b, "normalized_name": norm})

    data_payload = {
        "universities": sorted(list(universities)),
        "branches": branches_list,
        "colleges": sorted(list(colleges.values()), key=lambda x: x["name"]),
        "college_branches": [{"external_college_id": cb[0], "branch_name": cb[1]} for cb in sorted(list(college_branches))]
    }

    # Save to src/data/engineering_colleges_database.json
    with open("src/data/engineering_colleges_database.json", "w", encoding="utf-8") as f:
        json.dump(data_payload, f, indent=2, ensure_ascii=False)

    print("Saved src/data/engineering_colleges_database.json successfully.")

if __name__ == '__main__':
    main()
