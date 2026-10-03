import pdfplumber

pdf_path = r'C:\Users\rv347\Downloads\Engineering.pdf'

with pdfplumber.open(pdf_path) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    p1 = pdf.pages[0]
    tables = p1.extract_tables()
    print(f"Tables on p1: {len(tables)}")
    if tables:
        t = tables[0]
        print(f"Rows in table 0: {len(t)}")
        for i in range(min(5, len(t))):
            print(f"Row {i}: {t[i]}")
