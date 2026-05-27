import re

with open('translations.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add change_screenshot after add_screenshot in each language section
# French
content = content.replace(
    "add_screenshot: \"Ajouter une capture d'écran\",",
    "add_screenshot: \"Ajouter une capture d'écran\",\n        change_screenshot: \"Changer la capture d'écran\","
)

# Arabic
content = content.replace(
    "add_screenshot: \"إضافة لقطة شاشة\",",
    "add_screenshot: \"إضافة لقطة شاشة\",\n        change_screenshot: \"تغيير لقطة الشاشة\","
)

# English
content = content.replace(
    "add_screenshot: \"Add Screenshot\",",
    "add_screenshot: \"Add Screenshot\",\n        change_screenshot: \"Change Screenshot\","
)

with open('translations.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added change_screenshot key to all 3 languages")
