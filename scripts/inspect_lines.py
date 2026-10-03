import pymupdf as fitz

doc = fitz.open(r'C:\Users\rv347\Downloads\Engineering.pdf')
p0 = doc[0]
lines = p0.get_text("text").split('\n')
print(f"Page 0 lines: {len(lines)}")
for idx, l in enumerate(lines[:60]):
    print(f"{idx}: {repr(l)}")
