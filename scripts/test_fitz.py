import fitz
import time

t0 = time.time()
doc = fitz.open(r'C:\Users\rv347\Downloads\Engineering.pdf')
print(f"Pages: {len(doc)}, opened in {time.time() - t0:.2f}s")

for i in range(2):
    page = doc[i]
    tabs = page.find_tables()
    for tab in tabs:
        t = tab.extract()
        print(f"Page {i} table rows: {len(t)}")
        if len(t) > 2:
            print("Row 0:", t[0])
            print("Row 2:", t[2])
            print("Row 3:", t[3])
print(f"Done in {time.time() - t0:.2f}s")
