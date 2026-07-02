import io
import re
import docx2txt
from pypdf import PdfReader
from typing import Tuple, Dict, Any, List

def clean_text(text: str) -> str:
    """Cleans raw text extracted from documents by removing extra whitespace."""
    if not text:
        return ""
    # Replace multiple spaces with a single space
    text = re.sub(r'[ \t]+', ' ', text)
    # Replace multiple newlines with single/double newlines
    text = re.sub(r'\n+', '\n', text)
    return text.strip()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text from PDF bytes."""
    pdf_file = io.BytesIO(file_bytes)
    reader = PdfReader(pdf_file)
    extracted_text = []
    
    for page in reader.pages:
        text = page.extract_text()
        if text:
            extracted_text.append(text)
            
    return clean_text("\n".join(extracted_text))

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts text from DOCX bytes using docx2txt."""
    docx_file = io.BytesIO(file_bytes)
    # docx2txt processes files. We write temporary bytes to process or read as file-like
    # Since docx2txt expects a path or file-like object:
    text = docx2txt.process(docx_file)
    return clean_text(text)

def extract_text_from_txt(file_bytes: bytes) -> str:
    """Extracts text from TXT bytes."""
    try:
        return clean_text(file_bytes.decode('utf-8'))
    except UnicodeDecodeError:
        # Fallback to latin-1
        return clean_text(file_bytes.decode('latin-1'))

def parse_document(filename: str, file_bytes: bytes) -> Tuple[str, str]:
    """
    Detects file extension and extracts raw text.
    Returns: (raw_text, extension)
    """
    ext = filename.split('.')[-1].lower()
    
    if ext == 'pdf':
        text = extract_text_from_pdf(file_bytes)
    elif ext in ['docx', 'doc']:
        text = extract_text_from_docx(file_bytes)
    elif ext in ['txt', 'md']:
        text = extract_text_from_txt(file_bytes)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Only PDF, DOCX, and TXT are supported.")
        
    return text, ext
