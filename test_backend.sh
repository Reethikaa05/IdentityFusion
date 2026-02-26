#!/bin/bash

# Configuration
URL="http://localhost:3000/identify"

echo "-----------------------------------------------"
echo "🚀 IDENTITY RECONCILIATION BACKEND TEST"
echo "-----------------------------------------------"

# Test 1: New Primary Record
echo -e "\n1. Creating a new Primary (lorraine@hillvalley.edu / 123456)"
curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{"email": "lorraine@hillvalley.edu", "phoneNumber": "123456"}' | jq .

# Test 2: Secondary Contact Creation
echo -e "\n2. Adding a secondary email (mcfly@hillvalley.edu) to the same phone (123456)"
curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{"email": "mcfly@hillvalley.edu", "phoneNumber": "123456"}' | jq .

# Test 3: Merging two Identities
echo -e "\n3. Creating a new independent primary (doc@brown.edu / 999999)"
curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{"email": "doc@brown.edu", "phoneNumber": "999999"}' | jq .

echo -e "\n4. Merging 'mcfly' and 'doc' by providing a link (mcfly@hillvalley.edu / 999999)"
curl -s -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{"email": "mcfly@hillvalley.edu", "phoneNumber": "999999"}' | jq .

echo -e "\n-----------------------------------------------"
echo "✅ Backend Test Complete"
