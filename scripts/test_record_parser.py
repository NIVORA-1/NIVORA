import pymupdf as fitz
import re
import json

doc = fitz.open(r'C:\Users\rv347\Downloads\Engineering.pdf')

REGIONS = {'SOUTH', 'NORTH', 'EAST', 'WEST', 'CENTRAL'}

def parse_all_records():
    records = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        lines = [l.strip() for l in page.get_text("text").split('\n') if l.strip()]
        
        # Filter out header lines
        filtered = []
        i = 0
        while i < len(lines):
            l = lines[i]
            if ('PMSSS' in l or 'Admissions' in l or 'List of Colleges' in l or
                'College ID' in l or 'College Name' in l or 'Institute Region' in l or
                l in ['Establishment', 'Institute', 'Type', 'Category', 'Website', 'University', 'NBA', 'NAAC', 'NIRF', 'Course', 'Institute Course']):
                i += 1
                continue
            filtered.append(l)
            i += 1

        # Now group by College ID
        # A college ID is a 4-6 digit integer at the beginning of a record
        current_record_tokens = []
        for l in filtered:
            if re.match(r'^\d{4,6}$', l) and len(current_record_tokens) > 5:
                # Flush previous
                records.append((page_num, current_record_tokens))
                current_record_tokens = [l]
            else:
                current_record_tokens.append(l)
        if current_record_tokens and re.match(r'^\d{4,6}$', current_record_tokens[0]):
            records.append((page_num, current_record_tokens))

    print(f"Total raw record chunks: {len(records)}")
    return records

if __name__ == '__main__':
    recs = parse_all_records()
    print("Sample chunk 0:", recs[0][1])
    print("Sample chunk 1:", recs[1][1])
    print("Sample chunk 10:", recs[10][1])
