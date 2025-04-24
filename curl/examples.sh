#!/usr/bin/env bash
# Example cURL commands for testing POST /api/analyses
# Adjust host/port as needed

# 1) Valid analysis request
curl -v \
  -X POST http://localhost:3000/api/analyses \
  -H "Content-Type: application/json" \
  -d '{
    "text_content": "We collect your personal data for marketing purposes. You can contact us at example@example.com."
  }'

# 2) Invalid analysis request - empty text (should return 400)
curl -v \
  -X POST http://localhost:3000/api/analyses \
  -H "Content-Type: application/json" \
  -d '{
    "text_content": ""
  }'

# 3) Invalid analysis request - missing text_content (should return 400)
curl -v \
  -X POST http://localhost:3000/api/analyses \
  -H "Content-Type: application/json" \
  -d '{
    "wrong_field": "oops"
  }'

# 4) Valid analysis request with longer privacy policy text
curl -v \
  -X POST http://localhost:3000/api/analyses \
  -H "Content-Type: application/json" \
  -d '{
    "text_content": "PRIVACY POLICY\n\nWe collect your name, email and browsing history. We share this data with our marketing partners. We store your data indefinitely. You can contact us at privacy@example.com if you have questions."
  }' 