#!/usr/bin/env bash

# Example cURL commands for testing POST /api/documents
# Adjust host/port and file paths as needed

# 1) Valid file upload (multipart/form-data)
curl -v \
  -X POST http://localhost:3000/api/documents \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/absolute/path/to/example.pdf"

# 2) Valid JSON text upload
curl -v \
  -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "text_content": "This is a test document.",
    "original_filename": "test.txt"
  }'

# 3) Missing file in multipart/form-data (should return 400)
curl -v \
  -X POST http://localhost:3000/api/documents \
  -H "Content-Type: multipart/form-data" \
  -F "file="

# 4) Invalid JSON payload (should return 400 with validation details)
curl -v \
  -X POST http://localhost:3000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "wrong_field": "oops"
  }'

# 5) Unsupported Content-Type (should return 415)
curl -v \
  -X POST http://localhost:3000/api/documents \
  -H "Content-Type: text/plain" \
  -d "just some raw text" 