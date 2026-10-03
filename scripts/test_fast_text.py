import pymupdf as fitz
import time

t0 = time.time()
doc = fitz.open(r'C:\Users\rv347\Downloads\Engineering.pdf')
print(f"Pages: {len(doc)}")
all_text = ""
for page in doc:
    all_text += page.get_text("text") + "\n"

print(f"Extracted {len(all_text)} chars in {time.time() - t0:.2f}s")
lines = [l.strip() for l in all_text.split('\n') if l.strip()]
print(f"Total lines: {len(lines)}")
