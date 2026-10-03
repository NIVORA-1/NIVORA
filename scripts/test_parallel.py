import pymupdf as fitz
import time
from concurrent.futures import ProcessPoolExecutor

PDF_PATH = r'C:\Users\rv347\Downloads\Engineering.pdf'

def parse_page_range(page_indices):
    doc = fitz.open(PDF_PATH)
    results = []
    for idx in page_indices:
        page = doc[idx]
        tabs = page.find_tables(strategy="lines")
        for tab in tabs:
            rows = tab.extract()
            results.extend(rows)
    doc.close()
    return results

if __name__ == '__main__':
    t0 = time.time()
    doc = fitz.open(PDF_PATH)
    total_pages = len(doc)
    doc.close()
    print(f"Total pages: {total_pages}")

    # Test 12 pages with 4 workers
    test_pages = list(range(12))
    chunks = [test_pages[i::4] for i in range(4)]
    
    with ProcessPoolExecutor(max_workers=4) as executor:
        all_results = list(executor.map(parse_page_range, chunks))
    
    total_rows = sum(len(r) for r in all_results)
    print(f"12 pages parallel: {total_rows} rows in {time.time() - t0:.2f}s")
