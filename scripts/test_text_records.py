import pymupdf as fitz
import re
import json

doc = fitz.open(r'C:\Users\rv347\Downloads\Engineering.pdf')

def analyze_records():
    # Let's see how each page's text is formatted
    all_rows = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        
        # Look for college ID lines
        # In this PDF, every college ID is a number on its own line: e.g. '31645', '33200'
        # Let's inspect where college IDs occur
        i = 0
        while i < len(lines):
            line = lines[i]
            if re.match(r'^\d{4,6}$', line):
                # Found a potential college ID!
                # Let's collect lines until next college ID or end of page
                rec_lines = [line]
                i += 1
                while i < len(lines) and not re.match(r'^\d{4,6}$', lines[i]):
                    if not ('PMSSS' in lines[i] or 'Admissions' in lines[i] or 'List of Colleges' in lines[i]):
                        rec_lines.append(lines[i])
                    i += 1
                all_rows.append((page_num, rec_lines))
            else:
                i += 1

    print(f"Total records identified: {len(all_rows)}")
    for j in range(min(5, len(all_rows))):
        print(f"\n--- Record {j} (Page {all_rows[j][0]}) ---")
        print(all_rows[j][1])

if __name__ == '__main__':
    analyze_records()
