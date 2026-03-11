import sys
import subprocess

try:
    import pypdf
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf", "--quiet"])
    import pypdf

reader = pypdf.PdfReader('c:/Users/Ravi Gautam/Desktop/gym/pdf file/Phase_4_Full_Gym_SaaS_Spec.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

with open('c:/Users/Ravi Gautam/Desktop/gym/phase4_spec.txt', 'w', encoding='utf-8') as f:
    f.write(text)

print("PDF extracted to phase4_spec.txt")
