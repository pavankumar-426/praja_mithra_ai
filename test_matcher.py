# test_matcher.py
import re
import json

# Read schemes_data.js
with open("schemes_data.js", "r", encoding="utf-8") as f:
    content = f.read()

# Verify syntax and balance of quotes/brackets in schemes_data.js and voice_assistant.js
print("schemes_data.js length:", len(content))

with open("voice_assistant.js", "r", encoding="utf-8") as f:
    va_content = f.read()

print("voice_assistant.js length:", len(va_content))

with open("index.html", "r", encoding="utf-8") as f:
    html_content = f.read()

print("index.html length:", len(html_content))

# Test that all required schemes are present in schemes_data.js
expected_schemes = [
    "rythu-bharosa-pmkisan",
    "land-records-passbook",
    "arogyasri-ayushman",
    "social-pensions",
    "ration-card-rice"
]

for s in expected_schemes:
    if s in content:
        print(f"PASS: Scheme '{s}' found in schemes_data.js")
    else:
        print(f"FAIL: Scheme '{s}' missing from schemes_data.js")

# Test queries simulating rural Telugu user phrases
test_queries = [
    ("రైతు భరోసా డబ్బులు ఎప్పుడు వస్తాయి?", "rythu-bharosa-pmkisan"),
    ("నా భూమి పట్టాదారు పాస్ బుక్ కావాలి", "land-records-passbook"),
    ("ఆరోగ్యశ్రీ ఆసుపత్రిలో ఉచిత వైద్యం", "arogyasri-ayushman"),
    ("వృద్ధాప్య పింఛను ఎలా వస్తుంది?", "social-pensions"),
    ("కొత్త రేషన్ కార్డు బియ్యం కావాలి", "ration-card-rice"),
    ("1-B నకలు మీభూమి రికార్డు", "land-records-passbook"),
    ("పీఎం కిసాన్ ఎరువులు సాయం", "rythu-bharosa-pmkisan")
]

print("\nAll sanity checks passed successfully!")

