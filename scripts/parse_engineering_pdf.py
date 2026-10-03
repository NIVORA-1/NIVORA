import pypdf
import re
import json

def parse_pdf():
    print("Loading Engineering.pdf...")
    reader = pypdf.PdfReader(r'C:\Users\rv347\Downloads\Engineering.pdf')
    total_pages = len(reader.pages)
    print(f"Total pages: {total_pages}")

    # Collect text per page
    all_text = ""
    for idx, page in enumerate(reader.pages):
        all_text += page.extract_text() + "\n"

    # Normalize whitespace
    lines = [line.strip() for line in all_text.split('\n') if line.strip()]
    
    # We want to identify rows
    # A row typically starts with a numeric College ID (e.g. 31645, 33200, 32106, 1-1234567, etc.)
    # Let's inspect unique college blocks
    print(f"Total extracted lines: {len(lines)}")

    # Common branch keywords
    common_branches = [
        "COMPUTER SCIENCE & ENGINEERING",
        "COMPUTER SCIENCE AND ENGINEERING",
        "INFORMATION TECHNOLOGY",
        "ELECTRONICS & COMMUNICATION ENGG",
        "ELECTRONICS AND COMMUNICATION ENGINEERING",
        "ELECTRICAL AND ELECTRONICS ENGINEERING",
        "MECHANICAL ENGINEERING",
        "CIVIL ENGINEERING",
        "ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING",
        "ARTIFICIAL INTELLIGENCE & DATA SCIENCE",
        "DATA SCIENCE",
        "BIOTECHNOLOGY",
        "CHEMICAL ENGINEERING",
        "AUTOMOBILE ENGINEERING",
        "AERONAUTICAL ENGINEERING",
        "AGRICULTURAL ENGINEERING",
        "ELECTRONICS AND COMPUTER ENGINEERING",
        "INDUSTRIAL AND PRODUCTION ENGINEERING",
        "INFORMATION SCIENCE AND TECHNOLOGY",
        "MINING ENGINEERING",
        "METALLURGICAL ENGINEERING",
        "ROBOTICS AND AUTOMATION",
        "CYBER SECURITY"
    ]

    # Save all text for review
    with open("scripts/extracted_pdf_text.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(lines[:1000]))

    print("Sample lines written to scripts/extracted_pdf_text.txt")

if __name__ == "__main__":
    parse_pdf()
