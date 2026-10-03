import pymupdf as fitz
import time

t0 = time.time()
doc = fitz.open(r'C:\Users\rv347\Downloads\Engineering.pdf')

total_rows = 0
for idx in range(10):
    page = doc[idx]
    tabs = page.find_tables(strategy="lines")
    for tab in tabs:
        t = tab.extract()
        total_rows += len(t)

print(f"10 pages: {total_rows} rows extracted in {time.time() - t0:.2f}s")
